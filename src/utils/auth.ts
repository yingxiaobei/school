export const Auth = {
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  },

  set(key: string, value: any) {
    //若值value=null,设置到localstorage再通过getItem获取，值为字符串'null',拦截器无法拦截，会导致接口报错
    if (value === undefined || value === null) return;
    localStorage.setItem(key, value);
  },

  get(key: string) {
    return localStorage.getItem(key);
  },

  del() {
    localStorage.clear();
  },
};
