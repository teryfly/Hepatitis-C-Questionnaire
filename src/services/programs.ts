import { fetchWithAuth } from "./http";

// 获取事件类/随访类项目列表（API-04-1, API-04-2）
export async function getPrograms(programType: "WITHOUT_REGISTRATION" | "WITH_REGISTRATION") {
  const filter = programType === "WITHOUT_REGISTRATION"
    ? "programType:eq:WITHOUT_REGISTRATION"
    : "programType:eq:WITH_REGISTRATION";
  const url = `/programs?filter=${filter}&fields=id,displayName&paging=false`;
  const res = await fetchWithAuth(url);
  return res.programs || [];
}