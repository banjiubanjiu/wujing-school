import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Form, Select, Space, Table, message } from "antd";
import { StatusTag } from "../../../components/StatusTag";
import {
  fetchClasses,
  fetchCourses,
  fetchGrades,
  publishGrades,
  reviewGrade,
} from "../../../api/entities";
import type { ClassItem, Course, Grade } from "../../../api/types";

const PAGE_SIZE = 8;

export function GradePanel() {
  const [filterForm] = Form.useForm();
  const [publishForm] = Form.useForm();
  const queryClient = useQueryClient();

  const filterCourseId = Form.useWatch("course_id", filterForm);
  const filterClassId = Form.useWatch("class_id", filterForm);
  const filterStatus = Form.useWatch("status_filter", filterForm);

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses() });

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
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ["grades", filterCourseId, filterClassId, filterStatus],
    queryFn: () =>
      fetchGrades({
        course_id: filterCourseId,
        class_id: filterClassId,
        status_filter: filterStatus,
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
      render: (v: string) => <StatusTag status={v} />,
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
      title="成绩审核"
      extra={
        <Space direction="vertical">
          <Form form={filterForm} layout="inline">
            <Form.Item name="course_id" label="课程">
              <Select showSearch optionFilterProp="label" allowClear style={{ minWidth: 200 }} options={courseOptions} />
            </Form.Item>
            <Form.Item name="class_id" label="班级">
              <Select showSearch optionFilterProp="label" allowClear style={{ minWidth: 160 }} options={gradeClassOptions} />
            </Form.Item>
            <Form.Item name="status_filter" label="状态">
              <Select
                allowClear
                style={{ minWidth: 140 }}
                options={[
                  { value: "submitted", label: "待审核" },
                  { value: "published", label: "已发布" },
                  { value: "draft", label: "草稿" },
                ]}
              />
            </Form.Item>
          </Form>
          <Form form={publishForm} layout="inline" onFinish={publishMut.mutate}>
            <Form.Item name="course_id" label="发布课程" rules={[{ required: true, message: "请选择课程" }]}>
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
      <Table<Grade> rowKey="id" dataSource={grades} columns={columns} pagination={{ pageSize: PAGE_SIZE }} loading={isLoading || reviewMut.isPending} />
    </Card>
  );
}
