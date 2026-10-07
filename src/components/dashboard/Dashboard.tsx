import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  DoorOpen,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Edit3,
  TableProperties,
  Printer,
  Sparkles,
  Trophy,
  Award,
  Building2,
  Database,
  Sliders,
  Upload,
  UserCheck,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    schoolProfile,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    classes,
    selectedClassId,
    setSelectedClassId,
    students,
    subjects,
    grades,
    classStudents,
    selectedClass,
    currentPeriod,
    setActiveMenu,
    getClassRankings,
    dbStatus,
    dbStats,
  } = useApp();

  const activeSubjects = subjects.filter((s) => s.isActive);
  const totalSlots = classStudents.length * activeSubjects.length;

  // Count filled grades in selected class and period
  let filledCount = 0;
  classStudents.forEach((st) => {
    activeSubjects.forEach((sub) => {
      const g = grades.find(
        (x) =>
          x.studentId === st.id &&
          x.subjectId === sub.id &&
          x.periodId === selectedPeriodId
      );
      if (g && typeof g.summativeScore === 'number' && !isNaN(g.summativeScore)) {
        filledCount++;
      }
    });
  });

  const missingCount = Math.max(0, totalSlots - filledCount);
  const completionPercentage = totalSlots > 0 ? Math.round((filledCount / totalSlots) * 100) : 0;

  // Top 3 students
  const rankings = getClassRankings(selectedClassId, selectedPeriodId);
  const topStudents = rankings.filter((r) => r.rank > 0).slice(0, 3);

  return (
    <div className="space-y-6 text-[#3D332A]">
      {/* Top Banner with Vintage Modern Aesthetic */}
      <div className="bg-[#2D3A34] rounded-3xl p-6 sm:p-8 text-[#FAF8F5] shadow-sm border border-[#3E4D46] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B4D45] border border-[#526B60] text-[#DCEAE2] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#E6B87D]" />
              <span>Sistem Rapor & Leger Resmi Kurikulum Merdeka</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-[#FAF8F5]">
              Selamat Datang di {schoolProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#C5D7CE] leading-relaxed">
              Pengelolaan leger nilai, ketidakhadiran, ekstrakurikuler, dan cetak Laporan Hasil Belajar
              Asesmen Sumatif Tengah Semester (PTS) dengan sinkronisasi database aman.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveMenu('leger')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E8EFEA] hover:bg-white text-[#23352A] font-bold rounded-2xl shadow-xs transition-all text-xs sm:text-sm"
            >
              <TableProperties className="w-4 h-4 text-[#486655]" />
              <span>Buka Leger</span>
            </button>
            <button
              onClick={() => setActiveMenu('sekolah')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3B4D45] hover:bg-[#455A51] text-white font-semibold rounded-2xl border border-[#526B60] transition-all text-xs sm:text-sm"
            >
              <UserCheck className="w-4 h-4 text-[#E6B87D]" />
              <span>Edit Wali Kelas</span>
            </button>
            <button
              onClick={() => setActiveMenu('raport')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C07865] hover:bg-[#AD6856] text-white font-bold rounded-2xl shadow-xs transition-all text-xs sm:text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Security & Wali Kelas Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database Status */}
        <div className="bg-white p-5 rounded-3xl border border-[#DDD6C9] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E8EFEA] text-[#2C4135] flex items-center justify-center shrink-0 border border-[#D0DFD5]">
              <Database className="w-5 h-5 text-[#5A7365]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#7A6E5E] uppercase tracking-wider">
                Database Persistent
              </div>
              <div className="text-sm font-bold text-[#2C241E]">
                IndexedDB Terhubung & Aktif
              </div>
              <div className="text-xs text-[#6B6053]">
                {dbStats ? `${dbStats.totalRecords} rekaman tersimpan aman` : 'Penyimpanan terisolasi'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveMenu('backup')}
            className="text-xs font-bold text-[#5A7365] hover:underline"
          >
            Kelola Database →
          </button>
        </div>

        {/* Homeroom Teacher Status */}
        <div className="bg-white p-5 rounded-3xl border border-[#DDD6C9] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F7ECE8] text-[#8C3D2B] flex items-center justify-center shrink-0 border border-[#EED7D0]">
              <UserCheck className="w-5 h-5 text-[#B86B56]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#7A6E5E] uppercase tracking-wider">
                Wali Kelas Aktif
              </div>
              <div className="text-sm font-bold text-[#2C241E]">
                {selectedClass?.homeroomTeacher || schoolProfile.homeroomTeacherName || 'Belum Diatur'}
              </div>
              <div className="text-xs text-[#6B6053]">
                Kelas {selectedClass?.name} • Terhubung ke data sekolah
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveMenu('sekolah')}
            className="text-xs font-bold text-[#B86B56] hover:underline"
          >
            Edit di Data Sekolah →
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <div
          onClick={() => setActiveMenu('siswa')}
          className="bg-white p-5 rounded-3xl border border-[#DDD6C9] shadow-2xs hover:border-[#BDB3A1] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] text-[#2C241E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-[#5A7365]" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8EFEA] text-[#2C4135]">
              {selectedClass?.name}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#2C241E]">{classStudents.length}</div>
            <div className="text-xs font-semibold text-[#7A6E5E] mt-0.5">Peserta Didik</div>
          </div>
        </div>

        {/* Metric 2: Active Subjects */}
        <div
          onClick={() => setActiveMenu('mapel')}
          className="bg-white p-5 rounded-3xl border border-[#DDD6C9] shadow-2xs hover:border-[#BDB3A1] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] text-[#2C241E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-[#B86B56]" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F7ECE8] text-[#8C3D2B]">
              Aktif
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#2C241E]">{activeSubjects.length}</div>
            <div className="text-xs font-semibold text-[#7A6E5E] mt-0.5">Mata Pelajaran</div>
          </div>
        </div>

        {/* Metric 3: Grade Progress */}
        <div
          onClick={() => setActiveMenu('input_nilai')}
          className="bg-white p-5 rounded-3xl border border-[#DDD6C9] shadow-2xs hover:border-[#BDB3A1] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] text-[#2C241E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Edit3 className="w-5 h-5 text-[#5A7365]" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8EFEA] text-[#2C4135]">
              {completionPercentage}%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#2C241E]">{filledCount} / {totalSlots}</div>
            <div className="text-xs font-semibold text-[#7A6E5E] mt-0.5">Nilai Terinput</div>
          </div>
        </div>

        {/* Metric 4: Classes */}
        <div
          onClick={() => setActiveMenu('kelas')}
          className="bg-white p-5 rounded-3xl border border-[#DDD6C9] shadow-2xs hover:border-[#BDB3A1] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] text-[#2C241E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <DoorOpen className="w-5 h-5 text-[#7A6E5E]" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#5C4533]">
              Rombel
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#2C241E]">{classes.length}</div>
            <div className="text-xs font-semibold text-[#7A6E5E] mt-0.5">Rombongan Belajar</div>
          </div>
        </div>
      </div>

      {/* Progress & Top 3 Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Progress overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#2C241E]">
                Kelengkapan Nilai Kelas {selectedClass?.name}
              </h3>
              <p className="text-xs text-[#7A6E5E]">
                Tahun Pelajaran {currentPeriod?.academicYear} Semester {currentPeriod?.semester} ({currentPeriod?.assessmentType})
              </p>
            </div>
            <span className="text-xs font-bold text-[#5A7365]">
              {completionPercentage}% Selesai
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-full bg-[#F2EDE4] rounded-full overflow-hidden p-0.5 border border-[#DDD6C9]">
              <div
                className="h-full bg-linear-to-r from-[#5A7365] to-[#7B9987] rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#7A6E5E]">
              <span>{filledCount} nilai terisi</span>
              <span>{missingCount} belum lengkap</span>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => setActiveMenu('leger')}
              className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5DFD5] hover:border-[#BDB3A1] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <TableProperties className="w-4 h-4 text-[#5A7365]" />
                <span className="text-xs font-bold text-[#2C241E]">Jalur Upload Leger</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#7A6E5E]" />
            </div>

            <div
              onClick={() => setActiveMenu('raport')}
              className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5DFD5] hover:border-[#BDB3A1] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-[#B86B56]" />
                <span className="text-xs font-bold text-[#2C241E]">Pratinjau Raport PTS</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#7A6E5E]" />
            </div>
          </div>
        </div>

        {/* Right Col: Top 3 Students */}
        <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
            <div className="flex items-center gap-2 font-bold text-[#2C241E]">
              <Trophy className="w-4 h-4 text-[#DCA258]" />
              <span>Peringkat Teratas</span>
            </div>
            <button
              onClick={() => setActiveMenu('peringkat')}
              className="text-xs font-bold text-[#5A7365] hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {topStudents.length > 0 ? (
              topStudents.map((st, idx) => (
                <div
                  key={st.studentId}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D9] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        idx === 0
                          ? 'bg-[#FBEED7] text-[#91621E]'
                          : idx === 1
                          ? 'bg-[#EAEFF5] text-[#3D526B]'
                          : 'bg-[#F7EFE8] text-[#8A5230]'
                      }`}
                    >
                      {st.rank}
                    </span>
                    <div>
                      <div className="font-bold text-[#2C241E] truncate max-w-[130px]">
                        {st.student.name}
                      </div>
                      <div className="text-[10px] text-[#7A6E5E]">NIS: {st.student.nis}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-[#5A7365]">
                      {st.averageScore.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8C8071]">Rata-rata</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#8C8071]">
                Belum ada data nilai lengkap untuk kalkulasi peringkat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
