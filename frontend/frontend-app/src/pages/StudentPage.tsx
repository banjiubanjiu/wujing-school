import { useQuery } from "@tanstack/react-query";
import { Card, Col, List, Row, Statistic, Table, Tag, Typography } from "antd";
import { AppLayout } from "../components/Layout";
import { fetchExams, fetchHome, fetchMyGrades, fetchMySchedule } from "../api/entities";
import type { Exam, Grade, ScheduleEntry } from "../api/types";

const weekdayText = ["-", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function renderStatus(status?: string) {
  const color = status === "published" ? "green" : status === "submitted" ? "blue" : status === "rejected" ? "red" : "default";
  return <Tag color={color}>{status || "-"}</Tag>;
}

export default function StudentPage() {
  const { data: home } = useQuery({ queryKey: ["home"], queryFn: () => fetchHome() });
  const { data: schedule = [] } = useQuery({ queryKey: ["student-schedule"], queryFn: () => fetchMySchedule() });
  const { data: grades = [] } = useQuery({ queryKey: ["student-grades"], queryFn: () => fetchMyGrades() });
  const { data: exams = [] } = useQuery({ queryKey: ["student-exams"], queryFn: () => fetchExams() });

  const scheduleColumns = [
    { title: "星期", dataIndex: "weekday", render: (v: number) => weekdayText[v] || v },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
    { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
    { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
    { title: "地点", dataIndex: "location", render: (v: string) => v || "-" },
  ];

  const gradeColumns = [
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Grade) => v || r.course_id },
    { title: "学期", dataIndex: ["term", "name"], render: (v: string, r: Grade) => v || r.term_id },
    { title: "平时", dataIndex: "usual_score" },
    { title: "期末", dataIndex: "final_score" },
    { title: "总评", dataIndex: "total_score" },
    { title: "状态", dataIndex: "status", render: renderStatus },
  ];

  const examColumns = [
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Exam) => v || r.course_id },
    { title: "日期", dataIndex: "exam_date" },
    { title: "时间", render: (_: unknown, r: Exam) => (r.start_time ? `${r.start_time} · ${r.duration_minutes || 0}分钟` : "-") },
    { title: "地点", dataIndex: "location" },
    { title: "类型", dataIndex: "exam_type" },
  ];

  return (
    <AppLayout
      navItems={[
        { key: "home", label: "首页", path: "/student" },
        { key: "schedule", label: "课表", path: "/student" },
        { key: "grades", label: "成绩", path: "/student" },
        { key: "exams", label: "考试", path: "/student" },
      ]}
      title="学生首页"
      subtitle="课表、成绩、考试一目了然"
    >
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
          <Card title="我的课表">
            <Table<ScheduleEntry> rowKey="id" dataSource={schedule} columns={scheduleColumns} pagination={false} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="考试安排">
            <Table<Exam> rowKey="id" dataSource={exams} columns={examColumns} pagination={false} />
          </Card>
          <Card title="最近成绩" style={{ marginTop: 12 }}>
            <List<Grade>
              dataSource={home?.latest_grades || []}
              renderItem={(g) => (
                <List.Item>
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong>{g.course?.name || g.course_id}</Typography.Text>
                    <div style={{ color: "#6b7280" }}>{g.term?.name || ""}</div>
                  </div>
                  <div style={{ minWidth: 120, textAlign: "right" }}>
                    <Typography.Text>{g.total_score ?? "-"}</Typography.Text>
                    <div>{renderStatus(g.status)}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="全部成绩">
            <Table<Grade> rowKey="id" dataSource={grades} columns={gradeColumns} pagination={{ pageSize: 8 }} />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
