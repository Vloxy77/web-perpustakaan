import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  LayoutGrid, 
  List, 
  Edit3, 
  Trash2, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  X,
  RotateCcw,
  GraduationCap,
  Bookmark,
  FileText
} from 'lucide-react';
import { Book, BookCategory, AcademicFaculty, CollectionType } from '../types';
import { BOOK_CATEGORIES, ACADEMIC_FACULTIES, COLLECTION_TYPES } from '../data/initialData';

interface BookCatalogProps {
  books: Book[];
  onAddBook: (bookData: Omit<Book, 'id' | 'createdAt' | 'borrowCount'>) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onQuickBorrow: (book: Book) => void;
  onQuickReturn: (bookId: string) => void;
  isBorrowAvailable: (bookId: string) => boolean;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onQuickBorrow,
  onQuickReturn,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('Semua Fakultas');
  const [selectedCollection, setSelectedCollection] = useState<string>('Semua Tipe Koleksi');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    callNumber: '',
    author: '',
    publisher: '',
    isbn: '',
    year: new Date().getFullYear(),
    collectionType: 'Buku Teks Kuliah' as CollectionType,
    faculty: 'Fakultas Ilmu Komputer & TI' as AcademicFaculty,
    category: 'Informatika & Sistem Informasi' as BookCategory,
    totalStock: 3,
    shelfLocation: 'Lantai 2 - Rak TI-01',
    description: '',
    isCirculation: true,
    coverColor: 'from-blue-700 to-indigo-900',
  });

  const [formError, setFormError] = useState('');

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.callNumber.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.shelfLocation.toLowerCase().includes(q);

      const matchFaculty =
        selectedFaculty === 'Semua Fakultas' || book.faculty === selectedFaculty;

      const matchCollection =
        selectedCollection === 'Semua Tipe Koleksi' || book.collectionType === selectedCollection;

      const matchCategory =
        selectedCategory === 'Semua' || book.category === selectedCategory;

      let matchStatus = true;
      if (statusFilter === 'available') {
        matchStatus = book.availableStock > 0;
      } else if (statusFilter === 'out') {
        matchStatus = book.availableStock <= 0;
      }

      return matchSearch && matchFaculty && matchCollection && matchCategory && matchStatus;
    });
  }, [books, searchQuery, selectedFaculty, selectedCollection, selectedCategory, statusFilter]);

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      callNumber: '',
      author: '',
      publisher: '',
      isbn: '',
      year: new Date().getFullYear(),
      collectionType: 'Buku Teks Kuliah',
      faculty: 'Fakultas Ilmu Komputer & TI',
      category: 'Informatika & Sistem Informasi',
      totalStock: 3,
      shelfLocation: 'Lantai 2 - Rak TI-01',
      description: '',
      isCirculation: true,
      coverColor: 'from-blue-700 to-indigo-900',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      callNumber: book.callNumber,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      year: book.year,
      collectionType: book.collectionType,
      faculty: book.faculty,
      category: book.category,
      totalStock: book.totalStock,
      shelfLocation: book.shelfLocation,
      description: book.description,
      isCirculation: book.isCirculation,
      coverColor: book.coverColor,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      setFormError('Judul buku/karya ilmiah dan Penulis wajib diisi.');
      return;
    }
    if (!formData.callNumber.trim()) {
      setFormError('Nomor Panggil DDC / Call Number wajib diisi untuk katalog universitas.');
      return;
    }
    if (formData.totalStock < 1) {
      setFormError('Total eksemplar minimal 1.');
      return;
    }

    try {
      if (editingBook) {
        const borrowed = editingBook.totalStock - editingBook.availableStock;
        const newAvailableStock = Math.max(0, formData.totalStock - borrowed);

        onUpdateBook({
          ...editingBook,
          ...formData,
          availableStock: newAvailableStock,
        });
      } else {
        onAddBook({
          ...formData,
          availableStock: formData.totalStock,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data ke repositori.');
    }
  };

  const coverPalette = [
    { label: 'Biru Akademik', value: 'from-blue-700 to-indigo-900' },
    { label: 'Zamrud FEB', value: 'from-emerald-700 to-teal-950' },
    { label: 'Kuning Skripsi Emas', value: 'from-amber-700 to-amber-950' },
    { label: 'Ungu Riset', value: 'from-purple-800 to-indigo-950' },
    { label: 'Merah Kedokteran', value: 'from-rose-800 to-red-950' },
    { label: 'Arang Hukum', value: 'from-slate-800 to-slate-950' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Real-time Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul buku kuliah, pengarang, nomor panggil (DDC), atau skripsi..."
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

          {/* Action Buttons: Add Book & View Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Rinci"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Koleksi Kampus</span>
            </button>
          </div>
        </div>

        {/* Multi-Filters: Fakultas, Tipe Koleksi, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          {/* Faculty Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Fakultas / Jurusan:
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {ACADEMIC_FACULTIES.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          {/* Collection Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Jenis Koleksi Akademik:
            </label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {COLLECTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Ketersediaan Stok:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Semua Ketersediaan</option>
              <option value="available">Tersedia di Rak</option>
              <option value="out">Sedang Dipinjam Mahasiswa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info Counter */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <p>
          Menampilkan <span className="font-bold text-slate-800">{filteredBooks.length}</span> dari {books.length} koleksi akademik
          {selectedFaculty !== 'Semua Fakultas' && ` &bull; ${selectedFaculty}`}
          {selectedCollection !== 'Semua Tipe Koleksi' && ` &bull; ${selectedCollection}`}
        </p>
        {(searchQuery || selectedFaculty !== 'Semua Fakultas' || selectedCollection !== 'Semua Tipe Koleksi' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFaculty('Semua Fakultas');
              setSelectedCollection('Semua Tipe Koleksi');
              setStatusFilter('all');
            }}
            className="text-indigo-600 hover:underline font-medium"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Book List / Grid Display */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Tidak ada koleksi pustaka yang cocok</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Silakan sesuaikan kata kunci atau filter fakultas/tipe koleksi.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableStock > 0;
            const hasBorrowedCopies = book.availableStock < book.totalStock;

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden group"
              >
                {/* Book Header / Spine */}
                <div className={`h-24 bg-linear-to-r ${book.coverColor} p-4 flex flex-col justify-between text-white relative`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-black/30 backdrop-blur-xs">
                      {book.callNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                        isAvailable
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {isAvailable ? `Tersedia (${book.availableStock})` : 'Dipinjam'}
                    </span>
                  </div>

                  <div className="z-10 flex items-center justify-between text-[11px] text-white/90">
                    <span className="truncate">{book.collectionType}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                      {book.isCirculation ? 'Sirkulasi' : 'Tandon'}
                    </span>
                  </div>
                </div>

                {/* Book Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      {book.faculty}
                    </span>
                    <h3 
                      className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug mt-1"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{book.author}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{book.publisher} &bull; {book.year}</p>
                  </div>

                  {book.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {book.description}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {book.shelfLocation}
                    </span>
                    <span className="text-slate-400">
                      Stok: <b className="text-slate-700">{book.availableStock}</b>/{book.totalStock}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {/* Borrow Button */}
                    <button
                      onClick={() => onQuickBorrow(book)}
                      disabled={!isAvailable}
                      className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isAvailable
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95 cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      title={isAvailable ? 'Pinjam buku ini' : 'Stok sedang habis'}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'Pinjamkan' : 'Kosong'}</span>
                    </button>

                    {/* Quick Return if copies are borrowed */}
                    {hasBorrowedCopies && (
                      <button
                        onClick={() => onQuickReturn(book.id)}
                        className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs transition-colors cursor-pointer"
                        title="Kembalikan eksemplar buku"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(book)}
                      className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Data Koleksi"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteBook(book.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Koleksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Panggil & Judul</th>
                  <th className="py-3 px-3">Fakultas / Tipe</th>
                  <th className="py-3 px-3">Lokasi Rak</th>
                  <th className="py-3 px-3 text-center">Stok</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => {
                  const isAvailable = book.availableStock > 0;
                  const hasBorrowedCopies = book.availableStock < book.totalStock;

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-10 rounded-md bg-linear-to-br ${book.coverColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-mono`}>
                            {book.callNumber.slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-[11px] text-indigo-700 font-semibold">{book.callNumber}</div>
                            <div className="font-bold text-slate-900 truncate max-w-xs">{book.title}</div>
                            <div className="text-xs text-slate-500">{book.author} &bull; {book.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 text-xs">{book.faculty}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {book.collectionType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          <span>{book.shelfLocation}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {book.isCirculation ? 'Boleh Dipinjam' : 'Khusus Baca Ruang Pustaka'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-800">{book.availableStock}</span>
                        <span className="text-slate-400 text-xs"> / {book.totalStock}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Habis
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => onQuickBorrow(book)}
                            disabled={!isAvailable}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isAvailable
                                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Pinjam
                          </button>
                          {hasBorrowedCopies && (
                            <button
                              onClick={() => onQuickReturn(book.id)}
                              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold cursor-pointer"
                            >
                              Kembali
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBook(book.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Koleksi Kampus */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingBook ? 'Edit Data Koleksi Akademik' : 'Tambah Koleksi Buku / Skripsi'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Buku / Skripsi / Jurnal *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Clean Code atau Skripsi: Analisis..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Panggil DDC (Call Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.callNumber}
                    onChange={(e) => setFormData({ ...formData, callNumber: e.target.value })}
                    placeholder="Contoh: 005.133 MAR c.1"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penulis / Pengarang / Peneliti *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nama dosen / penulis / mahasiswa"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fakultas Terkait *
                  </label>
                  <select
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value as AcademicFaculty })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    {ACADEMIC_FACULTIES.filter((f) => f !== 'Semua Fakultas').map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Koleksi *
                  </label>
                  <select
                    value={formData.collectionType}
                    onChange={(e) => setFormData({ ...formData, collectionType: e.target.value as CollectionType })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    {COLLECTION_TYPES.filter((t) => t !== 'Semua Tipe Koleksi').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Eksemplar *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalStock}
                    onChange={(e) => setFormData({ ...formData, totalStock: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Terbit / TA
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Rak Kampus
                  </label>
                  <input
                    type="text"
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    placeholder="Lantai 2 - Rak TI-03"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Circulation policy checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCirculation}
                    onChange={(e) => setFormData({ ...formData, isCirculation: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Dapat Dipinjam Pulang (Sirkulasi)</span>
                    <p className="text-[11px] text-slate-400">Jika tidak dicentang, koleksi hanya boleh dibaca di ruang pustaka/tandon.</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Catatan Kuliah
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Buku rujukan mata kuliah atau ringkasan skripsi..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {editingBook ? 'Simpan Perubahan' : 'Tambahkan ke Repositori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
