import moment from 'moment';
import { Auth, getWeek } from 'utils';

export default function SuperviseHome() {
  const week = moment().format('E');
  return (
    <div className=" mt10 fz16">
      {/* <span>
        {moment().format('YYYY.MM.DD')}
        {getWeek(week)}
      </span> */}
      <div className="bold mt10 fz16">欢迎您，{Auth.get('schoolName')}</div>
    </div>
  );
}
