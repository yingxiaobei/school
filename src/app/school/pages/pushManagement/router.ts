import { lazy } from 'react';

export const pushManagement = [
  {
    path: '/pushManagement/studentPushRecord',
    component: lazy(() => import('app/school/pages/pushManagement/studentPushRecord')),
  },
];
