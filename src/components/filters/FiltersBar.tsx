import React, { useMemo } from "react";
import OrgUnitCascade from "./OrgUnitCascade";
import DateRangePicker from "./DateRangePicker";
import AuditStatusSelect from "./AuditStatusSelect";

interface FiltersBarProps {
  type: "event" | "tracked";
  programs: Array<{ id: string; displayName: string }>;
  isLoading: boolean;
  filters: any;
  onChange: (filters: any) => void;
  onSearch: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  type,
  programs,
  isLoading,
  filters,
  onChange,
  onSearch,
}) => {
  // 当传入的 programs 仅包含一个选中的项目时，锁定选择器
  const lockProgram = useMemo(() => programs.length === 1, [programs]);

  return (
    <div className="filters-bar">
      <select
        disabled={isLoading || lockProgram}
        value={filters.programId || ""}
        onChange={e => onChange({ ...filters, programId: e.target.value })}
        style={{ minWidth: 180, marginRight: 8 }}
      >
        <option value="">{lockProgram ? "已选择项目" : "选择项目"}</option>
        {programs.map(p => (
          <option key={p.id} value={p.id}>{p.displayName}</option>
        ))}
      </select>
      <OrgUnitCascade
        value={filters.orgUnits || []}
        onChange={orgUnits => onChange({ ...filters, orgUnits })}
      />
      <DateRangePicker
        value={filters.dateRange || null}
        onChange={dateRange => onChange({ ...filters, dateRange })}
      />
      <AuditStatusSelect
        value={filters.auditStatus || ""}
        onChange={auditStatus => onChange({ ...filters, auditStatus })}
      />
      <button onClick={onSearch} style={{ marginLeft: 8 }}>查询</button>
      <button onClick={() => onChange({ programId: lockProgram ? programs[0]?.id : "" })} style={{ marginLeft: 8 }}>重置</button>
    </div>
  );
};

export default FiltersBar;