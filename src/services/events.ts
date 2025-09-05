import { fetchWithAuth } from "./http";
import { 
  getDataElementsMap, 
  getProgramStageDataElements,
  filterAndMergeData } from "./dataElements";
import { getOrgUnits } from "./orgUnits";

type Filters = {
  orgUnits?: string[];
  programId?: string;
  dateRange?: { start?: string; end?: string };
  pageSize?: number | string;
  page?: number | string;
};

const statusMap: Record<string, string> = {
  "1": "待审核",
  "2": "待修改",
  "3": "已审核"
};

// 获取事件（阶段）数据列表（API-08）
export async function getEventsList(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.orgUnits?.length) {
    params.append("orgUnit", filters.orgUnits[filters.orgUnits.length - 1]);
  }
  if (filters.programId) params.append("program", filters.programId);
  if (filters.dateRange?.start) params.append("occurredAfter", filters.dateRange.start);
  if (filters.dateRange?.end) params.append("occurredBefore", filters.dateRange.end);

  // 补充 program 与 programStage 字段，便于后续UPDATE时构建有效负载
  params.append("fields", "event,status,deleted,dataValues,orgUnit,occurredAt,program,programStage");
  params.append("paging", "true");
  params.append("pageSize", String(filters.pageSize || "10"));
  params.append("page", String(filters.page || "1"));

  const url = `/tracker/events?${params.toString()}`;
  const res = await fetchWithAuth(url);
  // 预热机构映射缓存，确保名称可解析
  await getOrgUnits();
  const dataElementsMap = await getDataElementsMap();
  const titleData = await getProgramStageDataElements(filters.programId);
  const events = (res.events || []).map((event: any) => {
    const orgUnitName = window.__ORG_UNIT_NAME_RESOLVER__?.(event.orgUnit) || event.orgUnit;
    const fAndM = filterAndMergeData(event.dataValues, titleData)
    const dataValues =  (fAndM || event.dataValues || []).map((dv: any) => ({
        ...dv,
        displayName: dataElementsMap[dv.dataElement]?.name || dv.dataElement,
        valueName: dv.dataElement == "fYKOEbYKtCP" ? statusMap[dv.value]||dv.value:dv.value
      }))
    return {
      ...event,
      orgUnitName,
      siteName: orgUnitName,
      occurredAt: event.occurredAt,
      status: event.status,
      statusText: event.status,
      dataValues: dataValues,
    };
  });

  return {
    ...res,
    events,
    pager: res.pager,
  };
}

// 删除事件（API-11）
export async function deleteEvent(eventId: string) {
  const res = await fetchWithAuth(
    "/tracker?async=false&importStrategy=DELETE",
    {
      method: "POST",
      body: JSON.stringify({
        events: [{ event: eventId }],
      }),
    }
  );
  return res;
}

// 删除事件（API-11）
export async function deleteEnrollment(enrollment: string) {
  const res = await fetchWithAuth(
    "/tracker?async=false&importStrategy=DELETE",
    {
      method: "POST",
      body: JSON.stringify({
        enrollments: [{ enrollment: enrollment }],
      }),
    }
  );
  return res;
}