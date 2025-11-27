import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppLayout } from "../components/Layout";
import { Card, Col, Input, Row, Space, Typography, Button, Alert } from "antd";
import { askAssistant } from "../api/entities";
import type { NavItem } from "../components/Layout";

const { TextArea } = Input;

type Props = {
  navItems: NavItem[];
  title: string;
  subtitle?: string;
};

export function AssistantPage({ navItems, title, subtitle }: Props) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  const askMut = useMutation({
    mutationFn: askAssistant,
    onSuccess: (res) => setAnswer(res.answer),
  });

  const quickActions = [
    {
      label: "查看三大队本学期挂科风险最高的课程",
      task: "risk_courses",
      params: { class_keyword: "大队" },
      prompt: "查看三大队本学期挂科风险最高的课程，给出TOP3课程及建议。",
    },
    {
      label: "生成本周教学情况简报",
      task: "weekly_report",
      prompt: "帮我写一份本周教学情况简报，突出课程数、班级数、老师数、两周内考试、已发布成绩。",
    },
  ];

  return (
    <AppLayout navItems={navItems} title={title} subtitle={subtitle || "对 AI 说需求，获取教务洞察"}>
      <Row gutter={16}>
        <Col span={14}>
          <Card
            title="对话"
            extra={
              <Space>
                {quickActions.map((qa) => (
                  <Button
                    key={qa.label}
                    size="small"
                    onClick={() => {
                      setPrompt(qa.prompt);
                      askMut.mutate({ prompt: qa.prompt, task: qa.task, params: qa.params });
                    }}
                  >
                    {qa.label}
                  </Button>
                ))}
              </Space>
            }
          >
            <TextArea
              rows={4}
              placeholder="请输入你的需求，例如：帮我生成本周教学情况简报"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Space style={{ marginTop: 12 }}>
              <Button type="primary" loading={askMut.isPending} onClick={() => prompt && askMut.mutate({ prompt })}>
                发送
              </Button>
            </Space>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="AI 回复">
            {askMut.isError && <Alert type="error" message={(askMut.error as Error)?.message || "请求失败"} />}
            {answer ? <Typography.Paragraph>{answer}</Typography.Paragraph> : <Typography.Text type="secondary">等待提问...</Typography.Text>}
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
