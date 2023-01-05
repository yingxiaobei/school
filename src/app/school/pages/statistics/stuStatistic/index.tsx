// 培训综合情况
import { useState } from 'react';
import Survey from './Survey';
import { CustomTable, Title } from 'components';
import { useFetch } from 'hooks';
import { _getAnnualStuNum } from './_api';
import { _get } from 'utils';
import moment from 'moment';

function StuStatistic() {
  const [dataSource, setDataSource] = useState([] as any[]);
  const [time, setTime] = useState('');
  const currentYear = moment().format('YYYY');

  const { isLoading, data } = useFetch({
    request: _getAnnualStuNum,
    query: {
      startYear: String(Number(currentYear) - 4), //默认查询近五年
      endYear: currentYear,
    },
    callback: (data: any) => {
      const _dataSource: any[] = [
        { stage: '科目一阶段', index: 0 },
        { stage: '科目二阶段', index: 1 },
        { stage: '科目三阶段', index: 2 },
        { stage: '科目四阶段', index: 3 },
        { stage: '合计', index: 4 },
      ];

      if (Object.keys(_get(data, 'sumVO', {})).length > 0) {
        _dataSource.forEach((_: any, index: number) => {
          _get(data, 'yearVo', []).forEach((item: any) => {
            Object.assign(_dataSource[index], {
              [`statistic${item.statisticYear}`]:
                index === 4 ? _get(item, 'stuTotalNum', '') : _get(item, 'stuNum' + Number(Number(index) + 1), ''),
            });
          });
          Object.assign(_dataSource[index], {
            statisticTotal:
              index === 4 ? _get(data, 'sumVO.stuTotalNum', 0) : _get(data, `sumVO.stuNum${index + 1}`, 0),
          });
        });
      }
      setDataSource(_dataSource);
    },
  });

  const columns = [
    { title: '阶段', dataIndex: 'stage' },
    { title: '学员总数', dataIndex: 'statisticTotal' },
    {
      title: '学员历年分布',
      dataIndex: 'statisticTimeDay',
      children: _get(data, 'yearVo', []).map((x: any) => ({
        title: x.statisticYear,
        dataIndex: `statistic${x.statisticYear}`,
      })),
    },
  ];

  return (
    <>
      <Title>今年概况</Title>
      {/* （00-报名 01-学驾中 02-退学 03-结业 04-注销 05-转校 06-过期 99-归档） */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ color: '#979494', marginBottom: 10 }}>{`截至统计时间：${time}`}</div>
        <div
          style={{
            display: 'flex',
            border: 'solid 1px #f0f0f0',
            borderRight: 0,
            textAlign: 'center',
            width: '100%',
            marginBottom: 20,
          }}
        >
          <Survey
            status={'00'}
            title={'今年入学'}
            callback={(time: any) => {
              setTime(time);
            }}
          />
          <Survey status={'03'} title={'今年毕业'} />
          <Survey status={'04'} title={'今年注销'} />
          <Survey status={'02'} title={'今年退学'} />
          <Survey status={'06'} title={'总过期学员'} />
        </div>
      </div>

      <Title>科目阶段</Title>
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={dataSource}
        rowKey="stage"
        pagination={false}
      />
    </>
  );
}

export default StuStatistic;
