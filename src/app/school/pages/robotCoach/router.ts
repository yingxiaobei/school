import { lazy } from 'react';

export const robotCoach = [
  {
    path: '/robotCoach/monitorManage',
    component: lazy(() => import('app/school/pages/robotCoach/monitorManage')),
  },
  {
    path: '/robotCoach/nvrSet',
    component: lazy(() => import('app/school/pages/robotCoach/nvrSet')),
  },
];
