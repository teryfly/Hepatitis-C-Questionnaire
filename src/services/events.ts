import { fetchWithAuth } from "./http";
import { getDataElementsMap } from "./dataElements";
import { getOrgUnits } from "./orgUnits";

type Filters = {
  orgUnits?: string[];
  programId?: string;
  dateRange?: { start?: string; end?: string };
  pageSize?: number | string;
  page?: number | string;
};

// 获取事件（阶段）数据列表（API-08）
export async function getEventsList(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.orgUnits?.length) {
    params.append("orgUnits", filters.orgUnits[filters.orgUnits.length - 1]);
  }
  if (filters.programId) params.append("program", filters.programId);
  if (filters.dateRange?.start) params.append("occurredAfter", filters.dateRange.start);
  if (filters.dateRange?.end) params.append("occurredBefore", filters.dateRange.end);

  params.append("fields", "event,status,deleted,dataValues,orgUnit,occurredAt");
  params.append("paging", "true");
  params.append("pageSize", String(filters.pageSize || "10"));
  params.append("page", String(filters.page || "1"));

  const url = `/tracker/events?${params.toString()}`;
  const res = await fetchWithAuth(url);

  // 预热机构映射缓存，确保名称可解析
  await getOrgUnits();
  const dataElementsMap = await getDataElementsMap();

  const events = (res.events || []).map((event: any) => {
    const orgUnitName = window.__ORG_UNIT_NAME_RESOLVER__?.(event.orgUnit) || event.orgUnit;
    return {
      ...event,
      orgUnitName,
      siteName: orgUnitName,
      occurredAt: event.occurredAt,
      status: event.status,
      statusText: event.status,
      dataValues: (event.dataValues || []).map((dv: any) => ({
        ...dv,
        displayName: dataElementsMap[dv.dataElement]?.name || dv.dataElement,
      })),
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