import type { GradeRecord } from '../types/academic';
import {
  PASSING_GRADES,
  calculateSemesterGPA,
  isOfficialGrade,
  getLatestOfficialAttempts,
} from './gpaCalculator';

export interface HistoryRow {
  record: GradeRecord;
  /** false jika mata kuliah ini diulang dan percobaan terbaru yang dipakai untuk IPK dan SKS lulus, atau belum diverifikasi. */
  countedInCumulative: boolean;
}

export interface SemesterGroup {
  key: string;
  semester: number;
  academicYear: string;
  rows: HistoryRow[];
  credits: number;
  gpa: number;
}

export interface AcademicHistory {
  groups: SemesterGroup[];
  /** Jumlah mata kuliah unik (mata kuliah yang diulang dihitung satu kali). */
  courseCount: number;
  passedCredits: number;
  cumulativeGpa: number;
}

/**
 * ATURAN PENGULANGAN MATA KULIAH (keputusan: nilai terbaru / latest attempt):
 * Jika satu mata kuliah diambil lebih dari sekali, HANYA PERCOBAAN TERBARU yang dipakai untuk
 * IPK kumulatif dan SKS lulus (berdasarkan tahun akademik dan semester pengambilan).
 * Jika nilai terbaru lebih rendah daripada nilai sebelumnya, tetap gunakan nilai terbaru.
 * Semua percobaan tetap ditampilkan di semester pengambilannya masing-masing.
 * Nilai mandiri yang belum disetujui (pending/rejected) tidak boleh menggantikan nilai resmi yang sudah ada.
 *
 * Mengembalikan kumpulan id nilai resmi terbaru yang dihitung.
 */
export function pickCountedAttempts(records: GradeRecord[]): Set<string> {
  const latestRecords = getLatestOfficialAttempts(records);
  return new Set(latestRecords.map((r) => r.id));
}

/**
 * Menyusun riwayat akademik dari nilai SATU mahasiswa.
 * - Mencakup semester sebelum `currentSemester` serta seluruh nilai input mandiri mahasiswa.
 * - Dikelompokkan per (tahun akademik + semester), sehingga semester dengan nomor sama
 *   pada tahun akademik berbeda tidak tercampur.
 */
export function buildAcademicHistory(grades: GradeRecord[], currentSemester: number): AcademicHistory {
  const previous = grades.filter((g) => g.semester < currentSemester || g.inputSource === 'student');
  const counted = pickCountedAttempts(previous);

  const byKey = new Map<string, GradeRecord[]>();
  for (const g of previous) {
    const key = `${g.academicYear}|${g.semester}`;
    byKey.set(key, [...(byKey.get(key) ?? []), g]);
  }

  const groups: SemesterGroup[] = [...byKey.entries()]
    .map(([key, records]) => ({
      key,
      semester: records[0].semester,
      academicYear: records[0].academicYear,
      rows: records.map((record) => ({ record, countedInCumulative: counted.has(record.id) })),
      credits: records.filter(isOfficialGrade).reduce((sum, r) => sum + r.credits, 0),
      gpa: calculateSemesterGPA(records),
    }))
    .sort((a, b) => a.academicYear.localeCompare(b.academicYear) || a.semester - b.semester);

  const countedRecords = previous.filter((r) => counted.has(r.id));

  return {
    groups,
    courseCount: countedRecords.length,
    passedCredits: countedRecords
      .filter((r) => PASSING_GRADES.includes(r.letterGrade))
      .reduce((sum, r) => sum + r.credits, 0),
    cumulativeGpa: calculateSemesterGPA(countedRecords),
  };
}
