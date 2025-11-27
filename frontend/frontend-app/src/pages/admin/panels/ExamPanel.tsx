import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Table, message, DatePicker, TimePicker } from "antd";
import { formatRoomLabel } from "../utils";
import { createExam, fetchClasses, fetchCourses, fetchExams, fetchRooms, fetchTerms } from "../../../api/entities";
import type { ClassItem, Course, Exam, Room, Term } from "../../../api/types";

const PAGE_SIZE = 8;

export function ExamPanel() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { data: exams = [], isLoading } = useQuery({ queryKey: ["exams"], queryFn: () => fetchExams() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });
  const { data: rooms = [] } = useQuery({ queryKey: ["rooms"], queryFn: () => fetchRooms() });
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
    { title: "地点", render: (_: unknown, r: Exam) => (r.room ? formatRoomLabel(r.room) : r.location || "-") },
    { title: "监考", dataIndex: "invigilators" },
  ];

  return (
    <Row gutter={16}>
      <Col span={14}>
        <Card title="考试列表">
          <Table<Exam> rowKey="id" dataSource={exams} columns={columns} pagination={{ pageSize: PAGE_SIZE }} loading={isLoading} />
        </Card>
      </Col>
      <Col span={10}>
        <Card title="创建考试">
          <Form
            layout="vertical"
            form={form}
            onFinish={(vals) =>
              createExamMut.mutate({
                ...vals,
                exam_date: vals.exam_date?.format("YYYY-MM-DD"),
                start_time: vals.start_time?.format("HH:mm"),
              })
            }
          >
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
            <Form.Item name="room_id" label="地点" rules={[{ required: true, message: "请选择地点" }]}>
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                options={(rooms as Room[]).map((r) => ({ value: r.id, label: formatRoomLabel(r) }))}
              />
            </Form.Item>
            <Form.Item name="exam_type" label="类型">
              <Input placeholder="期末/期中/补考..." />
            </Form.Item>
            <Form.Item name="exam_date" label="日期" rules={[{ required: true, message: "请选择日期" }]}>
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="start_time" label="开始时间" rules={[{ required: true, message: "请选择时间" }]}>
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="duration_minutes" label="时长(分钟)" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={0} />
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
