import React, { useState, useEffect } from "react";

interface TrackedTableProps {
  data: any[];
  filters: any;
  onRefresh: () => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

const headerBase = [
  { key: "orgUnitName", label: "报告地区" },
  { key: "siteName", label: "哨点单位" },
  { key: "enrolledAt", label: "调查日期" },
  { key: "statusText", label: "状态" },
  { key: "actions", label: "操作" }
];

const statusMap: Record<string, string> = {
  "1": "待审核",
  "2": "待修改",
  "3": "已审核"
};

const TrackedTable: React.FC<TrackedTableProps> = ({
  data,
  onSelectionChange
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    setSelected([]);
  }, [data]);

  const handleEdit = (row: any) => {
    window.open(
      `/apps/capture#/enrollment?enrollmentId=${row.enrollment}&orgUnitId=${row.orgUnit}&programId=${row.programId}&teiId=${row.trackedEntity}`,
      "_blank"
    );
  };

  const toggleRow = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      setSelected(data.map(row => row.trackedEntity));
    }
  };

  return (
    <table className="tracked-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={selected.length === data.length && data.length > 0}
              indeterminate={selected.length > 0 && selected.length < data.length ? "indeterminate" : undefined}
              onChange={toggleAll}
            />
          </th>
          {headerBase.map(h => <th key={h.key}>{h.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={headerBase.length + 1} style={{ textAlign: "center" }}>暂无数据</td></tr>
        ) : data.map((row, idx) => (
          <tr key={row.trackedEntity || idx}>
            <td>
              <input
                type="checkbox"
                checked={selected.includes(row.trackedEntity)}
                onChange={() => toggleRow(row.trackedEntity)}
              />
            </td>
            <td>{row.orgUnitName}</td>
            <td>{row.siteName}</td>
            <td>{row.enrolledAt?.slice(0, 10) || ""}</td>
            <td>{statusMap[row.status] || row.status || "待审核"}</td>
            <td>
              <button onClick={() => handleEdit(row)}>编辑</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TrackedTable;