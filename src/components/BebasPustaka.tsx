import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  GraduationCap, 
  School, 
  BookOpen, 
  ShieldCheck,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { Student, LoanTransaction } from '../types';
import { checkStudentClearance, formatDateIndo, formatRupiah } from '../utils/storage';

interface BebasPustakaProps {
  students: Student[];
  loans: LoanTransaction[];
  onReturnBook: (loanId: string) => void;
}

export const BebasPustaka: React.FC<BebasPustakaProps> = ({
  students,
  loans,
  onReturnBook,
}) => {
  const [selectedNim, setSelectedNim] = useState<string>(students[0]?.nim || '');
  const [searchNimQuery, setSearchNimQuery] = useState('');

  // Selected student
  const activeStudent = students.find((s) => s.nim === selectedNim) || students[0];

  // Clearance status
  const clearanceResult = activeStudent 
    ? checkStudentClearance(activeStudent.nim, loans)
    : null;

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Verifikasi Bebas Perpustakaan (Yudisium & Wisuda)</h3>
            <p className="text-xs text-slate-500">
              Layanan penerbitan Surat Keterangan Bebas Pustaka (SKBP) otomatis bagi mahasiswa tingkat akhir
            </p>
          </div>
        </div>

        {/* Student Selector */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 sm:whitespace-nowrap">
            Pilih Mahasiswa:
          </label>
          <select
            value={selectedNim}
            onChange={(e) => setSelectedNim(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          >
            {students.map((st) => (
              <option key={st.nim} value={st.nim}>
                {st.name} ({st.nim}) - {st.studyProgram}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeStudent && clearanceResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Clearance Status Check (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hasil Verifikasi
                </span>
                <span className="text-xs font-mono text-slate-500">{activeStudent.nim}</span>
              </div>

              {/* Status Badge */}
              <div className="mt-4 p-4 rounded-xl text-center border">
                {clearanceResult.isCleared ? (
                  <div className="bg-emerald-50 text-emerald-900 border-emerald-200 rounded-xl p-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h4 className="font-extrabold text-base text-emerald-800">
                      BEBAS TANGGUNGAN PUSTAKA
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Mahasiswa memenuhi syarat untuk diterbitkan Surat Bebas Pustaka resmi.
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-50 text-rose-900 border-rose-200 rounded-xl p-4">
                    <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
                    <h4 className="font-extrabold text-base text-rose-800">
                      MASIH MEMILIKI TANGGUNGAN
                    </h4>
                    <p className="text-xs text-rose-700 mt-1">
                      Harap selesaikan pengembalian buku atau denda sebelum mengajukan bebas pustaka.
                    </p>
                  </div>
                )}
              </div>

              {/* Breakdown checklist */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">Buku Sedang Dipinjam:</span>
                  <span className={`font-bold ${clearanceResult.activeLoansCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {clearanceResult.activeLoansCount} Eksemplar
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">Tunggakan Denda:</span>
                  <span className={`font-bold ${clearanceResult.outstandingFine === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatRupiah(clearanceResult.outstandingFine)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">Status Akademik:</span>
                  <span className="font-bold text-slate-800">
                    {activeStudent.status}
                  </span>
                </div>
              </div>

              {/* Outstanding loans list if not cleared */}
              {!clearanceResult.isCleared && clearanceResult.activeLoans.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <h5 className="font-bold text-slate-800 text-xs">Buku Yang Harus Dikembalikan:</h5>
                  {clearanceResult.activeLoans.map((l) => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{l.bookTitle}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Tenggat: {formatDateIndo(l.dueDate)}</div>
                      </div>
                      <button
                        onClick={() => onReturnBook(l.id)}
                        className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Kembalikan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {clearanceResult.isCleared && (
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-700/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Surat Bebas Pustaka</span>
              </button>
            )}
          </div>

          {/* Right: Surat Keterangan Bebas Pustaka Official Certificate (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 flex flex-col justify-between print-only">
            <div>
              {/* Kop Surat Universitas */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <School className="w-6 h-6 text-indigo-900" />
                  <span className="font-black text-sm sm:text-base tracking-widest text-slate-900 uppercase">
                    UNIVERSITAS PUSTAKA UTAMA
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 tracking-wide uppercase">
                  UNIT PELAKSANA TEKNIS (UPT) PERPUSTAKAAN & PUSAT SUMBER BELAJAR
                </h4>
                <p className="text-[10px] text-slate-500">
                  Gedung Perpustakaan Pusat Lt. 1-3 &bull; Kampus Terpadu &bull; Email: perpustakaan@univ.ac.id
                </p>
              </div>

              {/* Title of Document */}
              <div className="text-center my-6">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 underline underline-offset-4 tracking-wider uppercase">
                  SURAT KETERANGAN BEBAS PERPUSTAKAAN
                </h3>
                <p className="text-[11px] text-slate-600 font-mono mt-1">
                  Nomor: {clearanceResult.clearanceNumber}
                </p>
              </div>

              {/* Statement Body */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  Kepala Unit Pelaksana Teknis (UPT) Perpustakaan Universitas Pustaka Utama dengan ini menerangkan bahwa:
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 font-medium">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Nama Mahasiswa</span>
                    <span className="col-span-2 text-slate-900 font-bold">: {activeStudent.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">NIM</span>
                    <span className="col-span-2 font-mono text-indigo-900 font-bold">: {activeStudent.nim}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Program Studi</span>
                    <span className="col-span-2 text-slate-900">: {activeStudent.studyProgram}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Fakultas</span>
                    <span className="col-span-2 text-slate-900">: {activeStudent.faculty}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Angkatan / Semester</span>
                    <span className="col-span-2 text-slate-900">: {activeStudent.generation} / Semester {activeStudent.semester}</span>
                  </div>
                </div>

                <p>
                  Yang bersangkutan telah diverifikasi melalui sistem sirkulasi dan repositori perpustakaan terpadu, dan dinyatakan:
                </p>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    TIDAK MEMILIKI TANGGUNGAN PINJAMAN BUKU KOLEKSI KULIAH MAUPUN DENDA KETERLAMBATAN, SERTA TELAH MENYERAHKAN SALINAN DIGITAL TUGAS AKHIR / SKRIPSI.
                  </span>
                </div>

                <p>
                  Surat keterangan ini diterbitkan secara sah sebagai salah satu kelengkapan berkas pendaftaran Ujian Yudisium dan Wisuda Sarjana / Diploma.
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-4 flex justify-between items-end text-xs text-slate-700">
                <div className="text-center space-y-1">
                  <div className="font-mono text-[9px] text-slate-400">|||| |||| | ||||| |||| ||</div>
                  <div className="text-[10px] text-slate-400">Barcode Verifikasi Digital</div>
                </div>

                <div className="text-center space-y-12">
                  <div>
                    <p className="text-slate-500">Dikeluarkan pada: {todayStr}</p>
                    <p className="font-bold text-slate-900">Kepala UPT Perpustakaan,</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 underline">Dr. Ir. H. Mulyadi, M.Kom., M.Lib.</p>
                    <p className="text-[11px] text-slate-500">NIP. 19750812 200112 1 002</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 no-print">
              <span>UniLib Digital Clearance Document &bull; Valid & Terverifikasi</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Lembar Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
