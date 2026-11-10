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

/**
 * Calculates Quality Points (Bobot Nilai * SKS)
 */
export function calculateQualityPoints(letterGrade: string, credits: number): number {
  if (letterGrade === 'IP' || !(letterGrade in GRADE_POINTS_SCALE)) {
    return 0;
  }
  return GRADE_POINTS_SCALE[letterGrade] * credits;
}

/**
 * Calculates Semester GPA (IPS)
 */
export function calculateSemesterGPA(records: GradeRecord[]): number {
  const completedRecords = records.filter(
    (r) => r.letterGrade !== 'IP' && r.letterGrade in GRADE_POINTS_SCALE
  );

  if (completedRecords.length === 0) return 0.0;

  const totalQualityPoints = completedRecords.reduce(
    (sum, r) => sum + calculateQualityPoints(r.letterGrade, r.credits),
    0
  );

  const totalCredits = completedRecords.reduce((sum, r) => sum + r.credits, 0);

  return totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.0;
}

/**
 * Calculates Cumulative GPA (IPK)
 */
export function calculateCumulativeGPA(allRecords: GradeRecord[]): number {
  return calculateSemesterGPA(allRecords);
}

/**
 * Computes authorized SKS limit based on IPS
 */
export function calculateMaxCreditLimit(lastSemesterGpa: number): number {
  if (lastSemesterGpa >= 3.0) return 24;
  if (lastSemesterGpa >= 2.5) return 21;
  if (lastSemesterGpa >= 2.0) return 18;
  return 15;
}

/**
 * Calculates academic progress summary
 * Total graduation requirement: 144 SKS
 */
export function calculateAcademicProgress(
  allRecords: GradeRecord[],
  currentEnrolledCredits: number = 0,
  graduationTarget: number = 144
) {
  const passedRecords = allRecords.filter(
    (r) => PASSING_GRADES.includes(r.letterGrade)
  );

  const creditsEarned = passedRecords.reduce((sum, r) => sum + r.credits, 0);
  const creditsRemaining = Math.max(0, graduationTarget - creditsEarned - currentEnrolledCredits);
  const completionPercentage = Number(((creditsEarned / graduationTarget) * 100).toFixed(1));

  return {
    graduationTarget,
    creditsEarned,
    creditsCurrent: currentEnrolledCredits,
    creditsRemaining,
    completionPercentage: Math.min(100, completionPercentage),
    cumulativeGpa: calculateCumulativeGPA(allRecords),
  };
}
