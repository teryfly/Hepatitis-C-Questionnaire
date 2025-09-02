import { BASE_URL } from "../utils/baseUrl";

// 可选：在开发环境下启用 Basic Auth（用户名/密码来自 .env 或默认 admin/district）
const DEV_BASIC_USER = import.meta.env.VITE_BASIC_USER || "admin";
const DEV_BASIC_PASS = import.meta.env.VITE_BASIC_PASS || "district";
const USE_BASIC_AUTH = import.meta.env.MODE === "development";

function isJSONResponse(resp: Response) {
  const ct = resp.headers.get("content-type") || "";
  return ct.includes("application/json");
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const fullUrl = /^https?:\/\//i.test(url) ? url : `${BASE_URL}${url}`;

  const token = sessionStorage.getItem("dhis2.token") || "";
  const extraHeaders: HeadersInit = {};

  // 优先使用 Bearer，其次在开发模式下添加 Basic
  if (token) {
    (extraHeaders as any).Authorization = `Bearer ${token}`;
  } else if (USE_BASIC_AUTH) {
    const basic = btoa(`${DEV_BASIC_USER}:${DEV_BASIC_PASS}`);
    (extraHeaders as any).Authorization = `Basic ${basic}`;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...extraHeaders,
    ...options.headers,
  };

  let resp: Response;
  try {
    resp = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (err: any) {
    throw new Error(`网络错误: ${err?.message || err}`);
  }

  if (!resp.ok) {
    // 尝试读取文本以便输出错误详情（可能是HTML登录页或JSON错误）
    const text = await resp.text();
    // 如果不是 JSON，直接抛可读错误，避免 JSON.parse 报错
    if (!isJSONResponse(resp)) {
      const snippet = text.slice(0, 200);
      throw new Error(`请求失败(非JSON响应)：${resp.status} ${resp.statusText} - ${snippet}`);
    }
    throw new Error(`请求失败: ${resp.status} ${resp.statusText} - ${text}`);
  }

  // 仅当响应是 JSON 时再解析
  if (isJSONResponse(resp)) {
    return await resp.json();
  }
  // 非 JSON 场景（极少），返回原始文本
  return await resp.text();
}