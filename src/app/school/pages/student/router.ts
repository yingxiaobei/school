import { lazy } from 'react';

export const student = [
  {
    path: '/abnormalStudent',
    component: lazy(() => import('app/school/pages/student/abnormalStudent')),
  },
  {
    path: '/admissionsLeads',
    component: lazy(() => import('app/school/pages/student/admissionsLeads')),
  },
  {
    path: '/application',
    component: lazy(() => import('app/school/pages/student/application')),
  },
  {
    path: '/applicationReview',
    component: lazy(() => import('app/school/pages/student/applicationReview')),
  },
  {
    path: '/effectiveTrainingProcess',
    component: lazy(() => import('app/school/pages/student/effectiveTrainingProcess')),
  },
  {
    path: '/finalAssessment',
    component: lazy(() => import('app/school/pages/student/finalAssessment')),
  },
  {
    path: '/forecastChecked',
    component: lazy(() => import('app/school/pages/student/forecastChecked')),
  },
  {
    path: '/forecastExpected',
    component: lazy(() => import('app/school/pages/student/forecastExpected')),
  },
  {
    path: '/forecastReview',
    component: lazy(() => import('app/school/pages/student/forecastReview')),
  },
  {
    path: '/historicalStudentProfile',
    component: lazy(() => import('app/school/pages/student/historicalStudentProfile')),
  },
  {
    path: '/openClass',
    component: lazy(() => import('app/school/pages/student/openClass')),
  },
  {
    path: '/periodManagement',
    component: lazy(() => import('app/school/pages/student/periodManagement')),
  },
  {
    path: '/phaseDeclare',
    component: lazy(() => import('app/school/pages/student/phaseDeclare')),
  },
  {
    path: '/phasedReview',
    component: lazy(() => import('app/school/pages/student/phasedReview')),
  },
  {
    path: '/printTrainingRecordSheet',
    component: lazy(() => import('app/school/pages/student/printTrainingRecordSheet')),
  },
  {
    path: '/studentAcrossInstitution',
    component: lazy(() => import('app/school/pages/student/studentAcrossInstitution')),
  },
  {
    path: '/studentCardMaking',
    component: lazy(() => import('app/school/pages/student/studentCardMaking')),
  },
  {
    path: '/studentDropped',
    component: lazy(() => import('app/school/pages/student/studentDropped')),
  },
  {
    path: '/studentFace',
    component: lazy(() => import('app/school/pages/student/studentFace')),
  },
  {
    path: '/studentGraduate',
    component: lazy(() => import('app/school/pages/student/studentGraduate')),
  },
  {
    path: '/studentInfo',
    component: lazy(() => import('app/school/pages/student/studentInfo')),
  },
  {
    path: '/subjectIdentification',
    component: lazy(() => import('app/school/pages/student/subjectIdentification')),
  },
  {
    path: '/teachingJournal',
    component: lazy(() => import('app/school/pages/student/teachingJournal')),
  },
  {
    path: '/theoryStudents',
    component: lazy(() => import('app/school/pages/student/theoryStudents')),
  },
  {
    path: '/trainingDetailReview',
    component: lazy(() => import('app/school/pages/student/trainingDetailReview')),
  },
  {
    path: '/trial',
    component: lazy(() => import('app/school/pages/student/trial')),
  },
];
