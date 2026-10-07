import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Layout,
  Image as ImageIcon,
  Type,
  Palette,
  Eye,
  Sparkles,
} from 'lucide-react';
import { HeaderLayoutSettings } from '../../types';
import { PhotoUploader } from '../common/PhotoUploader';

interface HeaderLayoutEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeaderLayoutEditorModal: React.FC<HeaderLayoutEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { schoolProfile, updateSchoolProfile, showToast } = useApp();

  const currentLayout: HeaderLayoutSettings = schoolProfile.headerLayout || {
    position: 'left',
    logoHeight: 42,
    logoGap: 12,
    showTitle: true,
    customTitle: 'MUHIBA RAPORT',
    customSubtitle: schoolProfile.name,
    showBadge: true,
    badgeText: 'Kurikulum Merdeka',
    secondaryLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png',
    showSecondaryLogo: false,
    secondaryLogoHeight: 40,
    headerTheme: 'vintage-cream',
  };

  const [formData, setFormData] = useState<HeaderLayoutSettings>({ ...currentLayout });
  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'theme'>('layout');

  if (!isOpen) return null;

  const handleSave = () => {
    updateSchoolProfile({ headerLayout: formData });
    showToast('success', 'Tata letak logo dan header berhasil diperbarui!');
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: HeaderLayoutSettings = {
      position: 'left',
      logoHeight: 42,
      logoGap: 12,
      showTitle: true,
      customTitle: 'MUHIBA RAPORT',
      customSubtitle: schoolProfile.name,
      showBadge: true,
      badgeText: 'Kurikulum Merdeka',
      secondaryLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png',
      showSecondaryLogo: false,
      secondaryLogoHeight: 40,
      headerTheme: 'vintage-cream',
    };
    setFormData(defaultSettings);
    updateSchoolProfile({ headerLayout: defaultSettings });
    showToast('info', 'Tata letak header dikembalikan ke standar awal.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#DDD6C9] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#3E342B]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-[#F2EDE4] border-b border-[#DDD6C9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5A7365] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C241E]">
                Pengaturan Tata Letak Logo & Header Manual
              </h2>
              <p className="text-xs text-[#7A7063]">
                Sesuaikan posisi, ukuran tinggi, jarak, teks judul, serta logo sekunder secara visual.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7063] hover:text-[#2C241E] hover:bg-[#E5DFD5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 bg-[#EBE5DA] border-b border-[#DDD6C9]">
          <div className="text-[11px] font-bold text-[#6B6053] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#5A7365]" />
            <span>Pratinjau Langsung Header Navigasi</span>
          </div>

          <div
            className={`p-3 rounded-2xl border transition-all ${
              formData.headerTheme === 'vintage-sage'
                ? 'bg-[#EBF1ED] border-[#C3D4C9]'
                : formData.headerTheme === 'vintage-parchment'
                ? 'bg-[#F4EFE6] border-[#D8CEBD]'
                : formData.headerTheme === 'vintage-clean'
                ? 'bg-white border-[#E2DDD5]'
                : 'bg-[#FCFAF7] border-[#DFD8CC]'
            }`}
          >
            <div
              className={`flex items-center w-full ${
                formData.position === 'center'
                  ? 'justify-center text-center flex-col sm:flex-row'
                  : formData.position === 'right'
                  ? 'justify-end flex-row-reverse text-right'
                  : formData.position === 'dual'
                  ? 'justify-between'
                  : 'justify-start'
              }`}
              style={{ gap: `${formData.logoGap}px` }}
            >
              {/* Primary Logo */}
              <div
                className="shrink-0 flex items-center justify-center transition-all"
                style={{ height: `${formData.logoHeight}px` }}
              >
                <img
                  src={schoolProfile.logoUrl}
                  alt="Logo Utama"
                  style={{ height: `${formData.logoHeight}px` }}
                  className="object-contain max-w-[140px]"
                />
              </div>

              {/* Title & Subtitle */}
              {formData.showTitle && (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#2D3A34]">
                      {formData.customTitle || 'MUHIBA RAPORT'}
                    </span>
                    {formData.showBadge && (
                      <span className="text-[10px] bg-[#5A7365]/15 text-[#375244] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {formData.badgeText || 'Kurikulum Merdeka'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6B6053] font-medium truncate max-w-[320px]">
                    {formData.customSubtitle || schoolProfile.name}
                  </div>
                </div>
              )}

              {/* Secondary Logo (for dual layout) */}
              {formData.position === 'dual' && formData.showSecondaryLogo && (
                <div
                  className="shrink-0 flex items-center justify-center transition-all ml-auto"
                  style={{ height: `${formData.secondaryLogoHeight || 40}px` }}
                >
                  <img
                    src={formData.secondaryLogoUrl}
                    alt="Logo Sekunder"
                    style={{ height: `${formData.secondaryLogoHeight || 40}px` }}
                    className="object-contain max-w-[120px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#DDD6C9] bg-[#F7F4EE] px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'layout'
                ? 'bg-[#FAF8F5] text-[#2C241E] border-t border-x border-[#DDD6C9] -mb-[1px]'
                : 'text-[#7A7063] hover:text-[#2C241E]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Tata Letak & Posisi</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'content'
                ? 'bg-[#FAF8F5] text-[#2C241E] border-t border-x border-[#DDD6C9] -mb-[1px]'
                : 'text-[#7A7063] hover:text-[#2C241E]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Teks & Judul</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'theme'
                ? 'bg-[#FAF8F5] text-[#2C241E] border-t border-x border-[#DDD6C9] -mb-[1px]'
                : 'text-[#7A7063] hover:text-[#2C241E]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Warna & Tema Vintage</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {activeTab === 'layout' && (
            <div className="space-y-5">
              {/* Position selector */}
              <div>
                <label className="block text-xs font-bold text-[#4A4036] uppercase tracking-wider mb-2">
                  Penempatan Logo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'left', label: 'Rata Kiri (Klasik)', icon: '◀ Kiri' },
                    { id: 'center', label: 'Tengah (Centered)', icon: '▲ Tengah' },
                    { id: 'right', label: 'Rata Kanan', icon: '▶ Kanan' },
                    { id: 'dual', label: 'Split (Dua Logo)', icon: '◀ ▶ Ganda' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          position: pos.id as any,
                          showSecondaryLogo: pos.id === 'dual' ? true : formData.showSecondaryLogo,
                        })
                      }
                      className={`p-3 rounded-xl border text-center transition-all font-semibold text-xs ${
                        formData.position === pos.id
                          ? 'border-[#5A7365] bg-[#E8EFEA] text-[#2C4135] shadow-xs'
                          : 'border-[#DDD6C9] bg-white text-[#6B6053] hover:bg-[#F5F2EB]'
                      }`}
                    >
                      <div className="text-sm font-bold mb-1">{pos.icon}</div>
                      <div>{pos.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Height Slider */}
              <div className="bg-white p-4 rounded-2xl border border-[#DDD6C9] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#4A4036]">
                  <span>Ukuran Tinggi Logo Utama (Height)</span>
                  <span className="font-mono bg-[#EFECE5] px-2 py-0.5 rounded text-[#2C241E]">
                    {formData.logoHeight} px
                  </span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="76"
                  step="2"
                  value={formData.logoHeight}
                  onChange={(e) =>
                    setFormData({ ...formData, logoHeight: Number(e.target.value) })
                  }
                  className="w-full accent-[#5A7365] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#8C8275]">
                  <span>Kecil (28px)</span>
                  <span>Standar (42px)</span>
                  <span>Besar (76px)</span>
                </div>
              </div>

              {/* Logo Gap Slider */}
              <div className="bg-white p-4 rounded-2xl border border-[#DDD6C9] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#4A4036]">
                  <span>Jarak Spasi Antar Logo & Teks (Gap)</span>
                  <span className="font-mono bg-[#EFECE5] px-2 py-0.5 rounded text-[#2C241E]">
                    {formData.logoGap} px
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="36"
                  step="2"
                  value={formData.logoGap}
                  onChange={(e) =>
                    setFormData({ ...formData, logoGap: Number(e.target.value) })
                  }
                  className="w-full accent-[#5A7365] cursor-pointer"
                />
              </div>

              {/* Secondary Logo (Optional) */}
              <div className="bg-white p-4 rounded-2xl border border-[#DDD6C9] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#4A4036]">Logo Tambahan / Sekunder</span>
                    <p className="text-[11px] text-[#7A7063]">
                      Contoh: Lambang Tut Wuri Handayani, Majelis Dikdasmen, atau logo yayasan.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showSecondaryLogo)}
                      onChange={(e) =>
                        setFormData({ ...formData, showSecondaryLogo: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A7365]"></div>
                  </label>
                </div>

                {formData.showSecondaryLogo && (
                  <div className="pt-2 border-t border-[#EAE4D9] space-y-3">
                    <PhotoUploader
                      label="Unggah File Logo Sekunder"
                      type="logo"
                      value={formData.secondaryLogoUrl}
                      onChange={(url) => setFormData({ ...formData, secondaryLogoUrl: url })}
                      helperText="Unggah logo PNG dengan latar transparan"
                    />

                    <div>
                      <div className="flex justify-between text-xs text-[#5A5043] font-semibold mb-1">
                        <span>Tinggi Logo Sekunder</span>
                        <span className="font-mono">{formData.secondaryLogoHeight || 40} px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="64"
                        step="2"
                        value={formData.secondaryLogoHeight || 40}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryLogoHeight: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#5A7365] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-[#DDD6C9]">
                <input
                  type="checkbox"
                  checked={formData.showTitle}
                  onChange={(e) => setFormData({ ...formData, showTitle: e.target.checked })}
                  className="w-4 h-4 text-[#5A7365] rounded-sm accent-[#5A7365]"
                />
                <span className="text-xs font-bold text-[#3E342B]">
                  Tampilkan Teks Judul & Subjudul di Header
                </span>
              </label>

              <div>
                <label className="block text-xs font-bold text-[#4A4036] mb-1">
                  Judul Utama Header
                </label>
                <input
                  type="text"
                  value={formData.customTitle}
                  onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                  placeholder="MUHIBA RAPORT"
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl font-bold text-[#2C241E] focus:ring-2 focus:ring-[#7E9685] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A4036] mb-1">
                  Subjudul Header
                </label>
                <input
                  type="text"
                  value={formData.customSubtitle}
                  onChange={(e) => setFormData({ ...formData, customSubtitle: e.target.value })}
                  placeholder={schoolProfile.name}
                  className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl text-xs font-medium text-[#4A4036] focus:ring-2 focus:ring-[#7E9685] outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#DDD6C9] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showBadge}
                    onChange={(e) => setFormData({ ...formData, showBadge: e.target.checked })}
                    className="w-4 h-4 text-[#5A7365] rounded-sm accent-[#5A7365]"
                  />
                  <span className="text-xs font-bold text-[#3E342B]">
                    Tampilkan Badge Kurikulum
                  </span>
                </label>

                {formData.showBadge && (
                  <div>
                    <label className="block text-xs font-bold text-[#4A4036] mb-1">
                      Teks Badge
                    </label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      placeholder="Kurikulum Merdeka"
                      className="w-full px-3 py-2 bg-white border border-[#D5CDBD] rounded-xl text-xs font-semibold text-[#2C241E] focus:ring-2 focus:ring-[#7E9685] outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#4A4036] uppercase tracking-wider mb-2">
                Pilih Skema Warna Vintage Header
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'vintage-cream',
                    name: 'Vintage Cream (Gading Hangat)',
                    desc: 'Nuansa kertas gading lembut dengan aksen kayu dan daun zaitun.',
                    bg: 'bg-[#FCFAF7] border-[#DFD8CC]',
                  },
                  {
                    id: 'vintage-sage',
                    name: 'Vintage Sage (Hijau Sage Pastel)',
                    desc: 'Warna sage botanical yang menenangkan, bernuansa akademis klasik.',
                    bg: 'bg-[#EBF1ED] border-[#C3D4C9]',
                  },
                  {
                    id: 'vintage-parchment',
                    name: 'Antique Parchment (Linen Kuno)',
                    desc: 'Tekstur warna perkamen arsip klasik dengan kontras hangat.',
                    bg: 'bg-[#F4EFE6] border-[#D8CEBD]',
                  },
                  {
                    id: 'vintage-clean',
                    name: 'Modern Vintage Minimalist',
                    desc: 'Latar putih gading bersih dengan garis pembatas teratur.',
                    bg: 'bg-white border-[#E2DDD5]',
                  },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, headerTheme: th.id as any })
                    }
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 ${th.bg} ${
                      formData.headerTheme === th.id
                        ? 'ring-2 ring-[#5A7365] shadow-xs'
                        : 'hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#2C241E]">{th.name}</span>
                      {formData.headerTheme === th.id && (
                        <Check className="w-4 h-4 text-[#5A7365]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A7063] leading-relaxed">{th.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F2EDE4] border-t border-[#DDD6C9] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#6B6053] hover:text-[#2C241E] hover:bg-[#E2DDD5] rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6B6053] hover:text-[#2C241E] rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Tata Letak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
