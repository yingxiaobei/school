/**
 * 动态插入项到数组
 * @param condition 插入条件
 * @param list 插入项数组
 * @return condition ? list : []
 */
export const insertWhen = <T = any>(condition: boolean, list: T[]): T[] => {
  return condition ? list : [];
};
