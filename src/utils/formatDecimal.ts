//保留小数点后n位，不四舍五入
export function formatDecimal(num: string | number, decimal: number) {
  num = num.toString();
  let index = num.indexOf('.');
  if (index !== -1) {
    num = num.substring(0, decimal + index + 1);
  } else {
    num = num.substring(0);
  }
  return parseFloat(num).toFixed(decimal);
}
