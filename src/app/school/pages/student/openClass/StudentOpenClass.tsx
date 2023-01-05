import { useState } from 'react';
import { Drawer, Button, Col, Row, message } from 'antd';
import { _getChooseClass, _getNotOpenClass, _openClass } from './_api';
import { useHash, useOptions, useRequest, useTablePro } from 'hooks';
import { CustomTable, Search, Title } from 'components';
import { _get, _handleIdCard } from 'utils';
import { TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';

interface Iprops {
  onCancel(): void;
  _refreshTable(): void;
}

export default function ClassManage(props: Iprops) {
  const { onCancel, _refreshTable } = props;
  const [sids, setSids] = useState([] as string[]);
  const [classId, setClassId] = useState();
  // 待选学员
  const {
    tableProps: tablePropsStudent,
    search: searchStudent,
    _refreshTable: _refreshTableStudent,
    _handleSearch: _handleSearchStudent,
  } = useTablePro({
    request: _getNotOpenClass,
    initialSearch: {
      studenttype: [],
    },
  });
  // 开班班级
  const {
    tableProps: tablePropsClass,
    search: searchClass,
    _refreshTable: _refreshTableClass,
    _handleSearch: _handleSearchClass,
  } = useTablePro({
    request: _getChooseClass,
    initialSearch: {
      year: moment().year(),
    },
  });
  const studentTypeHash = useHash('student_type');

  const columnsStudent = [
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
    },
    {
      title: '学员类型',
      dataIndex: 'studenttype',
      render: (studenttype: string) => studentTypeHash[studenttype],
    },
  ];

  const columnsClass = [
    {
      title: '开班日期',
      dataIndex: 'startDate',
    },
    {
      title: '开班名称',
      dataIndex: 'className',
    },
    {
      title: '总人数',
      dataIndex: 'totalNum',
    },
    {
      title: '审核通过人数',
      dataIndex: 'approvedNum',
    },
    {
      title: '剩余可选人数',
      dataIndex: 'remainNum',
    },
  ];

  const rowSelection: TableRowSelection<{ sid: string }> = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: { sid: string }[]): void => {
      const sids = selectedRows.map((x: { sid: string }) => x.sid);
      setSids(sids);
    },
  };

  const rowSelectionClass: TableRowSelection<{ sid: string }> = {
    onChange: (selectedRowKeys: any): void => {
      setClassId(selectedRowKeys);
    },
  };

  const { loading, run } = useRequest(_openClass, {
    onSuccess: () => {
      _refreshTableStudent();
      _refreshTableClass();
      _refreshTable();
      setSids([]);
    },
  });

  return (
    <Drawer
      destroyOnClose
      visible
      width={1300}
      title={'学员开班'}
      onClose={onCancel}
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button onClick={onCancel} type="ghost" className="mr20">
            取消
          </Button>
          <Button
            loading={loading}
            onClick={async () => {
              if (sids.length < 1) {
                message.error('请选择学员');
                return;
              }
              if (!_get(classId, '0')) {
                message.error('请选择班级');
                return;
              }
              run({ sids, classId: _get(classId, '0') });
            }}
            type="primary"
          >
            确定
          </Button>
        </div>
      }
    >
      <Row>
        <Col span={11}>
          <Title>待选学员</Title>
          <Search
            loading={tablePropsStudent.loading}
            filters={[
              {
                type: 'Input',
                field: 'name',
                placeholder: '学员姓名',
              },
              {
                type: 'Input',
                field: 'idcard',
                placeholder: '证件号码',
              },
              {
                type: 'RangePicker',
                field: ['applyDateBegin', 'applyDateEnd'],
                placeholder: ['报名日期起', '报名日期止'],
                otherProps: {
                  allowClear: true,
                  defaultValue: undefined,
                },
              },
              {
                type: 'Select',
                field: 'studenttype',
                options: [...useOptions('student_type')],
                otherProps: {
                  placeholder: '学员类型(全部)',
                  mode: 'multiple',
                  allowClear: true,
                  defaultValue: [],
                },
              },
            ]}
            searchWidth="small"
            search={searchStudent}
            _handleSearch={_handleSearchStudent}
            refreshTable={() => {
              if (
                // 报名日期起止都存在值且不能跨年
                moment(_get(searchStudent, 'applyDateBegin')).year() !==
                  moment(_get(searchStudent, 'applyDateEnd')).year() &&
                _get(searchStudent, 'applyDateBegin') &&
                _get(searchStudent, 'applyDateEnd')
              ) {
                message.error('报名日期不能跨年');
              } else {
                _refreshTableStudent();
              }
            }}
          />

          <CustomTable
            {...tablePropsStudent}
            columns={columnsStudent}
            rowKey="sid"
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
          />
        </Col>
        <Col span={2}></Col>
        <Col span={11}>
          <Title>开班班级</Title>
          <Search
            loading={tablePropsClass.loading}
            filters={[
              {
                type: 'Input',
                field: 'year',
                placeholder: '开班年度',
              },
            ]}
            searchWidth="small"
            search={searchClass}
            _handleSearch={_handleSearchClass}
            refreshTable={_refreshTableClass}
          />
          <CustomTable
            {...tablePropsClass}
            columns={columnsClass}
            rowKey="classId"
            rowSelection={{
              type: 'radio',
              ...rowSelectionClass,
            }}
          />
        </Col>
      </Row>
    </Drawer>
  );
}
