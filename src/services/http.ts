import { getInstance } from "@dhis2/app-runtime";

function isJSONResponse(resp: Response) {
  const ct = resp.headers?.get?.("content-type") || "";
  return typeof ct === "string" && ct.includes("application/json");
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const absolute = /^https?:\/\//i.test(url);

  if (!absolute) {
    const path = url.replace(/^\/+/, "");
    const runtime: any = getInstance();
    const dataEngine: any = runtime.getDataEngine ? runtime.getDataEngine() : runtime;

    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : undefined;

    const req = {
      method,
      path: path.startsWith("api/") ? path.replace(/^api\//, "") : path,
      params: undefined as any,
      headers: options.headers as Record<string, string> | undefined,
      body,
    };

    try {
      const res = await (dataEngine.request ? dataEngine.request(req) : (runtime as any).request(req));
      return res;
    } catch (e: any) {
      throw new Error(`请求失败: ${e?.message || e}`);
    }
  }

  let resp: Response;
  try {
    resp = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
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