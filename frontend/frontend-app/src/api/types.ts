export interface User {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  org_unit_id?: number;
  active: boolean;
}

export interface OrgUnit {
  id: number;
  name: string;
  unit_type?: string;
  parent_id?: number | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  roles: string[];
}

export interface Term {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
}

export interface MenuItem {
  key: string;
  label: string;
  path: string;
}

export interface MenuResponse {
  roles: string[];
  menus: MenuItem[];
}

export interface ClassItem {
  id: number;
  code: string;
  name: string;
  major_id?: number;
  term_id?: number;
  grade_year?: number;
  advisor_name?: string;
}

export interface Major {
  id: number;
  code: string;
  name: string;
  org_unit_id?: number;
  level?: string;
  degree?: string;
  duration_years?: number;
  parent_id?: number;
  active: boolean;
  description?: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  major_id?: number;
  teacher_id?: number;
  term_id?: number;
  class_id?: number;
  course_type?: string;
  active?: boolean;
  credit?: number;
  weekly_hours?: number;
}

export interface Room {
  id: number;
  code: string;
  name: string;
  building?: string;
  capacity?: number;
  room_type?: string;
  features?: string;
  active: boolean;
}

export interface Student {
  id: number;
  student_no: string;
  status?: string;
  user: User;
  class_info?: ClassItem;
  status_note?: string;
  status_logs?: StudentStatusLog[];
}

export interface Teacher {
  id: number;
  user: User;
  major_id?: number;
  title?: string;
}

export interface StudentStatusLog {
  status: string;
  reason?: string;
  created_at?: string;
}

export interface Exam {
  id: number;
  course_id: number;
  class_id?: number;
  term_id?: number;
  room_id?: number;
  exam_type?: string;
  exam_date?: string;
  start_time?: string;
  duration_minutes?: number;
  location?: string;
  invigilators?: string;
  course?: Course;
  class_info?: ClassItem;
  term?: Term;
  room?: Room;
}

export interface Grade {
  id: number;
  student_id: number;
  course_id: number;
  term_id: number;
  usual_score?: number;
  final_score?: number;
  total_score?: number;
  status: string;
  reviewer?: string;
  course?: Course;
  term?: Term;
  student?: Student;
}

export interface HomeResponse {
  roles: string[];
  counters: Record<string, number>;
  schedule_preview?: ScheduleEntry[];
  latest_grades?: Grade[];
}

export interface TrainingPlanItem {
  id: number;
  course_id?: number;
  course: Course;
  term_no: number;
  weekly_hours: number;
  exam_type?: string;
}

export interface TrainingPlan {
  id: number;
  name: string;
  entry_year: number;
  major_id: number;
  items: TrainingPlanItem[];
}

export interface ScheduleEntry {
  id: number;
  course_id: number;
  class_id?: number;
  teacher_id?: number;
  room_id?: number;
  weekday: number;
  start_slot: number;
  end_slot: number;
  location?: string;
  course?: Course;
  class_info?: ClassItem;
  room?: Room;
}
