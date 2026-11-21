import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookX,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Info,
  Send,
  X,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ReportService, type IssueCategory, type IssueStatus } from '../../services/reportService';

interface CategoryInfo {
  id: IssueCategory;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  shortDesc: string;
  sop: string[];
  note: string;
  tone: string; // kelas warna untuk badge dan catatan
  iconTone: string; // kelas warna untuk kotak ikon
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'presensi',
    label: 'Masalah Presensi',
    shortLabel: 'Presensi',
    icon: ClipboardList,
    shortDesc: 'Kehadiran tidak tercatat, error absensi, atau konflik jadwal.',
    sop: [
      'Hubungi dosen pengampu mata kuliah yang bersangkutan untuk mengonfirmasi kehadiran.',
      'Minta surat keterangan kehadiran atau berita acara koreksi dari dosen.',
      'Serahkan bukti ke bagian administrasi Fakultas Ilmu Komputer (FIK) dalam batas waktu yang ditentukan.',
      'Pantau pembaruan presensi di portal akademik setelah proses verifikasi selesai.',
      'Jika tidak ada respons dalam 3 hari kerja, hubungi Staf Akademik FIK secara langsung.',
    ],
    note: 'Pastikan membawa bukti pendukung seperti foto absensi, bukti kehadiran, atau jadwal kuliah resmi.',
    tone: 'bg-blue-50 border-blue-200 text-blue-700',
    iconTone: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'krs',
    label: 'Masalah KRS / Pengisian Jadwal',
    shortLabel: 'KRS',
    icon: FileText,
    shortDesc: 'Gagal mengisi KRS, mata kuliah terkunci, atau konflik jadwal.',
    sop: [
      'Pastikan masa pengisian KRS masih aktif sesuai kalender akademik.',
      'Periksa apakah seluruh prasyarat mata kuliah yang ingin diambil sudah terpenuhi.',
      'Pastikan total SKS tidak melebihi batas: 23 SKS (IPK ≥ 3,35) atau 20 SKS (IPK < 3,35).',
      'Hubungi Dosen Pembimbing Akademik (PA) untuk persetujuan dan pembukaan akses KRS.',
      'Jika sistem mengalami gangguan teknis, laporkan ke helpdesk kampus beserta screenshot.',
      'Simpan bukti pengisian KRS yang berhasil (PDF atau tangkapan layar).',
    ],
    note: 'KRS yang tidak diisi pada waktunya dapat memengaruhi status keaktifan mahasiswa di semester tersebut.',
    tone: 'bg-purple-50 border-purple-200 text-purple-700',
    iconTone: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'nilai',
    label: 'Nilai Belum Muncul',
    shortLabel: 'Nilai',
    icon: BookX,
    shortDesc: 'Nilai akhir tidak tampil di portal, atau terdapat ketidaksesuaian nilai.',
    sop: [
      'Tunggu hingga batas waktu resmi input nilai oleh dosen terlewati (biasanya 2 minggu setelah UAS).',
      'Hubungi dosen pengampu untuk mengonfirmasi apakah nilai sudah diinput ke sistem akademik.',
      'Jika dosen sudah menginput tetapi nilai masih tidak muncul, laporkan ke administrasi akademik FIK.',
      'Siapkan tangkapan layar portal beserta kode dan nama mata kuliah.',
      'Minta tanda terima laporan dari bagian administrasi sebagai arsip.',
    ],
    note: 'Nilai yang sudah final tidak dapat diubah tanpa prosedur resmi dari pejabat akademik yang berwenang.',
    tone: 'bg-amber-50 border-amber-200 text-amber-700',
    iconTone: 'bg-amber-100 text-amber-600',
  },
];

const STATUS_INFO: Record<IssueStatus, { label: string; className: string }> = {
  submitted: { label: 'Dikirim', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_review: { label: 'Ditinjau', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  resolved: { label: 'Selesai', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const MIN_DESCRIPTION_LENGTH = 20;

const inputClass =
  'w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 outline-none bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

export const ReportProblemPage: React.FC = () => {
  const { activeStudent, activeKrs } = useAcademic();
  const studentId = activeStudent?.id;

  const contractedCourses = useMemo(
    () => activeKrs?.items || [],
    [activeKrs?.items]
  );

  const [version, setVersion] = useState(0); // dinaikkan setiap kali laporan baru disimpan
  const [expandedId, setExpandedId] = useState<IssueCategory | null>(null);
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reports = useMemo(
    () => (studentId ? ReportService.getByStudentId(studentId) : []),
    [studentId, version],
  );

  if (!activeStudent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!category) {
      setError('Pilih kategori masalah terlebih dahulu.');
      return;
    }
    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      setError(`Deskripsi masalah minimal ${MIN_DESCRIPTION_LENGTH} karakter.`);
      return;
    }

    ReportService.create({
      studentId: activeStudent.id,
      category,
      courseCode: courseCode || null,
      description: description.trim(),
    });

    setError('');
    setSuccess(true);
    setCategory('');
    setCourseCode('');
    setDescription('');
    setVersion((v) => v + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporkan Masalah"
        subtitle="Lihat panduan penanganan dan catat masalah akademik yang kamu hadapi."
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Laporkan Masalah' },
        ]}
      />

      {/* Panduan penanganan */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Panduan Penanganan Masalah Akademik
        </h2>
        <p className="text-xs text-slate-500">
          Pilih kategori untuk melihat langkah penanganan yang direkomendasikan.
        </p>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isOpen = expandedId === cat.id;
          return (
            <div
              key={cat.id}
              className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs"
            >
  <button
    type="button"
    onClick={() => {
      setExpandedId(isOpen ? null : cat.id);
      setCategory(cat.id);
      setError('');
    }}
    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
  >
              
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.iconTone}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{cat.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.shortDesc}</p>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-4 border-t border-slate-100 space-y-4">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Langkah Penanganan
                  </p>
                  <ol className="space-y-2">
                    {cat.sop.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-slate-600">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full border text-[10px] font-bold shrink-0 mt-0.5 ${cat.tone}`}
                        >
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div
                    className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs ${cat.tone}`}
                  >
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{cat.note}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Form laporan */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Laporkan Masalah Akademik
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Isi formulir berikut untuk mencatat masalah yang kamu hadapi.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-start gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <p className="flex-1">Laporan berhasil dicatat. Tindak lanjuti sesuai panduan di atas.</p>
            <button type="button" onClick={() => setSuccess(false)} aria-label="Tutup">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <p className="flex-1">{error}</p>
            <button type="button" onClick={() => setError('')} aria-label="Tutup">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
  <label className="block text-xs font-semibold text-slate-700 mb-2">
    Kategori Masalah <span className="text-red-500">*</span>
  </label>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {CATEGORIES.map((cat) => {
      const Icon = cat.icon;
      const isSelected = category === cat.id;

      return (
        <button
          key={cat.id}
          type="button"
          onClick={() => {
            setCategory(cat.id);
            setError('');
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
            isSelected
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
          }`}
        >
          <Icon className="w-5 h-5 shrink-0" />

          <span className="text-xs font-semibold">
            {cat.shortLabel}
          </span>

          {isSelected && (
            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
          )}
        </button>
      );
    })}
  </div>

  {!category && (
    <p className="text-[11px] text-slate-400 mt-2">
      Pilih Presensi, KRS, atau Nilai sesuai masalah yang ingin dilaporkan.
    </p>
  )}
</div>
<div>
  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
    Mata Kuliah Terkait{' '}
    <span className="font-normal text-slate-400">(opsional)</span>
  </label>

  <select
    value={courseCode}
    onChange={(e) => setCourseCode(e.target.value)}
    className={inputClass}
  >
    <option value="">-- Tidak Ada / Tidak Diketahui --</option>

    {contractedCourses.map((item) => (
      <option key={item.id} value={item.courseCode}>
        [{item.courseCode}] {item.courseName} ({item.credits} SKS)
      </option>
    ))}
  </select>

  {contractedCourses.length === 0 && (
    <p className="text-[11px] text-amber-600 mt-1">
      Belum ada mata kuliah yang dikontrak dalam KRS aktif.
    </p>
  )}
</div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Masalah <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Jelaskan masalahmu dengan jelas. Contoh: Presensi saya pada tanggal 10 November tidak tercatat meskipun saya hadir..."
              className={`${inputClass} resize-none`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimal {MIN_DESCRIPTION_LENGTH} karakter · {description.length} karakter
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Laporan
            </button>
          </div>
        </form>
      </section>

      {/* Riwayat laporan */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-slate-500" />
          Riwayat Laporan Saya
          {reports.length > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              {reports.length}
            </span>
          )}
        </h3>

        {reports.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada laporan</p>
            <p className="text-xs text-slate-500 mt-1">
              Laporan yang kamu kirim akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const cat = CATEGORIES.find((c) => c.id === report.category);
              const status = STATUS_INFO[report.status];
              return (
                <div
                  key={report.id}
                  className="flex items-start gap-3 p-4 border border-slate-200/80 rounded-xl bg-slate-50/40"
                >
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {cat && (
                        <span
                          className={`px-2 py-0.5 rounded-full border text-xs ${cat.tone}`}
                        >
                          {cat.shortLabel}
                        </span>
                      )}
                      {report.courseCode && (
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {report.courseCode}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {report.description}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {new Date(report.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
