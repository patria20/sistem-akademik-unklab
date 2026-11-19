
// Penyimpanan laporan masalah akademik mahasiswa (localStorage, tanpa backend).
// Dibuat terpisah dari academicService.ts supaya tidak bentrok dengan pekerjaan anggota lain.

export type IssueCategory = 'presensi' | 'krs' | 'nilai';
export type IssueStatus = 'submitted' | 'in_review' | 'resolved';

export interface IssueReport {
  id: string;
  studentId: string;
  category: IssueCategory;
  courseCode: string | null;
  description: string;
  status: IssueStatus;
  createdAt: string;
}

export type NewIssueReport = Pick<
  IssueReport,
  'studentId' | 'category' | 'courseCode' | 'description'
>;

const STORAGE_KEY = 'siam_unklab_issue_reports';

function readAll(): IssueReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IssueReport[]) : [];
  } catch {
    return [];
  }
}

export const ReportService = {
  getByStudentId(studentId: string): IssueReport[] {
    return readAll()
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  // Mengambil seluruh laporan untuk ditampilkan kepada dosen PA.
  getAll(): IssueReport[] {
    return readAll().sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  // Memperbarui status laporan.
  updateStatus(id: string, status: IssueStatus): void {
    const reports = readAll().map((report) =>
      report.id === id ? { ...report, status } : report
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  },

  create(data: NewIssueReport): IssueReport {
    const report: IssueReport = {
      ...data,
      id: `rpt_${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([report, ...readAll()])
    );

    return report;
  },
};
