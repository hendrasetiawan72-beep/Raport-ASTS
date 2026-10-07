import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DatabaseBackup,
  Download,
  Upload,
  RotateCcw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Database,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { listDatabaseSnapshots } from '../../db/database';

export const BackupRestoreView: React.FC = () => {
  const {
    exportBackupJson,
    restoreBackupJson,
    resetToDefaultData,
    dbStatus,
    dbStats,
    forceSaveToDatabase,
    createDbSnapshot,
    restoreDbSnapshot,
    storageUsageKb,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<Array<{ id: string; name: string; timestamp: string }>>([]);
  const [snapshotName, setSnapshotName] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  const loadSnapshots = async () => {
    const list = await listDatabaseSnapshots();
    setSnapshots(list);
  };

  useEffect(() => {
    loadSnapshots();
  }, []);

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MUHIBA_RAPORT_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Cadangan data sistem berhasil diunduh dalam format JSON.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (
        confirm(
          'Apakah Anda yakin ingin memulihkan cadangan ini? Data saat ini akan digantikan oleh isi file cadangan.'
        )
      ) {
        const success = restoreBackupJson(content);
        if (success) {
          await forceSaveToDatabase();
          setRestoreStatus('Data berhasil dipulihkan!');
          setTimeout(() => setRestoreStatus(null), 3000);
          loadSnapshots();
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;

    setIsCreatingSnapshot(true);
    try {
      await createDbSnapshot(snapshotName.trim());
      setSnapshotName('');
      loadSnapshots();
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestoreSnapshot = async (id: string, name: string) => {
    if (confirm(`Pulihkan data dari snapshot "${name}"? Data aktif saat ini akan diperbarui.`)) {
      await restoreDbSnapshot(id);
      showToast('success', `Data berhasil dipulihkan dari snapshot "${name}".`);
    }
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        'PERINGATAN: Anda akan mengembalikan database ke dataset default awal (Kelas X TO 4, 35 Siswa, dan Mata Pelajaran Standar). Semua perubahan kustom yang belum dibackup akan hilang. Lanjutkan?'
      )
    ) {
      resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#3D332A]">
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD6C9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E5E]">
            <DatabaseBackup className="w-4 h-4 text-[#5A7365]" />
            <span>14. Manajemen Basis Data & Snapshot</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] mt-1 font-serif">
            Keamanan Data & Pencadangan Permanen
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6E5E] mt-1">
            Data tersimpan aman pada database IndexedDB browser dengan kapasitas tanpa batas kuota dan snapshot pemulihan.
          </p>
        </div>
      </div>

      {/* Storage Information Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#2C4135] flex items-center justify-center shrink-0 border border-[#D0DFD5]">
            <Database className="w-6 h-6 text-[#5A7365]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#7A6E5E] uppercase tracking-wider">
              Mesin Database Terhubung
            </div>
            <div className="text-base font-bold text-[#2C241E] mt-0.5">
              IndexedDB Raport ASTS v2 (Aman & Permanen)
            </div>
            <div className="text-xs text-[#6B6053]">
              {dbStats ? (
                <span>
                  Total {dbStats.totalRecords} rekaman data • Estimasi ukuran ~{dbStats.approxSizeKb} KB • Tersimpan otomatis
                </span>
              ) : (
                'Database terhubung dan siap digunakan.'
              )}
            </div>
          </div>
        </div>

        <button
          onClick={forceSaveToDatabase}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Paksa Simpan Sekarang</span>
        </button>
      </div>

      {/* Database Snapshots Section */}
      <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
          <h2 className="text-sm font-bold text-[#2C241E] flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#5A7365]" />
            <span>Titik Pemulihan (Database Snapshots)</span>
          </h2>
          <span className="text-[11px] text-[#7A6E5E]">
            {snapshots.length} Snapshot Tersimpan
          </span>
        </div>

        {/* Create Snapshot Form */}
        <form onSubmit={handleCreateSnapshot} className="flex gap-2">
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Beri nama snapshot (misal: Sebelum Impor Leger X-1)..."
            className="flex-1 px-3 py-2 bg-[#F9F7F2] border border-[#D5CDBD] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7E9685] text-[#2C241E]"
          />
          <button
            type="submit"
            disabled={!snapshotName.trim() || isCreatingSnapshot}
            className="px-4 py-2 bg-[#42594D] hover:bg-[#34463C] text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-colors shrink-0"
          >
            {isCreatingSnapshot ? 'Menyimpan...' : 'Buat Snapshot'}
          </button>
        </form>

        {/* Snapshot List */}
        {snapshots.length > 0 ? (
          <div className="divide-y divide-[#EAE4D9] border border-[#EAE4D9] rounded-2xl overflow-hidden">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3 bg-[#FCFAF7] hover:bg-[#F7F4EE] flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <div className="font-bold text-[#2C241E]">{snap.name}</div>
                  <div className="text-[11px] text-[#7A6E5E] font-mono">
                    {new Date(snap.timestamp).toLocaleString('id-ID')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestoreSnapshot(snap.id, snap.name)}
                  className="px-3 py-1 bg-white hover:bg-[#E8EFEA] text-[#3B5446] border border-[#DDD6C9] font-bold rounded-lg text-xs transition-colors"
                >
                  Pulihkan
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-[#8C8071] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD6C9]">
            Belum ada snapshot database yang dibuat. Buat snapshot untuk menyimpan status data penting sewaktu-waktu.
          </div>
        )}
      </div>

      {/* JSON File Export & Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export JSON */}
        <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF2EB] text-[#B86B56] flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2C241E]">
              Ekspor File Cadangan JSON
            </h3>
            <p className="text-xs text-[#7A6E5E] mt-1 leading-relaxed">
              Unduh seluruh konfigurasi sekolah, profil siswa, nilai, presensi, dan ekstrakurikuler ke komputer.
            </p>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B86B56] hover:bg-[#A35946] text-white font-bold rounded-xl text-xs transition-all shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan (.json)</span>
          </button>
        </div>

        {/* Import JSON */}
        <div className="bg-white p-6 rounded-3xl border border-[#DDD6C9] shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] text-[#5A7365] flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2C241E]">
              Pulihkan dari File Cadangan JSON
            </h3>
            <p className="text-xs text-[#7A6E5E] mt-1 leading-relaxed">
              Unggah file JSON cadangan untuk memulihkan seluruh data secara instan.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5A7365] hover:bg-[#465B4F] text-white font-bold rounded-xl text-xs transition-all shadow-2xs"
          >
            <Upload className="w-4 h-4" />
            <span>Pilih File Cadangan</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset to Default */}
      <div className="p-5 rounded-3xl bg-[#FDF7F7] border border-[#F2D7D7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="font-bold text-[#9C3A3A] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#9C3A3A]" />
            <span>Kembalikan ke Setelan Awal</span>
          </div>
          <p className="text-[#854D4D] mt-0.5">
            Mereset seluruh data ke data sampel bawaan SMK Muhammadiyah Bawang.
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FBEBE8] text-[#9C3A3A] border border-[#F2D7D7] font-bold rounded-xl text-xs transition-colors shrink-0 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Default Awal</span>
        </button>
      </div>
    </div>
  );
};
