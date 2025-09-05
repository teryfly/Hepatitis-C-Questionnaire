import { fetchWithAuth } from "./http";

let cache: Record<string, any> | null = null;

// 获取所有数据元（API-01），并建立ID映射
export async function getDataElementsMap(): Promise<Record<string, any>> {
  if (cache) return cache;
  const res = await fetchWithAuth("/dataElements.json?paging=false&fields=id,name");
  cache = {};
  for (const de of res.dataElements || []) {
    cache[de.id] = de;
  }
  return cache;
}

let metadataCache: Record<string, any>[] = [];

// 获取元数据中的programStageDataElements
export async function getProgramStageDataElements(programId): Promise<Record<string, any>[]> {
  if (metadataCache.length > 0) {
    return metadataCache;
  }
  try {
    const res = await fetchWithAuth(`/29/metadata?fields=%3Aowner%2CdisplayName&programs%3Afilter=id%3Aeq%3A${programId}&programs%3Afields=%3Aowner%2CdisplayName%2CattributeValues%5B%3Aall%2Cattribute%5Bid%2Cname%2CdisplayName%5D%5D%2CorganisationUnits%5Bid%2Cpath%5D%2CdataEntryForm%5B%3Aowner%5D%2CprogramSections%5Bid%2Cname%2CdisplayName%2CrenderType%2Cprogram%2CsortOrder%2ClastUpdated%2CtrackedEntityAttributes%5Bid%2Cname%2CdisplayName%2CsortOrder%5D%5D%2CnotificationTemplates%5B%3Aowner%5D%2CprogramTrackedEntityAttributes%2Cuser%5Bid%2Cname%5D%2CcategoryCombo%5Bid%2Cname%5D%2CprogramStages%5B%3Aowner%2Cuser%5Bid%2Cname%5D%2CdisplayName%2CattributeValues%5B%3Aall%2Cattribute%5Bid%2Cname%2CdisplayName%5D%5D%2CprogramStageDataElements%5B%3Aowner%2CrenderType%2CdataElement%5Bid%2CdisplayName%2CvalueType%2CoptionSet%2CdomainType%5D%5D%2CnotificationTemplates%5B%3Aowner%2CdisplayName%5D%2CdataEntryForm%5B%3Aowner%5D%2CprogramStageSections%5B%3Aowner%2CdisplayName%2CdataElements%5Bid%2CdisplayName%5D%5D%5D&dataElements%3Afields=id%2CdisplayName%2CvalueType%2CoptionSet&dataElements=`);
    metadataCache = [];
    if(res && 
      res.programs && 
      res.programs.length > 0 && 
      res.programs[0].programStages &&
      res.programs[0].programStages.length > 0 &&
      res.programs[0].programStages[0].programStageDataElements &&
      res.programs[0].programStages[0].programStageDataElements.length > 0 
    ) {
      metadataCache = res.programs[0].programStages[0].programStageDataElements
      .filter(item => item.displayInReports == true)
      .map(({ dataElement, displayInReports }) => ({ ...dataElement, displayInReports }))
    }
    return metadataCache;
  } catch {
    return [];
  }
}

export function filterAndMergeData(dataValues: any[], titleData: any[]): any[] {
  // 收集titleData中的所有id
  const titleIds = titleData.map(item => item.id);
  
  // 先过滤dataValues中匹配titleData.id的记录
  const filteredData = dataValues.filter(item => titleIds.includes(item.dataElement));
  
  // 保留value值
  const result = filteredData.map(item => ({
    ...item,
    // 确保其他字段不变
  }));

  // 添加titleData中有但dataValues中没有的记录
  const missingIds = titleIds.filter(id => !dataValues.some(item => item.dataElement === id));
  missingIds.forEach(id => {
    result.push({
      dataElement: id,
      value: null, // 值为空
      // 其他字段可以添加默认值或保持为undefined
    });
  });

  return result;
}
