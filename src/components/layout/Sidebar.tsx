import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  CalendarDays,
  DoorOpen,
  Users2,
  BookOpen,
  Edit3,
  TableProperties,
  FileText,
  Trophy,
  FileSpreadsheet,
  Printer,
  DatabaseBackup,
  ChevronRight,
  Database,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const {
    activeMenu,
    setActiveMenu,
    classStudents,
    subjects,
    grades,
    selectedPeriodId,
    dbStatus,
  } = useApp();

  const activeSubjectCount = subjects.filter((s) => s.isActive).length;
  let incompleteCount = 0;
  classStudents.forEach((student) => {
    let studentGraded = 0;
    subjects.filter((s) => s.isActive).forEach((sub) => {
      const g = grades.find(
        (x) =>
          x.studentId === student.id &&
          x.subjectId === sub.id &&
          x.periodId === selectedPeriodId
      );
      if (g && typeof g.summativeScore === 'number') {
        studentGraded++;
      }
    });
    if (studentGraded < activeSubjectCount) {
      incompleteCount++;
    }
  });

  const menuSections = [
    {
      title: 'MENU UTAMA RAPORT',
      items: [
        { id: 'dashboard', label: '1. Dashboard Ringkasan', icon: LayoutDashboard },
        { id: 'input_nilai', label: '8. Input Nilai Cepat', icon: Edit3, badge: 'Cepat' },
        { id: 'leger', label: '9. Leger Nilai & Presensi', icon: TableProperties, highlight: true },
        { id: 'raport', label: '10. Cetak Raport PTS', icon: FileText, highlight: true },
        { id: 'peringkat', label: '11. Peringkat Kelas', icon: Trophy },
      ],
    },
    {
      title: 'DATA MASTER PENDIDIKAN',
      items: [
        { id: 'sekolah', label: '2. Data Sekolah & Wali', icon: Building2, highlight: true },
        { id: 'guru', label: '3. Data Tenaga Pendidik', icon: GraduationCap },
        { id: 'tahun_pelajaran', label: '4. Tahun & Semester', icon: CalendarDays },
        { id: 'kelas', label: '5. Rombel / Kelas', icon: DoorOpen },
        { id: 'siswa', label: '6. Data Peserta Didik', icon: Users2, badge: `${classStudents.length}` },
        { id: 'mapel', label: '7. Mata Pelajaran', icon: BookOpen, badge: `${activeSubjectCount}` },
      ],
    },
    {
      title: 'UTILITAS & PENYIMPANAN',
      items: [
        { id: 'excel', label: '12. Impor & Ekspor Excel', icon: FileSpreadsheet },
        { id: 'pengaturan_cetak', label: '13. Pengaturan Cetak', icon: Printer },
        { id: 'backup', label: '14. Database & Snapshot', icon: DatabaseBackup },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    setActiveMenu(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="no-print fixed inset-0 z-40 bg-[#1E2724]/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`no-print sidebar-container fixed lg:sticky top-0 lg:top-[57px] bottom-0 left-0 z-40 w-64 bg-[#232D2B] text-[#DCE5E0] flex flex-col transition-transform duration-300 ease-in-out border-r border-[#313F3C] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:h-[calc(100vh-57px)]`}
      >
        {/* Navigation scrollable area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar text-xs">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-[#8A9C94] uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all group ${
                        isActive
                          ? 'bg-[#5A7365] text-white shadow-xs font-bold'
                          : 'text-[#C5D2CB] hover:text-white hover:bg-[#2C3835]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-white'
                              : item.highlight
                              ? 'text-[#E5B58E]'
                              : 'text-[#8A9C94] group-hover:text-[#A7C1AF]'
                          }`}
                        />
                        <span className="truncate text-left">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-[#3E5247] text-[#DCE8E1]'
                              : 'bg-[#2E3C38] text-[#9FB5AB] group-hover:bg-[#3B4C47]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info in sidebar with Database status */}
        <div className="p-3 bg-[#1A2220] border-t border-[#313F3C] text-[11px] text-[#8A9C94] space-y-1">
          <div className="flex items-center justify-between text-[#E2EBE6] font-bold">
            <span className="font-serif">SMK MUHIBA</span>
            <span className="text-[10px] text-[#A7C1AF] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5A7365] inline-block"></span>
              IndexedDB v2
            </span>
          </div>
          <div className="text-[10px] text-[#7A8C84] truncate">
            Penyimpanan Aman & Kurikulum Merdeka
          </div>
        </div>
      </aside>
    </>
  );
};
