import { lazy } from 'react';

export const userCenter = [
  {
    path: '/userCenter/operateLog',
    component: lazy(() => import('app/school/pages/userCenter/operateLog')),
  },
  {
    path: '/userCenter/organizationManage',
    component: lazy(() => import('app/school/pages/userCenter/organizationManage')),
  },
  {
    path: '/userCenter/roleManage',
    component: lazy(() => import('app/school/pages/userCenter/roleManage')),
  },
  {
    path: '/userCenter/userManage',
    component: lazy(() => import('app/school/pages/userCenter/userManage')),
  },
];
