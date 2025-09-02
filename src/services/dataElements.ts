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