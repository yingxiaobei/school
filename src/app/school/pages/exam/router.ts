import { lazy } from 'react';

export const exam = [
  {
    path: '/exam/examList',
    component: lazy(() => import('app/school/pages/exam/examList')),
  },
  {
    path: '/exam/examPassRate',
    component: lazy(() => import('app/school/pages/exam/examPassRate')),
  },
  {
    path: '/exam/examResult',
    component: lazy(() => import('app/school/pages/exam/examResult')),
  },
  {
    path: '/exam/examResultCompare',
    component: lazy(() => import('app/school/pages/exam/examResultCompare')),
  },
  {
    path: '/exam/peopleStatistics',
    component: lazy(() => import('app/school/pages/exam/peopleStatistics')),
  },
  {
    path: '/exam/qualifiedStudentStatistics',
    component: lazy(() => import('app/school/pages/exam/qualifiedStudentStatistics')),
  },
  {
    path: '/exam/examResultManage',
    component: lazy(() => import('app/school/pages/exam/examResultManage')),
  },
];
