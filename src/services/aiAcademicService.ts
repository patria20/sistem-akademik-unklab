
import type {
  StudentProfile,
  Course,
  GradeRecord,
} from "../types/academic";

import {
  calculateAcademicProgress,
  calculateCumulativeGPA,
  calculateMaxCreditLimit,
} from "../utils/gpaCalculator";

export interface AIMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: string[];
  disclaimer?: string;
}

export class AIAcademicService {
  static async queryAssistant(
    userPrompt: string,
    student: StudentProfile,
    allCourses: Course[],
    grades: GradeRecord[],
    currentEnrolledCredits: number
  ): Promise<AIMessage> {
    const sortedGrades = [...grades].sort((a, b) => {
      const yearA = Number(a.academicYear.split("/")[0]);
      const yearB = Number(b.academicYear.split("/")[0]);

      if (yearA !== yearB) return yearA - yearB;

      return a.semester - b.semester;
    });

    // Semua metrik akademik dihitung dari data nilai resmi.
    const progress = calculateAcademicProgress(
      grades,
      currentEnrolledCredits,
      151
    );

    const cumulativeGpa = calculateCumulativeGPA(grades);

    const maxCreditLimit = calculateMaxCreditLimit(
      cumulativeGpa ?? 0
    );

    const academicContext = {
      student: {
        name: student.name,
        programStudy: student.programStudy,
        currentSemester: student.currentSemester,
        academicYear: student.academicYear,

        // Gunakan hasil perhitungan sistem, bukan angka profil lama.
        cumulativeGpa,
        creditsEarned: progress.creditsEarned,
        creditsCurrent: progress.creditsCurrent,
        creditsRemaining: progress.creditsRemaining,
        graduationTarget: progress.graduationTarget,
        maxCreditLimit,
        krsStatus: student.krsStatus,
      },

      courses: allCourses.map((course) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        semester: course.semester,
        curriculumYear: course.curriculumYear,
        prerequisites: course.prerequisites,
        category: course.category,
        isMandatory: course.isMandatory,
      })),

      grades: sortedGrades.map((grade) => ({
        courseId: grade.courseId,
        courseCode: grade.courseCode,
        courseName: grade.courseName,
        credits: grade.credits,
        letterGrade: grade.letterGrade,
        gradePoint: grade.gradePoint,
        isPassed: grade.isPassed,
        semester: grade.semester,
        academicYear: grade.academicYear,
        verificationStatus: grade.verificationStatus,
        inputSource: grade.inputSource,
      })),
    };

    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
        academicContext,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Gagal menghubungi Gemini.");
    }

    return {
      id: `msg_${Date.now()}`,
      sender: "assistant",
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sources: ["Google Gemini AI"],
      disclaimer:
        "Jawaban AI merupakan bantuan konsultatif. Validasi dan keputusan akademik tetap mengikuti aturan resmi UNKLAB.",
    };
  }
}
