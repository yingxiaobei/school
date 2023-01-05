import moment from 'moment';
import { _get } from 'utils';
import { CheckOutlined } from '@ant-design/icons';

type TAppointmentCard = {
  subject?: string;
  status: number | string;
  index: number;
  x: any;
  setCurrentRecord: Function;
  subjectcodeHash: { [key: string]: string };
  selectedOrderCourse: Set<any>;
  setSelectedOrderCourse: Function;
  _switchOrderListVisible: Function;
};

export default function AppointmentCard(props: TAppointmentCard) {
  const {
    subject,
    status,
    index,
    x,
    setCurrentRecord,
    subjectcodeHash,
    selectedOrderCourse,
    setSelectedOrderCourse,
    _switchOrderListVisible,
  } = props;

  // 未发布
  if (String(status) === '0') {
    return (
      <div
        key={index}
        style={{
          borderRadius: 8,
          margin: 10,
          width: 132,
          height: 90,
          background: 'lightgray',
        }}
      >
        <div>
          {moment().hour(x.beginhour).minute(x.beginmin).format('HH:mm') +
            '-' +
            moment().hour(x.endhour).minute(x.endmin).format('HH:mm')}
        </div>
        <div>未发布</div>
      </div>
    );
  }

  // 已过期
  if (String(status) === '3') {
    return (
      <div
        style={{
          borderRadius: 8,
          margin: 10,
          width: 132,
          height: 90,
          background: '#d8d8d8',
        }}
        key={index}
      >
        <div>
          {moment().hour(x.beginhour).minute(x.beginmin).format('HH:mm') +
            '-' +
            moment().hour(x.endhour).minute(x.endmin).format('HH:mm')}
        </div>
        <div>已过期</div>
      </div>
    );
  }

  // 已约满
  if (String(status) === '2') {
    return (
      <div
        style={{
          borderRadius: 8,
          margin: 10,
          width: 132,
          height: 90,
          background: 'yellow',
        }}
        key={index}
      >
        <div>
          {moment().hour(x.beginhour).minute(x.beginmin).format('HH:mm') +
            '-' +
            moment().hour(x.endhour).minute(x.endmin).format('HH:mm')}
        </div>
        <div>
          <span>
            {Number(_get(x, 'classnum')) - Number(_get(x, 'applyNum'))}/{_get(x, 'classnum')}人
          </span>
          &nbsp;
          <span
            className="pointer"
            style={{ fontWeight: 'bold' }}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRecord(x);
              _switchOrderListVisible();
            }}
          >
            查看
          </span>
        </div>
        <div>{subjectcodeHash[x.subject] + ' ' + x.traintype}</div>
        {/* 不要价格了 */}
        {subject === '1' && <div>{x.price + '元'}</div>}
      </div>
    );
  }

  // 可约
  if (String(status) === '1') {
    return (
      <div
        className="pointer"
        style={{
          margin: 10,
          width: 132,
          height: 90,
          borderRadius: 8,
          background: '#63c3a4',
          position: 'relative',
        }}
        key={index}
        onClick={() => {
          if (selectedOrderCourse.has(_get(x, 'skuId'))) {
            selectedOrderCourse.delete(_get(x, 'skuId'));
          } else {
            selectedOrderCourse.add(_get(x, 'skuId'));
          }
          setSelectedOrderCourse(new Set(selectedOrderCourse));
        }}
      >
        <div>
          {moment().hour(x.beginhour).minute(x.beginmin).format('HH:mm') +
            '-' +
            moment().hour(x.endhour).minute(x.endmin).format('HH:mm')}
        </div>
        <div>
          <span>
            {Number(_get(x, 'classnum')) - Number(_get(x, 'applyNum'))}/{_get(x, 'classnum')}人
          </span>
          &nbsp;
          <span
            style={{ fontWeight: 'bold' }}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRecord(x);
              _switchOrderListVisible();
            }}
          >
            查看
          </span>
        </div>
        <div>{subjectcodeHash[x.subject] + ' ' + x.traintype}</div>
        {subject === '1' && <div>{x.price + '元'}</div>}

        {selectedOrderCourse.has(x.skuId) && (
          <div
            style={{
              position: 'absolute',
              width: 32,
              height: 18,
              bottom: 0,
              right: 0,
              background: '#fff',
              borderTopLeftRadius: 8,
            }}
          >
            <CheckOutlined style={{ color: 'green' }} />
          </div>
        )}
      </div>
    );
  }

  return null;
}
