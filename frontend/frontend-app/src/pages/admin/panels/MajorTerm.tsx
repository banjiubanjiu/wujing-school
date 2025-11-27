import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Checkbox, Col, Form, Input, InputNumber, Row, Select, message } from "antd";
import { createMajor, createTerm, fetchMajors, fetchOrgUnits, updateMajor, updateTerm } from "../../../api/entities";
import type { Major, Term } from "../../../api/types";

export function MajorTerm() {
  const [majorForm] = Form.useForm();
  const [majorEditForm] = Form.useForm();
  const [termForm] = Form.useForm();
  const [termEditForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: majors = [] } = useQuery({ queryKey: ["majors"], queryFn: () => fetchMajors() });
  const { data: orgUnits = [] } = useQuery({ queryKey: ["org-units"], queryFn: () => fetchOrgUnits() });

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

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="创建专业">
          <Form layout="vertical" form={majorForm} onFinish={createMajorMut.mutate}>
            <Form.Item name="code" label="代码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="level" label="层次">
              <Input placeholder="本科/专科" />
            </Form.Item>
            <Form.Item name="degree" label="授予学位">
              <Input />
            </Form.Item>
            <Form.Item name="duration_years" label="学制">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="org_unit_id" label="学院/部门">
              <Select allowClear options={orgUnits.map((o) => ({ value: o.id, label: o.name }))} />
            </Form.Item>
            <Form.Item name="parent_id" label="上级专业">
              <Select allowClear options={majors.map((m) => ({ value: m.id, label: m.name }))} />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="active" valuePropName="checked" initialValue>
              <Checkbox>启用</Checkbox>
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
            onFinish={(vals) => updateMajorMut.mutate({ id: Number(vals.id), data: { ...vals, id: undefined } })}
          >
            <Form.Item name="id" label="major_id" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="name" label="名称">
              <Input />
            </Form.Item>
            <Form.Item name="code" label="代码">
              <Input />
            </Form.Item>
            <Form.Item name="active" valuePropName="checked">
              <Checkbox>启用</Checkbox>
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
        <Card title="创建学期">
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
