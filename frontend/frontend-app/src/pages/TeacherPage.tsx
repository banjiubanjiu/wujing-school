import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, InputNumber, Row, Select, Statistic, Table, Tag, message } from "antd";
import { AppLayout } from "../components/Layout";
import { fetchCourses, fetchGrades, fetchHome, fetchMySchedule, submitGrade, upsertGrade } from "../api/entities";
import type { Course, Grade, ScheduleEntry } from "../api/types";

const weekdayText = ["-", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function renderStatus(status?: string) {
  const color = status === "published" ? "green" : status === "submitted" ? "blue" : status === "rejected" ? "red" : "default";
  return <Tag color={color}>{status || "-"}</Tag>;
}

export default function TeacherPage() {
  const queryClient = useQueryClient();
  const [gradeForm] = Form.useForm();

  const { data: home } = useQuery({ queryKey: ["home"], queryFn: () => fetchHome() });
  const { data: schedule = [] } = useQuery({ queryKey: ["teacher-schedule"], queryFn: fetchMySchedule });
  const { data: courses = [] } = useQuery({ queryKey: ["teacher-courses"], queryFn: () => fetchCourses({ mine: true }) });
  const { data: grades = [] } = useQuery({ queryKey: ["teacher-grades"], queryFn: () => fetchGrades({ mine: true }) });

  const upsertGradeMut = useMutation({
    mutationFn: upsertGrade,
    onSuccess: () => {
      message.success("成绩已保存");
      gradeForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["teacher-grades"] });
    },
    onError: (err: any) => message.error(err.message || "保存失败"),
  });

  const submitGradeMut = useMutation({
    mutationFn: submitGrade,
    onSuccess: () => {
      message.success("成绩已提交审核");
      queryClient.invalidateQueries({ queryKey: ["teacher-grades"] });
    },
    onError: (err: any) => message.error(err.message || "提交失败"),
  });

  const scheduleColumns = [
    { title: "星期", dataIndex: "weekday", render: (v: number) => weekdayText[v] || v },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
    { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
    { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
    { title: "地点", dataIndex: "location", render: (v: string) => v || "-" },
  ];

  const courseColumns = [
    { title: "课程", dataIndex: "name" },
    { title: "代码", dataIndex: "code" },
    { title: "班级", dataIndex: "class_id" },
    { title: "学期", dataIndex: "term_id" },
    { title: "学分", dataIndex: "credit" },
  ];

  const gradeColumns = [
    { title: "学生", dataIndex: ["student", "user", "full_name"], render: (v: string, r: Grade) => v || r.student_id },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Grade) => v || r.course_id },
    { title: "平时", dataIndex: "usual_score" },
    { title: "期末", dataIndex: "final_score" },
    { title: "总评", dataIndex: "total_score" },
    { title: "状态", dataIndex: "status", render: renderStatus },
    {
      title: "操作",
      render: (_: unknown, record: Grade) => (
        <Button size="small" type="link" loading={submitGradeMut.isPending} disabled={record.status === "published"} onClick={() => submitGradeMut.mutate({ grade_id: record.id })}>
          提交审核
        </Button>
      ),
    },
  ];

  return (
    <AppLayout
      navItems={[
        { key: "home", label: "首页", path: "/teacher" },
        { key: "schedule", label: "课表", path: "/teacher" },
        { key: "courses", label: "课程", path: "/teacher" },
        { key: "grades", label: "成绩", path: "/teacher" },
      ]}
      title="教师工作台"
      subtitle="快速查看课表、课程与成绩提交"
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              {[
                { key: "courses", label: "课程总数" },
                { key: "classes", label: "班级数量" },
                { key: "students", label: "学员人数" },
                { key: "teachers", label: "教师人数" },
              ].map((item) => (
                <Col span={6} key={item.key}>
                  <Statistic title={item.label} value={home?.counters?.[item.key] ?? "-"} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={14}>
          <Card title="授课安排">
            <Table<ScheduleEntry> rowKey="id" dataSource={schedule} columns={scheduleColumns} pagination={false} />
          </Card>
          <Card title="我的课程" style={{ marginTop: 12 }}>
            <Table<Course> rowKey="id" dataSource={courses} columns={courseColumns} pagination={{ pageSize: 6 }} />
          </Card>
        </Col>

        <Col span={10}>
          <Card title="成绩录入">
            <Form layout="vertical" form={gradeForm} onFinish={upsertGradeMut.mutate}>
              <Form.Item name="student_id" label="学生ID" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="course_id" label="课程ID" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="term_id" label="学期ID" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="usual_score" label="平时成绩" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} />
              </Form.Item>
              <Form.Item name="final_score" label="期末成绩" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} />
              </Form.Item>
              <Form.Item name="status" label="状态" initialValue="draft">
                <Select
                  options={[
                    { value: "draft", label: "草稿" },
                    { value: "submitted", label: "提交审核" },
                  ]}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={upsertGradeMut.isPending} block>
                  保存成绩
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Card title="成绩列表" style={{ marginTop: 12 }}>
            <Table<Grade> rowKey="id" dataSource={grades} columns={gradeColumns} pagination={{ pageSize: 6 }} />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
