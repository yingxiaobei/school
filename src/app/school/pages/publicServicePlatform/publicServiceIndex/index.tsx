// 公众服务平台首页
import { useState } from 'react';
import { Radio, Space } from 'antd';
import ServiceCharts from './ServiceCharts';
import { _getStatisticCityInfo } from './_api';
import { useFetch } from 'hooks';
import './index.scss';
import { _get } from 'utils';
import moment from 'moment';

export default function PublicServiceIndex() {
  const [timeLine, setTimeLine] = useState(moment().subtract(1, 'months').format('YYYY-MM-DD'));
  const { data } = useFetch({
    request: _getStatisticCityInfo,
  });

  return (
    <div className="flex-box direction-col">
      <div className="mb20 topBox">
        <div className={'numBg trainNumBg '}>
          <div className="boxTitle">培训机构数量</div>
          <div className="boxNum">{Number(_get(data, 'insNum', 0)).toLocaleString()}</div>
        </div>
        <div className={'numBg coachNum '}>
          <div className="boxTitle">教练数量</div>
          <div className="boxNum">{Number(_get(data, 'coaNum', 0)).toLocaleString()}</div>
        </div>
        <div className={'numBg studentNum '}>
          <div className="boxTitle">学员数量</div>
          <div className="boxNum">{Number(_get(data, 'stuNum', 0)).toLocaleString()}</div>
        </div>
      </div>

      <Space className="chartBox">
        报名学员数量
        <Radio.Group
          value={timeLine}
          onChange={(e) => {
            setTimeLine(e.target.value);
          }}
        >
          <Radio.Button value={moment().subtract(1, 'months').format('YYYY-MM-DD')}>最近一个月</Radio.Button>
          <Radio.Button value={moment().subtract(3, 'months').format('YYYY-MM-DD')}>最近三个月</Radio.Button>
          <Radio.Button value={moment().subtract(6, 'months').format('YYYY-MM-DD')}>最近六个月</Radio.Button>
          <Radio.Button value={moment().subtract(1, 'years').format('YYYY-MM-DD')}>最近一年</Radio.Button>
        </Radio.Group>
      </Space>
      <ServiceCharts timeLine={timeLine} key={timeLine} />
    </div>
  );
}
