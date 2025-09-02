import { getEventsList } from "./events";
import { getTrackedEntitiesList } from "./trackedEntities";
import { downloadCSV } from "../utils/download";

export async function exportEvents(filters: any) {
  const result = await getEventsList({ ...filters, pageSize: 1000, page: 1 });
  const rows = result.events.map((e: any) => ({
    "报告地区": e.orgUnitName,
    "哨点单位": e.siteName,
    "调查日期": e.occurredAt,
    "状态": e.statusText,
    ...Object.fromEntries((e.dataValues || []).map((d: any) => [d.displayName, d.value])),
  }));
  downloadCSV("事件问卷导出.csv", rows);
}

export async function exportTracked(filters: any) {
  const result = await getTrackedEntitiesList({ ...filters, pageSize: 1000, page: 1 });
  const rows = result.trackedEntities.map((te: any) => ({
    "报告地区": te.orgUnitName,
    "哨点单位": te.siteName,
    "调查日期": te.enrolledAt,
    "状态": te.statusText
  }));
  downloadCSV("随访问卷导出.csv", rows);
}