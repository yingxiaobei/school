import { lazy } from 'react';

export const message = [
  {
    path: '/messageList',
    component: lazy(() => import('app/school/pages/message/index')),
  },
];
