import type { Course, CourseClass, ValidationResult } from '../types/academic';

/**
 * Calculates total credits for an array of courses or items
 */
export function calculateTotalCredits(items: { credits: number }[]): number {
  return items.reduce((sum, item) => sum + (item.credits || 0), 0);
}

/**
 * Validates whether all prerequisites for a given course are satisfied.
 * Uses exact Course IDs matching passed courses.
 */
export function checkPrerequisite(
  course: Course,
  passedCourseIds: string[],
  allCourses: Course[]
): { satisfied: boolean; missing: string[] } {
  if (!course.prerequisites || course.prerequisites.length === 0) {
    return { satisfied: true, missing: [] };
  }

  const missingIds = course.prerequisites.filter((reqId) => !passedCourseIds.includes(reqId));
  const missingNames = missingIds.map((id) => {
    const c = allCourses.find((item) => item.id === id);
    return c ? `${c.code} - ${c.name}` : id;
  });

  return {
    satisfied: missingIds.length === 0,
    missing: missingNames,
  };
}

/**
 * Converts "HH:mm" time string into minutes from midnight for collision calculation
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Checks if two schedule time slots on the same day overlap
 */
function isOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Deterministically checks for schedule collisions between classes on the same day.
 */
export function validateScheduleConflict(classes: CourseClass[]): {
  hasConflict: boolean;
  conflicts: { course1: string; course2: string; time: string }[];
} {
  const conflicts: { course1: string; course2: string; time: string }[] = [];

  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      const cls1 = classes[i];
      const cls2 = classes[j];

      if (cls1.day === cls2.day) {
        if (isOverlapping(cls1.startTime, cls1.endTime, cls2.startTime, cls2.endTime)) {
          conflicts.push({
            course1: `${cls1.courseCode} (${cls1.section})`,
            course2: `${cls2.courseCode} (${cls2.section})`,
            time: `${cls1.day}, ${cls1.startTime}-${cls1.endTime} vs ${cls2.startTime}-${cls2.endTime}`,
          });
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Validates if total selected credits exceed the student's authorized credit ceiling.
 */
export function validateCreditLimit(
  totalCredits: number,
  maxCreditLimit: number
): { valid: boolean; current: number; max: number; excess: number } {
  return {
    valid: totalCredits <= maxCreditLimit,
    current: totalCredits,
    max: maxCreditLimit,
    excess: Math.max(0, totalCredits - maxCreditLimit),
  };
}

/**
 * Validates class capacity
 */
export function validateClassCapacity(courseClass: CourseClass): {
  isFull: boolean;
  remainingSeats: number;
} {
  const remaining = courseClass.capacity - courseClass.enrolled;
  return {
    isFull: remaining <= 0,
    remainingSeats: Math.max(0, remaining),
  };
}

/**
 * Checks if a course is a repetition
 */
export function checkRepeatedCourse(
  courseId: string,
  passedCourseIds: string[]
): boolean {
  return passedCourseIds.includes(courseId);
}

/**
 * Master Validation Engine evaluating an entire study plan
 */
export function validateStudyPlan(
  selectedClasses: CourseClass[],
  allCourses: Course[],
  passedCourseIds: string[],
  maxCreditLimit: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Credit Limit
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

  // 2. Schedule Conflicts
  const conflictCheck = validateScheduleConflict(selectedClasses);
  if (conflictCheck.hasConflict) {
    conflictCheck.conflicts.forEach((c) => {
      errors.push(
        `Jadwal bentrok pada ${c.time} antara ${c.course1} dan ${c.course2}.`
      );
    });
  }

  // 3. Prerequisites
  const prerequisiteIssues: ValidationResult['prerequisiteIssues'] = [];
  selectedClasses.forEach((cls) => {
    const courseObj = allCourses.find((c) => c.id === cls.courseId);
    if (courseObj) {
      const prereqCheck = checkPrerequisite(courseObj, passedCourseIds, allCourses);
      if (!prereqCheck.satisfied) {
        errors.push(
          `Prasyarat belum terpenuhi untuk ${courseObj.code} (${courseObj.name}). Prasyarat yang dibutuhkan: ${prereqCheck.missing.join(', ')}.`
        );
        prerequisiteIssues.push({
          course: `${courseObj.code} - ${courseObj.name}`,
          missingPrerequisites: prereqCheck.missing,
        });
      }
    }
  });

  // 4. Class Capacity
  selectedClasses.forEach((cls) => {
    const capCheck = validateClassCapacity(cls);
    if (capCheck.isFull) {
      errors.push(
        `Kelas ${cls.courseCode} Seksi ${cls.section} sudah PENUH (${cls.enrolled}/${cls.capacity} mahasiswa).`
      );
    } else if (capCheck.remainingSeats <= 3) {
      warnings.push(
        `Kelas ${cls.courseCode} Seksi ${cls.section} hampir penuh (sisa ${capCheck.remainingSeats} kursi).`
      );
    }
  });

  // 5. Repeated course warning
  selectedClasses.forEach((cls) => {
    if (checkRepeatedCourse(cls.courseId, passedCourseIds)) {
      warnings.push(
        `Mata kuliah ${cls.courseCode} (${cls.courseName}) sudah pernah Anda lulusi sebelumnya. Mengambil kembali akan dihitung sebagai perbaikan nilai.`
      );
    }
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
