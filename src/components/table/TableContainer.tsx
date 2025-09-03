import React, { useState } from "react";
import EventTable from "./EventTable";
import TrackedTable from "./TrackedTable";
import PaginationBar from "./PaginationBar";

interface TableContainerProps {
  type: "event" | "tracked";
  data: any[];
  loading: boolean;
  onRefresh: () => void;
  filters: any;
  onSelectionChange?: (selectedIds: string[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  type,
  data,
  loading,
  onRefresh,
  filters,
  onSelectionChange,
  onPageChange,
  onPageSizeChange
}) => {
  const total = filters?.pager?.total || 0;
  const page = filters?.pager?.page || 1;
  const pageSize = filters?.pager?.pageSize || 10;

  return (
    <div className="table-container">
      {loading ? (
        <div style={{ padding: 32 }}>加载中...</div>
      ) : type === "event" ? (
        <EventTable
          data={data}
          filters={filters}
          onRefresh={onRefresh}
          onSelectionChange={onSelectionChange}
        />
      ) : (
        <TrackedTable
          data={data}
          filters={filters}
          onRefresh={onRefresh}
          onSelectionChange={onSelectionChange}
        />
      )}
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange || (() => {})}
      />
    </div>
  );
};

export default TableContainer;