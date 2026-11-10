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
  MOCK_GRADES_DAVID,
} from '../data/mockAcademicData';

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
  static initialize() {
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
      setStoredItem(STORAGE_KEYS.GRADES, MOCK_GRADES_DAVID);
    }
  }

  // Students
  static getStudents(): StudentProfile[] {
    return getStoredItem<StudentProfile[]>(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
  }

  static getStudentById(id: string): StudentProfile | undefined {
    return this.getStudents().find((s) => s.id === id || s.userId === id);
  }

  static updateStudent(id: string, updates: Partial<StudentProfile>): void {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === id || s.userId === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...updates };
      setStoredItem(STORAGE_KEYS.STUDENTS, students);
    }
  }

  // Lecturers
  static getLecturers(): LecturerProfile[] {
    return MOCK_LECTURERS;
  }

  static getLecturerById(id: string): LecturerProfile | undefined {
    return MOCK_LECTURERS.find((l) => l.id === id || l.userId === id);
  }

  // Courses
  static getCourses(): Course[] {
    return getStoredItem<Course[]>(STORAGE_KEYS.COURSES, MOCK_COURSES);
  }

  static addCourse(course: Course): void {
    const list = this.getCourses();
    list.push(course);
    setStoredItem(STORAGE_KEYS.COURSES, list);
    this.addAuditLog('Admin Akademik', 'admin', 'ADD_COURSE', `Menambahkan mata kuliah baru: ${course.code} - ${course.name}`);
  }

  // Classes
  static getClasses(): CourseClass[] {
    return getStoredItem<CourseClass[]>(STORAGE_KEYS.CLASSES, MOCK_CLASSES);
  }

  static addClass(cls: CourseClass): void {
    const list = this.getClasses();
    list.push(cls);
    setStoredItem(STORAGE_KEYS.CLASSES, list);
    this.addAuditLog('Admin Akademik', 'admin', 'ADD_CLASS', `Membuka kelas baru: ${cls.courseCode} Seksi ${cls.section}`);
  }

  // Grades
  static getGradesByStudentId(studentId: string): GradeRecord[] {
    const grades = getStoredItem<GradeRecord[]>(STORAGE_KEYS.GRADES, MOCK_GRADES_DAVID);
    return grades.filter((g) => g.studentId === studentId || studentId === 'std_01');
  }

  // Study Plans (KRS)
  static getStudyPlans(): StudyPlan[] {
    return getStoredItem<StudyPlan[]>(STORAGE_KEYS.STUDY_PLANS, MOCK_STUDY_PLANS);
  }

  static getStudyPlanByStudentId(studentId: string): StudyPlan | undefined {
    const plans = this.getStudyPlans();
    return plans.find((p) => p.studentId === studentId);
  }

  static saveKrsDraft(studentId: string, items: StudyPlanItem[], notes: string): StudyPlan {
    const plans = this.getStudyPlans();
    const student = this.getStudentById(studentId) || MOCK_STUDENTS[0];
    const totalCredits = items.reduce((sum, item) => sum + (item.credits || 0), 0);

    let plan = plans.find((p) => p.studentId === studentId);
    if (!plan) {
      plan = {
        id: `krs_${studentId}_sem${student.currentSemester}`,
        studentId,
        studentNim: student.nim,
        studentName: student.name,
        academicYear: student.academicYear,
        semester: student.currentSemester,
        status: 'draft',
        totalCredits,
        notes,
        items,
      };
      plans.push(plan);
    } else {
      plan.status = 'draft';
      plan.totalCredits = totalCredits;
      plan.notes = notes;
      plan.items = items;
    }

    setStoredItem(STORAGE_KEYS.STUDY_PLANS, plans);
    this.updateStudent(studentId, { krsStatus: 'draft', creditsCurrent: totalCredits });
    this.addAuditLog(student.name, 'student', 'SAVE_KRS_DRAFT', `Menyimpan draft KRS (${totalCredits} SKS)`);

    return plan;
  }

  static submitKrs(studentId: string, items: StudyPlanItem[], notes: string): StudyPlan {
    const plans = this.getStudyPlans();
    const student = this.getStudentById(studentId) || MOCK_STUDENTS[0];
    const totalCredits = items.reduce((sum, item) => sum + (item.credits || 0), 0);
    const submittedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let plan = plans.find((p) => p.studentId === studentId);
    if (!plan) {
      plan = {
        id: `krs_${studentId}_sem${student.currentSemester}`,
        studentId,
        studentNim: student.nim,
        studentName: student.name,
        academicYear: student.academicYear,
        semester: student.currentSemester,
        status: 'submitted',
        totalCredits,
        notes,
        submittedAt,
        items,
      };
      plans.push(plan);
    } else {
      plan.status = 'submitted';
      plan.totalCredits = totalCredits;
      plan.notes = notes;
      plan.submittedAt = submittedAt;
      plan.items = items;
    }

    setStoredItem(STORAGE_KEYS.STUDY_PLANS, plans);
    this.updateStudent(studentId, { krsStatus: 'submitted', creditsCurrent: totalCredits });

    // Send notification to advisor
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: 'usr_lecturer_01',
      title: 'Pengajuan KRS Baru Masuk',
      message: `${student.name} (${student.nim}) telah mengirimkan KRS Semester ${student.currentSemester} (${totalCredits} SKS).`,
      type: 'warning',
      link: '/lecturer/krs-approval',
      read: false,
      createdAt: 'Baru saja',
    });

    this.addAuditLog(student.name, 'student', 'SUBMIT_KRS', `Mengirimkan KRS ke Dosen PA (${totalCredits} SKS)`);

    return plan;
  }

  static reviewKrs(
    krsId: string,
    decision: 'approved' | 'revision',
    feedback: string,
    reviewerName: string = 'Dr. Ronny Gosal, M.Kom.'
  ): void {
    const plans = this.getStudyPlans();
    const plan = plans.find((p) => p.id === krsId);
    if (!plan) return;

    plan.status = decision;
    plan.advisorFeedback = feedback;
    plan.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setStoredItem(STORAGE_KEYS.STUDY_PLANS, plans);
    this.updateStudent(plan.studentId, { krsStatus: decision });

    // Send notification to student
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: 'usr_student_01',
      title: decision === 'approved' ? 'KRS Disetujui Dosen PA' : 'KRS Memerlukan Revisi',
      message: decision === 'approved'
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
  static getAttendances(studentId?: string): AttendanceRecord[] {
    const list = getStoredItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCES, MOCK_ATTENDANCES);
    return studentId ? list.filter((a) => a.studentId === studentId || studentId === 'std_01') : list;
  }

  static requestAttendanceCorrection(attendanceId: string, reason: string): void {
    const list = this.getAttendances();
    const item = list.find((a) => a.id === attendanceId);
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

  static processAttendanceCorrection(attendanceId: string, approved: boolean): void {
    const list = this.getAttendances();
    const item = list.find((a) => a.id === attendanceId);
    if (item) {
      item.correctionStatus = approved ? 'approved' : 'rejected';
      if (approved) {
        item.status = 'hadir';
      }
      setStoredItem(STORAGE_KEYS.ATTENDANCES, list);

      this.addNotification({
        id: `notif_${Date.now()}`,
        userId: 'usr_student_01',
        title: approved ? 'Koreksi Kehadiran Disetujui' : 'Koreksi Kehadiran Ditolak',
        message: `Pengajuan koreksi presensi untuk ${item.courseName} telah ${approved ? 'disetujui (status diubah menjadi Hadir)' : 'ditolak'}.`,
        type: approved ? 'success' : 'warning',
        link: '/student/attendance',
        read: false,
        createdAt: 'Baru saja',
      });
    }
  }

  // Consultations
  static getConsultations(userId?: string): ConsultationSession[] {
    const list = getStoredItem<ConsultationSession[]>(STORAGE_KEYS.CONSULTATIONS, MOCK_CONSULTATIONS);
    return userId ? list.filter((c) => c.studentId === userId || c.lecturerId === userId || true) : list;
  }

  static createConsultation(data: Omit<ConsultationSession, 'id' | 'createdAt' | 'updatedAt'>): ConsultationSession {
    const list = this.getConsultations();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const session: ConsultationSession = {
      ...data,
      id: `cns_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(session);
    setStoredItem(STORAGE_KEYS.CONSULTATIONS, list);

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: 'usr_lecturer_01',
      title: 'Permintaan Bimbingan Akademik',
      message: `${data.studentName} mengajukan konsultasi mengenai: "${data.topic}".`,
      type: 'info',
      link: '/lecturer/consultation',
      read: false,
      createdAt: 'Baru saja',
    });

    return session;
  }

  static replyConsultation(id: string, reply: string, scheduledDate?: string): void {
    const list = this.getConsultations();
    const session = list.find((c) => c.id === id);
    if (session) {
      session.lecturerReply = reply;
      session.status = scheduledDate ? 'scheduled' : 'completed';
      if (scheduledDate) session.scheduledDate = scheduledDate;
      session.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setStoredItem(STORAGE_KEYS.CONSULTATIONS, list);

      this.addNotification({
        id: `notif_${Date.now()}`,
        userId: 'usr_student_01',
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
  static getNotifications(userId?: string): SystemNotification[] {
    const list = getStoredItem<SystemNotification[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
    return userId ? list.filter((n) => n.userId === userId || true) : list;
  }

  static addNotification(notification: SystemNotification): void {
    const list = this.getNotifications();
    list.unshift(notification);
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  static markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      setStoredItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT_LOGS);
  }

  static addAuditLog(userName: string, userRole: any, action: string, details: string): void {
    const list = this.getAuditLogs();
    list.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName,
      userRole,
      action,
      details,
      ipAddress: '192.168.10.1 (UNKLAB Campus Network)',
    });
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, list);
  }
}
