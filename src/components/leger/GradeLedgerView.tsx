import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TableProperties,
  Printer,
  FileSpreadsheet,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Eye,
  Upload,
  FileCheck,
  Calendar,
  UserCheck,
  Edit2,
  Check,
  X,
  Layers,
  Database,
} from 'lucide-react';
import { exportClassLegerToExcel, parseLegerExcel, downloadLegerTemplate } from '../../utils/excel';
import { GradeRecord, AttendanceRecord, ExtracurricularRecord } from '../../types';

export const GradeLedgerView: React.FC = () => {
  const {
    schoolProfile,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    classes,
    selectedClassId,
    setSelectedClassId,
    subjects,
    grades,
    attendances,
    getAttendance,
    updateAttendance,
    extracurriculars,
    getStudentExtracurriculars,
    students,
    classStudents,
    selectedClass,
    currentPeriod,
    getClassRankings,
    rankingMethod,
    setRankingMethod,
    includeIncompleteInRanking,
    setIncludeIncompleteInRanking,
    rankingScoreBasis,
    setRankingScoreBasis,
    setActiveMenu,
    setSelectedStudentIdForReport,
    replaceClassDataFromLegerExcel,
    forceSaveToDatabase,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'average' | 'rank'>('default');
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<string | null>(null);

  // Integrated Upload Modal & Preview state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');

  // Quick Inline Edit Modal for Attendance
  const [editingAttendanceStudent, setEditingAttendanceStudent] = useState<{
    studentId: string;
    studentName: string;
    sick: number;
    permitted: number;
    unexcused: number;
  } | null>(null);

  const legerFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const activeSubjects = subjects.filter((s) => s.isActive);

  // Compute rankings
  const rankings = useMemo(() => {
    return getClassRankings(selectedClassId, selectedPeriodId);
  }, [selectedClassId, selectedPeriodId, grades, rankingMethod, includeIncompleteInRanking, rankingScoreBasis]);

  const rankMap = useMemo(() => {
    const map = new Map<string, typeof rankings[0]>();
    rankings.forEach((r) => map.set(r.studentId, r));
    return map;
  }, [rankings]);

  // Filter & sort students
  const displayedStudents = useMemo(() => {
    let list = classStudents.filter((st) => {
      const matchSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.nis.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (showOnlyIncomplete) {
        const sum = rankMap.get(st.id);
        return sum && !sum.isComplete;
      }
      return true;
    });

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'average') {
      list.sort((a, b) => {
        const avgA = rankMap.get(a.id)?.averageScore || 0;
        const avgB = rankMap.get(b.id)?.averageScore || 0;
        return avgB - avgA;
      });
    } else if (sortBy === 'rank') {
      list.sort((a, b) => {
        const rankA = rankMap.get(a.id)?.rank || 9999;
        const rankB = rankMap.get(b.id)?.rank || 9999;
        return (rankA === 0 ? 9999 : rankA) - (rankB === 0 ? 9999 : rankB);
      });
    }

    return list;
  }, [classStudents, searchQuery, showOnlyIncomplete, sortBy, rankMap]);

  const handleExportExcel = () => {
    if (!selectedClass || !currentPeriod) return;
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTemplate = () => {
    if (!selectedClass || !currentPeriod) return;
    downloadLegerTemplate(
      schoolProfile.name,
      selectedClass,
      currentPeriod,
      subjects
    );
    showToast('success', 'Template Leger Excel resmi berhasil diunduh.');
  };

  const handleFileSelectForParsing = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewFileName(file.name);
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const result = parseLegerExcel(
          buffer,
          selectedClassId,
          selectedPeriodId,
          subjects
        );

        if (!result.success || result.studentCount === 0) {
          showToast('error', result.message || 'Gagal memproses file Excel Leger.');
          setIsParsing(false);
          return;
        }

        setParsedPreview(result);
        setIsUploadModalOpen(true);
      } catch (err: any) {
        showToast('error', `Gagal membaca file: ${err.message}`);
      } finally {
        setIsParsing(false);
        if (legerFileInputRef.current) legerFileInputRef.current.value = '';
        if (modalFileInputRef.current) modalFileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleApplyParsedLeger = async () => {
    if (!parsedPreview) return;

    try {
      const syncRes = replaceClassDataFromLegerExcel(
        selectedClassId,
        selectedPeriodId,
        parsedPreview.studentsToUpsert,
        parsedPreview.gradesToUpsert,
        parsedPreview.attendancesToUpsert,
        parsedPreview.extracurricularsToUpsert,
        parsedPreview.detectedWaliKelas,
        parsedPreview.detectedReportDate
      );

      await forceSaveToDatabase();

      const msg = `Sinkronisasi Selesai! Berhasil memperbarui kelas ${selectedClass?.name}: ${syncRes.studentCount} siswa, ${syncRes.gradeCount} nilai, ${parsedPreview.attendancesToUpsert.length} data ketidakhadiran, dan ${parsedPreview.extracurricularsToUpsert.length} data ekstra. Semua tersinkron langsung ke lembar Raport PTS!`;
      setUploadSuccessInfo(msg);
      showToast('success', msg);
      setIsUploadModalOpen(false);
      setParsedPreview(null);
    } catch (err: any) {
      showToast('error', `Kesalahan saat menerapkan data: ${err.message}`);
    }
  };

  const handleSaveAttendanceQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendanceStudent) return;

    updateAttendance(editingAttendanceStudent.studentId, selectedPeriodId, {
      sick: Number(editingAttendanceStudent.sick) || 0,
      permitted: Number(editingAttendanceStudent.permitted) || 0,
      unexcused: Number(editingAttendanceStudent.unexcused) || 0,
    });

    showToast('success', `Data ketidakhadiran ${editingAttendanceStudent.studentName} diperbarui.`);
    setEditingAttendanceStudent(null);
  };

  const openStudentReport = (studentId: string) => {
    setSelectedStudentIdForReport(studentId);
    setActiveMenu('raport');
  };

  return (
    <div className="space-y-6 max-w-[100vw] text-[#3D332A]">
      {/* Top Header Card */}
      <div className="no-print p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD6C9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E5E]">
            <TableProperties className="w-4 h-4 text-[#5A7365]" />
            <span>9. Rekapitulasi Leger Nilai & Presensi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] mt-1 font-serif">
            Leger Nilai, Ketidakhadiran & Ekstrakurikuler
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E5E] mt-1">
            Data nilai formatif, sumatif, capaian kompetensi, ketidakhadiran (S/I/A), dan kegiatan ekstrakurikuler terintegrasi dengan Rapor PTS.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Leger Template */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F2ECE1] text-[#3E342B] font-semibold rounded-xl text-xs sm:text-sm border border-[#DDD6C9] transition-all shadow-2xs"
            title="Unduh format template Excel resmi untuk leger nilai"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#5A7365]" />
            <span>Unduh Template Leger</span>
          </button>

          {/* Upload Leger Excel Button (Jalur Upload Terintegrasi) */}
          <input
            ref={legerFileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileSelectForParsing}
            className="hidden"
          />
          <button
            onClick={() => legerFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            title="Unggah Excel Leger: Jalur terintegrasi nilai, ketidakhadiran, ekstra, dan wali kelas"
          >
            <Upload className="w-4 h-4" />
            <span>Jalur Upload Leger Terintegrasi</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#42594D] hover:bg-[#34463C] text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor ke Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F2ECE1] text-[#2C241E] font-bold rounded-xl text-xs sm:text-sm border border-[#DDD6C9] transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#7A6E5E]" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Upload Success Alert */}
      {uploadSuccessInfo && (
        <div className="no-print p-4 rounded-2xl bg-[#EDF3EF] border border-[#BFD4C6] flex items-start justify-between gap-3 text-xs sm:text-sm text-[#274433]">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#436A52] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Sinkronisasi Jalur Upload Berhasil!</div>
              <div className="text-xs text-[#3E5C49] mt-0.5 leading-relaxed">
                {uploadSuccessInfo}
              </div>
            </div>
          </div>
          <button
            onClick={() => setUploadSuccessInfo(null)}
            className="p-1 hover:bg-[#D9E6DD] rounded text-[#436A52]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="no-print flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#DDD6C9] shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8C8071] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau NIS..."
            className="w-full pl-9 pr-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7E9685] text-[#2C241E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap text-xs">
          <label className="flex items-center gap-2 cursor-pointer bg-[#F7F4EE] px-3 py-2 rounded-xl border border-[#DFD8CC]">
            <input
              type="checkbox"
              checked={showOnlyIncomplete}
              onChange={(e) => setShowOnlyIncomplete(e.target.checked)}
              className="w-3.5 h-3.5 text-[#5A7365] rounded-sm accent-[#5A7365]"
            />
            <span className="font-medium text-[#4A4036]">Nilai Belum Lengkap</span>
          </label>

          <div className="flex items-center gap-1.5 bg-[#F7F4EE] px-3 py-1.5 rounded-xl border border-[#DFD8CC]">
            <span className="text-[#7A6E5E] font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-[#2C241E] outline-none cursor-pointer"
            >
              <option value="default">Sesuai Presensi</option>
              <option value="name">Nama (A-Z)</option>
              <option value="average">Nilai Tertinggi</option>
              <option value="rank">Peringkat Kelas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Printable Leger Document */}
      <div className="printable-document bg-white rounded-3xl border border-[#DDD6C9] shadow-2xs overflow-hidden">
        {/* Printable Formal Header */}
        <div className="p-5 border-b border-[#DDD6C9] bg-[#FAF8F5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={schoolProfile.logoUrl}
                alt="Logo"
                className="w-12 h-12 object-contain shrink-0"
              />
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#2C241E] tracking-tight font-serif">
                  LEGER NILAI HASIL BELAJAR PESERTA DIDIK
                </h2>
                <div className="text-xs text-[#6B6053] font-medium">
                  {schoolProfile.name} • {schoolProfile.address}
                </div>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-bold text-[#2C241E]">
                Kelas: <span className="text-[#3B5446] font-extrabold">{selectedClass?.name}</span> (Fase {selectedClass?.fase})
              </div>
              <div className="text-[#6B6053]">
                Tahun Pelajaran: {currentPeriod?.academicYear} | Semester {currentPeriod?.semester}
              </div>
              <div className="text-[#7A6E5E] text-[11px] font-semibold">
                Wali Kelas: {selectedClass?.homeroomTeacher || schoolProfile.homeroomTeacherName || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Level Hierarchical Ledger Table */}
        <div className="overflow-x-auto max-h-[72vh] custom-scrollbar border-t border-[#DDD6C9]">
          <table className="w-full text-xs report-table border-collapse border border-[#DDD6C9]">
            {/* Header Row 1: Groups */}
            <thead className="bg-[#F5F2EB] text-[#2C241E] sticky top-0 z-20 shadow-xs font-semibold">
              <tr className="border-b border-[#DDD6C9]">
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 w-10 text-center border-r border-[#DDD6C9] bg-[#EFECE5] sticky left-0 z-30 font-bold"
                >
                  NO
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 min-w-[210px] text-left border-r border-[#DDD6C9] bg-[#EFECE5] sticky left-10 z-30 font-bold"
                >
                  Nama Peserta Didik
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 min-w-[70px] text-center border-r border-[#DDD6C9] bg-[#EFECE5] font-mono font-bold"
                >
                  NIS
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 min-w-[80px] text-center border-r border-[#DDD6C9] bg-[#EFECE5] font-mono font-bold"
                >
                  NISN
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 min-w-[65px] text-center border-r border-[#DDD6C9] bg-[#EFECE5]"
                >
                  Kelas
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 min-w-[50px] text-center border-r border-[#DDD6C9] bg-[#EFECE5]"
                >
                  Fase
                </th>

                {/* Subject Group Headers (3 sub-columns per subject) */}
                {activeSubjects.map((sub) => (
                  <th
                    key={sub.id}
                    colSpan={3}
                    className="py-2 px-2 text-center border-r border-[#DDD6C9] bg-[#EDE9DF] text-[#2C241E] font-bold max-w-[260px] truncate"
                    title={sub.name}
                  >
                    {sub.name}
                  </th>
                ))}

                {/* Summary Group Header */}
                <th
                  colSpan={4}
                  className="py-2 px-3 text-center border-r border-[#DDD6C9] bg-[#5A7365] text-white font-bold"
                >
                  RINGKASAN & PERINGKAT
                </th>

                {/* KETIDAKHADIRAN Group Header (Integrated Column) */}
                <th
                  colSpan={3}
                  className="py-2 px-3 text-center border-r border-[#DDD6C9] bg-[#435B4E] text-white font-bold"
                >
                  KETIDAKHADIRAN (HARI)
                </th>

                {/* EKSTRAKURIKULER Group Header (Integrated Column) */}
                <th
                  colSpan={3}
                  className="py-2 px-3 text-center border-r border-[#DDD6C9] bg-[#C07865] text-white font-bold"
                >
                  EKSTRAKURIKULER
                </th>

                {/* Action & Report Column */}
                <th
                  rowSpan={2}
                  className="no-print py-2 px-3 text-center bg-[#EFECE5] text-[#2C241E] font-bold min-w-[90px]"
                >
                  Aksi
                </th>
              </tr>

              {/* Header Row 2: Sub-headers */}
              <tr className="border-b-2 border-[#DDD6C9] bg-[#FAF8F5] text-[11px] text-[#5A5043]">
                {activeSubjects.map((sub) => (
                  <React.Fragment key={`sub-col-${sub.id}`}>
                    <th className="py-1 px-1.5 w-14 text-center border-r border-[#DDD6C9] font-medium">
                      Formatif
                    </th>
                    <th className="py-1 px-1.5 w-14 text-center border-r border-[#DDD6C9] font-bold text-[#2C241E] bg-[#E8EFEA]/40">
                      Sumatif
                    </th>
                    <th className="py-1 px-2 min-w-[160px] text-left border-r border-[#DDD6C9] font-normal">
                      Capaian
                    </th>
                  </React.Fragment>
                ))}

                <th className="py-1 px-2 min-w-[65px] text-center border-r border-[#DDD6C9] bg-[#4E6659] text-white font-bold">
                  Rata-rata
                </th>
                <th className="py-1 px-2 min-w-[50px] text-center border-r border-[#DDD6C9] bg-[#4E6659] text-white font-medium">
                  Terisi
                </th>
                <th className="py-1 px-2 min-w-[50px] text-center border-r border-[#DDD6C9] bg-[#4E6659] text-white font-medium">
                  Kosong
                </th>
                <th className="py-1 px-2 min-w-[65px] text-center border-r border-[#DDD6C9] bg-[#D49887] text-white font-black">
                  Rank
                </th>

                {/* Ketidakhadiran subheaders */}
                <th className="py-1 px-2 min-w-[55px] text-center border-r border-[#DDD6C9] font-bold bg-[#E8EFEA] text-[#2C3B32]">
                  Sakit
                </th>
                <th className="py-1 px-2 min-w-[55px] text-center border-r border-[#DDD6C9] font-bold bg-[#E8EFEA] text-[#2C3B32]">
                  Ijin
                </th>
                <th className="py-1 px-2 min-w-[55px] text-center border-r border-[#DDD6C9] font-bold bg-[#F7EDE9] text-[#8C3D2B]">
                  Alpa
                </th>

                {/* Ekstrakurikuler subheaders */}
                <th className="py-1 px-2 min-w-[110px] text-center border-r border-[#DDD6C9] font-semibold bg-[#FAF4ED] text-[#4A3D30]">
                  Ekstra 1
                </th>
                <th className="py-1 px-2 min-w-[110px] text-center border-r border-[#DDD6C9] font-semibold bg-[#FAF4ED] text-[#4A3D30]">
                  Ekstra 2
                </th>
                <th className="py-1 px-2 min-w-[110px] text-center border-r border-[#DDD6C9] font-semibold bg-[#FAF4ED] text-[#4A3D30]">
                  Ekstra 3
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#EAE4D9]">
              {displayedStudents.map((st, idx) => {
                const summary = rankMap.get(st.id);
                const att = getAttendance(st.id, selectedPeriodId);
                const extras = getStudentExtracurriculars(st.id, selectedPeriodId);
                const isOdd = idx % 2 === 1;

                return (
                  <tr
                    key={st.id}
                    className={`hover:bg-[#F4F0E8] transition-colors ${
                      isOdd ? 'bg-[#FCFAF7]' : 'bg-white'
                    }`}
                  >
                    {/* Sticky Student Index */}
                    <td className="py-2 px-2 text-center font-mono text-[#7A6E5E] border-r border-[#DDD6C9] sticky left-0 z-10 bg-inherit font-semibold">
                      {idx + 1}
                    </td>

                    {/* Sticky Student Name with quick action */}
                    <td className="py-2 px-3 border-r border-[#DDD6C9] sticky left-10 z-10 bg-inherit font-bold text-[#2C241E] whitespace-nowrap">
                      <div className="flex items-center justify-between gap-2 group">
                        <span className="truncate">{st.name}</span>
                        <button
                          onClick={() => openStudentReport(st.id)}
                          className="no-print opacity-0 group-hover:opacity-100 p-1 text-[#5A7365] hover:bg-[#E8EFEA] rounded-md transition-all shrink-0"
                          title="Lihat Rapor PTS Siswa Ini"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2 px-2 text-center font-mono text-[#4A4036] border-r border-[#DDD6C9]">
                      {st.nis}
                    </td>

                    <td className="py-2 px-2 text-center font-mono text-[#7A6E5E] border-r border-[#DDD6C9]">
                      {st.nisn || '—'}
                    </td>

                    <td className="py-2 px-2 text-center text-[#4A4036] border-r border-[#DDD6C9]">
                      {selectedClass?.name}
                    </td>

                    <td className="py-2 px-2 text-center text-[#4A4036] border-r border-[#DDD6C9] font-semibold">
                      {selectedClass?.fase}
                    </td>

                    {/* Subject columns */}
                    {activeSubjects.map((sub) => {
                      const g = grades.find(
                        (grade) =>
                          grade.studentId === st.id &&
                          grade.subjectId === sub.id &&
                          grade.periodId === selectedPeriodId
                      );

                      const hasFormative = g && typeof g.formativeScore === 'number';
                      const hasSummative = g && typeof g.summativeScore === 'number';

                      return (
                        <React.Fragment key={`grade-${st.id}-${sub.id}`}>
                          <td className="py-1 px-1.5 text-center font-mono border-r border-[#DDD6C9] text-[#5A5043]">
                            {hasFormative ? g!.formativeScore : '—'}
                          </td>

                          <td
                            className={`py-1 px-1.5 text-center font-mono font-bold border-r border-[#DDD6C9] ${
                              hasSummative
                                ? 'text-[#2C3B32] bg-[#E8EFEA]/30'
                                : 'text-[#A65B48] bg-[#F7ECE8]/30'
                            }`}
                          >
                            {hasSummative ? g!.summativeScore : '—'}
                          </td>

                          <td className="py-1 px-2 border-r border-[#DDD6C9] text-[11px] text-[#5A5043] leading-tight">
                            <span className="line-clamp-2" title={g?.competencyDesc || ''}>
                              {g?.competencyDesc || '—'}
                            </span>
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Summary Columns */}
                    <td className="py-2 px-2 text-center font-mono font-black text-[#2C3B32] border-r border-[#DDD6C9] bg-[#E8EFEA]/60 text-xs">
                      {summary ? summary.averageScore.toFixed(2) : '—'}
                    </td>

                    <td className="py-2 px-1 text-center font-mono text-[#5A5043] border-r border-[#DDD6C9] text-xs">
                      {summary ? summary.gradedCount : 0}
                    </td>

                    <td
                      className={`py-2 px-1 text-center font-mono text-xs border-r border-[#DDD6C9] ${
                        summary && summary.missingCount > 0
                          ? 'text-[#A65B48] font-bold bg-[#F7ECE8]/50'
                          : 'text-[#8C8071]'
                      }`}
                    >
                      {summary ? summary.missingCount : 0}
                    </td>

                    {/* Rank */}
                    <td className="py-2 px-2 text-center font-mono font-black border-r border-[#DDD6C9] bg-[#F4E8D7] text-[#5A3E20] text-xs">
                      {summary && summary.rank > 0 ? (
                        <span className="inline-flex items-center justify-center font-extrabold">
                          #{summary.rank}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8C8071] font-normal">
                          —
                        </span>
                      )}
                    </td>

                    {/* Ketidakhadiran (Sakit, Ijin, Alpa) with quick edit button */}
                    <td
                      onClick={() =>
                        setEditingAttendanceStudent({
                          studentId: st.id,
                          studentName: st.name,
                          sick: att.sick,
                          permitted: att.permitted,
                          unexcused: att.unexcused,
                        })
                      }
                      className="py-1 px-2 text-center font-mono border-r border-[#DDD6C9] text-[#2C3B32] cursor-pointer hover:bg-[#DCE7DF] transition-colors"
                      title="Klik untuk ubah data kehadiran"
                    >
                      <span className="font-semibold">{att.sick}</span>
                    </td>

                    <td
                      onClick={() =>
                        setEditingAttendanceStudent({
                          studentId: st.id,
                          studentName: st.name,
                          sick: att.sick,
                          permitted: att.permitted,
                          unexcused: att.unexcused,
                        })
                      }
                      className="py-1 px-2 text-center font-mono border-r border-[#DDD6C9] text-[#2C3B32] cursor-pointer hover:bg-[#DCE7DF] transition-colors"
                      title="Klik untuk ubah data kehadiran"
                    >
                      <span className="font-semibold">{att.permitted}</span>
                    </td>

                    <td
                      onClick={() =>
                        setEditingAttendanceStudent({
                          studentId: st.id,
                          studentName: st.name,
                          sick: att.sick,
                          permitted: att.permitted,
                          unexcused: att.unexcused,
                        })
                      }
                      className="py-1 px-2 text-center font-mono border-r border-[#DDD6C9] text-[#8C3D2B] cursor-pointer hover:bg-[#F2DBD6] transition-colors"
                      title="Klik untuk ubah data kehadiran"
                    >
                      <span className="font-bold">{att.unexcused}</span>
                    </td>

                    {/* Ekstrakurikuler 1, 2, 3 */}
                    <td className="py-1 px-2 text-left border-r border-[#DDD6C9] text-[11px] text-[#4A3D30]">
                      {extras[0] ? (
                        <span className="truncate block" title={`${extras[0].name} (${extras[0].predicate})`}>
                          <b>{extras[0].name}</b> ({extras[0].predicate})
                        </span>
                      ) : (
                        <span className="text-[#8C8071]">—</span>
                      )}
                    </td>

                    <td className="py-1 px-2 text-left border-r border-[#DDD6C9] text-[11px] text-[#4A3D30]">
                      {extras[1] ? (
                        <span className="truncate block" title={`${extras[1].name} (${extras[1].predicate})`}>
                          <b>{extras[1].name}</b> ({extras[1].predicate})
                        </span>
                      ) : (
                        <span className="text-[#8C8071]">—</span>
                      )}
                    </td>

                    <td className="py-1 px-2 text-left border-r border-[#DDD6C9] text-[11px] text-[#4A3D30]">
                      {extras[2] ? (
                        <span className="truncate block" title={`${extras[2].name} (${extras[2].predicate})`}>
                          <b>{extras[2].name}</b> ({extras[2].predicate})
                        </span>
                      ) : (
                        <span className="text-[#8C8071]">—</span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="no-print py-1 px-2 text-center">
                      <button
                        onClick={() => openStudentReport(st.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8EFEA] hover:bg-[#D5E3D8] text-[#2C3B32] text-[11px] font-bold rounded-lg transition-colors shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-[#5A7365]" />
                        <span>Rapor</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info and signoff */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#DDD6C9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6053]">
          <div>
            Total Peserta Didik: <b>{classStudents.length} Siswa</b> | Mata Pelajaran Aktif: <b>{activeSubjects.length} Mapel</b>
          </div>

          <div className="text-right">
            <span>{schoolProfile.city}, {schoolProfile.reportDate || '8 Oktober 2026'} • Wali Kelas: </span>
            <span className="font-bold text-[#2C241E]">
              {selectedClass?.homeroomTeacher || schoolProfile.homeroomTeacherName}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL 1: JALUR UPLOAD LEGER TERINTEGRASI PREVIEW */}
      {isUploadModalOpen && parsedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DDD6C9] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#3E342B]">
            <div className="px-6 py-4 bg-[#F2EDE4] border-b border-[#DDD6C9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5A7365] text-white flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2C241E]">
                    Konfirmasi Jalur Upload Leger Terintegrasi
                  </h3>
                  <p className="text-xs text-[#7A6E5E]">File: {previewFileName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded text-[#7A6E5E] hover:text-[#2C241E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-white rounded-2xl border border-[#DDD6C9] space-y-3">
                <div className="font-bold text-[#2C241E] text-xs uppercase tracking-wider">
                  Ringkasan Data yang Ditemukan
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                    <div className="text-xl font-black text-[#5A7365]">{parsedPreview.studentCount}</div>
                    <div className="text-[11px] font-semibold text-[#7A6E5E]">Siswa</div>
                  </div>
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                    <div className="text-xl font-black text-[#5A7365]">{parsedPreview.gradeCount}</div>
                    <div className="text-[11px] font-semibold text-[#7A6E5E]">Nilai Mapel</div>
                  </div>
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                    <div className="text-xl font-black text-[#5A7365]">{parsedPreview.attendanceCount}</div>
                    <div className="text-[11px] font-semibold text-[#7A6E5E]">Kehadiran (S/I/A)</div>
                  </div>
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                    <div className="text-xl font-black text-[#5A7365]">{parsedPreview.extracurricularCount}</div>
                    <div className="text-[11px] font-semibold text-[#7A6E5E]">Ekstrakurikuler</div>
                  </div>
                </div>

                {parsedPreview.detectedWaliKelas && (
                  <div className="p-2.5 bg-[#EDF3EF] rounded-xl border border-[#BFD4C6] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#3B5446]">Wali Kelas Terdeteksi:</span>
                    <span className="font-bold text-[#2C3B32]">{parsedPreview.detectedWaliKelas}</span>
                  </div>
                )}

                {parsedPreview.detectedReportDate && (
                  <div className="p-2.5 bg-[#EDF3EF] rounded-xl border border-[#BFD4C6] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#3B5446]">Tanggal Raport Terdeteksi:</span>
                    <span className="font-bold text-[#2C3B32]">{parsedPreview.detectedReportDate}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-[#FFF9F2] rounded-2xl border border-[#F0DDC5] text-xs text-[#7A5023] space-y-1">
                <div className="font-bold">⚠️ Perhatian Sinkronisasi Total:</div>
                <p>
                  Mengunggah file ini akan memperbarui data nilai, kehadiran, dan ekstrakurikuler siswa kelas{' '}
                  <b>{selectedClass?.name}</b> secara langsung dan menyimpannya ke database aman. Lembar cetak Rapor PTS akan langsung sinkron.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F2EDE4] border-t border-[#DDD6C9] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6B6053] hover:text-[#2C241E] rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyParsedLeger}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan & Sinkronkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INLINE ATTENDANCE QUICK EDIT */}
      {editingAttendanceStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DDD6C9] rounded-3xl shadow-xl max-w-sm w-full p-6 text-[#3E342B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#2C241E]">
                  Ubah Presensi / Ketidakhadiran
                </h3>
                <div className="text-xs text-[#7A6E5E] truncate max-w-[240px]">
                  {editingAttendanceStudent.studentName}
                </div>
              </div>
              <button
                onClick={() => setEditingAttendanceStudent(null)}
                className="p-1 rounded text-[#7A6E5E] hover:text-[#2C241E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceQuickEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#4A4036] mb-1">
                  Sakit (Hari)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingAttendanceStudent.sick}
                  onChange={(e) =>
                    setEditingAttendanceStudent({
                      ...editingAttendanceStudent,
                      sick: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl font-bold text-[#2C241E] outline-none focus:ring-2 focus:ring-[#7E9685]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4036] mb-1">
                  Ijin / Izin (Hari)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingAttendanceStudent.permitted}
                  onChange={(e) =>
                    setEditingAttendanceStudent({
                      ...editingAttendanceStudent,
                      permitted: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl font-bold text-[#2C241E] outline-none focus:ring-2 focus:ring-[#7E9685]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4036] mb-1">
                  Tanpa Keterangan / Alpa (Hari)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingAttendanceStudent.unexcused}
                  onChange={(e) =>
                    setEditingAttendanceStudent({
                      ...editingAttendanceStudent,
                      unexcused: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl font-bold text-[#8C3D2B] outline-none focus:ring-2 focus:ring-[#7E9685]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE4D9]">
                <button
                  type="button"
                  onClick={() => setEditingAttendanceStudent(null)}
                  className="px-3 py-1.5 text-xs text-[#6B6053] hover:text-[#2C241E]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
