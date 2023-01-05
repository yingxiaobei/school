import React, { useState } from 'react';
import { DatePicker, Menu, Button, Badge } from 'antd';
import moment from 'moment';
import { _getSubjectList } from './_api';
import { useFetch } from 'hooks';

interface IProps {
  onCallBack(data: any): void;
}
const LeftPlate = (props: IProps) => {
  const { onCallBack } = props;
  const [examTime, setExamTime] = useState(moment().format('YYYY-MM'));
  const [list, setList] = useState([]);
  const [key, setKey] = useState('0');
  const [timeScope, setTimeScope] = useState(
    moment().startOf('month').format('YYYY-MM-DD') + '—' + moment().endOf('month').format('YYYY-MM-DD'),
  );

  useFetch({
    request: _getSubjectList,
    query: { examTime: examTime },
    depends: [timeScope, examTime],
    callback: (data: any) => {
      setList(data);
      onCallBack({
        testSubject: key === 'today' || key.toString().split('|')[0] === '0' ? '' : key.toString().split('|')[0],
        startDate:
          key === 'today'
            ? timeScope.split('—')[0]
            : key.toString().split('|')[1] || moment(timeScope.split('—')[0]).startOf('month').format('YYYY-MM-DD'),
        endDate:
          key === 'today'
            ? timeScope.split('—')[0]
            : key.toString().split('|')[1] || moment(timeScope.split('—')[0]).endOf('month').format('YYYY-MM-DD'),
      });

      document
        .getElementById('times')
        ?.getElementsByClassName('ant-menu-item-selected')[0]
        ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
  });

  //选出今天的所有科目
  function checkToday(list: Array<any>) {
    return list
      .filter(
        ({ examSubject, examTime, examType }: { examSubject: string; examTime: string; examType: string }) =>
          examTime === moment().format('YYYY-MM-DD'),
      )
      .map(
        ({ examSubject, examTime, examType }: { examSubject: string; examTime: string; examType: string }) =>
          examType + '|' + examTime,
      );
  }
  return (
    <>
      <DatePicker
        picker="month"
        defaultValue={moment()}
        onChange={(date: any, dateString: string) => {
          setExamTime(dateString);
          setKey('0');
          setTimeScope(
            moment(dateString).startOf('month').format('YYYY-MM-DD') +
              '—' +
              moment(dateString).endOf('month').format('YYYY-MM-DD'),
          );
        }}
        value={moment(examTime)}
        allowClear={false}
      />
      <br />
      <Button
        className="mt20 mb20"
        onClick={() => {
          setExamTime(moment().format('YYYY-MM'));
          setKey('today');
          setTimeScope(moment().format('YYYY-MM-DD') + '—' + moment().format('YYYY-MM-DD'));
        }}
      >
        今天
      </Button>
      <p>
        考试日期：
        {timeScope}
      </p>
      <p>
        <Badge color="#000" />
        选择考试场次
      </p>
      <Menu
        id="times"
        style={{ overflow: 'auto', height: 'calc(100vh - 400px)' }}
        selectedKeys={key === 'today' ? [...checkToday(list)] : [key]}
        onClick={({ item, key, keyPath, domEvent }) => {
          //选中的菜单有时间用菜单key的时间，没有则算出选中月份的月初和月末时间
          onCallBack({
            testSubject: key.toString().split('|')[0] === '0' ? '' : key.toString().split('|')[0],
            startDate:
              key.toString().split('|')[1] || moment(timeScope.split('—')[0]).startOf('month').format('YYYY-MM-DD'),
            endDate:
              key.toString().split('|')[1] || moment(timeScope.split('—')[1]).endOf('month').format('YYYY-MM-DD'),
          });
          setKey(key + '');
          setTimeScope(
            moment(examTime).startOf('month').format('YYYY-MM-DD') +
              '—' +
              moment(examTime).endOf('month').format('YYYY-MM-DD'),
          );
        }}
      >
        <Menu.Item key="0">所有科目</Menu.Item>
        <Menu.Item key="1">所有科目一</Menu.Item>
        <Menu.Item key="2">所有科目二</Menu.Item>
        <Menu.Item key="3">所有科目三</Menu.Item>
        <Menu.Item key="4">所有科目四</Menu.Item>
        {list.map(
          ({ examSubject, examTime, examType }: { examSubject: string; examTime: string; examType: string }) => (
            <Menu.Item key={examType + '|' + examTime}>{examSubject}</Menu.Item>
          ),
        )}
      </Menu>
    </>
  );
};
export default LeftPlate;
