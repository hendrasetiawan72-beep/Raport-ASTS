import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Edit3,
  Save,
  CheckCircle,
  AlertCircle,
  Copy,
  Wand2,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { GradeRecord } from '../../types';

export const GradeEntryView: React.FC = () => {
  const {
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    classes,
    selectedClassId,
    setSelectedClassId,
    subjects,
    classStudents,
    selectedClass,
    currentPeriod,
    saveGrade,
    batchSaveGrades,
    getStudentGrade,
    showToast,
  } = useApp();

  const activeSubjects = subjects.filter((s) => s.isActive);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return activeSubjects[0]?.id || '';
  });

  // Local table state for fast fluid keyboard editing without input lag
  const [localGrades, setLocalGrades] = useState<
    Record<
      string,
      { formative: string; summative: string; competencyDesc: string; isDirty: boolean }
    >
  >({});

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Selected subject object
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || activeSubjects[0];

  // Initialize or re-sync local table when class, period, or subject changes
  useEffect(() => {
    if (!selectedSubjectId && activeSubjects.length > 0) {
      setSelectedSubjectId(activeSubjects[0].id);
      return;
    }

    const stateMap: Record<
      string,
      { formative: string; summative: string; competencyDesc: string; isDirty: boolean }
    > = {};

    classStudents.forEach((st) => {
      const g = getStudentGrade(st.id, selectedSubjectId, selectedPeriodId);
      stateMap[st.id] = {
        formative:
          g && typeof g.formativeScore === 'number' ? String(g.formativeScore) : '',
        summative:
          g && typeof g.summativeScore === 'number' ? String(g.summativeScore) : '',
        competencyDesc:
          g && g.competencyDesc ? g.competencyDesc : currentSubject?.defaultCompetencyDesc || '',
        isDirty: false,
      };
    });

    setLocalGrades(stateMap);
    setSaveStatus('saved');
  }, [selectedClassId, selectedPeriodId, selectedSubjectId, classStudents.length]);

  // Handle cell value change
  const handleChange = (
    studentId: string,
    field: 'formative' | 'summative' | 'competencyDesc',
    val: string
  ) => {
    // If numeric field, validate 0-100
    if (field === 'formative' || field === 'summative') {
      if (val !== '') {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) {
          return; // reject invalid values
        }
      }
    }

    setLocalGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val,
        isDirty: true,
      },
    }));

    setSaveStatus('dirty');

    // Debounced autosave
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      triggerSave();
    }, 1200);
  };

  // Save all modified grades
  const triggerSave = () => {
    setSaveStatus('saving');
    const recordsToSave: GradeRecord[] = [];

    classStudents.forEach((st) => {
      const cell = localGrades[st.id];
      if (cell) {
        const formNum = cell.formative.trim() === '' ? null : parseFloat(cell.formative);
        const sumNum = cell.summative.trim() === '' ? null : parseFloat(cell.summative);

        recordsToSave.push({
          id: `${st.id}_${selectedSubjectId}_${selectedPeriodId}`,
          studentId: st.id,
          subjectId: selectedSubjectId,
          periodId: selectedPeriodId,
          formativeScore: formNum,
          summativeScore: sumNum,
          competencyDesc: cell.competencyDesc,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    batchSaveGrades(recordsToSave);
    setSaveStatus('saved');
  };

  // Keyboard navigation on Enter / Tab / Arrows
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    field: 'formative' | 'summative'
  ) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = studentIndex + 1;
      if (nextIdx < classStudents.length) {
        const nextId = classStudents[nextIdx].id;
        const targetInput = document.getElementById(
          `input-${field}-${nextId}`
        ) as HTMLInputElement;
        if (targetInput) {
          targetInput.focus();
          targetInput.select();
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = studentIndex - 1;
      if (prevIdx >= 0) {
        const prevId = classStudents[prevIdx].id;
        const targetInput = document.getElementById(
          `input-${field}-${prevId}`
        ) as HTMLInputElement;
        if (targetInput) {
          targetInput.focus();
          targetInput.select();
        }
      }
    }
  };

  // Bulk fill utilities
  const handleBulkFillFormative = () => {
    const val = prompt('Masukkan nilai formatif untuk semua siswa (0 - 100):', '80');
    if (val === null) return;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 100) {
      showToast('error', 'Nilai harus antara 0 hingga 100');
      return;
    }
    setLocalGrades((prev) => {
      const next = { ...prev };
      classStudents.forEach((st) => {
        next[st.id] = { ...next[st.id], formative: String(num), isDirty: true };
      });
      return next;
    });
    setSaveStatus('dirty');
    setTimeout(triggerSave, 300);
  };

  const handleBulkFillSummative = () => {
    const val = prompt('Masukkan nilai sumatif untuk semua siswa (0 - 100):', '75');
    if (val === null) return;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 100) {
      showToast('error', 'Nilai harus antara 0 hingga 100');
      return;
    }
    setLocalGrades((prev) => {
      const next = { ...prev };
      classStudents.forEach((st) => {
        next[st.id] = { ...next[st.id], summative: String(num), isDirty: true };
      });
      return next;
    });
    setSaveStatus('dirty');
    setTimeout(triggerSave, 300);
  };

  const handleApplyDefaultCompetencyToAll = () => {
    if (!currentSubject?.defaultCompetencyDesc) {
      showToast('warning', 'Mata pelajaran ini belum memiliki template capaian kompetensi default.');
      return;
    }
    if (confirm('Terapkan deskripsi capaian kompetensi default ke seluruh siswa yang masih kosong?')) {
      setLocalGrades((prev) => {
        const next = { ...prev };
        classStudents.forEach((st) => {
          if (!next[st.id]?.competencyDesc) {
            next[st.id] = {
              ...next[st.id],
              competencyDesc: currentSubject.defaultCompetencyDesc || '',
              isDirty: true,
            };
          }
        });
        return next;
      });
      setSaveStatus('dirty');
      setTimeout(triggerSave, 300);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Edit3 className="w-6 h-6 text-blue-700" />
            <span>8. Input Nilai Cepat (Grid Keyboard)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Penginputan langsung untuk satu rombel kelas. Navigasi lancar dengan tombol Enter / Tab / Panah.
          </p>
        </div>

        {/* Status Indicator & Save Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl bg-white border border-slate-200">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Tersimpan Otomatis</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-blue-700 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Menyimpan...</span>
              </span>
            )}
            {saveStatus === 'dirty' && (
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Ada Perubahan Belum Disimpan</span>
              </span>
            )}
          </div>

          <button
            onClick={triggerSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Class */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Pilih Rombel / Kelas
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.major}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Pilih Mata Pelajaran
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {activeSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.code}] {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Tahun Pelajaran & Penilaian
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                TP {p.academicYear} {p.semester} ({p.assessmentType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Fill & Tools Bar */}
      <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Wand2 className="w-4 h-4 text-blue-600" />
          <span>Pengisian Nilai Massal:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBulkFillFormative}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700 transition-colors"
          >
            Isi Semua Formatif
          </button>
          <button
            onClick={handleBulkFillSummative}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700 transition-colors"
          >
            Isi Semua Sumatif
          </button>
          <button
            onClick={handleApplyDefaultCompetencyToAll}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-medium text-blue-700 transition-colors"
          >
            Terapkan Deskripsi Standar ke Semua
          </button>
        </div>
      </div>

      {/* Fast Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800 text-white font-semibold">
              <tr>
                <th className="py-3 px-3 w-10 text-center">NO</th>
                <th className="py-3 px-3 w-64">NAMA PESERTA DIDIK</th>
                <th className="py-3 px-2 w-20 text-center font-mono">NIS</th>
                <th className="py-3 px-3 w-28 text-center bg-slate-700/80">
                  NILAI FORMATIF
                </th>
                <th className="py-3 px-3 w-28 text-center bg-blue-900/90 text-blue-100">
                  NILAI SUMATIF (PTS) *
                </th>
                <th className="py-3 px-4">DESKRIPSI CAPAIAN KOMPETENSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada siswa dalam rombel kelas yang dipilih.
                  </td>
                </tr>
              ) : (
                classStudents.map((st, idx) => {
                  const item = localGrades[st.id] || {
                    formative: '',
                    summative: '',
                    competencyDesc: '',
                  };
                  const isComplete = item.summative.trim() !== '';

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        !isComplete ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[240px]">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NISN: {st.nisn || '—'}
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                        {st.nis}
                      </td>

                      {/* Formative score input */}
                      <td className="py-2 px-3 text-center">
                        <input
                          id={`input-formative-${st.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="—"
                          value={item.formative}
                          onChange={(e) => handleChange(st.id, 'formative', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'formative')}
                          className="w-20 text-center font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg py-1.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                      </td>

                      {/* Summative score input */}
                      <td className="py-2 px-3 text-center bg-blue-50/30">
                        <input
                          id={`input-summative-${st.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="—"
                          value={item.summative}
                          onChange={(e) => handleChange(st.id, 'summative', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'summative')}
                          className={`w-20 text-center font-mono font-extrabold rounded-lg py-1.5 outline-none text-sm transition-all ${
                            item.summative
                              ? 'bg-blue-50 border-2 border-blue-600 text-blue-950 focus:bg-white'
                              : 'bg-white border-2 border-amber-400 text-slate-400 focus:border-blue-500'
                          }`}
                        />
                      </td>

                      {/* Competency description input */}
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={item.competencyDesc}
                          onChange={(e) => handleChange(st.id, 'competencyDesc', e.target.value)}
                          placeholder="Capaian kompetensi..."
                          className="w-full text-xs text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:px-2 py-1 outline-none transition-all rounded"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            * Nilai Sumatif merupakan nilai pokok asesmen rapor PTS. Nilai tersimpan langsung dan otomatis
            tersinkronisasi ke tabel Leger Nilai dan Lembar Rapor.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Terisi Lengkap</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Belum Lengkap</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
