import { Button, Layout as AntLayout, Menu, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

export interface NavItem {
  key: string;
  label: string;
  path: string;
}

interface Props {
  navItems: NavItem[];
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ navItems, children, title, subtitle }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const selectedKey = navItems.find((n) => location.pathname.startsWith(n.path))?.path || location.pathname;

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider width={220} style={{ background: colorBgContainer }}>
        <div style={{ padding: "16px" }}>
          <Title level={4} style={{ margin: 0 }}>
            教务平台
          </Title>
          <Text type="secondary">P0/P1</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems.map((n) => ({ key: n.path, label: n.label }))}
          onClick={(info) => navigate(info.key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: "#fff", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Title level={3} style={{ margin: 0 }}>
              {title || "Dashboard"}
            </Title>
            {subtitle && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {subtitle}
              </Text>
            )}
          </div>
          <Button
            type="link"
            danger
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("roles");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            退出
          </Button>
        </Header>
        <Content style={{ margin: "16px", background: colorBgContainer, padding: 16, borderRadius: 8 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
