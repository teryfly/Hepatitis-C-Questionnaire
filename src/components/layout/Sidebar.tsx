import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { getPrograms } from "../../services/programs";

type ProgramType = "WITHOUT_REGISTRATION" | "WITH_REGISTRATION";

interface ProgramItem {
  id: string;
  displayName: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [eventPrograms, setEventPrograms] = useState<ProgramItem[]>([]);
  const [trackedPrograms, setTrackedPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState<{ event: boolean; tracked: boolean }>({
    event: false,
    tracked: false,
  });

  const activeProgramType: ProgramType | null = useMemo(() => {
    if (location.pathname.startsWith("/questionnaire/WITHOUT_REGISTRATION")) return "WITHOUT_REGISTRATION";
    if (location.pathname.startsWith("/questionnaire/WITH_REGISTRATION")) return "WITH_REGISTRATION";
    return null;
  }, [location.pathname]);

  useEffect(() => {
    // 仅在展开时加载，避免无谓请求
    const loadEvent = async () => {
      if (eventPrograms.length > 0 || loading.event) return;
      setLoading(prev => ({ ...prev, event: true }));
      try {
        const list = await getPrograms("WITHOUT_REGISTRATION");
        const filterList = list.length > 0 ? list.filter(item => 
          ["CEnNqHb6CHw" ].includes(item.id)
          // ["CEnNqHb6CHw", "dB3MQfQHGxi","XlTmqsmRggy" ].includes(item.id)
        ):[]
        setEventPrograms(filterList);
      } finally {
        setLoading(prev => ({ ...prev, event: false }));
      }
    };
    const loadTracked = async () => {
      if (trackedPrograms.length > 0 || loading.tracked) return;
      setLoading(prev => ({ ...prev, tracked: true }));
      try {
        const list = await getPrograms("WITH_REGISTRATION");
        const filterList = list.length > 0 ? list.filter(item => 
          ["uiyqEyZboeV"].includes(item.id)
          // ["uiyqEyZboeV", "m0vJjxXFuGH", "XtWFypbYGF0"].includes(item.id)
        ):[]
        setTrackedPrograms(filterList);
      } finally {
        setLoading(prev => ({ ...prev, tracked: false }));
      }
    };

    if (activeProgramType === "WITHOUT_REGISTRATION") loadEvent();
    if (activeProgramType === "WITH_REGISTRATION") loadTracked();
  }, [activeProgramType, eventPrograms.length, trackedPrograms.length, loading.event, loading.tracked]);

  const handleGroupClick = (type: ProgramType) => {
    // 切换到对应类型根路由，但不带 programId
    navigate(`/questionnaire/${type}`);
  };

  const isActiveRoot = (type: ProgramType) =>
    location.pathname === `/questionnaire/${type}` ||
    location.pathname.startsWith(`/questionnaire/${type}`);

  return (
    <aside className="sidebar">
      <div className="sidebar-title">丙肝问卷系统</div>

      <div className="sidebar-group">
        <div className="sidebar-group-title">问卷调查</div>

        <button
          className={isActiveRoot("WITHOUT_REGISTRATION") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
          onClick={() => handleGroupClick("WITHOUT_REGISTRATION")}
          style={{ textAlign: "left", width: "100%", background: "transparent" }}
        >
          事件项目
        </button>
        {isActiveRoot("WITHOUT_REGISTRATION") && (
          <div style={{ paddingLeft: 12 }}>
            {loading.event && <div className="sidebar-group-title">加载中...</div>}
            {!loading.event &&
              eventPrograms.map((p) => (
                <Link
                  to={`/questionnaire/WITHOUT_REGISTRATION/${p.id}`}
                  key={p.id}
                  className={
                    location.pathname === `/questionnaire/WITHOUT_REGISTRATION/${p.id}`
                      ? "sidebar-link sidebar-link-active"
                      : "sidebar-link"
                  }
                >
                  {p.displayName}
                </Link>
              ))}
            {!loading.event && eventPrograms.length === 0 && (
              <div className="sidebar-group-title">无可用项目</div>
            )}
          </div>
        )}

        <button
          className={isActiveRoot("WITH_REGISTRATION") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
          onClick={() => handleGroupClick("WITH_REGISTRATION")}
          style={{ textAlign: "left", width: "100%", background: "transparent" }}
        >
          随访项目
        </button>
        {isActiveRoot("WITH_REGISTRATION") && (
          <div style={{ paddingLeft: 12 }}>
            {loading.tracked && <div className="sidebar-group-title">加载中...</div>}
            {!loading.tracked &&
              trackedPrograms.map((p) => (
                <Link
                  to={`/questionnaire/WITH_REGISTRATION/${p.id}`}
                  key={p.id}
                  className={
                    location.pathname === `/questionnaire/WITH_REGISTRATION/${p.id}`
                      ? "sidebar-link sidebar-link-active"
                      : "sidebar-link"
                  }
                >
                  {p.displayName}
                </Link>
              ))}
            {!loading.tracked && trackedPrograms.length === 0 && (
              <div className="sidebar-group-title">无可用项目</div>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-group">
        <div className="sidebar-group-title">统计分析</div>
      </div>
    </aside>
  );
};

export default Sidebar;