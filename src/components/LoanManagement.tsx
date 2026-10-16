import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  RotateCcw, 
  GraduationCap, 
  BookOpen, 
  X,
  FileText,
  DollarSign
} from 'lucide-react';
import { Book, Student, LoanTransaction, LoanType } from '../types';
import { formatDateIndo, formatRupiah, calculateOverdue } from '../utils/storage';

interface LoanManagementProps {
  books: Book[];
  students: Student[];
  loans: LoanTransaction[];
  onAddLoan: (loanData: {
    bookId: string;
    studentNim: string;
    borrowDate: string;
    dueDate: string;
    loanType: LoanType;
    notes?: string;
  }) => void;
  onReturnLoan: (loanId: string) => void;
  isBorrowModalOpen: boolean;
  setIsBorrowModalOpen: (open: boolean) => void;
  initialSelectedBookId?: string;
}

export const LoanManagement: React.FC<LoanManagementProps> = ({
  books,
  students,
  loans,
  onAddLoan,
  onReturnLoan,
  isBorrowModalOpen,
  setIsBorrowModalOpen,
  initialSelectedBookId,
}) => {
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);
  const defaultDueStr = defaultDue.toISOString().split('T')[0];

  const [selectedBookId, setSelectedBookId] = useState(initialSelectedBookId || '');
  const [selectedStudentNim, setSelectedStudentNim] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('Reguler Kuliah');
  const [borrowDate, setBorrowDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDueStr);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Update selected book if preset
  React.useEffect(() => {
    if (initialSelectedBookId) {
      setSelectedBookId(initialSelectedBookId);
    }
  }, [initialSelectedBookId]);

  // Adjust due date when loan type changes
  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    const base = borrowDate ? new Date(borrowDate) : new Date();
    if (type === 'Riset Skripsi / Tugas Akhir') {
      base.setDate(base.getDate() + 14); // 14 hari untuk skripsi
    } else if (type === 'Baca Ruang Pustaka') {
      base.setDate(base.getDate() + 1); // 1 hari / harian
    } else {
      base.setDate(base.getDate() + 7); // 7 hari reguler
    }
    setDueDate(base.toISOString().split('T')[0]);
  };

  const handleDurationPreset = (days: number) => {
    const base = borrowDate ? new Date(borrowDate) : new Date();
    base.setDate(base.getDate() + days);
    setDueDate(base.toISOString().split('T')[0]);
  };

  // Filter available books & active students
  const availableBooks = books.filter((b) => b.availableStock > 0);
  const activeStudents = students.filter((s) => s.status !== 'Cuti Akademik' && s.status !== 'Lulus / Alumni');

  // Active borrow count per student
  const studentActiveLoanCount = useMemo(() => {
    const map: Record<string, number> = {};
    loans.forEach((l) => {
      if (l.status === 'Dipinjam' || l.status === 'Terlambat') {
        map[l.studentNim] = (map[l.studentNim] || 0) + 1;
      }
    });
    return map;
  }, [loans]);

  // Filtered transactions
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        loan.id.toLowerCase().includes(q) ||
        loan.studentName.toLowerCase().includes(q) ||
        loan.studentNim.toLowerCase().includes(q) ||
        loan.bookTitle.toLowerCase().includes(q) ||
        loan.studyProgram.toLowerCase().includes(q);

      const overdueInfo = calculateOverdue(loan.dueDate, loan.returnDate);
      const isOverdue = loan.status === 'Terlambat' || (loan.status === 'Dipinjam' && overdueInfo.isOverdue);

      let matchStatus = true;
      if (statusFilter === 'active') {
        matchStatus = loan.status === 'Dipinjam' && !overdueInfo.isOverdue;
      } else if (statusFilter === 'returned') {
        matchStatus = loan.status === 'Dikembalikan';
      } else if (statusFilter === 'overdue') {
        matchStatus = isOverdue;
      }

      return matchSearch && matchStatus;
    });
  }, [loans, searchQuery, statusFilter]);

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      setFormError('Silakan pilih koleksi buku yang akan dipinjam.');
      return;
    }
    if (!selectedStudentNim) {
      setFormError('Silakan pilih mahasiswa peminjam.');
      return;
    }

    const student = students.find((s) => s.nim === selectedStudentNim);
    if (student) {
      const currentActive = studentActiveLoanCount[student.nim] || 0;
      if (currentActive >= student.maxBorrowLimit) {
        setFormError(
          `Mahasiswa ${student.name} telah mencapai batas kuota peminjaman maksimal (${student.maxBorrowLimit} buku). Harap kembalikan buku terlebih dahulu.`
        );
        return;
      }
    }

    if (!borrowDate || !dueDate) {
      setFormError('Tanggal pinjam dan tenggat pengembalian wajib ditentukan.');
      return;
    }
    if (new Date(dueDate) < new Date(borrowDate)) {
      setFormError('Tenggat pengembalian tidak boleh sebelum tanggal peminjaman.');
      return;
    }

    try {
      onAddLoan({
        bookId: selectedBookId,
        studentNim: selectedStudentNim,
        borrowDate,
        dueDate,
        loanType,
        notes,
      });

      setSelectedBookId('');
      setSelectedStudentNim('');
      setNotes('');
      setFormError('');
      setIsBorrowModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal memproses sirkulasi peminjaman.');
    }
  };

  // Tab counts
  const activeCount = loans.filter((l) => {
    const overdue = calculateOverdue(l.dueDate, l.returnDate);
    return l.status === 'Dipinjam' && !overdue.isOverdue;
  }).length;

  const overdueCount = loans.filter((l) => {
    const overdue = calculateOverdue(l.dueDate, l.returnDate);
    return l.status === 'Terlambat' || (l.status === 'Dipinjam' && overdue.isOverdue);
  }).length;

  const returnedCount = loans.filter((l) => l.status === 'Dikembalikan').length;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi berdasarkan NIM, nama mahasiswa, program studi, judul buku..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setFormError('');
              setIsBorrowModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Peminjaman Mahasiswa Baru</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs font-medium scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Sirkulasi ({loans.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sedang Dipinjam ({activeCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Terlambat / Denda ({overdueCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('returned')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === 'returned'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Dikembalikan ({returnedCount})</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <ArrowLeftRight className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Tidak ada transaksi sirkulasi yang cocok</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Belum ada catatan peminjaman dalam kategori filter ini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">No. Transaksi & Jenis</th>
                  <th className="py-3.5 px-3">Mahasiswa (NIM)</th>
                  <th className="py-3.5 px-3">Buku / Pustaka</th>
                  <th className="py-3.5 px-3">Jadwal Pengembalian</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-3">Denda (Rp 1.000/hari)</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const overdueInfo = calculateOverdue(loan.dueDate, loan.returnDate);
                  const isLate = (loan.status === 'Terlambat') || (loan.status === 'Dipinjam' && overdueInfo.isOverdue);
                  const fine = loan.fineAmount > 0 ? loan.fineAmount : (isLate ? overdueInfo.fine : 0);

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{loan.id}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          {loan.loanType}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Pinjam: {formatDateIndo(loan.borrowDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900">{loan.studentName}</div>
                        <div className="text-[11px] font-mono font-bold text-indigo-700">{loan.studentNim}</div>
                        <div className="text-[10px] text-slate-500">{loan.studyProgram}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={loan.bookTitle}>
                          {loan.bookTitle}
                        </div>
                        <div className="text-[11px] text-slate-400">{loan.bookId}</div>
                      </td>
                      <td className="py-3.5 px-3 text-xs">
                        <div className="text-slate-700">Tenggat: <b className="font-medium">{formatDateIndo(loan.dueDate)}</b></div>
                        {loan.returnDate && (
                          <div className="text-emerald-600 text-[11px] mt-0.5">
                            Kembali: {formatDateIndo(loan.returnDate)}
                          </div>
                        )}
                        {isLate && loan.status !== 'Dikembalikan' && (
                          <div className="text-rose-600 font-bold text-[11px] mt-0.5">
                            Terlambat {overdueInfo.daysLate} hari
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {loan.status === 'Dikembalikan' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                          </span>
                        ) : isLate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Terlambat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3.5 h-3.5" /> Dipinjam
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {fine > 0 ? (
                          <div className="text-xs">
                            <span className="font-bold text-rose-600">{formatRupiah(fine)}</span>
                            <p className="text-[10px] text-slate-400">Kas UPT Perpustakaan</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Rp 0 (Nihil)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {loan.status !== 'Dikembalikan' ? (
                          <button
                            onClick={() => onReturnLoan(loan.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pengembalian</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Dikembalikan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Form Peminjaman Mahasiswa */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Sirkulasi Peminjaman Buku Mahasiswa
                </h3>
              </div>
              <button
                onClick={() => setIsBorrowModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitLoan} className="mt-4 space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Mahasiswa Peminjam (NIM) *
                </label>
                <select
                  required
                  value={selectedStudentNim}
                  onChange={(e) => setSelectedStudentNim(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="">-- Pilih Mahasiswa Terdaftar --</option>
                  {activeStudents.map((st) => {
                    const activeCount = studentActiveLoanCount[st.nim] || 0;
                    return (
                      <option key={st.nim} value={st.nim}>
                        {st.name} ({st.nim}) &bull; {st.studyProgram} &bull; Pinjam: {activeCount}/{st.maxBorrowLimit}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Select Book */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Buku Kuliah / Koleksi Pustaka *
                </label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="">-- Pilih Buku Kuliah Tersedia --</option>
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.callNumber}] {b.title} (Sisa: {b.availableStock} eks &bull; {b.shelfLocation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Peminjaman Kampus *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoanTypeChange('Reguler Kuliah')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      loanType === 'Reguler Kuliah'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Reguler (7 Hari)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoanTypeChange('Riset Skripsi / Tugas Akhir')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      loanType === 'Riset Skripsi / Tugas Akhir'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Skripsi / TA (14 Hari)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoanTypeChange('Baca Ruang Pustaka')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      loanType === 'Baca Ruang Pustaka'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Baca Ruang (1 Hari)
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Peminjaman *
                  </label>
                  <input
                    type="date"
                    required
                    value={borrowDate}
                    onChange={(e) => setBorrowDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tenggat Pengembalian *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    min={borrowDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keperluan Akademik
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bahan kuliah, riset tugas akhir, atau persiapan ujian..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Konfirmasi Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
