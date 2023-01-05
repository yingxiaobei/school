import { isEmpty } from 'lodash';

type TMenu = {
  children: TMenu[];
  code: string;
  parentId: string;
  title: string;
};

export function generateMenuMap(menus: TMenu[]) {
  const res: { [key: string]: string } = {};
  helper(menus);

  function helper(arr: TMenu[]) {
    for (let item of arr) {
      res[item.code] = item.title;
      if (!isEmpty(item.children)) {
        helper(item.children);
      }
    }
  }

  return res;
}

export function findFirstMenuPath(menus: any[]) {
  let res: string = '';
  helper(menus);

  function helper(arr: any[]) {
    const sortedArr = [...arr];
    sortedArr.sort((x, y) => x.orderNum - y.orderNum);

    for (let item of sortedArr) {
      if (res === '' && item.type === 'menu') {
        res = item.code;
      }

      if (res === '' && !isEmpty(item.children)) {
        helper(item.children);
      }
    }
  }

  return res;
}
