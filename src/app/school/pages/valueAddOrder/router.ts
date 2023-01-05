import { lazy } from 'react';

export const valueAddOrder = [
  {
    path: '/valueAddOrder/saleByMe',
    component: lazy(() => import('app/school/pages/valueAddOrder/saleByMe')),
  },
  {
    path: '/valueAddOrder/withdrawalApplication',
    component: lazy(() => import('app/school/pages/valueAddOrder/withdrawalApplication')),
  },
  {
    path: '/valueAddOrder/soldByMe',
    component: lazy(() => import('app/school/pages/valueAddOrder/soldByMe')),
  },
];
