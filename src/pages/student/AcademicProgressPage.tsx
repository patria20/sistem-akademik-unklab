
import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import {
  calculateAcademicProgress,
  calculateCumulativeGPA,
  PASSING_GRADES,
  isOfficialGrade,
  getLatestOfficialAttempts,
} from '../../utils/gpaCalculator';
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
} from 'lucide-react';

const GRADUATION_TARGET = 151;

export const AcademicProgressPage: React.FC = () => {
  const { activeStudent, courses, grades, studyPlans } = useAcademic();

  if (!activeStudent) return null;

  // Hanya KRS semester aktif yang sudah diajukan atau disetujui.
  const currentKrs = studyPlans.find(
    (plan) =>
      plan.studentId === activeStudent.id &&
      plan.semester === activeStudent.currentSemester &&
      plan.academicYear === activeStudent.academicYear &&
      (plan.status === 'submitted' || plan.status === 'approved')
  );

  // Identifikasi mata kuliah yang sudah lulus berdasarkan percobaan resmi terbaru (latest attempt).
  const latestAttempts = getLatestOfficialAttempts(grades);
  const passedGrades = latestAttempts.filter(
    (grade) =>
      grade.isPassed &&
      PASSING_GRADES.includes(grade.letterGrade)
  );

  const passedCourseIds = Array.from(
    new Set(passedGrades.map((grade) => grade.courseId))
  );

  // Mata kuliah dalam KRS yang belum pernah dinyatakan lulus.
  const currentKrsItems = currentKrs?.items ?? [];

  const currentItemsByCourse = new Map(
    currentKrsItems
      .filter((item) => !passedCourseIds.includes(item.courseId))
      .map((item) => [item.courseId, item])
  );

  const enrolledCourseIds = Array.from(currentItemsByCourse.keys());

  const currentEnrolledCredits = Array.from(
    currentItemsByCourse.values()
  ).reduce((sum, item) => sum + item.credits, 0);

  // Menghitung progres dan IPK.
  const progress = calculateAcademicProgress(
    grades,
    currentEnrolledCredits,
    GRADUATION_TARGET
  );

  const cumulativeGpa = calculateCumulativeGPA(grades);

  // Lebar visual progres kurikulum.
  const earnedWidth = Math.min(
    100,
    (progress.creditsEarned / progress.graduationTarget) * 100
  );

  const currentWidth = Math.min(
    Math.max(0, 100 - earnedWidth),
    (progress.creditsCurrent / progress.graduationTarget) * 100
  );

  const categories = [
    'Wajib Prodi',
    'Wajib Universitas',
    'Pilihan',
    'Tugas Akhir',
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kemajuan Studi & Evaluasi Kurikulum"
        subtitle={`Progres pemenuhan kurikulum Informatika — ${activeStudent.programStudy}`}
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Kemajuan Studi' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Target Kelulusan"
          value={`${progress.graduationTarget} SKS`}
          subtitle="Standar kelulusan program studi"
          icon={GraduationCap}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />

        <StatCard
          title="IPK Kumulatif"
          value={cumulativeGpa === null ? '—' : cumulativeGpa.toFixed(2)}
          subtitle="Dihitung dari seluruh nilai yang tersedia"
          icon={Award}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />

        <StatCard
          title="SKS Lulus"
          value={`${progress.creditsEarned} SKS`}
          subtitle="SKS dari mata kuliah yang sudah lulus"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="SKS Sedang Ditempuh"
          value={`${progress.creditsCurrent} SKS`}
          subtitle={`Semester ${activeStudent.currentSemester} — berdasarkan KRS aktif`}
          icon={Clock}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title="SKS Tersisa"
          value={`${progress.creditsRemaining} SKS`}
          subtitle="Belum lulus atau sedang ditempuh"
          icon={Layers}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800">
          <span>Progres Pemenuhan Kurikulum Informatika</span>
          <span className="text-blue-600">
            {progress.completionPercentage}%
          </span>
        </div>

        <div
          className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex"
          aria-label={`Progres kurikulum ${progress.completionPercentage}%`}
        >
          <div
            className="bg-emerald-500 h-4 transition-all duration-500"
            style={{ width: `${earnedWidth}%` }}
            title={`Lulus: ${progress.creditsEarned} SKS`}
          />

          <div
            className="bg-blue-500 h-4 transition-all duration-500"
            style={{ width: `${currentWidth}%` }}
            title={`Sedang ditempuh: ${progress.creditsCurrent} SKS`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>Lulus ({progress.creditsEarned} SKS)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-500" />
            <span>Sedang ditempuh ({progress.creditsCurrent} SKS)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-slate-200" />
            <span>Belum ditempuh ({progress.creditsRemaining} SKS)</span>
          </div>
        </div>
      </div>

      {/* Curriculum Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryCourses = courses.filter(
            (course) => course.category === category
          );

          if (categoryCourses.length === 0) return null;

          return (
            <div
              key={category}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#142B4A]">
                    {category}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Total mata kuliah: {categoryCourses.length} (
                    {categoryCourses.reduce(
                      (sum, course) => sum + course.credits,
                      0
                    )}{' '}
                    SKS)
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
                    {categoryCourses.map((course) => {
                      const isPassed = passedCourseIds.includes(course.id);
                      const isEnrolled = enrolledCourseIds.includes(course.id);

                      const grade = passedGrades.find(
                        (record) => record.courseId === course.id
                      );

                      return (
                        <tr
                          key={course.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            {course.code}
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-800">
                              {course.name}
                            </p>
                            <p className="text-[10px] text-slate-400 italic">
                              {course.nameEn}
                            </p>
                          </td>

                          <td className="py-3 px-3 text-center font-semibold">
                            {course.credits}
                          </td>

                          <td className="py-3 px-3 text-center text-slate-500">
                            {course.semester}
                          </td>

                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {course.prerequisites.length === 0 ? (
                              <span className="text-slate-400">-</span>
                            ) : (
                              course.prerequisites
                                .map(
                                  (id) =>
                                    courses.find((item) => item.id === id)
                                      ?.code || id
                                )
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
