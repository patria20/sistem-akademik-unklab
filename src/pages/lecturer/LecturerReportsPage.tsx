
import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  User,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  Inbox,
} from 'lucide-react';

import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import {
  ReportService,
  type IssueStatus,
} from '../../services/reportService';

const categoryLabels: Record<string, string> = {
  presensi: 'Masalah Presensi',
  krs: 'Masalah KRS',
  nilai: 'Nilai Belum Muncul',
};

const statusLabels: Record<IssueStatus, string> = {
  submitted: 'Menunggu Ditinjau',
  in_review: 'Sedang Ditinjau',
  resolved: 'Selesai',
};

const statusStyles: Record<IssueStatus, string> = {
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const LecturerReportsPage: React.FC = () => {
  const { students, activeLecturer } = useAcademic();
  const [version, setVersion] = useState(0);
  const [filter, setFilter] = useState<'all' | IssueStatus>('all');

  const reports = useMemo(() => {
    if (!activeLecturer) return [];

    const adviseeIds = new Set(
      students
        .filter(
          (student) =>
            student.academicAdvisorId === activeLecturer.id
        )
        .map((student) => student.id)
    );

    return ReportService.getAll().filter((report) =>
      adviseeIds.has(report.studentId)
    );
  }, [students, activeLecturer, version]);

  const filteredReports = reports.filter(
    (report) => filter === 'all' || report.status === filter
  );

  const updateStatus = (
    reportId: string,
    status: IssueStatus
  ) => {
    ReportService.updateStatus(reportId, status);
    setVersion((current) => current + 1);
  };

  const getStudent = (studentId: string) =>
    students.find((student) => student.id === studentId);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

  const pendingCount = reports.filter(
    (report) => report.status === 'submitted'
  ).length;

  const reviewCount = reports.filter(
    (report) => report.status === 'in_review'
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === 'resolved'
  ).length;

  if (!activeLecturer) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Masalah Akademik"
        subtitle="Kelola laporan masalah akademik dari mahasiswa bimbingan PA Anda."
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Laporan Masalah Akademik' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Inbox className="w-5 h-5" />
            <span className="text-xs font-semibold">
              Menunggu Ditinjau
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold">
              Sedang Ditinjau
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {reviewCount}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-semibold">Selesai</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {resolvedCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">
            Daftar Laporan Mahasiswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total {reports.length} laporan dari mahasiswa bimbingan Anda.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as 'all' | IssueStatus)
          }
          className="text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
        >
          <option value="all">Semua Status</option>
          <option value="submitted">Menunggu Ditinjau</option>
          <option value="in_review">Sedang Ditinjau</option>
          <option value="resolved">Selesai</option>
        </select>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">
            Belum Ada Laporan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Belum ada laporan dengan status yang dipilih dari mahasiswa
            bimbingan Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const student = getStudent(report.studentId);

            return (
              <div
                key={report.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {categoryLabels[report.category] || report.category}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      ID Laporan: {report.id}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit px-3 py-1 rounded-full border text-[11px] font-semibold ${statusStyles[report.status]}`}
                  >
                    {statusLabels[report.status]}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>
                      <strong>
                        {student?.name || 'Mahasiswa tidak ditemukan'}
                      </strong>
                      {student ? ` (${student.nim})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>

                  {report.courseCode && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>Mata Kuliah: {report.courseCode}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-[11px] font-bold text-slate-500 mb-2">
                    DESKRIPSI MASALAH
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-[11px] text-slate-500">
                    Perbarui status penanganan:
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {report.status !== 'in_review' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(report.id, 'in_review')
                        }
                        className="px-3 py-2 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      >
                        Tandai Ditinjau
                      </button>
                    )}

                    {report.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(report.id, 'resolved')
                        }
                        className="px-3 py-2 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
