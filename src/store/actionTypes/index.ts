/**
 * redux的 type常量
 * @param {name} string action 要 diapatch 的类型
 * @param {field} string action 要操作的字段名
 */
export default {
  SET_COLLAPSED: {
    name: 'SET_COLLAPSED',
    field: 'collapsed',
  },
  SET_CURTAB: {
    name: 'SET_CURTAB',
    field: 'curTab',
  },
  SET_RELOADPATH: {
    name: 'SET_RELOADPATH',
    field: 'reloadPath',
  },
};
