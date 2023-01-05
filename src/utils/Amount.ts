type AmountType = string | number;
export class Amount {
  static toFix(amount: AmountType, prefix: string = '', fractionDigits = 2, defaultValue: AmountType = '') {
    return amount || amount === 0 ? prefix + Number(amount).toFixed(fractionDigits) : defaultValue;
  }
}
