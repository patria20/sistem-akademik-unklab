import React, { useState, useMemo } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { calculateQualityPoints } from '../../utils/gpaCalculator';
import {
  Printer,
  Award,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  UserCheck,
  TrendingUp,
  FileCheck2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const GradesPage: React.FC = () => {
  const { activeStudent, grades, lecturers, activeLecturer } = useAcademic();
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  // Guard clause: jika data mahasiswa tidak ditemukan, tampilkan pesan aman dan jangan render tabel
  if (!activeStudent) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-2">Data Mahasiswa Tidak Ditemukan</h3>
        <p className="text-slate-500 mb-6">
          Akun yang sedang login tidak terhubung dengan data mahasiswa. Silakan login dengan akun mahasiswa yang valid untuk mengakses Transkrip Nilai dan KHS.
        </p>
      </div>
    );
  }

  // Ambil data dosen pembimbing dari daftar lecturers untuk NIDN yang akurat (tidak ada hardcode)
  const advisor = lecturers.find((l) => l.id === activeStudent.academicAdvisorId);
  const dean = lecturers.find((l) => l.title?.includes('Dekan'));

  // Filter nilai secara ketat hanya untuk mahasiswa yang login (studentId === activeStudent.id)
  // sehingga mahasiswa tidak mungkin melihat nilai mahasiswa lain
  const studentGrades = useMemo(() => {
    return grades.filter((g) => g.studentId === activeStudent.id);
  }, [grades, activeStudent]);

  // Available semesters including active semester 5
  const semesters = [1, 2, 3, 4, 5];

  const filteredGrades = useMemo(() => {
    if (selectedSemester === 'all') return studentGrades;
    return studentGrades.filter((g) => g.semester.toString() === selectedSemester);
  }, [studentGrades, selectedSemester]);

  const totalCredits = useMemo(() => {
    return filteredGrades.reduce((sum, g) => sum + g.credits, 0);
  }, [filteredGrades]);

  const totalPassedCredits = useMemo(() => {
    return filteredGrades.filter((g) => g.isPassed).reduce((sum, g) => sum + g.credits, 0);
  }, [filteredGrades]);

  const totalQualityPoints = useMemo(() => {
    return filteredGrades.reduce(
      (sum, g) => sum + calculateQualityPoints(g.letterGrade, g.credits),
      0
    );
  }, [filteredGrades]);

  const computedGpa = useMemo(() => {
    return totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';
  }, [totalCredits, totalQualityPoints]);

  // Graduation honor predicate based on UNKLAB academic rules
  const academicHonor = useMemo(() => {
    const gpa = parseFloat(computedGpa);
    if (gpa >= 3.85) return { title: 'Dengan Pujian Tertinggi (Summa Cum Laude)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (gpa >= 3.75) return { title: 'Dengan Pujian (Magna Cum Laude)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (gpa >= 3.50) return { title: 'Sangat Memuaskan', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (gpa >= 3.00) return { title: 'Memuaskan', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    return { title: 'Cukup', color: 'text-slate-600 bg-slate-50 border-slate-200' };
  }, [computedGpa]);

  // Distribution count of letter grades
  const gradeDistribution = useMemo(() => {
    const map: Record<string, number> = { A: 0, 'A-': 0, 'B+': 0, B: 0, 'B-': 0, 'C+': 0, C: 0, D: 0, F: 0 };
    filteredGrades.forEach((g) => {
      if (map[g.letterGrade] !== undefined) {
        map[g.letterGrade]++;
      }
    });
    return map;
  }, [filteredGrades]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Screen-only Page Header */}
      <div className="print:hidden">
        <PageHeader
          title="Transkrip Nilai & Kartu Hasil Studi (KHS)"
          subtitle="Riwayat perolehan nilai akademik resmi dan transkrip kumulatif mahasiswa Universitas Klabat (UNKLAB)"
          breadcrumbs={[
            { label: 'Mahasiswa', path: '/student/dashboard' },
            { label: 'Transkrip & KHS' },
          ]}
          actions={
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak Transkrip / KHS Resmi
            </button>
          }
        />
      </div>

      {/* Printable Official Header (Shown when printed or in print preview) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="text-center space-y-1">
          <p className="font-extrabold text-base tracking-wider uppercase text-slate-900">
            UNIVERSITAS KLABAT
          </p>
          <p className="font-bold text-sm tracking-wide text-slate-800 uppercase">
            FAKULTAS ILMU KOMPUTER — PROGRAM STUDI INFORMATIKA
          </p>
          <p className="text-[11px] text-slate-600">
            Jl. Arnold Mononutu, Airmadidi Bawah, Kec. Airmadidi, Kab. Minahasa Utara, Sulawesi Utara 95371
          </p>
          <div className="h-0.5 bg-slate-900 w-full mt-2"></div>
          <h2 className="text-sm font-black uppercase tracking-widest pt-3 text-slate-900">
            {selectedSemester === 'all' ? 'TRANSKRIP AKADEMIK SEMENTARA' : `KARTU HASIL STUDI (KHS) — SEMESTER ${selectedSemester}`}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            No. Dokumen: UNKLAB/FILKOM/TR-{new Date().getFullYear()}/{activeStudent.nim}
          </p>
        </div>
      </div>

      {/* Student Identity & Academic Advisor Verification Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <p className="text-slate-400 font-medium text-[11px]">Nama Mahasiswa</p>
            <p className="font-bold text-slate-900 text-sm">{activeStudent.name}</p>
            <span className="text-[11px] text-slate-500 font-mono">{activeStudent.nim}</span>
          </div>

          <div className="space-y-0.5">
            <p className="text-slate-400 font-medium text-[11px]">Fakultas / Program Studi</p>
            <p className="font-bold text-slate-900 text-sm">{activeStudent.programStudy}</p>
            <span className="text-[11px] text-slate-500">{activeStudent.faculty}</span>
          </div>

          <div className="space-y-0.5">
            <p className="text-slate-400 font-medium text-[11px]">Semester & Tahun Akademik</p>
            <p className="font-bold text-slate-900 text-sm">Semester {activeStudent.currentSemester}</p>
            <span className="text-[11px] text-slate-500">{activeStudent.academicYear}</span>
          </div>

          <div className="space-y-1">
            <p className="text-slate-400 font-medium text-[11px]">Dosen Pembina Akademik (PA)</p>
            <p className="font-bold text-blue-700 text-sm">{activeStudent.academicAdvisorName}</p>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Dosen Pembimbing IT 2024 Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Advisor Verification Notice Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              Dosen Pembimbing Akademik resmi Program Studi Informatika 2024 terdaftar pada Biro Administrasi Akademik (BAA) UNKLAB.
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
            NIDN: {advisor?.nidn || '-'} • FILKOM-IT
          </span>
        </div>
      </div>

      {/* Filter and Academic Metrics Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-blue-600" />
            Tampilkan Periode:
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 shadow-xs"
          >
            <option value="all">Semua Semester (Transkrip Lengkap)</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem.toString()}>
                Semester {sem} {sem === 5 ? '(Semester Aktif / Nilai Dosen)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Academic KPI metrics */}
        <div className="flex items-center gap-3 text-xs bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex-wrap sm:flex-nowrap">
          <div className="px-3">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total SKS</span>
            <span className="text-slate-900 font-extrabold text-sm">{totalCredits} SKS</span>
          </div>
          <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
          <div className="px-3">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">SKS Lulus</span>
            <span className="text-emerald-600 font-extrabold text-sm">{totalPassedCredits} SKS</span>
          </div>
          <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
          <div className="px-3">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total Mutu</span>
            <span className="text-slate-900 font-extrabold text-sm">{totalQualityPoints.toFixed(1)}</span>
          </div>
          <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
          <div className="px-3 bg-blue-50/70 rounded-xl py-1">
            <span className="text-blue-700 block text-[10px] font-bold uppercase">
              {selectedSemester === 'all' ? 'IPK Kumulatif' : 'IPS Semester'}
            </span>
            <span className="text-blue-700 font-black text-base">{computedGpa}</span>
          </div>
        </div>
      </div>

      {/* Academic Honor / Predicate Badge Banner */}
      <div className={`p-4 rounded-2xl border ${academicHonor.color} text-xs font-semibold flex items-center justify-between shadow-xs print:hidden`}>
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 shrink-0" />
          <div>
            <span className="text-slate-500 font-normal">Predikat Kelulusan Akademik: </span>
            <span className="font-extrabold text-sm">{academicHonor.title}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 hidden md:block">
          Data transkrip menggunakan data dummy kurikulum Informatika UNKLAB untuk simulasi & verifikasi.
        </div>
      </div>

      {/* Grade Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border print:border-slate-800 print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] bg-slate-50 print:bg-slate-100 print:border-b-2 print:border-slate-900">
                <th className="py-3 px-4 w-10">No</th>
                <th className="py-3 px-4">Kode MK</th>
                <th className="py-3 px-4">Nama Mata Kuliah</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">SKS</th>
                <th className="py-3 px-4 text-center">Nilai Angka</th>
                <th className="py-3 px-4 text-center">Nilai Huruf</th>
                <th className="py-3 px-4 text-center">Bobot Mutu</th>
                <th className="py-3 px-4 text-center">Mutu (SKS x Bobot)</th>
                <th className="py-3 px-4">Dosen Pengampu IT</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {filteredGrades.map((g, idx) => {
                const mutu = calculateQualityPoints(g.letterGrade, g.credits);
                const isRecentSemester5 = g.semester === 5;

                return (
                  <tr
                    key={g.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isRecentSemester5 ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{g.courseCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{g.courseName}</span>
                        {isRecentSemester5 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-800 print:hidden">
                            <Sparkles className="w-2.5 h-2.5" />
                            Input Dosen
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-medium">Sem {g.semester}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{g.credits}</td>

                    {/* Numeric Score */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {g.score !== undefined ? g.score : '-'}
                    </td>

                    {/* Letter Grade */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block w-8 py-0.5 rounded-md font-extrabold text-xs text-center border ${
                          g.letterGrade.startsWith('A')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : g.letterGrade.startsWith('B')
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : g.letterGrade.startsWith('C')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {g.letterGrade}
                      </span>
                    </td>

                    {/* Grade Point */}
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">
                      {g.gradePoint !== undefined ? g.gradePoint.toFixed(2) : '-'}
                    </td>

                    {/* Total Mutu (SKS x Bobot) */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {mutu.toFixed(2)}
                    </td>

                    {/* Lecturer Name */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] font-medium">
                      {g.lecturerName || '-'}
                    </td>

                    {/* Pass Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          g.isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {g.isPassed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            LULUS
                          </>
                        ) : (
                          'TIDAK LULUS'
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-800 print:bg-slate-100">
                <td colSpan={4} className="py-3 px-4 text-right">TOTAL:</td>
                <td className="py-3 px-4 text-center font-extrabold text-blue-700">{totalCredits} SKS</td>
                <td colSpan={3} className="py-3 px-4 text-right">TOTAL BOBOT MUTU:</td>
                <td className="py-3 px-4 text-center font-mono font-extrabold text-blue-700">{totalQualityPoints.toFixed(2)}</td>
                <td colSpan={2} className="py-3 px-4 text-center font-extrabold text-slate-900">
                  {selectedSemester === 'all' ? 'IPK' : 'IPS'}: <span className="text-blue-600 text-sm">{computedGpa}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Grade Breakdown Visual Cards (Screen only) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs print:hidden space-y-3">
        <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Distribusi Perolehan Nilai Mutu Huruf
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {Object.entries(gradeDistribution).map(([letter, count]) => (
            <div key={letter} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-500 block">Nilai {letter}</span>
              <span className="text-lg font-extrabold text-slate-900 block mt-0.5">{count}</span>
              <span className="text-[10px] text-slate-400">mata kuliah</span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Signatures Section for Printed Transcripts */}
      <div className="hidden print:block pt-8 text-xs text-slate-900">
        <div className="flex justify-between items-start px-8">
          <div className="text-center space-y-16">
            <p>Mengetahui,</p>
            <p className="font-medium">Dekan Fakultas Ilmu Komputer</p>
            <div>
              <p className="font-bold underline text-sm">{dean?.name || 'Stenly R. Pungus, S.Kom., MT., M.M., Ph.D.'}</p>
              <p className="text-[10px] text-slate-600">NIDN: {dean?.nidn || '0912038401'}</p>
            </div>
          </div>

          <div className="text-center space-y-16">
            <p>Airmadidi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-medium">Dosen Pembina Akademik IT 2024</p>
            <div>
              <p className="font-bold underline text-sm">{advisor?.name || activeStudent.academicAdvisorName}</p>
              <p className="text-[10px] text-slate-600">NIDN: {advisor?.nidn || '-'}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-400 text-center text-[10px] text-slate-500">
          Dokumen ini dicetak otomatis dari Sistem Informasi Akademik Mahasiswa Universitas Klabat (SIAM-UNKLAB).
        </div>
      </div>
    </div>
  );
};
