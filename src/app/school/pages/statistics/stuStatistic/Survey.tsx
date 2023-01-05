import { useFetch } from 'hooks';
import { _getTotalStuNum } from './_api';
import { _get } from 'utils';
import moment from 'moment';

interface IProps {
  title: string;
  status: string;
  callback?(param: string): void;
}
const commonStyle = { flex: 1, borderRight: 'solid 1px #f0f0f0' };

export default function Survey(props: IProps) {
  const { title, status, callback } = props;
  const { data } = useFetch({
    query: {
      status: status,
      year: moment().format('YYYY'),
    },
    request: _getTotalStuNum,
    callback: (data) => {
      callback && callback(_get(data, '0.crtTime', ''));
    },
  });

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <div style={commonStyle}>{title}</div>
      <div style={commonStyle}>{_get(data, '0.stuNum', 0)}</div>
    </div>
  );
}
