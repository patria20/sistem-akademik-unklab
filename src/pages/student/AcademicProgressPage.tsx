import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { calculateAcademicProgress } from '../../utils/gpaCalculator';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

export const AcademicProgressPage: React.FC = () => {
  const { activeStudent, courses, grades, activeKrs } = useAcademic();

  if (!activeStudent) return null;

  const currentEnrolledCredits = activeKrs?.totalCredits || 0;
  const progress = calculateAcademicProgress(grades, currentEnrolledCredits, 144);

  const passedCourseIds = grades.filter((g) => g.isPassed).map((g) => g.courseId);
  const enrolledCourseIds = activeKrs?.items.map((i) => i.courseId) || [];

  // Categorize courses
  const categories = ['Wajib Prodi', 'Wajib Universitas', 'Tugas Akhir'] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kemajuan Studi & Evaluasi Kurikulum"
        subtitle={`Audit kelulusan sarjana berdasarkan Kurikulum MBKM 2024 — ${activeStudent.programStudy}`}
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Kemajuan Studi' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Target Kelulusan"
          value="144 SKS"
          subtitle="Standar Sarjana Komputer (S.Kom)"
          icon={GraduationCap}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="SKS Lulus"
          value={`${progress.creditsEarned} SKS`}
          subtitle={`${progress.completionPercentage}% kurikulum selesai`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="SKS Sedang Ditempuh"
          value={`${progress.creditsCurrent} SKS`}
          subtitle="Semester 5 Ganjil"
          icon={Clock}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="SKS Tersisa"
          value={`${progress.creditsRemaining} SKS`}
          subtitle="Estimasi 3 semester menuju wisuda"
          icon={Layers}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800">
          <span>Progres Pemenuhan Kurikulum Informatika</span>
          <span className="text-blue-600">{progress.completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-4 transition-all duration-500"
            style={{ width: `${(progress.creditsEarned / 144) * 100}%` }}
            title={`Lulus: ${progress.creditsEarned} SKS`}
          ></div>
          <div
            className="bg-blue-500 h-4 transition-all duration-500"
            style={{ width: `${(progress.creditsCurrent / 144) * 100}%` }}
            title={`Sedang Ditempuh: ${progress.creditsCurrent} SKS`}
          ></div>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span>Lulus ({progress.creditsEarned} SKS)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
            <span>Sedang Ditempuh ({progress.creditsCurrent} SKS)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-slate-200"></span>
            <span>Belum Ditempuh ({progress.creditsRemaining} SKS)</span>
          </div>
        </div>
      </div>

      {/* Curriculum Checklist by Category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catCourses = courses.filter((c) => c.category === cat);
          if (catCourses.length === 0) return null;

          return (
            <div key={cat} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#142B4A]">{cat}</h3>
                  <p className="text-xs text-slate-500">
                    Total mata kuliah kategori ini: {catCourses.length} Mata Kuliah (
                    {catCourses.reduce((sum, c) => sum + c.credits, 0)} SKS)
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50/70">
                      <th className="py-2.5 px-3">Kode</th>
                      <th className="py-2.5 px-3">Nama Mata Kuliah</th>
                      <th className="py-2.5 px-3 text-center">SKS</th>
                      <th className="py-2.5 px-3 text-center">Sem</th>
                      <th className="py-2.5 px-3">Prasyarat</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {catCourses.map((c) => {
                      const isPassed = passedCourseIds.includes(c.id);
                      const isEnrolled = enrolledCourseIds.includes(c.id);
                      const grade = grades.find((g) => g.courseId === c.id);

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">{c.code}</td>
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-400 italic">{c.nameEn}</p>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold">{c.credits}</td>
                          <td className="py-3 px-3 text-center text-slate-500">{c.semester}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {c.prerequisites.length === 0 ? (
                              <span className="text-slate-400">-</span>
                            ) : (
                              c.prerequisites
                                .map((pid) => courses.find((item) => item.id === pid)?.code || pid)
                                .join(', ')
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isPassed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <Check className="w-3 h-3" />
                                Lulus ({grade?.letterGrade})
                              </span>
                            ) : isEnrolled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                <Clock className="w-3 h-3" />
                                Sedang Ditempuh
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                Belum Ditempuh
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
