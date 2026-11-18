
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

export interface ClassGradeInput {
  studentId: string;
  tugas: number;
  uts: number;
  uas: number;
}

const STORAGE_KEYS = {
  STUDENTS: 'siam_unklab_students',
  CLASSES: 'siam_unklab_classes',
  COURSES: 'siam_unklab_courses',
  STUDY_PLANS: 'siam_unklab_study_plans',
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

export class AcademicService {
  // Initialization
  static initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      setStoredItem(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      setStoredItem(STORAGE_KEYS.COURSES, MOCK_COURSES);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      setStoredItem(STORAGE_KEYS.CLASSES, MOCK_CLASSES);
    }

    if (!localStorage.getItem(STORAGE_KEYS.STUDY_PLANS)) {
      setStoredItem(STORAGE_KEYS.STUDY_PLANS, MOCK_STUDY_PLANS);
    }

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
    lecturerName: string = 'Semmy W. Taju, S.Kom., M.S., Ph.D.'
  ): GradeRecord[] {
    const classes = this.getClasses();
    const cls = classes.find((item) => item.id === classId);

    const courseCode = cls ? cls.courseCode : 'IF-MK';
    const courseName = cls ? cls.courseName : 'Mata Kuliah';
    const courseCredits = cls ? cls.credits : 3;
    const courseId = cls ? cls.courseId : `crs_${classId}`;

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

      const existingIndex = allGrades.findIndex(
        (grade) =>
          grade.studentId === input.studentId &&
          (
            grade.classId === classId ||
            grade.courseCode === courseCode
          )
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
        semester: 5,
        academicYear: '2026/2027 Ganjil',
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
        updatedAt: now,
      };

      if (existingIndex !== -1) {
        allGrades[existingIndex] = gradeRecord;
      } else {
        allGrades.push(gradeRecord);
      }

      savedRecords.push(gradeRecord);

      // Recalculate student GPA, IPS, and earned credits
      const studentGrades = allGrades.filter(
        (grade) => grade.studentId === input.studentId
      );

      const totalCredits = studentGrades.reduce(
        (sum, grade) => sum + grade.credits,
        0
      );

      const totalPoints = studentGrades.reduce(
        (sum, grade) => sum + grade.gradePoint * grade.credits,
        0
      );

      const newGpa =
        totalCredits > 0
          ? Number((totalPoints / totalCredits).toFixed(2))
          : 0;

      const passedCredits = studentGrades
        .filter((grade) => grade.isPassed)
        .reduce((sum, grade) => sum + grade.credits, 0);

      const sem5Grades = studentGrades.filter(
        (grade) => grade.semester === 5
      );

      const sem5Credits = sem5Grades.reduce(
        (sum, grade) => sum + grade.credits,
        0
      );

      const sem5Points = sem5Grades.reduce(
        (sum, grade) => sum + grade.gradePoint * grade.credits,
        0
      );

      const newIps =
        sem5Credits > 0
          ? Number((sem5Points / sem5Credits).toFixed(2))
          : newGpa;

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
      `Menyimpan dan mempublikasikan nilai kelas ${courseCode} (${cls?.section || 'A'}) untuk ${inputs.length} mahasiswa ke Transkrip Akademik.`
    );

    return savedRecords;
  }

  static resetGradesToDefault(): void {
    setStoredItem(STORAGE_KEYS.GRADES, MOCK_INITIAL_GRADES);
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
    const plans = this.getStudyPlans();

    return plans.find(
      (plan) => plan.studentId === studentId
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
