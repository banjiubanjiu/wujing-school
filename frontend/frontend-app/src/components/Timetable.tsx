import { Card, Tag } from "antd";
import type { ScheduleEntry } from "../api/types";

interface TimetableProps {
  schedule: ScheduleEntry[];
  title?: string;
  maxSlot?: number;
  onEntryClick?: (entry: ScheduleEntry) => void;
}

const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const palette = ["#e6f4ff", "#f9f0ff", "#f6ffed", "#fff7e6", "#e6fffb", "#fef6fb"];

export function Timetable({ schedule, title = "课程表", maxSlot, onEntryClick }: TimetableProps) {
  const slots = maxSlot || Math.max(8, ...schedule.map((s) => s.end_slot || 0));
  const gridTemplateRows = `40px repeat(${slots}, 80px)`;
  const gridTemplateColumns = `60px repeat(7, 1fr)`;

  return (
    <Card title={title} size="small">
      <div
        style={{
          display: "grid",
          gridTemplateRows,
          gridTemplateColumns,
          gap: 8,
          position: "relative",
        }}
      >
        {/* 顶部星期标题 */}
        {weekdays.map((day, idx) => (
          <div
            key={day}
            style={{
              gridRow: "1 / 2",
              gridColumn: `${idx + 2} / ${idx + 3}`,
              textAlign: "center",
              fontWeight: 600,
              color: "#555",
            }}
          >
            {day}
          </div>
        ))}

        {/* 左侧节次标尺 */}
        {Array.from({ length: slots }).map((_, i) => (
          <div
            key={`slot-${i + 1}`}
            style={{
              gridRow: `${i + 2} / ${i + 3}`,
              gridColumn: "1 / 2",
              textAlign: "right",
              paddingRight: 8,
              color: "#888",
              fontSize: 12,
              alignSelf: "center",
            }}
          >
            第{i + 1}节
          </div>
        ))}

        {/* 课程块 */}
        {schedule.map((item, idx) => {
          const weekday = Math.min(Math.max(item.weekday || 1, 1), 7);
          const rowStart = (item.start_slot || 1) + 1;
          const rowEnd = (item.end_slot || item.start_slot || 1) + 2;
          const courseName = item.course?.name || `课程 ${item.course_id}`;
          const className = item.class_info?.name || (item.class_id ? `班级 ${item.class_id}` : "");
          const location = item.location || "地点待定";
          return (
            <div
              key={item.id || `${weekday}-${rowStart}-${idx}`}
              style={{
                gridColumn: `${weekday + 1} / ${weekday + 2}`,
                gridRow: `${rowStart} / ${rowEnd}`,
                background: palette[idx % palette.length],
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: "8px 10px",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                cursor: onEntryClick ? "pointer" : "default",
              }}
              onClick={() => onEntryClick?.(item)}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{courseName}</div>
              {className && (
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  {className} · 第{item.start_slot}-{item.end_slot}节
                </div>
              )}
              <div style={{ fontSize: 12, color: "#666" }}>
                <Tag color="blue" style={{ marginRight: 4, marginBottom: 4 }}>
                  {location}
                </Tag>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
