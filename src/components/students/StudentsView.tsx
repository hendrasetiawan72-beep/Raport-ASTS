import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  CheckCircle,
  Camera,
  User,
  Eye,
} from 'lucide-react';
import { Student } from '../../types';
import { PhotoUploader } from '../common/PhotoUploader';

export const StudentsView: React.FC = () => {
  const {
    students,
    classes,
    selectedClassId,
    setSelectedClassId,
    addStudent,
    updateStudent,
    deleteStudent,
    setActiveMenu,
    setSelectedStudentIdForReport,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>(selectedClassId || 'all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'nis_asc' | 'nis_desc'>('name_asc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthPlace, setBirthPlace] = useState('Batang');
  const [birthDate, setBirthDate] = useState('2008-01-01');
  const [classId, setClassId] = useState(selectedClassId);
  const [parentName, setParentName] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Mutasi' | 'Lulus'>('Aktif');
  const [photoUrl, setPhotoUrl] = useState('');

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesClass = filterClass === 'all' || s.classId === filterClass;
        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nisn.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesClass && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'nis_asc') return a.nis.localeCompare(b.nis);
        if (sortBy === 'nis_desc') return b.nis.localeCompare(a.nis);
        return 0;
      });
  }, [students, filterClass, searchQuery, sortBy]);

  const openAddModal = () => {
    setEditingStudent(null);
    setNis('');
    setNisn('');
    setName('');
    setGender('L');
    setBirthPlace('Batang');
    setBirthDate('2008-01-01');
    setClassId(selectedClassId);
    setParentName('');
    setStatus('Aktif');
    setPhotoUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setNis(s.nis);
    setNisn(s.nisn);
    setName(s.name);
    setGender(s.gender);
    setBirthPlace(s.birthPlace);
    setBirthDate(s.birthDate);
    setClassId(s.classId);
    setParentName(s.parentName);
    setStatus(s.status);
    setPhotoUrl(s.photoUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, {
        nis,
        nisn,
        name: name.toUpperCase(),
        gender,
        birthPlace,
        birthDate,
        classId,
        parentName,
        status,
        photoUrl,
      });
    } else {
      addStudent({
        nis,
        nisn,
        name: name.toUpperCase(),
        gender,
        birthPlace,
        birthDate,
        classId,
        parentName,
        status,
        photoUrl,
      });
    }
    setIsModalOpen(false);
  };

  const openReport = (studentId: string) => {
    setSelectedStudentIdForReport(studentId);
    setActiveMenu('raport');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#3D332A]">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD6C9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E5E]">
            <Users2 className="w-4 h-4 text-[#5A7365]" />
            <span>6. Data Peserta Didik</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] mt-1 font-serif">
            Manajemen Siswa & Foto Profil Resmi
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E5E] mt-1">
            Pengelolaan identitas siswa, unggah pas foto 3×4, NIS/NISN, data orang tua, dan status akademik.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveMenu('excel')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#3B5446] hover:bg-[#F2ECE1] font-bold rounded-xl text-xs sm:text-sm transition-colors border border-[#DDD6C9] shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#5A7365]" />
            <span>Impor Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DDD6C9] shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8071] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, NIS, atau NISN..."
            className="w-full pl-9 pr-4 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7E9685] outline-none text-[#2C241E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#7A6E5E] mr-1.5" />
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                if (e.target.value !== 'all') {
                  setSelectedClassId(e.target.value);
                }
              }}
              className="bg-transparent text-xs font-bold text-[#2C241E] outline-none cursor-pointer"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas {c.name} ({students.filter((s) => s.classId === c.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6E5E] mr-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#2C241E] outline-none cursor-pointer"
            >
              <option value="name_asc">Nama (A-Z)</option>
              <option value="name_desc">Nama (Z-A)</option>
              <option value="nis_asc">NIS (Terkecil)</option>
              <option value="nis_desc">NIS (Terbesar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List of Students */}
      <div className="bg-white rounded-3xl border border-[#DDD6C9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#5A5043] font-bold border-b border-[#DDD6C9]">
              <tr>
                <th className="py-3 px-3 text-center w-12">NO</th>
                <th className="py-3 px-4">FOTO & NAMA PESERTA DIDIK</th>
                <th className="py-3 px-3">NIS</th>
                <th className="py-3 px-3">NISN</th>
                <th className="py-3 px-3">L/P</th>
                <th className="py-3 px-3">KELAS</th>
                <th className="py-3 px-3">ORANG TUA / WALI</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D9]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => {
                  const studentClass = classes.find((c) => c.id === s.classId);
                  const isOdd = idx % 2 === 1;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-[#F4F0E8] transition-colors ${
                        isOdd ? 'bg-[#FCFAF7]' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono text-[#7A6E5E] font-semibold">
                        {idx + 1}
                      </td>

                      {/* Photo & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-11 rounded-lg border border-[#D5CDBD] bg-[#F4F0E8] overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                            {s.photoUrl ? (
                              <img
                                src={s.photoUrl}
                                alt={s.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-[#8C8071]">
                                {s.gender === 'P' ? '👩' : '👦'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#2C241E] leading-snug">
                              {s.name}
                            </div>
                            <div className="text-[11px] text-[#7A6E5E] mt-0.5">
                              {s.birthPlace}, {s.birthDate}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#2C241E]">
                        {s.nis}
                      </td>

                      <td className="py-3 px-3 font-mono text-[#5A5043]">
                        {s.nisn || '—'}
                      </td>

                      <td className="py-3 px-3 font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] ${
                            s.gender === 'L'
                              ? 'bg-[#E8EFEA] text-[#2C4A38]'
                              : 'bg-[#F7ECE8] text-[#8C3D2B]'
                          }`}
                        >
                          {s.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-[#2C241E]">
                        {studentClass?.name || '—'}
                      </td>

                      <td className="py-3 px-3 text-[#5A5043] truncate max-w-[160px]">
                        {s.parentName || '—'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EFEA] text-[#2C4A38]">
                          {s.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openReport(s.id)}
                            className="p-1.5 text-[#5A7365] hover:bg-[#E8EFEA] rounded-lg transition-colors"
                            title="Buka Raport PTS"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-[#3D332A] hover:bg-[#EAE4D9] rounded-lg transition-colors"
                            title="Edit Data Siswa & Foto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus siswa ${s.name}?`)) {
                                deleteStudent(s.id);
                              }
                            }}
                            className="p-1.5 text-[#A84A3B] hover:bg-[#FBEBE8] rounded-lg transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8C8071]">
                    Tidak ada siswa yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#FAF8F5] border-t border-[#DDD6C9] flex items-center justify-between text-xs text-[#7A6E5E]">
          <div>
            Menampilkan <b>{filteredStudents.length}</b> dari total <b>{students.length}</b> siswa
          </div>
          <div className="text-[11px] text-[#8C8071]">
            Foto siswa disimpan aman di IndexedDB dan siap dicetak pada cover atau lembar rapor.
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Student with Photo Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-[#DDD6C9] text-[#3E342B]">
            <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
              <h2 className="text-base font-bold text-[#2C241E]">
                {editingStudent ? 'Edit Data Peserta Didik & Foto' : 'Tambah Peserta Didik Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7A6E5E] hover:text-[#2C241E] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              {/* Photo Upload Row */}
              <div className="bg-white p-4 rounded-2xl border border-[#DDD6C9]">
                <PhotoUploader
                  label="Unggah Pas Foto Profil Siswa (3x4)"
                  value={photoUrl}
                  onChange={(url) => setPhotoUrl(url)}
                  type="avatar"
                  shape="square"
                  helperText="Format JPG, PNG, WEBP. Kompresi otomatis untuk penyimpanan database yang aman."
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A4036] mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="ADHITYA WAHYU PRADANA"
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-bold uppercase text-[#2C241E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    required
                    placeholder="5421"
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-mono text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0084510101"
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-mono text-[#2C241E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Kelas Penempatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-semibold text-[#2C241E]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.major}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] font-semibold text-[#2C241E]"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Batang"
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A4036] mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl outline-none focus:ring-2 focus:ring-[#7E9685] text-[#2C241E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A4036] mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nama Bapak / Ibu / Wali Siswa"
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
                  {editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
