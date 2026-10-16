export type CollectionType = 
  | 'Buku Teks Kuliah'
  | 'Skripsi / Tugas Akhir'
  | 'Jurnal & Prosiding Ilmiah'
  | 'Modul & Diktat Praktikum'
  | 'Koleksi Referensi (Tandon)';

export type AcademicFaculty = 
  | 'Semua Fakultas'
  | 'Fakultas Ilmu Komputer & TI'
  | 'Fakultas Ekonomi & Bisnis'
  | 'Fakultas Teknik'
  | 'Fakultas Kedokteran & Kesehatan'
  | 'Fakultas Hukum'
  | 'Fakultas MIPA & Sains'
  | 'Fakultas Ilmu Sosial & Budaya';

export type BookCategory = 
  | 'Semua'
  | 'Informatika & Sistem Informasi'
  | 'Manajemen & Akuntansi'
  | 'Teknik Sipil & Mesin'
  | 'Ilmu Kedokteran & Farmasi'
  | 'Ilmu Hukum & Konstitusi'
  | 'Matematika & Fisika Terapan'
  | 'Metodologi Penelitian & Skripsi'
  | 'Sosial, Humaniora & Bahasa';

export interface Book {
  id: string; // e.g. "BK-001"
  callNumber: string; // e.g. "005.133 MAR c.1" (Nomor Panggil DDC Kampus)
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  collectionType: CollectionType;
  faculty: AcademicFaculty;
  category: BookCategory;
  totalStock: number;
  availableStock: number;
  shelfLocation: string; // e.g. "Lantai 2 - Rak TI-04"
  description: string;
  borrowCount: number;
  coverColor: string;
  isCirculation: boolean; // true = boleh dipinjam pulang, false = baca di tempat / tandon
  createdAt: string;
}

export type StudentStatus = 'Aktif' | 'Tingkat Akhir (Skripsi)' | 'Cuti Akademik' | 'Lulus / Alumni';

export interface Student {
  nim: string; // e.g. "2201010045"
  name: string;
  faculty: AcademicFaculty;
  studyProgram: string; // e.g. "S1 Teknik Informatika"
  semester: number;
  generation: string; // e.g. "2022"
  status: StudentStatus;
  email: string;
  phone: string;
  maxBorrowLimit: number; // e.g. 3 buku (reguler) atau 5 buku (skripsi)
  joinDate: string;
  notes?: string;
}

export type LoanType = 'Reguler Kuliah' | 'Riset Skripsi / Tugas Akhir' | 'Baca Ruang Pustaka';

export type LoanStatus = 'Dipinjam' | 'Dikembalikan' | 'Terlambat';

export interface LoanTransaction {
  id: string; // e.g. "TRX-1001"
  bookId: string;
  bookTitle: string;
  studentNim: string;
  studentName: string;
  studyProgram: string;
  loanType: LoanType;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string;    // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  status: LoanStatus;
  fineAmount: number; // Denda keterlambatan (Rp 1.000 / hari)
  notes?: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export type ActiveTab = 'dashboard' | 'books' | 'students' | 'loans' | 'clearance' | 'settings';
