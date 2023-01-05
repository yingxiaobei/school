import { lazy } from 'react';

export const cms = [
  {
    path: '/cms/businessGuide',
    component: lazy(() => import('app/yantai/pages/cms/businessGuide')),
  },
  {
    path: '/cms/industryDynamics',
    component: lazy(() => import('app/yantai/pages/cms/industryDynamics')),
  },
  {
    path: '/cms/industryStyle',
    component: lazy(() => import('app/yantai/pages/cms/industryStyle')),
  },
  {
    path: '/cms/notification',
    component: lazy(() => import('app/yantai/pages/cms/notification')),
  },
  {
    path: '/cms/regulation',
    component: lazy(() => import('app/yantai/pages/cms/regulation')),
  },
  {
    path: '/cms/information',
    component: lazy(() => import('app/yantai/pages/cms/information')),
  },
];
