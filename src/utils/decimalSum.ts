// 小数求和，解决精度问题
export function decimalSum(...args: number[]): number {
  let multiple = 0;

  args.forEach((n: number) => {
    const len = String(n).split('.')[1] ? String(n).split('.')[1].length : 0;
    multiple = Math.max(multiple, len);
  });

  multiple = Math.pow(10, multiple);

  return args.reduce((acc: number, n: number) => acc + Math.round(n * multiple), 0) / multiple;
}
