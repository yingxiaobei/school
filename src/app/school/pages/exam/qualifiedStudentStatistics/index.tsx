// 考出学员统计

import { Tabs, DatePicker } from 'antd';
import { useState } from 'react';
import { AuthButton } from 'components';
import { DownloadOutlined } from '@ant-design/icons';
import { _getExport } from './_api';
import { downloadFile } from 'utils';
import QualifiedStuPanel from './QualifiedStuPanel';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

function QualifiedStudentStatistics() {
  const [autoTime, setAutoTime] = useState(['', '']);
  const [pagination, setPagination] = useState({ current: '10', pageSize: '1' });
  const tabs = [
    { tab: '近一周', period: 'week' },
    { tab: '近一月', period: 'month' },
    { tab: '近三月', period: 'trimonth' },
    { tab: '近一年', period: 'year' },
    {
      tab: (
        <>
          <RangePicker
            onChange={(date: any, dateString: any) => setAutoTime(dateString)}
            value={[
              autoTime[0] ? moment(autoTime[0], 'YYYY-MM-DD') : null,
              autoTime[1] ? moment(autoTime[1], 'YYYY-MM-DD') : null,
            ]}
          />
          <AuthButton
            authId=""
            type="primary"
            onClick={() => {
              _getExport({
                limit: pagination?.pageSize,
                page: pagination?.current,
                startDate: autoTime[0],
                endDate: autoTime[1],
              }).then((res) => {
                downloadFile(res, '考出学员', 'application/xlsx', 'xlsx');
              });
            }}
            className="ml20 "
            icon={<DownloadOutlined />}
          >
            导出
          </AuthButton>
        </>
      ),
      period: autoTime,
    },
  ];

  const handleExport = (pageDate: any) => {
    setPagination(pageDate);
  };
  return (
    <Tabs defaultActiveKey="week" size="small">
      {tabs.map((x: { tab: any; period: any }) => (
        <TabPane tab={x.tab} key={x.period}>
          <QualifiedStuPanel period={x.period} handleExport={handleExport} />
        </TabPane>
      ))}
    </Tabs>
  );
}

export default QualifiedStudentStatistics;
