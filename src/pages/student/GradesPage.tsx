import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { calculateQualityPoints, calculateSemesterGPA } from '../../utils/gpaCalculator';
import { Printer, Download, Award, FileText, CheckCircle2 } from 'lucide-react';

export const GradesPage: React.FC = () => {
  const { activeStudent, grades } = useAcademic();
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  if (!activeStudent) return null;

  const semesters = [1, 2, 3, 4];

  const filteredGrades = selectedSemester === 'all'
    ? grades
    : grades.filter((g) => g.semester.toString() === selectedSemester);

  const totalCredits = filteredGrades.reduce((sum, g) => sum + g.credits, 0);
  const totalQualityPoints = filteredGrades.reduce(
    (sum, g) => sum + calculateQualityPoints(g.letterGrade, g.credits),
    0
  );
  const computedGpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transkrip Nilai & Kartu Hasil Studi (KHS)"
        subtitle="Riwayat perolehan nilai akademik resmi mahasiswa Universitas Klabat"
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Transkrip & Nilai' },
        ]}
        actions={
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak KHS / Transkrip
          </button>
        }
      />

      {/* Student Identity Card in KHS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Nama Mahasiswa</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{activeStudent.name}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">NIM</p>
            <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{activeStudent.nim}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Program Studi</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{activeStudent.programStudy}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Dosen Pembina Akademik</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{activeStudent.academicAdvisorName}</p>
          </div>
        </div>
      </div>

      {/* Filter and Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Pilih Semester KHS:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">Semua Semester (Transkrip Lengkap)</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem.toString()}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-slate-400 mr-1.5">Total SKS:</span>
            <span className="text-slate-900 font-bold">{totalCredits} SKS</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-400 mr-1.5">Total Bobot Mutu:</span>
            <span className="text-slate-900 font-bold">{totalQualityPoints.toFixed(1)}</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-400 mr-1.5">
              {selectedSemester === 'all' ? 'IPK Kumulatif:' : 'IPS Semester:'}
            </span>
            <span className="text-blue-600 font-extrabold text-sm">{computedGpa}</span>
          </div>
        </div>
      </div>

      {/* Grade Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Kode MK</th>
                <th className="py-3 px-4">Nama Mata Kuliah</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">SKS</th>
                <th className="py-3 px-4 text-center">Nilai Huruf</th>
                <th className="py-3 px-4 text-center">Bobot Mutu</th>
                <th className="py-3 px-4 text-center">Mutu (SKS x Bobot)</th>
                <th className="py-3 px-4 text-center">Status Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.map((g, idx) => {
                const mutu = calculateQualityPoints(g.letterGrade, g.credits);
                return (
                  <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{g.courseCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{g.courseName}</td>
                    <td className="py-3 px-4 text-center text-slate-500">Sem {g.semester}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{g.credits}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block w-8 py-0.5 rounded-md font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 text-center">
                        {g.letterGrade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">
                      {g.gradePoint.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {mutu.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        LULUS
                      </span>
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
