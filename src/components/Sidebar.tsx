import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  ArrowLeftRight, 
  Settings, 
  FileCheck2, 
  X,
  Sparkles,
  School,
  Clock
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalBooks: number;
    activeLoans: number;
    totalStudents: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  stats,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Akademik',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'books' as ActiveTab,
      label: 'Katalog & Skripsi/TA',
      icon: BookOpen,
      badge: stats.totalBooks,
    },
    {
      id: 'students' as ActiveTab,
      label: 'Mahasiswa & KTM',
      icon: GraduationCap,
      badge: stats.totalStudents,
    },
    {
      id: 'loans' as ActiveTab,
      label: 'Sirkulasi & Denda',
      icon: ArrowLeftRight,
      badge: stats.activeLoans > 0 ? `${stats.activeLoans} Aktif` : null,
      highlightBadge: stats.activeLoans > 0,
    },
    {
      id: 'clearance' as ActiveTab,
      label: 'Layanan Bebas Pustaka',
      icon: FileCheck2,
      badge: 'Wisuda',
      highlightBadge: false,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Pengaturan & Utilitas',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* University Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">UniLib Kampus</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">Univ</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">UPT Perpustakaan & Riset Mahasiswa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Portal Perpustakaan
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      item.highlightBadge
                        ? isActive
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isActive
                        ? 'bg-indigo-700/80 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Student Policy Box */}
        <div className="p-4 mx-4 mb-3 rounded-xl bg-linear-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h6 className="text-xs font-semibold text-slate-200">Ketentuan Sirkulasi Kampus</h6>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside leading-relaxed">
            <li>Mahasiswa Reguler: Maks. 3 buku</li>
            <li>Mahasiswa Skripsi/TA: Maks. 5 buku</li>
            <li>Denda telat: Rp 1.000 / hari / buku</li>
          </ul>
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Ruang Baca Buka
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> 08.00-17.00
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-center text-[11px] text-slate-400">
          UniLib &bull; Sistem Akademik Terpadu
        </div>
      </aside>
    </>
  );
};
