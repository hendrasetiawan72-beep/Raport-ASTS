import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';
import { AcademicPeriod } from '../../types';

export const PeriodsView: React.FC = () => {
  const {
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    addPeriod,
    updatePeriod,
    deletePeriod,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null);

  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [assessmentType, setAssessmentType] = useState('PTS');
  const [reportDate, setReportDate] = useState('8 Oktober 2026');

  const openAddModal = () => {
    setEditingPeriod(null);
    setAcademicYear('2026-2027');
    setSemester('Ganjil');
    setAssessmentType('PTS');
    setReportDate('8 Oktober 2026');
    setIsModalOpen(true);
  };

  const openEditModal = (p: AcademicPeriod) => {
    setEditingPeriod(p);
    setAcademicYear(p.academicYear);
    setSemester(p.semester);
    setAssessmentType(p.assessmentType);
    setReportDate(p.reportDate);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPeriod) {
      updatePeriod(editingPeriod.id, {
        academicYear,
        semester,
        assessmentType,
        reportDate,
      });
    } else {
      addPeriod({
        academicYear,
        semester,
        assessmentType,
        reportDate,
        isCurrent: false,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-blue-700" />
            <span>4. Data Tahun Pelajaran & Semester</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola periode asesmen aktif, semester ganjil/genap, dan titimangsa tanggal rapor.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Periode Baru</span>
        </button>
      </div>

      {/* Grid of Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periods.map((p) => {
          const isSelected = p.id === selectedPeriodId;
          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition-all relative ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    {p.assessmentType}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    TP {p.academicYear}
                  </h3>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">
                    Semester {p.semester}
                  </div>
                </div>

                {isSelected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedPeriodId(p.id)}
                    className="text-xs text-blue-700 hover:text-blue-900 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    Pilih Periode
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal Rapor:</span>
                  <span className="font-medium text-slate-800">{p.reportDate}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit Periode"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {periods.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus periode TP ${p.academicYear} ${p.semester}?`)) {
                        deletePeriod(p.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Periode"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingPeriod ? 'Edit Periode Penilaian' : 'Tambah Periode Penilaian'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Pelajaran (Contoh: 2026-2027)
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                  placeholder="2026-2027"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Asesmen
                  </label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="PTS">PTS (Sumatif Tengah Semester)</option>
                    <option value="PAS">PAS (Sumatif Akhir Semester)</option>
                    <option value="SAS">SAS (Sumatif Akhir Semester)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Titimangsa Penerbitan Rapor
                </label>
                <input
                  type="text"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  required
                  placeholder="8 Oktober 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl"
                >
                  Simpan Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
