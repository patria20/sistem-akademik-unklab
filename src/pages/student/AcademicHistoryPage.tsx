
import React, { useMemo, useState } from 'react';
import {
  BookCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  XCircle,
  Plus,
  ShieldCheck,
  User,
  Trash2,
  AlertCircle,
  X,
  Info,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { GRADE_POINTS_SCALE, PASSING_GRADES } from '../../utils/gpaCalculator';
import { buildAcademicHistory } from '../../utils/academicHistory';

interface AcademicHistoryPageProps {
  hideHeader?: boolean;
}

const LETTER_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'] as const;
type LetterGradeType = typeof LETTER_GRADES[number];

const ACADEMIC_YEARS = [
  '2022/2023 Ganjil',
  '2022/2023 Genap',
  '2023/2024 Ganjil',
  '2023/2024 Genap',
  '2024/2025 Ganjil',
  '2024/2025 Genap',
  '2025/2026 Ganjil',
  '2025/2026 Genap',
  '2026/2027 Ganjil',
];

export const AcademicHistoryPage: React.FC<AcademicHistoryPageProps> = ({
  hideHeader = false,
}) => {
  const { activeStudent, grades, courses, addStudentGrade, deleteStudentGrade } = useAcademic();
  const currentSemester = activeStudent?.currentSemester ?? 0;

  // State Modal Input Nilai Mandiri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024/2025 Ganjil');
  const [selectedLetterGrade, setSelectedLetterGrade] = useState<LetterGradeType>('A');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data nilai sudah difilter berdasarkan mahasiswa yang login.
  const history = useMemo(
    () => buildAcademicHistory(grades, currentSemester),
    [grades, currentSemester],
  );

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId || c.code === selectedCourseId),
    [courses, selectedCourseId]
  );

  const handleOpenModal = () => {
    setSelectedCourseId(courses[0]?.id || '');
    setSelectedSemester(1);
    setSelectedAcademicYear('2024/2025 Ganjil');
    setSelectedLetterGrade('A');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeStudent) {
      setErrorMessage('Data mahasiswa tidak ditemukan.');
      return;
    }

    if (!selectedCourse) {
      setErrorMessage('Silakan pilih mata kuliah dari kurikulum.');
      return;
    }

    // Validasi cegah duplikasi mata kuliah pada semester dan tahun akademik yang sama
    const isDuplicate = grades.some(
      (g) =>
        (g.courseId === selectedCourse.id || g.courseCode.toLowerCase() === selectedCourse.code.toLowerCase()) &&
        g.semester === Number(selectedSemester) &&
        g.academicYear.trim().toLowerCase() === selectedAcademicYear.trim().toLowerCase()
    );

    if (isDuplicate) {
      setErrorMessage(
        `Mata kuliah ${selectedCourse.code} (${selectedCourse.name}) sudah ada pada Semester ${selectedSemester} Tahun Akademik ${selectedAcademicYear}. Tidak dapat menambahkan mata kuliah yang sama dua kali pada periode tersebut.`
      );
      return;
    }

    try {
      addStudentGrade({
        studentId: activeStudent.id,
        courseId: selectedCourse.id,
        semester: Number(selectedSemester),
        academicYear: selectedAcademicYear,
        letterGrade: selectedLetterGrade,
      });

      setSuccessMessage(
        `Mata kuliah ${selectedCourse.code} - ${selectedCourse.name} berhasil ditambahkan dan berstatus Menunggu Verifikasi.`
      );
      setIsModalOpen(false);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Gagal menambahkan mata kuliah.');
      }
    }
  };

  const handleDelete = (gradeId: string) => {
    if (window.confirm('Batalkan dan hapus pengajuan nilai mandiri ini?')) {
      deleteStudentGrade(gradeId);
    }
  };

  const addButton = (
    <button
      type="button"
      onClick={handleOpenModal}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
    >
      <Plus className="w-4 h-4" />
      <span>Tambah Mata Kuliah</span>
    </button>
  );

  const header = !hideHeader ? (
    <PageHeader
      title="Riwayat Akademik"
      subtitle="Mata kuliah yang sudah kamu ambil pada semester-semester sebelumnya."
      breadcrumbs={[
        { label: 'Mahasiswa', path: '/student/dashboard' },
        { label: 'Riwayat Akademik' },
      ]}
      actions={addButton}
    />
  ) : null;

  if (!activeStudent) {
    return (
      <div className="space-y-6">
        {header}

        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <BookCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            Data mahasiswa tidak ditemukan
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Akun ini belum terhubung dengan data mahasiswa. Hubungi admin akademik.
          </p>
        </div>
      </div>
    );
  }

  const { groups } = history;

  const stats = [
    { label: 'Semester Selesai', value: groups.length, icon: Layers },
    { label: 'Mata Kuliah Diambil', value: history.courseCount, icon: BookCheck },
    { label: 'SKS Lulus', value: history.passedCredits, icon: CheckCircle2 },
    { label: 'IPK Resmi', value: history.cumulativeGpa.toFixed(2), icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {header}

      {/* Action bar jika header disembunyikan (misalnya saat di tab Riwayat Akademik pada halaman Grades) */}
      {hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Riwayat Akademik Mahasiswa
            </h2>
            <p className="text-xs text-slate-500">
              Input mata kuliah mandiri yang pernah diambil pada semester sebelumnya.
            </p>
          </div>
          {addButton}
        </div>
      )}

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Ringkasan Riwayat Akademik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900 leading-tight">
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daftar Riwayat Akademik */}
      {groups.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <BookCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            Belum ada riwayat akademik
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Mata kuliah dari semester sebelumnya akan tampil di sini. Kamu dapat menambahkan mata kuliah mandiri menggunakan tombol di atas.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section
            key={group.key}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Semester {group.semester}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {group.academicYear}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {group.credits} SKS Resmi
                </span>

                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  IPS {group.gpa.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <th className="py-3 px-5">Kode</th>
                    <th className="py-3 px-5">Mata Kuliah</th>
                    <th className="py-3 px-5 text-center">SKS</th>
                    <th className="py-3 px-5 text-center">Nilai</th>
                    <th className="py-3 px-5">Status & Verifikasi</th>
                    <th className="py-3 px-5 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {group.rows.map(({ record: r, countedInCumulative }) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        r.verificationStatus === 'pending'
                          ? 'bg-amber-50/20'
                          : r.verificationStatus === 'rejected'
                            ? 'bg-rose-50/20'
                            : ''
                      }`}
                    >
                      <td className="py-3 px-5 font-mono font-semibold text-blue-700">
                        {r.courseCode}
                      </td>

                      <td className="py-3 px-5 font-medium text-slate-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{r.courseName}</span>
                          {r.inputSource === 'student' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <User className="w-2.5 h-2.5" />
                              Mandiri
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-5 text-center">
                        {r.credits}
                      </td>

                      <td className="py-3 px-5 text-center font-bold text-slate-900">
                        {r.letterGrade}
                      </td>

                      <td className="py-3 px-5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Penanda Status Verifikasi */}
                          {r.verificationStatus === 'pending' ? (
                            <span
                              title="Nilai belum diverifikasi oleh Dosen/Akademik. Belum dihitung ke dalam IPK, IPS, atau SKS lulus."
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-amber-50 text-amber-700 border-amber-200"
                            >
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu Verifikasi
                            </span>
                          ) : r.verificationStatus === 'approved' ? (
                            <span
                              title="Nilai telah disetujui resmi dan masuk ke perhitungan IPK & SKS."
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Disetujui
                            </span>
                          ) : r.verificationStatus === 'rejected' ? (
                            <span
                              title="Nilai ditolak dan tidak diakui dalam perhitungan akademik resmi."
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-rose-50 text-rose-700 border-rose-200"
                            >
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Ditolak
                            </span>
                          ) : (
                            <span
                              title="Data nilai resmi akademik"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-slate-50 text-slate-600 border-slate-200"
                            >
                              <ShieldCheck className="w-3 h-3 text-slate-500" />
                              Resmi
                            </span>
                          )}

                          {/* Status Akademik */}
                          {r.verificationStatus === 'pending' ? (
                            <span className="text-[10px] text-amber-600 font-medium italic">
                              (Belum dihitung)
                            </span>
                          ) : r.verificationStatus === 'rejected' ? (
                            <span className="text-[10px] text-rose-600 font-medium italic">
                              (Tidak dihitung)
                            </span>
                          ) : r.letterGrade === 'IP' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="w-3 h-3" />
                              Berjalan
                            </span>
                          ) : PASSING_GRADES.includes(r.letterGrade) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Lulus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-rose-50 text-rose-700 border-rose-200">
                              <XCircle className="w-3 h-3" />
                              Tidak Lulus
                            </span>
                          )}

                          {!countedInCumulative &&
                            r.verificationStatus !== 'pending' &&
                            r.verificationStatus !== 'rejected' && (
                              <span
                                title="Mata kuliah ini diulang. Nilai ini tidak dipakai untuk IPK dan SKS lulus."
                                className="px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-slate-50 text-slate-600 border-slate-200"
                              >
                                Diulang
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="py-3 px-5 text-center">
                        {r.inputSource === 'student' && r.verificationStatus === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            title="Batalkan / Hapus nilai mandiri"
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      {/* MODAL TAMBAH MATA KULIAH MANDIRI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tambah Mata Kuliah Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Input nilai mata kuliah yang pernah kamu tempuh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {/* Informational Disclaimer */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[11px]">Ketentuan Verifikasi Akademik:</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Nilai yang kamu masukkan akan berstatus <strong>Menunggu Verifikasi (pending)</strong> dengan sumber <code>student</code>. Nilai <strong>belum dihitung</strong> dalam IPK, IPS, atau SKS lulus sampai disetujui secara resmi oleh Dosen Pembina Akademik.
                  </p>
                </div>
              </div>

              {/* 1. Mata Kuliah (Dari Kurikulum) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mata Kuliah (Kurikulum) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  required
                >
                  <option value="" disabled>-- Pilih Mata Kuliah dari Kurikulum --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name} ({c.credits} SKS)
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Otomatis Kurikulum */}
              {selectedCourse && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Kode MK
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {selectedCourse.code}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Bobot SKS
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedCourse.credits} SKS
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Kategori
                    </span>
                    <span className="font-medium text-slate-700 truncate block">
                      {selectedCourse.category}
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Semester Pengambilan & 3. Tahun Akademik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Semester Pengambilan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Tahun Akademik <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                    required
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Nilai Huruf */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nilai Huruf <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {LETTER_GRADES.map((grade) => {
                    const isSelected = selectedLetterGrade === grade;
                    const point = GRADE_POINTS_SCALE[grade];
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setSelectedLetterGrade(grade)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="text-sm font-extrabold">{grade}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {point.toFixed(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Nilai Mutu */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500">Bobot Mutu: </span>
                  <span className="font-bold text-slate-800">
                    {GRADE_POINTS_SCALE[selectedLetterGrade].toFixed(2)}
                  </span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-[11px] text-slate-500">Mutu SKS: </span>
                  <span className="font-bold text-blue-700">
                    {((selectedCourse?.credits || 0) * GRADE_POINTS_SCALE[selectedLetterGrade]).toFixed(2)}
                  </span>
                </div>
                <div>
                  {PASSING_GRADES.includes(selectedLetterGrade) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lulus
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <XCircle className="w-3.5 h-3.5" />
                      Tidak Lulus
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Simpan Mata Kuliah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
