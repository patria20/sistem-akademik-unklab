import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { ConsultationSession } from '../../types/academic';
import {
  MessageSquare,
  Calendar,
  Send,
  X,
  User,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const LecturerConsultationPage: React.FC = () => {
  const { consultations, replyConsultation } = useAcademic();

  const [selectedSession, setSelectedSession] = useState<ConsultationSession | null>(null);
  const [replyText, setReplyText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleOpenReply = (cns: ConsultationSession) => {
    setSelectedSession(cns);
    setReplyText(cns.lecturerReply || '');
    setScheduledDate(cns.scheduledDate || '');
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !replyText.trim()) return;

    replyConsultation(selectedSession.id, replyText, scheduledDate);
    const studentName = selectedSession.studentName;
    setSelectedSession(null);
    setSuccessToast(`Tanggapan bimbingan telah dikirimkan ke mahasiswa ${studentName}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Permintaan Bimbingan & Konsultasi Mahasiswa"
        subtitle="Kelola jadwal bimbingan akademik, konsultasi rencana studi, dan skripsi"
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Konsultasi Mahasiswa' },
        ]}
      />

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Consultation Sessions List */}
      <div className="space-y-4">
        {consultations.map((cns) => (
          <div
            key={cns.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{cns.topic}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dari: <strong>{cns.studentName}</strong> ({cns.studentNim}) • Tanggal:{' '}
                  {cns.createdAt}
                </p>
              </div>
              <StatusBadge status={cns.status} size="sm" />
            </div>

            {/* Message from student */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Pesan dari Mahasiswa:
              </span>
              <p className="leading-relaxed pl-5">{cns.message}</p>
            </div>

            {/* Lecturer response if any */}
            {cns.lecturerReply && (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Balasan Dosen Pembina:
                </span>
                <p className="leading-relaxed pl-5 italic">"{cns.lecturerReply}"</p>
                {cns.scheduledDate && (
                  <p className="mt-2 text-blue-700 font-semibold pl-5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Waktu Bimbingan: {cns.scheduledDate}
                  </p>
                )}
              </div>
            )}

            {/* Action */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleOpenReply(cns)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {cns.lecturerReply ? 'Ubah Tanggapan / Jadwal' : 'Beri Tanggapan / Jadwalkan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Tanggapan Bimbingan: {selectedSession.studentName}
              </h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Topik:</label>
                <p className="text-xs font-semibold text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {selectedSession.topic}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Jadwal Temu Bimbingan (Opsional):
                </label>
                <input
                  type="text"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  placeholder="Contoh: Kamis, 12 Nov 2026 pk 10:00 WITA di Ruang Kaprodi"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tanggapan Dosen PA:</label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tuliskan arahan akademik atau persetujuan jadwal temu bimbingan..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Kirim Tanggapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
