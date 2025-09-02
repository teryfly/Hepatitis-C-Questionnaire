import React from "react";

interface AuditStatusSelectProps {
  value: string;
  onChange: (status: string) => void;
}

const statuses = [
  { value: "", label: "全部状态" },
  { value: "1", label: "待审核" },
  { value: "2", label: "待修改" },
  { value: "3", label: "已审核" },
];

const AuditStatusSelect: React.FC<AuditStatusSelectProps> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ minWidth: 110, marginLeft: 8 }}
  >
    {statuses.map(s => (
      <option key={s.value} value={s.value}>{s.label}</option>
    ))}
  </select>
);

export default AuditStatusSelect;