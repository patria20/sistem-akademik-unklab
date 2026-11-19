
import type {
  StudentProfile,
  LecturerProfile,
  Course,
  CourseClass,
  StudyPlan,
  StudyPlanItem,
  AttendanceRecord,
  ConsultationSession,
  SystemNotification,
  AuditLog,
  GradeRecord,
  AddDropRequest,
} from '../types/academic';

import {
  MOCK_STUDENTS,
  MOCK_LECTURERS,
  MOCK_COURSES,
  MOCK_CLASSES,
  MOCK_STUDY_PLANS,
  MOCK_ATTENDANCES,
  MOCK_CONSULTATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_INITIAL_GRADES,
} from '../data/mockAcademicData';
import {
  GRADE_POINTS_SCALE,
  PASSING_GRADES,
  isOfficialGrade,
  getLatestOfficialAttempts,
  calculateCumulativeGPA,
} from '../utils/gpaCalculator';

import {
  checkPrerequisite,
  validateScheduleConflict,
  validateCreditLimit,
  validateClassCapacity,
  calculateMaxCreditLimit,
} from '../utils/academicValidator';

export interface ClassGradeInput {
  studentId: string;
  tugas: number;
  uts: number;
  uas: number;
}

export interface StudentGradeInput {
  studentId: string;
  courseId: string;
  semester: number;
  academicYear: string;
  letterGrade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
}

const STORAGE_KEYS = {
  STUDENTS: 'siam_unklab_students',
  CLASSES: 'siam_unklab_classes',
  COURSES: 'siam_unklab_courses',
  STUDY_PLANS: 'siam_unklab_study_plans',
  ADD_DROP_REQUESTS: 'siam_unklab_add_drop_requests',
  ATTENDANCES: 'siam_unklab_attendances',
  CONSULTATIONS: 'siam_unklab_consultations',
  NOTIFICATIONS: 'siam_unklab_notifications',
  AUDIT_LOGS: 'siam_unklab_audit_logs',
  GRADES: 'siam_unklab_grades',
};

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage set failed', err);
  }
}

function validateAddDropAddition(
  plan: StudyPlan,
  candidateClass: CourseClass,
  grades: GradeRecord[],
  allClasses: CourseClass[],
  allCourses: Course[]
): string[] {
  const errors: string[] = [];

  // Mengambil percobaan nilai resmi terbaru setiap mata kuliah
  const latestGrades = getLatestOfficialAttempts(grades);

  const passedCourseIds = latestGrades
    .filter(
      (grade) =>
        grade.isPassed &&
        PASSING_GRADES.includes(grade.letterGrade)
    )
    .map((grade) => grade.courseId);

  // Memastikan mata kuliah belum pernah lulus
  if (passedCourseIds.includes(candidateClass.courseId)) {
    errors.push(
      `${candidateClass.courseCode} sudah dinyatakan lulus berdasarkan nilai terbaru.`
    );
  }

  // Memeriksa prasyarat
  const course = allCourses.find(
    (item) => item.id === candidateClass.courseId
  );

  if (!course) {
    errors.push(
      `Data mata kuliah ${candidateClass.courseCode} tidak ditemukan dalam kurikulum.`
    );
  } else {
    const prerequisiteCheck = checkPrerequisite(
      course,
      passedCourseIds,
      allCourses
    );

    if (!prerequisiteCheck.satisfied) {
      errors.push(
        `Prasyarat ${candidateClass.courseCode} belum terpenuhi: ${prerequisiteCheck.missing.join(', ')}.`
      );
    }
  }

  // Kapasitas hanya diperiksa untuk kelas yang baru ditambahkan
  const capacityCheck = validateClassCapacity(candidateClass);

  if (capacityCheck.isFull) {
    errors.push(
      `Kelas ${candidateClass.courseCode} Paralel ${candidateClass.section} sudah penuh.`
    );
  }

  // Memeriksa batas maksimal SKS
  const maxCreditLimit = calculateMaxCreditLimit(
    calculateCumulativeGPA(grades)
  );

  const proposedCredits =
    plan.totalCredits + candidateClass.credits;

  const creditCheck = validateCreditLimit(
    proposedCredits,
    maxCreditLimit
  );

  if (!creditCheck.valid) {
    errors.push(
      `Total SKS menjadi ${proposedCredits} SKS, melebihi batas maksimal ${maxCreditLimit} SKS.`
    );
  }

  // Memeriksa jadwal seluruh kelas dalam KRS
  const existingClasses = plan.items.map((item) => {
    return allClasses.find(
      (cls) => cls.id === item.classId
    );
  });

  if (existingClasses.some((cls) => !cls)) {
    errors.push(
      'Ada data kelas dalam KRS yang tidak ditemukan.'
    );
  } else {
    const scheduleCheck = validateScheduleConflict([
      ...(existingClasses as CourseClass[]),
      candidateClass,
    ]);

    if (scheduleCheck.hasConflict) {
      scheduleCheck.conflicts.forEach((conflict) => {
        errors.push(
          `Jadwal bentrok antara ${conflict.course1} dan ${conflict.course2} (${conflict.time}).`
        );
      });
    }
  }

  return errors;
}
export class AcademicService {
  // Initialization
  static initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      setStoredItem(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
    }

    // Sinkronisasi identitas mahasiswa demo
const students = this.getStudents();

const updatedStudents = students.map((student) => {
  if (
    student.id === 'std_01' ||
    student.nim === '12410619' ||
    student.userId === 'usr_student_01'
  ) {
    return {
      ...student,
      name: 'Syalom Mauren Angginaloy',
      nim: '12410619',
    };
  }

  return student;
});

setStoredItem(STORAGE_KEYS.STUDENTS, updatedStudents);
        // Migrasi NIM mahasiswa lama ke format NIM baru
    const nimReplacements: Record<string, string> = {
      '105022110001': '12410619',
      '105022110002': '12410002',
      '105022110003': '12410003',
      '105022110004': '12410004',
      '105022110005': '12410005',
    };

    const storageKeys = [
      STORAGE_KEYS.STUDENTS,
      STORAGE_KEYS.CLASSES,
      STORAGE_KEYS.COURSES,
      STORAGE_KEYS.STUDY_PLANS,
      STORAGE_KEYS.ADD_DROP_REQUESTS,
      STORAGE_KEYS.ATTENDANCES,
      STORAGE_KEYS.CONSULTATIONS,
      STORAGE_KEYS.NOTIFICATIONS,
      STORAGE_KEYS.AUDIT_LOGS,
      STORAGE_KEYS.GRADES,
    ];

    storageKeys.forEach((key) => {
      const storedData = localStorage.getItem(key);

      if (!storedData) return;

      let updatedData = storedData;

      Object.entries(nimReplacements).forEach(([oldNim, newNim]) => {
        updatedData = updatedData.split(oldNim).join(newNim);
      });

      if (updatedData !== storedData) {
        localStorage.setItem(key, updatedData);
      }
    });

    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      setStoredItem(STORAGE_KEYS.COURSES, MOCK_COURSES);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      setStoredItem(STORAGE_KEYS.CLASSES, MOCK_CLASSES);
    }

    if (!localStorage.getItem(STORAGE_KEYS.STUDY_PLANS)) {
      setStoredItem(STORAGE_KEYS.STUDY_PLANS, MOCK_STUDY_PLANS);
    }

    // Sinkronisasi identitas mahasiswa pada pengajuan KRS
const studyPlans = this.getStudyPlans();

const updatedStudyPlans = studyPlans.map((plan) => {
  if (
    plan.studentId === 'std_01' ||
    plan.studentNim === '12410619'
  ) {
    return {
      ...plan,
      studentName: 'Syalom Mauren Angginaloy',
      studentNim: '12410619',
    };
  }

  return plan;
});

setStoredItem(STORAGE_KEYS.STUDY_PLANS, updatedStudyPlans);

    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCES)) {
      setStoredItem(STORAGE_KEYS.ATTENDANCES, MOCK_ATTENDANCES);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)) {
      setStoredItem(STORAGE_KEYS.CONSULTATIONS, MOCK_CONSULTATIONS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStoredItem(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      setStoredItem(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT_LOGS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.GRADES)) {
      setStoredItem(STORAGE_KEYS.GRADES, MOCK_INITIAL_GRADES);
    }
  }

  // Students
  static getStudents(): StudentProfile[] {
    return getStoredItem<StudentProfile[]>(
      STORAGE_KEYS.STUDENTS,
      MOCK_STUDENTS
    );
  }

  static getStudentById(id: string): StudentProfile | undefined {
    return this.getStudents().find(
      (student) => student.id === id || student.userId === id
    );
  }

  static updateStudent(
    id: string,
    updates: Partial<StudentProfile>
  ): void {
    const students = this.getStudents();

    const index = students.findIndex(
      (student) => student.id === id || student.userId === id
    );

    if (index !== -1) {
      students[index] = {
        ...students[index],
        ...updates,
      };

      setStoredItem(STORAGE_KEYS.STUDENTS, students);
    }
  }

  // Lecturers
  static getLecturers(): LecturerProfile[] {
    return MOCK_LECTURERS;
  }

  static getLecturerById(id: string): LecturerProfile | undefined {
    return MOCK_LECTURERS.find(
      (lecturer) => lecturer.id === id || lecturer.userId === id
    );
  }

  // Courses
  static getCourses(): Course[] {
    return getStoredItem<Course[]>(
      STORAGE_KEYS.COURSES,
      MOCK_COURSES
    );
  }

  static addCourse(course: Course): void {
    const list = this.getCourses();

    const existingCourse = list.some(
      (item) => item.id === course.id
    );

    if (existingCourse) {
      console.warn(`Mata kuliah dengan ID ${course.id} sudah tersedia.`);
      return;
    }

    list.push(course);
    setStoredItem(STORAGE_KEYS.COURSES, list);

    this.addAuditLog(
      'Dosen PA',
      'lecturer',
      'ADD_COURSE',
      `Menambahkan mata kuliah baru: ${course.code} - ${course.name}`
    );
  }

  // Classes
  static getClasses(): CourseClass[] {
    const storedClasses = getStoredItem<CourseClass[]>(
      STORAGE_KEYS.CLASSES,
      MOCK_CLASSES
    );

    const uniqueClasses = Array.from(
      new Map(
        storedClasses.map((cls) => [cls.id, cls])
      ).values()
    );

    if (uniqueClasses.length !== storedClasses.length) {
      setStoredItem(STORAGE_KEYS.CLASSES, uniqueClasses);
    }

    return uniqueClasses;
  }

  static addClass(cls: CourseClass): void {
    const list = this.getClasses();

    const existingClass = list.some(
      (item) => item.id === cls.id
    );

    if (existingClass) {
      console.warn(`Kelas dengan ID ${cls.id} sudah tersedia.`);
      return;
    }

    list.push(cls);
    setStoredItem(STORAGE_KEYS.CLASSES, list);

    this.addAuditLog(
      'Dosen PA',
      'lecturer',
      'ADD_CLASS',
      `Membuka kelas baru: ${cls.courseCode} Seksi ${cls.section}`
    );
  }

  // Grades & Transcripts
  static scoreToGrade(score: number): {
    letter: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
    point: number;
  } {
    if (score >= 85) return { letter: 'A', point: 4.0 };
    if (score >= 80) return { letter: 'A-', point: 3.75 };
    if (score >= 75) return { letter: 'B+', point: 3.5 };
    if (score >= 70) return { letter: 'B', point: 3.0 };
    if (score >= 65) return { letter: 'B-', point: 2.75 };
    if (score >= 60) return { letter: 'C+', point: 2.5 };
    if (score >= 55) return { letter: 'C', point: 2.0 };
    if (score >= 45) return { letter: 'D', point: 1.0 };

    return { letter: 'F', point: 0.0 };
  }

  static getAllGrades(): GradeRecord[] {
    return getStoredItem<GradeRecord[]>(
      STORAGE_KEYS.GRADES,
      MOCK_INITIAL_GRADES
    );
  }

  static getGradesByStudentId(studentId: string): GradeRecord[] {
    return this.getAllGrades().filter(
      (grade) => grade.studentId === studentId
    );
  }

  static getGradesByClassId(classId: string): GradeRecord[] {
    return this.getAllGrades().filter(
      (grade) => grade.classId === classId
    );
  }

  static saveClassGrades(
    classId: string,
    inputs: ClassGradeInput[],
    lecturerName: string = ''
  ): GradeRecord[] {
    const classes = this.getClasses();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) {
      throw new Error(`Kelas dengan ID ${classId} tidak ditemukan`);
    }

    // Validasi ketat: pastikan setiap studentId terdaftar sebagai peserta kelas ini
    // melalui data StudyPlan (KRS). Tidak ada fallback, tidak ada pengecualian.
    const studyPlans = this.getStudyPlans();
    const enrolledStudentIds = new Set(
      studyPlans
        .filter((sp) => sp.items.some((item) => item.classId === classId))
        .map((sp) => sp.studentId)
    );

    const unregisteredStudents = inputs.filter((input) => !enrolledStudentIds.has(input.studentId));
    if (unregisteredStudents.length > 0) {
      const nims = unregisteredStudents
        .map((inp) => {
          const s = this.getStudentById(inp.studentId);
          return s ? `${s.name} (${s.nim})` : inp.studentId;
        })
        .join(', ');
      throw new Error(
        `Mahasiswa berikut tidak terdaftar sebagai peserta kelas ${cls.courseCode} Seksi ${cls.section} dan tidak boleh dinilai: ${nims}`
      );
    }

    const courseCode = cls.courseCode;
    const courseName = cls.courseName;
    const courseCredits = cls.credits;
    const courseId = cls.courseId;
    const semester = cls.semester;
    const academicYear = cls.academicYear;

    const allGrades = this.getAllGrades();
    const savedRecords: GradeRecord[] = [];

    const now = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    inputs.forEach((input) => {
      const finalScore = Math.round(
        input.tugas * 0.3 +
        input.uts * 0.3 +
        input.uas * 0.4
      );

      const { letter, point } = this.scoreToGrade(finalScore);
      const isPassed = !['D', 'F'].includes(letter);

      // Hanya cari berdasarkan studentId + classId, tidak gunakan courseCode sebagai alternatif
      const existingIndex = allGrades.findIndex(
        (g) => g.studentId === input.studentId && g.classId === classId
      );

      const gradeRecord: GradeRecord = {
        id:
          existingIndex !== -1
            ? allGrades[existingIndex].id
            : `grd_${Date.now()}_${input.studentId}`,
        studentId: input.studentId,
        courseId,
        courseCode,
        courseName,
        credits: courseCredits,
        semester,
        academicYear,
        score: finalScore,
        componentScores: {
          tugas: input.tugas,
          uts: input.uts,
          uas: input.uas,
        },
        classId,
        lecturerName,
        letterGrade: letter,
        gradePoint: point,
        isPassed,
        inputSource: 'lecturer',
        verificationStatus: 'approved',
        updatedAt: now,
      };

      if (existingIndex !== -1) {
        allGrades[existingIndex] = gradeRecord;
      } else {
        allGrades.push(gradeRecord);
      }

      savedRecords.push(gradeRecord);

      // Re-calculate Student GPA (IPK), IPS, and Credits Earned
      const studentGrades = allGrades.filter((g) => g.studentId === input.studentId);
      const totalCredits = studentGrades.reduce((sum, g) => sum + g.credits, 0);
      const totalPoints = studentGrades.reduce((sum, g) => sum + g.gradePoint * g.credits, 0);
      const newGpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
      const passedCredits = studentGrades.filter((g) => g.isPassed).reduce((sum, g) => sum + g.credits, 0);

      const semGrades = studentGrades.filter((g) => g.semester === semester);
      const semCredits = semGrades.reduce((sum, g) => sum + g.credits, 0);
      const semPoints = semGrades.reduce((sum, g) => sum + g.gradePoint * g.credits, 0);
      const newIps = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : newGpa;

      this.updateStudent(input.studentId, {
        cumulativeGpa: newGpa,
        lastSemesterGpa: newIps,
        creditsEarned: passedCredits,
      });

      // Send notification to student
      const student = this.getStudentById(input.studentId);

      if (student) {
        this.addNotification({
          id: `notif_${Date.now()}_${input.studentId}`,
          userId: student.userId,
          title: 'Nilai Perkuliahan Diterbitkan',
          message: `Nilai mata kuliah ${courseCode} (${courseName}) telah diterbitkan oleh dosen ${lecturerName} dengan hasil ${letter} (${finalScore}).`,
          type: isPassed ? 'success' : 'warning',
          link: '/student/grades',
          read: false,
          createdAt: 'Baru saja',
        });
      }
    });

    setStoredItem(STORAGE_KEYS.GRADES, allGrades);

    this.addAuditLog(
      lecturerName,
      'lecturer',
      'INPUT_GRADES',
      `Menyimpan dan mempublikasikan nilai kelas ${courseCode} (${cls.section}) untuk ${inputs.length} mahasiswa ke Transkrip Akademik.`
    );

    return savedRecords;
  }

  /**
   * Menghitung ulang metrik akademik mahasiswa (IPK, IPS, dan SKS Lulus)
   * menggunakan aturan NILAI TERBARU (latest attempt) dari nilai resmi.
   * Nilai mandiri berstatus pending atau rejected diabaikan dari perhitungan.
   */
  static recalculateStudentMetrics(studentId: string): void {
    const allGrades = this.getAllGrades();
    const studentGrades = allGrades.filter(
      (grade) => grade.studentId === studentId && isOfficialGrade(grade)
    );

    // Kumpulkan HANYA percobaan resmi terbaru (latest attempt) untuk setiap mata kuliah
    const latestRecords = getLatestOfficialAttempts(studentGrades);

    // SKS lulus dihitung berdasarkan status kelulusan dari percobaan terbaru
    const passedCredits = latestRecords
      .filter((g) => g.isPassed && PASSING_GRADES.includes(g.letterGrade))
      .reduce((sum, g) => sum + g.credits, 0);

    // IPK Kumulatif dihitung dari seluruh percobaan terbaru
    const newGpa = calculateCumulativeGPA(studentGrades) ?? 0;

    const student = this.getStudentById(studentId);
    const lastSem = student?.currentSemester ? student.currentSemester - 1 : 4;
    const lastSemGrades = studentGrades.filter(
      (g) => g.semester === lastSem && g.letterGrade !== 'IP' && g.letterGrade in GRADE_POINTS_SCALE
    );
    const lastSemCredits = lastSemGrades.reduce((sum, g) => sum + g.credits, 0);
    const lastSemPoints = lastSemGrades.reduce(
      (sum, g) => sum + (GRADE_POINTS_SCALE[g.letterGrade] ?? 0) * g.credits,
      0
    );
    const newIps = lastSemCredits > 0 ? Number((lastSemPoints / lastSemCredits).toFixed(2)) : newGpa;

    this.updateStudent(studentId, {
      cumulativeGpa: newGpa,
      lastSemesterGpa: newIps,
      creditsEarned: passedCredits,
    });
  }

  /**
   * Menambahkan input nilai mandiri oleh mahasiswa pada riwayat akademik.
   * - Otomatis mengambil kode MK, nama, dan SKS dari katalog kurikulum.
   * - Mencegah duplikasi mata kuliah pada semester dan tahun akademik yang sama.
   * - Status verifikasi awal: 'pending' (Menunggu Verifikasi).
   * - inputSource: 'student'.
   */
  static addStudentGradeRecord(input: StudentGradeInput): GradeRecord {
    const courses = this.getCourses();
    const course = courses.find(
      (c) => c.id === input.courseId || c.code.toLowerCase() === input.courseId.toLowerCase()
    );

    if (!course) {
      throw new Error('Mata kuliah tidak ditemukan dalam daftar kurikulum.');
    }

    const allGrades = this.getAllGrades();

    // Validasi pencegahan duplikasi: MK yang sama pada semester dan tahun akademik yang sama
    const isDuplicate = allGrades.some(
      (g) =>
        g.studentId === input.studentId &&
        (g.courseId === course.id || g.courseCode.toLowerCase() === course.code.toLowerCase()) &&
        g.semester === Number(input.semester) &&
        g.academicYear.trim().toLowerCase() === input.academicYear.trim().toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(
        `Mata kuliah ${course.code} (${course.name}) sudah pernah diambil pada Semester ${input.semester} Tahun Akademik ${input.academicYear}.`
      );
    }

    const point = GRADE_POINTS_SCALE[input.letterGrade] ?? 0.0;
    const isPassed = PASSING_GRADES.includes(input.letterGrade);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newRecord: GradeRecord = {
      id: `grd_std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: input.studentId,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      credits: course.credits,
      semester: Number(input.semester),
      academicYear: input.academicYear.trim(),
      letterGrade: input.letterGrade,
      gradePoint: point,
      isPassed,
      inputSource: 'student',
      verificationStatus: 'pending',
      updatedAt: now,
    };

    allGrades.push(newRecord);
    setStoredItem(STORAGE_KEYS.GRADES, allGrades);

    const student = this.getStudentById(input.studentId);
    const studentName = student?.name || 'Mahasiswa';

    this.addAuditLog(
      studentName,
      'student',
      'INPUT_MANDIRI_NILAI',
      `Mahasiswa mengajukan input mandiri nilai ${course.code} - ${course.name} (${input.letterGrade}) untuk Semester ${input.semester} ${input.academicYear} (Menunggu Verifikasi).`
    );

    if (student) {
      this.addNotification({
        id: `notif_${Date.now()}_${input.studentId}`,
        userId: student.userId,
        title: 'Pengajuan Nilai Mandiri Terkirim',
        message: `Pengajuan nilai mata kuliah ${course.code} (${course.name}) Semester ${input.semester} telah tersimpan dan menunggu verifikasi Dosen Pembina Akademik.`,
        type: 'info',
        link: '/student/academic-history',
        read: false,
        createdAt: 'Baru saja',
      });
    }

    return newRecord;
  }

  /**
   * Memproses verifikasi nilai mandiri oleh Dosen PA / Akademik.
   * - Status 'approved': nilai resmi diakui dan langsung masuk perhitungan IPK, IPS, dan SKS lulus.
   * - Status 'rejected': nilai ditolak dan tidak masuk perhitungan akademik resmi.
   */
  static verifyGradeRecord(
    gradeId: string,
    status: 'approved' | 'rejected',
    notes?: string,
    verifiedBy: string = 'Semmy W. Taju, S.Kom., M.S., Ph.D.'
  ): GradeRecord | null {
    const allGrades = this.getAllGrades();
    const index = allGrades.findIndex((g) => g.id === gradeId);

    if (index === -1) {
      throw new Error('Data nilai tidak ditemukan.');
    }

    const record = allGrades[index];
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    allGrades[index] = {
      ...record,
      verificationStatus: status,
      updatedAt: now,
    };

    setStoredItem(STORAGE_KEYS.GRADES, allGrades);

    // Jika disetujui, perbarui metrik IPK, IPS, dan SKS lulus mahasiswa
    if (status === 'approved') {
      this.recalculateStudentMetrics(record.studentId);
    }

    const student = this.getStudentById(record.studentId);
    const statusLabel = status === 'approved' ? 'DISETUJUI' : 'DITOLAK';

    this.addAuditLog(
      verifiedBy,
      'lecturer',
      'VERIFIKASI_NILAI_MANDIRI',
      `Verifikasi nilai mandiri ${record.courseCode} (${record.courseName}) untuk mahasiswa ${student?.name || record.studentId}: ${statusLabel}.${notes ? ` Catatan: ${notes}` : ''}`
    );

    if (student) {
      this.addNotification({
        id: `notif_${Date.now()}_${record.studentId}`,
        userId: student.userId,
        title: status === 'approved' ? 'Nilai Mandiri Disetujui' : 'Nilai Mandiri Ditolak',
        message:
          status === 'approved'
            ? `Pengajuan nilai mandiri ${record.courseCode} (${record.courseName}) telah DISETUJUI dan kini resmi masuk perhitungan akademik.`
            : `Pengajuan nilai mandiri ${record.courseCode} (${record.courseName}) DITOLAK.${notes ? ` Alasan: ${notes}` : ''}`,
        type: status === 'approved' ? 'success' : 'danger',
        link: '/student/academic-history',
        read: false,
        createdAt: 'Baru saja',
      });
    }

    return allGrades[index];
  }

  /**
   * Menghapus catatan nilai mandiri mahasiswa yang masih pending
   */
  static deleteStudentGradeRecord(gradeId: string, studentId: string): boolean {
    const allGrades = this.getAllGrades();
    const index = allGrades.findIndex((g) => g.id === gradeId && g.studentId === studentId);

    if (index === -1) return false;

    const [deleted] = allGrades.splice(index, 1);
    setStoredItem(STORAGE_KEYS.GRADES, allGrades);

    if (deleted.verificationStatus === 'approved') {
      this.recalculateStudentMetrics(studentId);
    }

    return true;
  }

  static resetGradesToDefault(): void {
    setStoredItem(STORAGE_KEYS.GRADES, MOCK_INITIAL_GRADES);
  }

  // ============================================
// ADD & DROP MATA KULIAH
// ============================================

static getAddDropRequests(studentId?: string): AddDropRequest[] {
  const requests = getStoredItem<AddDropRequest[]>(
    STORAGE_KEYS.ADD_DROP_REQUESTS,
    []
  );

  return studentId
    ? requests.filter((request) => request.studentId === studentId)
    : requests;
}

static submitAddDropRequest(
  studentId: string,
  type: 'add' | 'drop',
  classOrItemId: string,
  reason: string
): AddDropRequest {
  const student = this.getStudentById(studentId);

  if (!student) {
    throw new Error('Data mahasiswa tidak ditemukan.');
  }

  const plan = this.getStudyPlanByStudentId(studentId);

  if (!plan || plan.status !== 'approved') {
    throw new Error('Add & Drop hanya dapat dilakukan setelah KRS disetujui.');
  }

  if (!reason.trim()) {
    throw new Error('Alasan pengajuan wajib diisi.');
  }

  const requests = this.getAddDropRequests();
  let courseItem: StudyPlanItem;

  if (type === 'add') {
    const selectedClass = this.getClasses().find(
      (item) => item.id === classOrItemId
    );

    if (!selectedClass) {
      throw new Error('Kelas yang dipilih tidak ditemukan.');
    }

    if (
      plan.items.some(
        (item) =>
          item.classId === selectedClass.id ||
          item.courseId === selectedClass.courseId
      )
    ) {
      throw new Error('Mata kuliah tersebut sudah ada dalam KRS.');
    }

    if (selectedClass.enrolled >= selectedClass.capacity) {
      throw new Error('Kelas sudah mencapai kapasitas maksimum.');
    }

    if (
      requests.some(
        (request) =>
          request.studyPlanId === plan.id &&
          request.type === 'add' &&
          request.status === 'submitted' &&
          request.courseItem.classId === selectedClass.id
      )
    ) {
      throw new Error('Pengajuan penambahan kelas ini masih menunggu persetujuan.');
    }

    courseItem = {
      id: `add_${Date.now()}`,
      studyPlanId: plan.id,
      classId: selectedClass.id,
      courseId: selectedClass.courseId,
      courseCode: selectedClass.courseCode,
      courseName: selectedClass.courseName,
      credits: selectedClass.credits,
      section: selectedClass.section,
      day: selectedClass.day,
      startTime: selectedClass.startTime,
      endTime: selectedClass.endTime,
      room: selectedClass.room,
      lecturerName: selectedClass.lecturerName,
      status: 'submitted',
    };

    const grades = this.getGradesByStudentId(studentId);
    const latestGrades = getLatestOfficialAttempts(grades);

    const passedCourseIds = latestGrades
      .filter(
        (grade) =>
          grade.isPassed &&
          PASSING_GRADES.includes(grade.letterGrade)
      )
      .map((grade) => grade.courseId);

    const maxCreditLimit = calculateMaxCreditLimit(
      calculateCumulativeGPA(grades)
    );

    const allClasses = this.getClasses();

    const proposedClasses = [
      ...plan.items.map((item) => {
        const existingClass = allClasses.find(
          (cls) => cls.id === item.classId
        );

        if (!existingClass) {
          throw new Error(`Kelas ${item.courseCode} tidak ditemukan.`);
        }

        return existingClass;
      }),
      selectedClass,
    ];

    const validationErrors = validateAddDropAddition(
      plan,
      selectedClass,
      grades,
      allClasses,
      this.getCourses()
    );

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }
  } else {
    const existingItem = plan.items.find(
      (item) =>
        item.id === classOrItemId ||
        item.classId === classOrItemId
    );

    if (!existingItem) {
      throw new Error('Mata kuliah tidak ditemukan dalam KRS.');
    }

    if (
      requests.some(
        (request) =>
          request.studyPlanId === plan.id &&
          request.type === 'drop' &&
          request.status === 'submitted' &&
          request.courseItem.id === existingItem.id
      )
    ) {
      throw new Error('Pengajuan penghapusan mata kuliah ini masih menunggu persetujuan.');
    }

    courseItem = { ...existingItem };
  }

  const request: AddDropRequest = {
    id: `adddrop_${Date.now()}`,
    studyPlanId: plan.id,
    studentId: student.id,
    studentNim: student.nim,
    studentName: student.name,
    academicYear: plan.academicYear,
    semester: plan.semester,
    type,
    courseItem,
    status: 'submitted',
    reason: reason.trim(),
    submittedAt: new Date().toISOString(),
  };

  requests.push(request);

  setStoredItem(STORAGE_KEYS.ADD_DROP_REQUESTS, requests);

  const advisor = this.getLecturerById(student.academicAdvisorId);

  this.addNotification({
    id: `notif_${Date.now()}`,
    userId: advisor?.userId || student.academicAdvisorId,
    title: 'Pengajuan Add & Drop Baru',
    message: `${student.name} mengajukan ${
      type === 'add' ? 'penambahan' : 'penghapusan'
    } ${courseItem.courseCode} - ${courseItem.courseName}.`,
    type: 'warning',
    link: '/lecturer/krs-approval',
    read: false,
    createdAt: new Date().toISOString(),
  });

  this.addAuditLog(
    student.name,
    'student',
    type === 'add' ? 'SUBMIT_ADD_COURSE' : 'SUBMIT_DROP_COURSE',
    `Mengajukan ${type === 'add' ? 'penambahan' : 'penghapusan'} ${courseItem.courseCode}. Alasan: ${reason}`
  );

  return request;
}

static reviewAddDropRequest(
  requestId: string,
  decision: 'approved' | 'rejected',
  reviewerId: string,
  reviewerName: string,
  feedback: string = ''
): void {
  const requests = this.getAddDropRequests();

  const request = requests.find((item) => item.id === requestId);

  if (!request) {
    throw new Error('Pengajuan Add & Drop tidak ditemukan.');
  }

  if (request.status !== 'submitted') {
    throw new Error('Pengajuan ini sudah pernah diproses.');
  }

  const student = this.getStudentById(request.studentId);

  if (!student) {
    throw new Error('Data mahasiswa tidak ditemukan.');
  }

  const advisor = this.getLecturerById(student.academicAdvisorId);

  if (
    !advisor ||
    (advisor.id !== reviewerId && advisor.userId !== reviewerId)
  ) {
    throw new Error('Hanya dosen wali mahasiswa yang dapat memproses pengajuan ini.');
  }

  const plans = this.getStudyPlans();
  const plan = plans.find((item) => item.id === request.studyPlanId);

  if (!plan || plan.status !== 'approved') {
    throw new Error('KRS tidak ditemukan atau tidak lagi berstatus disetujui.');
  }

  if (decision === 'approved') {
    const classes = this.getClasses();

    const targetClass = classes.find(
      (item) => item.id === request.courseItem.classId
    );

    if (!targetClass) {
      throw new Error('Data kelas tidak ditemukan.');
    }

    if (request.type === 'add') {
      if (
        plan.items.some(
          (item) => item.courseId === request.courseItem.courseId
        )
      ) {
        throw new Error('Mata kuliah tersebut sudah ada dalam KRS.');
      }

      if (targetClass.enrolled >= targetClass.capacity) {
        throw new Error('Kapasitas kelas sudah penuh.');
      }

      const grades = this.getGradesByStudentId(request.studentId);
      const latestGrades = getLatestOfficialAttempts(grades);

      const passedCourseIds = latestGrades
        .filter(
          (grade) =>
            grade.isPassed &&
            PASSING_GRADES.includes(grade.letterGrade)
        )
        .map((grade) => grade.courseId);

      const maxCreditLimit = calculateMaxCreditLimit(
        calculateCumulativeGPA(grades)
      );

      const proposedClasses = [
        ...plan.items.map((item) => {
          const existingClass = classes.find(
            (cls) => cls.id === item.classId
          );

          if (!existingClass) {
            throw new Error(`Kelas ${item.courseCode} tidak ditemukan.`);
          }

          return existingClass;
        }),
        targetClass,
      ];

      const validationErrors = validateAddDropAddition(
        plan,
        targetClass,
        grades,
        classes,
        this.getCourses()
      );

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      plan.items.push({
        ...request.courseItem,
        status: 'approved',
      });

      targetClass.enrolled += 1;
    } else {
      const itemIndex = plan.items.findIndex(
        (item) => item.id === request.courseItem.id
      );

      if (itemIndex === -1) {
        throw new Error('Mata kuliah tidak lagi ditemukan dalam KRS.');
      }

      plan.items.splice(itemIndex, 1);
      targetClass.enrolled = Math.max(0, targetClass.enrolled - 1);
    }

    plan.totalCredits = plan.items.reduce(
      (total, item) => total + item.credits,
      0
    );

    setStoredItem(STORAGE_KEYS.STUDY_PLANS, plans);
    setStoredItem(STORAGE_KEYS.CLASSES, classes);

    this.updateStudent(request.studentId, {
      creditsCurrent: plan.totalCredits,
      krsStatus: 'approved',
    });
  }

  request.status = decision;
  request.reviewedAt = new Date().toISOString();
  request.reviewerId = reviewerId;
  request.reviewerName = reviewerName;
  request.feedback = feedback;

  setStoredItem(STORAGE_KEYS.ADD_DROP_REQUESTS, requests);

  this.addNotification({
    id: `notif_${Date.now()}`,
    userId: student.userId || student.id,
    title:
      decision === 'approved'
        ? 'Pengajuan Add & Drop Disetujui'
        : 'Pengajuan Add & Drop Ditolak',
    message:
      `${request.courseItem.courseCode} - ${request.courseItem.courseName}: ` +
      `${decision === 'approved' ? 'pengajuan disetujui' : 'pengajuan ditolak'}.` +
      (feedback ? ` Catatan dosen: ${feedback}` : ''),
    type: decision === 'approved' ? 'success' : 'danger',
    link: '/student/study-plan',
    read: false,
    createdAt: new Date().toISOString(),
  });

  this.addAuditLog(
    reviewerName,
    'lecturer',
    decision === 'approved' ? 'APPROVE_ADD_DROP' : 'REJECT_ADD_DROP',
    `${decision === 'approved' ? 'Menyetujui' : 'Menolak'} pengajuan ${request.type.toUpperCase()} ${request.courseItem.courseCode} milik ${student.name} (${student.nim}).`
  );
}
  // Study Plans (KRS)
  static getStudyPlans(): StudyPlan[] {
    return getStoredItem<StudyPlan[]>(
      STORAGE_KEYS.STUDY_PLANS,
      MOCK_STUDY_PLANS
    );
  }

  static getStudyPlanByStudentId(
    studentId: string
  ): StudyPlan | undefined {
    const student = this.getStudentById(studentId);

    if (!student) return undefined;

    const plans = this.getStudyPlans();

    return [...plans].reverse().find(
      (plan) =>
        plan.studentId === studentId &&
        plan.semester === student.currentSemester &&
        plan.academicYear === student.academicYear
    );
  }

  static saveKrsDraft(
    studentId: string,
    items: StudyPlanItem[],
    notes: string
  ): StudyPlan {
    const plans = this.getStudyPlans();
    const student = this.getStudentById(studentId);

    if (!student) {
      throw new Error(
        'Data mahasiswa tidak ditemukan. Draft KRS tidak dapat disimpan.'
      );
    }

    let plan = plans.find(
      (existingPlan) =>
        existingPlan.studentId === studentId &&
        existingPlan.semester === student.currentSemester
    );

    if (plan?.status === 'approved') {
      throw new Error(
        'KRS yang sudah disetujui tidak dapat diubah.'
      );
    }

    const totalCredits = items.reduce(
      (sum, item) => sum + (item.credits || 0),
      0
    );

    const planId =
      plan?.id || `krs_${studentId}_sem${student.currentSemester}`;

    const draftItems = items.map((item) => ({
      ...item,
      studyPlanId: planId,
      status: 'draft' as const,
    }));

    if (!plan) {
      plan = {
        id: planId,
        studentId,
        studentNim: student.nim,
        studentName: student.name,
        academicYear: student.academicYear,
        semester: student.currentSemester,
        status: 'draft',
        totalCredits,
        notes,
        items: draftItems,
      };

      plans.push(plan);
    } else {
      plan.status = 'draft';
      plan.totalCredits = totalCredits;
      plan.notes = notes;
      plan.items = draftItems;
      plan.advisorFeedback = undefined;
    }

    setStoredItem(STORAGE_KEYS.STUDY_PLANS, plans);

    this.updateStudent(studentId, {
      krsStatus: 'draft',
      creditsCurrent: totalCredits,
    });

    this.addAuditLog(
      student.name,
      'student',
      'SAVE_KRS_DRAFT',
      `Menyimpan draft KRS (${totalCredits} SKS)`
    );

    return plan;
  }

  static submitKrs(
    studentId: string,
    items: StudyPlanItem[],
    notes: string
  ): StudyPlan {
    const plans = this.getStudyPlans();
    const student = this.getStudentById(studentId);

    if (!student) {
      throw new Error(
        'Data mahasiswa tidak ditemukan. KRS tidak dapat diajukan.'
      );
    }

    if (items.length === 0) {
      throw new Error(
        'Pilih minimal satu kelas sebelum mengajukan KRS.'
      );
    }

    let plan = plans.find(
      (existingPlan) =>
        existingPlan.studentId === studentId &&
        existingPlan.semester === student.currentSemester
    );

    if (plan?.status === 'approved') {
      throw new Error(
        'KRS yang sudah disetujui tidak dapat diajukan kembali.'
      );
    }

    const totalCredits = items.reduce(
      (sum, item) => sum + (item.credits || 0),
      0
    );

    const submittedAt = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    const planId =
      plan?.id || `krs_${studentId}_sem${student.currentSemester}`;

    const submittedItems = items.map((item) => ({
      ...item,
      studyPlanId: planId,
      status: 'submitted' as const,
    }));

    if (!plan) {
      plan = {
        id: planId,
        studentId,
        studentNim: student.nim,
        studentName: student.name,
        academicYear: student.academicYear,
        semester: student.currentSemester,
        status: 'submitted',
        totalCredits,
        notes,
        submittedAt,
        items: submittedItems,
      };

      plans.push(plan);
    } else {
      plan.status = 'submitted';
      plan.totalCredits = totalCredits;
      plan.notes = notes;
      plan.submittedAt = submittedAt;
      plan.items = submittedItems;
      plan.advisorFeedback = undefined;
    }

    setStoredItem(STORAGE_KEYS.STUDY_PLANS, plans);

    this.updateStudent(studentId, {
      krsStatus: 'submitted',
      creditsCurrent: totalCredits,
    });

    const advisor = this.getLecturerById(
      student.academicAdvisorId
    );

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: advisor?.userId || student.academicAdvisorId,
      title: 'Pengajuan KRS Baru Masuk',
      message: `${student.name} (${student.nim}) telah mengirimkan KRS Semester ${student.currentSemester} (${totalCredits} SKS).`,
      type: 'warning',
      link: '/lecturer/krs-approval',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.addAuditLog(
      student.name,
      'student',
      'SUBMIT_KRS',
      `Mengirimkan KRS ke Dosen PA (${totalCredits} SKS)`
    );

    return plan;
  }

  static reviewKrs(
    krsId: string,
    decision: 'approved' | 'revision',
    feedback: string,
    reviewerName: string = 'Semmy W. Taju, S.Kom., M.S., Ph.D.'
  ): void {
    const plans = this.getStudyPlans();
    const plan = plans.find((item) => item.id === krsId);

    if (!plan) return;

    plan.status = decision;
    plan.advisorFeedback = feedback;

    plan.reviewedAt = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    setStoredItem(STORAGE_KEYS.STUDY_PLANS, plans);

    this.updateStudent(plan.studentId, {
      krsStatus: decision,
    });

    const student = this.getStudentById(plan.studentId);

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: student?.userId || plan.studentId,
      title:
        decision === 'approved'
          ? 'KRS Disetujui Dosen PA'
          : 'KRS Memerlukan Revisi',
      message:
        decision === 'approved'
          ? `Selamat, KRS Anda telah disetujui oleh ${reviewerName}. Anda resmi terdaftar pada perkuliahan.`
          : `Dosen PA meminta revisi KRS: "${feedback}"`,
      type: decision === 'approved' ? 'success' : 'danger',
      link: '/student/study-plan',
      read: false,
      createdAt: 'Baru saja',
    });

    this.addAuditLog(
      reviewerName,
      'lecturer',
      decision === 'approved' ? 'APPROVE_KRS' : 'REVISE_KRS',
      `${decision === 'approved' ? 'Menyetujui' : 'Meminta revisi'} KRS mahasiswa ${plan.studentName} (${plan.studentNim})`
    );
  }
    static saveAttendanceRecords(records: AttendanceRecord[]): void {
    const list = this.getAttendances();

    records.forEach((record) => {
      const existingIndex = list.findIndex(
        (item) =>
          item.id === record.id ||
          (
            item.classId === record.classId &&
            item.studentId === record.studentId &&
            item.meetingNumber === record.meetingNumber &&
            item.date === record.date
          )
      );

      if (existingIndex !== -1) {
        const existing = list[existingIndex];

        list[existingIndex] = {
          ...existing,
          ...record,
          correctionRequested:
            record.correctionRequested ?? existing.correctionRequested,
          correctionReason:
            record.correctionReason ?? existing.correctionReason,
          correctionStatus:
            record.correctionStatus ?? existing.correctionStatus,
        };
      } else {
        list.push(record);
      }
    });

    setStoredItem(STORAGE_KEYS.ATTENDANCES, list);
  }

  // Attendance
  static getAttendances(
    studentId?: string
  ): AttendanceRecord[] {
    const list = getStoredItem<AttendanceRecord[]>(
      STORAGE_KEYS.ATTENDANCES,
      MOCK_ATTENDANCES
    );

    return studentId
      ? list.filter(
          (attendance) => attendance.studentId === studentId
        )
      : list;
  }

  static requestAttendanceCorrection(
    attendanceId: string,
    reason: string
  ): void {
    const list = this.getAttendances();
    const item = list.find(
      (attendance) => attendance.id === attendanceId
    );

    if (item) {
      item.correctionRequested = true;
      item.correctionReason = reason;
      item.correctionStatus = 'pending';

      setStoredItem(STORAGE_KEYS.ATTENDANCES, list);

      this.addNotification({
        id: `notif_${Date.now()}`,
        userId: 'usr_lecturer_01',
        title: 'Pengajuan Koreksi Kehadiran',
        message: `${item.studentName} mengajukan koreksi presensi untuk kelas ${item.courseName}.`,
        type: 'info',
        link: '/lecturer/attendance',
        read: false,
        createdAt: 'Baru saja',
      });
    }
  }

  static processAttendanceCorrection(
    attendanceId: string,
    approved: boolean
  ): void {
    const list = this.getAttendances();

    const item = list.find(
      (attendance) => attendance.id === attendanceId
    );

    if (item) {
      item.correctionStatus = approved
        ? 'approved'
        : 'rejected';

      if (approved) {
        item.status = 'hadir';
      }

      setStoredItem(STORAGE_KEYS.ATTENDANCES, list);

      this.addNotification({
        id: `notif_${Date.now()}`,
        userId: 'usr_student_01',
        title: approved
          ? 'Koreksi Kehadiran Disetujui'
          : 'Koreksi Kehadiran Ditolak',
        message: `Pengajuan koreksi presensi untuk ${item.courseName} telah ${
          approved
            ? 'disetujui (status diubah menjadi Hadir)'
            : 'ditolak'
        }.`,
        type: approved ? 'success' : 'warning',
        link: '/student/attendance',
        read: false,
        createdAt: 'Baru saja',
      });
    }
  }

  // Consultations
  static getConsultations(
    userId?: string
  ): ConsultationSession[] {
    const list = getStoredItem<ConsultationSession[]>(
      STORAGE_KEYS.CONSULTATIONS,
      MOCK_CONSULTATIONS
    );

    return userId
      ? list.filter(
          (consultation) =>
            consultation.studentId === userId ||
            consultation.lecturerId === userId
        )
      : list;
  }

  static createConsultation(
    data: Omit<
      ConsultationSession,
      'id' | 'createdAt' | 'updatedAt'
    >
  ): ConsultationSession {
    const list = this.getConsultations();

    const now = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    const session: ConsultationSession = {
      ...data,
      id: `cns_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(session);
    setStoredItem(STORAGE_KEYS.CONSULTATIONS, list);

    const lecturer = this.getLecturerById(data.lecturerId);

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: lecturer?.userId || data.lecturerId,
      title: 'Permintaan Bimbingan Akademik',
      message: `${data.studentName} mengajukan konsultasi mengenai: "${data.topic}".`,
      type: 'info',
      link: '/lecturer/consultation',
      read: false,
      createdAt: 'Baru saja',
    });

    return session;
  }

  static replyConsultation(
    id: string,
    reply: string,
    scheduledDate?: string
  ): void {
    const list = this.getConsultations();

    const session = list.find(
      (consultation) => consultation.id === id
    );

    if (session) {
      session.lecturerReply = reply;
      session.status = scheduledDate
        ? 'scheduled'
        : 'completed';

      if (scheduledDate) {
        session.scheduledDate = scheduledDate;
      }

      session.updatedAt = new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);

      setStoredItem(STORAGE_KEYS.CONSULTATIONS, list);

      const student = this.getStudentById(session.studentId);

      this.addNotification({
        id: `notif_${Date.now()}`,
        userId: student?.userId || session.studentId,
        title: 'Balasan Konsultasi Akademik',
        message: `${session.lecturerName} telah membalas konsultasi "${session.topic}".`,
        type: 'success',
        link: '/student/consultation',
        read: false,
        createdAt: 'Baru saja',
      });
    }
  }

  // Notifications
  static getNotifications(
    userId?: string
  ): SystemNotification[] {
    const list = getStoredItem<SystemNotification[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      MOCK_NOTIFICATIONS
    );

    return userId
      ? list.filter(
          (notification) => notification.userId === userId
        )
      : list;
  }

  static addNotification(
    notification: SystemNotification
  ): void {
    const list = this.getNotifications();

    list.unshift(notification);

    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  static markNotificationAsRead(id: string): void {
    const list = this.getNotifications();

    const item = list.find(
      (notification) => notification.id === id
    );

    if (item) {
      item.read = true;
      setStoredItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(
      STORAGE_KEYS.AUDIT_LOGS,
      MOCK_AUDIT_LOGS
    );
  }

  static addAuditLog(
    userName: string,
    userRole: 'student' | 'lecturer',
    action: string,
    details: string
  ): void {
    const list = this.getAuditLogs();

    list.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19),
      userName,
      userRole,
      action,
      details,
      ipAddress: '192.168.10.1 (UNKLAB Campus Network)',
    });

    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, list);
  }
}
