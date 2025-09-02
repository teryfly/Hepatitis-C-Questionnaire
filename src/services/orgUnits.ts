import { fetchWithAuth } from "./http";

let orgUnitMap: Record<string, { id: string; displayName: string }> = {};
let orgUnitsCache: Array<{ id: string; displayName: string }> = [];

declare global {
  interface Window {
    __ORG_UNIT_NAME_RESOLVER__?: (id: string) => string;
  }
}

export async function getOrgUnits(): Promise<Array<{ id: string; displayName: string }>> {
  if (orgUnitsCache.length > 0) return orgUnitsCache;
  // 使用正确的API，仅请求 id 和 displayName
  const res = await fetchWithAuth("/organisationUnits?fields=id,displayName");
  const units: Array<{ id: string; displayName: string }> = res.organisationUnits || [];
  orgUnitsCache = units;
  orgUnitMap = {};
  for (const unit of units) {
    orgUnitMap[unit.id] = { id: unit.id, displayName: unit.displayName };
  }
  // 设置一个全局解析器，供其它模块解析名称
  if (!window.__ORG_UNIT_NAME_RESOLVER__) {
    window.__ORG_UNIT_NAME_RESOLVER__ = (id: string) => orgUnitMap[id]?.displayName || id;
  }
  return units;
}

export async function getOrgUnitDetail(id: string): Promise<{ id: string; name: string }> {
  // 细节接口在需求中未使用 parent，这里也保持精简
  const data = await fetchWithAuth(`/organisationUnits/${id}?fields=id,name`);
  return data;
}

export function getOrgUnitName(id: string): string {
  return orgUnitMap[id]?.displayName || id;
}