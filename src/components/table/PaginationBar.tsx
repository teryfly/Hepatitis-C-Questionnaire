import React from "react";

interface PaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  const pageCount = Math.ceil(total / pageSize);

  return (
    <div className="pagination-bar" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* 共{total}条数据 */}
      <button onClick={() => onPageChange(1)} disabled={page === 1}>{"<<"}</button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>{"<"}</button>
      <span>第 {page} 页 
        {/* / 共 {pageCount} 页 */}
        </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>{" > "}</button>
      <button onClick={() => onPageChange(pageCount)} disabled={page === pageCount}>{" >> "}</button>
      <select
        value={pageSize}
        onChange={e => onPageSizeChange(Number(e.target.value))}
        style={{ marginLeft: 12 }}
      >
        {[10, 20, 50, 100].map(size => (
          <option key={size} value={size}>{size}条/页</option>
        ))}
      </select>
    </div>
  );
};

export default PaginationBar;