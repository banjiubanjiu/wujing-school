import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, InputNumber, Row, Select, Statistic, Table, message } from "antd";
import { AppLayout } from "../../components/Layout";
import { Timetable } from "../../components/Timetable";
import { StatusTag } from "../../components/StatusTag";
import { weekdayText } from "../../constants/dates";
import { teacherNav } from "../../constants/nav";
import { fetchCourses, fetchGrades, fetchHome, fetchMySchedule, fetchStudents, fetchTerms, submitGrade, upsertGrade } from "../../api/entities";
import type { Course, Grade, ScheduleEntry, Student, Term } from "../../api/types";

const statusRenderer = (status?: string) => <StatusTag status={status} />;

export function TeacherDashboard() {
  const { data: home, isLoading: homeLoading } = useQuery({ queryKey: ["home"], queryFn: () => fetchHome() });
  const { data: schedule = [], isLoading: scheduleLoading } = useQuery({ queryKey: ["teacher-schedule"], queryFn: () => fetchMySchedule() });
  const { data: courses = [], isLoading: courseLoading } = useQuery({ queryKey: ["teacher-courses"], queryFn: () => fetchCourses({ mine: true }) });

  const scheduleColumns = [
    { title: "星期", dataIndex: "weekday", render: (v: number) => weekdayText[v] || v },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
    { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
    { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
    { title: "地点", dataIndex: "location", render: (v: string, r: ScheduleEntry) => v || r.room?.name || "-" },
  ];

  const courseColumns = [
    { title: "课程", dataIndex: "name" },
    { title: "代码", dataIndex: "code" },
    { title: "班级", dataIndex: "class_id" },
    { title: "学期", dataIndex: "term_id" },
    { title: "学分", dataIndex: "credit" },
  ];

  return (
    <AppLayout navItems={teacherNav} title="教师工作台" subtitle="快速查看课表与课程">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={homeLoading}>
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
            <Table<ScheduleEntry> rowKey="id" dataSource={schedule} columns={scheduleColumns} pagination={false} loading={scheduleLoading} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="我的课程">
            <Table<Course> rowKey="id" dataSource={courses} columns={courseColumns} pagination={{ pageSize: 8 }} loading={courseLoading} />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}

export function TeacherSchedulePage() {
  const { data: schedule = [], isLoading } = useQuery({ queryKey: ["teacher-schedule"], queryFn: () => fetchMySchedule() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });
  const [termForm] = Form.useForm();
  const watchedTermId = Form.useWatch("term_id", termForm);
  const selectedTermId = watchedTermId || (terms as Term[]).find((t) => t.is_current)?.id;
  const filteredSchedule = useMemo(
    () =>
      (schedule as ScheduleEntry[]).filter((s) => {
        const termId = s.course?.term_id;
        return !selectedTermId || !termId || termId === selectedTermId;
      }),
    [schedule, selectedTermId]
  );
  return (
    <AppLayout navItems={teacherNav} title="授课安排">
      <Row gutter={16}>
        <Col span={16}>
          <Timetable schedule={filteredSchedule as ScheduleEntry[]} title="周课程表" />
        </Col>
        <Col span={8}>
          <Card
            title="列表视图"
            extra={
              <Form layout="inline" form={termForm} initialValues={{ term_id: selectedTermId }}>
                <Form.Item name="term_id" style={{ marginBottom: 0 }}>
                  <Select
                    allowClear
                    placeholder="按学期筛选"
                    style={{ minWidth: 160 }}
                    options={(terms as Term[]).map((t) => ({ value: t.id, label: t.name }))}
                    onChange={() => termForm.submit()}
                  />
                </Form.Item>
              </Form>
            }
          >
            <Table<ScheduleEntry>
              rowKey="id"
              dataSource={filteredSchedule}
              columns={[
                { title: "星期", dataIndex: "weekday", render: (v: number) => weekdayText[v] || v },
                { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
                { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
                { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
                { title: "地点", render: (_: unknown, r: ScheduleEntry) => r.room?.name || r.location || "-" },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}

export function TeacherCoursesPage() {
  const { data: courses = [], isLoading } = useQuery({ queryKey: ["teacher-courses"], queryFn: () => fetchCourses({ mine: true }) });
  const columns = [
    { title: "课程", dataIndex: "name" },
    { title: "代码", dataIndex: "code" },
    { title: "班级", dataIndex: "class_id" },
    { title: "学期", dataIndex: "term_id" },
    { title: "学分", dataIndex: "credit" },
    { title: "类型", dataIndex: "course_type" },
  ];

  return (
    <AppLayout navItems={teacherNav} title="我的课程">
      <Card>
        <Table<Course> rowKey="id" dataSource={courses} columns={columns} pagination={{ pageSize: 10 }} loading={isLoading} />
      </Card>
    </AppLayout>
  );
}

export function TeacherGradesPage() {
  const queryClient = useQueryClient();
  const [gradeForm] = Form.useForm();
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);

  const { data: courses = [] } = useQuery({ queryKey: ["teacher-courses"], queryFn: () => fetchCourses({ mine: true }) });
  const { data: grades = [], isLoading: gradesLoading } = useQuery({ queryKey: ["teacher-grades"], queryFn: () => fetchGrades({ mine: true }) });
  const selectedCourse = useMemo(() => (courses as Course[]).find((c) => c.id === selectedCourseId), [courses, selectedCourseId]);
  const classId = selectedCourse?.class_id;

  const { data: students = [] } = useQuery({
    queryKey: ["teacher-grade-students", classId],
    queryFn: () => fetchStudents({ class_id: classId }),
    enabled: Boolean(classId),
  });
  const courseOptions = useMemo(
    () =>
      (courses as Course[]).map((c) => ({
        value: c.id,
        label: `${c.name} (${c.id})${c.class_id ? ` · 班级${c.class_id}` : " · 无班级"}`,
        disabled: !c.class_id,
      })),
    [courses]
  );
  const studentOptions = useMemo(
    () =>
      (students as Student[]).map((s) => ({
        value: s.id,
        label: `${s.user.full_name} (${s.student_no})`,
      })),
    [students]
  );

  useEffect(() => {
    if (selectedCourse) {
      gradeForm.setFieldsValue({
        course_id: selectedCourse.id,
        term_id: selectedCourse.term_id,
      });
    }
  }, [selectedCourse, gradeForm]);
  useEffect(() => {
    gradeForm.setFieldValue("student_id", undefined);
  }, [classId, gradeForm]);

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

  const columns = [
    { title: "学生", dataIndex: ["student", "user", "full_name"], render: (v: string, r: Grade) => v || r.student_id },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Grade) => v || r.course_id },
    { title: "平时", dataIndex: "usual_score" },
    { title: "期末", dataIndex: "final_score" },
    { title: "总评", dataIndex: "total_score" },
    { title: "状态", dataIndex: "status", render: statusRenderer },
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
    <AppLayout navItems={teacherNav} title="成绩录入" subtitle="录入并提交审核">
      <Row gutter={16}>
        <Col span={10}>
          <Card title="录入成绩">
            <Form layout="vertical" form={gradeForm} onFinish={upsertGradeMut.mutate}>
              <Form.Item name="course_id" label="课程" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  placeholder="选择课程"
                  options={courseOptions}
                  onChange={(val) => {
                    setSelectedCourseId(val || undefined);
                    if (!val) {
                      gradeForm.setFieldsValue({ term_id: undefined, student_id: undefined });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item name="term_id" label="学期ID" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} disabled placeholder="随课程自动填充" />
              </Form.Item>
              <Form.Item name="student_id" label="学生" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={classId ? "选择学生" : "先选择课程/班级"}
                  options={studentOptions}
                  disabled={!classId}
                />
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
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={14}>
          <Card title="成绩列表">
            <Table<Grade> rowKey="id" dataSource={grades} columns={columns} pagination={{ pageSize: 10 }} loading={gradesLoading || submitGradeMut.isPending} />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
