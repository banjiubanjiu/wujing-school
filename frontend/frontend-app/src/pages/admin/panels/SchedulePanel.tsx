import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Table, message } from "antd";
import { Timetable } from "../../../components/Timetable";
import { formatRoomLabel } from "../utils";
import {
  createRoom,
  createScheduleEntry,
  deleteScheduleEntry,
  fetchClasses,
  fetchCourses,
  fetchRooms,
  fetchSchedule,
  fetchTeachers,
  fetchTerms,
  updateScheduleEntry,
} from "../../../api/entities";
import type { Course, Room, ScheduleEntry, Teacher, Term } from "../../../api/types";

const PAGE_SIZE = 8;

export function SchedulePanel() {
  const [filterForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [roomForm] = Form.useForm();
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleEntry | null>(null);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const filterClassId = Form.useWatch("class_id", filterForm);
  const filterTeacherId = Form.useWatch("teacher_id", filterForm);
  const filterTermId = Form.useWatch("term_id", filterForm);

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => fetchTeachers() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms() });
  const { data: rooms = [] } = useQuery({ queryKey: ["rooms"], queryFn: () => fetchRooms() });
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
  const scheduleRoomOptions = useMemo(
    () => rooms.map((r) => ({ value: r.id, label: formatRoomLabel(r) })),
    [rooms]
  );
  const scheduleTermOptions = useMemo(() => (terms as Term[]).map((t) => ({ value: t.id, label: t.name })), [terms]);
  const { data: schedule = [], isLoading: scheduleLoading } = useQuery({
    queryKey: ["schedule", filterClassId, filterTeacherId],
    queryFn: () =>
      fetchSchedule({
        class_id: filterClassId,
        teacher_id: filterTeacherId,
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
  const fillFormFromSchedule = (entry: ScheduleEntry) => {
    createForm.setFieldsValue({
      course_id: entry.course_id || entry.course?.id,
      class_id: entry.class_id || entry.class_info?.id,
      teacher_id: entry.teacher_id,
      room_id: entry.room_id || entry.room?.id,
      weekday: entry.weekday,
      start_slot: entry.start_slot,
      end_slot: entry.end_slot,
    });
  };
  useEffect(() => {
    if (selectedSchedule) {
      fillFormFromSchedule(selectedSchedule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchedule]);
  const isEditingSchedule = Boolean(selectedSchedule?.id);
  const handleScheduleSubmit = (vals: any) => {
    if (selectedSchedule?.id) {
      updateScheduleMut.mutate({ id: selectedSchedule.id, data: vals });
    } else {
      createMut.mutate(vals);
    }
  };

  const createMut = useMutation({
    mutationFn: createScheduleEntry,
    onSuccess: () => {
      message.success("排课成功");
      createForm.resetFields();
      setSelectedSchedule(null);
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
    onError: (err: any) => message.error(err.message || "创建失败"),
  });
  const createRoomMut = useMutation({
    mutationFn: createRoom,
    onSuccess: (room: Room) => {
      message.success("场地已创建");
      roomForm.resetFields();
      setRoomModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      createForm.setFieldValue("room_id", room.id);
    },
    onError: (err: any) => message.error(err.message || "创建场地失败"),
  });
  const updateScheduleMut = useMutation({
    mutationFn: (payload: { id: number; data: any }) => updateScheduleEntry(payload.id, payload.data),
    onSuccess: () => {
      message.success("排课已更新");
      setSelectedSchedule(null);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
    onError: (err: any) => message.error(err.message || "更新失败"),
  });
  const deleteScheduleMut = useMutation({
    mutationFn: deleteScheduleEntry,
    onSuccess: () => {
      message.success("排课已删除");
      setSelectedSchedule(null);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
    onError: (err: any) => message.error(err.message || "删除失败"),
  });

  return (
    <>
      <Row gutter={16}>
        <Col span={16}>
          <Card
            title="课表总览"
            extra={
              <Form layout="inline" form={filterForm}>
                <Form.Item name="class_id" label="班级">
                  <Select allowClear options={scheduleFilterClassOptions} style={{ minWidth: 160 }} />
                </Form.Item>
                <Form.Item name="teacher_id" label="教师">
                  <Select allowClear options={scheduleTeacherOptions} style={{ minWidth: 160 }} />
                </Form.Item>
                <Form.Item name="term_id" label="学期">
                  <Select allowClear options={scheduleTermOptions} style={{ minWidth: 160 }} />
                </Form.Item>
              </Form>
            }
          >
            <Timetable
              schedule={filteredSchedule as ScheduleEntry[]}
              title="周课程表"
              onEntryClick={(entry) => {
                setSelectedSchedule(entry);
                fillFormFromSchedule(entry);
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="列表视图">
            <Table<ScheduleEntry>
              rowKey="id"
              dataSource={filteredSchedule}
              loading={scheduleLoading || deleteScheduleMut.isPending}
              columns={[
                { title: "课程", dataIndex: ["course", "name"], render: (v: string, r: ScheduleEntry) => v || r.course_id },
                { title: "班级", dataIndex: ["class_info", "name"], render: (v: string, r: ScheduleEntry) => v || r.class_id || "-" },
                { title: "教师", dataIndex: ["teacher", "user", "full_name"], render: (v: string, r: ScheduleEntry) => v || r.teacher_id || "-" },
                { title: "星期", dataIndex: "weekday" },
                { title: "节次", render: (_: unknown, r: ScheduleEntry) => `${r.start_slot}-${r.end_slot}` },
                { title: "地点", render: (_: unknown, r: ScheduleEntry) => formatRoomLabel(r.room) || r.location || "-" },
                {
                  title: "操作",
                  render: (_: unknown, record: ScheduleEntry) => (
                    <Button
                      size="small"
                      type="link"
                      onClick={() => {
                        setSelectedSchedule(record);
                        fillFormFromSchedule(record);
                      }}
                    >
                      编辑
                    </Button>
                  ),
                },
              ]}
              pagination={{ pageSize: PAGE_SIZE }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={isEditingSchedule ? "编辑排课" : "创建排课"}>
            <Form layout="vertical" form={createForm} onFinish={handleScheduleSubmit}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="course_id" label="课程" rules={[{ required: true }]}>
                    <Select showSearch optionFilterProp="label" options={scheduleCourseOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="class_id" label="班级">
                    <Select showSearch optionFilterProp="label" allowClear options={scheduleClassOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="teacher_id" label="教师">
                    <Select showSearch optionFilterProp="label" allowClear options={scheduleTeacherOptions} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="room_id" label="地点(房间)" rules={[{ required: true, message: "请选择地点" }]}>
                    <Space.Compact style={{ width: "100%" }}>
                      <Select
                        style={{ flex: 1 }}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        options={scheduleRoomOptions}
                        placeholder="选择教室/场地"
                      />
                      <Button onClick={() => setRoomModalOpen(true)}>+ 新建场地</Button>
                    </Space.Compact>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="weekday" label="星期" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} min={1} max={7} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="start_slot" label="开始节次" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} min={1} max={12} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="end_slot" label="结束节次" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} min={1} max={12} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isEditingSchedule ? updateScheduleMut.isPending : createMut.isPending}
                  >
                    {isEditingSchedule ? "更新排课" : "创建排课"}
                  </Button>
                  {isEditingSchedule && (
                    <Button
                      danger
                      loading={deleteScheduleMut.isPending}
                      onClick={() => selectedSchedule && deleteScheduleMut.mutate(selectedSchedule.id!)}
                    >
                      删除排课
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedSchedule(null);
                      createForm.resetFields();
                    }}
                  >
                    清空
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal
        title="新建场地"
        open={roomModalOpen}
        onCancel={() => setRoomModalOpen(false)}
        onOk={() => roomForm.submit()}
        confirmLoading={createRoomMut.isPending}
        destroyOnClose
      >
        <Form layout="vertical" form={roomForm} onFinish={(vals) => createRoomMut.mutate(vals)} preserve={false}>
          <Form.Item name="code" label="场地代码" rules={[{ required: true, message: "请输入代码" }]}>
            <Input placeholder="唯一代码，如 MAIN-201" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="如综合楼01" />
          </Form.Item>
          <Form.Item name="building" label="楼栋/区域">
            <Input placeholder="如教学主楼" />
          </Form.Item>
          <Form.Item name="room_type" label="类型">
            <Input placeholder="教室/实验室/场地" />
          </Form.Item>
          <Form.Item name="capacity" label="容量">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="features" label="特色">
            <Input placeholder="可选，如多媒体/可分组" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
