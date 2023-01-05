import { lazy } from 'react';

export const learningNotice = [
  {
    path: '/learningNotice/examNotice',
    component: lazy(() => import('app/yantai/pages/learningNotice/examNotice')),
  },
  {
    path: '/learningNotice/learningProcess',
    component: lazy(() => import('app/yantai/pages/learningNotice/learningProcess')),
  },
  {
    path: '/learningNotice/paymentProcess',
    component: lazy(() => import('app/yantai/pages/learningNotice/paymentProcess')),
  },
  {
    path: '/learningNotice/signUpNotice',
    component: lazy(() => import('app/yantai/pages/learningNotice/signUpNotice')),
  },
  {
    path: '/learningNotice/teachingProgram',
    component: lazy(() => import('app/yantai/pages/learningNotice/teachingProgram')),
  },
];
