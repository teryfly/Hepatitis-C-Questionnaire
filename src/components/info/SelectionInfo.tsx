import React from "react";

export const SelectionInfo: React.FC = () => {
  // 可扩展为显示当前选中行、汇总信息等
  return (
    <div className="selection-info">
      ℹ 未选中任何数据
    </div>
  );
};

export default SelectionInfo;