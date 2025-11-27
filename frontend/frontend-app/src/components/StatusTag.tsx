import { Tag } from "antd";

const statusColorMap: Record<string, string> = {
  published: "green",
  submitted: "blue",
  rejected: "red",
  draft: "orange",
};

type StatusTagProps = { status?: string };

export function StatusTag({ status }: StatusTagProps) {
  const color = status ? statusColorMap[status] || "default" : "default";
  return <Tag color={color}>{status || "-"}</Tag>;
}
