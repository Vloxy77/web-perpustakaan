import React from 'react';
import { 
  BookOpen, 
  ArrowLeftRight, 
  GraduationCap, 
  School, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Sparkles,
  FileCheck2,
  Bookmark
} from 'lucide-react';
import { Book, Student, LoanTransaction, ActiveTab } from '../types';
import { formatDateIndo, formatRupiah, calculateOverdue } from '../utils/storage';

interface DashboardProps {
  books: Book[];
  students: Student[];
  loans: LoanTransaction[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLoan: () => void;
  onOpenNewBook: () => void;
  onReturnBook: (loanId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  books,
  students,
  loans,
  setActiveTab,
  onOpenNewLoan,
  onOpenNewBook,
  onReturnBook,
}) => {
  // Calculations
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalStock, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableStock, 0);
  const activeLoans = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  const activeLoansCount = activeLoans.length;
  
  const totalStudents = students.length;
  const thesisStudentsCount = students.filter((s) => s.status === 'Tingkat Akhir (Skripsi)').length;

  const faculties = Array.from(new Set(books.map((b) => b.faculty)));
  const totalFaculties = faculties.length;

  // Overdue loans
  const overdueLoans = activeLoans.filter((l) => {
    const { isOverdue } = calculateOverdue(l.dueDate);
    return isOverdue || l.status === 'Terlambat';
  });

  const totalOverdueFines = overdueLoans.reduce((sum, loan) => {
    const { fine } = calculateOverdue(loan.dueDate);
    return sum + (loan.fineAmount > 0 ? loan.fineAmount : fine);
  }, 0);

  // Most borrowed textbooks
  const popularBooks = [...books]
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, 4);

  // Recent transactions
  const recentLoans = [...loans].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* University Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
            <School className="w-3.5 h-3.5 text-indigo-300" />
            <span>UPT Perpustakaan & Pusat Sumber Belajar Digital Mahasiswa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Portal Sirkulasi & Repositori Akademik
          </h2>
          <p className="mt-2 text-indigo-100/90 text-xs sm:text-sm leading-relaxed">
            Mendukung kegiatan perkuliahan, riset skripsi, dan penyelesaian tugas akhir mahasiswa melalui katalog terpadu, sirkulasi otomatis, dan layanan bebas pustaka digital.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenNewLoan}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
              <span>Catat Peminjaman Mahasiswa</span>
            </button>
            <button
              onClick={() => setActiveTab('clearance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-semibold text-xs sm:text-sm border border-purple-400/30 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-purple-200" />
              <span>Verifikasi Bebas Pustaka</span>
            </button>
          </div>
        </div>
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Overdue Warning Alert Banner */}
      {overdueLoans.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-semibold text-sm">
                Perhatian: Terdapat {overdueLoans.length} Buku Kuliah Melewati Tenggat Pengembalian
              </h4>
              <button
                onClick={() => setActiveTab('loans')}
                className="text-xs font-bold text-amber-800 underline hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                Buka Sirkulasi Mahasiswa <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Total denda akumulasi: <span className="font-bold text-rose-700">{formatRupiah(totalOverdueFines)}</span> (Rp 1.000/hari). Mahasiswa yang menunggak tidak dapat memproses Surat Bebas Pustaka.
            </p>
          </div>
        </div>
      )}

      {/* 4 Academic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Academic Books */}
        <div 
          onClick={() => setActiveTab('books')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Koleksi Akademik</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalTitles}</span>
            <span className="text-xs text-slate-500">Judul ({totalCopies} Eks)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">{availableCopies} siap sirkulasi</span>
            <span className="text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center">
              Katalog <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Active Campus Loans */}
        <div 
          onClick={() => setActiveTab('loans')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dipinjam Mahasiswa</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{activeLoansCount}</span>
            <span className="text-xs text-slate-500">Eksemplar Beredar</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className={overdueLoans.length > 0 ? "text-rose-600 font-medium" : "text-slate-500"}>
              {overdueLoans.length > 0 ? `${overdueLoans.length} telat` : 'Semua tertib'}
            </span>
            <span className="text-slate-400 group-hover:text-amber-600 transition-colors flex items-center">
              Cek Denda <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Total Students */}
        <div 
          onClick={() => setActiveTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mahasiswa Terdaftar</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">Mahasiswa</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-indigo-600 font-semibold">{thesisStudentsCount} tahap Skripsi/TA</span>
            <span className="text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center">
              Lihat KTM <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Total Faculties / Programs */}
        <div 
          onClick={() => setActiveTab('clearance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bebas Pustaka</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">Online</span>
            <span className="text-xs text-slate-500">Syarat Wisuda</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-purple-600 font-semibold">Cek Mandiri via NIM</span>
            <span className="text-slate-400 group-hover:text-purple-600 transition-colors flex items-center">
              Verifikasi <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Campus Loans & Most Popular Textbooks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Loans (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sirkulasi Peminjaman Mahasiswa Terkini</h3>
              <p className="text-xs text-slate-500">Catatan peminjaman buku kuliah dan riset skripsi terbaru</p>
            </div>
            <button
              onClick={() => setActiveTab('loans')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Lihat Riwayat ({loans.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentLoans.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada transaksi peminjaman mahasiswa</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold">
                    <th className="pb-3 px-3">Mahasiswa (NIM)</th>
                    <th className="pb-3 px-3">Buku Kuliah</th>
                    <th className="pb-3 px-3 hidden sm:table-cell">Tenggat</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLoans.map((loan) => {
                    const overdueInfo = calculateOverdue(loan.dueDate, loan.returnDate);
                    const isLate = (loan.status === 'Terlambat') || (loan.status === 'Dipinjam' && overdueInfo.isOverdue);

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{loan.studentName}</div>
                          <div className="text-[11px] text-indigo-600 font-mono font-medium">{loan.studentNim}</div>
                          <div className="text-[10px] text-slate-400">{loan.studyProgram}</div>
                        </td>
                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="font-medium text-slate-800 truncate" title={loan.bookTitle}>
                            {loan.bookTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{loan.id} &bull; {loan.loanType}</div>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell text-slate-600">
                          {formatDateIndo(loan.dueDate)}
                        </td>
                        <td className="py-3 px-3">
                          {loan.status === 'Dikembalikan' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Kembali
                            </span>
                          ) : isLate ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              Telat
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3 h-3" />
                              Dipinjam
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {loan.status !== 'Dikembalikan' ? (
                            <button
                              onClick={() => onReturnBook(loan.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors cursor-pointer"
                            >
                              Kembalikan
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Most Borrowed Textbooks (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Rujukan Favorit Mahasiswa
              </h3>
              <p className="text-xs text-slate-500">Buku teks & referensi paling banyak dipinjam</p>
            </div>
          </div>

          <div className="space-y-3.5 flex-1">
            {popularBooks.map((book, index) => (
              <div 
                key={book.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 hover:bg-indigo-50/50 transition-colors"
              >
                <div className={`w-8 h-10 rounded-md bg-linear-to-br ${book.coverColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate" title={book.title}>
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{book.author} &bull; {book.faculty}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-indigo-600 font-medium">{book.borrowCount}x dipinjam</span>
                    <span className={book.availableStock > 0 ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}>
                      {book.availableStock > 0 ? `Sisa: ${book.availableStock}` : 'Dipinjam'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('books')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Telusuri Seluruh Repositori Kampus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
