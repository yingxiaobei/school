import { lazy } from 'react';

export const teach = [
  {
    path: '/trainProject',
    component: lazy(() => import('app/school/pages/teach/trainProject')),
  },
  {
    path: '/appointment',
    component: lazy(() => import('app/school/pages/teach/appointment')),
  },
  {
    path: '/orderRecord',
    component: lazy(() => import('app/school/pages/teach/orderRecord')),
  },
  {
    path: '/realTimeAppointment',
    component: lazy(() => import('app/school/pages/teach/realTimeAppointment')),
  },
  {
    path: '/signReset',
    component: lazy(() => import('app/school/pages/teach/signReset')),
  },
  {
    path: '/simulationAppointment',
    component: lazy(() => import('app/school/pages/teach/simulationAppointment')),
  },
  {
    path: '/theoryAppointment',
    component: lazy(() => import('app/school/pages/teach/theoryAppointment')),
  },
  {
    path: '/timeRule',
    component: lazy(() => import('app/school/pages/teach/timeRule')),
  },
];
