import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  MessageSquare,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Send,
  X,
  Sparkles,
} from 'lucide-react';

export const ConsultationPage: React.FC = () => {
  const { activeStudent, lecturers, consultations, createConsultation } = useAcademic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [selectedLecturerId, setSelectedLecturerId] = useState(lecturers[0]?.id || 'lec_01');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!activeStudent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !message.trim()) return;

    createConsultation(selectedLecturerId, topic, message);
    setIsModalOpen(false);
    setTopic('');
    setMessage('');
    setSuccessToast('Permohonan bimbingan akademik berhasil dikirim ke Dosen PA.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bimbingan & Konsultasi Akademik"
        subtitle={`Komunikasi dan penjadwalan temu bimbingan dengan Dosen Pembina Akademik (${activeStudent.academicAdvisorName})`}
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Konsultasi PA' },
        ]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajukan Bimbingan Baru
          </button>
        }
      />

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Consultations Thread List */}
      <div className="space-y-4">
        {consultations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Belum ada riwayat bimbingan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan tombol di atas untuk mengajukan topik konsultasi KRS, skripsi, atau akademik lainnya.
            </p>
          </div>
        ) : (
          consultations.map((cns) => (
            <div
              key={cns.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{cns.topic}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tujuan: <strong>{cns.lecturerName}</strong> • Diajukan: {cns.createdAt}
                  </p>
                </div>
                <StatusBadge status={cns.status} size="sm" />
              </div>

              {/* Student Message */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Pesan Mahasiswa:
                </p>
                <p className="leading-relaxed pl-5">{cns.message}</p>
              </div>

              {/* Scheduled date banner if any */}
              {cns.scheduledDate && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Jadwal Temu Bimbingan:</strong> {cns.scheduledDate}
                  </span>
                </div>
              )}

              {/* Lecturer Reply */}
              {cns.lecturerReply ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
                  <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Tanggapan Dosen Pembina:
                  </p>
                  <p className="leading-relaxed pl-5 italic">"{cns.lecturerReply}"</p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic flex items-center gap-1 pl-1">
                  <Clock className="w-3.5 h-3.5" />
                  Menunggu tanggapan dari Dosen Pembimbing Akademik...
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Consultation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Pengajuan Jadwal Bimbingan / Konsultasi
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Dosen Pembimbing:</label>
                <select
                  value={selectedLecturerId}
                  onChange={(e) => setSelectedLecturerId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                >
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.name} ({lec.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Topik Konsultasi:</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Rencana Pengambilan Skripsi & Magang MBKM"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pesan / Rincian Pertanyaan:</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan latar belakang masalah atau topik yang ingin didiskusikan secara jelas..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
