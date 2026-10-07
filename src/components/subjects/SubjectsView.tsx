import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Subject, SubjectCategory } from '../../types';

export const SubjectsView: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, reorderSubjects } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<SubjectCategory>(
    'A. KELOMPOK MATA PELAJARAN UMUM'
  );
  const [defaultCompetencyDesc, setDefaultCompetencyDesc] = useState('');
  const [isActive, setIsActive] = useState(true);

  const categories: SubjectCategory[] = [
    'A. KELOMPOK MATA PELAJARAN UMUM',
    'B. KELOMPOK MATA PELAJARAN KEJURUAN',
    'C. KELOMPOK CIRI KHUSUS (ISMUBA)',
  ];

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setCategory('A. KELOMPOK MATA PELAJARAN UMUM');
    setDefaultCompetencyDesc('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setCategory(sub.category);
    setDefaultCompetencyDesc(sub.defaultCompetencyDesc || '');
    setIsActive(sub.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name,
        code,
        category,
        defaultCompetencyDesc,
        isActive,
      });
    } else {
      addSubject({
        name,
        code: code || name.substring(0, 4).toUpperCase(),
        category,
        orderIndex: subjects.length + 1,
        isActive,
        defaultCompetencyDesc,
      });
    }
    setIsModalOpen(false);
  };

  const moveSubject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subjects.length) return;

    const newSubjects = [...subjects];
    const temp = newSubjects[index];
    newSubjects[index] = newSubjects[targetIndex];
    newSubjects[targetIndex] = temp;

    // reindex
    newSubjects.forEach((s, idx) => (s.orderIndex = idx + 1));
    reorderSubjects(newSubjects);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-700" />
            <span>7. Data Mata Pelajaran (Kurikulum Merdeka)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Struktur kurikulum SMK Muhammadiyah Bawang: Kelompok Umum, Kejuruan, dan ISMUBA.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      {/* Render by Category Groups */}
      <div className="space-y-6">
        {categories.map((catName) => {
          const groupSubjects = subjects.filter((s) => {
            if (catName === 'C. KELOMPOK CIRI KHUSUS (ISMUBA)') {
              return (
                s.category === catName ||
                s.category === 'C. KELOMPOK ISMUBA' ||
                s.category === 'C. KELOMPOK CIRI KHUSUS' ||
                (s.category && s.category.toUpperCase().includes('CIRI KHUSUS')) ||
                (s.category && s.category.toUpperCase().includes('ISMUBA'))
              );
            }
            return s.category === catName;
          });

          return (
            <div
              key={catName}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-slate-800 text-sm tracking-wide">
                    {catName}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                  {groupSubjects.length} Mapel
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {groupSubjects.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Belum ada mata pelajaran dalam kelompok ini.
                  </div>
                ) : (
                  groupSubjects.map((sub, sIdx) => {
                    const globalIdx = subjects.findIndex((x) => x.id === sub.id);
                    return (
                      <div
                        key={sub.id}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {sIdx + 1}
                          </span>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">
                                {sub.name}
                              </span>
                              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {sub.code}
                              </span>
                              {!sub.isActive && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                                  Non-aktif
                                </span>
                              )}
                            </div>
                            {sub.defaultCompetencyDesc && (
                              <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">
                                "{sub.defaultCompetencyDesc}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => moveSubject(globalIdx, 'up')}
                            disabled={globalIdx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                            title="Pindah ke Atas"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSubject(globalIdx, 'down')}
                            disabled={globalIdx === subjects.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                            title="Pindah ke Bawah"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors ml-2"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin hapus mata pelajaran ${sub.name}?`)) {
                                deleteSubject(sub.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kelompok Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SubjectCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Pendidikan Agama Islam dan Budi Pekerti"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Singkat
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="PAI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Capaian Kompetensi Standar (Kurikulum Merdeka)
                </label>
                <textarea
                  rows={3}
                  value={defaultCompetencyDesc}
                  onChange={(e) => setDefaultCompetencyDesc(e.target.value)}
                  placeholder="Peserta didik mampu memahami dan menerapkan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Status Aktif (Tampil di Rapor & Leger)</span>
                </label>
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
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
