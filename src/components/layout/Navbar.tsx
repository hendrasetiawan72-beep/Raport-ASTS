import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  Calendar,
  Users,
  Menu,
  X,
  Sliders,
  Database,
  Check,
  Sparkles,
} from 'lucide-react';
import { HeaderLayoutEditorModal } from './HeaderLayoutEditorModal';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const {
    schoolProfile,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    classes,
    selectedClassId,
    setSelectedClassId,
    setActiveMenu,
    dbStatus,
  } = useApp();

  const [headerModalOpen, setHeaderModalOpen] = useState(false);

  const layout = schoolProfile.headerLayout || {
    position: 'left',
    logoHeight: 40,
    logoGap: 12,
    showTitle: true,
    customTitle: 'MUHIBA RAPORT',
    customSubtitle: schoolProfile.name,
    showBadge: true,
    badgeText: 'Kurikulum Merdeka',
    secondaryLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png',
    showSecondaryLogo: false,
    secondaryLogoHeight: 38,
    headerTheme: 'vintage-cream',
  };

  const getThemeClass = () => {
    switch (layout.headerTheme) {
      case 'vintage-sage':
        return 'bg-[#EBF1ED]/95 border-[#C8D6CD] text-[#2C3B32]';
      case 'vintage-parchment':
        return 'bg-[#F5EFE6]/95 border-[#DCD2C3] text-[#3D332A]';
      case 'vintage-clean':
        return 'bg-white/95 border-slate-200 text-[#2C241E]';
      default:
        return 'bg-white/95 border-slate-200 text-[#2C241E]';
    }
  };

  return (
    <>
      <header
        className={`no-print sticky top-0 z-30 backdrop-blur-md border-b px-4 lg:px-6 py-2 transition-all ${getThemeClass()}`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Brand/Logo Area */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-[#6B6053] hover:text-[#2C241E] hover:bg-[#EFECE5] rounded-xl lg:hidden transition-colors"
              title="Buka Navigasi"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Configurable Header Branding Layout */}
            <div
              onClick={() => setActiveMenu('dashboard')}
              className={`flex items-center cursor-pointer group transition-all select-none ${
                layout.position === 'center'
                  ? 'sm:items-center'
                  : layout.position === 'right'
                  ? 'flex-row-reverse'
                  : 'items-center'
              }`}
              style={{ gap: `${layout.logoGap || 12}px` }}
            >
              {/* Main School Logo */}
              <div
                className="shrink-0 flex items-center justify-center p-0.5 rounded-xl transition-transform group-hover:scale-105"
                style={{ height: `${layout.logoHeight || 40}px` }}
              >
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolProfile.name}
                  style={{ height: `${layout.logoHeight || 40}px` }}
                  className="object-contain max-w-[130px]"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Title & Badge */}
              {layout.showTitle && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#2C3B32] font-serif">
                      {layout.customTitle || 'MUHIBA RAPORT'}
                    </span>
                    {layout.showBadge && (
                      <span className="text-[10px] bg-[#5A7365]/15 text-[#375244] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                        {layout.badgeText || 'Kurikulum Merdeka'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#7A6E5E] hidden sm:block truncate max-w-[300px]">
                    {layout.customSubtitle || schoolProfile.name}
                  </div>
                </div>
              )}

              {/* Secondary Logo (Optional Split) */}
              {layout.showSecondaryLogo && layout.secondaryLogoUrl && (
                <div
                  className="shrink-0 hidden md:flex items-center justify-center p-0.5 ml-2"
                  style={{ height: `${layout.secondaryLogoHeight || 38}px` }}
                >
                  <img
                    src={layout.secondaryLogoUrl}
                    alt="Logo Sekunder"
                    style={{ height: `${layout.secondaryLogoHeight || 38}px` }}
                    className="object-contain max-w-[100px]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Selectors, Quick Actions & Layout Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Header Layout Editor Trigger */}
            <button
              onClick={() => setHeaderModalOpen(true)}
              type="button"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#5A7365] bg-[#E8EFEA]/80 hover:bg-[#DCE6DF] border border-[#C5D7CC] rounded-xl transition-all shadow-2xs"
              title="Sesuaikan tata letak logo, ukuran, dan teks header"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Layout Header</span>
            </button>

            {/* Database indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/70 border border-[#DDD6C9] text-[11px] font-semibold text-[#5A7365]"
              title="Database IndexedDB tersimpan otomatis"
            >
              <span className="w-2 h-2 rounded-full bg-[#5A7365] inline-block animate-pulse"></span>
              <Database className="w-3 h-3 text-[#5A7365]" />
              <span>IndexedDB Aktif</span>
            </div>

            {/* Period Selector */}
            <div className="flex items-center bg-white/80 rounded-xl px-2.5 py-1.5 border border-[#DDD6C9] shadow-2xs">
              <Calendar className="w-4 h-4 text-[#5A7365] mr-1.5 shrink-0" />
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-[#3D332A] outline-none cursor-pointer pr-1"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.academicYear} {p.semester} ({p.assessmentType})
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selector */}
            <div className="flex items-center bg-white/80 rounded-xl px-2.5 py-1.5 border border-[#DDD6C9] shadow-2xs">
              <Users className="w-4 h-4 text-[#B86B56] mr-1.5 shrink-0" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-[#2C241E] outline-none cursor-pointer pr-1"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fast Action: Print Report */}
            <button
              onClick={() => setActiveMenu('raport')}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5A7365] hover:bg-[#465B4F] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor</span>
            </button>
          </div>
        </div>
      </header>

      <HeaderLayoutEditorModal
        isOpen={headerModalOpen}
        onClose={() => setHeaderModalOpen(false)}
      />
    </>
  );
};
