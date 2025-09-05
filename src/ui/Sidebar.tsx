import React, { useEffect, useMemo, useState } from "react";
import { Button, Divider } from "@dhis2/ui";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPrograms } from "../services/programs";
import "./Sidebar.css";

type ProgramType = "WITHOUT_REGISTRATION" | "WITH_REGISTRATION";
interface ProgramItem { id: string; displayName: string; }

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [eventPrograms, setEventPrograms] = useState<ProgramItem[]>([]);
  const [trackedPrograms, setTrackedPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState({ event: false, tracked: false });

  const activeProgramType: ProgramType | null = useMemo(() => {
    if (location.pathname.startsWith("/questionnaire/WITHOUT_REGISTRATION")) return "WITHOUT_REGISTRATION";
    if (location.pathname.startsWith("/questionnaire/WITH_REGISTRATION")) return "WITH_REGISTRATION";
    return null;
  }, [location.pathname]);

  useEffect(() => {
    const loadEvent = async () => {
      if (eventPrograms.length > 0 || loading.event) return;
      setLoading(prev => ({ ...prev, event: true }));
      try {
        const list = await getPrograms("WITHOUT_REGISTRATION");
        const filterList = list.length > 0 ? list.filter(item => ["CEnNqHb6CHw"].includes(item.id)) : [];
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
        const filterList = list.length > 0 ? list.filter(item => ["uiyqEyZboeV"].includes(item.id)) : [];
        setTrackedPrograms(filterList);
      } finally {
        setLoading(prev => ({ ...prev, tracked: false }));
      }
    };
    if (activeProgramType === "WITHOUT_REGISTRATION") loadEvent();
    if (activeProgramType === "WITH_REGISTRATION") loadTracked();
  }, [activeProgramType, eventPrograms.length, trackedPrograms.length, loading.event, loading.tracked]);

  const handleGroupClick = (type: ProgramType) => {
    navigate(`/questionnaire/${type}`);
  };

  const linkClass = (to: string) =>
    location.pathname === to ? "sidebar-link sidebar-link-active" : "sidebar-link";

  return (
    <div className="sidebar">
      <div className="sidebar-title">丙肝问卷系统</div>

      <div className="sidebar-group">
        <div className="sidebar-group-title">问卷调查</div>

        <Button
          small
          secondary
          className={location.pathname.startsWith("/questionnaire/WITHOUT_REGISTRATION") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
          onClick={() => handleGroupClick("WITHOUT_REGISTRATION")}
        >
          事件项目
        </Button>
        {location.pathname.startsWith("/questionnaire/WITHOUT_REGISTRATION") && (
          <div className="sidebar-sublist">
            {loading.event && <div className="sidebar-group-title">加载中...</div>}
            {!loading.event && eventPrograms.map((p) => (
              <Link
                to={`/questionnaire/WITHOUT_REGISTRATION/${p.id}`}
                key={p.id}
                className={linkClass(`/questionnaire/WITHOUT_REGISTRATION/${p.id}`)}
              >
                {p.displayName}
              </Link>
            ))}
            {!loading.event && eventPrograms.length === 0 && (
              <div className="sidebar-group-title">无可用项目</div>
            )}
          </div>
        )}

        <Divider margin="8px 0" />

        <Button
          small
          secondary
          className={location.pathname.startsWith("/questionnaire/WITH_REGISTRATION") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
          onClick={() => handleGroupClick("WITH_REGISTRATION")}
        >
          随访项目
        </Button>
        {location.pathname.startsWith("/questionnaire/WITH_REGISTRATION") && (
          <div className="sidebar-sublist">
            {loading.tracked && <div className="sidebar-group-title">加载中...</div>}
            {!loading.tracked && trackedPrograms.map((p) => (
              <Link
                to={`/questionnaire/WITH_REGISTRATION/${p.id}`}
                key={p.id}
                className={linkClass(`/questionnaire/WITH_REGISTRATION/${p.id}`)}
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
    </div>
  );
};