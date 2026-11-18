
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
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Calendar,
  UserCheck,
} from 'lucide-react';

type AcademicTab = 'transcript' | 'khs' | 'history';

interface GradesPageProps {
  initialTab?: AcademicTab;
}

export const GradesPage: React.FC<GradesPageProps> = ({
  initialTab = 'transcript',
}) => {
  const { activeStudent, grades } = useAcademic();

  const [activeTab, setActiveTab] = useState<AcademicTab>(initialTab);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  if (!activeStudent) return null;

  const semesters = [1, 2, 3, 4, 5];

  const handleTabChange = (tab: AcademicTab) => {
    setActiveTab(tab);

    if (tab === 'transcript') {
      setSelectedSemester('all');
    }

    if (tab === 'khs') {
      setSelectedSemester(String(activeStudent.currentSemester));
    }
  };

  const officialGrades = useMemo(() => {
    return grades.filter(isOfficialGrade);
  }, [grades]);

  const filteredGrades = useMemo(() => {
    if (selectedSemester === 'all') return officialGrades;

    return officialGrades.filter(
      (grade) => grade.semester.toString() === selectedSemester
    );
  }, [officialGrades, selectedSemester]);

  const countedAttemptIds = useMemo(() => {
    return new Set(getLatestOfficialAttempts(officialGrades).map((g) => g.id));
  }, [officialGrades]);

  // Untuk Transkrip ('all'), metrik kumulatif dihitung HANYA dari percobaan terbaru (latest attempt).
  // Untuk KHS (semester tertentu), metrik dihitung dari seluruh mata kuliah pada semester tersebut.
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
        (sum, grade) =>
          sum + calculateQualityPoints(grade.letterGrade, grade.credits),
        0
      ),
    [metricsGrades]
  );

  const computedGpa = useMemo(
    () =>
      totalCredits > 0
        ? (totalQualityPoints / totalCredits).toFixed(2)
        : '0.00',
    [totalCredits, totalQualityPoints]
  );

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
      {/* Page Header */}
      {activeTab !== 'history' && (
        <div className="print:hidden">
          <PageHeader
            title="Transkrip & Riwayat Akademik"
            subtitle="Informasi transkrip nilai, kartu hasil studi, dan riwayat akademik mahasiswa Universitas Klabat (UNKLAB)"
            breadcrumbs={[
              { label: 'Mahasiswa', path: '/student/dashboard' },
              { label: 'Transkrip & Riwayat Akademik' },
            ]}
            actions={
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Cetak {activeTab === 'transcript' ? 'Transkrip' : 'KHS'}
              </button>
            }
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="print:hidden">
        <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleTabChange('transcript')}
            aria-pressed={activeTab === 'transcript'}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'transcript'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/70'
            }`}
          >
            Transkrip
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('khs')}
            aria-pressed={activeTab === 'khs'}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'khs'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/70'
            }`}
          >
            Kartu Hasil Studi (KHS)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('history')}
            aria-pressed={activeTab === 'history'}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/70'
            }`}
          >
            Riwayat Akademik
          </button>
        </div>
      </div>

      {/* Academic History Tab */}
      {activeTab === 'history' ? (
        <AcademicHistoryPage hideHeader />
      ) : (
        <>
          {/* Printable Official Header */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
            <div className="text-center space-y-1">
              <p className="font-extrabold text-base tracking-wider uppercase text-slate-900">
                UNIVERSITAS KLABAT
              </p>

              <p className="font-bold text-sm tracking-wide text-slate-800 uppercase">
                FAKULTAS ILMU KOMPUTER — PROGRAM STUDI INFORMATIKA
              </p>

              <p className="text-[11px] text-slate-600">
                Jl. Arnold Mononutu, Airmadidi Bawah, Kec. Airmadidi,
                Kab. Minahasa Utara, Sulawesi Utara 95371
              </p>

              <div className="h-0.5 bg-slate-900 w-full mt-2" />

              <h2 className="text-sm font-black uppercase tracking-widest pt-3 text-slate-900">
                {isTranscript
                  ? 'TRANSKRIP AKADEMIK SEMENTARA'
                  : `KARTU HASIL STUDI (KHS) — SEMESTER ${selectedSemester}`}
              </h2>

              <p className="text-[10px] text-slate-500 font-mono">
                No. Dokumen: UNKLAB/FILKOM/TR-
                {new Date().getFullYear()}/{activeStudent.nim}
              </p>
            </div>
          </div>

          {/* Student Identity */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-0.5">
                <p className="text-slate-400 font-medium text-[11px]">
                  Nama Mahasiswa
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {activeStudent.name}
                </p>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeStudent.nim}
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-slate-400 font-medium text-[11px]">
                  Fakultas / Program Studi
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {activeStudent.programStudy}
                </p>
                <span className="text-[11px] text-slate-500">
                  {activeStudent.faculty}
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-slate-400 font-medium text-[11px]">
                  Semester & Tahun Akademik
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  Semester {activeStudent.currentSemester}
                </p>
                <span className="text-[11px] text-slate-500">
                  {activeStudent.academicYear}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-medium text-[11px]">
                  Dosen Pembina Akademik (PA)
                </p>
                <p className="font-bold text-blue-700 text-sm">
                  {activeStudent.academicAdvisorName}
                </p>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span>Dosen Pembimbing IT 2024 Terverifikasi</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  Dosen Pembimbing Akademik resmi Program Studi Informatika
                  2024 terdaftar pada Biro Administrasi Akademik (BAA) UNKLAB.
                </span>
              </div>

              <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                NIDN: 0914097501 • FILKOM-IT
              </span>
            </div>
          </div>

          {/* Semester Filter and Academic Metrics */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
                Tampilkan Periode:
              </label>

              <select
                value={selectedSemester}
                onChange={(event) => setSelectedSemester(event.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 shadow-xs"
              >
                {activeTab === 'transcript' && (
                  <option value="all">
                    Semua Semester (Transkrip Lengkap)
                  </option>
                )}

                {semesters.map((semester) => (
                  <option key={semester} value={semester.toString()}>
                    Semester {semester}
                    {semester === activeStudent.currentSemester
                      ? ' (Semester Aktif)'
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic KPI */}
            <div className="flex items-center gap-3 text-xs bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex-wrap sm:flex-nowrap">
              <div className="px-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Total SKS
                </span>
                <span className="text-slate-900 font-extrabold text-sm">
                  {totalCredits} SKS
                </span>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block" />

              <div className="px-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  SKS Lulus
                </span>
                <span className="text-emerald-600 font-extrabold text-sm">
                  {totalPassedCredits} SKS
                </span>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block" />

              <div className="px-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Total Mutu
                </span>
                <span className="text-slate-900 font-extrabold text-sm">
                  {totalQualityPoints.toFixed(2)}
                </span>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block" />

              <div className="px-3 bg-blue-50/70 rounded-xl py-1">
                <span className="text-blue-700 block text-[10px] font-bold uppercase">
                  {isTranscript ? 'IPK Kumulatif' : 'IPS Semester'}
                </span>
                <span className="text-blue-700 font-black text-base">
                  {computedGpa}
                </span>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredGrades.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">
                Belum Ada Data Nilai
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Belum terdapat nilai untuk periode akademik yang dipilih.
              </p>
            </div>
          ) : (
            <>
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
                        <th className="py-3 px-4 text-center">
                          Mutu (SKS x Bobot)
                        </th>
                        <th className="py-3 px-4">Dosen Pengampu IT</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                      {filteredGrades.map((grade, index) => {
                        const mutu = calculateQualityPoints(
                          grade.letterGrade,
                          grade.credits
                        );

                        const isRecentSemester =
                          grade.semester === activeStudent.currentSemester;
                        const isCountedInCumulative = countedAttemptIds.has(grade.id);

                        return (
                          <tr
                            key={grade.id}
                            className={`hover:bg-slate-50/70 transition-colors ${
                              isRecentSemester ? 'bg-blue-50/30' : ''
                            } ${isTranscript && !isCountedInCumulative ? 'opacity-70 bg-slate-50/50' : ''}`}
                          >
                            <td className="py-3 px-4 text-slate-400 font-medium">
                              {index + 1}
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-slate-700">
                              {grade.courseCode}
                            </td>

                            <td className="py-3 px-4 font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{grade.courseName}</span>

                                {isRecentSemester && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-800 print:hidden">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Input Dosen
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-center text-slate-600 font-medium">
                              Sem {grade.semester}
                            </td>

                            <td className="py-3 px-4 text-center font-bold text-slate-800">
                              {grade.credits}
                            </td>

                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                              {grade.score !== undefined
                                ? grade.score
                                : grade.letterGrade === 'A'
                                  ? 90
                                  : grade.letterGrade === 'A-'
                                    ? 82
                                    : 78}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block w-8 py-0.5 rounded-md font-extrabold text-xs text-center border ${
                                  grade.letterGrade.startsWith('A')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : grade.letterGrade.startsWith('B')
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : grade.letterGrade.startsWith('C')
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                {grade.letterGrade}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-center font-semibold text-slate-600">
                              {grade.gradePoint.toFixed(2)}
                            </td>

                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                              {mutu.toFixed(2)}
                            </td>

                            <td className="py-3 px-4 text-slate-600 text-[11px] font-medium">
                              {grade.lecturerName ||
                                activeStudent.academicAdvisorName}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    grade.isPassed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {grade.isPassed ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      LULUS
                                    </>
                                  ) : (
                                    'TIDAK LULUS'
                                  )}
                                </span>

                                {isTranscript && !isCountedInCumulative && (
                                  <span
                                    title="Mata kuliah ini diulang. Nilai ini digantikan oleh percobaan terbaru."
                                    className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200"
                                  >
                                    Diulang
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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

                        <td
                          colSpan={2}
                          className="py-3 px-4 text-center font-extrabold text-slate-900"
                        >
                          {isTranscript ? 'IPK' : 'IPS'}:{' '}
                          <span className="text-blue-600 text-sm">
                            {computedGpa}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs print:hidden space-y-3">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Distribusi Perolehan Nilai Huruf
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                  {Object.entries(gradeDistribution).map(([letter, count]) => (
                    <div
                      key={letter}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center"
                    >
                      <span className="text-xs font-bold text-slate-500 block">
                        Nilai {letter}
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 block mt-0.5">
                        {count}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        mata kuliah
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Official Signatures for Printed Documents */}
          <div className="hidden print:block pt-8 text-xs text-slate-900">
            <div className="flex justify-between items-start px-8">
              <div className="text-center space-y-16">
                <p>Mengetahui,</p>
                <p className="font-medium">
                  Dekan Fakultas Ilmu Komputer
                </p>

                <div>
                  <p className="font-bold underline text-sm">
                    Stenly R. Pungus, S.Kom., MT., M.M., Ph.D.
                  </p>
                  <p className="text-[10px] text-slate-600">
                    NIDN: 0912038401
                  </p>
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

                <p className="font-medium">
                  Dosen Pembina Akademik IT 2024
                </p>

                <div>
                  <p className="font-bold underline text-sm">
                    {activeStudent.academicAdvisorName}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    NIDN: 0914097501
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-400 text-center text-[10px] text-slate-500">
              Dokumen ini dicetak otomatis dari Sistem Informasi Akademik
              Mahasiswa Universitas Klabat (SIAM-UNKLAB).
            </div>
          </div>
        </>
      )}
    </div>
  );
};
