import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  BookOpen,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  X,
  CheckCircle2,
} from 'lucide-react';
import type { CourseClass } from '../../types/academic';

export const SchedulePage: React.FC = () => {
  const { activeStudent, activeKrs, classes } = useAcademic();

  const [selectedClass, setSelectedClass] = useState<CourseClass | null>(null);
  const [activeDayFilter, setActiveDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState('Agustus 2026');

  if (!activeStudent) return null;

  const enrolledClassIds = activeKrs?.items.map((i) => i.classId) || [];
  const enrolledClasses = classes.filter((c) => enrolledClassIds.includes(c.id));

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;
  const timeSlots = [
    '07:00 - 08:40',
    '09:00 - 10:40',
    '11:00 - 12:40',
    '13:00 - 14:40',
    '15:00 - 16:40',
  ];

  const filteredClasses = enrolledClasses.filter((c) => {
    const matchesDay = activeDayFilter === 'all' || c.day === activeDayFilter;
    const matchesSearch =
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesSearch;
  });

  const getCourseColor = (code: string) => {
    if (code.includes('101') || code.includes('102'))
      return 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400';
    if (code.includes('201') || code.includes('202'))
      return 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400';
    if (code.includes('301') || code.includes('302'))
      return 'bg-purple-50 border-purple-200 text-purple-900 hover:border-purple-400';
    return 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-400';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Perkuliahan Mahasiswa"
        subtitle="Matriks perkuliahan terdaftar Semester Ganjil 2026/2027 • Universitas Klabat"
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Jadwal Kuliah' },
        ]}
      />

      {/* Top Action & Filter Toolbar (Inspired by Youcare Ref) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mata kuliah atau dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <select
            value={activeDayFilter}
            onChange={(e) => setActiveDayFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Semua Hari</option>
            {days.map((d) => (
              <option key={d} value={d}>
                Hari {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Jadwal (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Left Mini-Calendar/List + Right Grid (Youcare Pattern) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols on lg): Mini Calendar & Upcoming List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Calendar Widget */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kalender Akademik
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                <span>{calendarMonth}</span>
              </div>
            </div>

            {/* Days Grid header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>

            {/* Days numbers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-700">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const isSelected = day === 10;
                const hasClass = [3, 5, 8, 10, 12, 17, 19, 24].includes(day);

                return (
                  <button
                    key={day}
                    className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center transition-all relative ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{day}</span>
                    {hasClass && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-blue-600 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule List (Youcare Doctor/Appointment list pattern) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Daftar Perkuliahan Terdaftar
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {enrolledClasses.length} MK
              </span>
            </div>

            <div className="space-y-3">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 font-mono">
                        {cls.courseCode}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600">{cls.day}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate mt-1 group-hover:text-blue-600 transition-colors">
                      {cls.courseName}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{cls.lecturerName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      {cls.startTime}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1">{cls.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols on lg): Time-Grid Schedule View */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#142B4A]">Matriks Perkuliahan Mingguan</h3>
              <p className="text-[11px] text-slate-500">
                Klik kartu sesi mata kuliah untuk melihat rincian ruang, dosen, dan silabus.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Reguler
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Lab / Praktikum
              </span>
            </div>
          </div>

          {/* Days Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {days.map((day) => {
              const dayClasses = filteredClasses.filter((c) => c.day === day);

              return (
                <div key={day} className="space-y-3">
                  {/* Day Header */}
                  <div className="p-2.5 rounded-xl bg-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-800">{day}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {dayClasses.length} sesi
                    </p>
                  </div>

                  {/* Day Class Cards */}
                  <div className="space-y-2.5 min-h-[300px]">
                    {dayClasses.length === 0 ? (
                      <div className="h-32 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 text-center p-2">
                        Kosong
                      </div>
                    ) : (
                      dayClasses.map((cls) => (
                        <div
                          key={cls.id}
                          onClick={() => setSelectedClass(cls)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${getCourseColor(
                            cls.courseCode
                          )}`}
                        >
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider block opacity-75">
                            {cls.courseCode} ({cls.section})
                          </span>
                          <h4 className="text-xs font-bold mt-1 leading-snug line-clamp-2">
                            {cls.courseName}
                          </h4>

                          <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1 text-[10px]">
                            <div className="flex items-center gap-1 font-bold">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>
                                {cls.startTime} - {cls.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-80 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{cls.room}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Class Detail Modal (Youcare Edit/Detail Schedule Pattern) */}
      {selectedClass && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                  {selectedClass.courseCode} • Kelas {selectedClass.section}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedClass.courseName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hari & Waktu:</span>
                <span className="font-bold text-slate-800">
                  {selectedClass.day}, {selectedClass.startTime} - {selectedClass.endTime} WITA
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ruang Kuliah:</span>
                <span className="font-bold text-blue-600">{selectedClass.room}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dosen Pengampu:</span>
                <span className="font-bold text-slate-800">{selectedClass.lecturerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kapasitas Mahasiswa:</span>
                <span className="font-bold text-slate-800">
                  {selectedClass.enrolled} / {selectedClass.capacity} Mahasiswa
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#142B4A] text-white text-xs font-bold hover:bg-[#0f2139] transition-colors"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
