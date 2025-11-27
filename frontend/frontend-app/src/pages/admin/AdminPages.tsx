import { adminNav } from "../../constants/nav";
import { AppLayout } from "../../components/Layout";
import { DashboardCard } from "./panels/DashboardCard";
import { StudentClassCourse } from "./panels/StudentClassCourse";
import { MajorTerm } from "./panels/MajorTerm";
import { SchedulePanel } from "./panels/SchedulePanel";
import { TrainingPlanPanel } from "./panels/TrainingPlanPanel";
import { GradePanel } from "./panels/GradePanel";
import { ExamPanel } from "./panels/ExamPanel";
import { AccessPanel } from "./panels/AccessPanel";

export function AdminDashboard() {
  return (
    <AppLayout navItems={adminNav} title="教务驾驶舱" subtitle="全局概览">
      <DashboardCard />
    </AppLayout>
  );
}

export function AdminStudentsPage() {
  return (
    <AppLayout navItems={adminNav} title="学籍/课程" subtitle="学生、班级、课程管理">
      <StudentClassCourse />
    </AppLayout>
  );
}

export function AdminMajorsTermsPage() {
  return (
    <AppLayout navItems={adminNav} title="专业与学期" subtitle="学科基础数据维护">
      <MajorTerm />
    </AppLayout>
  );
}

export function AdminSchedulePage() {
  return (
    <AppLayout navItems={adminNav} title="排课与课表" subtitle="按班级/教师查看与创建课表">
      <SchedulePanel />
    </AppLayout>
  );
}

export function AdminTrainingPlansPage() {
  return (
    <AppLayout navItems={adminNav} title="培养方案" subtitle="方案创建与查看">
      <TrainingPlanPanel />
    </AppLayout>
  );
}

export function AdminGradesPage() {
  return (
    <AppLayout navItems={adminNav} title="成绩审核" subtitle="审核、发布课程成绩">
      <GradePanel />
    </AppLayout>
  );
}

export function AdminExamsPage() {
  return (
    <AppLayout navItems={adminNav} title="考试安排" subtitle="考试创建与查询">
      <ExamPanel />
    </AppLayout>
  );
}

export function AdminAccessPage() {
  return (
    <AppLayout navItems={adminNav} title="账号与权限" subtitle="用户、角色与权限管理">
      <AccessPanel />
    </AppLayout>
  );
}
