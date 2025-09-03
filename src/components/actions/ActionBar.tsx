import React from "react";
import { exportEvents, exportTracked } from "../../services/export";

interface ActionBarProps {
  type: "event" | "tracked";
  filters: any;
  onRefresh: () => void;
  onApply?: () => void;
  onAudit?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  type,
  filters,
  onRefresh,
  onApply,
  onAudit
}) => {
  const handleAdd = () => {
    if (!filters.orgUnits?.[filters.orgUnits.length - 1] || !filters.programId) {
      alert("请先选择机构和项目");
      return;
    }
    const orgUnitId = filters.orgUnits[filters.orgUnits.length - 1];
    const programId = filters.programId;
    window.open(
      `/apps/capture#/new?orgUnitId=${orgUnitId}&programId=${programId}`,
      "_blank"
    );
  };

  const handleExport = async () => {
    if (type === "event") await exportEvents(filters);
    else await exportTracked(filters);
  };

  return (
    <div className="action-bar">
      <button onClick={handleAdd} style={{ marginRight: 8 }}>+新增</button>
      <button onClick={handleExport} style={{ marginRight: 8 }}>↓导出</button>
      <button onClick={onApply || (() => alert("申请功能开发中"))} style={{ marginRight: 8 }}>🗎申请</button>
      <button onClick={onAudit || (() => alert("审核功能开发中"))}>✓审核</button>
      <button onClick={onRefresh} style={{ marginLeft: 16 }}>刷新</button>
    </div>
  );
};

export default ActionBar;