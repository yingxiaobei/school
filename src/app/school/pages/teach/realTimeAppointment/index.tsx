// 教练信息管理

import { useState } from 'react';
import moment from 'moment';
import { useOptions, useSearch, useTablePagination, useFetch, useForceUpdate, useVisible, useHash } from 'hooks';
import { _getInfo } from './_api';
import AddCourse from './AddCourse';
import CourseReservation from './CourseReservation';
import OrderCourse from './OrderCourse';
import { Search, AuthButton, CustomTable } from 'components';
import { _get, _handleIdCard } from 'utils';

export default function RealTimeAppointment() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [visible, _switchVisible] = useVisible();
  const [courseReservationVisible, _switchCourseReservationVisible] = useVisible();
  const [orderCourseVisible, _switchOrderCourseVisible] = useVisible();
  const [selectedOrderCourse, setSelectedOrderCourse] = useState<any>(new Set());
  const [selectedCourseList, setSelectedCourseList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  const coaMasterStatusHash = useHash('coa_master_status'); // 供职状态

  const columns = [
    {
      title: '姓名',
      width: 80,
      dataIndex: 'coachname',
    },
    {
      title: '身份证号',
      width: 140,
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '准教车型',
      width: 80,
      dataIndex: 'teachpermitted',
    },
    {
      title: '供职状态',
      width: 80,
      dataIndex: 'employstatus',
      render: (employstatus: any) => coaMasterStatusHash[employstatus],
    },
    {
      title: '操作',
      width: 180,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="teach/realTimeAppointment:btn1"
            onClick={() => {
              setCurrentId(_get(record, 'cid'));
              setCurrentRecord(record);
              _switchVisible();
            }}
            className="operation-button"
          >
            新增课程
          </AuthButton>
          <AuthButton
            authId="teach/realTimeAppointment:btn2"
            onClick={() => {
              setCurrentId(_get(record, 'cid'));
              setCurrentRecord(record);
              _switchCourseReservationVisible();
            }}
            className="operation-button"
          >
            约排课
          </AuthButton>
        </div>
      ),
    },
  ];

  function _handleReset() {
    setSelectedOrderCourse(new Set());
    setSelectedCourseList([]);
    setSelectedDate(moment().format('YYYY-MM-DD'));
  }

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      type: '1',
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      registeredFlag: '2', // 已备案
      employstatus: _get(search, 'employstatus'),
      // teachpermitted: _get(search, 'teachpermitted'),
      coachtype: '2,3', // 教练员类型(0：理论1：实操2：理论和实操3：空) 后端要求传入格式以逗号分隔传入
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <>
      {courseReservationVisible && (
        <CourseReservation
          _handleReset={_handleReset}
          setSelectedCourseList={setSelectedCourseList}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedOrderCourse={selectedOrderCourse}
          setSelectedOrderCourse={setSelectedOrderCourse}
          _switchCourseReservationVisible={_switchCourseReservationVisible}
          _switchOrderCourseVisible={_switchOrderCourseVisible}
          currentId={currentId}
          currentRecordPlan={currentRecord}
        />
      )}

      {orderCourseVisible && (
        <OrderCourse
          _handleReset={_handleReset}
          selectedCourseList={selectedCourseList}
          selectedDate={selectedDate}
          currentRecord={currentRecord}
          selectedOrderCourse={[...selectedOrderCourse]}
          currentId={currentId}
          setSelectedOrderCourse={setSelectedOrderCourse}
          _switchOrderCourseVisible={_switchOrderCourseVisible}
        />
      )}

      {visible && (
        <AddCourse
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          currentRecord={currentRecord}
          title="新增课程"
        />
      )}

      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'coachname', placeholder: '教练姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'employstatus',
            options: [{ value: '', label: '供职状态(全部)' }, ...useOptions('coa_master_status')],
          }, //供职状态
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'cid')}
        pagination={tablePagination}
      />
    </>
  );
}
