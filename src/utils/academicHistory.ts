import type { GradeRecord } from '../types/academic';
import { GRADE_POINTS_SCALE, PASSING_GRADES, calculateSemesterGPA } from './gpaCalculator';

export interface HistoryRow {
  record: GradeRecord;
  /** false jika mata kuliah ini diulang dan percobaan lain yang dipakai untuk IPK dan SKS lulus. */
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

const isGraded = (r: GradeRecord) => r.letterGrade !== 'IP' && r.letterGrade in GRADE_POINTS_SCALE;

/**
 * ATURAN PENGULANGAN MATA KULIAH (keputusan: nilai terbaik):
 * jika satu mata kuliah diambil lebih dari sekali, hanya NILAI TERBAIK yang dipakai untuk IPK
 * dan SKS lulus. Jika nilainya sama, dipakai percobaan yang paling baru.
 * Semua percobaan tetap ditampilkan di semester pengambilannya masing-masing.
 * Untuk memakai aturan "nilai terakhir", ubah urutan sort di bawah menjadi tahun akademik
 * dan semester terbaru lebih dulu.
 *
 * Mengembalikan kumpulan id nilai yang dihitung.
 */
export function pickCountedAttempts(records: GradeRecord[]): Set<string> {
  const byCourse = new Map<string, GradeRecord[]>();
  for (const r of records) {
    byCourse.set(r.courseId, [...(byCourse.get(r.courseId) ?? []), r]);
  }

  const counted = new Set<string>();
  for (const attempts of byCourse.values()) {
    const [best] = [...attempts].sort((a, b) => {
      if (isGraded(a) !== isGraded(b)) return isGraded(a) ? -1 : 1;
      const byPoint = (GRADE_POINTS_SCALE[b.letterGrade] ?? 0) - (GRADE_POINTS_SCALE[a.letterGrade] ?? 0);
      if (byPoint !== 0) return byPoint;
      const byYear = b.academicYear.localeCompare(a.academicYear);
      return byYear !== 0 ? byYear : b.semester - a.semester;
    });
    counted.add(best.id);
  }
  return counted;
}

/**
 * Menyusun riwayat akademik dari nilai SATU mahasiswa.
 * - Hanya semester sebelum `currentSemester`.
 * - Dikelompokkan per (tahun akademik + semester), sehingga semester dengan nomor sama
 *   pada tahun akademik berbeda tidak tercampur.
 */
export function buildAcademicHistory(grades: GradeRecord[], currentSemester: number): AcademicHistory {
  const previous = grades.filter((g) => g.semester < currentSemester);
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
      credits: records.reduce((sum, r) => sum + r.credits, 0),
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
