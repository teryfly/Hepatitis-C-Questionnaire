import { getInstance } from "@dhis2/app-runtime";

// Using app-runtime's engine; this is a lightweight wrapper to keep current API.
function isJSONResponse(resp: Response) {
  const ct = resp.headers?.get?.("content-type") || "";
  return typeof ct === "string" && ct.includes("application/json");
}

// Low-level fetch fallback for non-engine absolute URLs, but prefer engine for DHIS2 API calls.
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // If it's an absolute URL, use window.fetch (rare). Otherwise use app-runtime engine.
  const absolute = /^https?:\/\//i.test(url);

  if (!absolute) {
    // Normalize to relative api path without leading /api since engine injects it.
    // Accept both `/path` and `path`
    const path = url.replace(/^\/+/, "");
    const engine = getInstance().getD2Api();
    // If using engine.get/post isn't available, fall back to dataEngine.request
    const dataEngine: any = (getInstance() as any).getDataEngine?.() || (getInstance() as any);

    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : undefined;

    // Use dataEngine.request for full flexibility
    const req = {
      method,
      path: path.startsWith("api/") ? path.replace(/^api\//, "") : path,
      params: undefined,
      headers: options.headers as Record<string, string> | undefined,
      body,
    };

    try {
      const res = await (dataEngine.request ? dataEngine.request(req) : (engine as any).request(req));
      return res;
    } catch (e: any) {
      // Re-throw with message similar to previous helper
      throw new Error(`请求失败: ${e?.message || e}`);
    }
  }

  // Absolute URL fallback
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