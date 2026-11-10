import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { calculateCourseDemand } from '../../utils/demandForecaster';
import type { CourseClass } from '../../types/academic';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Users,
  ClipboardList,
  Layers,
  X,
  Send,
} from 'lucide-react';

export const CourseDemandAnalyzerPage: React.FC = () => {
  const { courses, classes, studyPlans, lecturers, addNewClass } = useAcademic();

  const demandData = calculateCourseDemand(courses, classes, studyPlans, 35);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [newSection, setNewSection] = useState('C');
  const [selectedLecturerId, setSelectedLecturerId] = useState(lecturers[0]?.id || 'lec_01');
  const [day, setDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('Rabu');
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('13:00');
  const [room, setRoom] = useState('GK1-304');
  const [capacity, setCapacity] = useState(35);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Totals
  const totalDemand = demandData.reduce((sum, d) => sum + d.totalDemand, 0);
  const totalClassesNeeded = demandData.reduce((sum, d) => sum + d.classesNeeded, 0);
  const totalExistingClasses = demandData.reduce((sum, d) => sum + d.existingClasses, 0);
  const totalShortage = demandData.reduce((sum, d) => sum + d.shortage, 0);

  // Chart data
  const chartData = demandData.slice(0, 8).map((d) => ({
    name: d.courseCode,
    peminat: d.totalDemand,
    kapasitas: d.totalCapacity,
  }));

  const handleOpenAddClass = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleCreateNewSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const course = courses.find((c) => c.id === selectedCourseId);
    const lecturer = lecturers.find((l) => l.id === selectedLecturerId) || lecturers[0];
    if (!course) return;

    const newClassObj: CourseClass = {
      id: `cls_${course.code.toLowerCase()}_${newSection.toLowerCase()}_${Date.now()}`,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      credits: course.credits,
      section: newSection,
      lecturerId: lecturer.id,
      lecturerName: lecturer.name,
      day,
      startTime,
      endTime,
      room,
      capacity,
      enrolled: 0,
    };

    addNewClass(newClassObj);
    setSelectedCourseId(null);
    setSuccessToast(`Kelas baru ${course.code} Seksi ${newSection} berhasil dibuka dan ditambahkan ke katalog.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Demand Analyzer & Proyeksi Kapasitas Kelas"
        subtitle="Analisis kebutuhan kelas deterministik: Jumlah Kelas Dibutuhkan = CEILING(Peminat / Kapasitas)"
        breadcrumbs={[
          { label: 'Administrator', path: '/admin/dashboard' },
          { label: 'Course Demand Analyzer' },
        ]}
      />

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Peminat Mahasiswa"
          value={`${totalDemand} Kursi`}
          subtitle="Akumulasi draft, submit & approved"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Kelas Tersedia Saat Ini"
          value={`${totalExistingClasses} Seksi`}
          subtitle="Kapasitas dibuka saat ini"
          icon={ClipboardList}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Estimasi Kebutuhan Kelas"
          value={`${totalClassesNeeded} Seksi`}
          subtitle="Formula: CEILING(Peminat / 35)"
          icon={BarChart3}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Defisit Kursi (Shortage)"
          value={`${totalShortage} Kursi`}
          subtitle={totalShortage > 0 ? 'Perlu pembukaan seksi baru' : 'Kapasitas terpenuhi'}
          icon={AlertTriangle}
          iconColor={totalShortage > 0 ? 'text-red-600' : 'text-slate-400'}
          iconBg={totalShortage > 0 ? 'bg-red-50' : 'bg-slate-100'}
        />
      </div>

      {/* Comparison Chart: Demand vs Capacity */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[#142B4A]">
            Perbandingan Permintaan (Demand) vs Kapasitas Tersedia per Mata Kuliah
          </h3>
          <p className="text-xs text-slate-500">Mata kuliah dengan peminat melebihi kapasitas diberi tanda peringatan</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
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
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="peminat" name="Peminat Mahasiswa" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="kapasitas" name="Kapasitas Dibuka" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Official Master Demand Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#142B4A]">Tabel Lengkap Analisis Kebutuhan Kelas</h2>
            <p className="text-xs text-slate-500">
              Data terpisah antara status Draft, Submitted, dan Approved
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] bg-slate-50">
                <th className="py-3 px-3">Mata Kuliah</th>
                <th className="py-3 px-3 text-center">SKS</th>
                <th className="py-3 px-3 text-center">Draft</th>
                <th className="py-3 px-3 text-center">Submitted</th>
                <th className="py-3 px-3 text-center">Approved</th>
                <th className="py-3 px-3 text-center font-bold text-blue-700">Total Peminat</th>
                <th className="py-3 px-3 text-center">Kelas Ada</th>
                <th className="py-3 px-3 text-center">Kapasitas</th>
                <th className="py-3 px-3 text-center font-bold text-purple-700">Kelas Butuh</th>
                <th className="py-3 px-3 text-center">Defisit</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demandData.map((d) => (
                <tr key={d.courseId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{d.courseName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{d.courseCode}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">{d.credits}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{d.draftDemand}</td>
                  <td className="py-3 px-3 text-center text-amber-600 font-semibold">{d.submittedDemand}</td>
                  <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{d.approvedDemand}</td>
                  <td className="py-3 px-3 text-center font-extrabold text-blue-600 text-xs">
                    {d.totalDemand}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">{d.existingClasses}</td>
                  <td className="py-3 px-3 text-center text-slate-700">{d.totalCapacity}</td>
                  <td className="py-3 px-3 text-center font-black text-purple-700 text-xs">
                    {d.classesNeeded}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {d.shortage > 0 ? (
                      <span className="font-bold text-red-600">+{d.shortage}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
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
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleOpenAddClass(d.courseId)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-xs transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Buka Seksi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Section Modal */}
      {selectedCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Buka Seksi Baru: {courses.find((c) => c.id === selectedCourseId)?.name}
              </h3>
              <button
                onClick={() => setSelectedCourseId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSection} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Nama Seksi:</label>
                  <input
                    type="text"
                    required
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Kapasitas Kursi:</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={60}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Dosen Pengampu:</label>
                <select
                  value={selectedLecturerId}
                  onChange={(e) => setSelectedLecturerId(e.target.value)}
                  className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                >
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Hari:</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as any)}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Jam Mulai:</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Jam Selesai:</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Ruangan Kuliah:</label>
                <input
                  type="text"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Contoh: GK1-304"
                  className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCourseId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Simpan & Buka Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
