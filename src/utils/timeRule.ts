import moment from 'moment';

// 校验设置的时间区间是否有重叠
export function _isValidTimeDuration(list: any) {
  const timeDurations = list
    .map((x: any) => x.timeDuration)
    .sort((a: any, b: any) => (moment(a[0]).isBefore(b[0], 'minute') ? -1 : 1));

  for (let i = 1; i < timeDurations.length; i++) {
    const currentStart = timeDurations[i][0];
    const lastEnd = timeDurations[i - 1][1];
    if (moment(currentStart).isBefore(lastEnd, 'minute')) {
      return false;
    }
  }

  return true;
}

// 校验科目
export function _isValidSubject(list: any) {
  return list.every((x: any) => !!x.subject);
}
