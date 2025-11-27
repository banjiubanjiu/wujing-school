import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Table, message } from "antd";
import { createTrainingPlan, fetchCourses, fetchMajors, fetchTrainingPlans } from "../../../api/entities";
import type { TrainingPlan } from "../../../api/types";

const PAGE_SIZE = 8;

export function TrainingPlanPanel() {
  const [planForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: majors = [] } = useQuery({ queryKey: ["majors"], queryFn: () => fetchMajors() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: plans = [], isLoading } = useQuery({ queryKey: ["training-plans"], queryFn: () => fetchTrainingPlans() });

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
      render: (_: unknown, record: TrainingPlan) => (record.items || []).map((i) => i.course?.name || i.course_id).join("、"),
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={14}>
        <Card title="培养方案">
          <Table<TrainingPlan> rowKey="id" dataSource={plans} columns={columns} pagination={{ pageSize: PAGE_SIZE }} loading={isLoading} />
        </Card>
      </Col>
      <Col span={10}>
        <Card title="创建培养方案">
          <Form
            layout="vertical"
            form={planForm}
            onFinish={(vals) => createMut.mutate({ ...vals, item_course_ids: vals.item_course_ids || [] })}
          >
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
