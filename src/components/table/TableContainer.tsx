import React from "react";
import EventTable from "./EventTable";
import TrackedTable from "./TrackedTable";

interface TableContainerProps {
  type: "event" | "tracked";
  data: any[];
  loading: boolean;
  onRefresh: () => void;
  filters: any;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  type,
  data,
  loading,
  onRefresh,
  filters,
}) => {
  return (
    <div className="table-container">
      {loading ? (
        <div style={{ padding: 32 }}>加载中...</div>
      ) : type === "event" ? (
        <EventTable data={data} filters={filters} onRefresh={onRefresh} />
      ) : (
        <TrackedTable data={data} filters={filters} onRefresh={onRefresh} />
      )}
    </div>
  );
};

export default TableContainer;