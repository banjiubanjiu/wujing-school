import type { Room } from "../../api/types";

export const formatRoomLabel = (room?: Room | null) => {
  if (!room) return "-";
  const main = room.name || room.code;
  const codePart = room.name && room.code && room.name !== room.code ? ` (${room.code})` : "";
  const buildingPart = room.building ? ` - ${room.building}` : "";
  return `${main}${codePart}${buildingPart}`;
};
