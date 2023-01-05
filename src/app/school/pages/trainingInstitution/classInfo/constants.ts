export const STATUS_CD: any = {
  '1': '未启用',
  '2': '启用',
};

// 收费模式
// 先学后付：1：一次性冻结 - 按课程结算  2：一次性冻结 - 按阶段结算   3：一次性冻结 - 按满小时结算
//4：一次性冻结 - 按计时结算  5：预约冻结 - 按课程结算
export type CHARGE_MODE_STUDY_FIRST_TYPE = '1' | '2' | '3' | '4' | '5';

// 先付后学：  1: 线下一次性收费     2：一次性托管 - 按课程结算   3：预约托管 - 按课程收费
export type CHARGE_MODE_PAY_FIRST_TYPE = '1' | '2' | '3';

// TODO: 此类型需要修改
export type CHARGE_MODE_TYPE = CHARGE_MODE_PAY_FIRST_TYPE;

export type TRAIN_MODE_TYPE = '1' | '2' | '3' | '9';
