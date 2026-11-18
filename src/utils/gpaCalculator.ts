
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

export const PASSING_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];

export const DEFAULT_GRADUATION_TARGET = 151;

/**
 * Calculates Quality Points (Bobot Nilai * SKS)
 */
export function calculateQualityPoints(
  letterGrade: string,
  credits: number
): number {
  if (
    letterGrade === 'IP' ||
    !(letterGrade in GRADE_POINTS_SCALE) ||
    !Number.isFinite(credits) ||
    credits <= 0
  ) {
    return 0;
  }

  return GRADE_POINTS_SCALE[letterGrade] * credits;
}

/**
 * Calculates Semester GPA (IPS)
 */
export function calculateSemesterGPA(records: GradeRecord[]): number {
  const completedRecords = records.filter(
    (r) =>
      r.letterGrade !== 'IP' &&
      r.letterGrade in GRADE_POINTS_SCALE &&
      r.credits > 0
  );

  if (completedRecords.length === 0) return 0;

  const totalQualityPoints = completedRecords.reduce(
    (sum, r) =>
      sum + calculateQualityPoints(r.letterGrade, r.credits),
    0
  );

  const totalCredits = completedRecords.reduce(
    (sum, r) => sum + r.credits,
    0
  );

  return totalCredits > 0
    ? Number((totalQualityPoints / totalCredits).toFixed(2))
    : 0;
}

/**
 * Calculates Cumulative GPA (IPK)
 */
export function calculateCumulativeGPA(
  allRecords: GradeRecord[]
): number {
  return calculateSemesterGPA(allRecords);
}

/**
 * Computes authorized SKS limit based on cumulative GPA (IPK)
 */
export function calculateMaxCreditLimit(cumulativeGpa: number): number {
  return cumulativeGpa >= 3.35 ? 23 : 20;
}

/**
 * Calculates academic progress summary
 * Total graduation requirement: 151 SKS
 */
export function calculateAcademicProgress(
  allRecords: GradeRecord[],
  currentEnrolledCredits: number = 0,
  graduationTarget: number = DEFAULT_GRADUATION_TARGET
) {
  const passedRecords = allRecords.filter(
    (r) =>
      r.isPassed &&
      PASSING_GRADES.includes(r.letterGrade) &&
      r.credits > 0
  );

  // Prevent the same course from being counted more than once.
  const uniquePassedCourses = new Map<string, GradeRecord>();

  passedRecords.forEach((record) => {
    if (!uniquePassedCourses.has(record.courseId)) {
      uniquePassedCourses.set(record.courseId, record);
    }
  });

  const creditsEarned = Array.from(uniquePassedCourses.values()).reduce(
    (sum, record) => sum + record.credits,
    0
  );

  const validCurrentCredits = Math.max(0, currentEnrolledCredits);

  const creditsRemaining = Math.max(
    0,
    graduationTarget - creditsEarned - validCurrentCredits
  );

  const completionPercentage =
    graduationTarget > 0
      ? Number(((creditsEarned / graduationTarget) * 100).toFixed(1))
      : 0;

  return {
    graduationTarget,
    creditsEarned,
    creditsCurrent: validCurrentCredits,
    creditsRemaining,
    completionPercentage: Math.min(100, completionPercentage),
    cumulativeGpa: calculateCumulativeGPA(allRecords),
  };
}
