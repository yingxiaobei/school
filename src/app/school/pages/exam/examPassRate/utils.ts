import { _get } from 'utils';
/**
 * 单元格动态合并处理
 * @param text 当前单元格的值
 * @param data 当前分页所有数据
 * @param key 当前列的dataIndex
 * @param index 当前数据所在下标
 * @returns {number} 待合并单元格数量
 */
export function mergeCells(text: any, data: object[][], key: any, index: number) {
  // TODO key在使用的地方为string
  // 上一行该列数据是否一样
  if (_get(data, 'length', 0) === 0) {
    return;
  }
  if (index !== 0 && text === data[index - 1]?.[key]) {
    return 0;
  }
  let rowSpan = 1;
  // 判断下一行是否相等
  for (let i = index + 1; i < data.length; i++) {
    if (text !== data[i]?.[key]) {
      break;
    }
    rowSpan++;
  }
  return rowSpan;
}
