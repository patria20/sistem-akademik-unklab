import React, { useMemo, useState } from 'react';
import { Award, Search, Users } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAcademic } from '../../context/AcademicContext';

const krsStatusLabel = {
  draft: 'Draft',
  submitted: 'Menunggu Persetujuan',
  approved: 'Disetujui',
  revision: 'Perlu Revisi',
} as const;

const krsStatusStyle = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  revision: 'bg-red-100 text-red-800',
} as const;

export const LecturerAdviseesPage: React.FC = () => {
  const { activeLecturer, students } = useAcademic();
  const [search, setSearch] = useState('');

  const advisees = useMemo(() => {
    if (!activeLecturer) return [];

    const query = search.trim().toLocaleLowerCase();
    return students
      .filter((student) => student.academicAdvisorId === activeLecturer.id)
      .filter(
        (student) =>
          !query ||
          student.name.toLocaleLowerCase().includes(query) ||
          student.nim.toLocaleLowerCase().includes(query) ||
          student.programStudy.toLocaleLowerCase().includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeLecturer, search, students]);

  if (!activeLecturer) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahasiswa Bimbingan"
        subtitle={`Daftar mahasiswa dengan Dosen PA ${activeLecturer.name}`}
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Mahasiswa Bimbingan' },
        ]}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#142B4A]">Daftar Mahasiswa PA</h2>
              <p className="text-xs text-slate-500">{advisees.length} mahasiswa ditemukan</p>
            </div>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, NIM, atau program studi"
              aria-label="Cari mahasiswa bimbingan"
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <th className="px-4 py-3">Mahasiswa</th>
                <th className="px-4 py-3">Program Studi</th>
                <th className="px-4 py-3 text-center">Semester</th>
                <th className="px-4 py-3">Prestasi Akademik</th>
                <th className="px-4 py-3">Beban Studi</th>
                <th className="px-4 py-3">Status KRS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advisees.map((student) => (
                <tr key={student.id} className="align-top transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-800">{student.name}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">{student.nim}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{student.faculty}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-700">{student.programStudy}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{student.academicYear}</p>
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-slate-700">
                    {student.currentSemester}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      IPK {student.cumulativeGpa.toFixed(2)}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      IPS terakhir {student.lastSemesterGpa.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{student.creditsEarned} SKS lulus</p>
                    <p className="mt-1 text-[11px]">{student.creditsCurrent} SKS ditempuh</p>
                    <p className="mt-1 text-[11px]">{student.creditsRemaining} SKS tersisa</p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${krsStatusStyle[student.krsStatus]}`}
                    >
                      {krsStatusLabel[student.krsStatus]}
                    </span>
                  </td>
                </tr>
              ))}
              {advisees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    {search.trim()
                      ? 'Tidak ada mahasiswa bimbingan yang cocok dengan pencarian.'
                      : 'Belum ada mahasiswa yang terdaftar sebagai bimbingan akademik Anda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
