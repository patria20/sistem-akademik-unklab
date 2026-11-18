
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

/** Menghitung IPS dari kumpulan nilai satu semester. */
export function calculateSemesterGPA(records: GradeRecord[]): number {
  const gradedRecords = records.filter(
    (record) =>
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

/** Menghitung IPK dari seluruh nilai yang memiliki huruf mutu. */
export function calculateCumulativeGPA(
  records: GradeRecord[]
): number | null {
  const gradedRecords = records.filter(
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

/** Menghitung ringkasan progres kurikulum. */
export function calculateAcademicProgress(
  allRecords: GradeRecord[],
  currentEnrolledCredits = 0,
  graduationTarget = DEFAULT_GRADUATION_TARGET
) {
  const target =
    Number.isFinite(graduationTarget) && graduationTarget > 0
      ? graduationTarget
      : DEFAULT_GRADUATION_TARGET;

  // Simpan satu nilai lulus untuk setiap mata kuliah.
  const passedByCourse = new Map<string, GradeRecord>();

  allRecords.forEach((record) => {
    if (
      record.isPassed &&
      PASSING_GRADES.includes(record.letterGrade) &&
      record.credits > 0 &&
      !passedByCourse.has(record.courseId)
    ) {
      passedByCourse.set(record.courseId, record);
    }
  });

  const creditsEarned = Array.from(passedByCourse.values()).reduce(
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
