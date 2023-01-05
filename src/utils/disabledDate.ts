import moment from 'moment';

export const disabledDate = (current: any, startDate: any, endDate: any, days: number = 30) => {
  // if (!startDate || !endDate) {
  //   return false;
  // }

  const tooLate = startDate && current.diff(moment(startDate), 'days') > days;
  const tooEarly = endDate && moment(endDate).diff(current, 'days') > days;
  return tooEarly || tooLate;
};

export const disabledDateAfterToday = (current: any, startDate: any, endDate: any, days: number = 180) => {
  return disabledDate(current, startDate, endDate, days) || moment().isSameOrAfter(current, 'days');
};
