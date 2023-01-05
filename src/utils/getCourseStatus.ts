export const NOT_RELEASE = 'NOT_RELEASE'; // 未发布
export const EXPIRED = 'EXPIRED'; // 已过期
export const FILLED = 'FILLED'; // 已约满
export const CAN_APPOINTMENT = 'CAN_APPOINTMENT'; // 可约

export function getCourseStatus(status: any) {
  if (String(status) === '0') return NOT_RELEASE;
  if (String(status) === '3') return EXPIRED;
  if (String(status) === '2') return FILLED;
  if (String(status) === '1') return CAN_APPOINTMENT;
}
