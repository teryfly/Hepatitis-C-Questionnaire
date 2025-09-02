import React from "react";
import { useParams } from "react-router-dom";
import { EventListView } from "../features/events/EventListView";
import { TrackedListView } from "../features/tracked/TrackedListView";

export const QuestionnairePage: React.FC = () => {
  const { programType, programId } = useParams();

  const isEvent = programType === "WITHOUT_REGISTRATION";
  const isTracked = programType === "WITH_REGISTRATION";

  // 未选择具体项目时，显示提示，不加载C-2筛选条
  if (isEvent || isTracked) {
    if (!programId) {
      return (
        <div style={{ padding: 24 }}>
          <h2>请选择具体项目</h2>
          <p>请在左侧展开的“{isEvent ? "事件项目" : "随访项目"}”列表中，点击某个项目后加载筛选与数据。</p>
        </div>
      );
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {isEvent ? <EventListView selectedProgramId={programId!} /> : <TrackedListView selectedProgramId={programId!} />}
    </div>
  );
};