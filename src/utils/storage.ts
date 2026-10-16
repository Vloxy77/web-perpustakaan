import { Book, Student, LoanTransaction } from '../types';
import { INITIAL_BOOKS, INITIAL_STUDENTS, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  BOOKS: 'unilib_academic_books_v2',
  STUDENTS: 'unilib_students_v2',
  TRANSACTIONS: 'unilib_loans_v2',
};

// Safe LocalStorage getters
export const getStoredBooks = (): Book[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BOOKS;
  } catch (err) {
    console.error('Gagal membaca data buku universitas:', err);
    return INITIAL_BOOKS;
  }
};

export const saveBooks = (books: Book[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  } catch (err) {
    console.error('Gagal menyimpan data buku universitas:', err);
  }
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STUDENTS;
  } catch (err) {
    console.error('Gagal membaca data mahasiswa:', err);
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Gagal menyimpan data mahasiswa:', err);
  }
};

export const getStoredTransactions = (): LoanTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TRANSACTIONS;
  } catch (err) {
    console.error('Gagal membaca transaksi sirkulasi:', err);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveTransactions = (transactions: LoanTransaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Gagal menyimpan transaksi sirkulasi:', err);
  }
};

export const resetAllData = (): { books: Book[]; students: Student[]; transactions: LoanTransaction[] } => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    return {
      books: INITIAL_BOOKS,
      students: INITIAL_STUDENTS,
      transactions: INITIAL_TRANSACTIONS,
    };
  } catch (err) {
    console.error('Gagal mereset data universitas:', err);
    return {
      books: INITIAL_BOOKS,
      students: INITIAL_STUDENTS,
      transactions: INITIAL_TRANSACTIONS,
    };
  }
};

// Utilities for currency and dates
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Calculate overdue days and fine (Rp 1.000 per day for university library)
export const calculateOverdue = (dueDateStr: string, returnDateStr?: string): { isOverdue: boolean; daysLate: number; fine: number } => {
  try {
    const due = new Date(dueDateStr);
    const end = returnDateStr ? new Date(returnDateStr) : new Date();
    due.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        isOverdue: true,
        daysLate: diffDays,
        fine: diffDays * 1000,
      };
    }
    return { isOverdue: false, daysLate: 0, fine: 0 };
  } catch {
    return { isOverdue: false, daysLate: 0, fine: 0 };
  }
};

// Check Student Library Clearance (Surat Bebas Pustaka)
export const checkStudentClearance = (studentNim: string, loans: LoanTransaction[]) => {
  const studentLoans = loans.filter((l) => l.studentNim === studentNim);
  const activeLoans = studentLoans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  
  let outstandingFine = 0;
  activeLoans.forEach((loan) => {
    const { isOverdue, fine } = calculateOverdue(loan.dueDate);
    if (isOverdue) {
      outstandingFine += fine;
    }
  });

  const isCleared = activeLoans.length === 0 && outstandingFine === 0;
  const clearanceNumber = `SBP/UPT-PUSTAKA/${new Date().getFullYear()}/${studentNim.slice(-4)}`;

  return {
    isCleared,
    activeLoansCount: activeLoans.length,
    activeLoans,
    outstandingFine,
    totalHistoryCount: studentLoans.length,
    clearanceNumber,
  };
};
