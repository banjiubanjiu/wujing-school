import type { NavItem } from "../components/Layout";

export const adminNav: NavItem[] = [
  { key: "dashboard", label: "概览", path: "/admin/dashboard" },
  { key: "students", label: "学籍/课程", path: "/admin/students" },
  { key: "majors", label: "专业/学期", path: "/admin/majors-terms" },
  { key: "schedule", label: "排课", path: "/admin/schedule" },
  { key: "plans", label: "培养方案", path: "/admin/plans" },
  { key: "grades", label: "成绩审核", path: "/admin/grades" },
  { key: "exams", label: "考试", path: "/admin/exams" },
  { key: "access", label: "账号/权限", path: "/admin/access" },
];

export const teacherNav: NavItem[] = [
  { key: "dashboard", label: "工作台", path: "/teacher/dashboard" },
  { key: "schedule", label: "授课安排", path: "/teacher/schedule" },
  { key: "courses", label: "我的课程", path: "/teacher/courses" },
  { key: "grades", label: "成绩录入", path: "/teacher/grades" },
];

export const studentNav: NavItem[] = [
  { key: "dashboard", label: "首页", path: "/student/dashboard" },
  { key: "schedule", label: "课表", path: "/student/schedule" },
  { key: "grades", label: "成绩", path: "/student/grades" },
  { key: "exams", label: "考试", path: "/student/exams" },
];
