import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Col, Form, Row, Select, Statistic, Table, Tag } from "antd";
import { AppLayout } from "../../components/Layout";
import { studentNav } from "../../constants/nav";
import { fetchExams, fetchHome, fetchMyGrades, fetchMySchedule, fetchTerms } from "../../api/entities";
import type { Exam, Grade, ScheduleEntry, Term } from "../../api/types";

const weekdayText = ["-", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const statusTag = (status?: string) => {
  const color = status === "published" ? "green" : status === "submitted" ? "blue" : status === "rejected" ? "red" : "default";
  return <Tag color={color}>{status || "-"}</Tag>;
};

export function StudentDashboard() {
  const { data: home } = useQuery({ queryKey: ["home"], queryFn: () => fetchHome() });
  const schedulePreview = home?.schedule_preview || [];
  const latestGrades = home?.latest_grades || [];

  const scheduleColumns = [
    { title: "星期", dataIndex: "weekday", render: (v: number) => weekdayText[v] || v },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
    { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
    { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
    { title: "地点", dataIndex: "location", render: (v: string) => v || "-" },
  ];

  return (
    <AppLayout navItems={studentNav} title="学生首页" subtitle="课表、考试、成绩概览">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              {[
                { key: "courses", label: "课程总数" },
                { key: "classes", label: "班级数量" },
                { key: "teachers", label: "教师人数" },
                { key: "students", label: "学员人数" },
              ].map((item) => (
                <Col span={6} key={item.key}>
                  <Statistic title={item.label} value={home?.counters?.[item.key] ?? "-"} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={14}>
          <Card title="本周课表预览">
            <Table<ScheduleEntry> rowKey="id" dataSource={schedulePreview} columns={scheduleColumns} pagination={false} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="最近成绩">
            <Table<Grade>
              rowKey="id"
              dataSource={latestGrades}
              pagination={false}
              columns={[
                { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Grade) => v || r.course_id },
                { title: "学期", dataIndex: ["term", "name"], render: (v: string, r: Grade) => v || r.term_id },
                { title: "成绩", dataIndex: "total_score" },
                { title: "状态", dataIndex: "status", render: statusTag },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}

export function StudentSchedulePage() {
  const { data: schedule = [] } = useQuery({ queryKey: ["student-schedule"], queryFn: () => fetchMySchedule() });
  const columns = [
    { title: "星期", dataIndex: "weekday", render: (v: number) => weekdayText[v] || v },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
    { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
    { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
    { title: "地点", dataIndex: "location", render: (v: string) => v || "-" },
  ];

  return (
    <AppLayout navItems={studentNav} title="我的课表">
      <Card>
        <Table<ScheduleEntry> rowKey="id" dataSource={schedule} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>
    </AppLayout>
  );
}

export function StudentGradesPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });
  const { data: grades = [] } = useQuery({
    queryKey: ["student-grades", form.getFieldValue("term_id")],
    queryFn: () => fetchMyGrades({ term_id: form.getFieldValue("term_id") }),
  });

  const columns = [
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Grade) => v || r.course_id },
    { title: "学期", dataIndex: ["term", "name"], render: (v: string, r: Grade) => v || r.term_id },
    { title: "平时", dataIndex: "usual_score" },
    { title: "期末", dataIndex: "final_score" },
    { title: "总评", dataIndex: "total_score" },
    { title: "状态", dataIndex: "status", render: statusTag },
  ];

  return (
    <AppLayout navItems={studentNav} title="我的成绩">
      <Card
        title="成绩列表"
        extra={
          <Form form={form} layout="inline">
            <Form.Item name="term_id">
              <Select
                allowClear
                placeholder="按学期筛选"
                style={{ minWidth: 160 }}
                options={(terms as Term[]).map((t) => ({ value: t.id, label: t.name }))}
                onChange={() => queryClient.invalidateQueries({ queryKey: ["student-grades"] })}
              />
            </Form.Item>
          </Form>
        }
      >
        <Table<Grade> rowKey="id" dataSource={grades} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>
    </AppLayout>
  );
}

export function StudentExamsPage() {
  const { data: exams = [] } = useQuery({ queryKey: ["student-exams"], queryFn: () => fetchExams() });
  const columns = [
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Exam) => v || r.course_id },
    { title: "日期", dataIndex: "exam_date" },
    { title: "时间", render: (_: unknown, r: Exam) => (r.start_time ? `${r.start_time} · ${r.duration_minutes || 0}分钟` : "-") },
    { title: "地点", dataIndex: "location" },
    { title: "类型", dataIndex: "exam_type" },
  ];

  return (
    <AppLayout navItems={studentNav} title="考试安排">
      <Card>
        <Table<Exam> rowKey="id" dataSource={exams} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>
    </AppLayout>
  );
}
