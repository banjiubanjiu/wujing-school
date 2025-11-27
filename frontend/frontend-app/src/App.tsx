import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useMemo } from "react";
import type { ReactElement } from "react";
import LoginPage from "./pages/Login";
import {
  AdminDashboard,
  AdminStudentsPage,
  AdminMajorsTermsPage,
  AdminSchedulePage,
  AdminTrainingPlansPage,
  AdminGradesPage,
  AdminExamsPage,
} from "./pages/admin/AdminPages";
import { StudentDashboard, StudentSchedulePage, StudentGradesPage, StudentExamsPage } from "./pages/student/StudentPages";
import { TeacherDashboard, TeacherCoursesPage, TeacherSchedulePage, TeacherGradesPage } from "./pages/teacher/TeacherPages";

type RequireAuthProps = { children: ReactElement; role?: string };

function useAuth() {
  const token = localStorage.getItem("token");
  const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  return { token, roles };
}

function RequireAuth({ children, role }: RequireAuthProps) {
  const { token, roles } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && !roles.includes(role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const defaultRoute = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return "/login";
    const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
    if (roles.includes("ADMIN")) return "/admin/dashboard";
    if (roles.includes("TEACHER")) return "/teacher/dashboard";
    if (roles.includes("STUDENT")) return "/student/dashboard";
    return "/login";
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth role="ADMIN">
            <Outlet />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="majors-terms" element={<AdminMajorsTermsPage />} />
        <Route path="schedule" element={<AdminSchedulePage />} />
        <Route path="plans" element={<AdminTrainingPlansPage />} />
        <Route path="grades" element={<AdminGradesPage />} />
        <Route path="exams" element={<AdminExamsPage />} />
      </Route>
      <Route
        path="/teacher"
        element={
          <RequireAuth role="TEACHER">
            <Outlet />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="schedule" element={<TeacherSchedulePage />} />
        <Route path="courses" element={<TeacherCoursesPage />} />
        <Route path="grades" element={<TeacherGradesPage />} />
      </Route>
      <Route
        path="/student"
        element={
          <RequireAuth role="STUDENT">
            <Outlet />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="schedule" element={<StudentSchedulePage />} />
        <Route path="grades" element={<StudentGradesPage />} />
        <Route path="exams" element={<StudentExamsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}
