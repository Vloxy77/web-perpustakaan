import React, { useState, useEffect, useCallback } from 'react';
import { 
  Book, 
  Student, 
  LoanTransaction, 
  ActiveTab, 
  ToastMessage,
  LoanType
} from './types';
import { 
  getStoredBooks, 
  saveBooks, 
  getStoredStudents, 
  saveStudents, 
  getStoredTransactions, 
  saveTransactions,
  resetAllData,
  calculateOverdue,
  formatRupiah
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BookCatalog } from './components/BookCatalog';
import { StudentManagement } from './components/StudentManagement';
import { LoanManagement } from './components/LoanManagement';
import { BebasPustaka } from './components/BebasPustaka';
import { SettingsBackup } from './components/SettingsBackup';
import { ToastContainer } from './components/Toast';

export default function App() {
  // Main Data States
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loans, setLoans] = useState<LoanTransaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [presetBookIdForBorrow, setPresetBookIdForBorrow] = useState<string | undefined>(undefined);

  // Toast Notifications Stack
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize data on mount
  useEffect(() => {
    try {
      const storedBooks = getStoredBooks();
      const storedStudents = getStoredStudents();
      const storedLoans = getStoredTransactions();

      // Recalculate status of active loans that might be overdue
      const updatedLoans = storedLoans.map((l) => {
        if (l.status === 'Dipinjam') {
          const { isOverdue, fine } = calculateOverdue(l.dueDate);
          if (isOverdue) {
            return {
              ...l,
              status: 'Terlambat' as const,
              fineAmount: fine,
            };
          }
        }
        return l;
      });

      setBooks(storedBooks);
      setStudents(storedStudents);
      setLoans(updatedLoans);
      saveTransactions(updatedLoans);
      setIsLoaded(true);
    } catch (err) {
      console.error('Initialization error:', err);
      setIsLoaded(true);
    }
  }, []);

  // --- BOOK HANDLERS ---
  const handleAddBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'borrowCount'>) => {
    try {
      const nextNum = books.length + 1;
      const id = `BK-${String(nextNum).padStart(3, '0')}`;
      const newBook: Book = {
        ...bookData,
        id,
        borrowCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const updated = [newBook, ...books];
      setBooks(updated);
      saveBooks(updated);
      addToast('success', 'Koleksi Ditambahkan', `"${newBook.title}" berhasil diarsipkan ke repositori kampus.`);
    } catch (err: any) {
      addToast('error', 'Gagal Menambah Koleksi', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleUpdateBook = (updatedBook: Book) => {
    try {
      const updated = books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
      setBooks(updated);
      saveBooks(updated);
      addToast('success', 'Data Diperbarui', `Informasi "${updatedBook.title}" telah diperbarui.`);
    } catch (err: any) {
      addToast('error', 'Gagal Memperbarui Koleksi', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleDeleteBook = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    // Check if book currently has active loans
    const hasActiveLoan = loans.some(
      (l) => l.bookId === bookId && (l.status === 'Dipinjam' || l.status === 'Terlambat')
    );

    if (hasActiveLoan) {
      addToast(
        'warning',
        'Tidak Dapat Menghapus',
        `Koleksi "${book.title}" sedang dipinjam oleh mahasiswa. Selesaikan pengembalian terlebih dahulu.`
      );
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus "${book.title}" dari katalog perpustakaan?`)) {
      const updated = books.filter((b) => b.id !== bookId);
      setBooks(updated);
      saveBooks(updated);
      addToast('info', 'Koleksi Dihapus', `"${book.title}" telah dikeluarkan dari repositori.`);
    }
  };

  const handleQuickBorrow = (book: Book) => {
    if (book.availableStock <= 0) {
      addToast('warning', 'Stok Kosong', `Semua eksemplar "${book.title}" sedang dipinjam mahasiswa.`);
      return;
    }
    setPresetBookIdForBorrow(book.id);
    setIsBorrowModalOpen(true);
    setActiveTab('loans');
  };

  const handleQuickReturnByBook = (bookId: string) => {
    const activeLoan = loans.find(
      (l) => l.bookId === bookId && (l.status === 'Dipinjam' || l.status === 'Terlambat')
    );
    if (activeLoan) {
      handleReturnLoan(activeLoan.id);
    } else {
      addToast('info', 'Informasi', 'Tidak ada transaksi pinjaman mahasiswa yang aktif untuk buku ini.');
    }
  };

  // --- STUDENT HANDLERS ---
  const handleAddStudent = (studentData: Omit<Student, 'joinDate'>) => {
    try {
      const newStudent: Student = {
        ...studentData,
        joinDate: new Date().toISOString().split('T')[0],
      };

      const updated = [newStudent, ...students];
      setStudents(updated);
      saveStudents(updated);
      addToast(
        'success',
        'Mahasiswa Terdaftar',
        `${newStudent.name} (NIM: ${newStudent.nim}) berhasil terdaftar sebagai anggota perpustakaan.`
      );
    } catch (err: any) {
      addToast('error', 'Gagal Mendaftar', err.message || 'Terjadi kesalahan pendaftaran mahasiswa.');
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    try {
      const updated = students.map((s) => (s.nim === updatedStudent.nim ? updatedStudent : s));
      setStudents(updated);
      saveStudents(updated);
      addToast('success', 'Data Diperbarui', `Informasi mahasiswa ${updatedStudent.name} telah disimpan.`);
    } catch (err: any) {
      addToast('error', 'Gagal Memperbarui', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleDeleteStudent = (studentNim: string) => {
    const student = students.find((s) => s.nim === studentNim);
    if (!student) return;

    // Check active loans
    const activeLoan = loans.some(
      (l) => l.studentNim === studentNim && (l.status === 'Dipinjam' || l.status === 'Terlambat')
    );

    if (activeLoan) {
      addToast(
        'warning',
        'Tidak Dapat Menghapus',
        `Mahasiswa ${student.name} masih memiliki tanggungan buku yang belum dikembalikan.`
      );
      return;
    }

    if (confirm(`Hapus data mahasiswa "${student.name}" (NIM: ${student.nim}) dari sistem perpustakaan?`)) {
      const updated = students.filter((s) => s.nim !== studentNim);
      setStudents(updated);
      saveStudents(updated);
      addToast('info', 'Data Dihapus', `Data mahasiswa ${student.name} telah dihapus.`);
    }
  };

  // --- LOAN SIRKULASI HANDLERS ---
  const handleAddLoan = ({
    bookId,
    studentNim,
    borrowDate,
    dueDate,
    loanType,
    notes,
  }: {
    bookId: string;
    studentNim: string;
    borrowDate: string;
    dueDate: string;
    loanType: LoanType;
    notes?: string;
  }) => {
    const book = books.find((b) => b.id === bookId);
    const student = students.find((s) => s.nim === studentNim);

    if (!book || !student) {
      addToast('error', 'Data Tidak Valid', 'Buku atau mahasiswa tidak ditemukan.');
      return;
    }

    if (book.availableStock <= 0) {
      addToast('warning', 'Stok Kosong', `Buku "${book.title}" tidak memiliki sisa eksemplar di rak.`);
      return;
    }

    const nextId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLoan: LoanTransaction = {
      id: nextId,
      bookId: book.id,
      bookTitle: book.title,
      studentNim: student.nim,
      studentName: student.name,
      studyProgram: student.studyProgram,
      loanType,
      borrowDate,
      dueDate,
      status: 'Dipinjam',
      fineAmount: 0,
      notes,
      createdAt: new Date().toISOString(),
    };

    const updatedLoans = [newLoan, ...loans];
    setLoans(updatedLoans);
    saveTransactions(updatedLoans);

    // Update book stock and count
    const updatedBooks = books.map((b) => {
      if (b.id === book.id) {
        return {
          ...b,
          availableStock: Math.max(0, b.availableStock - 1),
          borrowCount: b.borrowCount + 1,
        };
      }
      return b;
    });
    setBooks(updatedBooks);
    saveBooks(updatedBooks);

    addToast(
      'success',
      'Peminjaman Berhasil Dicatat',
      `"${book.title}" dipinjam oleh ${student.name} (${student.nim}). Tenggat: ${dueDate}.`
    );
  };

  const handleReturnLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    if (loan.status === 'Dikembalikan') {
      addToast('info', 'Sudah Kembali', 'Buku dalam transaksi ini sudah dikembalikan sebelumnya.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const { isOverdue, daysLate, fine } = calculateOverdue(loan.dueDate, today);

    // Update loan record
    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          returnDate: today,
          status: 'Dikembalikan' as const,
          fineAmount: isOverdue ? fine : 0,
        };
      }
      return l;
    });
    setLoans(updatedLoans);
    saveTransactions(updatedLoans);

    // Increment book stock
    const updatedBooks = books.map((b) => {
      if (b.id === loan.bookId) {
        return {
          ...b,
          availableStock: Math.min(b.totalStock, b.availableStock + 1),
        };
      }
      return b;
    });
    setBooks(updatedBooks);
    saveBooks(updatedBooks);

    if (isOverdue) {
      addToast(
        'warning',
        'Pengembalian Buku Terlambat',
        `Buku "${loan.bookTitle}" telah dikembalikan. Terlambat ${daysLate} hari. Denda disetor: ${formatRupiah(fine)}.`
      );
    } else {
      addToast(
        'success',
        'Pengembalian Berhasil',
        `Buku "${loan.bookTitle}" telah dikembalikan tepat waktu ke rak sirkulasi.`
      );
    }
  };

  // Reset to default university demo data
  const handleResetDemoData = () => {
    if (confirm('Setel ulang seluruh data kembali ke database awal perpustakaan universitas?')) {
      const resetResult = resetAllData();
      setBooks(resetResult.books);
      setStudents(resetResult.students);
      setLoans(resetResult.transactions);
      addToast('info', 'Database Disetel Ulang', 'Seluruh data buku kuliah, skripsi, direktori mahasiswa, dan sirkulasi telah disetel ulang.');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Memuat Sistem Perpustakaan Mahasiswa Universitas...</p>
        </div>
      </div>
    );
  }

  const activeLoansCount = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        stats={{
          totalBooks: books.length,
          activeLoans: activeLoansCount,
          totalStudents: students.length,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenNewLoan={() => {
            setPresetBookIdForBorrow(undefined);
            setIsBorrowModalOpen(true);
            setActiveTab('loans');
          }}
          onOpenNewBook={() => {
            setActiveTab('books');
          }}
          onOpenClearance={() => {
            setActiveTab('clearance');
          }}
        />

        {/* Page Views Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              books={books}
              students={students}
              loans={loans}
              setActiveTab={setActiveTab}
              onOpenNewLoan={() => {
                setPresetBookIdForBorrow(undefined);
                setIsBorrowModalOpen(true);
                setActiveTab('loans');
              }}
              onOpenNewBook={() => setActiveTab('books')}
              onReturnBook={handleReturnLoan}
            />
          )}

          {activeTab === 'books' && (
            <BookCatalog
              books={books}
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
              onQuickBorrow={handleQuickBorrow}
              onQuickReturn={handleQuickReturnByBook}
              isBorrowAvailable={(id) => {
                const b = books.find((x) => x.id === id);
                return !!b && b.availableStock > 0;
              }}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagement
              students={students}
              loans={loans}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onOpenClearanceForStudent={() => setActiveTab('clearance')}
            />
          )}

          {activeTab === 'loans' && (
            <LoanManagement
              books={books}
              students={students}
              loans={loans}
              onAddLoan={handleAddLoan}
              onReturnLoan={handleReturnLoan}
              isBorrowModalOpen={isBorrowModalOpen}
              setIsBorrowModalOpen={setIsBorrowModalOpen}
              initialSelectedBookId={presetBookIdForBorrow}
            />
          )}

          {activeTab === 'clearance' && (
            <BebasPustaka
              students={students}
              loans={loans}
              onReturnBook={handleReturnLoan}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsBackup
              books={books}
              students={students}
              loans={loans}
              onResetData={handleResetDemoData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
