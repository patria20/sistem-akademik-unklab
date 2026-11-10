import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { StudyPlan } from '../../types/academic';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  User,
  Calendar,
  Clock,
  BookOpen,
  Send,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const KRSApprovalPage: React.FC = () => {
  const { studyPlans, students, reviewKrs } = useAcademic();
  const { success, warning } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const filteredPlans = studyPlans.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleOpenDetail = (plan: StudyPlan) => {
    setSelectedPlan(plan);
    setFeedbackNote(plan.advisorFeedback || '');
  };

  const handleProcessDecision = (decision: 'approved' | 'revision') => {
    if (!selectedPlan) return;

    reviewKrs(selectedPlan.id, decision, feedbackNote);
    const studentName = selectedPlan.studentName;
    setSelectedPlan(null);

    if (decision === 'approved') {
      success('KRS Disetujui', `KRS Mahasiswa ${studentName} berhasil disetujui secara resmi.`);
    } else {
      warning('Revisi KRS Dikirim', `Permintaan revisi KRS telah diteruskan ke mahasiswa ${studentName}.`);
    }

    setActionSuccessToast(
      decision === 'approved'
        ? `KRS Mahasiswa ${studentName} berhasil DISETUJUI secara resmi.`
        : `Permintaan revisi KRS telah dikirimkan ke mahasiswa ${studentName}.`
    );

    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi & Persetujuan KRS Mahasiswa"
        subtitle="Evaluasi rencana studi semesteran mahasiswa bimbingan akademik Anda"
        breadcrumbs={[
          { label: 'Dosen PA', path: '/lecturer/dashboard' },
          { label: 'Persetujuan KRS' },
        ]}
      />

      {actionSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === 'all' ? 'bg-[#142B4A] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua ({studyPlans.length})
        </button>
        <button
          onClick={() => setFilterStatus('submitted')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === 'submitted'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Menunggu Tinjauan ({studyPlans.filter((p) => p.status === 'submitted').length})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === 'approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Disetujui ({studyPlans.filter((p) => p.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilterStatus('revision')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterStatus === 'revision'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Perlu Revisi ({studyPlans.filter((p) => p.status === 'revision').length})
        </button>
      </div>

      {/* Main Study Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                <th className="py-3 px-4">Nama Mahasiswa</th>
                <th className="py-3 px-4">NIM</th>
                <th className="py-3 px-4 text-center">Beban SKS</th>
                <th className="py-3 px-4">Catatan Mahasiswa</th>
                <th className="py-3 px-4">Status Pengajuan</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.map((plan) => {
                const student = students.find((s) => s.id === plan.studentId);

                return (
                  <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{plan.studentName}</p>
                      <p className="text-[10px] text-slate-400">
                        IPK: {student?.cumulativeGpa || 3.65} • IPS: {student?.lastSemesterGpa || 3.75}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {plan.studentNim}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-blue-600 text-xs">
                        {plan.totalCredits} SKS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {plan.notes || <span className="text-slate-400 italic">Tidak ada catatan</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={plan.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(plan)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Tinjau Berkas
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* KRS Detailed Review Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Rencana Studi: {selectedPlan.studentName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  NIM: {selectedPlan.studentNim} • Semester {selectedPlan.semester} ({selectedPlan.academicYear})
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Note */}
            {selectedPlan.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-800">Catatan Mahasiswa:</span>
                <p className="mt-1 italic">"{selectedPlan.notes}"</p>
              </div>
            )}

            {/* Selected Courses Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Daftar Mata Kuliah Terpilih</span>
                <span className="text-blue-600 font-extrabold">{selectedPlan.totalCredits} SKS Total</span>
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                      <th className="py-2 px-3">Kode & Mata Kuliah</th>
                      <th className="py-2 px-3 text-center">SKS</th>
                      <th className="py-2 px-3">Jadwal & Ruang</th>
                      <th className="py-2 px-3">Dosen Pengampu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPlan.items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                          Belum ada item mata kuliah tertera.
                        </td>
                      </tr>
                    ) : (
                      selectedPlan.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-800">{item.courseName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {item.courseCode} — Seksi {item.section}
                            </p>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.credits}</td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {item.day}, {item.startTime}-{item.endTime} ({item.room})
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {item.lecturerName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advisor Feedback Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Catatan / Instruksi Dosen Pembina Akademik:
              </label>
              <textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Tuliskan catatan persetujuan atau alasan meminta revisi..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedPlan(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>

              <button
                onClick={() => handleProcessDecision('revision')}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Minta Revisi
              </button>

              <button
                onClick={() => handleProcessDecision('approved')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui KRS Resmi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
