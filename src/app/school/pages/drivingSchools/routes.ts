import { lazy } from 'react';

export const drivingSchools = [
  {
    path: '/drivingSchools/information',
    component: lazy(() => import('app/school/pages/drivingSchools/information')),
  },
];
