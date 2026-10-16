import React from 'react';
import { Menu, PlusCircle, ArrowLeftRight, Calendar, School, FileCheck2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenNewLoan: () => void;
  onOpenNewBook: () => void;
  onOpenClearance: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenNewLoan,
  onOpenNewBook,
  onOpenClearance,
}) => {
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Akademik Perpustakaan',
          desc: 'Statistik sirkulasi buku kuliah, skripsi/TA, dan monitoring tanggungan mahasiswa',
        };
      case 'books':
        return {
          title: 'Katalog Pustaka & Repositori Tugas Akhir',
          desc: 'Koleksi buku teks kuliah, skripsi, jurnal ilmiah terakreditasi, dan diktat praktikum',
        };
      case 'students':
        return {
          title: 'Direktori Mahasiswa & Kartu Digital',
          desc: 'Database mahasiswa peminjam berdasarkan NIM, Fakultas, Program Studi, dan status akademik',
        };
      case 'loans':
        return {
          title: 'Sirkulasi Peminjaman & Denda Mahasiswa',
          desc: 'Pencatatan peminjaman buku kuliah, perpanjangan masa skripsi, dan denda keterlambatan',
        };
      case 'clearance':
        return {
          title: 'Layanan Surat Bebas Pustaka Online',
          desc: 'Verifikasi tanggungan peminjaman dan denda mahasiswa untuk syarat Yudisium & Wisuda',
        };
      case 'settings':
        return {
          title: 'Pengaturan & Backup Data Kampus',
          desc: 'Penyimpanan lokal, unduh data cadangan JSON, dan cetak rekap sirkulasi semester',
        };
      default:
        return { title: 'UniLib Kampus', desc: 'Sistem Perpustakaan Mahasiswa Universitas' };
    }
  };

  const headerInfo = getHeaderTitle();

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {headerInfo.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {headerInfo.desc}
            </p>
          </div>
        </div>

        {/* Right: Date & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 text-slate-600 text-xs font-medium border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>{todayStr}</span>
          </div>

          <button
            onClick={onOpenClearance}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs transition-all shadow-xs cursor-pointer"
            title="Cek Surat Bebas Pustaka"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Bebas Pustaka</span>
          </button>

          <button
            onClick={onOpenNewLoan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-200 font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xs:inline">Pinjam Buku</span>
          </button>

          <button
            onClick={onOpenNewBook}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Koleksi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
