import React, { useMemo } from 'react';
import { BookCheck, CheckCircle2, Clock, GraduationCap, Layers, XCircle } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { PASSING_GRADES } from '../../utils/gpaCalculator';
import { buildAcademicHistory } from '../../utils/academicHistory';

export const AcademicHistoryPage: React.FC = () => {
  const { activeStudent, grades } = useAcademic();
  const currentSemester = activeStudent?.currentSemester ?? 0;

  // `grades` sudah milik mahasiswa yang login; perhitungan ada di utils/academicHistory.ts.
  const history = useMemo(
    () => buildAcademicHistory(grades, currentSemester),
    [grades, currentSemester],
  );

  const header = (
    <PageHeader
      title="Riwayat Akademik"
      subtitle="Mata kuliah yang sudah kamu ambil pada semester-semester sebelumnya."
      breadcrumbs={[
        { label: 'Mahasiswa', path: '/student/dashboard' },
        { label: 'Riwayat Akademik' },
      ]}
    />
  );

  if (!activeStudent) {
    return (
      <div className="space-y-6">
        {header}
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <BookCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Data mahasiswa tidak ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">
            Akun ini belum terhubung dengan data mahasiswa. Hubungi admin akademik.
          </p>
        </div>
      </div>
    );
  }

  const { groups } = history;
  const stats = [
    { label: 'Semester Selesai', value: groups.length, icon: Layers },
    { label: 'Mata Kuliah Diambil', value: history.courseCount, icon: BookCheck },
    { label: 'SKS Lulus', value: history.passedCredits, icon: CheckCircle2 },
    { label: 'IPK', value: history.cumulativeGpa.toFixed(2), icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p>
                <p className="text-[11px] text-slate-500 truncate">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <BookCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum ada riwayat akademik</p>
          <p className="text-xs text-slate-500 mt-1">
            Mata kuliah dari semester sebelumnya akan tampil di sini.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section
            key={group.key}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Semester {group.semester}</h3>
                <p className="text-[11px] text-slate-500">{group.academicYear}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {group.credits} SKS
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  IPS {group.gpa.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <th className="py-3 px-5">Kode</th>
                    <th className="py-3 px-5">Mata Kuliah</th>
                    <th className="py-3 px-5 text-center">SKS</th>
                    <th className="py-3 px-5 text-center">Nilai</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.rows.map(({ record: r, countedInCumulative }) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-5 font-mono font-semibold text-blue-700">
                        {r.courseCode}
                      </td>
                      <td className="py-3 px-5 font-medium text-slate-800">{r.courseName}</td>
                      <td className="py-3 px-5 text-center">{r.credits}</td>
                      <td className="py-3 px-5 text-center font-bold text-slate-900">
                        {r.letterGrade}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {r.letterGrade === 'IP' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="w-3 h-3" />
                              Berjalan
                            </span>
                          ) : PASSING_GRADES.includes(r.letterGrade) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Lulus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-rose-50 text-rose-700 border-rose-200">
                              <XCircle className="w-3 h-3" />
                              Tidak Lulus
                            </span>
                          )}
                          {!countedInCumulative && (
                            <span
                              title="Mata kuliah ini diulang. Nilai ini tidak dipakai untuk IPK dan SKS lulus."
                              className="px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-slate-50 text-slate-600 border-slate-200"
                            >
                              Diulang
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
};
