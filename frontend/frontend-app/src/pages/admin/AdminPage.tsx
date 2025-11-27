import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../components/Layout";
import { Timetable } from "../../components/Timetable";
import {
  createClass,
  createCourse,
  createExam,
  createMajor,
  createScheduleEntry,
  createTerm,
  createTrainingPlan,
  fetchClasses,
  fetchCourses,
  fetchExams,
  fetchGrades,
  fetchHome,
  fetchMajors,
  fetchTeachers,
  fetchSchedule,
  fetchStudents,
  fetchTerms,
  fetchTrainingPlans,
  publishGrades,
  reviewGrade,
  updateMajor,
  updateTerm,
} from "../../api/entities";
import type {
  ClassItem,
  Course,
  Exam,
  Grade,
  Major,
  ScheduleEntry,
  Student,
  Term,
  TrainingPlan,
  Teacher,
} from "../../api/types";

const PAGE_SIZE = 8;

export default function AdminPage() {
  return (
    <AppLayout
      navItems={[
        { key: "dash", label: "概览", path: "/admin" },
        { key: "students", label: "学籍", path: "/admin" },
        { key: "courses", label: "课程", path: "/admin" },
        { key: "schedule", label: "排课", path: "/admin" },
        { key: "grades", label: "成绩", path: "/admin" },
        { key: "exams", label: "考试", path: "/admin" },
      ]}
      title="教务驾驶舱"
      subtitle="P1 核心数据"
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <DashboardCard />
        </Col>
        <Col span={24}>
          <Tabs
            defaultActiveKey="students"
            items={[
              { key: "students", label: "学籍/班级/课程", children: <StudentClassCourse /> },
              { key: "majors_terms", label: "专业/学期", children: <MajorTerm /> },
              { key: "schedule", label: "排课", children: <SchedulePanel /> },
              { key: "plans", label: "培养方案", children: <TrainingPlanPanel /> },
              { key: "grades", label: "成绩审核", children: <GradePanel /> },
              { key: "exams", label: "考试", children: <ExamPanel /> },
            ]}
          />
        </Col>
      </Row>
    </AppLayout>
  );
}

export function DashboardCard() {
  const { data } = useQuery({ queryKey: ["home"], queryFn: () => fetchHome() });
  const counters = data?.counters || {};
  return (
    <Row gutter={16}>
      {[
        { key: "students", label: "学员" },
        { key: "teachers", label: "教师" },
        { key: "classes", label: "班级" },
        { key: "courses", label: "教学门数" },
      ].map((item) => (
        <Col key={item.key} span={6}>
          <Card>
            <Statistic title={item.label} value={counters[item.key] ?? "-"} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export function StudentClassCourse() {
  const [classForm] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ["students", filterForm.getFieldValue("q"), filterForm.getFieldValue("class_id")],
    queryFn: () =>
      fetchStudents({
        q: filterForm.getFieldValue("q") || undefined,
        class_id: filterForm.getFieldValue("class_id") ? Number(filterForm.getFieldValue("class_id")) : undefined,
      }),
  });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: majors = [] } = useQuery({ queryKey: ["majors"], queryFn: () => fetchMajors() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => fetchTeachers() });
  const courseMajorId = Form.useWatch("major_id", courseForm);
  const courseTermId = Form.useWatch("term_id", courseForm);

  const classOptions = useMemo(() => classes.map((c) => ({ value: c.id, label: `${c.name} (${c.id})` })), [classes]);
  const filteredCourseClassOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.id})`,
        disabled: (courseMajorId && c.major_id !== courseMajorId) || (courseTermId && c.term_id !== courseTermId),
      })),
    [classes, courseMajorId, courseTermId]
  );
  const majorOptions = useMemo(() => majors.map((m) => ({ value: m.id, label: m.name })), [majors]);
  const termOptions = useMemo(() => terms.map((t) => ({ value: t.id, label: t.name })), [terms]);
  const teacherOptions = useMemo(
    () => (teachers as Teacher[]).map((t) => ({ value: t.id, label: `${t.user.full_name} (${t.id})` })),
    [teachers]
  );

  const createClassMut = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      message.success("班级创建成功");
      classForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const createCourseMut = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      message.success("课程创建成功");
      courseForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const studentColumns = [
    { title: "学号", dataIndex: "student_no" },
    { title: "姓名", dataIndex: ["user", "full_name"] },
    { title: "班级", dataIndex: ["class_info", "name"] },
    { title: "状态", dataIndex: "status" },
  ];

  const classColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "代码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    {
      title: "专业",
      dataIndex: "major_id",
      render: (v: number) => majors.find((m) => m.id === v)?.name || v,
    },
    {
      title: "学期",
      dataIndex: "term_id",
      render: (v: number) => terms.find((t) => t.id === v)?.name || v,
    },
    { title: "年级", dataIndex: "grade_year" },
  ];

  const courseColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "代码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    {
      title: "专业",
      dataIndex: "major_id",
      render: (v: number) => majors.find((m) => m.id === v)?.name || v,
    },
    {
      title: "学期",
      dataIndex: "term_id",
      render: (v: number) => terms.find((t) => t.id === v)?.name || v,
    },
    {
      title: "教师",
      dataIndex: "teacher_id",
      render: (v: number) => (teachers as Teacher[]).find((t) => t.id === v)?.user.full_name || v,
    },
    { title: "班级", dataIndex: "class_id" },
    { title: "类型", dataIndex: "course_type" },
  ];

  return (
    <Row gutter={16}>
      <Col span={24}>
        <Card
          title="学籍列表"
          extra={
            <Form form={filterForm} layout="inline">
              <Form.Item name="q">
                <Input placeholder="学号/姓名" allowClear />
              </Form.Item>
              <Form.Item name="class_id">
                <Select
                  showSearch
                  optionFilterProp="label"
                  style={{ minWidth: 160 }}
                  allowClear
                  placeholder="班级"
                  options={classOptions}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={() => queryClient.invalidateQueries({ queryKey: ["students"] })}>
                  筛选
                </Button>
              </Form.Item>
            </Form>
          }
        >
          <Table<Student> rowKey="id" dataSource={students} columns={studentColumns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="班级列表" extra="创建班级">
          <Form form={classForm} layout="inline" onFinish={createClassMut.mutate} style={{ marginBottom: 12 }}>
            <Form.Item name="code" rules={[{ required: true, message: "代码必填" }]}>
              <Input placeholder="代码" />
            </Form.Item>
            <Form.Item name="name" rules={[{ required: true }]}>
              <Input placeholder="名称" />
            </Form.Item>
            <Form.Item name="major_id" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 160 }}
                placeholder="专业"
                options={majorOptions}
              />
            </Form.Item>
            <Form.Item name="term_id" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 160 }}
                placeholder="学期"
                options={termOptions}
              />
            </Form.Item>
            <Form.Item name="grade_year">
              <InputNumber placeholder="年级" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createClassMut.isPending}>
                创建
              </Button>
            </Form.Item>
          </Form>
          <Table<ClassItem> rowKey="id" dataSource={classes} columns={classColumns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="课程列表" extra="创建课程">
          <Form form={courseForm} layout="inline" onFinish={createCourseMut.mutate} style={{ marginBottom: 12 }}>
            <Form.Item name="code" rules={[{ required: true }]}>
              <Input placeholder="代码" />
            </Form.Item>
            <Form.Item name="name" rules={[{ required: true }]}>
              <Input placeholder="名称" />
            </Form.Item>
            <Form.Item name="major_id" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 160 }}
                placeholder="专业"
                options={majorOptions}
              />
            </Form.Item>
            <Form.Item name="term_id" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 160 }}
                placeholder="学期"
                options={termOptions}
              />
            </Form.Item>
            <Form.Item name="teacher_id">
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                placeholder="教师"
                style={{ width: 180 }}
                options={teacherOptions}
              />
            </Form.Item>
            <Form.Item name="class_id">
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 180 }}
                allowClear
                placeholder="教学班"
                options={filteredCourseClassOptions}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createCourseMut.isPending}>
                创建
              </Button>
            </Form.Item>
          </Form>
          <Table<Course> rowKey="id" dataSource={courses} columns={courseColumns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
      </Col>
    </Row>
  );
}

export function MajorTerm() {
  const [majorForm] = Form.useForm();
  const [majorEditForm] = Form.useForm();
  const [termForm] = Form.useForm();
  const [termEditForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: majors = [] } = useQuery({ queryKey: ["majors"], queryFn: () => fetchMajors() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });

  const createMajorMut = useMutation({
    mutationFn: createMajor,
    onSuccess: () => {
      message.success("专业创建成功");
      majorForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const updateMajorMut = useMutation({
    mutationFn: (payload: { id: number; data: Partial<Major> }) => updateMajor(payload.id, payload.data),
    onSuccess: () => {
      message.success("专业更新成功");
      majorEditForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const createTermMut = useMutation({
    mutationFn: createTerm,
    onSuccess: () => {
      message.success("学期创建成功");
      termForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const updateTermMut = useMutation({
    mutationFn: (payload: { id: number; data: Partial<Term> }) => updateTerm(payload.id, payload.data),
    onSuccess: () => {
      message.success("学期更新成功");
      termEditForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const majorColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "代码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    { title: "层级", dataIndex: "level" },
    { title: "学位", dataIndex: "degree" },
    { title: "学制", dataIndex: "duration_years" },
    {
      title: "状态",
      dataIndex: "active",
      render: (v: boolean) => <Tag color={v ? "green" : "orange"}>{v ? "启用" : "停用"}</Tag>,
    },
  ];

  const termColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "名称", dataIndex: "name" },
    { title: "开始", dataIndex: "start_date" },
    { title: "结束", dataIndex: "end_date" },
    {
      title: "当前",
      dataIndex: "is_current",
      render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "是" : "否"}</Tag>,
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="专业列表" extra={`共${majors.length} 个`}>
          <Table<Major> rowKey="id" dataSource={majors} columns={majorColumns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
        <Card title="新增专业" style={{ marginTop: 12 }}>
          <Form layout="vertical" form={majorForm} onFinish={createMajorMut.mutate}>
            <Form.Item name="code" label="代码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="level" label="层级">
              <Input />
            </Form.Item>
            <Form.Item name="degree" label="学位">
              <Input />
            </Form.Item>
            <Form.Item name="duration_years" label="学制(年)">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="description" label="简介">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createMajorMut.isPending}>
                创建
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <Card title="编辑专业" style={{ marginTop: 12 }}>
          <Form
            layout="vertical"
            form={majorEditForm}
            onFinish={(vals) =>
              updateMajorMut.mutate({
                id: Number(vals.id),
                data: { ...vals, id: undefined },
              })
            }
          >
            <Form.Item name="id" label="major_id" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="name" label="名称">
              <Input />
            </Form.Item>
            <Form.Item name="level" label="层级">
              <Input />
            </Form.Item>
            <Form.Item name="degree" label="学位">
              <Input />
            </Form.Item>
            <Form.Item name="duration_years" label="学制(年)">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="description" label="简介">
              <Input />
            </Form.Item>
            <Form.Item name="active" label="启用">
              <Select
                allowClear
                options={[
                  { value: true, label: "启用" },
                  { value: false, label: "停用" },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updateMajorMut.isPending}>
                更新
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="学期列表" extra={`共${terms.length} 个`}>
          <Table<Term> rowKey="id" dataSource={terms} columns={termColumns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
        <Card title="新增学期" style={{ marginTop: 12 }}>
          <Form layout="vertical" form={termForm} onFinish={createTermMut.mutate}>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="start_date" label="开始日期">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="end_date" label="结束日期">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="is_current" valuePropName="checked">
              <Checkbox>设为当前</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createTermMut.isPending}>
                创建
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <Card title="编辑学期" style={{ marginTop: 12 }}>
          <Form
            layout="vertical"
            form={termEditForm}
            onFinish={(vals) => updateTermMut.mutate({ id: Number(vals.id), data: { ...vals, id: undefined } })}
          >
            <Form.Item name="id" label="term_id" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="name" label="名称">
              <Input />
            </Form.Item>
            <Form.Item name="start_date" label="开始日期">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="end_date" label="结束日期">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="is_current" valuePropName="checked">
              <Checkbox>设为当前</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updateTermMut.isPending}>
                更新
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export function GradePanel() {
  const [filterForm] = Form.useForm();
  const [publishForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses() });
  const filterCourseId = Form.useWatch("course_id", filterForm);
  const selectedFilterCourse = useMemo(
    () => (courses as Course[]).find((c) => c.id === filterCourseId),
    [courses, filterCourseId]
  );
  const courseOptions = useMemo(
    () => (courses as Course[]).map((c) => ({ value: c.id, label: `${c.name} (${c.id})` })),
    [courses]
  );
  const gradeClassOptions = useMemo(
    () =>
      (classes as ClassItem[]).map((c) => ({
        value: c.id,
        label: `${c.name} (${c.id})`,
        disabled: Boolean(
          (selectedFilterCourse?.class_id && c.id !== selectedFilterCourse.class_id) ||
            (selectedFilterCourse?.major_id && c.major_id !== selectedFilterCourse.major_id)
        ),
      })),
    [classes, selectedFilterCourse]
  );
  const { data: grades = [] } = useQuery({
    queryKey: ["grades", filterForm.getFieldValue("course_id"), filterForm.getFieldValue("class_id"), filterForm.getFieldValue("status_filter")],
    queryFn: () =>
      fetchGrades({
        course_id: filterForm.getFieldValue("course_id"),
        class_id: filterForm.getFieldValue("class_id"),
        status_filter: filterForm.getFieldValue("status_filter"),
      }),
  });

  const reviewMut = useMutation({
    mutationFn: reviewGrade,
    onSuccess: () => {
      message.success("审核完成");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (err: any) => message.error(err.message || "审核失败"),
  });

  const publishMut = useMutation({
    mutationFn: publishGrades,
    onSuccess: () => {
      message.success("课程成绩已发布");
      publishForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (err: any) => message.error(err.message || "发布失败"),
  });

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Grade) => v || r.course_id },
    { title: "学生", dataIndex: ["student", "user", "full_name"], render: (v: string, r: Grade) => v || r.student_id },
    { title: "班级", dataIndex: ["student", "class_info", "name"] },
    { title: "平时", dataIndex: "usual_score" },
    { title: "期末", dataIndex: "final_score" },
    { title: "总评", dataIndex: "total_score" },
    {
      title: "状态",
      dataIndex: "status",
      render: (v: string) => <Tag color={v === "published" ? "green" : v === "submitted" ? "blue" : v === "rejected" ? "red" : "orange"}>{v}</Tag>,
    },
    {
      title: "操作",
      render: (_: unknown, record: Grade) => (
        <Space>
          <Button size="small" type="link" disabled={record.status === "published"} loading={reviewMut.isPending} onClick={() => reviewMut.mutate({ grade_id: record.id, approve: true })}>
            通过
          </Button>
          <Button size="small" type="link" danger disabled={record.status === "published"} loading={reviewMut.isPending} onClick={() => reviewMut.mutate({ grade_id: record.id, approve: false })}>
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="成绩列表"
      extra={
        <Space>
          <Form form={filterForm} layout="inline">
            <Form.Item name="course_id">
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                placeholder="选择课程"
                style={{ minWidth: 200 }}
                options={courseOptions}
              />
            </Form.Item>
            <Form.Item name="class_id">
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                placeholder="班级"
                style={{ minWidth: 160 }}
                options={gradeClassOptions}
              />
            </Form.Item>
            <Form.Item name="status_filter">
              <Input placeholder="状态 draft/submitted/published" allowClear />
            </Form.Item>
            <Form.Item>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["grades"] })}>筛选</Button>
            </Form.Item>
          </Form>
          <Form form={publishForm} layout="inline" onFinish={publishMut.mutate}>
            <Form.Item name="course_id" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="选择课程发布"
                style={{ minWidth: 200 }}
                options={courseOptions}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={publishMut.isPending}>
                发布
              </Button>
            </Form.Item>
          </Form>
        </Space>
      }
    >
      <Table<Grade> rowKey="id" dataSource={grades} columns={columns} pagination={{ pageSize: PAGE_SIZE }} />
    </Card>
  );
}

export function SchedulePanel() {
  const [filterForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const queryClient = useQueryClient();
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => fetchTeachers() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });
  const selectedScheduleCourseId = Form.useWatch("course_id", createForm);
  const selectedScheduleCourse = useMemo(
    () => (courses as Course[]).find((c) => c.id === selectedScheduleCourseId),
    [courses, selectedScheduleCourseId]
  );
  const scheduleCourseOptions = useMemo(
    () => (courses as Course[]).map((c) => ({ value: c.id, label: `${c.name} (${c.id})` })),
    [courses]
  );
  const scheduleClassOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.id})`,
        disabled: Boolean(
          (selectedScheduleCourse?.class_id && c.id !== selectedScheduleCourse.class_id) ||
            (selectedScheduleCourse?.major_id && c.major_id !== selectedScheduleCourse.major_id) ||
            (selectedScheduleCourse?.term_id && c.term_id !== selectedScheduleCourse.term_id)
        ),
      })),
    [classes, selectedScheduleCourse]
  );
  const scheduleFilterClassOptions = useMemo(
    () => classes.map((c) => ({ value: c.id, label: `${c.name} (${c.id})` })),
    [classes]
  );
  const scheduleTeacherOptions = useMemo(
    () => (teachers as Teacher[]).map((t) => ({ value: t.id, label: `${t.user.full_name} (${t.id})` })),
    [teachers]
  );
  const scheduleTermOptions = useMemo(() => (terms as Term[]).map((t) => ({ value: t.id, label: t.name })), [terms]);
  const filterTermId = Form.useWatch("term_id", filterForm);
  const { data: schedule = [] } = useQuery({
    queryKey: ["schedule", filterForm.getFieldValue("class_id"), filterForm.getFieldValue("teacher_id")],
    queryFn: () =>
      fetchSchedule({
        class_id: filterForm.getFieldValue("class_id"),
        teacher_id: filterForm.getFieldValue("teacher_id"),
      }),
  });
  const filteredSchedule = useMemo(
    () =>
      (schedule as ScheduleEntry[]).filter((s) => {
        const termId = s.course?.term_id;
        return !filterTermId || !termId || termId === filterTermId;
      }),
    [schedule, filterTermId]
  );

  const createMut = useMutation({
    mutationFn: createScheduleEntry,
    onSuccess: () => {
      message.success("排课成功");
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
    onError: (err: any) => message.error(err.message || "创建失败"),
  });

  const columns = [
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
    { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
    { title: "星期", dataIndex: "weekday" },
    { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
    { title: "地点", dataIndex: "location" },
    {
      title: "教师",
      dataIndex: "teacher_id",
      render: (v: number) => (teachers as Teacher[]).find((t) => t.id === v)?.user.full_name || v,
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={14}>
        <Card
          title="课表"
          extra={
            <Form form={filterForm} layout="inline">
              <Form.Item name="class_id">
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="班级"
                  allowClear
                  style={{ minWidth: 160 }}
                  options={scheduleFilterClassOptions}
                />
              </Form.Item>
              <Form.Item name="teacher_id">
                <Select
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  placeholder="教师"
                  style={{ minWidth: 160 }}
                  options={scheduleTeacherOptions}
                />
              </Form.Item>
              <Form.Item name="term_id">
                <Select
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  placeholder="学期"
                  style={{ minWidth: 160 }}
                  options={scheduleTermOptions}
                />
              </Form.Item>
              <Form.Item>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["schedule"] })}>筛选</Button>
              </Form.Item>
            </Form>
          }
        >
          <div style={{ marginBottom: 12 }}>
            <Timetable schedule={filteredSchedule as ScheduleEntry[]} title="周视图" />
          </div>
          <Table<ScheduleEntry> rowKey="id" dataSource={filteredSchedule} columns={columns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
      </Col>
      <Col span={10}>
        <Card title="创建排课">
          <Form layout="vertical" form={createForm} onFinish={createMut.mutate}>
            <Form.Item name="course_id" label="课程" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={scheduleCourseOptions} />
            </Form.Item>
            <Form.Item name="class_id" label="班级">
              <Select showSearch optionFilterProp="label" allowClear options={scheduleClassOptions} />
            </Form.Item>
            <Form.Item name="teacher_id" label="教师">
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                options={scheduleTeacherOptions}
              />
            </Form.Item>
            <Form.Item name="weekday" label="星期" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={1} max={7} />
            </Form.Item>
            <Form.Item name="start_slot" label="开始节次" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={1} max={12} />
            </Form.Item>
            <Form.Item name="end_slot" label="结束节次" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={1} max={12} />
            </Form.Item>
            <Form.Item name="location" label="地点">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createMut.isPending}>
                创建
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export function TrainingPlanPanel() {
  const [planForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: majors = [] } = useQuery({ queryKey: ["majors"], queryFn: () => fetchMajors() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: plans = [] } = useQuery({ queryKey: ["training-plans"], queryFn: () => fetchTrainingPlans() });

  const createMut = useMutation({
    mutationFn: createTrainingPlan,
    onSuccess: () => {
      message.success("培养方案创建成功");
      planForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["training-plans"] });
    },
    onError: (err: any) => message.error(err.message || "创建失败"),
  });

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "名称", dataIndex: "name" },
    { title: "入学年份", dataIndex: "entry_year" },
    { title: "专业", dataIndex: "major_id", render: (v: number) => majors.find((m) => m.id === v)?.name || v },
    {
      title: "课程条目",
      dataIndex: "items",
      render: (_: unknown, record: TrainingPlan) => (record.items || []).map((i) => i.course?.name || i.course_id).join("，"),
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={14}>
        <Card title="培养方案">
          <Table<TrainingPlan> rowKey="id" dataSource={plans} columns={columns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
      </Col>
      <Col span={10}>
        <Card title="创建培养方案">
          <Form layout="vertical" form={planForm} onFinish={(vals) => createMut.mutate({ ...vals, item_course_ids: vals.item_course_ids || [] })}>
            <Form.Item name="name" label="方案名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="entry_year" label="入学年份" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="major_id" label="所属专业" rules={[{ required: true }]}>
              <Select options={majors.map((m) => ({ value: m.id, label: m.name }))} />
            </Form.Item>
            <Form.Item name="item_course_ids" label="课程列表" rules={[{ required: true }]}>
              <Select
                mode="multiple"
                placeholder="选择课程"
                options={courses.map((c) => ({ value: c.id, label: `${c.name} (${c.id})` }))}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createMut.isPending} block>
                创建
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export function ExamPanel() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { data: exams = [] } = useQuery({ queryKey: ["exams"], queryFn: () => fetchExams() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });
  const selectedExamCourseId = Form.useWatch("course_id", form);
  const selectedExamCourse = useMemo(
    () => (courses as Course[]).find((c) => c.id === selectedExamCourseId),
    [courses, selectedExamCourseId]
  );
  const selectedExamTermId = Form.useWatch("term_id", form);
  const examCourseOptions = useMemo(
    () =>
      (courses as Course[])
        .filter((c) => !selectedExamTermId || c.term_id === selectedExamTermId)
        .map((c) => ({ value: c.id, label: `${c.name} (${c.id})` })),
    [courses, selectedExamTermId]
  );
  const examClassOptions = useMemo(
    () =>
      (classes as ClassItem[]).map((c) => ({
        value: c.id,
        label: `${c.name} (${c.id})`,
        disabled: Boolean(
          (selectedExamCourse?.class_id && c.id !== selectedExamCourse.class_id) ||
            (selectedExamCourse?.major_id && c.major_id !== selectedExamCourse.major_id) ||
            (selectedExamCourse?.term_id && c.term_id !== selectedExamCourse.term_id)
        ),
      })),
    [classes, selectedExamCourse]
  );
  const examTermOptions = useMemo(
    () => (terms as Term[]).map((t) => ({ value: t.id, label: t.name })),
    [terms]
  );

  const createExamMut = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      message.success("考试创建成功");
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: Exam) => v || r.course_id },
    { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: Exam) => v || r.class_id || "-" },
    { title: "类型", dataIndex: "exam_type" },
    { title: "日期", dataIndex: "exam_date" },
    { title: "时间", dataIndex: "start_time" },
    { title: "时长", dataIndex: "duration_minutes" },
    { title: "地点", dataIndex: "location" },
    { title: "监考", dataIndex: "invigilators" },
  ];

  return (
    <Row gutter={16}>
      <Col span={14}>
        <Card title="考试列表">
          <Table<Exam> rowKey="id" dataSource={exams} columns={columns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
      </Col>
      <Col span={10}>
        <Card title="创建考试">
          <Form layout="vertical" form={form} onFinish={createExamMut.mutate}>
            <Form.Item name="course_id" label="课程" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                options={examCourseOptions}
              />
            </Form.Item>
            <Form.Item name="class_id" label="班级">
              <Select showSearch optionFilterProp="label" allowClear options={examClassOptions} />
            </Form.Item>
            <Form.Item name="term_id" label="学期">
              <Select showSearch optionFilterProp="label" allowClear options={examTermOptions} />
            </Form.Item>
            <Form.Item name="exam_type" label="类型">
              <Input placeholder="期末/期中/补考.." />
            </Form.Item>
            <Form.Item name="exam_date" label="日期">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="start_time" label="开始时间">
              <Input placeholder="HH:MM" />
            </Form.Item>
            <Form.Item name="duration_minutes" label="时长(分钟)">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="location" label="地点">
              <Input />
            </Form.Item>
            <Form.Item name="invigilators" label="监考">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createExamMut.isPending}>
                创建
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
