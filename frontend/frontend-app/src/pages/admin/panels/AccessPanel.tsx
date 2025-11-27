import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Checkbox, Col, Drawer, Form, Input, Modal, Row, Select, Space, Table, Tag, message } from "antd";
import {
  createUser,
  fetchPermissions,
  fetchRoles,
  fetchUsers,
  resetUserPassword,
  updateRolePermissions,
  updateUserRoles,
} from "../../../api/entities";
import type { Permission, RoleWithPermissions, UserDetail } from "../../../api/types";

export function AccessPanel() {
  const queryClient = useQueryClient();
  const { data: permissions = [], isLoading: loadingPerms } = useQuery({ queryKey: ["permissions"], queryFn: () => fetchPermissions() });
  const { data: roles = [], isLoading: loadingRoles } = useQuery({ queryKey: ["roles"], queryFn: () => fetchRoles() });
  const { data: users = [], isLoading: loadingUsers } = useQuery({ queryKey: ["users"], queryFn: () => fetchUsers() });

  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [checkedPerms, setCheckedPerms] = useState<string[]>([]);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetail | null>(null);
  const [createForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  const updateRolePermMut = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) => updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      message.success("角色权限已更新");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setRoleDrawerOpen(false);
      setEditingRole(null);
    },
    onError: (err: any) => message.error(err.message || "更新失败"),
  });

  const createUserMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success("账号已创建");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setUserModalOpen(false);
      createForm.resetFields();
    },
    onError: (err: any) => message.error(err.message || "创建失败"),
  });

  const updateUserRolesMut = useMutation({
    mutationFn: ({ userId, role_codes }: { userId: number; role_codes: string[] }) => updateUserRoles(userId, role_codes),
    onSuccess: () => {
      message.success("角色已分配");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setRoleModalOpen(false);
      setCurrentUser(null);
    },
    onError: (err: any) => message.error(err.message || "更新失败"),
  });

  const resetPwdMut = useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) => resetUserPassword(userId, password),
    onSuccess: () => {
      message.success("密码已重置");
      setPwdModalOpen(false);
      setCurrentUser(null);
      pwdForm.resetFields();
    },
    onError: (err: any) => message.error(err.message || "重置失败"),
  });

  const permOptions = useMemo(
    () => (permissions as Permission[]).map((p) => ({ label: `${p.name}${p.category ? ` · ${p.category}` : ""}`, value: p.code })),
    [permissions]
  );
  const roleOptions = useMemo(() => (roles as RoleWithPermissions[]).map((r) => ({ label: `${r.name} (${r.code})`, value: r.code })), [roles]);

  const roleColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "编码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    {
      title: "权限数",
      render: (_: unknown, r: RoleWithPermissions) => <Tag color="blue">{r.permissions?.length || 0}</Tag>,
    },
    {
      title: "操作",
      render: (_: unknown, r: RoleWithPermissions) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingRole(r);
              setCheckedPerms((r.permissions || []).map((p) => p.code));
              setRoleDrawerOpen(true);
            }}
          >
            编辑权限
          </Button>
        </Space>
      ),
    },
  ];

  const userColumns = [
    { title: "用户名", dataIndex: "username" },
    { title: "姓名", dataIndex: "full_name" },
    {
      title: "角色",
      render: (_: unknown, r: UserDetail) => (
        <Space wrap>
          {(r.roles || []).map((role) => (
            <Tag key={role.code}>{role.name}</Tag>
          ))}
        </Space>
      ),
    },
    { title: "状态", dataIndex: "active", render: (v: boolean) => (v ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>) },
    {
      title: "操作",
      render: (_: unknown, r: UserDetail) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setCurrentUser(r);
              roleForm.setFieldsValue({ role_codes: (r.roles || []).map((it) => it.code) });
              setRoleModalOpen(true);
            }}
          >
            分配角色
          </Button>
          <Button
            type="link"
            onClick={() => {
              setCurrentUser(r);
              setPwdModalOpen(true);
            }}
          >
            重置密码
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={14}>
        <Card
          title="角色与权限"
          extra={<Tag color="blue">{roles?.length || 0} 角色</Tag>}
          loading={loadingRoles || loadingPerms}
        >
          <Table<RoleWithPermissions> rowKey="id" dataSource={roles as RoleWithPermissions[]} columns={roleColumns} pagination={{ pageSize: 6 }} />
        </Card>
      </Col>
      <Col span={10}>
        <Card
          title="账号管理"
          extra={
            <Button type="primary" onClick={() => setUserModalOpen(true)}>
              新建账号
            </Button>
          }
          loading={loadingUsers}
        >
          <Table<UserDetail> rowKey="id" dataSource={users as UserDetail[]} columns={userColumns} pagination={{ pageSize: 6 }} />
        </Card>
      </Col>

      <Drawer
        open={roleDrawerOpen}
        onClose={() => setRoleDrawerOpen(false)}
        title={editingRole ? `编辑 ${editingRole.name} 权限` : "编辑权限"}
        width={420}
        extra={
          <Space>
            <Button onClick={() => setRoleDrawerOpen(false)}>取消</Button>
            <Button
              type="primary"
              loading={updateRolePermMut.isPending}
              onClick={() => editingRole && updateRolePermMut.mutate({ roleId: editingRole.id, permissions: checkedPerms })}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Checkbox.Group
          options={permOptions}
          style={{ display: "grid", gap: 8 }}
          value={checkedPerms}
          onChange={(vals) => setCheckedPerms(vals as string[])}
        />
      </Drawer>

      <Modal
        open={userModalOpen}
        title="新建账号"
        onCancel={() => setUserModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createUserMut.isPending}
      >
        <Form form={createForm} layout="vertical" onFinish={(vals) => createUserMut.mutate(vals)}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="初始密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="full_name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="role_codes" label="角色">
            <Select mode="multiple" options={roleOptions} placeholder="选择角色" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={roleModalOpen}
        title={currentUser ? `为 ${currentUser.username} 分配角色` : "分配角色"}
        onCancel={() => setRoleModalOpen(false)}
        onOk={() => {
          const role_codes = roleForm.getFieldValue("role_codes") || [];
          if (currentUser) updateUserRolesMut.mutate({ userId: currentUser.id, role_codes });
        }}
        confirmLoading={updateUserRolesMut.isPending}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item name="role_codes" label="角色" rules={[{ required: true, message: "至少选择一个角色" }]}>
            <Select mode="multiple" options={roleOptions} placeholder="选择角色" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={pwdModalOpen}
        title={currentUser ? `重置 ${currentUser.username} 密码` : "重置密码"}
        onCancel={() => setPwdModalOpen(false)}
        onOk={() => {
          const pwd = pwdForm.getFieldValue("password");
          if (!pwd) {
            message.error("请输入新密码");
            return;
          }
          if (currentUser) resetPwdMut.mutate({ userId: currentUser.id, password: pwd });
        }}
        confirmLoading={resetPwdMut.isPending}
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item name="password" label="新密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
}
