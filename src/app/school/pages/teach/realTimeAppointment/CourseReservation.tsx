/* eslint-disable react-hooks/exhaustive-deps */
// 实操约排课

import { useState, useEffect } from 'react';
import moment from 'moment';
import { Modal, Button, Checkbox, Spin } from 'antd';
import { _getDetails, _getScheduleList } from './_api';
import { Search } from 'components';
import { useFetch, useVisible, useSearch, useForceUpdate, useHash, useTablePagination } from 'hooks';
import { AppointmentCard } from 'components';
import EditCourse from './EditCourse';
import CoachInfo from './components/CoachInfo';
import OrderRecordTable from '../orderRecord/OrderRecordTable';
import AddCourse from './AddCourse';
import { Auth, _get } from 'utils';

const weekHash = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function CourseReservation(props: any) {
  const {
    selectedOrderCourse,
    setSelectedOrderCourse,
    _switchCourseReservationVisible,
    _switchOrderCourseVisible,
    currentId,
    currentRecordPlan,
    selectedDate,
    _handleReset,
    setSelectedDate,
    setSelectedCourseList,
  } = props;
  const [search, _handleSearch]: any = useSearch({ startDate: moment(), endDate: moment().add(31, 'day') });
  const [ignore, forceUpdate] = useForceUpdate();
  const [ignore2, forceUpdateCourseList] = useForceUpdate();
  const [calendar, setCalendar] = useState<any>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [_orderListVisible, _switchOrderListVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [_editCourseVisible, _switchEditCourseVisible] = useVisible();
  const subjectcodeHash = useHash('trans_part_type');
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [visible, _switchVisible] = useVisible();

  const { data: coachInfo } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
  });

  // FIXME:wy
  const { data: courseList = [], isLoading } = useFetch<any>({
    request: _getScheduleList,
    query: {
      cid: currentId,
      endTime: selectedDate,
      startTime: selectedDate,
      skuschoolid: Auth.get('schoolId'), //实操默认传当前驾校id
    },
    depends: [selectedDate, ignore2],
  });

  useEffect(() => {
    const calendar = [];
    let current = search.startDate;
    while (current && moment(current).isSameOrBefore(search.endDate)) {
      calendar.push(moment(current).format('YYYY-MM-DD'));
      current = moment(current).add(1, 'day');
    }
    setCalendar(calendar);
    setSelectedOrderCourse(new Set());
    setSelectedCourseList([]);
    setSelectedDate(_get(calendar, '0'));
  }, [ignore]);

  useEffect(() => {
    if (courseList.filter((x: any) => String(x.applyStatus) === '1').length === selectedOrderCourse.size) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }

    setSelectedCourseList(courseList.filter((x: any) => selectedOrderCourse.has(x.skuId)));
  }, [selectedOrderCourse]);

  return (
    <>
      <Modal
        visible
        width={1000}
        title="教学课程"
        footer={null}
        maskClosable={false}
        onCancel={() => {
          _handleReset();
          _switchCourseReservationVisible();
        }}
      >
        <Spin spinning={isLoading}>
          <Search
            refreshTable={() => {
              forceUpdate();
              setPagination({ ...pagination, current: 1 });
            }}
            search={search}
            _handleSearch={_handleSearch}
            filters={[
              {
                type: 'RangePickerDisable',
                field: ['startDate', 'endDate'],
                placeholder: ['排班日期起', '排班日期止'],
                rangeDay: 30,
                rangeAllowClear: false,
              },
            ]}
          />

          <div>
            {calendar.map((x: string, index: number) => (
              <Button
                onClick={() => setSelectedDate(x)}
                style={{ margin: '0 10px 10px 0' }}
                key={index}
                type={selectedDate === x ? 'primary' : 'default'}
              >
                {`${moment(x).format('MM月DD日')} ${weekHash[moment(x).day()]}`}
              </Button>
            ))}
          </div>

          <CoachInfo coachInfo={coachInfo} />

          <div style={{ display: 'flex', margin: '20px 0' }}>
            <div style={{ background: 'lightgray' }} className="flex-box mr10 w100">
              未发布
            </div>
            <div style={{ background: '#63c3a4' }} className="flex-box mr10 w100">
              已发布
            </div>
            <div style={{ background: 'yellow' }} className="flex-box mr10 w100">
              已约满
            </div>
            <div style={{ background: '#d8d8d8' }} className="flex-box mr10 w100">
              已过期
            </div>
            {_get(courseList, 'length', 0) > 0 && (
              <Button
                type="primary"
                onClick={() => {
                  _switchEditCourseVisible();
                }}
              >
                编辑课程
              </Button>
            )}
            <Button
              onClick={() => {
                _switchVisible();
              }}
              style={{ marginLeft: 12 }}
              type="primary"
              ghost
            >
              新增课程
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              width: 952,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {(courseList || []).map((x: any, index: number) => {
              const status = `${_get(x, 'applyStatus')}`; // 预约状态 0 未发布 1：可约 2：已约满 3：已过期

              return (
                <AppointmentCard
                  status={status}
                  index={index}
                  key={index}
                  x={x}
                  setCurrentRecord={setCurrentRecord}
                  subjectcodeHash={subjectcodeHash}
                  selectedOrderCourse={selectedOrderCourse}
                  setSelectedOrderCourse={setSelectedOrderCourse}
                  _switchOrderListVisible={_switchOrderListVisible}
                />
              );
            })}
          </div>

          {selectedOrderCourse.size > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Checkbox
                checked={isChecked}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrderCourse(
                      new Set(courseList.filter((x: any) => String(x.applyStatus) === '1').map((y: any) => y.skuId)),
                    );
                  } else {
                    setSelectedOrderCourse(new Set());
                  }
                  setIsChecked(e.target.checked);
                }}
              >
                全选
              </Checkbox>
              <Button
                type="primary"
                onClick={() => {
                  _switchCourseReservationVisible();
                  _switchOrderCourseVisible();
                }}
              >
                帮学员预约
              </Button>
            </div>
          )}
        </Spin>
      </Modal>

      {visible && (
        <AddCourse
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            forceUpdateCourseList();
          }}
          currentRecord={currentRecordPlan}
          title="新增课程"
        />
      )}

      {_orderListVisible && (
        <Modal footer={null} width={1200} visible title="课程预约记录" onCancel={_switchOrderListVisible}>
          <OrderRecordTable
            query={{
              page: pagination.current,
              limit: pagination.pageSize,
              cid: _get(currentRecord, 'cid'),
              plan_id: _get(currentRecord, 'skuId'),
            }}
            pagination={pagination}
            setPagination={setPagination}
            tablePagination={tablePagination}
          />
        </Modal>
      )}

      {_editCourseVisible && (
        <EditCourse
          courseList={courseList}
          coachInfo={coachInfo}
          selectedDate={selectedDate}
          _switchEditCourseVisible={() => {
            _switchEditCourseVisible();
            forceUpdateCourseList();
          }}
        />
      )}
    </>
  );
}
