import { fetchWithAuth } from "./http";

// 审核状态数据元ID（事件型）
export const AUDIT_STATUS_DE_ID = "fYKOEbYKtCP";

/**
 * 批量更新事件的“审核状态”数据元
 * @param eventIds 事件ID数组
 * @param statusValue 审核状态值：1 待审核；2 待修改；3 已审核
 */
export async function bulkUpdateEventAuditStatus(eventIds: string[], statusValue: "1" | "2" | "3") {
  if (!eventIds.length) return;
  const payload = {
    events: eventIds.map((event) => ({
      event,
      dataValues: [
        {
          dataElement: AUDIT_STATUS_DE_ID,
          value: statusValue,
        },
      ],
    })),
  };
  return fetchWithAuth("/tracker?async=false&importStrategy=UPDATE", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}