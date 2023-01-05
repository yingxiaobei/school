import { lazy } from 'react';

export const trainingInstitution = [
  {
    path: '/assesserInfo',
    component: lazy(() => import('app/school/pages/trainingInstitution/assesserInfo')),
  },
  {
    path: '/branchMechanism',
    component: lazy(() => import('app/school/pages/trainingInstitution/branchMechanism')),
  },
  {
    path: '/businessOutlet',
    component: lazy(() => import('app/school/pages/trainingInstitution/businessOutlet')),
  },
  {
    path: '/simulator',
    component: lazy(() => import('app/school/pages/trainingInstitution/simulator')),
  },
  {
    path: '/carInfo',
    component: lazy(() => import('app/school/pages/trainingInstitution/carInfo')),
  },
  {
    path: '/carMonitor',
    component: lazy(() => import('app/school/pages/trainingInstitution/carMonitor')),
  },
  {
    path: '/classHourAudit',
    component: lazy(() => import('app/school/pages/trainingInstitution/classHourAudit')),
  },
  {
    path: '/classInfo',
    component: lazy(() => import('app/school/pages/trainingInstitution/classInfo')),
  },
  {
    path: '/contractTemplate',
    component: lazy(() => import('app/school/pages/trainingInstitution/contractTemplate')),
  },
  {
    path: '/fenceManagement',
    component: lazy(() => import('app/school/pages/trainingInstitution/fenceManagement')),
  },
  {
    path: '/fenceManagementNew',
    component: lazy(() => import('app/school/pages/trainingInstitution/fenceManagementNew')),
  },
  {
    path: '/networkPhaseTesting',
    component: lazy(() => import('app/school/pages/trainingInstitution/networkPhaseTesting')),
  },
  {
    path: '/simulatorTrain',
    component: lazy(() => import('app/school/pages/trainingInstitution/simulatorTrain')),
  },
  {
    path: '/otherDevice',
    component: lazy(() => import('app/school/pages/trainingInstitution/otherDevice')),
  },
  {
    path: '/securityOfficerInfo',
    component: lazy(() => import('app/school/pages/trainingInstitution/securityOfficerInfo')),
  },
  {
    path: '/teachingArea',
    component: lazy(() => import('app/school/pages/trainingInstitution/teachingArea')),
  },
  {
    path: '/trainingInstitutionComplaints',
    component: lazy(() => import('app/school/pages/trainingInstitution/trainingInstitutionComplaints')),
  },
  {
    path: '/trainingInstitutionEvaluation',
    component: lazy(() => import('app/school/pages/trainingInstitution/trainingInstitutionEvaluation')),
  },
  {
    path: '/trainingInstitutionInfo',
    component: lazy(() => import('app/school/pages/trainingInstitution/trainingInstitutionInfo')),
  },
  {
    path: '/vehicleTechnicalRating',
    component: lazy(() => import('app/school/pages/trainingInstitution/vehicleTechnicalRating')),
  },
  {
    path: '/vehicleTrajectory',
    component: lazy(() => import('app/school/pages/trainingInstitution/vehicleTrajectory')),
  },
  {
    path: '/videoMonitor',
    component: lazy(() => import('app/school/pages/trainingInstitution/videoMonitor')),
  },
  {
    path: '/carAlarm',
    component: lazy(() => import('app/school/pages/trainingInstitution/carAlarm')),
  },
];
