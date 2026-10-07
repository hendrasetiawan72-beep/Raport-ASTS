import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DoorOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  ArrowRightLeft,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ClassGroup } from '../../types';

export const ClassesView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    addClass,
    updateClass,
    deleteClass,
    students,
    transferStudentClass,
    showToast,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

  const [name, setName] = useState('X TO 4');
  const [gradeLevel, setGradeLevel] = useState<'X' | 'XI' | 'XII'>('X');
  const [major, setMajor] = useState('Teknik Otomotif');
  const [homeroomTeacher, setHomeroomTeacher] = useState('Drs. Supriyanto, M.Pd.');
  const [fase, setFase] = useState<'E' | 'F'>('E');

  // Transfer modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState('');
  const [targetClassId, setTargetClassId] = useState('');

  const openAddModal = () => {
    setEditingClass(null);
    setName('');
    setGradeLevel('X');
    setMajor('Teknik Otomotif');
    setHomeroomTeacher('');
    setFase('E');
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassGroup) => {
    setEditingClass(c);
    setName(c.name);
    setGradeLevel(c.gradeLevel);
    setMajor(c.major);
    setHomeroomTeacher(c.homeroomTeacher);
    setFase(c.fase);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, {
        name,
        gradeLevel,
        major,
        homeroomTeacher,
        fase,
      });
    } else {
      addClass({
        name,
        gradeLevel,
        major,
        homeroomTeacher,
        fase,
      });
    }
    setIsModalOpen(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToTransfer || !targetClassId) return;
    transferStudentClass(studentToTransfer, targetClassId);
    setTransferModalOpen(false);
    setStudentToTransfer('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#3D332A]">
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD6C9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E5E]">
            <DoorOpen className="w-4 h-4 text-[#5A7365]" />
            <span>5. Data Rombongan Belajar (Kelas)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] mt-1 font-serif">
            Kelola Rombel & Penetapan Wali Kelas
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E5E] mt-1">
            Pengaturan kelas, wali kelas resmi, fase kurikulum merdeka (E / F), dan mutasi siswa antar kelas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetClassId(classes.find((c) => c.id !== selectedClassId)?.id || '');
              setTransferModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F2ECE1] text-[#3B5446] font-bold rounded-xl text-xs sm:text-sm transition-colors border border-[#DDD6C9] shadow-2xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#5A7365]" />
            <span>Pindah Siswa</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const studentCount = students.filter((s) => s.classId === cls.id).length;
          const isSelected = cls.id === selectedClassId;

          return (
            <div
              key={cls.id}
              className={`p-5 rounded-3xl border transition-all ${
                isSelected
                  ? 'bg-[#EBF1ED] border-[#A8C2B1] shadow-xs'
                  : 'bg-white border-[#DDD6C9] hover:border-[#BFB3A1] shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-[#3B5446] uppercase tracking-wider">
                      Fase {cls.fase}
                    </span>
                    <span className="text-[11px] text-[#A89D8F]">•</span>
                    <span className="text-[11px] font-semibold text-[#7A6E5E]">
                      Tingkat {cls.gradeLevel}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#2C241E] mt-0.5 font-serif">
                    {cls.name}
                  </h3>
                  <div className="text-xs font-medium text-[#7A6E5E] mt-0.5">
                    {cls.major}
                  </div>
                </div>

                {isSelected ? (
                  <span className="text-[11px] font-bold text-[#2C4135] bg-[#D7E5DC] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#B9D3C2]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3B5446]" />
                    <span>Aktif</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedClassId(cls.id)}
                    className="text-xs text-[#5A7365] hover:text-[#2C4135] font-bold px-2.5 py-1 rounded-xl border border-[#C5D7CC] hover:bg-[#E8EFEA] transition-colors"
                  >
                    Buka Kelas
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#EAE4D9] text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#7A6E5E]">Wali Kelas:</span>
                  <span className="font-bold text-[#2C241E] truncate max-w-[170px]">
                    {cls.homeroomTeacher || 'Belum Ditentukan'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7A6E5E]">Total Siswa:</span>
                  <span className="font-bold text-[#2C4135] bg-[#E8EFEA] px-2 py-0.5 rounded-md">
                    {studentCount} Siswa
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-[#F2ECE1]">
                <button
                  onClick={() => openEditModal(cls)}
                  className="p-1.5 text-[#5A7365] hover:bg-[#E8EFEA] rounded-lg transition-colors"
                  title="Edit Data Kelas & Wali Kelas"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {classes.length > 1 && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Hapus kelas ${cls.name}? Siswa dalam kelas ini (${studentCount}) perlu dialihkan.`
                        )
                      ) {
                        deleteClass(cls.id);
                      }
                    }}
                    className="p-1.5 text-[#A84A3B] hover:bg-[#FBEBE8] rounded-lg transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-[#DDD6C9] text-[#3D332A]">
            <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
              <h2 className="text-base font-bold text-[#2C241E]">
                {editingClass ? 'Edit Informasi Kelas & Wali Kelas' : 'Tambah Rombel Kelas Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#7A6E5E] hover:text-[#2C241E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Nama Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="X TO 4"
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-bold text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Fase Kurikulum
                  </label>
                  <select
                    value={fase}
                    onChange={(e) => setFase(e.target.value as 'E' | 'F')}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-medium text-[#2C241E]"
                  >
                    <option value="E">Fase E (Kelas X)</option>
                    <option value="F">Fase F (Kelas XI / XII)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Tingkat
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as 'X' | 'XI' | 'XII')}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-medium text-[#2C241E]"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Program / Konsentrasi Keahlian
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    required
                    placeholder="Teknik Otomotif"
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-medium text-[#2C241E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A4036] mb-1">
                  Nama Wali Kelas (dengan Gelar)
                </label>
                <input
                  type="text"
                  value={homeroomTeacher}
                  onChange={(e) => setHomeroomTeacher(e.target.value)}
                  placeholder="Drs. Supriyanto, M.Pd."
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-semibold text-[#2C241E]"
                />
                <p className="text-[11px] text-[#7A6E5E] mt-1">
                  Wali kelas ini otomatis tertulis pada lembar tanda tangan raport untuk kelas ini.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D5CDBD] text-[#5A5043] rounded-xl hover:bg-[#F2ECE1] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transfer Siswa Antar Kelas */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-[#DDD6C9] text-[#3D332A]">
            <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
              <h2 className="text-base font-bold text-[#2C241E] flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#5A7365]" />
                <span>Pemindahan Siswa Antar Kelas</span>
              </h2>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="text-[#7A6E5E] hover:text-[#2C241E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-[#4A4036] mb-1">
                  Pilih Siswa yang Dipindahkan
                </label>
                <select
                  value={studentToTransfer}
                  onChange={(e) => setStudentToTransfer(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-medium text-[#2C241E]"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => {
                    const currentCls = classes.find((c) => c.id === s.classId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} (NIS: {s.nis}) — Kelas Saat Ini: {currentCls?.name || '—'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#4A4036] mb-1">
                  Pindahkan ke Kelas Tujuan
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-medium text-[#2C241E]"
                >
                  <option value="">-- Pilih Kelas Tujuan --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.major}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-[#FBF5EC] rounded-2xl border border-[#E8DCB8] text-xs text-[#7A5A2B]">
                Perhatian: Pemindahan siswa akan memindahkan rekaman siswa ke rombel baru. Nilai dan rekaman kehadiran yang
                sudah diinput pada semester ini tetap tersimpan aman di database.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 border border-[#D5CDBD] text-[#5A5043] rounded-xl hover:bg-[#F2ECE1] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!studentToTransfer || !targetClassId}
                  className="px-5 py-2 bg-[#5A7365] hover:bg-[#465B4F] disabled:opacity-50 text-white font-bold rounded-xl"
                >
                  Konfirmasi Pindah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
