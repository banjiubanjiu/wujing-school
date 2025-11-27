import { api } from "./client";
import type {
  Term,
  Student,
  ClassItem,
  Course,
  Major,
  Exam,
  Grade,
  MenuResponse,
  HomeResponse,
  TrainingPlan,
  ScheduleEntry,
  OrgUnit,
  Teacher,
  Room,
  RoleWithPermissions,
  Permission,
  UserDetail,
} from "./types";

export async function fetchHome(): Promise<HomeResponse> {
  const res = await api.get("/api/home");
  return res.data;
}

export async function fetchMe() {
  const res = await api.get("/auth/me");
  return res.data;
}

export async function fetchStudents(params?: { q?: string; class_id?: number }) {
  const res = await api.get<Student[]>("/api/students", { params });
  return res.data;
}

export async function fetchClasses() {
  const res = await api.get<ClassItem[]>("/api/classes");
  return res.data;
}

export async function createClass(payload: {
  code: string;
  name: string;
  major_id: number;
  term_id: number;
  grade_year?: number;
}) {
  const res = await api.post("/api/classes", payload);
  return res.data as ClassItem;
}

export async function fetchCourses(params?: { term_id?: number; mine?: boolean }) {
  const res = await api.get<Course[]>("/api/courses", { params });
  return res.data;
}

export async function createCourse(payload: {
  code: string;
  name: string;
  major_id: number;
  term_id: number;
  teacher_id?: number;
  class_id?: number;
  course_type?: string;
}) {
  const res = await api.post("/api/courses", payload);
  return res.data as Course;
}

export async function fetchMajors() {
  const res = await api.get<Major[]>("/api/majors");
  return res.data;
}

export async function fetchTeachers(params?: { major_id?: number }) {
  const res = await api.get<Teacher[]>("/api/teachers", { params });
  return res.data;
}

export async function fetchOrgUnits() {
  const res = await api.get<OrgUnit[]>("/api/orgs");
  return res.data;
}

export async function createMajor(payload: {
  code: string;
  name: string;
  level?: string;
  degree?: string;
  duration_years?: number;
  org_unit_id?: number;
  parent_id?: number;
  description?: string;
  active?: boolean;
}) {
  const res = await api.post("/api/majors", payload);
  return res.data as Major;
}

export async function updateMajor(id: number, payload: Partial<Major>) {
  const res = await api.put(`/api/majors/${id}`, payload);
  return res.data as Major;
}

export async function fetchTerms() {
  const res = await api.get<Term[]>("/api/terms");
  return res.data;
}

export async function createTerm(payload: { name: string; start_date?: string; end_date?: string; is_current?: boolean }) {
  const res = await api.post("/api/terms", payload);
  return res.data as Term;
}

export async function updateTerm(id: number, payload: Partial<Term>) {
  const res = await api.put(`/api/terms/${id}`, payload);
  return res.data as Term;
}

export async function fetchTrainingPlans(params?: { major_id?: number; entry_year?: number }) {
  const res = await api.get<TrainingPlan[]>("/api/training-plans", { params });
  return res.data;
}

export async function createTrainingPlan(payload: { name: string; entry_year: number; major_id: number; item_course_ids: number[] }) {
  const res = await api.post("/api/training-plans", payload);
  return res.data as TrainingPlan;
}

export async function cloneTrainingPlan(planId: number, params: { entry_year: number; name?: string }) {
  const res = await api.post(`/api/training-plans/${planId}/clone`, null, { params });
  return res.data as TrainingPlan;
}

export async function fetchExams(params?: { course_id?: number; class_id?: number; term_id?: number }) {
  const res = await api.get<Exam[]>("/api/exams", { params });
  return res.data;
}

export async function fetchMyExams() {
  const res = await api.get<Exam[]>("/api/exams/my");
  return res.data;
}

export async function createExam(payload: {
  course_id: number;
  class_id?: number;
  term_id?: number;
  exam_type?: string;
  exam_date?: string;
  start_time?: string;
  duration_minutes?: number;
  location?: string;
  invigilators?: string;
}) {
  const res = await api.post("/api/exams", payload);
  return res.data as Exam;
}

export async function fetchGrades(params?: { course_id?: number; class_id?: number; status_filter?: string; mine?: boolean }) {
  const res = await api.get<Grade[]>("/api/grades", { params });
  return res.data;
}

export async function fetchMyGrades(params?: { term_id?: number }) {
  const res = await api.get<Grade[]>("/api/grades/my", { params });
  return res.data;
}

export async function upsertGrade(payload: {
  student_id: number;
  course_id: number;
  term_id: number;
  usual_score: number;
  final_score: number;
  status?: string;
}) {
  const res = await api.post("/api/grades", payload);
  return res.data as Grade;
}

export async function submitGrade(payload: { grade_id: number; comment?: string }) {
  const res = await api.post("/api/grades/submit", payload);
  return res.data;
}

export async function reviewGrade(payload: { grade_id: number; approve: boolean; comment?: string }) {
  const res = await api.post("/api/grades/review", payload);
  return res.data;
}

export async function publishGrades(payload: { course_id: number; reviewer?: string }) {
  const res = await api.post("/api/grades/publish", payload);
  return res.data;
}

export async function fetchSchedule(params?: { class_id?: number; teacher_id?: number }) {
  const res = await api.get<ScheduleEntry[]>("/api/schedule", { params });
  return res.data;
}

export async function fetchMySchedule() {
  const res = await api.get<ScheduleEntry[]>("/api/schedule/my");
  return res.data;
}

export async function createScheduleEntry(payload: {
  course_id: number;
  class_id?: number;
  teacher_id?: number;
  room_id?: number;
  weekday: number;
  start_slot: number;
  end_slot: number;
  location?: string;
}) {
  const res = await api.post("/api/schedule", payload);
  return res.data as ScheduleEntry;
}

export async function updateScheduleEntry(
  id: number,
  payload: Partial<{
    course_id: number;
    class_id?: number;
    teacher_id?: number;
    room_id?: number;
    weekday: number;
    start_slot: number;
    end_slot: number;
    location?: string;
  }>
) {
  const res = await api.put(`/api/schedule/${id}`, payload);
  return res.data as ScheduleEntry;
}

export async function deleteScheduleEntry(id: number) {
  const res = await api.delete(`/api/schedule/${id}`);
  return res.data;
}

export async function fetchRooms(params?: { q?: string; room_type?: string; active?: boolean }) {
  const res = await api.get<Room[]>("/api/rooms", { params });
  return res.data;
}

export async function createRoom(payload: {
  code: string;
  name: string;
  building?: string;
  room_type?: string;
  capacity?: number;
  features?: string;
}) {
  const res = await api.post<Room>("/api/rooms", payload);
  return res.data;
}

export async function fetchMenus(): Promise<MenuResponse> {
  const res = await api.get("/api/menus");
  return res.data;
}

export async function fetchPermissions() {
  const res = await api.get<Permission[]>("/api/permissions");
  return res.data;
}

export async function fetchRoles() {
  const res = await api.get<RoleWithPermissions[]>("/api/roles");
  return res.data;
}

export async function updateRolePermissions(roleId: number, permissions: string[]) {
  const res = await api.put<RoleWithPermissions>(`/api/roles/${roleId}/permissions`, { permissions });
  return res.data;
}

export async function fetchUsers(params?: { q?: string; role_code?: string; active?: boolean }) {
  const res = await api.get<UserDetail[]>("/api/users", { params });
  return res.data;
}

export async function createUser(payload: {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  org_unit_id?: number;
  role_codes?: string[];
}) {
  const res = await api.post<UserDetail>("/api/users", { ...payload, role_codes: payload.role_codes || [] });
  return res.data;
}

export async function updateUserRoles(userId: number, role_codes: string[]) {
  const res = await api.put<UserDetail>(`/api/users/${userId}/roles`, { role_codes });
  return res.data;
}

export async function resetUserPassword(userId: number, password: string) {
  const res = await api.post(`/api/users/${userId}/reset-password`, { password });
  return res.data;
}

export async function askAssistant(payload: { prompt: string; task?: string; params?: Record<string, any> }) {
  const res = await api.post("/api/ai/assistant", payload);
  return res.data as { answer: string; used_prompt: string };
}
