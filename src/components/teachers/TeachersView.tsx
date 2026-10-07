import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Plus, Edit2, Trash2, X, Phone, BookOpen, PenTool, Camera, User } from 'lucide-react';
import { Teacher } from '../../types';
import { PhotoUploader } from '../common/PhotoUploader';

export const TeachersView: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [name, setName] = useState('');
  const [nipOrNbm, setNipOrNbm] = useState('');
  const [subjectTaught, setSubjectTaught] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  const openAddModal = () => {
    setEditingTeacher(null);
    setName('');
    setNipOrNbm('');
    setSubjectTaught('');
    setPhone('');
    setPhotoUrl('');
    setSignatureUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setName(t.name);
    setNipOrNbm(t.nipOrNbm);
    setSubjectTaught(t.subjectTaught);
    setPhone(t.phone || '');
    setPhotoUrl(t.photoUrl || '');
    setSignatureUrl(t.signatureUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        name,
        nipOrNbm,
        subjectTaught,
        phone,
        photoUrl,
        signatureUrl,
      });
    } else {
      addTeacher({
        name,
        nipOrNbm,
        subjectTaught,
        phone,
        photoUrl,
        signatureUrl,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#3D332A]">
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD6C9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E5E]">
            <GraduationCap className="w-4 h-4 text-[#5A7365]" />
            <span>3. Tenaga Pendidik & Guru Pengampu</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] mt-1 font-serif">
            Data Guru & Tanda Tangan Digital
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E5E] mt-1">
            Daftar guru pengampu mata pelajaran dan wali kelas beserta foto dan tanda tangan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Data Guru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-3xl bg-white border border-[#DDD6C9] hover:border-[#BDB3A1] shadow-2xs transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#2C4135] font-bold flex items-center justify-center shrink-0 border border-[#D0DFD5] overflow-hidden shadow-2xs">
                  {t.photoUrl ? (
                    <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-serif">{t.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C241E] leading-snug">
                    {t.name}
                  </h3>
                  <div className="text-xs text-[#7A6E5E] font-mono mt-0.5">
                    NBM/NIP: {t.nipOrNbm}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 text-[#5A7365] hover:bg-[#E8EFEA] rounded-lg transition-colors"
                  title="Edit Data Guru"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus data guru ${t.name}?`)) {
                      deleteTeacher(t.id);
                    }
                  }}
                  className="p-1.5 text-[#A84A3B] hover:bg-[#FBEBE8] rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EAE4D9] text-xs space-y-1.5 text-[#5A5043]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#5A7365]" />
                <span className="font-semibold text-[#2C241E]">{t.subjectTaught}</span>
              </div>
              {t.phone && (
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#7A6E5E]" />
                  <span>{t.phone}</span>
                </div>
              )}
              {t.signatureUrl && (
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#3B5446]">
                  <PenTool className="w-3 h-3 text-[#5A7365]" />
                  <span>TTD Digital Tersimpan</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-[#DDD6C9] text-[#3E342B]">
            <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
              <h2 className="text-base font-bold text-[#2C241E]">
                {editingTeacher ? 'Edit Data Tenaga Pendidik' : 'Tambah Guru Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#7A6E5E] hover:text-[#2C241E] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-[#DDD6C9]">
                  <PhotoUploader
                    label="Foto Profil Guru"
                    value={photoUrl}
                    onChange={(url) => setPhotoUrl(url)}
                    type="avatar"
                    shape="circle"
                  />
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#DDD6C9]">
                  <PhotoUploader
                    label="Tanda Tangan Guru"
                    value={signatureUrl}
                    onChange={(url) => setSignatureUrl(url)}
                    type="signature"
                    shape="signature"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A4036] mb-1">
                  Nama Lengkap Guru (dengan Gelar) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Drs. H. Ahmad Sudrajat, M.Pd."
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-semibold text-[#2C241E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    NBM / NIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nipOrNbm}
                    onChange={(e) => setNipOrNbm(e.target.value)}
                    required
                    placeholder="19750810 200501 1 004"
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-mono text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-mono text-[#2C241E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A4036] mb-1">
                  Mata Pelajaran yang Diampu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subjectTaught}
                  onChange={(e) => setSubjectTaught(e.target.value)}
                  required
                  placeholder="Matematika / Pemeliharaan Mesin Kendaraan Ringan"
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] text-[#2C241E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE4D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD6C9] text-[#6B6053] rounded-xl hover:bg-[#EAE4D9] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {editingTeacher ? 'Simpan Perubahan' : 'Tambahkan Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
