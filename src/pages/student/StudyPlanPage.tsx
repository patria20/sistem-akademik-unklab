import React, { useState, useMemo } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { validateStudyPlan, checkPrerequisite, validateClassCapacity } from '../../utils/academicValidator';
import type { CourseClass, StudyPlanItem } from '../../types/academic';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  Send,
  Save,
  Info,
  Check,
  AlertCircle,
  HelpCircle,
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

  if (!activeStudent) return null;

  // Passed Course IDs
  const passedCourseIds = useMemo(
    () => grades.filter((g) => g.isPassed).map((g) => g.courseId),
    [grades]
  );

  // Basket / Selected Classes State initialized from activeKrs
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() => {
    return activeKrs?.items.map((i) => i.classId) || [];
  });

  const [studentNotes, setStudentNotes] = useState<string>(activeKrs?.notes || '');
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
      activeStudent.maxCreditLimit
    );
  }, [selectedClasses, courses, passedCourseIds, activeStudent.maxCreditLimit]);

  const totalSelectedCredits = useMemo(() => {
    return selectedClasses.reduce((sum, c) => sum + (c.credits || 0), 0);
  }, [selectedClasses]);

  // Filter Catalog
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const course = courses.find((c) => c.id === cls.courseId);
      const matchesSearch =
        cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSemester =
        selectedSemester === 'all' || (course && course.semester.toString() === selectedSemester);

      return matchesSearch && matchesSemester;
    });
  }, [classes, courses, searchQuery, selectedSemester]);

  // Handle Add/Remove Class
  const handleToggleClass = (cls: CourseClass) => {
    if (selectedClassIds.includes(cls.id)) {
      setSelectedClassIds(selectedClassIds.filter((id) => id !== cls.id));
    } else {
      // Check if already selected another section of the same course
      const sameCourseClass = selectedClasses.find((sc) => sc.courseId === cls.courseId);
      if (sameCourseClass) {
        // Swap section
        setSelectedClassIds([...selectedClassIds.filter((id) => id !== sameCourseClass.id), cls.id]);
      } else {
        setSelectedClassIds([...selectedClassIds, cls.id]);
      }
    }
    setSaveSuccessMessage(null);
  };

  const handleRemoveClass = (classId: string) => {
    setSelectedClassIds(selectedClassIds.filter((id) => id !== classId));
    setSaveSuccessMessage(null);
  };

  // Build StudyPlanItem array from selectedClasses
  const buildItems = (): StudyPlanItem[] => {
    return selectedClasses.map((cls) => ({
      id: `itm_${cls.id}_${Date.now()}`,
      studyPlanId: activeKrs?.id || `krs_${activeStudent.id}`,
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
      status: activeKrs?.status || 'draft',
    }));
  };

  const handleSaveDraft = () => {
    saveKrsDraft(buildItems(), studentNotes);
    setSaveSuccessMessage('Draft KRS berhasil disimpan di sistem.');
    success('Draf KRS Tersimpan', 'Perubahan rencana studi Anda telah tersimpan secara lokal.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleConfirmSubmit = () => {
    submitKrs(buildItems(), studentNotes);
    setIsSubmitModalOpen(false);
    setSaveSuccessMessage('KRS berhasil dikirim ke Dosen PA Dr. Ronny Gosal untuk persetujuan.');
    success('KRS Berhasil Dikirim', 'Pengajuan KRS Anda telah diteruskan ke Dosen PA untuk diverifikasi.');
  };

  const isLocked = activeStudent.krsStatus === 'approved';

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
            <span className="text-xs text-slate-500 hidden sm:inline">Status KRS:</span>
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
          <p className="text-amber-800 italic pl-6">"{activeKrs.advisorFeedback}"</p>
        </div>
      )}

      {/* Two Column Workspace: Left (Catalog) & Right (Selected Summary Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Course Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#142B4A]">Katalog Kelas Perkuliahan</h2>
                <p className="text-xs text-slate-500">Pilih mata kuliah & seksi yang sesuai dengan kurikulum Anda</p>
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
              {filteredClasses.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada mata kuliah yang cocok dengan kata kunci pencarian.
                </div>
              ) : (
                filteredClasses.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls.id);
                  const course = courses.find((c) => c.id === cls.courseId);
                  const prereqStatus = course
                    ? checkPrerequisite(course, passedCourseIds, courses)
                    : { satisfied: true, missing: [] };
                  const capacityStatus = validateClassCapacity(cls);
                  const isRepetition = passedCourseIds.includes(cls.courseId);

                  return (
                    <div
                      key={cls.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                              {cls.courseCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                              Seksi {cls.section}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {cls.credits} SKS
                            </span>
                            {course && (
                              <span className="text-[10px] text-slate-500">
                                Sem {course.semester} • {course.category}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-1">{cls.courseName}</h3>
                        </div>

                        {/* Action Button */}
                        <button
                          disabled={isLocked}
                          onClick={() => handleToggleClass(cls)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                            isLocked
                              ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                              : isSelected
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Pilih Kelas
                            </>
                          )}
                        </button>
                      </div>

                      {/* Timetable, Room, Lecturer Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            {cls.day}, {cls.startTime}-{cls.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cls.room}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cls.lecturerName}</span>
                        </div>
                      </div>

                      {/* Capacity & Badges */}
                      <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100/60 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              capacityStatus.isFull ? 'text-red-600 font-bold' : 'text-slate-600'
                            }`}
                          >
                            Kapasitas: {cls.enrolled} / {cls.capacity} Mahasiswa
                          </span>
                          {capacityStatus.isFull && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 font-bold text-[9px]">
                              KELAS PENUH
                            </span>
                          )}
                        </div>

                        {/* Prerequisite feedback on card */}
                        {!prereqStatus.satisfied && (
                          <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Butuh Prasyarat: {prereqStatus.missing.join(', ')}</span>
                          </div>
                        )}
                        {isRepetition && (
                          <span className="text-amber-600 text-[10px] font-medium">
                            (Pernah diambil / perbaikan)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Study Plan Summary Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#142B4A]">Ringkasan Rencana Studi</h2>
                <p className="text-xs text-slate-500">Mata kuliah yang Anda pilih untuk diajukan</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {selectedClasses.length} Mata Kuliah
              </span>
            </div>

            {/* SKS Limit Gauge */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Total Beban SKS:</span>
                <span
                  className={`text-sm font-black ${
                    totalSelectedCredits > activeStudent.maxCreditLimit
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  {totalSelectedCredits} / {activeStudent.maxCreditLimit} SKS
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    totalSelectedCredits > activeStudent.maxCreditLimit
                      ? 'bg-red-600'
                      : totalSelectedCredits >= activeStudent.maxCreditLimit * 0.85
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (totalSelectedCredits / activeStudent.maxCreditLimit) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 text-right">
                Batas maksimal berdasarkan IPS lalu ({activeStudent.lastSemesterGpa.toFixed(2)}):{' '}
                <strong>{activeStudent.maxCreditLimit} SKS</strong>
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
                    <span>Ditemukan {validationResult.errors.length} Masalah Validasi:</span>
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
                        <p className="font-bold text-slate-800 truncate">{cls.courseName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {cls.courseCode} (Seksi {cls.section}) • {cls.credits} SKS • {cls.day}{' '}
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
              Anda akan mengirimkan <strong>{selectedClasses.length} mata kuliah ({totalSelectedCredits} SKS)</strong>{' '}
              ke Dosen Pembina Akademik Anda (<strong>{activeStudent.academicAdvisorName}</strong>).
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Nama Mahasiswa:</span>
                <span className="font-semibold text-slate-800">{activeStudent.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>NIM:</span>
                <span className="font-mono text-slate-800">{activeStudent.nim}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total SKS Terpilih:</span>
                <span className="font-bold text-blue-600">{totalSelectedCredits} SKS</span>
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
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs"
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
