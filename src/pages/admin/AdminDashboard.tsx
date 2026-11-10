import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { calculateCourseDemand } from '../../utils/demandForecaster';
import { Link } from 'react-router';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Building2,
  BarChart3,
  History,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { students, lecturers, courses, classes, studyPlans, auditLogs } = useAcademic();

  const demandAnalysis = calculateCourseDemand(courses, classes, studyPlans, 35);
  const criticalCourses = demandAnalysis.filter((d) => d.status === 'Kritis' || d.status === 'Peringatan');
  const pendingApprovals = studyPlans.filter((p) => p.status === 'submitted').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pusat Manajemen Akademik & Pengambilan Keputusan"
        subtitle="Sistem Informasi Akademik dan Manajemen Studi (SIAM) Universitas Klabat"
        breadcrumbs={[{ label: 'Administrator', path: '/admin/dashboard' }]}
        actions={
          <Link
            to="/admin/reports"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Buka Course Demand Analyzer
          </Link>
        }
      />

      {/* Critical Demand Alert Banner */}
      {criticalCourses.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">
                Peringatan Kapasitas: Terdeteksi {criticalCourses.length} Mata Kuliah dengan Permintaan Tinggi
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Berdasarkan proyeksi KRS draft dan submitted mahasiswa, beberapa mata kuliah telah mendekati atau melebihi kapasitas kelas yang dibuka.
              </p>
            </div>
          </div>
          <Link
            to="/admin/reports"
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Analisis Kebutuhan
          </Link>
        </div>
      )}

      {/* Top 4 Enterprise Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mahasiswa Aktif"
          value={`${students.length} Orang`}
          subtitle="Program Studi Informatika"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Dosen Fasilkom"
          value={`${lecturers.length} Orang`}
          subtitle="Tenaga Pengajar & Dosen PA"
          icon={GraduationCap}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Katalog Mata Kuliah"
          value={`${courses.length} MK`}
          subtitle="Kurikulum MBKM 2024"
          icon={BookOpen}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Kelas Perkuliahan Buka"
          value={`${classes.length} Seksi`}
          subtitle="Semester Ganjil 2026/2027"
          icon={ClipboardList}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Main Grid: Course Demand Preview & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Demand Forecast Preview (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#142B4A]">
                Proyeksi Kebutuhan Kelas (Formula: CEILING(Peminat / Kapasitas))
              </h2>
              <p className="text-xs text-slate-500">Estimasi pembukaan seksi baru untuk menghindari kekurangan kuota</p>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Laporan Lengkap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] bg-slate-50">
                  <th className="py-2.5 px-3">Kode & Mata Kuliah</th>
                  <th className="py-2.5 px-3 text-center">Peminat</th>
                  <th className="py-2.5 px-3 text-center">Kelas Ada</th>
                  <th className="py-2.5 px-3 text-center">Kapasitas</th>
                  <th className="py-2.5 px-3 text-center">Dibutuhkan</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demandAnalysis.slice(0, 5).map((d) => (
                  <tr key={d.courseId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{d.courseName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{d.courseCode}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-blue-600">
                      {d.totalDemand} Mhs
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-600">
                      {d.existingClasses} Seksi
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-600">
                      {d.totalCapacity} Kursi
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-slate-900">
                      {d.classesNeeded} Seksi
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'Kritis'
                            ? 'bg-red-100 text-red-800'
                            : d.status === 'Peringatan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Audit Trail */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#142B4A]">Log Aktivitas Sistem</h2>
              <p className="text-xs text-slate-500">Jejak audit tindakan penting</p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.userName}</span>
                  <span className="text-[10px] text-slate-400">{log.timestamp.substring(11, 16)}</span>
                </div>
                <p className="text-blue-600 font-mono text-[10px] font-semibold">{log.action}</p>
                <p className="text-slate-600 text-[11px] line-clamp-2">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
