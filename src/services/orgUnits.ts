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

let dataCache: Record<string, any>[] = [];

// 获取元数据中的programTrackedEntityAttributes
export async function getProgramTrackedEntityAttributes(programId): Promise<Record<string, any>[]> {
  if (dataCache.length > 0) {
    return dataCache;
  }
  try {
    const res = await fetchWithAuth(`/29/metadata?fields=%3Aowner%2CdisplayName&programs%3Afilter=id%3Aeq%3A${programId}&programs%3Afields=%3Aowner%2CdisplayName%2CattributeValues%5B%3Aall%2Cattribute%5Bid%2Cname%2CdisplayName%5D%5D%2CorganisationUnits%5Bid%2Cpath%5D%2CdataEntryForm%5B%3Aowner%5D%2CprogramSections%5Bid%2Cname%2CdisplayName%2CrenderType%2Cprogram%2CsortOrder%2ClastUpdated%2CtrackedEntityAttributes%5Bid%2Cname%2CdisplayName%2CsortOrder%5D%5D%2CnotificationTemplates%5B%3Aowner%5D%2CprogramTrackedEntityAttributes%2Cuser%5Bid%2Cname%5D%2CcategoryCombo%5Bid%2Cname%5D%2CprogramStages%5B%3Aowner%2Cuser%5Bid%2Cname%5D%2CdisplayName%2CattributeValues%5B%3Aall%2Cattribute%5Bid%2Cname%2CdisplayName%5D%5D%2CprogramStageDataElements%5B%3Aowner%2CrenderType%2CdataElement%5Bid%2CdisplayName%2CvalueType%2CoptionSet%2CdomainType%5D%5D%2CnotificationTemplates%5B%3Aowner%2CdisplayName%5D%2CdataEntryForm%5B%3Aowner%5D%2CprogramStageSections%5B%3Aowner%2CdisplayName%2CdataElements%5Bid%2CdisplayName%5D%5D%5D&dataElements%3Afields=id%2CdisplayName%2CvalueType%2CoptionSet&dataElements=`);
    dataCache = [];
    if(res && 
      res.programs && 
      res.programs.length > 0 && 
      res.programs[0].programTrackedEntityAttributes &&
      res.programs[0].programTrackedEntityAttributes.length > 0 
    ) {
      dataCache = res.programs[0].programTrackedEntityAttributes
      .filter(item => item.displayInList == true)
      .map(({ displayName, displayInList, trackedEntityAttribute }) => ({ displayName, displayInList, id:trackedEntityAttribute.id }))
    }
    return dataCache;
  } catch {
    return [];
  }
}

export function filterAndMergeData(attributes: any[], titleData: any[]): any[] {
  // 收集titleData中的所有id
  const titleIds = titleData.map(item => item.id);
  
  // 先过滤attributes中匹配titleData.id的记录
  const filteredData = attributes.filter(item => titleIds.includes(item.attribute));
  
  // 保留value值
  const result = filteredData.map(item => ({
    ...item,
    // 确保其他字段不变
  }));

  // 添加titleData中有但attributes中没有的记录
  const missingIds = titleIds.filter(id => !attributes.some(item => item.attribute === id));
  missingIds.forEach(id => {
    result.push({
      attribute: id,
      value: null, // 值为空
      // 其他字段可以添加默认值或保持为undefined
    });
  });

  return result;
}
