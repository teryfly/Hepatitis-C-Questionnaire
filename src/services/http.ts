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
    const text = await resp.text();
    if (!isJSONResponse(resp)) {
      const snippet = text.slice(0, 1000);
      let human = snippet;
      const titleMatch = snippet.match(/<title>(.*?)<\/title>/i);
      if (titleMatch?.[1]) human = titleMatch[1];
      const bodyErr = snippet.match(/(error|exception|message)[^<>\n:]*[:>]\s*([^<\n]+)/i);
      if (bodyErr?.[2]) human = bodyErr[2];
      throw new Error(`请求失败(非JSON响应)：${resp.status} ${resp.statusText} - ${human}`);
    }
    throw new Error(`请求失败: ${resp.status} ${resp.statusText} - ${text}`);
  }

  if (isJSONResponse(resp)) {
    return await resp.json();
  }
  return await resp.text();
}