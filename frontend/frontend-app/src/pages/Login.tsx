import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const res = await login(values.username.trim(), values.password.trim());
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("roles", JSON.stringify(res.roles));
      localStorage.setItem("user", JSON.stringify(res.user));
      message.success("登录成功");
      // 简单路由：ADMIN -> /admin，其它 -> /student
      if (res.roles.includes("ADMIN")) navigate("/admin/dashboard");
      else if (res.roles.includes("TEACHER")) navigate("/teacher/dashboard");
      else navigate("/student/dashboard");
    } catch (err: any) {
      message.error(err.message || "登录失败");
    }
  };

  const quickFill = (u: string, p: string) => {
    form.setFieldsValue({ username: u, password: p });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f2f5fa", padding: 16 }}>
      <Card style={{ width: 420, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          教务平台登录
        </Title>
        <Text type="secondary">示例账号密码均为“账号+123”</Text>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="small" onClick={() => quickFill("student1", "student123")}>
            学生
          </Button>
          <Button size="small" onClick={() => quickFill("teacher1", "teacher123")}>
            教师
          </Button>
          <Button size="small" onClick={() => quickFill("admin", "admin123")}>
            教务
          </Button>
        </div>
      </Card>
    </div>
  );
}
