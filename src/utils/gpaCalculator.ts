
import type { GradeRecord } from '../types/academic';

export const GRADE_POINTS_SCALE: Record<string, number> = {
  A: 4.0,
  'A-': 3.75,
  'B+': 3.5,
  B: 3.0,
  'B-': 2.75,
  'C+': 2.5,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

// Nilai C atau lebih tinggi dihitung lulus.
export const PASSING_GRADES: string[] = [
  'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C',
];

export const DEFAULT_GRADUATION_TARGET = 151;

/**
 * Memeriksa apakah nilai merupakan nilai resmi yang diakui dalam perhitungan akademik.
 * Nilai lama tanpa verificationStatus atau nilai dosen dianggap resmi (kompatibel).
 * Nilai mandiri yang berstatus 'pending' atau 'rejected' TIDAK masuk perhitungan akademik resmi.
 */
export function isOfficialGrade(record: GradeRecord): boolean {
  if (record.verificationStatus === 'pending' || record.verificationStatus === 'rejected') {
    return false;
  }
  return true;
}

/** Menghitung bobot nilai dikalikan SKS. */
export function calculateQualityPoints(
  letterGrade: string,
  credits: number
): number {
  const gradePoint = GRADE_POINTS_SCALE[letterGrade];

  if (
    gradePoint === undefined ||
    !Number.isFinite(credits) ||
    credits <= 0
  ) {
    return 0;
  }

  return gradePoint * credits;
}

/**
 * Menghitung urutan kronologis periode akademik (tahun akademik & semester).
 * Format tahun ajaran contoh: '2024/2025 Ganjil', '2024/2025 Genap'.
 * Angka yang lebih besar menunjukkan periode yang lebih baru (latest attempt).
 */
export function getPeriodOrder(academicYear: string, semester: number): number {
  const match = (academicYear || '').match(/(\d{4})/);
  const startYear = match ? parseInt(match[1], 10) : 2020;
  const isGenap = (academicYear || '').toLowerCase().includes('genap') ? 1 : 0;
  return startYear * 1000 + isGenap * 100 + (semester || 0);
}

/**
 * Membandingkan dua percobaan nilai berdasarkan periode terbaru.
 * Mengembalikan nilai negatif jika b lebih baru daripada a (untuk sort descending).
 */
export function compareAttemptsByLatest(a: GradeRecord, b: GradeRecord): number {
  const orderB = getPeriodOrder(b.academicYear, b.semester);
  const orderA = getPeriodOrder(a.academicYear, a.semester);
  if (orderB !== orderA) {
    return orderB - orderA;
  }
  const byUpdated = (b.updatedAt || '').localeCompare(a.updatedAt || '');
  if (byUpdated !== 0) return byUpdated;
  return b.id.localeCompare(a.id);
}

/**
 * Mengelompokkan riwayat nilai dan mengambil HANYA percobaan resmi terbaru (latest attempt)
 * untuk setiap mata kuliah.
 * - Nilai pending / rejected tidak pernah diakui sebagai percobaan resmi.
 * - Nilai lama tanpa verificationStatus tetap diakui sebagai resmi.
 * - Jika mata kuliah diulang, hanya nilai pada periode terbaru yang diambil,
 *   meskipun nilai terbaru tersebut lebih rendah atau tidak lulus.
 */
export function getLatestOfficialAttempts(records: GradeRecord[]): GradeRecord[] {
  const officialRecords = records.filter(isOfficialGrade);
  const byCourse = new Map<string, GradeRecord[]>();

  for (const r of officialRecords) {
    const key = (r.courseCode || r.courseId).trim().toUpperCase();
    byCourse.set(key, [...(byCourse.get(key) ?? []), r]);
  }

  const latestRecords: GradeRecord[] = [];
  for (const attempts of byCourse.values()) {
    const [latest] = [...attempts].sort((a, b) => {
      // Prioritaskan nilai yang sudah keluar huruf mutu daripada 'IP' (sedang berjalan)
      const aGraded = a.letterGrade !== 'IP' && a.letterGrade in GRADE_POINTS_SCALE;
      const bGraded = b.letterGrade !== 'IP' && b.letterGrade in GRADE_POINTS_SCALE;
      if (aGraded !== bGraded) return aGraded ? -1 : 1;

      return compareAttemptsByLatest(a, b);
    });

    if (latest) {
      latestRecords.push(latest);
    }
  }

  return latestRecords;
}

/** Menghitung IPS dari kumpulan nilai satu semester (hanya nilai resmi/disetujui). */
export function calculateSemesterGPA(records: GradeRecord[]): number {
  const gradedRecords = records.filter(
    (record) =>
      isOfficialGrade(record) &&
      record.letterGrade !== 'IP' &&
      record.letterGrade in GRADE_POINTS_SCALE &&
      record.credits > 0
  );

  const totalCredits = gradedRecords.reduce(
    (sum, record) => sum + record.credits,
    0
  );

  if (totalCredits === 0) return 0;

  const totalQualityPoints = gradedRecords.reduce(
    (sum, record) =>
      sum + calculateQualityPoints(record.letterGrade, record.credits),
    0
  );

  return Number((totalQualityPoints / totalCredits).toFixed(2));
}

/**
 * Menghitung IPK kumulatif menggunakan aturan NILAI TERBARU (latest attempt).
 * Jika suatu mata kuliah diambil lebih dari sekali, hanya percobaan terbaru
 * yang masuk ke dalam perhitungan IPK.
 */
export function calculateCumulativeGPA(
  records: GradeRecord[]
): number | null {
  const latestRecords = getLatestOfficialAttempts(records);
  const gradedRecords = latestRecords.filter(
    (record) =>
      record.letterGrade !== 'IP' &&
      record.letterGrade in GRADE_POINTS_SCALE &&
      record.credits > 0
  );

  const totalCredits = gradedRecords.reduce(
    (sum, record) => sum + record.credits,
    0
  );

  if (totalCredits === 0) return null;

  const totalQualityPoints = gradedRecords.reduce(
    (sum, record) =>
      sum + calculateQualityPoints(record.letterGrade, record.credits),
    0
  );

  return Number((totalQualityPoints / totalCredits).toFixed(2));
}

// Alias untuk kompatibilitas dengan academicValidator.
export const calculateCumulativeGpa = calculateCumulativeGPA;

/**
 * Aturan beban SKS:
 * IPK >= 3,35: maksimal 23 SKS.
 * IPK < 3,35 atau belum tersedia: maksimal 20 SKS.
 */
export function calculateMaxCreditLimit(
  cumulativeGpa: number | null
): number {
  return cumulativeGpa !== null && cumulativeGpa >= 3.35
    ? 23
    : 20;
}

/**
 * Menghitung ringkasan progres kurikulum:
 * - Menggunakan percobaan terbaru (latest attempt) untuk setiap mata kuliah.
 * - SKS Lulus dihitung berdasarkan status kelulusan dari percobaan terbaru.
 */
export function calculateAcademicProgress(
  allRecords: GradeRecord[],
  currentEnrolledCredits = 0,
  graduationTarget = DEFAULT_GRADUATION_TARGET
) {
  const target =
    Number.isFinite(graduationTarget) && graduationTarget > 0
      ? graduationTarget
      : DEFAULT_GRADUATION_TARGET;

  // Mengambil HANYA percobaan resmi terbaru untuk setiap mata kuliah
  const latestRecords = getLatestOfficialAttempts(allRecords);

  // SKS lulus hanya diakui jika percobaan TERBARU dinyatakan lulus (C ke atas)
  const passedLatestRecords = latestRecords.filter(
    (record) =>
      record.isPassed &&
      PASSING_GRADES.includes(record.letterGrade) &&
      record.credits > 0
  );

  const creditsEarned = passedLatestRecords.reduce(
    (sum, record) => sum + record.credits,
    0
  );

  const creditsCurrent = Math.max(
    0,
    Number.isFinite(currentEnrolledCredits)
      ? currentEnrolledCredits
      : 0
  );

  const creditsRemaining = Math.max(
    0,
    target - creditsEarned - creditsCurrent
  );

  const completionPercentage = Math.min(
    100,
    Number(
      (((creditsEarned + creditsCurrent) / target) * 100).toFixed(1)
    )
  );

  return {
    graduationTarget: target,
    creditsEarned,
    creditsCurrent,
    creditsRemaining,
    completionPercentage,
    cumulativeGpa: calculateCumulativeGPA(allRecords),
  };
}
