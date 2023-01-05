import { lazy } from 'react';

export const addService = [
  {
    path: '/addService/goodsManage',
    component: lazy(() => import('app/school/pages/addService/goodsManage')),
  },
  {
    path: '/addService/collectionWallet',
    component: lazy(() => import('app/school/pages/addService/collectionWallet')),
  },
];
