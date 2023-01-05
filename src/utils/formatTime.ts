import moment from 'moment';

type TType = 'BEGIN' | 'END' | 'NORMAL' | 'DATE' | 'MONTH' | 'YYYYMMDD';

export function formatTime(date: any, type: TType) {
  if (!date) return null;
  if (type === 'BEGIN') return moment(date).format('YYYY-MM-DD 00:00:00');
  if (type === 'END') return moment(date).format('YYYY-MM-DD 23:59:59');
  if (type === 'NORMAL') return moment(date).format('YYYY-MM-DD HH:mm:ss');
  if (type === 'DATE') return moment(date).format('YYYY-MM-DD');
  if (type === 'MONTH') return moment(date).format('YYYY-MM');
  if (type === 'YYYYMMDD') return moment(date).format('YYYYMMDD');
}

//调用moment前判断值为空,不进行format
export function _moment(date: any) {
  if (!date) return '';
  return moment(date);
}

//是否跨年
export function isCrossYear(date1: any, date2: any) {
  const year1 = date1.format('YYYY');
  const year2 = date2.format('YYYY');

  return year1 !== year2;
}

//本月第一天
export function firstDayOfThisMonth() {
  return moment().startOf('month');
}

//最近一月(如果跨年，则返回当月第一天; 如果不跨年，返回30天前)
export function get30DaysAgoNotCrossYear() {
  const startTime = moment().subtract(30, 'day');
  const endTime = moment();
  const isCross = isCrossYear(startTime, endTime);
  return isCross ? firstDayOfThisMonth() : startTime;
}
