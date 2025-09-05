// 在开发环境直连远端DHIS2时可将 BASE_URL 设置为 'http://111.9.47.2:8089/api'
// 在部署到 DHIS2 App 后，保持为 '/api'
export const BASE_URL = window.appConfig?.VITE_API_BASE || import.meta.env.VITE_API_BASE || "/api";
