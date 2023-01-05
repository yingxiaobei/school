import { lazy } from 'react';

export const common = [
  {
    path: '/common/home',
    component: lazy(() => import('app/yantai/pages/common/home')),
  },
  {
    path: '/common/wenzhouHome',
    component: lazy(() => import('app/yantai/pages/common/wenzhouHome')),
  },
];
