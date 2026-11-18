
export const ACADEMIC_MODULE_NAME = 'SIAM_UNKLAB_ACADEMIC_SYSTEM';

export type UserRole = 'student' | 'lecturer';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  identityNumber: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  nim: string;
  name: string;
  programStudy: string;
  faculty: string;
  academicAdvisorId: string;
  academicAdvisorName: string;
  currentSemester: number;
  cumulativeGpa: number;
  lastSemesterGpa: number;
  majorGpa: number;
  isFinalYearCandidate: boolean;
  creditsEarned: number;
  creditsCurrent: number;
  creditsRemaining: number;
  maxCreditLimit: number;
  krsStatus: 'draft' | 'submitted' | 'approved' | 'revision';
  academicYear: string;
}

export interface LecturerProfile {
  id: string;
  userId: string;
  nidn: string;
  name: string;
  title: string;
  department: string;
  faculty: string;
  adviseeCount: number;
  pendingKrsCount: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  credits: number;
  semester: number;
  curriculumYear: number;
  prerequisites: string[];
  isMandatory: boolean;
  category: 'Wajib Prodi' | 'Wajib Universitas' | 'Pilihan' | 'Tugas Akhir';
  description: string;
}

export interface CourseClass {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  section: string;
  lecturerId: string;
  lecturerName: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  enrolled: number;
  semester: number;
  academicYear: string;
}

export interface StudyPlanItem {
  id: string;
  studyPlanId: string;
  classId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  section: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  lecturerName: string;
  status: 'draft' | 'submitted' | 'approved' | 'revision' | 'rejected';
}

export interface AddDropRequest {
  id: string;
  studyPlanId: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  academicYear: string;
  semester: number;
  type: 'add' | 'drop';
  courseItem: StudyPlanItem;
  status: 'submitted' | 'approved' | 'rejected';
  reason: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerName?: string;
  feedback?: string;
}

export interface StudyPlan {
  id: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  academicYear: string;
  semester: number;
  status: 'draft' | 'submitted' | 'approved' | 'revision';
  totalCredits: number;
  notes: string;
  advisorFeedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  items: StudyPlanItem[];
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semester: number;
  academicYear: string;
  score?: number;
  componentScores?: {
    tugas: number;
    uts: number;
    uas: number;
  };
  classId?: string;
  lecturerName?: string;
  letterGrade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F' | 'IP';
  gradePoint: number;
  isPassed: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  inputSource?: 'student' | 'lecturer' | 'system';
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  classId: string;
  courseName: string;
  meetingNumber: number;
  date: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
  correctionRequested?: boolean;
  correctionReason?: string;
  correctionStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface ConsultationSession {
  id: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  lecturerId: string;
  lecturerName: string;
  topic: string;
  message: string;
  status: 'waiting' | 'scheduled' | 'completed';
  scheduledDate?: string;
  lecturerReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  link: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
}

export interface DemandAnalysisItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  draftDemand: number;
  submittedDemand: number;
  approvedDemand: number;
  totalDemand: number;
  existingClasses: number;
  totalCapacity: number;
  classesNeeded: number;
  shortage: number;
  status: 'Aman' | 'Peringatan' | 'Kritis';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: {
    course1: string;
    course2: string;
    time: string;
  }[];
  prerequisiteIssues: {
    course: string;
    missingPrerequisites: string[];
  }[];
  creditIssue?: {
    current: number;
    max: number;
    excess: number;
  };
}
