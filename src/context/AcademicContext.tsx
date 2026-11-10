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
} from '../types/academic';
import { AcademicService } from '../services/academicService';
import { useAuth } from './AuthContext';

interface AcademicContextType {
  students: StudentProfile[];
  lecturers: LecturerProfile[];
  courses: Course[];
  classes: CourseClass[];
  studyPlans: StudyPlan[];
  attendances: AttendanceRecord[];
  consultations: ConsultationSession[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  grades: GradeRecord[];
  activeStudent: StudentProfile | undefined;
  activeLecturer: LecturerProfile | undefined;
  activeKrs: StudyPlan | undefined;
  saveKrsDraft: (items: StudyPlanItem[], notes: string) => StudyPlan;
  submitKrs: (items: StudyPlanItem[], notes: string) => StudyPlan;
  reviewKrs: (krsId: string, decision: 'approved' | 'revision', feedback: string) => void;
  requestAttendanceCorrection: (attendanceId: string, reason: string) => void;
  approveAttendanceCorrection: (attendanceId: string, approved: boolean) => void;
  createConsultation: (lecturerId: string, topic: string, message: string) => void;
  replyConsultation: (id: string, reply: string, scheduledDate?: string) => void;
  markNotificationAsRead: (id: string) => void;
  addNewCourse: (course: Course) => void;
  addNewClass: (cls: CourseClass) => void;
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
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);

  const refreshData = useCallback(() => {
    AcademicService.initialize();
    setStudents(AcademicService.getStudents());
    setLecturers(AcademicService.getLecturers());
    setCourses(AcademicService.getCourses());
    setClasses(AcademicService.getClasses());
    setStudyPlans(AcademicService.getStudyPlans());
    setAttendances(AcademicService.getAttendances());
    setConsultations(AcademicService.getConsultations());
    setNotifications(AcademicService.getNotifications());
    setAuditLogs(AcademicService.getAuditLogs());
    setGrades(AcademicService.getGradesByStudentId('std_01'));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const activeStudent = students.find((s) => s.userId === user?.id) || students[0];
  const activeLecturer = lecturers.find((l) => l.userId === user?.id) || lecturers[0];
  const activeKrs = studyPlans.find((p) => p.studentId === activeStudent?.id) || studyPlans[0];

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

  const handleReviewKrs = (krsId: string, decision: 'approved' | 'revision', feedback: string) => {
    AcademicService.reviewKrs(krsId, decision, feedback, user?.name);
    refreshData();
  };

  const handleRequestAttendanceCorrection = (attendanceId: string, reason: string) => {
    AcademicService.requestAttendanceCorrection(attendanceId, reason);
    refreshData();
  };

  const handleApproveAttendanceCorrection = (attendanceId: string, approved: boolean) => {
    AcademicService.processAttendanceCorrection(attendanceId, approved);
    refreshData();
  };

  const handleCreateConsultation = (lecturerId: string, topic: string, message: string) => {
    if (!activeStudent) return;
    const targetLec = lecturers.find((l) => l.id === lecturerId) || lecturers[0];
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

  const handleReplyConsultation = (id: string, reply: string, scheduledDate?: string) => {
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

  return (
    <AcademicContext.Provider
      value={{
        students,
        lecturers,
        courses,
        classes,
        studyPlans,
        attendances,
        consultations,
        notifications,
        auditLogs,
        grades,
        activeStudent,
        activeLecturer,
        activeKrs,
        saveKrsDraft: handleSaveKrsDraft,
        submitKrs: handleSubmitKrs,
        reviewKrs: handleReviewKrs,
        requestAttendanceCorrection: handleRequestAttendanceCorrection,
        approveAttendanceCorrection: handleApproveAttendanceCorrection,
        createConsultation: handleCreateConsultation,
        replyConsultation: handleReplyConsultation,
        markNotificationAsRead: handleMarkNotificationAsRead,
        addNewCourse: handleAddNewCourse,
        addNewClass: handleAddNewClass,
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
