import React from "react";

export const HomePage: React.FC = () => (
  <div style={{ padding: 32 }}>
    <h1>丙肝问卷系统</h1>
    <p>请选择左侧的问卷项目进行填报或审核。</p>
    <ul>
      <li>点击“事件项目”或“随访项目”进入问卷列表</li>
      <li>可根据机构、时间、状态等筛选与管理数据</li>
      <li>支持新增、编辑、删除、审核等全流程操作</li>
    </ul>
  </div>
);