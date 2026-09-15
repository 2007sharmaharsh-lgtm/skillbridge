import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../constants';

// Auth & Protected Routes
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import PublicPortfolio from '../pages/student/PublicPortfolio';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import StudentSkills from '../pages/student/StudentSkills';
import StudentQuiz from '../pages/student/StudentQuiz';
import LearningHub from '../pages/student/LearningHub';
import StudentOpportunities from '../pages/student/StudentOpportunities';
import StudentApplications from '../pages/student/StudentApplications';
import StudentSaved from '../pages/student/StudentSaved';

// Academician Page
import AcademicianDashboard from '../pages/academician/AcademicianDashboard';

// Recruiter Pages
import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard';
import RecruiterProfile from '../pages/recruiter/RecruiterProfile';
import OpportunityManager from '../pages/recruiter/OpportunityManager';
import CreateOpportunity from '../pages/recruiter/CreateOpportunity';
import RecruiterApplicants from '../pages/recruiter/RecruiterApplicants';

// Institution Pages
import InstitutionDashboard from '../pages/institution/InstitutionDashboard';
import StudentDirectory from '../pages/institution/StudentDirectory';
import SkillGapAnalysis from '../pages/institution/SkillGapAnalysis';
import PlacementTracker from '../pages/institution/PlacementTracker';
import CurriculumCollaboration from '../pages/institution/CurriculumCollaboration';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/portfolio/:studentId" element={<PublicPortfolio />} />

      {/* STUDENT ROUTES */}
      <Route
        path="/student"
        element={
          <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="skills" element={<StudentSkills />} />
        <Route path="quiz" element={<StudentQuiz />} />
        <Route path="learning" element={<LearningHub />} />
        <Route path="opportunities" element={<StudentOpportunities />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="saved" element={<StudentSaved />} />
      </Route>

      {/* ACADEMICIAN / FACULTY ROUTES */}
      <Route
        path="/academician"
        element={
          <RoleProtectedRoute allowedRoles={[ROLES.ACADEMICIAN, ROLES.STUDENT, ROLES.INSTITUTION_ADMIN]}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/academician/dashboard" replace />} />
        <Route path="dashboard" element={<AcademicianDashboard />} />
        <Route path="curriculum" element={<CurriculumCollaboration />} />
      </Route>

      {/* RECRUITER ROUTES */}
      <Route
        path="/recruiter"
        element={
          <RoleProtectedRoute allowedRoles={[ROLES.RECRUITER]}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="profile" element={<RecruiterProfile />} />
        <Route path="opportunities" element={<OpportunityManager />} />
        <Route path="opportunities/create" element={<CreateOpportunity />} />
        <Route path="applicants" element={<RecruiterApplicants />} />
        <Route path="curriculum" element={<CurriculumCollaboration />} />
      </Route>

      {/* INSTITUTION ADMIN ROUTES */}
      <Route
        path="/institution"
        element={
          <RoleProtectedRoute allowedRoles={[ROLES.INSTITUTION_ADMIN]}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/institution/dashboard" replace />} />
        <Route path="dashboard" element={<InstitutionDashboard />} />
        <Route path="students" element={<StudentDirectory />} />
        <Route path="skill-analysis" element={<SkillGapAnalysis />} />
        <Route path="placements" element={<PlacementTracker />} />
        <Route path="curriculum" element={<CurriculumCollaboration />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

