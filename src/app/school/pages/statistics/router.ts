import { lazy } from 'react';

export const statistics = [
  {
    path: '/coachTrainStatistic',
    component: lazy(() => import('app/school/pages/statistics/coachTrainStatistic')),
  },
  {
    path: '/stuExamCompare',
    component: lazy(() => import('app/school/pages/statistics/stuExamCompare')),
  },
  {
    path: '/stuStatistic',
    component: lazy(() => import('app/school/pages/statistics/stuStatistic')),
  },
];
