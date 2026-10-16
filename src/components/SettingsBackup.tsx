import React from 'react';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  HardDrive,
  Printer,
  School,
  GraduationCap
} from 'lucide-react';
import { Book, Student, LoanTransaction } from '../types';

interface SettingsBackupProps {
  books: Book[];
  students: Student[];
  loans: LoanTransaction[];
  onResetData: () => void;
}

export const SettingsBackup: React.FC<SettingsBackupProps> = ({
  books,
  students,
  loans,
  onResetData,
}) => {
  // Export JSON
  const handleExportJSON = () => {
    const data = {
      institution: 'Universitas Pustaka Utama',
      system: 'UniLib - Sistem Manajemen Perpustakaan Mahasiswa',
      exportDate: new Date().toISOString(),
      books,
      students,
      loans,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unilib-kampus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* System Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Repositori Data Perpustakaan Universitas</h3>
            <p className="text-xs text-slate-500">Pusat penyimpanan lokal terpadu (HTML5 LocalStorage)</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Koleksi Akademik</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{books.length} Judul</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Buku teks, skripsi, & jurnal riset
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Mahasiswa Terdaftar</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{students.length} Mahasiswa</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {students.filter((s) => s.status !== 'Cuti Akademik').length} berstatus aktif sirkulasi
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Log Sirkulasi</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{loans.length} Transaksi</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Peminjaman & pengembalian buku
            </p>
          </div>
        </div>

        <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-emerald-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Data tersimpan aman di peramban web lokal. Tidak akan hilang saat halaman dimuat ulang atau dibuka kembali.
          </span>
        </div>
      </div>

      {/* Backup and Print */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Cadangkan & Rekapitulasi Akademik</h3>
            <p className="text-xs text-slate-500">Unduh data pustaka atau cetak laporan sirkulasi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Unduh Cadangan JSON</h4>
              <p className="text-xs text-slate-500 mt-1">
                Ekspor seluruh data buku kuliah, skripsi, direktori mahasiswa, dan riwayat peminjaman dalam berkas JSON.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Cadangan Kampus</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Cetak Laporan Rekapitulasi</h4>
              <p className="text-xs text-slate-500 mt-1">
                Cetak atau unduh dokumen PDF laporan sirkulasi peminjaman buku semester ini.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Rekap Sirkulasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-rose-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-rose-950 text-base">Atur Ulang ke Data Demo Kampus</h3>
            <p className="text-xs text-rose-700">Kembalikan data ke set awal perpustakaan universitas</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
          Mengembalikan data contoh perpustakaan universitas (buku teks kuliah, repositori skripsi TA, mahasiswa berbagai fakultas, dan contoh sirkulasi peminjaman).
        </p>

        <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</span>
          <button
            onClick={onResetData}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Demo Kampus Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
