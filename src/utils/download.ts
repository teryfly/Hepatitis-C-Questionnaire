export function downloadCSV(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(field => `"${String(row[field] || "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function removeApiPath(url) {
  try {
    const urlObj = new URL(url);
    // 替换路径中的/api（兼容末尾带/和不带/的情况）
    urlObj.pathname = urlObj.pathname.replace(/^\/api(\/|$)/, '/');
    return urlObj.toString().replace(/([^:])\/+/g, '$1/');
  } catch {
    // 非标准URL时直接字符串处理
    return url.replace(/\/api(\/|$)/, '/');
  }
}