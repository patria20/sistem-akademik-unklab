
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { AcademicService, type ClassGradeInput, type StudentGradeInput } from '../services/academicService';
import { useAuth } from './AuthContext';

interface AcademicContextType {
  students: StudentProfile[];
  lecturers: LecturerProfile[];
  courses: Course[];
  classes: CourseClass[];
  studyPlans: StudyPlan[];
  addDropRequests: AddDropRequest[];
  attendances: AttendanceRecord[];
  consultations: ConsultationSession[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  grades: GradeRecord[];
  allGrades: GradeRecord[];

  activeStudent: StudentProfile | undefined;
  activeLecturer: LecturerProfile | undefined;
  activeKrs: StudyPlan | undefined;

  saveKrsDraft: (items: StudyPlanItem[], notes: string) => StudyPlan;
  submitKrs: (items: StudyPlanItem[], notes: string) => StudyPlan;

  reviewKrs: (
    krsId: string,
    decision: 'approved' | 'revision',
    feedback: string
  ) => void;

  submitAddDropRequest: (
    type: 'add' | 'drop',
    targetId: string,
    reason: string
  ) => AddDropRequest;

  reviewAddDropRequest: (
    requestId: string,
    decision: 'approved' | 'rejected',
    feedback: string
  ) => void;

  requestAttendanceCorrection: (attendanceId: string, reason: string) => void;
  approveAttendanceCorrection: (attendanceId: string, approved: boolean) => void;
  saveAttendanceRecords: (records: AttendanceRecord[]) => void;
  createConsultation: (lecturerId: string, topic: string, message: string) => void;
  replyConsultation: (id: string, reply: string, scheduledDate?: string) => void;
  markNotificationAsRead: (id: string) => void;
  addNewCourse: (course: Course) => void;
  addNewClass: (cls: CourseClass) => void;
  saveClassGrades: (classId: string, inputs: ClassGradeInput[]) => GradeRecord[];
  getGradesByClassId: (classId: string) => GradeRecord[];
  addStudentGrade: (input: StudentGradeInput) => GradeRecord;
  verifyGradeRecord: (
    gradeId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => GradeRecord | null;
  deleteStudentGrade: (gradeId: string) => boolean;
  resetGradesToDefault: () => void;
  refreshData: () => void;
}
const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [addDropRequests, setAddDropRequests] = useState<AddDropRequest[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [allGrades, setAllGrades] = useState<GradeRecord[]>([]);

  const refreshData = useCallback(() => {
    AcademicService.initialize();

    const currentStudents = AcademicService.getStudents();
    setStudents(currentStudents);

    setLecturers(AcademicService.getLecturers());
    setCourses(AcademicService.getCourses());
    setClasses(AcademicService.getClasses());
    setStudyPlans(AcademicService.getStudyPlans());
    setAddDropRequests(AcademicService.getAddDropRequests());
    setAttendances(AcademicService.getAttendances());
    setConsultations(AcademicService.getConsultations());
    setNotifications(AcademicService.getNotifications());
    setAuditLogs(AcademicService.getAuditLogs());

    const all = AcademicService.getAllGrades();
    setAllGrades(all);

    // Nilai hanya milik mahasiswa yang sedang login.
    // Akun tanpa data mahasiswa tidak mendapatkan nilai mahasiswa lain.
    const loggedStudent = currentStudents.find(
      (student) => student.userId === user?.id
    );

    setGrades(
      loggedStudent
        ? AcademicService.getGradesByStudentId(loggedStudent.id)
        : []
    );
  }, [user?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const activeStudent = students.find(
    (student) => student.userId === user?.id
  );

  const activeLecturer = lecturers.find(
    (lecturer) => lecturer.userId === user?.id
  ) || (user?.role === 'lecturer' ? lecturers[0] : undefined);

  const activeKrs = studyPlans.find(
    (plan) => plan.studentId === activeStudent?.id
  );

  const handleSaveKrsDraft = (items: StudyPlanItem[], notes: string) => {
    if (!activeStudent) throw new Error('No active student found');

    const result = AcademicService.saveKrsDraft(activeStudent.id, items, notes);
    refreshData();

    return result;
  };

  const handleSubmitKrs = (items: StudyPlanItem[], notes: string) => {
    if (!activeStudent) throw new Error('No active student found');

    const result = AcademicService.submitKrs(activeStudent.id, items, notes);
    refreshData();

    return result;
  };

  const handleReviewKrs = (
    krsId: string,
    decision: 'approved' | 'revision',
    feedback: string
  ) => {
    AcademicService.reviewKrs(krsId, decision, feedback, user?.name);
    refreshData();
  };


  const handleSubmitAddDropRequest = (
  type: 'add' | 'drop',
  targetId: string,
  reason: string
): AddDropRequest => {
  if (!activeStudent) {
    throw new Error('Data mahasiswa aktif tidak ditemukan.');
  }

  const result = AcademicService.submitAddDropRequest(
    activeStudent.id,
    type,
    targetId,
    reason
  );

  refreshData();
  return result;
};

const handleReviewAddDropRequest = (
  requestId: string,
  decision: 'approved' | 'rejected',
  feedback: string
): void => {
  if (!activeLecturer) {
    throw new Error('Data dosen aktif tidak ditemukan.');
  }

  AcademicService.reviewAddDropRequest(
    requestId,
    decision,
    activeLecturer.id,
    user?.name || activeLecturer.name,
    feedback
  );

  refreshData();
};

  const handleRequestAttendanceCorrection = (
    attendanceId: string,
    reason: string
  ) => {
    AcademicService.requestAttendanceCorrection(attendanceId, reason);
    refreshData();
  };

  const handleApproveAttendanceCorrection = (
    attendanceId: string,
    approved: boolean
  ) => {
    AcademicService.processAttendanceCorrection(attendanceId, approved);
    refreshData();
  };

  const handleSaveAttendanceRecords = (records: AttendanceRecord[]) => {
    AcademicService.saveAttendanceRecords(records);
    refreshData();
  };

  const handleCreateConsultation = (
    lecturerId: string,
    topic: string,
    message: string
  ) => {
    if (!activeStudent) return;

    const targetLec = lecturers.find(
      (lecturer) =>
        lecturer.id === lecturerId ||
        lecturer.userId === lecturerId
    );

    if (!targetLec) return;

    AcademicService.createConsultation({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      studentNim: activeStudent.nim,
      lecturerId: targetLec.id,
      lecturerName: targetLec.name,
      topic,
      message,
      status: 'waiting',
    });

    refreshData();
  };

  const handleReplyConsultation = (
    id: string,
    reply: string,
    scheduledDate?: string
  ) => {
    AcademicService.replyConsultation(id, reply, scheduledDate);
    refreshData();
  };

  const handleMarkNotificationAsRead = (id: string) => {
    AcademicService.markNotificationAsRead(id);
    refreshData();
  };

  const handleAddNewCourse = (newCourse: Course) => {
    AcademicService.addCourse(newCourse);
    refreshData();
  };

  const handleAddNewClass = (newClass: CourseClass) => {
    AcademicService.addClass(newClass);
    refreshData();
  };

  const handleSaveClassGrades = (
    classId: string,
    inputs: ClassGradeInput[]
  ) => {
    const lecturerName =
      user?.name ||
      activeLecturer?.name ||
      'Semmy W. Taju, S.Kom., M.S., Ph.D.';

    const result = AcademicService.saveClassGrades(
      classId,
      inputs,
      lecturerName
    );

    refreshData();

    return result;
  };

  const handleGetGradesByClassId = (classId: string) => {
    return AcademicService.getGradesByClassId(classId);
  };

  const handleAddStudentGrade = (input: StudentGradeInput) => {
    const result = AcademicService.addStudentGradeRecord(input);
    refreshData();
    return result;
  };

  const handleVerifyGradeRecord = (
    gradeId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    const verifierName =
      user?.name ||
      activeLecturer?.name ||
      'Semmy W. Taju, S.Kom., M.S., Ph.D.';

    const result = AcademicService.verifyGradeRecord(
      gradeId,
      status,
      notes,
      verifierName
    );
    refreshData();
    return result;
  };

  const handleDeleteStudentGrade = (gradeId: string) => {
    if (!activeStudent) return false;
    const ok = AcademicService.deleteStudentGradeRecord(gradeId, activeStudent.id);
    if (ok) refreshData();
    return ok;
  };

  const handleResetGradesToDefault = () => {
    AcademicService.resetGradesToDefault();
    refreshData();
  };

  return (
    <AcademicContext.Provider
      value={{
        students,
        lecturers,
        courses,
        classes,
        studyPlans,
        addDropRequests,
        attendances,
        consultations,
        notifications,
        auditLogs,
        grades,
        allGrades,
        activeStudent,
        activeLecturer,
        activeKrs,
        saveKrsDraft: handleSaveKrsDraft,
        submitKrs: handleSubmitKrs,
        reviewKrs: handleReviewKrs,
        submitAddDropRequest: handleSubmitAddDropRequest,
        reviewAddDropRequest: handleReviewAddDropRequest,
        requestAttendanceCorrection: handleRequestAttendanceCorrection,
        approveAttendanceCorrection: handleApproveAttendanceCorrection,
	saveAttendanceRecords: handleSaveAttendanceRecords,
        createConsultation: handleCreateConsultation,
        replyConsultation: handleReplyConsultation,
        markNotificationAsRead: handleMarkNotificationAsRead,
        addNewCourse: handleAddNewCourse,
        addNewClass: handleAddNewClass,
        saveClassGrades: handleSaveClassGrades,
        getGradesByClassId: handleGetGradesByClassId,
        addStudentGrade: handleAddStudentGrade,
        verifyGradeRecord: handleVerifyGradeRecord,
        deleteStudentGrade: handleDeleteStudentGrade,
        resetGradesToDefault: handleResetGradesToDefault,
        refreshData,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export function useAcademic() {
  const context = useContext(AcademicContext);

  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }

  return context;
}
