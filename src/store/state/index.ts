interface StoreState {
  collapsed: boolean;
  curTab: string[];
  reloadPath: string;
}

const initState: StoreState = {
  collapsed: false, // 菜单收纳状态
  curTab: [], // 当前tab页面
  reloadPath: 'null', // 需要刷新的tab路径
};

export default initState;
