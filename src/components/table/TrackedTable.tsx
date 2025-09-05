import React, { useState, useEffect } from "react";
import { deleteEnrollment } from "../../services/events";
import { BASE_URL } from "../../utils/baseUrl";
import { removeApiPath } from "../../utils/download";

interface TrackedTableProps {
  data: any[];
  filters: any;
  onRefresh: () => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

const headerBase = [
  { key: "orgUnitName", label: "报告地区" },
  // { key: "siteName", label: "哨点单位" },
  { key: "enrolledAt", label: "调查日期" },
  // { key: "statusText", label: "状态" },
];

const statusMap: Record<string, string> = {
  "1": "待审核",
  "2": "待修改",
  "3": "已审核"
};

const getDynamicHeaders = (data: any[]) => {
  const extraKeys = new Set<string>();
  data.forEach(row => {
    (row.attributes || []).forEach((dv: any) => {
      if (dv.displayName) extraKeys.add(dv.displayName);
    });
  });
  return Array.from(extraKeys).map(name => ({ key: name, label: name }));
};

const TrackedTable: React.FC<TrackedTableProps> = ({
  data,
  onRefresh,
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
      `${removeApiPath(BASE_URL)}apps/capture#/enrollment?enrollmentId=${row.enrollment}&orgUnitId=${row.orgUnit}&programId=${row.programId}&teiId=${row.trackedEntity}`,
      "_blank"
    );
  };

  const handleDelete = async (row: any) => {
    if (window.confirm("确定要删除该问卷吗？")) {
      await deleteEnrollment(row.enrollments[0].enrollment);
      onRefresh();
    }
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
  
  const dynamicHeaders = getDynamicHeaders(data);

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
          {/* {headerBase.map(h => <th key={h.key}>{h.label}</th>)} */}
          {[...headerBase, ...dynamicHeaders, { key: "actions", label: "操作" }].map(h => (
            <th key={h.key}>{h.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={headerBase.length + dynamicHeaders.length + 2} style={{ textAlign: "center" }}>暂无数据</td></tr>
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
            {/* <td>{row.siteName}</td> */}
            <td>{row.enrolledAt?.slice(0, 10) || ""}</td>
            {/* <td>{statusMap[row.status] || row.status || "待审核"}</td> */}
            {dynamicHeaders.map(h => (
              <td key={h.key}>
                {(row.attributes || []).find((dv: any) => dv.displayName === h.label)?.value ?? ""}
              </td>
            ))}
            <td>
              <button onClick={() => handleEdit(row)} style={{ marginRight: 8 }}>编辑</button>
              <button onClick={() => handleDelete(row)}>删除</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TrackedTable;