/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useFetch } from 'hooks';
import { _getInfo } from './_api';
import { _get } from 'utils';
import { DatePicker } from 'antd';
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { CustomTable, IF, Loading } from 'components';
import moment from 'moment';

const { RangePicker } = DatePicker;

interface IProps {
  yearArr: any;
  setVisible: any;
  visible: boolean;
  isCustom?: boolean;
}

export default function ComparePanel(props: IProps) {
  const { yearArr = [], isCustom = false, visible, setVisible } = props;
  const [dataSource, setDataSource] = useState([] as any);
  const [preYear, setPreYear] = useState(_get(yearArr, '1'));
  const [year, setYear] = useState(_get(yearArr, '0'));

  const { data: yearData, isLoading: yearLoading } = useFetch({
    request: _getInfo,
    query: {
      year,
    },
    depends: [year, preYear],
  });
  const { data: preYearData, isLoading: preYearLoading } = useFetch({
    request: _getInfo,
    query: {
      year: preYear,
    },
    depends: [year, preYear],
  });

  const monthArr: any[] = [
    { label: '一月', value: '01' },
    { label: '二月', value: '02' },
    { label: '三月', value: '03' },
    { label: '四月', value: '04' },
    { label: '五月', value: '05' },
    { label: '六月', value: '06' },
    { label: '七月', value: '07' },
    { label: '八月', value: '08' },
    { label: '九月', value: '09' },
    { label: '十月', value: '10' },
    { label: '十一月', value: '11' },
    { label: '十二月', value: '12' },
    { label: '合计', value: '00' },
  ];

  useEffect(() => {
    setDataSource(formatDataSource());
  }, [yearData, preYearData]);

  function formatDataSource() {
    return monthArr.map((x) => {
      const { value } = x;
      const curTotal = _get(yearData, 'sumStu', 0);
      const preTotal = _get(preYearData, 'sumStu', 0);
      const preYearStuNum = _get(
        _get(preYearData, 'monthVos', []).find((y: any) => {
          const sMonth = _get(y, 'statisticMonth', ''); //后端存在01和202101，统一取后两位对比
          return sMonth.substring(sMonth.length - 2) === value;
        }),
        'stuNum',
        0,
      );
      const yearStuNum = _get(
        _get(yearData, 'monthVos', []).find((y: any) => {
          const sMonth = _get(y, 'statisticMonth', ''); //后端存在01和202101，统一取后两位对比
          console.log(sMonth);
          return sMonth.substring(sMonth.length - 2) === value;
        }),
        'stuNum',
        0,
      );
      const compareRate =
        preYearStuNum !== 0 ? `${(((yearStuNum - preYearStuNum) / preYearStuNum) * 100).toFixed(2)}%` : '-';
      const compareRateTotal = preTotal !== 0 ? `${(((curTotal - preTotal) / preTotal) * 100).toFixed(2)}%` : '-';
      if (value === '00') {
        //合计特殊处理
        return { ...x, compareRate: compareRateTotal, stuNumPre: preTotal, stuNumCur: curTotal };
      }
      return { ...x, compareRate, stuNumPre: preYearStuNum, stuNumCur: yearStuNum };
    });
  }

  const chartData = dataSource.filter((item: any) => item.value !== '00'); //图标不显示合计
  const columns = [
    { title: '月份', dataIndex: 'label' },
    {
      title: '新增学员',
      children: [
        {
          title: year,
          dataIndex: 'stuNumCur',
        },
        {
          title: preYear,
          dataIndex: 'stuNumPre',
        },
        {
          title: '同比%',
          dataIndex: 'compareRate',
        },
      ],
    },
  ];

  return (
    <>
      <span>统计对比年份：</span>
      <IF
        condition={isCustom}
        then={
          <RangePicker
            picker="year"
            allowClear={false}
            onChange={(dates: any) => {
              setPreYear(_get(dates, '0').format('YYYY'));
              setYear(_get(dates, '1').format('YYYY'));
              setVisible(true);
            }}
            disabledDate={(current) => {
              return current && current >= moment().endOf('day'); // 只能选择今年及以前
            }}
          />
        }
        else={<span>{year + ' : ' + preYear}</span>}
      />
      <IF
        condition={preYearLoading || yearLoading}
        then={<Loading />}
        else={
          visible && (
            <div style={{ display: 'flex', marginTop: 20 }}>
              <CustomTable
                style={{ width: 500 }}
                columns={columns}
                bordered
                dataSource={dataSource}
                rowKey="month"
                pagination={false}
                scroll={{ y: document.body.clientHeight - 170 }}
              />
              <div style={{ flex: 7, marginLeft: 20 }}>
                <ResponsiveContainer width={'90%'} height={400}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="value" label={{ value: '月份', offset: -2, position: 'insideBottom' }}>
                      {/* <Label value="学员报名同期比" offset={0} position="insideBottom" /> */}
                    </XAxis>
                    <YAxis label={{ value: '新增学员', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />

                    <Bar dataKey="stuNumCur" fill="#ff0000" name={year} />
                    <Bar dataKey="stuNumPre" fill="#00ff00" name={preYear} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        }
      />
    </>
  );
}
