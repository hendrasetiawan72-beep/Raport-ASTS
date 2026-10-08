import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Image as ImageIcon,
  PenTool,
  Save,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  UserCheck,
  Camera,
  Sliders,
  Database,
  ShieldCheck,
  Check,
  Sparkles,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';
import { initialSchoolProfile } from '../../data/initialData';
import { PhotoUploader } from '../common/PhotoUploader';
import { HeaderLayoutEditorModal } from '../layout/HeaderLayoutEditorModal';

export const SchoolProfileView: React.FC = () => {
  const {
    schoolProfile,
    updateSchoolProfile,
    classes,
    selectedClassId,
    currentPeriod,
    dbStatus,
    dbStats,
    forceSaveToDatabase,
    showToast,
  } = useApp();

  const [formData, setFormData] = useState({
    ...schoolProfile,
    reportDate: schoolProfile.reportDate || '8 Oktober 2026',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...schoolProfile,
      reportDate: schoolProfile.reportDate || prev.reportDate || '8 Oktober 2026',
    }));
  }, [schoolProfile]);
  const [isSaved, setIsSaved] = useState(false);
  const [headerModalOpen, setHeaderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sekolah' | 'kepsek' | 'walikelas' | 'layout'>('sekolah');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(formData);
    await forceSaveToDatabase();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const resetToOfficialBranding = () => {
    setFormData({
      ...formData,
      logoUrl: initialSchoolProfile.logoUrl,
      headmasterSignatureUrl: initialSchoolProfile.headmasterSignatureUrl,
      headmasterName: initialSchoolProfile.headmasterName,
      headmasterNbm: initialSchoolProfile.headmasterNbm,
      homeroomTeacherName: initialSchoolProfile.homeroomTeacherName || 'Mursyidah, S.Pd.',
      homeroomTeacherNip: initialSchoolProfile.homeroomTeacherNip || '19840512 201001 2 018',
      homeroomTeacherSignatureUrl: initialSchoolProfile.homeroomTeacherSignatureUrl || initialSchoolProfile.headmasterSignatureUrl,
    });
    showToast('info', 'Tautan logo, identitas, dan tanda tangan resmi telah direset ke setelan awal.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#3D332A]">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#FAF8F5] border border-[#DDD6C9] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E5E]">
            <Building2 className="w-4 h-4 text-[#5A7365]" />
            <span>2. Data & Identitas Resmi Sekolah</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] mt-1 font-serif">
            Identitas Lembaga & Pejabat Pengesah Raport
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E5E] mt-1">
            Pengaturan sekolah, profil Kepala Sekolah, serta pengelolaan Wali Kelas terintegrasi dengan raport.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Header Layout button */}
          <button
            type="button"
            onClick={() => setHeaderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3B5446] bg-[#E8EFEA] hover:bg-[#D9E5DC] border border-[#BFD4C6] rounded-xl transition-all shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-[#5A7365]" />
            <span>Edit Layout Header</span>
          </button>

          <button
            onClick={resetToOfficialBranding}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#6B6053] bg-white border border-[#DDD6C9] rounded-xl hover:bg-[#F2ECE1] transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>
        </div>
      </div>

      {/* Database Security Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#F4F0E8] border border-[#DFD8CC] text-xs">
        <div className="flex items-center gap-2 text-[#4A4036]">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5A7365] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#455E4F]"></span>
          </span>
          <span className="font-bold text-[#2C241E]">Status Database IndexedDB:</span>
          <span className="font-semibold text-[#3B5446] bg-[#E8EFEA] px-2 py-0.5 rounded-md">
            Terhubung & Aktif (Penyimpanan Aman Tanpa Batas Kuota)
          </span>
          {dbStats && (
            <span className="text-[#7A6E5E] hidden md:inline">
              • {dbStats.totalRecords} rekaman • ~{dbStats.approxSizeKb} KB
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={forceSaveToDatabase}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5A7365] hover:text-[#3B5446] hover:underline"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Sinkronkan ke Database Sekarang</span>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-[#DDD6C9] gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'sekolah', label: 'Identitas Sekolah & Logo', icon: Building2 },
          { id: 'walikelas', label: 'Wali Kelas & Tanda Tangan', icon: UserCheck, highlight: true },
          { id: 'kepsek', label: 'Kepala Sekolah & Tanda Tangan', icon: PenTool },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#2C241E] border-t-2 border-t-[#5A7365] border-x border-b-0 border-[#DDD6C9] -mb-[1px] shadow-2xs font-extrabold'
                  : 'text-[#7A6E5E] hover:text-[#2C241E] hover:bg-[#F5F1E8]'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#5A7365]' : tab.highlight ? 'text-[#C07865]' : 'text-[#8C8071]'
                }`}
              />
              <span>{tab.label}</span>
              {tab.highlight && (
                <span className="text-[10px] px-1.5 py-0.2 bg-[#F7ECE8] text-[#A65B48] rounded-full">
                  Baru
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: IDENTITAS SEKOLAH & LOGO */}
        {activeTab === 'sekolah' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#2C241E] border-b border-[#EAE4D9] pb-3 flex items-center justify-between">
                <span>Informasi Umum Lembaga</span>
                <span className="text-xs font-normal text-[#7A6E5E]">Wajib diisi sesuai Dapodik</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Nama Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none font-semibold text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Nomor Pokok Sekolah Nasional (NPSN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.npsn}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none font-mono text-[#2C241E]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Alamat Lengkap Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Kota / Kecamatan Penerbitan Rapor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none text-[#2C241E]"
                    placeholder="Bawang"
                  />
                  <span className="text-[11px] text-[#8C8071] mt-0.5 block">
                    Nama kota/kecamatan pada titimangsa rapor
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#2C241E]">
                      <CalendarDays className="w-3.5 h-3.5 text-[#5A7365]" />
                      <span>Titimangsa Tanggal Raport</span>
                      <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E8EFEA] text-[#344E3F] rounded-md">
                      Pusat Titimangsa
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.reportDate || ''}
                    onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border-2 border-[#5A7365]/40 focus:border-[#5A7365] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none font-semibold text-[#2C241E]"
                    placeholder="8 Oktober 2026"
                  />
                  <span className="text-[11px] text-[#5A7365] font-semibold mt-0.5 block">
                    Satu-satunya kolom resmi untuk mengatur titimangsa tanggal rapor yang dicetak.
                  </span>
                </div>

                {/* Live Preview Box Titimangsa Raport */}
                <div className="md:col-span-2 p-3.5 bg-[#F4EFE6] border border-[#D8CEBD] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B6053]">
                      Pratinjau Format Titimangsa Raport:
                    </div>
                    <div className="font-serif font-bold text-sm text-[#2C241E]">
                      "{formData.city || 'Bawang'}, {formData.reportDate || '8 Oktober 2026'}"
                    </div>
                  </div>
                  <div className="text-[11px] text-[#7A6E5E] max-w-sm leading-tight bg-white/70 p-2 rounded-xl border border-[#E5DFD5]">
                    Format di atas tampil tepat di atas tanda tangan Wali Kelas pada lembar raport siap cetak dan sinkron otomatis dengan seluruh dokumen.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none text-[#2C241E]"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
                <h3 className="text-sm font-bold text-[#2C241E] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#5A7365]" />
                  <span>Logo Resmi Sekolah (Header & Kop Rapor)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setHeaderModalOpen(true)}
                  className="text-xs font-bold text-[#5A7365] hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Atur Tata Letak Logo Manual</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <PhotoUploader
                  label="Unggah File Logo Sekolah"
                  value={formData.logoUrl}
                  onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                  type="logo"
                  helperText="Format gambar transparan PNG disarankan. Tersimpan di database."
                />

                <div className="p-4 bg-[#F9F7F2] rounded-2xl border border-[#E2DDD5] space-y-2">
                  <div className="text-xs font-bold text-[#4A4036]">
                    Tautan Gambar Logo Cadangan
                  </div>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#7E9685]"
                  />
                  <p className="text-[11px] text-[#7A6E5E]">
                    Logo ini tampil pada bilah navigasi atas dan kop resmi saat mencetak Rapor PTS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WALI KELAS & TANDA TANGAN (FITUR KHUSUS EDIT WALI KELAS) */}
        {activeTab === 'walikelas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-5">
              <div className="border-b border-[#EAE4D9] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#2C241E] flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#5A7365]" />
                    <span>Data Wali Kelas & Pengesahan Dokumen Raport</span>
                  </h2>
                  <p className="text-xs text-[#7A6E5E] mt-0.5">
                    Kelola nama wali kelas, foto profil, dan stempel tanda tangan digital resmi langsung dari data sekolah.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#3B5446] bg-[#E8EFEA] px-2.5 py-1 rounded-full">
                  Sinkron dengan Rapor
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Nama Lengkap Wali Kelas (dengan Gelar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.homeroomTeacherName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, homeroomTeacherName: e.target.value })
                    }
                    placeholder="Mursyidah, S.Pd."
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none font-semibold text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    NIP / NBM Wali Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.homeroomTeacherNip || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, homeroomTeacherNip: e.target.value })
                    }
                    placeholder="19840512 201001 2 018"
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none font-mono text-[#2C241E]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showHomeroomSignatureImage)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showHomeroomSignatureImage: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#5A7365] rounded-sm accent-[#5A7365]"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-[#2C241E]">
                      Tampilkan gambar tanda tangan digital Wali Kelas pada lembar cetak Rapor PTS
                    </span>
                  </label>
                </div>
              </div>

              {/* Photo & Signature Upload Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-[#EAE4D9]">
                {/* Profile Photo */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4A4036]">
                    <Camera className="w-4 h-4 text-[#5A7365]" />
                    <span>Unggah Foto Profil Wali Kelas</span>
                  </div>
                  <PhotoUploader
                    value={formData.homeroomTeacherPhotoUrl || ''}
                    onChange={(url) =>
                      setFormData({ ...formData, homeroomTeacherPhotoUrl: url })
                    }
                    type="avatar"
                    shape="circle"
                    placeholderText="Pilih foto profil wali kelas"
                    helperText="Foto ini tampil pada profil wali kelas dan dokumen akademik."
                  />
                </div>

                {/* Digital Signature */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4A4036]">
                    <PenTool className="w-4 h-4 text-[#5A7365]" />
                    <span>Unggah Tanda Tangan Digital Wali Kelas</span>
                  </div>
                  <PhotoUploader
                    value={formData.homeroomTeacherSignatureUrl || ''}
                    onChange={(url) =>
                      setFormData({ ...formData, homeroomTeacherSignatureUrl: url })
                    }
                    type="signature"
                    shape="signature"
                    placeholderText="Pilih gambar tanda tangan wali kelas"
                    helperText="Disarankan PNG transparan untuk hasil cetak yang bersih."
                  />

                  {/* Manual Size Sliders for Homeroom Signature */}
                  <div className="bg-white p-3 rounded-xl border border-[#E2DDD5] space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-[#4A4036]">
                      <span>Tinggi TTD Wali Kelas</span>
                      <span className="font-mono">{formData.homeroomSignatureHeight || 65} px</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="110"
                      step="5"
                      value={formData.homeroomSignatureHeight || 65}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          homeroomSignatureHeight: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#5A7365] cursor-pointer"
                    />

                    <div className="flex justify-between font-semibold text-[#4A4036]">
                      <span>Lebar Maksimal TTD</span>
                      <span className="font-mono">{formData.homeroomSignatureWidth || 170} px</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="240"
                      step="10"
                      value={formData.homeroomSignatureWidth || 170}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          homeroomSignatureWidth: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#5A7365] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEPALA SEKOLAH & PENGESAHAN */}
        {activeTab === 'kepsek' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-5">
              <div className="border-b border-[#EAE4D9] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#2C241E] flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-[#5A7365]" />
                    <span>Pejabat Penandatangan & Kepala Sekolah</span>
                  </h2>
                  <p className="text-xs text-[#7A6E5E] mt-0.5">
                    Data kepala sekolah untuk titimangsa pengesahan rapor dan tanda tangan resmi.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Nama Kepala Sekolah (dengan Gelar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterName}
                    onChange={(e) =>
                      setFormData({ ...formData, headmasterName: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none font-semibold text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    Nomor Baku Muhammadiyah (NBM) / NIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterNbm}
                    onChange={(e) =>
                      setFormData({ ...formData, headmasterNbm: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl focus:ring-2 focus:ring-[#7E9685] outline-none font-mono text-[#2C241E]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showHeadmasterSignature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showHeadmasterSignature: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#5A7365] rounded-sm accent-[#5A7365]"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-[#2C241E]">
                      Tampilkan gambar tanda tangan digital Kepala Sekolah pada cetakan Rapor PTS
                    </span>
                  </label>
                </div>
              </div>

              {/* Photos & Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-[#EAE4D9]">
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4A4036]">
                    <Camera className="w-4 h-4 text-[#5A7365]" />
                    <span>Unggah Foto Profil Kepala Sekolah</span>
                  </div>
                  <PhotoUploader
                    value={formData.headmasterPhotoUrl || ''}
                    onChange={(url) =>
                      setFormData({ ...formData, headmasterPhotoUrl: url })
                    }
                    type="avatar"
                    shape="circle"
                    placeholderText="Pilih foto profil kepala sekolah"
                    helperText="Foto resmi kepala sekolah untuk profil lembaga."
                  />
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4A4036]">
                    <PenTool className="w-4 h-4 text-[#5A7365]" />
                    <span>Unggah Tanda Tangan Digital Kepala Sekolah</span>
                  </div>
                  <PhotoUploader
                    value={formData.headmasterSignatureUrl}
                    onChange={(url) =>
                      setFormData({ ...formData, headmasterSignatureUrl: url })
                    }
                    type="signature"
                    shape="signature"
                    placeholderText="Pilih gambar tanda tangan kepala sekolah"
                    helperText="Format gambar transparan PNG untuk lembar cetak rapor."
                  />

                  {/* Size adjustments */}
                  <div className="bg-white p-3 rounded-xl border border-[#E2DDD5] space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-[#4A4036]">
                      <span>Tinggi TTD Kepala Sekolah</span>
                      <span className="font-mono">{formData.headmasterSignatureHeight || 85} px</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="140"
                      step="5"
                      value={formData.headmasterSignatureHeight || 85}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          headmasterSignatureHeight: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#5A7365] cursor-pointer"
                    />

                    <div className="flex justify-between font-semibold text-[#4A4036]">
                      <span>Lebar Maksimal TTD</span>
                      <span className="font-mono">{formData.headmasterSignatureWidth || 230} px</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="280"
                      step="10"
                      value={formData.headmasterSignatureWidth || 230}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          headmasterSignatureWidth: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#5A7365] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[#7A6E5E]">
            Data disimpan aman ke IndexedDB & sinkron otomatis dengan lembar rapor.
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-2xl shadow-md transition-all text-xs sm:text-sm"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Perubahan Disimpan ke Database!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Data Sekolah</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Header Layout Modal */}
      <HeaderLayoutEditorModal
        isOpen={headerModalOpen}
        onClose={() => setHeaderModalOpen(false)}
      />
    </div>
  );
};
