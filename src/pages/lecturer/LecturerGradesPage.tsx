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
} from 'lucide-react';

export const LecturerGradesPage: React.FC = () => {
  const { classes, students, studyPlans, activeLecturer, saveClassGrades, allGrades } = useAcademic();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<{ message: string; count: number } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Filter classes taught by active lecturer only (no fallback to all classes)
  const lecturerClasses = useMemo(() => {
    return classes.filter((c) => c.lecturerId === activeLecturer?.id);
  }, [classes, activeLecturer]);

  const currentClass = classes.find((c) => c.id === selectedClassId) || null;

  // Local state for inputting student grades
  const [gradesInput, setGradesInput] = useState<Record<string, { tugas: number; uts: number; uas: number }>>({});

  // Students enrolled in the currently selected class (via study plan classId references)
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    const enrolledStudentIds = new Set(
      studyPlans
        .filter((sp) => sp.items.some((item) => item.classId === currentClass.id))
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Input & Pengelolaan Nilai Perkuliahan"
        subtitle="Entri nilai tugas, UTS, UAS, dan pembobotan mutu huruf resmi terhubung langsung ke transkrip mahasiswa"
        breadcrumbs={[
          { label: 'Portal Dosen', path: '/lecturer/dashboard' },
          { label: 'Input Nilai Dosen' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveGrades}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan & Publikasikan ke Transkrip
            </button>
          </div>
        }
      />

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
    </div>
  );
};
