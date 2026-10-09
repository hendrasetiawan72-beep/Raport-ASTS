import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Table,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  downloadStudentTemplate,
  exportClassLegerToExcel,
  exportRankingToExcel,
  parseNisn,
  parseNis,
  isSummaryOrHeaderRow,
} from '../../utils/excel';
import { GradeRecord, Student } from '../../types';

export const ExcelImportExportView: React.FC = () => {
  const {
    schoolProfile,
    selectedClass,
    selectedClassId,
    classes,
    currentPeriod,
    selectedPeriodId,
    students,
    classStudents,
    subjects,
    grades,
    attendances,
    extracurriculars,
    batchAddOrUpdateStudents,
    updateStudent,
    batchSaveGrades,
    getClassRankings,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importType, setImportType] = useState<'students' | 'leger'>('students');
  const [duplicateMode, setDuplicateMode] = useState<'skip_duplicate' | 'update_duplicate'>('update_duplicate');

  // Preview state
  const [fileParsed, setFileParsed] = useState(false);
  const [parsedFileName, setParsedFileName] = useState('');
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[][]>([]);
  const [detectedFormat, setDetectedFormat] = useState<string>('');

  // Column mapping states for student import
  const [nameCol, setNameCol] = useState<number>(0);
  const [nisCol, setNisCol] = useState<number>(1);
  const [nisnCol, setNisnCol] = useState<number>(2);
  const [genderCol, setGenderCol] = useState<number>(3);
  const [parentCol, setParentCol] = useState<number>(4);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Prefer 'LEGER' sheet if available, else first sheet
        let sheetName = wb.SheetNames[0];
        const lowerNames = wb.SheetNames.map((s) => s.toLowerCase());
        const legerIdx = lowerNames.findIndex((s) => s.includes('leger') || s.includes('raport'));
        if (legerIdx !== -1) {
          sheetName = wb.SheetNames[legerIdx];
        }

        const ws = wb.Sheets[sheetName];
        const rawAoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rawAoa.length === 0) {
          showToast('error', 'File Excel kosong atau tidak terbaca.');
          return;
        }

        // Detect header row by scanning for "Nama" or "Formatif" or "NIS"
        let headerRowIdx = 0;
        for (let r = 0; r < Math.min(10, rawAoa.length); r++) {
          const rowText = rawAoa[r].map((c) => String(c).toLowerCase()).join(' ');
          if (rowText.includes('nama') || rowText.includes('formatif') || rowText.includes('nis')) {
            headerRowIdx = r;
            break;
          }
        }

        const headers = rawAoa[headerRowIdx].map((h, i) => String(h || `Kolom ${i + 1}`).trim());
        const dataRows = rawAoa.slice(headerRowIdx + 1).filter((r) => r.some((c) => c !== ''));

        setPreviewHeaders(headers);
        setPreviewRows(dataRows);
        setFileParsed(true);

        // Smart column mapping auto-detection
        headers.forEach((h, idx) => {
          const low = h.toLowerCase();
          if (low.includes('nama')) setNameCol(idx);
          else if (low === 'nis' || (low.includes('nis') && !low.includes('nisn'))) setNisCol(idx);
          else if (low.includes('nisn')) setNisnCol(idx);
          else if (low.includes('jk') || low.includes('kelamin') || low.includes('l/p')) setGenderCol(idx);
          else if (low.includes('wali') || low.includes('orang tua') || low.includes('ortu')) setParentCol(idx);
        });

        // Determine detected format
        const joined = headers.join(' ').toLowerCase();
        if (joined.includes('formatif') || joined.includes('sumatif') || sheetName.toLowerCase().includes('leger')) {
          setDetectedFormat('Format Dokumen Leger Nilai Multi-Kolom (Format Raport X-1)');
          setImportType('leger');
        } else {
          setDetectedFormat('Daftar Tabel Data Peserta Didik');
          setImportType('students');
        }

        showToast('success', `File ${file.name} berhasil dibaca (${dataRows.length} baris data).`);
      } catch (err: any) {
        showToast('error', `Gagal membaca Excel: ${err.message}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleCommitImport = () => {
    if (previewRows.length === 0) return;

    if (importType === 'students') {
      // Import students
      const newStudents: Omit<Student, 'id'>[] = [];

      previewRows.forEach((row, i) => {
        const studentName = String(row[nameCol] || '').trim();
        if (!studentName) return;

        const studentNis = String(row[nisCol] || (5000 + i + 1)).trim();
        const studentNisn = String(row[nisnCol] || '').trim();
        const studentGender = String(row[genderCol] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
        const studentParent = String(row[parentCol] || `Wali dari ${studentName}`).trim();

        newStudents.push({
          nis: studentNis,
          nisn: studentNisn,
          name: studentName.toUpperCase(),
          gender: studentGender as 'L' | 'P',
          birthPlace: 'Batang',
          birthDate: '2008-01-01',
          classId: selectedClassId,
          parentName: studentParent,
          status: 'Aktif',
        });
      });

      const res = batchAddOrUpdateStudents(newStudents, duplicateMode);
      showToast(
        'success',
        `Impor selesai: ${res.added} siswa ditambah, ${res.updated} diperbarui, ${res.skipped} dilewati.`
      );
      setFileParsed(false);
    } else {
      // Import Leger grades & students
      // Find students in the file and match or add to current class
      const newGrades: GradeRecord[] = [];
      const studentsToSync: Omit<Student, 'id'>[] = [];

      previewRows.forEach((row, rIdx) => {
        let studentName = String(row[nameCol] !== undefined ? row[nameCol] : (row[1] || '')).trim().toUpperCase();
        if (!studentName || isSummaryOrHeaderRow(studentName)) return;

        let rawNis = row[nisCol] !== undefined ? row[nisCol] : (row[2] || '');
        let rawNisn = row[nisnCol] !== undefined ? row[nisnCol] : (row[3] || '');

        let nisn = parseNisn(rawNisn);
        let nis = parseNis(rawNis);

        // Swap if rawNis was 10 digits and rawNisn was 4 digits
        if (nis && nisn && nis.length >= 9 && nisn.length < 9) {
          const temp = nis;
          nis = nisn;
          nisn = temp;
        }

        if (!nisn) {
          nisn = `008451${String(rIdx + 1).padStart(2, '0')}${rIdx % 10}`;
        }
        if (!nis) {
          nis = String(5420 + rIdx + 1);
        }

        // Check if student exists
        let targetStudent = students.find(
          (s) => s.nis === nis || s.name.toUpperCase() === studentName || (s.nisn && s.nisn === nisn)
        );

        if (!targetStudent) {
          studentsToSync.push({
            nis,
            nisn,
            name: studentName,
            gender: 'L',
            birthPlace: 'Batang',
            birthDate: '2008-01-01',
            classId: selectedClassId,
            parentName: `Wali dari ${studentName}`,
            status: 'Aktif',
          });
        } else {
          // Update both NISN and NIS if they differ
          const patch: Partial<Student> = {};
          if (nisn && targetStudent.nisn !== nisn) patch.nisn = nisn;
          if (nis && targetStudent.nis !== nis) patch.nis = nis;
          if (Object.keys(patch).length > 0) {
            updateStudent(targetStudent.id, patch);
          }
        }
      });

      if (studentsToSync.length > 0) {
        batchAddOrUpdateStudents(studentsToSync, 'skip_duplicate');
      }

      // Read grades for subjects across columns
      // Each subject in the authentic sheet has 3 columns: Formatif, Sumatif, Capaian
      // Column index starting at F (col 5 or 6)
      subjects.filter((s) => s.isActive).forEach((sub, sIdx) => {
        const baseCol = 5 + sIdx * 3;
        previewRows.forEach((row) => {
          const studentName = String(row[1] || '').trim().toUpperCase();
          const targetStudent = students.find((s) => s.name.toUpperCase() === studentName);
          if (!targetStudent) return;

          const formVal = row[baseCol];
          const sumVal = row[baseCol + 1];
          const descVal = row[baseCol + 2];

          const formNum =
            formVal !== '' && !isNaN(parseFloat(formVal)) ? parseFloat(formVal) : null;
          const sumNum =
            sumVal !== '' && !isNaN(parseFloat(sumVal)) ? parseFloat(sumVal) : null;

          newGrades.push({
            id: `${targetStudent.id}_${sub.id}_${selectedPeriodId}`,
            studentId: targetStudent.id,
            subjectId: sub.id,
            periodId: selectedPeriodId,
            formativeScore: formNum,
            summativeScore: sumNum,
            competencyDesc: descVal ? String(descVal) : sub.defaultCompetencyDesc || '',
            updatedAt: new Date().toISOString(),
          });
        });
      });

      if (newGrades.length > 0) {
        batchSaveGrades(newGrades);
        showToast('success', `${newGrades.length} record nilai dari file Excel berhasil dimasukkan ke sistem.`);
      } else {
        showToast('info', 'File leger berhasil dibaca dan data siswa telah diverifikasi.');
      }

      setFileParsed(false);
    }
  };

  const handleExportLeger = () => {
    if (!selectedClass || !currentPeriod) return;
    const rankings = getClassRankings(selectedClassId, selectedPeriodId);
    exportClassLegerToExcel(
      schoolProfile.name,
      selectedClass,
      currentPeriod,
      classStudents,
      subjects,
      grades,
      rankings,
      attendances,
      extracurriculars
    );
  };

  const handleExportRankings = () => {
    if (!selectedClass || !currentPeriod) return;
    const rankings = getClassRankings(selectedClassId, selectedPeriodId);
    exportRankingToExcel(
      schoolProfile.name,
      selectedClass.name,
      currentPeriod,
      rankings
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          <span>12. Integrasi Impor & Ekspor Excel</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Dukungan penuh membaca dan membuat berkas Microsoft Excel (.xlsx) dengan SheetJS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Unggah & Impor File Excel</span>
            </h2>
            <button
              onClick={downloadStudentTemplate}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-800">
              Pilih atau Tarik Berkas Excel ke Sini
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Mendukung file .xlsx, .xls, atau file Leger Kurikulum Merdeka (FORMAT_RAPORT__X-1.xlsx)
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Sasaran Kelas Impor
              </label>
              <div className="font-semibold text-blue-950 bg-slate-100 p-2 rounded-lg">
                {selectedClass?.name} — {selectedClass?.major}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Penanganan Duplikasi (NIS / NISN Sama)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dupMode"
                    value="update_duplicate"
                    checked={duplicateMode === 'update_duplicate'}
                    onChange={() => setDuplicateMode('update_duplicate')}
                    className="text-blue-600"
                  />
                  <span>Perbarui data lama</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dupMode"
                    value="skip_duplicate"
                    checked={duplicateMode === 'skip_duplicate'}
                    onChange={() => setDuplicateMode('skip_duplicate')}
                    className="text-blue-600"
                  />
                  <span>Lewati jika sudah ada</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <span>Ekspor Dokumen Excel (.xlsx)</span>
            </h2>
          </div>

          <div className="space-y-3">
            {/* Export Leger */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">
                  Unduh Leger Nilai Kelas {selectedClass?.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Berisi header bertingkat, nilai formatif, sumatif, capaian, dan peringkat.
                </div>
              </div>
              <button
                onClick={handleExportLeger}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Unduh Leger
              </button>
            </div>

            {/* Export Ranking */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">
                  Unduh Rekapitulasi Peringkat Kelas
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Rekap nomor urut peringkat, NIS, nama siswa, dan rata-rata.
                </div>
              </div>
              <button
                onClick={handleExportRankings}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Unduh Peringkat
              </button>
            </div>

            {/* Student Template */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">
                  Format Baku Template Excel Siswa
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Template kosong dengan baris contoh data untuk pengisian awal siswa.
                </div>
              </div>
              <button
                onClick={downloadStudentTemplate}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Unduh Format
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section if file is loaded */}
      {fileParsed && (
        <div className="bg-white p-6 rounded-2xl border border-blue-300 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Pratinjau Berkas: {parsedFileName}
                </h3>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Format Terdeteksi: <b className="text-blue-900">{detectedFormat}</b> • {previewRows.length} baris data
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFileParsed(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batalkan
              </button>
              <button
                onClick={handleCommitImport}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Data ke Aplikasi</span>
              </button>
            </div>
          </div>

          {/* Column mapping controls if student mode */}
          {importType === 'students' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-800 mb-2">
                Sesuaikan Pemetaan Kolom Excel ke Kolom Aplikasi:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Kolom Nama</label>
                  <select
                    value={nameCol}
                    onChange={(e) => setNameCol(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold"
                  >
                    {previewHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Kolom NIS</label>
                  <select
                    value={nisCol}
                    onChange={(e) => setNisCol(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold"
                  >
                    {previewHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Kolom NISN</label>
                  <select
                    value={nisnCol}
                    onChange={(e) => setNisnCol(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold"
                  >
                    {previewHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Jenis Kelamin</label>
                  <select
                    value={genderCol}
                    onChange={(e) => setGenderCol(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold"
                  >
                    {previewHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Nama Orang Tua</label>
                  <select
                    value={parentCol}
                    onChange={(e) => setParentCol(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold"
                  >
                    {previewHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Table Preview */}
          <div className="overflow-x-auto max-h-64 custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold sticky top-0 text-slate-700">
                <tr>
                  <th className="p-2 border-r border-slate-200 w-10 text-center">#</th>
                  {previewHeaders.slice(0, 10).map((h, i) => (
                    <th key={i} className="p-2 border-r border-slate-200 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  {previewHeaders.length > 10 && <th className="p-2">...</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.slice(0, 8).map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-mono text-slate-400 border-r border-slate-200">
                      {rIdx + 1}
                    </td>
                    {r.slice(0, 10).map((c: any, cIdx: number) => (
                      <td key={cIdx} className="p-2 border-r border-slate-200 whitespace-nowrap">
                        {String(c)}
                      </td>
                    ))}
                    {r.length > 10 && <td className="p-2 text-slate-400">...</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
