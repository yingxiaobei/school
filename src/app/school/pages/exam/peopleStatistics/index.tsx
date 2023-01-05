// 人员统计
import { useState } from 'react';
import { Tabs } from 'antd';
import PersonTable from './PersonTable';
import { _getSumByCarList, _getSumByCoachList, _getSumByAgeList } from './_api';
import { AxiosResponse } from 'axios';

const { TabPane } = Tabs;

function PeopleStatistics() {
  const [dateRange, setDateRange] = useState('week');
  const [personType, setPersonType] = useState('car');

  const personTypeTabs = [
    { typeName: '按车型', key: 'car', request: _getSumByCarList },
    { typeName: '按教练', key: 'coach', request: _getSumByCoachList },
    { typeName: '按年龄', key: 'age', request: _getSumByAgeList },
  ];

  const timeTabs = [
    { tabName: '近一周', period: 'week' },
    { tabName: '近一月', period: 'month' },
    { tabName: '近三月', period: 'trimonth' },
    { tabName: '近一年', period: 'year' },
  ];

  return (
    <Tabs
      defaultActiveKey="car"
      onChange={(val: string) => {
        setPersonType(val);
        setDateRange('week');
      }}
    >
      {personTypeTabs.map(
        (item: {
          typeName: string;
          key: string;
          request: (
            query: IPaginationParams & { period: 'week' | 'month' | 'trimonth' | 'year' },
          ) => Promise<AxiosResponse | void | undefined>;
        }) => {
          return (
            <TabPane tab={item.typeName} key={item.key}>
              <Tabs onChange={(time: string) => setDateRange(time)}>
                {timeTabs.map((x: { tabName: string; period: string }) => {
                  return (
                    <TabPane tab={x.tabName} key={x.period}>
                      <PersonTable request={item.request} period={dateRange} personType={personType} />
                    </TabPane>
                  );
                })}
              </Tabs>
            </TabPane>
          );
        },
      )}
    </Tabs>
  );
}

export default PeopleStatistics;
