import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Award, Save, CheckCircle2 } from 'lucide-react';

export const LecturerGradesPage: React.FC = () => {
  const { classes, students, activeLecturer } = useAcademic();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const lecturerClasses = classes.filter((c) => c.lecturerId === activeLecturer?.id);
  const currentClass = classes.find((c) => c.id === selectedClassId) || lecturerClasses[0];

  // Mock grade inputs state
  const [gradesInput, setGradesInput] = useState<Record<string, { tugas: number; uts: number; uas: number }>>({
    std_01: { tugas: 90, uts: 88, uas: 92 },
    std_02: { tugas: 95, uts: 92, uas: 94 },
    std_03: { tugas: 75, uts: 70, uas: 72 },
    std_04: { tugas: 85, uts: 84, uas: 88 },
    std_05: { tugas: 80, uts: 78, uas: 80 },
  });

  const calculateFinal = (tugas: number, uts: number, uas: number) => {
    return Math.round(tugas * 0.3 + uts * 0.3 + uas * 0.4);
  };

  const toLetterGrade = (score: number) => {
    if (score >= 85) return { grade: 'A', point: 4.0 };
    if (score >= 80) return { grade: 'A-', point: 3.75 };
    if (score >= 75) return { grade: 'B+', point: 3.5 };
    if (score >= 70) return { grade: 'B', point: 3.0 };
    if (score >= 65) return { grade: 'B-', point: 2.75 };
    if (score >= 60) return { grade: 'C+', point: 2.5 };
    if (score >= 55) return { grade: 'C', point: 2.0 };
    if (score >= 45) return { grade: 'D', point: 1.0 };
    return { grade: 'F', point: 0.0 };
  };

  const handleInputChange = (studentId: string, field: 'tugas' | 'uts' | 'uas', val: number) => {
    setGradesInput((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { tugas: 80, uts: 80, uas: 80 }),
        [field]: Math.min(100, Math.max(0, val)),
      },
    }));
  };

  const handleSaveGrades = () => {
    setSuccessToast(`Nilai perkuliahan kelas ${currentClass?.courseName} berhasil disimpan dan disinkronkan ke KHS.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Input & Pengelolaan Nilai Perkuliahan"
        subtitle="Entri nilai tugas, UTS, UAS, dan pembobotan mutu huruf resmi"
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Input Nilai' },
        ]}
        actions={
          <button
            onClick={handleSaveGrades}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            Simpan Nilai Kelas
          </button>
        }
      />

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Class Selector Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700">Pilih Kelas:</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
        >
          {lecturerClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.courseCode} ({cls.section}) — {cls.courseName}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Bobot Penilaian: Tugas (30%), UTS (30%), UAS (40%)
        </span>
      </div>

      {/* Grade Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Mahasiswa</th>
                <th className="py-3 px-4">NIM</th>
                <th className="py-3 px-4 text-center">Tugas (30%)</th>
                <th className="py-3 px-4 text-center">UTS (30%)</th>
                <th className="py-3 px-4 text-center">UAS (40%)</th>
                <th className="py-3 px-4 text-center">Nilai Angka</th>
                <th className="py-3 px-4 text-center">Nilai Huruf</th>
                <th className="py-3 px-4 text-center">Bobot Mutu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((std, idx) => {
                const values = gradesInput[std.id] || { tugas: 80, uts: 80, uas: 80 };
                const finalScore = calculateFinal(values.tugas, values.uts, values.uas);
                const letter = toLetterGrade(finalScore);

                return (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{std.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{std.nim}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.tugas}
                        onChange={(e) => handleInputChange(std.id, 'tugas', Number(e.target.value))}
                        className="w-16 p-1 text-center font-bold text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.uts}
                        onChange={(e) => handleInputChange(std.id, 'uts', Number(e.target.value))}
                        className="w-16 p-1 text-center font-bold text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.uas}
                        onChange={(e) => handleInputChange(std.id, 'uas', Number(e.target.value))}
                        className="w-16 p-1 text-center font-bold text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 text-sm">
                      {finalScore}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block w-8 py-0.5 rounded-md font-bold text-xs bg-blue-100 text-blue-800 text-center">
                        {letter.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {letter.point.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
