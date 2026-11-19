import React, { useState, useMemo } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';

export const LecturerClassesPage: React.FC = () => {
  const { activeLecturer, classes, students, studyPlans } = useAcademic();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || ''
  );

  if (!activeLecturer) return null;

  // Hanya kelas yang diampu dosen yang sedang login
  const lecturerClasses = classes.filter(
    (cls) => cls.lecturerId === activeLecturer.id
  );

  const currentClass =
    lecturerClasses.find((cls) => cls.id === selectedClassId) ||
    lecturerClasses[0];

  // Mengambil mahasiswa dengan KRS yang terdaftar pada kelas ini
const getApprovedRoster = (classId: string) => {
  const registeredStudentIds = new Set<string>();

  studyPlans.forEach((plan) => {
    if (
      plan.status === 'approved' &&
      plan.items.some((item) => item.classId === classId)
    ) {
      registeredStudentIds.add(plan.studentId);
    }
  });

  return students.filter((student) =>
    registeredStudentIds.has(student.id)
  );
};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kelas & Roster Perkuliahan"
        subtitle="Daftar kelas aktif yang diampu dan roster mahasiswa terdaftar"
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Kelas Saya' },
        ]}
      />

      {/* Class Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lecturerClasses.map((cls) => {
          const isSelected = cls.id === (currentClass?.id || '');
          const roster = getApprovedRoster(cls.id);

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-mono text-[10px] font-bold">
                  {cls.courseCode} ({cls.section})
                </span>

                <span className="text-xs font-bold text-slate-700">
                  {cls.credits} SKS
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-xs line-clamp-1">
                {cls.courseName}
              </h3>

              <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                <span>
                  {cls.day}, {cls.startTime}
                </span>

                <span className="font-bold text-blue-600">
                  {roster.length} / {cls.capacity} Mhs
                </span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Roster Table */}
      {currentClass && (() => {
        const roster = getApprovedRoster(currentClass.id);

        return (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-[#142B4A]">
                  Roster Mahasiswa Terdaftar: {currentClass.courseName} (
                  {currentClass.section})
                </h3>

                <p className="text-xs text-slate-500">
                  Jadwal: {currentClass.day}, {currentClass.startTime}-
                  {currentClass.endTime} WITA • Ruangan: {currentClass.room}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 self-start sm:self-auto">
                {roster.length} Mahasiswa Terdaftar
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Mahasiswa</th>
                    <th className="py-3 px-4">NIM</th>
                    <th className="py-3 px-4">Program Studi</th>
                    <th className="py-3 px-4 text-center">Semester</th>
                    <th className="py-3 px-4 text-center">Status KRS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {roster.length > 0 ? (
                    roster.map((std, idx) => (
                      <tr
                        key={std.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-800">
                          {std.name}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600">
                          {std.nim}
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {std.programStudy}
                        </td>

                        <td className="py-3 px-4 text-center font-medium text-slate-700">
                          Sem {std.currentSemester}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            TERDAFTAR RESMI
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 px-4 text-center text-slate-500"
                      >
                        Belum ada mahasiswa dengan KRS yang disetujui pada kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
