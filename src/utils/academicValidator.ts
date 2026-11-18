import type { Course, CourseClass, ValidationResult } from '../types/academic';
import { calculateCumulativeGpa, calculateMaxCreditLimit } from './gpaCalculator';

// Re-export agar komponen yang sudah menggunakan import dari academicValidator tetap kompatibel.
export { calculateCumulativeGpa, calculateMaxCreditLimit };

export function calculateTotalCredits(items: { credits: number }[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.credits) ? item.credits : 0), 0);
}

export function checkPrerequisite(
  course: Course,
  passedCourseIds: string[],
  allCourses: Course[]
): { satisfied: boolean; missing: string[] } {
  const prerequisites = course.prerequisites ?? [];
  const missingIds = prerequisites.filter((requiredId) => !passedCourseIds.includes(requiredId));
  const missing = missingIds.map((id) => {
    const requiredCourse = allCourses.find((item) => item.id === id);
    return requiredCourse ? `${requiredCourse.code} - ${requiredCourse.name}` : id;
  });

  return { satisfied: missing.length === 0, missing };
}

function timeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function isOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false;
  if (aStart >= aEnd || bStart >= bEnd) return false;

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export function validateScheduleConflict(classes: CourseClass[]): {
  hasConflict: boolean;
  conflicts: { course1: string; course2: string; time: string }[];
} {
  const conflicts: { course1: string; course2: string; time: string }[] = [];

  for (let i = 0; i < classes.length; i += 1) {
    for (let j = i + 1; j < classes.length; j += 1) {
      const first = classes[i];
      const second = classes[j];

      if (first.day === second.day && isOverlapping(
        first.startTime,
        first.endTime,
        second.startTime,
        second.endTime
      )) {
        conflicts.push({
          course1: `${first.courseCode} (${first.section})`,
          course2: `${second.courseCode} (${second.section})`,
          time: `${first.day}, ${first.startTime}-${first.endTime} vs ${second.startTime}-${second.endTime}`,
        });
      }
    }
  }

  return { hasConflict: conflicts.length > 0, conflicts };
}

export function validateCreditLimit(
  totalCredits: number,
  maxCreditLimit: number
): { valid: boolean; current: number; max: number; excess: number } {
  const max = Math.max(0, maxCreditLimit);
  return {
    valid: totalCredits <= max,
    current: totalCredits,
    max,
    excess: Math.max(0, totalCredits - max),
  };
}

export function validateClassCapacity(courseClass: CourseClass): {
  isFull: boolean;
  remainingSeats: number;
} {
  const remainingSeats = Math.max(0, courseClass.capacity - courseClass.enrolled);
  return { isFull: remainingSeats === 0, remainingSeats };
}

export function checkRepeatedCourse(courseId: string, passedCourseIds: string[]): boolean {
  return passedCourseIds.includes(courseId);
}

export function validateStudyPlan(
  selectedClasses: CourseClass[],
  allCourses: Course[],
  passedCourseIds: string[],
  maxCreditLimit: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const prerequisiteIssues: ValidationResult['prerequisiteIssues'] = [];
  const totalCredits = calculateTotalCredits(selectedClasses);
  const creditCheck = validateCreditLimit(totalCredits, maxCreditLimit);
  let creditIssue: ValidationResult['creditIssue'];

  if (!creditCheck.valid) {
    errors.push(
      `Total SKS (${totalCredits} SKS) melebihi batas maksimum Anda (${maxCreditLimit} SKS). Harap kurangi ${creditCheck.excess} SKS.`
    );
    creditIssue = {
      current: totalCredits,
      max: maxCreditLimit,
      excess: creditCheck.excess,
    };
  }

  const selectedCourseIds = new Set<string>();
  selectedClasses.forEach((selectedClass) => {
    if (selectedCourseIds.has(selectedClass.courseId)) {
      errors.push(`Mata kuliah ${selectedClass.courseCode} dipilih lebih dari satu kali. Pilih hanya satu Paralel.`);
    }
    selectedCourseIds.add(selectedClass.courseId);

    const course = allCourses.find((item) => item.id === selectedClass.courseId);
    if (!course) {
      errors.push(`Data mata kuliah ${selectedClass.courseCode} tidak ditemukan dalam katalog.`);
      return;
    }

    const prerequisiteCheck = checkPrerequisite(course, passedCourseIds, allCourses);
    if (!prerequisiteCheck.satisfied) {
      errors.push(
        `Prasyarat belum terpenuhi untuk ${course.code} (${course.name}). Prasyarat yang dibutuhkan: ${prerequisiteCheck.missing.join(', ')}.`
      );
      prerequisiteIssues.push({
        course: `${course.code} - ${course.name}`,
        missingPrerequisites: prerequisiteCheck.missing,
      });
    }

    if (checkRepeatedCourse(selectedClass.courseId, passedCourseIds)) {
      errors.push(`Mata kuliah ${selectedClass.courseCode} (${selectedClass.courseName}) sudah pernah Anda lulusi dan tidak dapat diambil kembali.`);
    }
  });

  selectedClasses.forEach((selectedClass) => {
    const capacityCheck = validateClassCapacity(selectedClass);
    if (capacityCheck.isFull) {
      errors.push(
        `Kelas ${selectedClass.courseCode} Paralel ${selectedClass.section} sudah penuh (${selectedClass.enrolled}/${selectedClass.capacity} mahasiswa).`
      );
    } else if (capacityCheck.remainingSeats <= 3) {
      warnings.push(
        `Kelas ${selectedClass.courseCode} Paralel ${selectedClass.section} hampir penuh (sisa ${capacityCheck.remainingSeats} kursi).`
      );
    }

    const start = timeToMinutes(selectedClass.startTime);
    const end = timeToMinutes(selectedClass.endTime);
    if (start === null || end === null || start >= end) {
      errors.push(`Jadwal kelas ${selectedClass.courseCode} Paralel ${selectedClass.section} tidak valid.`);
    }
  });

  const conflictCheck = validateScheduleConflict(selectedClasses);
  conflictCheck.conflicts.forEach((conflict) => {
    errors.push(`Jadwal bentrok pada ${conflict.time} antara ${conflict.course1} dan ${conflict.course2}.`);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    conflicts: conflictCheck.conflicts,
    prerequisiteIssues,
    creditIssue,
  };
}
