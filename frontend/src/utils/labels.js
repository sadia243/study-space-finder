export const TYPE_LABELS = {
  individual_desk: "Individual desk",
  group_room: "Group room",
  quiet_zone: "Quiet zone",
  computer_pod: "Computer pod",
};

export const typeLabel = (type) => TYPE_LABELS[type] || type;
