import React from "react";
import { deleteEvent } from "../../services/events";

interface EventTableProps {
  data: any[];
  filters: any;
  onRefresh: () => void;
}

const headerBase = [
  { key: "orgUnitName", label: "报告地区" },
  { key: "siteName", label: "哨点单位" },
  { key: "occurredAt", label: "调查日期" },
  { key: "statusText", label: "状态" },
];

const statusMap: Record<string, string> = {
  "1": "待审核",
  "2": "待修改",
  "3": "已审核"
};

const getDynamicHeaders = (data: any[]) => {
  const extraKeys = new Set<string>();
  data.forEach(row => {
    (row.dataValues || []).forEach((dv: any) => {
      if (dv.displayName) extraKeys.add(dv.displayName);
    });
  });
  return Array.from(extraKeys).map(name => ({ key: name, label: name }));
};

const EventTable: React.FC<EventTableProps> = ({ data, onRefresh }) => {
  const handleEdit = (row: any) => {
    window.open(`/apps/capture#/viewEvent?orgUnitId=${row.orgUnit}&viewEventId=${row.event}`, "_blank");
  };

  const handleDelete = async (row: any) => {
    if (window.confirm("确定要删除该问卷吗？")) {
      await deleteEvent(row.event);
      onRefresh();
    }
  };

  const dynamicHeaders = getDynamicHeaders(data);

  return (
    <table className="event-table">
      <thead>
        <tr>
          <th>□</th>
          {[...headerBase, ...dynamicHeaders, { key: "actions", label: "操作" }].map(h => (
            <th key={h.key}>{h.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={headerBase.length + dynamicHeaders.length + 2} style={{ textAlign: "center" }}>暂无数据</td></tr>
        ) : data.map((row, idx) => (
          <tr key={row.event || idx}>
            <td><input type="checkbox" /></td>
            <td>{row.orgUnitName}</td>
            <td>{row.siteName}</td>
            <td>{row.occurredAt?.slice(0, 10) || ""}</td>
            <td>{statusMap[row.status] || row.status || "待审核"}</td>
            {dynamicHeaders.map(h => (
              <td key={h.key}>
                {(row.dataValues || []).find((dv: any) => dv.displayName === h.label)?.value ?? ""}
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

export default EventTable;