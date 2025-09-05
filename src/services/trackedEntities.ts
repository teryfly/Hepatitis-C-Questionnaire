import { fetchWithAuth } from "./http";
import { 
  getOrgUnitName, 
  getProgramTrackedEntityAttributes,
  filterAndMergeData
 } from "./orgUnits";

// 随访数据列表（API-07）
export async function getTrackedEntitiesList(filters: any) {
  const params = new URLSearchParams();
  if (filters.orgUnits?.length)
    params.append("orgUnits", filters.orgUnits[filters.orgUnits.length - 1]);
  if (filters.programId) params.append("program", filters.programId);
  if (filters.dateRange?.start)
    params.append("enrollmentEnrolledAfter", filters.dateRange.start);
  if (filters.dateRange?.end)
    params.append("enrollmentEnrolledBefore", filters.dateRange.end);

  params.append(
    "fields",
    "trackedEntity,createdAt,updatedAt,deleted,attributes,enrollments,orgUnit"
  );
  params.append("paging", "true");
  params.append("pageSize", filters.pageSize || "10");
  params.append("page", filters.page || "1");

  const url = `/tracker/trackedEntities?${params.toString()}`;
  const res = await fetchWithAuth(url);
  const titleData = await getProgramTrackedEntityAttributes(filters.programId);
  const trackedEntities = (res.trackedEntities || []).map((te: any) => {
    const orgUnitName = getOrgUnitName(te.orgUnit);
    return {
      ...te,
      orgUnitName,
      siteName: orgUnitName,
      enrolledAt: te.createdAt,
      status: te.status,
      statusText: te.status,
      trackedEntity: te.trackedEntity,
      enrollment: te.enrollments?.[0]?.enrollment,
      programId: filters.programId,
      attributes: filterAndMergeData(te.attributes, titleData)
    };
  });

  return {
    ...res,
    trackedEntities,
    pager: res.pager,
  };
}