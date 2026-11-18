import React, { useMemo, useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { AcademicHistoryPage } from './AcademicHistoryPage';
import {
  calculateQualityPoints,
  isOfficialGrade,
  getLatestOfficialAttempts,
  PASSING_GRADES,
} from '../../utils/gpaCalculator';
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
  AlertTriangle,
} from 'lucide-react';

type AcademicTab = 'transcript' | 'khs' | 'history';

interface GradesPageProps {
  initialTab?: AcademicTab;
}

export const GradesPage: React.FC<GradesPageProps> = ({
  initialTab = 'transcript',
}) => {
  const { activeStudent, grades, lecturers } = useAcademic();
  const [activeTab, setActiveTab] = useState<AcademicTab>(initialTab);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  // Guard clause: jika data mahasiswa tidak ditemukan, tampilkan pesan aman
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

  // Dosen pembimbing dan Dekan dinamis (tanpa hardcode)
  const advisor = lecturers.find((l) => l.id === activeStudent.academicAdvisorId);
  const dean = lecturers.find((l) => l.title?.includes('Dekan'));

  // Filter nilai ketat hanya untuk mahasiswa yang sedang aktif login
  const studentGrades = useMemo(() => {
    return grades.filter((g) => g.studentId === activeStudent.id);
  }, [grades, activeStudent.id]);

  const officialGrades = useMemo(() => {
    return studentGrades.filter(isOfficialGrade);
  }, [studentGrades]);

  const semesters = [1, 2, 3, 4, 5];

  const handleTabChange = (tab: AcademicTab) => {
    setActiveTab(tab);
    if (tab === 'transcript') {
      setSelectedSemester('all');
    }
    if (tab === 'khs') {
      setSelectedSemester(String(activeStudent.currentSemester || 5));
    }
  };

  const filteredGrades = useMemo(() => {
    if (selectedSemester === 'all') return officialGrades;
    return officialGrades.filter(
      (grade) => grade.semester.toString() === selectedSemester
    );
  }, [officialGrades, selectedSemester]);

  // UNKLAB: untuk Transkrip ('all'), percobaan resmi terbaru (latest attempt) yang dihitung
  const countedAttemptIds = useMemo(() => {
    return new Set(getLatestOfficialAttempts(officialGrades).map((g) => g.id));
  }, [officialGrades]);

  const metricsGrades = useMemo(() => {
    if (selectedSemester === 'all') {
      return officialGrades.filter((g) => countedAttemptIds.has(g.id));
    }
    return filteredGrades;
  }, [selectedSemester, officialGrades, countedAttemptIds, filteredGrades]);

  const totalCredits = useMemo(
    () => metricsGrades.reduce((sum, grade) => sum + grade.credits, 0),
    [metricsGrades]
  );

  const totalPassedCredits = useMemo(
    () =>
      metricsGrades
        .filter((grade) => grade.isPassed && PASSING_GRADES.includes(grade.letterGrade))
        .reduce((sum, grade) => sum + grade.credits, 0),
    [metricsGrades]
  );

  const totalQualityPoints = useMemo(
    () =>
      metricsGrades.reduce(
        (sum, grade) => sum + calculateQualityPoints(grade.letterGrade, grade.credits),
        0
      ),
    [metricsGrades]
  );

  const computedGpa = useMemo(
    () => (totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00'),
    [totalCredits, totalQualityPoints]
  );

  // Predikat kelulusan berdasarkan aturan akademik UNKLAB
  const academicHonor = useMemo(() => {
    const gpa = parseFloat(computedGpa);
    if (gpa >= 3.85) return { title: 'Dengan Pujian Tertinggi (Summa Cum Laude)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (gpa >= 3.75) return { title: 'Dengan Pujian (Magna Cum Laude)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (gpa >= 3.50) return { title: 'Sangat Memuaskan', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (gpa >= 3.00) return { title: 'Memuaskan', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    return { title: 'Cukup', color: 'text-slate-600 bg-slate-50 border-slate-200' };
  }, [computedGpa]);

  // Distribusi nilai huruf
  const gradeDistribution = useMemo(() => {
    const map: Record<string, number> = {
      A: 0,
      'A-': 0,
      'B+': 0,
      B: 0,
      'B-': 0,
      'C+': 0,
      C: 0,
      D: 0,
      F: 0,
    };

    filteredGrades.forEach((grade) => {
      if (map[grade.letterGrade] !== undefined) {
        map[grade.letterGrade]++;
      }
    });

    return map;
  }, [filteredGrades]);

  const handlePrint = () => {
    window.print();
  };

  const isTranscript = selectedSemester === 'all';

  return (
    <div className="space-y-6">
      {/* Screen-only Page Header */}
      {activeTab !== 'history' && (
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
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak {isTranscript ? 'Transkrip Nilai' : `KHS Sem ${selectedSemester}`}
              </button>
            }
          />
        </div>
      )}

      {/* Navigation Tabs (Screen only) */}
      <div className="print:hidden">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleTabChange('transcript')}
            aria-pressed={activeTab === 'transcript'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transcript'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            Transkrip Nilai Kumulatif
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('khs')}
            aria-pressed={activeTab === 'khs'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'khs'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            Kartu Hasil Studi (KHS)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('history')}
            aria-pressed={activeTab === 'history'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            Riwayat Akademik
          </button>
        </div>
      </div>

      {/* Tab: Riwayat Akademik */}
      {activeTab === 'history' && <AcademicHistoryPage />}

      {/* Tab: Transkrip / KHS */}
      {activeTab !== 'history' && (
        <>
          {/* Official Letterhead for Printing */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <h1 className="text-xl font-bold tracking-wider uppercase text-slate-900">
              UNIVERSITAS KLABAT
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              FAKULTAS ILMU KOMPUTER • PROGRAM STUDI INFORMATIKA
            </p>
            <p className="text-[10px] text-slate-500">
              Jl. Arnold Mononutu, Airmadidi Bawah, Kec. Airmadidi, Kab. Minahasa Utara, Sulawesi Utara 95371
            </p>
            <div className="mt-4 pt-2 border-t border-slate-400">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                {isTranscript
                  ? 'TRANSKRIP AKADEMIK SEMENTARA'
                  : `KARTU HASIL STUDI (KHS) SEMESTER ${selectedSemester}`}
              </h2>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-blue-50/50 via-transparent to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  {activeStudent.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{activeStudent.name}</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Terverifikasi BAA UNKLAB
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    NIM: {activeStudent.nim} • {activeStudent.programStudy} ({activeStudent.faculty})
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tahun Akademik: {activeStudent.academicYear} • Semester Aktif: {activeStudent.currentSemester} • Status KRS: {activeStudent.krsStatus.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Quick Academic Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    {isTranscript ? 'IPK Kumulatif' : 'IPS Semester'}
                  </span>
                  <span className="text-lg font-extrabold text-blue-600">{computedGpa}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">SKS Tempuh</span>
                  <span className="text-lg font-extrabold text-slate-800">{totalCredits}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">SKS Lulus</span>
                  <span className="text-lg font-extrabold text-emerald-600">{totalPassedCredits}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Mutu</span>
                  <span className="text-lg font-extrabold text-purple-600">{totalQualityPoints.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Academic Advisor Info */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Dosen Pembina Akademik:{' '}
                  <strong>{advisor?.name || activeStudent.academicAdvisorName}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                NIDN: {advisor?.nidn || '-'} • FILKOM UNKLAB
              </span>
            </div>
          </div>

          {/* Filter Bar and Honor Predicate (Screen only) */}
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
                <option value="all">Semua Semester (Transkrip Kumulatif Lengkap)</option>
                {semesters.map((s) => (
                  <option key={s} value={s.toString()}>
                    Semester {s} {s === activeStudent.currentSemester ? '(Semester Berjalan)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Predikat Kelulusan Badge */}
            {isTranscript && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${academicHonor.color}`}>
                <Award className="w-4 h-4 shrink-0" />
                <span>Predikat Akademik: <strong>{academicHonor.title}</strong></span>
              </div>
            )}
          </div>

          {/* Official Grade Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  {isTranscript
                    ? 'Daftar Nilai Transkrip Lengkap'
                    : `Daftar Mata Kuliah KHS Semester ${selectedSemester}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTranscript
                    ? 'Menampilkan seluruh mata kuliah yang telah diselesaikan beserta nilai mutu dan status kelulusan resmi.'
                    : `Menampilkan mata kuliah yang ditempuh pada Semester ${selectedSemester}.`}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 self-start sm:self-auto shrink-0 print:hidden">
                {filteredGrades.length} Mata Kuliah
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50 print:bg-slate-100">
                    <th className="py-3 px-4 text-center w-12">No</th>
                    <th className="py-3 px-4">Kode MK</th>
                    <th className="py-3 px-4">Nama Mata Kuliah</th>
                    <th className="py-3 px-4 text-center">Semester</th>
                    <th className="py-3 px-4 text-center">SKS</th>
                    <th className="py-3 px-4 text-center">Nilai Angka</th>
                    <th className="py-3 px-4 text-center">Nilai Huruf</th>
                    <th className="py-3 px-4 text-center">Bobot</th>
                    <th className="py-3 px-4 text-center">Total Mutu</th>
                    <th className="py-3 px-4">Dosen Pengampu</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        Tidak ada riwayat nilai untuk semester ini.
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((g, idx) => {
                      const mutu = calculateQualityPoints(g.letterGrade, g.credits);
                      const isCounted = countedAttemptIds.has(g.id);

                      return (
                        <tr
                          key={g.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isTranscript && !isCounted ? 'bg-slate-50/40 text-slate-400' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{g.courseCode}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{g.courseName}</td>
                          <td className="py-3 px-4 text-center text-slate-600">Sem {g.semester}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">{g.credits}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                            {g.score !== undefined ? g.score : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                                ['A', 'A-'].includes(g.letterGrade)
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ['B+', 'B', 'B-'].includes(g.letterGrade)
                                  ? 'bg-blue-100 text-blue-800'
                                  : ['C+', 'C'].includes(g.letterGrade)
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {g.letterGrade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-600">
                            {g.gradePoint !== undefined ? g.gradePoint.toFixed(2) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                            {mutu.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-[11px] font-medium">
                            {g.lecturerName || '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
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
                              {isTranscript && !isCounted && (
                                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                  Diulang
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-800 print:bg-slate-100">
                    <td colSpan={4} className="py-3 px-4 text-right">
                      TOTAL:
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-blue-700">
                      {totalCredits} SKS
                    </td>
                    <td colSpan={3} className="py-3 px-4 text-right">
                      TOTAL BOBOT MUTU:
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-blue-700">
                      {totalQualityPoints.toFixed(2)}
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-center font-extrabold text-slate-900">
                      {isTranscript ? 'IPK' : 'IPS'}:{' '}
                      <span className="text-blue-600 text-sm">{computedGpa}</span>
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
              Distribusi Perolehan Nilai Huruf
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

          {/* Official Signatures Section for Printed Documents */}
          <div className="hidden print:block pt-8 text-xs text-slate-900">
            <div className="flex justify-between items-start px-8">
              <div className="text-center space-y-16">
                <p>Mengetahui,</p>
                <p className="font-medium">Dekan Fakultas Ilmu Komputer</p>
                <div>
                  <p className="font-bold underline text-sm">
                    {dean?.name || 'Stenly R. Pungus, S.Kom., MT., M.M., Ph.D.'}
                  </p>
                  <p className="text-[10px] text-slate-600">NIDN: {dean?.nidn || '0912038401'}</p>
                </div>
              </div>

              <div className="text-center space-y-16">
                <p>
                  Airmadidi,{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="font-medium">Dosen Pembina Akademik IT 2024</p>
                <div>
                  <p className="font-bold underline text-sm">
                    {advisor?.name || activeStudent.academicAdvisorName}
                  </p>
                  <p className="text-[10px] text-slate-600">NIDN: {advisor?.nidn || '-'}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-400 text-center text-[10px] text-slate-500">
              Dokumen ini dicetak otomatis dari Sistem Informasi Akademik Mahasiswa Universitas Klabat (SIAM-UNKLAB).
            </div>
          </div>
        </>
      )}
    </div>
  );
};
