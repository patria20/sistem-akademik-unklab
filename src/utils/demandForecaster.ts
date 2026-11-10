import type { Course, CourseClass, StudyPlan, DemandAnalysisItem } from '../types/academic';

/**
 * Calculates academic class demand projection using deterministic formula:
 * Classes Needed = CEIL(Student Demand / Class Capacity)
 */
export function calculateCourseDemand(
  courses: Course[],
  classes: CourseClass[],
  allStudyPlans: StudyPlan[],
  defaultClassCapacity: number = 40
): DemandAnalysisItem[] {
  return courses.map((course) => {
    let draftCount = 0;
    let submittedCount = 0;
    let approvedCount = 0;

    allStudyPlans.forEach((plan) => {
      const hasCourse = plan.items.some((item) => item.courseId === course.id);
      if (hasCourse) {
        if (plan.status === 'draft') draftCount++;
        else if (plan.status === 'submitted') submittedCount++;
        else if (plan.status === 'approved') approvedCount++;
      }
    });

    const totalDemand = draftCount + submittedCount + approvedCount;
    const existingClassesList = classes.filter((c) => c.courseId === course.id);
    const existingClasses = existingClassesList.length;

    const totalCapacity = existingClassesList.reduce(
      (sum, c) => sum + (c.capacity || defaultClassCapacity),
      0
    );

    // Official PRD Formula
    const classesNeeded = totalDemand > 0 ? Math.ceil(totalDemand / defaultClassCapacity) : existingClasses;
    const shortage = Math.max(0, totalDemand - totalCapacity);

    let status: 'Aman' | 'Peringatan' | 'Kritis' = 'Aman';
    if (shortage > 0) {
      status = shortage > defaultClassCapacity / 2 ? 'Kritis' : 'Peringatan';
    } else if (totalDemand > totalCapacity * 0.85) {
      status = 'Peringatan';
    }

    return {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      credits: course.credits,
      draftDemand: draftCount,
      submittedDemand: submittedCount,
      approvedDemand: approvedCount,
      totalDemand,
      existingClasses,
      totalCapacity,
      classesNeeded,
      shortage,
      status,
    };
  });
}
