import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Printer,
  FileSpreadsheet,
  Award,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Medal,
} from 'lucide-react';
import { exportRankingToExcel } from '../../utils/excel';

export const RankingView: React.FC = () => {
  const {
    schoolProfile,
    selectedClass,
    selectedClassId,
    setSelectedClassId,
    classes,
    currentPeriod,
    selectedPeriodId,
    setSelectedPeriodId,
    periods,
    getClassRankings,
    rankingMethod,
    setRankingMethod,
    includeIncompleteInRanking,
    setIncludeIncompleteInRanking,
    rankingScoreBasis,
    setRankingScoreBasis,
    showToast,
  } = useApp();

  const [topOnly, setTopOnly] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const rankings = useMemo(() => {
    return getClassRankings(selectedClassId, selectedPeriodId);
  }, [
    selectedClassId,
    selectedPeriodId,
    rankingMethod,
    includeIncompleteInRanking,
    rankingScoreBasis,
  ]);

  const displayedRankings = useMemo(() => {
    let list = [...rankings];
    // Sort by rank ascending (ranked first, unranked at the end)
    list.sort((a, b) => {
      if (a.rank === 0 && b.rank !== 0) return 1;
      if (b.rank === 0 && a.rank !== 0) return -1;
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.averageScore - a.averageScore;
    });

    if (topOnly) {
      list = list.filter((r) => r.rank > 0 && r.rank <= 10);
    }

    return list;
  }, [rankings, topOnly]);

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      showToast('success', 'Peringkat kelas berhasil dihitung ulang dari data aktual.');
    }, 400);
  };

  const handleExport = () => {
    if (!selectedClass || !currentPeriod) return;
    exportRankingToExcel(
      schoolProfile.name,
      selectedClass.name,
      currentPeriod,
      rankings
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>11. Rekap Peringkat & Prestasi Siswa</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Penghitungan otomatis berdasarkan rata-rata nilai siswa dengan metode standar evaluasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${recalculating ? 'animate-spin' : ''}`} />
            <span>Hitung Ulang</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Peringkat</span>
          </button>
        </div>
      </div>

      {/* Settings & Filter Card */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Class */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.major}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Tahun & Semester
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  TP {p.academicYear} {p.semester} ({p.assessmentType})
                </option>
              ))}
            </select>
          </div>

          {/* Ranking Method */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Metode Perhitungan Ranking
            </label>
            <select
              value={rankingMethod}
              onChange={(e) => setRankingMethod(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="competition">Competition Ranking (1, 2, 2, 4) — Standar</option>
              <option value="dense">Dense Ranking (1, 2, 2, 3)</option>
            </select>
          </div>
        </div>

        {/* Audit Settings & Filter Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTopOnly(!topOnly)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                topOnly
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Medal className="w-3.5 h-3.5" />
              <span>{topOnly ? 'Menampilkan 10 Terbaik' : 'Tampilkan 10 Terbaik Saja'}</span>
            </button>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={includeIncompleteInRanking}
                onChange={(e) => setIncludeIncompleteInRanking(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>Sertakan siswa nilai belum lengkap dalam peringkat sementara</span>
            </label>
          </div>

          <div className="text-slate-500 text-[11px]">
            * Rata-rata dihitung hanya dari mata pelajaran dengan nilai valid (nilai kosong tidak
            dihitung sebagai nol).
          </div>
        </div>
      </div>

      {/* Printable Ranking Document */}
      <div className="printable-document bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Printable Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={schoolProfile.logoUrl}
                alt="Logo Sekolah"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">
                  REKAPITULASI PERINGKAT KELAS
                </h2>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">
                  {schoolProfile.name}
                </div>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-extrabold text-slate-900 text-sm">
                Kelas: {selectedClass?.name} ({selectedClass?.major})
              </div>
              <div className="text-slate-600">
                Semester: {currentPeriod?.semester} • TP: {currentPeriod?.academicYear}
              </div>
              <div className="text-slate-500">
                Wali Kelas: {selectedClass?.homeroomTeacher}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs sm:text-sm text-left report-table border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
              <tr>
                <th className="py-3 px-3 w-16 text-center border-r border-slate-200">
                  PERINGKAT
                </th>
                <th className="py-3 px-4 w-28 font-mono border-r border-slate-200">NIS</th>
                <th className="py-3 px-4 w-32 font-mono border-r border-slate-200">NISN</th>
                <th className="py-3 px-4 border-r border-slate-200">NAMA LENGKAP SISWA</th>
                <th className="py-3 px-4 text-center w-28 border-r border-slate-200">
                  NILAI RATA-RATA
                </th>
                <th className="py-3 px-3 text-center w-24 border-r border-slate-200">
                  TOTAL SUMATIF
                </th>
                <th className="py-3 px-3 text-center w-28 border-r border-slate-200">
                  MAPEL TERISI
                </th>
                <th className="py-3 px-4 text-center w-36">STATUS NILAI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedRankings.map((item) => {
                const isTop1 = item.rank === 1;
                const isTop3 = item.rank > 0 && item.rank <= 3;

                return (
                  <tr
                    key={item.studentId}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      isTop1 ? 'bg-amber-50/50 font-medium' : isTop3 ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3 px-3 text-center border-r border-slate-200">
                      {item.rank > 0 ? (
                        <div
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-black text-xs ${
                            isTop1
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : item.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : item.rank === 3
                              ? 'bg-amber-700/20 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{item.rank}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 border-r border-slate-200">
                      {item.student.nis}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 border-r border-slate-200">
                      {item.student.nisn || '—'}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{item.student.name}</span>
                        {isTop1 && (
                          <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-1.5 py-0.5 rounded uppercase">
                            Juara 1
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-black text-blue-950 text-sm border-r border-slate-200 bg-blue-50/30">
                      {item.averageScore.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-700 border-r border-slate-200">
                      {item.totalSummative}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-700 border-r border-slate-200">
                      {item.gradedCount} / {item.totalSubjects}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.isComplete ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lengkap</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{item.missingCount} Belum Lengkap</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Formal Signatures on Printable Document */}
        <div className="p-6 bg-slate-50 border-t border-slate-300">
          <div className="grid grid-cols-2 text-xs">
            <div>
              <div className="text-slate-500">Catatan Sekolah:</div>
              <p className="text-[11px] text-slate-600 mt-1 max-w-sm">
                Peringkat dihitung berdasarkan nilai rata-rata mata pelajaran valid sesuai kebijakan
                Kurikulum Merdeka SMK Muhammadiyah Bawang.
              </p>
            </div>

            <div className="text-right">
              <div>
                {schoolProfile.city}, {currentPeriod?.reportDate}
              </div>
              <div className="mt-0.5">Wali Kelas {selectedClass?.name}</div>
              <div className="h-16 flex items-end justify-end">
                <div className="font-bold underline text-slate-900">
                  {selectedClass?.homeroomTeacher}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
