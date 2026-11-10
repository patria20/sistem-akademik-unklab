import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  FileCheck,
  AlertCircle,
  TrendingUp,
  MapPin,
  User,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { activeStudent, activeKrs, classes } = useAcademic();

  if (!activeStudent) return null;

  // Historical GPA Data for Recharts
  const gpaHistoryData = [
    { semester: 'Sem 1', ips: 3.8, ipk: 3.8 },
    { semester: 'Sem 2', ips: 3.7, ipk: 3.75 },
    { semester: 'Sem 3', ips: 3.65, ipk: 3.72 },
    { semester: 'Sem 4', ips: 3.75, ipk: 3.65 },
    { semester: 'Sem 5 (Aktif)', ips: activeStudent.lastSemesterGpa, ipk: activeStudent.cumulativeGpa },
  ];

  // Current enrolled classes (from activeKrs)
  const enrolledClassIds = activeKrs?.items.map((i) => i.classId) || [];
  const studentSchedule = classes.filter((c) => enrolledClassIds.includes(c.id));

  // Academic completion percentage
  const targetSks = 144;
  const earnedSks = activeStudent.creditsEarned;
  const currentSks = activeKrs?.totalCredits || 0;
  const progressPercent = Math.min(100, Math.round(((earnedSks + currentSks) / targetSks) * 100));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat Datang, ${activeStudent.name}`}
        subtitle={`Program Studi ${activeStudent.programStudy} — ${activeStudent.faculty}`}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">Status KRS Semester Ini:</span>
            <StatusBadge status={activeStudent.krsStatus} />
          </div>
        }
      />

      {/* KRS Status Alert Banner if Submitted / Revision */}
      {activeStudent.krsStatus === 'submitted' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">KRS Telah Dikirim & Menunggu Tinjauan</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Rencana studi Anda ({activeKrs?.totalCredits} SKS) sedang ditinjau oleh Dosen Pembina Akademik:{' '}
                <strong>{activeStudent.academicAdvisorName}</strong>.
              </p>
            </div>
          </div>
          <Link
            to="/student/study-plan"
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Lihat Detail KRS
          </Link>
        </div>
      )}

      {activeStudent.krsStatus === 'revision' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-900">Perhatian: KRS Memerlukan Revisi</p>
              <p className="text-xs text-red-700 mt-0.5">
                Dosen PA memberikan catatan revisi pada formulir KRS Anda. Silakan buka menu Rencana Studi untuk menyesuaikan pilihan mata kuliah.
              </p>
            </div>
          </div>
          <Link
            to="/student/study-plan"
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Revisi Sekarang
          </Link>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="IP Semester Terakhir"
          value={activeStudent.lastSemesterGpa.toFixed(2)}
          subtitle="Semester 4 Genap"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badge="Batas 24 SKS"
          badgeColor="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="IPK Kumulatif"
          value={activeStudent.cumulativeGpa.toFixed(2)}
          subtitle="Predikat: Sangat Memuaskan"
          icon={Award}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badge="Grade A"
          badgeColor="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          title="SKS Lulus"
          value={`${earnedSks} / ${targetSks}`}
          subtitle={`${targetSks - earnedSks} SKS tersisa menuju wisuda`}
          icon={GraduationCap}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="SKS Ditempuh (Sem 5)"
          value={`${currentSks} SKS`}
          subtitle={`Maksimal diizinkan: ${activeStudent.maxCreditLimit} SKS`}
          icon={BookOpen}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          badge={activeStudent.krsStatus.toUpperCase()}
        />
      </div>

      {/* Main Grid: GPA Trends Chart & Academic Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): GPA Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#142B4A]">Tren Perkembangan Indeks Prestasi</h2>
              <p className="text-xs text-slate-500">Perbandingan IP Semester (IPS) dan IP Kumulatif (IPK)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 font-medium">IPS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">IPK</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIpk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[2.0, 4.0]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area type="monotone" dataKey="ips" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIps)" />
                <Area type="monotone" dataKey="ipk" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIpk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (1 col): Progress Bar & Academic Advisor Card */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-[#142B4A] mb-1">Capaian Kurikulum</h2>
            <p className="text-xs text-slate-500 mb-4">Progres pemenuhan 144 SKS kelulusan sarjana</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Total SKS Terpenuhi</span>
                <span className="text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400">Lulus Sebelumnya</p>
                <p className="font-bold text-slate-800 text-sm">{earnedSks} SKS</p>
              </div>
              <div>
                <p className="text-slate-400">Sedang Berjalan</p>
                <p className="font-bold text-blue-600 text-sm">{currentSks} SKS</p>
              </div>
            </div>
          </div>

          {/* Academic Advisor Quick Contact Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Dosen Pembina Akademik (PA)
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                RG
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{activeStudent.academicAdvisorName}</p>
                <p className="text-[11px] text-slate-500">Kaprodi Informatika UNKLAB</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/student/consultation"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
              >
                Jadwalkan Konsultasi <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Enrolled Classes Schedule */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#142B4A]">Mata Kuliah & Jadwal Aktif Semester 5</h2>
            <p className="text-xs text-slate-500">Jadwal perkuliahan mingguan yang tercantum pada KRS</p>
          </div>
          <Link
            to="/student/schedule"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Lihat Kalender Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {studentSchedule.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Belum ada mata kuliah yang terdaftar</p>
            <p className="text-xs text-slate-500 mt-1">
              Buka menu KRS Builder untuk mulai memilih mata kuliah semester ini.
            </p>
            <Link
              to="/student/study-plan"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Mulai Susun KRS
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/70">
                  <th className="py-3 px-3">Kode & Mata Kuliah</th>
                  <th className="py-3 px-3 text-center">SKS</th>
                  <th className="py-3 px-3">Hari & Jam</th>
                  <th className="py-3 px-3">Ruangan</th>
                  <th className="py-3 px-3">Dosen Pengampu</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentSchedule.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{cls.courseName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {cls.courseCode} — Seksi {cls.section}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">
                      {cls.credits} SKS
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {cls.day}, {cls.startTime} - {cls.endTime} WITA
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {cls.room}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {cls.lecturerName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={activeStudent.krsStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom AI Recommendation Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#142B4A] to-[#1E3A8A] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Butuh Saran Perencanaan Rencana Studi?</h3>
            <p className="text-xs text-blue-200 mt-0.5">
              AI Academic Assistant siap memberikan rekomendasi mata kuliah berdasarkan prasyarat & minat karier Anda.
            </p>
          </div>
        </div>
        <Link
          to="/student/ai-assistant"
          className="px-4 py-2 rounded-xl bg-white text-[#142B4A] font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs whitespace-nowrap"
        >
          Konsultasi dengan AI
        </Link>
      </div>
    </div>
  );
};
