import { lazy } from 'react';

export const rank = [
  {
    path: '/rank/coachBlack',
    component: lazy(() => import('app/yantai/pages/rank/coachBlack')),
  },
  {
    path: '/rank/coachRed',
    component: lazy(() => import('app/yantai/pages/rank/coachRed')),
  },
  {
    path: '/rank/evaluate',
    component: lazy(() => import('app/yantai/pages/rank/evaluate')),
  },
  {
    path: '/rank/school',
    component: lazy(() => import('app/yantai/pages/rank/school')),
  },
  {
    path: '/rank/schoolBlack',
    component: lazy(() => import('app/yantai/pages/rank/schoolBlack')),
  },
  {
    path: '/rank/schoolDynamic',
    component: lazy(() => import('app/yantai/pages/rank/schoolDynamic')),
  },
  {
    path: '/rank/schoolRed',
    component: lazy(() => import('app/yantai/pages/rank/schoolRed')),
  },
];
