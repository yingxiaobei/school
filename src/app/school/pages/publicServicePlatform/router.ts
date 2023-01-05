import { lazy } from 'react';

export const publicServicePlatform = [
  {
    path: '/publicServicePlatform/coachSearch',
    component: lazy(() => import('app/school/pages/publicServicePlatform/coachSearch')),
  },
  {
    path: '/publicServicePlatform/evaluateSearch',
    component: lazy(() => import('app/school/pages/publicServicePlatform/evaluateSearch')),
  },
  {
    path: '/publicServicePlatform/pageManage',
    component: lazy(() => import('app/school/pages/publicServicePlatform/pageManage')),
  },
  {
    path: '/publicServicePlatform/publicServiceIndex',
    component: lazy(() => import('app/school/pages/publicServicePlatform/publicServiceIndex')),
  },
  {
    path: '/publicServicePlatform/schoolSearch',
    component: lazy(() => import('app/school/pages/publicServicePlatform/schoolSearch')),
  },
  {
    path: '/publicServicePlatform/sendNews',
    component: lazy(() => import('app/school/pages/publicServicePlatform/sendNews')),
  },
  {
    path: '/publicServicePlatform/studentPushSearch',
    component: lazy(() => import('app/school/pages/publicServicePlatform/studentPushSearch')),
  },
  {
    path: '/publicServicePlatform/studentSearch',
    component: lazy(() => import('app/school/pages/publicServicePlatform/studentSearch')),
  },
  {
    path: '/publicServicePlatform/templateManage',
    component: lazy(() => import('app/school/pages/publicServicePlatform/templateManage')),
  },
];
