
import React, { useState, useMemo, useEffect } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  validateStudyPlan,
  checkPrerequisite,
  validateClassCapacity,
} from '../../utils/academicValidator';
import type { CourseClass, StudyPlanItem } from '../../types/academic';
import {
  calculateCumulativeGPA,
  calculateMaxCreditLimit,
  PASSING_GRADES,
} from '../../utils/gpaCalculator';
import {
  Search,
  Trash2,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  Send,
  Save,
  Info,
  AlertCircle,
} from 'lucide-react';

export const StudyPlanPage: React.FC = () => {
  const {
    activeStudent,
    courses,
    classes,
    activeKrs,
    grades,
    saveKrsDraft,
    submitKrs,
  } = useAcademic();

  const { success, warning } = useToast();

  // Mata kuliah yang sudah lulus dan memenuhi standar nilai kelulusan.
  const passedCourseIds = useMemo(
    () =>
      Array.from(
        new Set(
          grades
            .filter(
              (grade) =>
                grade.isPassed &&
                PASSING_GRADES.includes(grade.letterGrade)
            )
            .map((grade) => grade.courseId)
        )
      ),
    [grades]
  );

  // Menghitung IPK kumulatif.
  const cumulativeGpa = useMemo(
    () => calculateCumulativeGPA(grades),
    [grades]
  );

  // Batas maksimal SKS berdasarkan IPK.
  const maxCreditLimit = useMemo(
    () => calculateMaxCreditLimit(cumulativeGpa),
    [cumulativeGpa]
  );

  // Sinkronkan pilihan kelas ketika mahasiswa atau KRS aktif berubah.
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [studentNotes, setStudentNotes] = useState<string>('');

  useEffect(() => {
    setSelectedClassIds(activeKrs?.items.map((item) => item.classId) || []);
    setStudentNotes(activeKrs?.notes || '');
  }, [activeStudent?.id, activeKrs?.id]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Selected classes objects
  const selectedClasses = useMemo(() => {
    return classes.filter((c) => selectedClassIds.includes(c.id));
  }, [classes, selectedClassIds]);

  // Master Academic Validation
  const validationResult = useMemo(() => {
    return validateStudyPlan(
      selectedClasses,
      courses,
      passedCourseIds,
      maxCreditLimit
    );
  }, [selectedClasses, courses, passedCourseIds, maxCreditLimit]);

  const totalSelectedCredits = useMemo(() => {
    return selectedClasses.reduce((sum, c) => sum + (c.credits || 0), 0);
  }, [selectedClasses]);

  // Filter Catalog: tampilkan seluruh mata kuliah dari kurikulum.
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSemester =
        selectedSemester === 'all' ||
        course.semester.toString() === selectedSemester;

      return matchesSearch && matchesSemester;
    });
  }, [courses, searchQuery, selectedSemester]);

  // Pilih kelas; jika paralel lain dari mata kuliah yang sama dipilih,
  // paralel lama akan diganti.
  const handleToggleClass = (cls: CourseClass) => {
    setSelectedClassIds((currentIds) => {
      if (currentIds.includes(cls.id)) {
        return currentIds.filter((id) => id !== cls.id);
      }

      const existingSectionId = currentIds.find((id) =>
        classes.find((currentClass) => currentClass.id === id)?.courseId === cls.courseId
      );

      return existingSectionId
        ? currentIds.map((id) => (id === existingSectionId ? cls.id : id))
        : [...currentIds, cls.id];
    });

    setSaveSuccessMessage(null);
  };

  const handleRemoveClass = (classId: string) => {
    setSelectedClassIds((currentIds) =>
      currentIds.filter((id) => id !== classId)
    );
    setSaveSuccessMessage(null);
  };

  const buildItems = (status: StudyPlanItem['status']): StudyPlanItem[] => {
    if (!activeStudent) return [];

    const studyPlanId =
      activeKrs?.id ||
      `krs_${activeStudent.id}_sem${activeStudent.currentSemester}`;

    return selectedClasses.map((cls) => ({
      id: `itm_${studyPlanId}_${cls.id}`,
      studyPlanId,
      classId: cls.id,
      courseId: cls.courseId,
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      credits: cls.credits,
      section: cls.section,
      day: cls.day,
      startTime: cls.startTime,
      endTime: cls.endTime,
      room: cls.room,
      lecturerName: cls.lecturerName,
      status,
    }));
  };

  const handleSaveDraft = () => {
    if (!activeStudent) return;

    try {
      saveKrsDraft(buildItems('draft'), studentNotes);
      setSaveSuccessMessage('Draft KRS berhasil disimpan di sistem.');

      success(
        'Draf KRS Tersimpan',
        'Perubahan rencana studi Anda telah tersimpan secara lokal.'
      );
    } catch (error) {
      warning(
        'Draft KRS Gagal Disimpan',
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan draft.'
      );
    }
  };

  const handleConfirmSubmit = () => {
    if (!activeStudent) return;

    const finalValidation = validateStudyPlan(
      selectedClasses,
      courses,
      passedCourseIds,
      maxCreditLimit
    );

    if (!finalValidation.isValid) {
      warning(
        'KRS Belum Dapat Diajukan',
        'Periksa kembali kesalahan validasi sebelum mengirim KRS.'
      );
      setIsSubmitModalOpen(false);
      return;
    }

    try {
      submitKrs(buildItems('submitted'), studentNotes);
      setIsSubmitModalOpen(false);
      setSaveSuccessMessage(
        'KRS berhasil dikirim kepada Dosen PA untuk persetujuan.'
      );

      success(
        'KRS Berhasil Dikirim',
        'Pengajuan KRS Anda telah diteruskan ke Dosen PA untuk diverifikasi.'
      );
    } catch (error) {
      warning(
        'Pengajuan KRS Gagal',
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengajukan KRS.'
      );
    }
  };

  const isLocked = activeStudent?.krsStatus === 'approved';

  if (!activeStudent) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kartu Rencana Studi (KRS Builder)"
        subtitle={`Semester Ganjil 2026/2027 — Dosen PA: ${activeStudent.academicAdvisorName}`}
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Rencana Studi (KRS)' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Status KRS:
            </span>
            <StatusBadge status={activeStudent.krsStatus} />
          </div>
        }
      />

      {/* Save / Submit notification feedback */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Advisor Feedback Alert if in Revision status */}
      {activeKrs?.advisorFeedback && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Catatan / Feedback dari Dosen Pembimbing Akademik:</span>
          </div>
          <p className="text-amber-800 italic pl-6">
            "{activeKrs.advisorFeedback}"
          </p>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Course Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#142B4A]">
                  Katalog Kelas Perkuliahan
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih mata kuliah & seksi yang sesuai dengan kurikulum Anda
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="all">Semua Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5 (Paket Aktif)</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama mata kuliah, kode, atau dosen pengampu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {/* Course List */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredCourses.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada mata kuliah yang cocok dengan kata kunci pencarian.
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const courseClasses = classes.filter(
                    (cls) => cls.courseId === course.id
                  );

                  const prereqStatus = checkPrerequisite(
                    course,
                    passedCourseIds,
                    courses
                  );

                  const isRepetition = passedCourseIds.includes(course.id);

                  return (
                    <div
                      key={course.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white"
                    >
                      {/* Course Information */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                              {course.code}
                            </span>

                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                              Semester {course.semester}
                            </span>

                            <span className="text-xs font-bold text-slate-700">
                              {course.credits} SKS
                            </span>

                            <span className="text-[10px] text-slate-500">
                              {course.category}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm mt-1">
                            {course.name}
                          </h3>
                        </div>
                      </div>

                      {/* Prerequisite and Repetition Information */}
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {!prereqStatus.satisfied && (
                          <span className="text-red-600 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Butuh Prasyarat: {prereqStatus.missing.join(', ')}
                          </span>
                        )}

                        {isRepetition && (
                          <span className="text-amber-600 text-[10px] font-medium">
                            Pernah diambil / perbaikan
                          </span>
                        )}
                      </div>

                      {/* Available Classes */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-600 mb-2">
                          Kelas yang tersedia:
                        </p>

                        {courseClasses.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">
                            Belum ada kelas tersedia untuk mata kuliah ini.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {courseClasses.map((cls) => {
                              const isSelected = selectedClassIds.includes(cls.id);
                              const capacityStatus = validateClassCapacity(cls);

                              return (
                                <div
                                  key={cls.id}
                                  className={`p-3 rounded-lg border ${
                                    isSelected
                                      ? 'border-blue-600 bg-blue-50/40'
                                      : 'border-slate-200 bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-bold text-slate-700">
                                        Paralel {cls.section}
                                      </span>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[10px] text-slate-600">
                                        <span>
                                          <Calendar className="w-3 h-3 inline mr-1 text-blue-600" />
                                          {cls.day}, {cls.startTime}-{cls.endTime}
                                        </span>

                                        <span>
                                          <MapPin className="w-3 h-3 inline mr-1" />
                                          {cls.room}
                                        </span>

                                        <span>
                                          <User className="w-3 h-3 inline mr-1" />
                                          {cls.lecturerName}
                                        </span>

                                        <span
                                          className={
                                            capacityStatus.isFull
                                              ? 'text-red-600 font-bold'
                                              : ''
                                          }
                                        >
                                          Kapasitas: {cls.enrolled}/{cls.capacity}
                                          {capacityStatus.isFull && ' (PENUH)'}
                                        </span>
                                      </div>
                                    </div>

                                    <button
                                      disabled={
                                        isLocked ||
                                        (!isSelected && capacityStatus.isFull)
                                      }
                                      onClick={() => handleToggleClass(cls)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 ${
                                        isLocked ||
                                        (!isSelected && capacityStatus.isFull)
                                          ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                                          : isSelected
                                          ? 'bg-red-50 text-red-600 border border-red-200'
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      {isSelected ? 'Hapus' : 'Pilih Kelas'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Study Plan Summary Panel */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#142B4A]">
                  Ringkasan Rencana Studi
                </h2>
                <p className="text-xs text-slate-500">
                  Mata kuliah yang Anda pilih untuk diajukan
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {selectedClasses.length} Mata Kuliah
              </span>
            </div>

            {/* SKS Limit Gauge */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Total Beban SKS:
                </span>

                <span
                  className={`text-sm font-black ${
                    totalSelectedCredits > maxCreditLimit
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  {totalSelectedCredits} / {maxCreditLimit} SKS
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    totalSelectedCredits > maxCreditLimit
                      ? 'bg-red-600'
                      : totalSelectedCredits >= maxCreditLimit * 0.85
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (totalSelectedCredits / maxCreditLimit) * 100
                    )}%`,
                  }}
                ></div>
              </div>

              <p className="text-[10px] text-slate-500 text-right">
                Batas maksimal berdasarkan IPK kumulatif (
                {cumulativeGpa !== null
                  ? cumulativeGpa.toFixed(2)
                  : 'Belum tersedia'}
                ): <strong>{maxCreditLimit} SKS</strong>
              </p>
            </div>

            {/* Validation Engine Feedback Panel */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Status Validasi Akademik Deterministik
              </h3>

              {validationResult.errors.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Validasi Berhasil! Beban SKS, prasyarat, dan jadwal perkuliahan Anda memenuhi seluruh aturan akademik.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      Ditemukan {validationResult.errors.length} Masalah Validasi:
                    </span>
                  </div>

                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    {validationResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold text-amber-900">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Catatan Peringatan:</span>
                  </div>

                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {validationResult.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Selected Courses Table / List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Mata Kuliah Terpilih
              </h3>

              {selectedClasses.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada kelas yang dipilih. Silakan pilih dari katalog di sebelah kiri.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 truncate">
                          {cls.courseName}
                        </p>

                        <p className="text-[10px] text-slate-500 font-mono">
                          {cls.courseCode} (Paralel {cls.section}) • {cls.credits} SKS • {cls.day}{' '}
                          {cls.startTime}
                        </p>
                      </div>

                      <button
                        disabled={isLocked}
                        onClick={() => handleRemoveClass(cls.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Hapus mata kuliah"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Notes to Advisor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Catatan Mahasiswa untuk Dosen PA
              </label>

              <textarea
                disabled={isLocked}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                rows={2}
                placeholder="Tulis pesan atau alasan pemilihan mata kuliah untuk Dosen PA..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isLocked || selectedClasses.length === 0}
                onClick={handleSaveDraft}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Simpan Draft
              </button>

              <button
                disabled={
                  isLocked ||
                  selectedClasses.length === 0 ||
                  !validationResult.isValid
                }
                onClick={() => setIsSubmitModalOpen(true)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Kirim KRS ke Dosen PA
              </button>
            </div>

            {isLocked && (
              <p className="text-[11px] text-center text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg">
                KRS Anda telah disetujui secara resmi. Rencana studi tidak dapat diubah kembali kecuali dengan persetujuan Kaprodi.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Kirimkan Rencana Studi ke Dosen PA?
            </h3>

            <p className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
              Anda akan mengirimkan{' '}
              <strong>
                {selectedClasses.length} mata kuliah ({totalSelectedCredits} SKS)
              </strong>{' '}
              ke Dosen Pembina Akademik Anda (
              <strong>{activeStudent.academicAdvisorName}</strong>).
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Nama Mahasiswa:</span>
                <span className="font-semibold text-slate-800">
                  {activeStudent.name}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>NIM:</span>
                <span className="font-mono text-slate-800">
                  {activeStudent.nim}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Total SKS Terpilih:</span>
                <span className="font-bold text-blue-600">
                  {totalSelectedCredits} SKS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                Batal
              </button>

              <button
                disabled={!validationResult.isValid}
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Konfirmasi & Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
