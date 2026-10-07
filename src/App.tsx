import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/layout/ToastContainer';
import { Dashboard } from './components/dashboard/Dashboard';
import { SchoolProfileView } from './components/schools/SchoolProfileView';
import { TeachersView } from './components/teachers/TeachersView';
import { PeriodsView } from './components/periods/PeriodsView';
import { ClassesView } from './components/classes/ClassesView';
import { StudentsView } from './components/students/StudentsView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { GradeEntryView } from './components/grades/GradeEntryView';
import { GradeLedgerView } from './components/leger/GradeLedgerView';
import { ReportPtsView } from './components/report/ReportPtsView';
import { RankingView } from './components/ranking/RankingView';
import { ExcelImportExportView } from './components/excel/ExcelImportExportView';
import { PrintSettingsView } from './components/settings/PrintSettingsView';
import { BackupRestoreView } from './components/backup/BackupRestoreView';

const MainContent: React.FC = () => {
  const { activeMenu } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'sekolah':
        return <SchoolProfileView />;
      case 'guru':
        return <TeachersView />;
      case 'tahun_pelajaran':
        return <PeriodsView />;
      case 'kelas':
        return <ClassesView />;
      case 'siswa':
        return <StudentsView />;
      case 'mapel':
        return <SubjectsView />;
      case 'input_nilai':
        return <GradeEntryView />;
      case 'leger':
        return <GradeLedgerView />;
      case 'raport':
        return <ReportPtsView />;
      case 'peringkat':
        return <RankingView />;
      case 'excel':
        return <ExcelImportExportView />;
      case 'pengaturan_cetak':
        return <PrintSettingsView />;
      case 'backup':
        return <BackupRestoreView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-[#2C241E] selection:bg-[#E8EFEA] selection:text-[#1E2D24] print:bg-white print:p-0 print:m-0">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex w-full print:block print:p-0">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white print:p-0 print:m-0 print:overflow-visible">
          {renderActiveView()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
