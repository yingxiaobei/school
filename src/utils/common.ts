export function getBrowserInfo() {
  const userAgent = navigator.userAgent.toLowerCase();
  const match = userAgent.match(/(?:firefox|opera|safari|chrome|msie)[/: ]([\d.]+)/);
  return {
    version: match ? match[1] : null,
    isSafari: /version.+safari/.test(userAgent),
    isChrome: /chrome/.test(userAgent),
    isFirefox: /firefox/.test(userAgent),
    isIE: /msie/.test(userAgent),
    isOpera: /opera/.test(userAgent),
  };
}

/**
 * 获取cookies对象，传入key时获取单个字段
 * @param 需要获取的cookie key
 */
export function getCookies(key?: string) {
  const cookies: any = {};
  window.document.cookie.split(';').forEach((item) => {
    const [k, v] = item.split('=');
    cookies[k.trim()] = v && v.trim();
  });
  return key ? cookies[key] : cookies;
}

export const isPromise = (obj: any) => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};
