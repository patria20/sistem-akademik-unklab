import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { RoleRouteGuard } from './RoleRouteGuard';
import { AppLayout } from '../components/layout/AppLayout';

// Public Landing Page & Auth Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';
import { NotFoundPage } from '../pages/auth/NotFoundPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudyPlanPage } from '../pages/student/StudyPlanPage';
import { AcademicProgressPage } from '../pages/student/AcademicProgressPage';
import { GradesPage } from '../pages/student/GradesPage';
import { AttendancePage } from '../pages/student/AttendancePage';
import { SchedulePage } from '../pages/student/SchedulePage';
import { ConsultationPage } from '../pages/student/ConsultationPage';
import { AIAssistantPage } from '../pages/student/AIAssistantPage';

// Lecturer Pages
import { LecturerDashboard } from '../pages/lecturer/LecturerDashboard';
import { KRSApprovalPage } from '../pages/lecturer/KRSApprovalPage';
import { LecturerClassesPage } from '../pages/lecturer/LecturerClassesPage';
import { LecturerAttendancePage } from '../pages/lecturer/LecturerAttendancePage';
import { LecturerGradesPage } from '../pages/lecturer/LecturerGradesPage';
import { LecturerConsultationPage } from '../pages/lecturer/LecturerConsultationPage';
import { LecturerClassAnalysisPage } from '../pages/lecturer/LecturerClassAnalysisPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { CourseDemandAnalyzerPage } from '../pages/admin/CourseDemandAnalyzerPage';
import { AdminCoursesPage } from '../pages/admin/AdminCoursesPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Landing Page at root */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={
                user.role === 'student'
                  ? '/student/dashboard'
                  : user.role === 'lecturer'
                    ? '/lecturer/dashboard'
                    : '/admin/dashboard'
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Academic Portal under AppLayout */}
      <Route element={<AppLayout />}>
        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <RoleRouteGuard allowedRole="student">
              <StudentDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/student/study-plan"
          element={
            <RoleRouteGuard allowedRole="student">
              <StudyPlanPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/student/academic-progress"
          element={
            <RoleRouteGuard allowedRole="student">
              <AcademicProgressPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/student/grades"
          element={
            <RoleRouteGuard allowedRole="student">
              <GradesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <RoleRouteGuard allowedRole="student">
              <AttendancePage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <RoleRouteGuard allowedRole="student">
              <SchedulePage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/student/consultation"
          element={
            <RoleRouteGuard allowedRole="student">
              <ConsultationPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/student/ai-assistant"
          element={
            <RoleRouteGuard allowedRole="student">
              <AIAssistantPage />
            </RoleRouteGuard>
          }
        />

        {/* Lecturer Routes */}
        <Route
          path="/lecturer/dashboard"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <LecturerDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/lecturer/classes"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <LecturerClassesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/lecturer/students"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <LecturerClassesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/lecturer/krs-approval"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <KRSApprovalPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/lecturer/attendance"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <LecturerAttendancePage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/lecturer/grades"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <LecturerGradesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/lecturer/consultation"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <LecturerConsultationPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/lecturer/class-analysis"
          element={
            <RoleRouteGuard allowedRole="lecturer">
              <LecturerClassAnalysisPage />
            </RoleRouteGuard>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleRouteGuard allowedRole="admin">
              <CourseDemandAnalyzerPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminCoursesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/prerequisites"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminCoursesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <RoleRouteGuard allowedRole="admin">
              <CourseDemandAnalyzerPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/students"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/lecturers"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminCoursesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/curriculums"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminCoursesPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <RoleRouteGuard allowedRole="admin">
              <CourseDemandAnalyzerPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleRouteGuard allowedRole="admin">
              <AdminAuditLogsPage />
            </RoleRouteGuard>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
