import { Card, Col, Row, Statistic } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchHome } from "../../../api/entities";

export function DashboardCard() {
  const { data, isLoading } = useQuery({ queryKey: ["home"], queryFn: () => fetchHome() });
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
          <Card loading={isLoading}>
            <Statistic title={item.label} value={counters[item.key] ?? "-"} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
