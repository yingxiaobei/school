// TODO: 该功能类 可能会有bug 建议使用 lodash提供的方法
class Util {
  static isString(params: any): params is string {
    return typeof params === 'string';
  }

  static isNumber(params: any): params is number {
    return typeof params === 'number';
  }

  static isNullAble(params: any): params is null {
    return params == null;
  }

  static isArray(params: any): params is [] {
    return params instanceof Array;
  }

  static isObject(params: any): params is object {
    return params != null && typeof params === 'object';
  }

  static changeArrayToString(params: string | unknown[], str: string = ',') {
    return this.isArray(params) ? params.join(str) : '';
  }

  static changeStringToArray(params: string | unknown[], str: string = ',') {
    return this.isString(params) ? params.split(str) : [];
  }
}

export default Util;
