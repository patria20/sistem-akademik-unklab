import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Users, Award, CheckSquare } from 'lucide-react';

export const LecturerClassAnalysisPage: React.FC = () => {
  const { classes, activeLecturer } = useAcademic();
  const lecturerClasses = classes.filter((c) => c.lecturerId === activeLecturer?.id);
  const [selectedClassId, setSelectedClassId] = useState(lecturerClasses[0]?.id || '');

  const currentClass = classes.find((c) => c.id === selectedClassId) || lecturerClasses[0];

  const gradeDistribution = [
    { grade: 'A', count: 12, fill: '#10B981' },
    { grade: 'A-', count: 8, fill: '#34D399' },
    { grade: 'B+', count: 6, fill: '#60A5FA' },
    { grade: 'B', count: 4, fill: '#3B82F6' },
    { grade: 'B-', count: 2, fill: '#93C5FD' },
    { grade: 'C+', count: 1, fill: '#F59E0B' },
    { grade: 'C', count: 1, fill: '#FBBF24' },
    { grade: 'D', count: 0, fill: '#EF4444' },
    { grade: 'F', count: 0, fill: '#DC2626' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analisis Kinerja & Statistik Kelas"
        subtitle="Distribusi perolehan nilai huruf, rerata indeks prestasi, dan keaktifan mahasiswa"
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Analisis Kelas' },
        ]}
      />

      {/* Class Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700">Pilih Kelas Analisis:</label>
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
      </div>

      {/* Top 3 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Rata-rata Nilai Kelas"
          value="3.58"
          subtitle="Setara Grade A- / Sangat Baik"
          icon={Award}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Mahasiswa Terdaftar"
          value={`${currentClass?.enrolled || 32} Orang`}
          subtitle={`Kapasitas maksimal: ${currentClass?.capacity || 35} kursi`}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Rerata Kehadiran Kelas"
          value="92.4%"
          subtitle="Memenuhi standar minimal kelulusan"
          icon={CheckSquare}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[#142B4A]">
            Histogram Sebaran Nilai: {currentClass?.courseName} ({currentClass?.section})
          </h3>
          <p className="text-xs text-slate-500">Jumlah mahasiswa per grade huruf</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
