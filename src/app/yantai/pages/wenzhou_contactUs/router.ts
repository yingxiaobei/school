import { lazy } from 'react';

export const wenzhou_contactUs = [
  {
    path: '/wenzhou_contactUs/about',
    component: lazy(() => import('app/yantai/pages/wenzhou_contactUs/about')),
  },
  {
    path: '/wenzhou_contactUs/legalStatement',
    component: lazy(() => import('app/yantai/pages/wenzhou_contactUs/legalStatement')),
  },
  {
    path: '/wenzhou_contactUs/questions',
    component: lazy(() => import('app/yantai/pages/wenzhou_contactUs/questions')),
  },
];
