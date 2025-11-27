import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Table, message } from "antd";
import {
  createClass,
  createCourse,
  fetchClasses,
  fetchCourses,
  fetchMajors,
  fetchStudents,
  fetchTeachers,
  fetchTerms,
} from "../../../api/entities";
import type { ClassItem, Course, Student, Teacher } from "../../../api/types";

const PAGE_SIZE = 8;

export function StudentClassCourse() {
  const [classForm] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [studentFilters, setStudentFilters] = useState<{ q?: string; class_id?: number }>({});
  const queryClient = useQueryClient();

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students", studentFilters],
    queryFn: () =>
      fetchStudents({
        q: studentFilters.q,
        class_id: studentFilters.class_id,
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
            <Form form={filterForm} layout="inline" onFinish={(vals) => setStudentFilters({ q: vals.q || undefined, class_id: vals.class_id || undefined })}>
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
                <Button type="primary" htmlType="submit">
                  筛选
                </Button>
              </Form.Item>
            </Form>
          }
        >
          <Table<Student> rowKey="id" dataSource={students} columns={studentColumns} pagination={{ pageSize: PAGE_SIZE }} loading={studentsLoading} />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="班级列表" extra="创建班级">
          <Form layout="vertical" form={classForm} onFinish={createClassMut.mutate}>
            <Form.Item name="code" label="代码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="major_id" label="专业" rules={[{ required: true }]}>
              <Select options={majorOptions} />
            </Form.Item>
            <Form.Item name="term_id" label="学期" rules={[{ required: true }]}>
              <Select options={termOptions} />
            </Form.Item>
            <Form.Item name="grade_year" label="年级">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createClassMut.isPending} block>
                创建
              </Button>
            </Form.Item>
          </Form>
          <Table<ClassItem> rowKey="id" dataSource={classes} columns={classColumns} pagination={{ pageSize: PAGE_SIZE }} />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="课程列表" extra="创建课程">
          <Form layout="vertical" form={courseForm} onFinish={createCourseMut.mutate}>
            <Form.Item name="code" label="代码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="major_id" label="专业" rules={[{ required: true }]}>
              <Select options={majorOptions} />
            </Form.Item>
            <Form.Item name="term_id" label="学期" rules={[{ required: true }]}>
              <Select options={termOptions} />
            </Form.Item>
            <Form.Item name="teacher_id" label="教师">
              <Select showSearch optionFilterProp="label" allowClear options={teacherOptions} />
            </Form.Item>
            <Form.Item name="class_id" label="班级">
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="教学班"
                allowClear
                options={filteredCourseClassOptions}
              />
            </Form.Item>
            <Form.Item name="course_type" label="类型">
              <Input placeholder="选填，如必修/选修" />
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
