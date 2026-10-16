import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  School, 
  IdCard, 
  Trash2, 
  Edit3, 
  X,
  Printer,
  Sparkles,
  BookOpen,
  FileCheck2
} from 'lucide-react';
import { Student, StudentStatus, AcademicFaculty, LoanTransaction } from '../types';
import { formatDateIndo } from '../utils/storage';
import { ACADEMIC_FACULTIES } from '../data/initialData';

interface StudentManagementProps {
  students: Student[];
  loans: LoanTransaction[];
  onAddStudent: (studentData: Omit<Student, 'joinDate'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentNim: string) => void;
  onOpenClearanceForStudent?: (student: Student) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  loans,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenClearanceForStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState<string>('Semua Fakultas');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedKtmStudent, setSelectedKtmStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    faculty: 'Fakultas Ilmu Komputer & TI' as AcademicFaculty,
    studyProgram: 'S1 Teknik Informatika',
    semester: 6,
    generation: new Date().getFullYear().toString(),
    status: 'Aktif' as StudentStatus,
    email: '',
    phone: '',
    maxBorrowLimit: 3,
    notes: '',
  });

  const [formError, setFormError] = useState('');

  // Active loans per student NIM
  const studentActiveLoansCount = useMemo(() => {
    const map: Record<string, number> = {};
    loans.forEach((loan) => {
      if (loan.status === 'Dipinjam' || loan.status === 'Terlambat') {
        map[loan.studentNim] = (map[loan.studentNim] || 0) + 1;
      }
    });
    return map;
  }, [loans]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nim.toLowerCase().includes(q) ||
        s.studyProgram.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      const matchFaculty =
        facultyFilter === 'Semua Fakultas' || s.faculty === facultyFilter;

      const matchStatus = statusFilter === 'Semua' || s.status === statusFilter;

      return matchSearch && matchFaculty && matchStatus;
    });
  }, [students, searchQuery, facultyFilter, statusFilter]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      nim: '',
      name: '',
      faculty: 'Fakultas Ilmu Komputer & TI',
      studyProgram: 'S1 Teknik Informatika',
      semester: 4,
      generation: '2023',
      status: 'Aktif',
      email: '',
      phone: '',
      maxBorrowLimit: 3,
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nim: student.nim,
      name: student.name,
      faculty: student.faculty,
      studyProgram: student.studyProgram,
      semester: student.semester,
      generation: student.generation,
      status: student.status,
      email: student.email,
      phone: student.phone,
      maxBorrowLimit: student.maxBorrowLimit,
      notes: student.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim.trim() || !formData.name.trim()) {
      setFormError('NIM dan Nama Lengkap Mahasiswa wajib diisi.');
      return;
    }

    // Check duplicate NIM if adding new
    if (!editingStudent && students.some((s) => s.nim === formData.nim.trim())) {
      setFormError(`NIM ${formData.nim} sudah terdaftar dalam sistem perpustakaan.`);
      return;
    }

    try {
      if (editingStudent) {
        onUpdateStudent({
          ...editingStudent,
          ...formData,
        });
      } else {
        onAddStudent({
          ...formData,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat memproses data mahasiswa.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mahasiswa berdasarkan NIM, Nama, Program Studi, atau Email..."
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

        {/* Filters and Add button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            {ACADEMIC_FACULTIES.map((fac) => (
              <option key={fac} value={fac}>
                {fac}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tingkat Akhir (Skripsi)">Tingkat Akhir (Skripsi)</option>
            <option value="Cuti Akademik">Cuti Akademik</option>
            <option value="Lulus / Alumni">Lulus / Alumni</option>
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrasi Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <p>
          Terdaftar <span className="font-bold text-slate-800">{filteredStudents.length}</span> mahasiswa
          {facultyFilter !== 'Semua Fakultas' && ` &bull; ${facultyFilter}`}
          {statusFilter !== 'Semua' && ` &bull; Status: ${statusFilter}`}
        </p>
      </div>

      {/* Student Cards */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Tidak ada mahasiswa yang ditemukan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Silakan sesuaikan kata kunci pencarian atau daftarkan mahasiswa baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const activeLoans = studentActiveLoansCount[student.nim] || 0;
            const isThesis = student.status === 'Tingkat Akhir (Skripsi)';
            const isLeave = student.status === 'Cuti Akademik';

            return (
              <div
                key={student.nim}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top: Avatar, Name, NIM, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-700 via-indigo-600 to-indigo-800 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate" title={student.name}>
                          {student.name}
                        </h4>
                        <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-700">
                          NIM: {student.nim}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {student.studyProgram} &bull; Sem. {student.semester}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 border ${
                        isThesis
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : isLeave
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  {/* Academic Details */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 truncate text-slate-700">
                      <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-medium truncate">{student.faculty}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate" title={student.email}>
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom stats and action bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Pinjaman Aktif: </span>
                    <span className={`font-bold ${activeLoans > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {activeLoans} / {student.maxBorrowLimit} Buku
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* View KTM Digital */}
                    <button
                      onClick={() => setSelectedKtmStudent(student)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Lihat KTM Digital Perpustakaan"
                    >
                      <IdCard className="w-3.5 h-3.5" />
                      <span>KTM</span>
                    </button>

                    {/* Edit Student */}
                    <button
                      onClick={() => openEditModal(student)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Mahasiswa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Student */}
                    <button
                      onClick={() => onDeleteStudent(student.nim)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Mahasiswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah / Edit Mahasiswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingStudent ? 'Edit Data Mahasiswa' : 'Registrasi Anggota Mahasiswa Baru'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIM (Nomor Induk Mahasiswa) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 2201010045"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Mahasiswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama sesuai KTM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fakultas *
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
                    Program Studi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studyProgram}
                    onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
                    placeholder="Contoh: S1 Teknik Informatika"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester Aktif
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Angkatan
                  </label>
                  <input
                    type="text"
                    value={formData.generation}
                    onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                    placeholder="2023"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Akademik
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const st = e.target.value as StudentStatus;
                      setFormData({ 
                        ...formData, 
                        status: st,
                        maxBorrowLimit: st === 'Tingkat Akhir (Skripsi)' ? 5 : 3
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tingkat Akhir (Skripsi)">Tingkat Akhir (Skripsi)</option>
                    <option value="Cuti Akademik">Cuti Akademik</option>
                    <option value="Lulus / Alumni">Lulus / Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Mahasiswa (Kampus)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nim@student.univ.ac.id"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pembimbingan / Bidang Riset
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Judul skripsi sementara atau catatan akademik..."
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
                  {editingStudent ? 'Simpan Perubahan' : 'Daftarkan Mahasiswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kartu Tanda Mahasiswa (KTM) Perpustakaan Digital */}
      {selectedKtmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-indigo-600" />
                Kartu Tanda Mahasiswa (KTM) Perpustakaan
              </h3>
              <button
                onClick={() => setSelectedKtmStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* University KTM Digital Preview */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-tr from-slate-950 via-indigo-950 to-indigo-900 text-white p-6 shadow-xl border border-indigo-500/30">
              {/* Header on card */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs tracking-tight">UNIVERSITAS PUSTAKA UTAMA</h5>
                    <p className="text-[9px] text-indigo-300">UPT PERPUSTAKAAN & PUSAT SUMBER BELAJAR</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold border border-indigo-500/30">
                  KTM-DIGITAL
                </div>
              </div>

              {/* Body on card */}
              <div className="mt-5 flex items-center gap-4">
                <div className="w-16 h-20 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-indigo-200 shadow-inner shrink-0">
                  <GraduationCap className="w-7 h-7 mb-1 text-indigo-300" />
                  <span className="text-[8px] font-bold tracking-widest text-indigo-300">STUDENT</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-base text-white truncate">
                    {selectedKtmStudent.name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                    NIM: {selectedKtmStudent.nim}
                  </p>
                  <p className="text-[11px] text-indigo-200 mt-1 truncate font-medium">
                    {selectedKtmStudent.studyProgram}
                  </p>
                  <p className="text-[10px] text-slate-300 truncate">
                    {selectedKtmStudent.faculty}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Angkatan {selectedKtmStudent.generation} &bull; Sem. {selectedKtmStudent.semester} ({selectedKtmStudent.status})
                  </p>
                </div>
              </div>

              {/* Barcode */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] tracking-widest text-slate-300">
                    |||| || ||||| ||| |||| || ||||| ||||
                  </div>
                  <div className="text-[8px] font-mono text-slate-400 mt-0.5">{selectedKtmStudent.nim}</div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-emerald-400 font-semibold block">TERVERIFIKASI AKTIF</span>
                  <span className="text-[8px] text-slate-400">Kuota Pinjam: {selectedKtmStudent.maxBorrowLimit} Buku</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Gunakan untuk tap sirkulasi perpustakaan</span>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak KTM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
