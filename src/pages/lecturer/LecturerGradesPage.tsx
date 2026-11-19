import React, { useState, useEffect, useMemo } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Save,
  CheckCircle2,
  Award,
  BookOpen,
  Search,
  Sparkles,
  BarChart3,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Users,
  GraduationCap,
  Clock,
  XCircle,
  FileCheck,
} from 'lucide-react';

export const LecturerGradesPage: React.FC = () => {
  const {
    classes,
    students,
    studyPlans,
    activeLecturer,
    saveClassGrades,
    allGrades,
    verifyGradeRecord,
  } = useAcademic();
  const [activeTab, setActiveTab] = useState<'classes' | 'verification'>('classes');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<{ message: string; count: number } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [verifFilter, setVerifFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [verifActionMessage, setVerifActionMessage] = useState<string | null>(null);

  // Filter classes taught by active lecturer only (no fallback to all classes)
  const lecturerClasses = useMemo(() => {
    return classes.filter((c) => c.lecturerId === activeLecturer?.id);
  }, [classes, activeLecturer]);

  useEffect(() => {
    if (!selectedClassId && lecturerClasses.length > 0) {
      setSelectedClassId(lecturerClasses[0].id);
    }
  }, [selectedClassId, lecturerClasses]);

  const currentClass = classes.find((c) => c.id === selectedClassId) || null;

  // Local state for inputting student grades
  const [gradesInput, setGradesInput] = useState<Record<string, { tugas: number; uts: number; uas: number }>>({});

  // Students enrolled in the currently selected class (via study plan classId references)
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    const enrolledStudentIds = new Set(
studyPlans
  .filter(
    (sp) =>
      sp.status === 'approved' &&
      sp.items.some((item) => item.classId === currentClass.id)
  )
  .map((sp) => sp.studentId)
    );
    return students.filter((std) => enrolledStudentIds.has(std.id));
  }, [currentClass, students, studyPlans]);

  // Sync inputs with existing records in storage when selected class changes
  useEffect(() => {
    if (!currentClass) {
      setGradesInput({});
      setIsDirty(false);
      return;
    }

    // Only existing grades for this exact class (studentId + classId, never courseCode fallback)
    const classExistingGrades = allGrades.filter(
      (g) => g.classId === currentClass.id
    );

    const initialInputs: Record<string, { tugas: number; uts: number; uas: number }> = {};

    classStudents.forEach((std) => {
      const existing = classExistingGrades.find((g) => g.studentId === std.id);
      if (existing && existing.componentScores) {
        initialInputs[std.id] = {
          tugas: existing.componentScores.tugas,
          uts: existing.componentScores.uts,
          uas: existing.componentScores.uas,
        };
      } else {
        // No pre-existing grades: start with empty inputs (no dummy defaults)
        initialInputs[std.id] = { tugas: 0, uts: 0, uas: 0 };
      }
    });

    setGradesInput(initialInputs);
    setIsDirty(false);
  }, [currentClass, classStudents, allGrades]);

  const calculateFinal = (tugas: number, uts: number, uas: number) => {
    return Math.round(tugas * 0.3 + uts * 0.3 + uas * 0.4);
  };

  const toLetterGrade = (score: number) => {
    if (score >= 85) return { grade: 'A', point: 4.0, label: 'Sangat Baik' };
    if (score >= 80) return { grade: 'A-', point: 3.75, label: 'Baik Sekali' };
    if (score >= 75) return { grade: 'B+', point: 3.5, label: 'Baik Plus' };
    if (score >= 70) return { grade: 'B', point: 3.0, label: 'Baik' };
    if (score >= 65) return { grade: 'B-', point: 2.75, label: 'Cukup Baik' };
    if (score >= 60) return { grade: 'C+', point: 2.5, label: 'Lebih Cukup' };
    if (score >= 55) return { grade: 'C', point: 2.0, label: 'Cukup' };
    if (score >= 45) return { grade: 'D', point: 1.0, label: 'Kurang' };
    return { grade: 'F', point: 0.0, label: 'Gagal' };
  };

  const handleInputChange = (studentId: string, field: 'tugas' | 'uts' | 'uas', val: number) => {
    const safeVal = isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
    setGradesInput((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { tugas: 0, uts: 0, uas: 0 }),
        [field]: safeVal,
      },
    }));
    setIsDirty(true);
  };

  // Quick fill simulator — HANYA untuk simulasi demo, bukan data asli
  const handleQuickFill = (preset: 'high' | 'standard') => {
    if (!currentClass) return;
    const updated: Record<string, { tugas: number; uts: number; uas: number }> = {};
    classStudents.forEach((std, i) => {
      if (preset === 'high') {
        updated[std.id] = {
          tugas: Math.min(100, 88 + (i % 3) * 4),
          uts: Math.min(100, 85 + (i % 4) * 3),
          uas: Math.min(100, 90 + (i % 3) * 3),
        };
      } else {
        updated[std.id] = {
          tugas: 75 + (i % 3) * 3,
          uts: 72 + (i % 4) * 4,
          uas: 78 + (i % 3) * 2,
        };
      }
    });
    setGradesInput(updated);
    setIsDirty(true);
  };

  const handleSaveGrades = () => {
    if (!currentClass) return;

    const formattedPayload = classStudents.map((std) => {
      const vals = gradesInput[std.id] || { tugas: 0, uts: 0, uas: 0 };
      return {
        studentId: std.id,
        tugas: vals.tugas,
        uts: vals.uts,
        uas: vals.uas,
      };
    });

    saveClassGrades(currentClass.id, formattedPayload);
    setIsDirty(false);

    setSuccessToast({
      message: `Nilai mata kuliah ${currentClass.courseCode} (${currentClass.courseName}) Seksi ${currentClass.section} berhasil disimpan dan langsung terhubung ke Transkrip Akademik Mahasiswa!`,
      count: formattedPayload.length,
    });

    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  // Search filter
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Class analytics
  const analytics = useMemo(() => {
    const scores = students.map((std) => {
      const v = gradesInput[std.id] || { tugas: 80, uts: 80, uas: 80 };
      return calculateFinal(v.tugas, v.uts, v.uas);
    });

    if (scores.length === 0) return { avg: 0, highest: 0, lowest: 0, passRate: 0, gradesCount: {} };

    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = scores.filter((s) => s >= 55).length;
    const passRate = Math.round((passed / scores.length) * 100);

    const gradesCount: Record<string, number> = { A: 0, 'A-': 0, 'B+': 0, B: 0, 'B-': 0, 'C+': 0, C: 0, D: 0, F: 0 };
    scores.forEach((s) => {
      const l = toLetterGrade(s).grade;
      gradesCount[l] = (gradesCount[l] || 0) + 1;
    });

    return { avg, highest, lowest, passRate, gradesCount };
  }, [students, gradesInput]);

  // Data nilai mandiri mahasiswa
  const studentSelfGrades = useMemo(() => {
    return allGrades.filter((g) => g.inputSource === 'student');
  }, [allGrades]);

  const pendingGradesCount = useMemo(() => {
    return studentSelfGrades.filter((g) => g.verificationStatus === 'pending').length;
  }, [studentSelfGrades]);

  const filteredSelfGrades = useMemo(() => {
    return studentSelfGrades.filter((g) => {
      if (verifFilter === 'all') return true;
      return g.verificationStatus === verifFilter;
    });
  }, [studentSelfGrades, verifFilter]);

  const handleVerify = (gradeId: string, status: 'approved' | 'rejected') => {
    const res = verifyGradeRecord(gradeId, status);
    if (res) {
      const student = students.find((s) => s.id === res.studentId);
      const studentName = student ? student.name : res.studentId;
      setVerifActionMessage(
        status === 'approved'
          ? `Nilai ${res.courseCode} untuk mahasiswa ${studentName} berhasil DISETUJUI dan langsung masuk ke perhitungan akademik resmi.`
          : `Nilai ${res.courseCode} untuk mahasiswa ${studentName} telah DITOLAK.`
      );
      setTimeout(() => setVerifActionMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Input & Verifikasi Nilai Akademik"
        subtitle="Entri nilai kelas resmi dan verifikasi pengajuan nilai mandiri mahasiswa UNKLAB"
        breadcrumbs={[
          { label: 'Portal Dosen', path: '/lecturer/dashboard' },
          { label: 'Pengelolaan Nilai' },
        ]}
        actions={
          activeTab === 'classes' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveGrades}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                Simpan & Publikasikan ke Transkrip
              </button>
            </div>
          ) : null
        }
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'classes'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Input Nilai Kelas Perkuliahan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'verification'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Verifikasi Nilai Mandiri Mahasiswa</span>
          {pendingGradesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
              {pendingGradesCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'verification' ? (
        /* TAB VERIFIKASI NILAI MANDIRI */
        <div className="space-y-6">
          {verifActionMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{verifActionMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setVerifActionMessage(null)}
                className="text-emerald-600 hover:text-emerald-800 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Filter Status Verifikasi */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Status:</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setVerifFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    verifFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all'
                    ? 'Semua'
                    : st === 'pending'
                      ? `Menunggu (${pendingGradesCount})`
                      : st === 'approved'
                        ? 'Disetujui'
                        : 'Ditolak'}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              Total Pengajuan: <strong>{filteredSelfGrades.length}</strong>
            </div>
          </div>

          {/* Table Verifikasi */}
          {filteredSelfGrades.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">
                Tidak Ada Pengajuan Nilai Mandiri
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {verifFilter === 'pending'
                  ? 'Semua pengajuan nilai mandiri mahasiswa telah diverifikasi.'
                  : 'Belum ada data pengajuan nilai mandiri pada kategori ini.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                      <th className="py-3 px-4">Mahasiswa</th>
                      <th className="py-3 px-4">Mata Kuliah</th>
                      <th className="py-3 px-4 text-center">Periode</th>
                      <th className="py-3 px-4 text-center">SKS</th>
                      <th className="py-3 px-4 text-center">Nilai</th>
                      <th className="py-3 px-4 text-center">Bobot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSelfGrades.map((g) => {
                      const student = students.find((s) => s.id === g.studentId);
                      return (
                        <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {student?.name || 'Mahasiswa'}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              NIM: {student?.nim || g.studentId}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-blue-700">
                              {g.courseCode}
                            </div>
                            <div className="font-medium text-slate-800">
                              {g.courseName}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="font-semibold text-slate-800">
                              Sem {g.semester}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {g.academicYear}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {g.credits}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-md font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                              {g.letterGrade}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                            {g.gradePoint.toFixed(2)}
                          </td>

                          <td className="py-3 px-4">
                            {g.verificationStatus === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Menunggu Verifikasi
                              </span>
                            ) : g.verificationStatus === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Disetujui
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Ditolak
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {g.verificationStatus === 'pending' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleVerify(g.id, 'approved')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVerify(g.id, 'rejected')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                                <span>Sudah diproses</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVerify(
                                      g.id,
                                      g.verificationStatus === 'approved' ? 'rejected' : 'approved'
                                    )
                                  }
                                  className="text-blue-600 hover:underline ml-1 font-semibold"
                                >
                                  (Ubah)
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TAB INPUT NILAI KELAS (DEFAULT KONTEN LAMA) */
        <>
      {/* Success Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs shadow-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-emerald-950">Sinkronisasi Transkrip Sukses!</p>
            <p className="text-emerald-800">{successToast.message}</p>
            <p className="text-[11px] text-emerald-700">
              ✓ Nilai {successToast.count} mahasiswa telah dipublikasikan ke Kartu Hasil Studi (KHS).
              ✓ IPK kumulatif dan IPS mahasiswa telah dihitung ulang secara otomatis.
            </p>
          </div>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Terdapat perubahan nilai yang belum disimpan ke sistem. Klik tombol Simpan agar nilai tampil di transkrip mahasiswa.</span>
          </div>
          <button
            onClick={handleSaveGrades}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
          >
            Simpan Sekarang
          </button>
        </div>
      )}

      {/* Class Selector & Header Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Pilih Kelas Perkuliahan:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
            >
              {lecturerClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.courseCode} ({cls.section}) — {cls.courseName} [{cls.credits} SKS]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium mr-1">Simulasi Demo:</span>
            <button
              type="button"
              onClick={() => handleQuickFill('high')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors"
              title="Isi simulasi nilai tinggi A / A-"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Set Nilai Tinggi (A)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('standard')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors"
              title="Isi simulasi nilai standar B / B+"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
              Set Nilai Standar (B)
            </button>
          </div>
        </div>

        {/* Selected Class Meta info */}
        {currentClass && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-medium">Mata Kuliah</span>
              <span className="font-bold text-slate-800">{currentClass.courseCode} — {currentClass.courseName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-medium">Bobot & Seksi</span>
              <span className="font-bold text-slate-800">{currentClass.credits} SKS (Seksi {currentClass.section})</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-medium">Dosen Pengampu IT</span>
              <span className="font-bold text-blue-600">{currentClass.lecturerName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-medium">Jadwal & Ruangan</span>
              <span className="font-bold text-slate-800">{currentClass.day}, {currentClass.startTime}-{currentClass.endTime} ({currentClass.room})</span>
            </div>
          </div>
        )}
      </div>

      {/* Class Statistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rata-Rata Kelas</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{analytics.avg} / 100</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tingkat Kelulusan</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{analytics.passRate}%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tertinggi / Terendah</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{analytics.highest} / {analytics.lowest}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mahasiswa Dinilai</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{students.length} Mahasiswa</p>
          </div>
        </div>
      </div>

      {/* Grade Entry Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-800">
              Formulir Entri Nilai Mahasiswa (Bobot: Tugas 30%, UTS 30%, UAS 40%)
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mahasiswa / NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                <th className="py-3 px-4 w-12">No</th>
                <th className="py-3 px-4">Nama Mahasiswa</th>
                <th className="py-3 px-4">NIM</th>
                <th className="py-3 px-4 text-center">Tugas (30%)</th>
                <th className="py-3 px-4 text-center">UTS (30%)</th>
                <th className="py-3 px-4 text-center">UAS (40%)</th>
                <th className="py-3 px-4 text-center">Nilai Angka</th>
                <th className="py-3 px-4 text-center">Nilai Huruf</th>
                <th className="py-3 px-4 text-center">Bobot Mutu</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std, idx) => {
                const values = gradesInput[std.id] || { tugas: 80, uts: 80, uas: 80 };
                const finalScore = calculateFinal(values.tugas, values.uts, values.uas);
                const letter = toLetterGrade(finalScore);
                const isPassed = !['D', 'F'].includes(letter.grade);

                return (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{std.name}</p>
                      <span className="text-[10px] text-slate-400">{std.programStudy}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{std.nim}</td>

                    {/* Input Tugas */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.tugas}
                        onChange={(e) => handleInputChange(std.id, 'tugas', Number(e.target.value))}
                        className="w-16 p-1.5 text-center font-bold text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                      />
                    </td>

                    {/* Input UTS */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.uts}
                        onChange={(e) => handleInputChange(std.id, 'uts', Number(e.target.value))}
                        className="w-16 p-1.5 text-center font-bold text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                      />
                    </td>

                    {/* Input UAS */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.uas}
                        onChange={(e) => handleInputChange(std.id, 'uas', Number(e.target.value))}
                        className="w-16 p-1.5 text-center font-bold text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                      />
                    </td>

                    {/* Final Score */}
                    <td className="py-3 px-4 text-center font-extrabold text-slate-900 text-sm">
                      {finalScore}
                    </td>

                    {/* Letter Grade */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block w-9 py-1 rounded-md font-extrabold text-xs text-center border ${
                          letter.grade.startsWith('A')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : letter.grade.startsWith('B')
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : letter.grade.startsWith('C')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {letter.grade}
                      </span>
                    </td>

                    {/* Quality Points */}
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {letter.point.toFixed(2)}
                    </td>

                    {/* Pass Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isPassed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            LULUS
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            TIDAK LULUS
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Menampilkan <strong>{filteredStudents.length}</strong> mahasiswa. Nilai yang disimpan akan langsung diperbarui di portal transkrip mahasiswa secara real-time.
          </p>
          <button
            onClick={handleSaveGrades}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            Simpan Nilai Kelas ke Transkrip
          </button>
        </div>
      </div>

      {/* Grading Standard Scale Reference Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h4 className="font-bold text-xs text-slate-800 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Standar Skala Penilaian Akademik Resmi — Universitas Klabat (UNKLAB)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-emerald-700 block text-sm">A</span>
            <span className="text-[11px] text-slate-500">85 - 100</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">4.00</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-emerald-700 block text-sm">A-</span>
            <span className="text-[11px] text-slate-500">80 - 84</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">3.75</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-blue-700 block text-sm">B+</span>
            <span className="text-[11px] text-slate-500">75 - 79</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">3.50</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-blue-700 block text-sm">B</span>
            <span className="text-[11px] text-slate-500">70 - 74</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">3.00</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-blue-700 block text-sm">B-</span>
            <span className="text-[11px] text-slate-500">65 - 69</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">2.75</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-amber-700 block text-sm">C+</span>
            <span className="text-[11px] text-slate-500">60 - 64</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">2.50</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-amber-700 block text-sm">C</span>
            <span className="text-[11px] text-slate-500">55 - 59</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">2.00</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-red-600 block text-sm">D</span>
            <span className="text-[11px] text-slate-500">45 - 54</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">1.00</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="font-extrabold text-red-600 block text-sm">F</span>
            <span className="text-[11px] text-slate-500">&lt; 45</span>
            <span className="text-[10px] font-bold text-slate-700 block mt-0.5">0.00</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
