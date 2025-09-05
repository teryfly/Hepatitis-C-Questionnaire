import React, { useEffect, useMemo, useState } from "react";
import { FiltersBar } from "../../components/filters/FiltersBar";
import { ActionBar } from "../../components/actions/ActionBar";
// import { SelectionInfo } from "../../components/info/SelectionInfo";
import { TableContainer } from "../../components/table/TableContainer";
import { useEventsList } from "../../hooks/useEventsList";
import { usePrograms } from "../../hooks/usePrograms";
import { fetchWithAuth } from "../../services/http";

const AUDIT_STATUS_DE_ID = "fYKOEbYKtCP";

function todayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 可复制文本的结果弹窗（统一用于申请/审核的结果提示）
const ResultModal: React.FC<{
  open: boolean;
  title: string;
  text: string;
  onClose: () => void;
}> = ({ open, title, text, onClose }) => {
  if (!open) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 忽略复制失败
    }
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
      role="dialog"
      aria-modal="true"
    >
      <div style={{ background: "#fff", width: "min(720px, 92vw)", maxHeight: "80vh", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <strong>{title}</strong>
          <div>
            <button onClick={copy} style={{ marginRight: 8 }}>复制</button>
            <button onClick={onClose}>关闭</button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <textarea
            readOnly
            value={text}
            style={{
              width: "100%",
              height: "50vh",
              whiteSpace: "pre-wrap",
              resize: "vertical",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: 12,
              lineHeight: 1.5
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const EventListView: React.FC<{ selectedProgramId: string }> = ({ selectedProgramId }) => {
  const [filters, setFilters] = useState<any>({ programId: selectedProgramId, page: 1, pageSize: 10 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [eventRowMap, setEventRowMap] = useState<Record<string, any>>({});
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultText, setResultText] = useState("");

  const { data: programsRaw, isLoading: loadingPrograms } = usePrograms("WITHOUT_REGISTRATION");
  const programs = useMemo(
    () => (programsRaw || []).filter((p: any) => p.id === selectedProgramId),
    [programsRaw, selectedProgramId]
  );

  useEffect(() => {
    setFilters((prev: any) => ({ ...prev, programId: selectedProgramId, page: 1 }));
  }, [selectedProgramId]);

  const { data, isLoading, refetch } = useEventsList(filters);

  useEffect(() => {
    if (data?.events) {
      const map: Record<string, any> = {};
      data.events.forEach((row: any) => (map[row.event] = row));
      setEventRowMap(map);
    }
  }, [data?.events]);

  // onChange={handleFiltersChange}
  // const handleFiltersChange = (next: any) => {
  //   const orgUnits = next.orgUnits ?? filters.orgUnits ?? [];
  //   const orgUnitId = orgUnits.length > 0 ? orgUnits[orgUnits.length - 1] : undefined;
  //   setFilters((f: any) => ({
  //     ...f,
  //     ...next,
  //     orgUnits,
  //     orgUnitId,
  //     page: 1
  //   }));
  // };

  const handlePageChange = (page: number) => {
    setFilters((f: any) => ({ ...f, page }));
  };
  const handlePageSizeChange = (pageSize: number) => {
    setFilters((f: any) => ({ ...f, pageSize, page: 1 }));
  };

  const handleSearch = () => {
    refetch();
  };

  // 更健壮地构建事件更新负载，确保包含 programStage、orgUnit、program 与 occurredAt
  const getSingleEventPayload = (row: any, statusValue: string) => {
    if (!row) return null;

    // 1) programStage: 优先使用接口返回的 programStage（已由服务层补充）
    const programStage =
      row.programStage ||
      row.programStageId ||
      (row.dataValues && row.dataValues.length && row.dataValues[0].programStage) ||
      undefined;

    // 2) program: 优先使用行内 program，其次使用当前筛选 programId
    const program = row.program || row.programId || filters.programId;

    // 3) orgUnit: 使用行内 orgUnit；如无则使用筛选得到的 orgUnitId
    const orgUnit = row.orgUnit || filters.orgUnitId;

    // 4) occurredAt：API-10 要求必须传；使用行内 occurredAt 或回退到当天日期
    const occurredAt = row.occurredAt?.slice(0, 10) || todayDate();

    if (!programStage || !program || !orgUnit || !occurredAt) return null;

    return {
      event: row.event,
      programStage,
      orgUnit,
      program,
      occurredAt,
      dataValues: [{ dataElement: AUDIT_STATUS_DE_ID, value: statusValue }]
    };
  };

  // 解析服务端导入错误信息
  const parseImportErrors = (resp: any): string[] => {
    const reasons: string[] = [];
    const push = (msg?: string) => {
      if (msg && typeof msg === "string") reasons.push(msg);
    };
    if (!resp) return reasons;

    const arrs = [
      resp.errors,
      resp.conflicts,
      resp.violations,
      resp.validationReport?.errors,
      resp.validationReport?.warnings,
      resp.bundleReport?.typeReportMap?.EVENT?.objectReports?.flatMap((r: any) => r.errorReports) || [],
      resp.bundleReport?.objectReports?.flatMap((r: any) => r.errorReports) || [],
      resp.response?.conflicts
    ].filter(Boolean);
    for (const arr of arrs) {
      if (Array.isArray(arr)) {
        for (const it of arr) push(it?.message || it?.error || it?.value || JSON.stringify(it));
      }
    }
    push(resp.message);
    push(resp.description);

    const summaries = resp.importSummaries || resp.events || resp.responses;
    if (Array.isArray(summaries)) {
      for (const s of summaries) {
        push(s?.description || s?.message);
        if (Array.isArray(s?.conflicts)) for (const c of s.conflicts) push(c?.value || c?.object || c?.message);
        if (Array.isArray(s?.errorReports)) for (const er of s.errorReports) push(er?.message || er?.mainKlass);
      }
    }

    return Array.from(new Set(reasons)).slice(0, 20);
  };

  // 统一执行申请/审核，展示可复制结果
  const batchUpdate = async (statusValue: string, actionTitle: string) => {
    if (selectedIds.length === 0) {
      setResultTitle(`${actionTitle}结果`);
      setResultText(`请先选择要${actionTitle}的数据行！`);
      setResultOpen(true);
      return;
    }
    if (!window.confirm(`确定批量将所选数据${actionTitle}吗？`)) return;

    let success = 0,
      fail = 0;
    const errorDetails: Array<{ id: string; reason: string }> = [];

    for (const eventId of selectedIds) {
      const row = eventRowMap[eventId];
      const eventPayload = getSingleEventPayload(row, statusValue);
      if (!eventPayload) {
        fail++;
        errorDetails.push({ id: eventId, reason: "构建事件负载失败（缺少 programStage/orgUnit/occurredAt）" });
        continue;
      }
      try {
        const resp = await fetchWithAuth("/tracker?async=false&importStrategy=UPDATE", {
          method: "POST",
          body: JSON.stringify({ events: [eventPayload] })
        });
        const reasons = parseImportErrors(resp);
        if (reasons.length > 0) {
          fail++;
          errorDetails.push({ id: eventId, reason: reasons.join("；") });
        } else {
          success++;
        }
      } catch (e: any) {
        fail++;
        let reason = e?.message || String(e);
        try {
          const match = reason.match(/\{.*\}$/s);
          if (match) {
            const json = JSON.parse(match[0]);
            const reasons = parseImportErrors(json);
            if (reasons.length > 0) reason = reasons.join("；");
          }
        } catch {
          // ignore
        }
        errorDetails.push({ id: eventId, reason });
      }
    }

    const detailText =
      errorDetails.length > 0
        ? "\n失败明细：\n" + errorDetails.map((e) => `- 事件 ${e.id}: ${e.reason}`).join("\n")
        : "";

    setResultTitle(`${actionTitle}结果`);
    setResultText(`${actionTitle}成功：${success}条，失败：${fail}条${detailText}`);
    setResultOpen(true);

    refetch();
    setSelectedIds([]);
    setShowAudit(false);
  };

  const handleApply = async () => {
    await batchUpdate("1", "申请为待审核");
  };

  const handleAudit = () => {
    if (selectedIds.length === 0) {
      setResultTitle("审核结果");
      setResultText("请先选择要审核的数据行！");
      setResultOpen(true);
      return;
    }
    setShowAudit(true);
  };

  const handleAuditSubmit = async (status: "2" | "3") => {
    await batchUpdate(status, status === "3" ? "审核通过" : "审核不通过");
  };

  const AuditDialog = () => (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999
      }}
    >
      <div style={{ background: "#fff", padding: 32, borderRadius: 8, minWidth: 320 }}>
        <h3>批量审核</h3>
        <p>已选 {selectedIds.length} 行，选择审核结果：</p>
        <button
          onClick={() => handleAuditSubmit("3")}
          style={{ marginRight: 16, background: "#e8f6ff", color: "#2563eb", fontWeight: "bold" }}
        >
          通过（已审核）
        </button>
        <button
          onClick={() => handleAuditSubmit("2")}
          style={{ background: "#fff8e1", color: "#e08e00", fontWeight: "bold" }}
        >
          不通过（待修改）
        </button>
        <button onClick={() => setShowAudit(false)} style={{ float: "right" }}>
          取消
        </button>
      </div>
    </div>
  );

  const handleSelectionChange = (ids: string[]) => setSelectedIds(ids);

  // dataValues中找fYKOEbYKtCP的值做审核状态筛选
  const filteredEvents = useMemo(() => {
    if (!filters.auditStatus || !data?.events) return data?.events || [];
    return data.events.filter((evt: any) => {
      const auditDE = (evt.dataValues || []).find((dv: any) => dv.dataElement === AUDIT_STATUS_DE_ID);
      return auditDE?.value === filters.auditStatus;
    });
  }, [data, filters.auditStatus]);
  
  return (
    <div className="event-list-view">
      <FiltersBar
        type="event"
        programs={programs}
        isLoading={loadingPrograms}
        filters={filters}
        onChange={(f) => setFilters({ ...f, programId: selectedProgramId })}
        onSearch={handleSearch}
      />
      <ActionBar type="event" filters={filters} onRefresh={refetch} onApply={handleApply} onAudit={handleAudit} />
      {/* {selectedIds.length == 0 && ( 
        <SelectionInfo />
      )} */}
      <TableContainer
        type="event"
        data={filteredEvents}
        loading={isLoading}
        onRefresh={refetch}
        filters={{ ...filters, pager: data?.pager }}
        onSelectionChange={handleSelectionChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      {showAudit && <AuditDialog />}
      <ResultModal open={resultOpen} title={resultTitle} text={resultText} onClose={() => setResultOpen(false)} />
    </div>
  );
};