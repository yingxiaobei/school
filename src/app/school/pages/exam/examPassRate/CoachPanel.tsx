import { Tabs, DatePicker, Button, message, Modal } from 'antd';
import CoachStatistic from './CoachStatistic';
import moment from 'moment';
import { useState } from 'react';
import { _examPassRateAutoTime } from './_api';
import { Auth } from 'utils';
import tipPic from 'statics/images/tip.png';
const { RangePicker } = DatePicker;

export default function CoachPanel() {
  const { TabPane } = Tabs;
  const [autoTime, setAutoTime] = useState(Auth.get('passRateTime')?.split('|') || ['', '']);
  const [isIntercept, setIsIntercept] = useState(false); //刷新tab
  const [isUpdate, setIsUpdate] = useState(false); //刷新列表
  const tabs = [
    { tab: '近一周', period: 'week' },
    { tab: '近一月', period: 'month' },
    { tab: '近三月', period: 'trimonth' },
    { tab: '近一年', period: 'year' },
    {
      tab: (
        <>
          <RangePicker
            onChange={(date: any, dateString: any) => {
              setAutoTime(dateString);
            }}
            value={[
              autoTime[0] ? moment(autoTime[0], 'YYYY-MM-DD') : null,
              autoTime[1] ? moment(autoTime[1], 'YYYY-MM-DD') : null,
            ]}
          />
          <Button
            type="primary"
            onClick={() => {
              if (!autoTime[0]) {
                message.error('请先选择时间');
              } else if (Auth.get('passRate') === 'pending') {
                message.info('有表格正在生成，请等待...');
              } else {
                Modal.info({
                  title: '正在生成表格',
                  content: (
                    <div>
                      <p>数据查询中...</p>
                      <p>
                        可切换至其他功能页面，待数据生成后，
                        <br />
                        点击 <b style={{ color: '#F3302B' }}>“自定义日期查询结果”</b>可查看结果
                      </p>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={tipPic} />
                    </div>
                  ),
                  onOk() {},
                });
                Auth.set('passRate', 'pending');
                Auth.set('passRateTime', autoTime.join('|'));
                setIsIntercept(true);
                _examPassRateAutoTime({
                  startTime: autoTime[0],
                  endTime: autoTime[1],
                }).then((res: any) => {
                  if (res && res.code === 200) {
                    Auth.set('passRate', 'finish');
                    setIsIntercept(false);
                    Auth.set('passRateTime', autoTime.join('|'));
                  } else {
                    Auth.set('passRate', '');
                    setIsIntercept(false);
                    Auth.set('passRateTime', autoTime.join('|'));
                  }
                });
              }
            }}
            className="ml20 "
          >
            查询
          </Button>
          <Button
            type="primary"
            disabled={!Boolean(Auth.get('passRate') === 'finish')}
            onClick={() => {
              if (!(Auth.get('passRate') === 'pending')) {
                setAutoTime(Auth.get('passRateTime')?.split('|') || []);
                setIsUpdate(!isUpdate);
              }
            }}
            className="ml20 "
          >
            自定义日期查询结果
          </Button>
        </>
      ),
      period: autoTime,
    },
  ];

  return (
    <Tabs defaultActiveKey="week" size={'small'}>
      {tabs.map((x: { tab: any; period: any }) => (
        <TabPane tab={x.tab} key={x.period}>
          <CoachStatistic period={x.period} isUpdate={isUpdate} />
        </TabPane>
      ))}
    </Tabs>
  );
}
