import { lazy } from 'react';

export const coach = [
  {
    path: '/coachCard',
    component: lazy(() => import('app/school/pages/coach/coachCard')),
  },
  {
    path: '/coachComplaints',
    component: lazy(() => import('app/school/pages/coach/coachComplaints')),
  },
  {
    path: '/coachEvaluation',
    component: lazy(() => import('app/school/pages/coach/coachEvaluation')),
  },
  {
    path: '/coachFaceReview',
    component: lazy(() => import('app/school/pages/coach/coachFaceReview')),
  },
  {
    path: '/coachInfo',
    component: lazy(() => import('app/school/pages/coach/coachInfo')),
  },
];
