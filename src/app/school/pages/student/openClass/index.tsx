import { useRef, useState } from 'react';
import {
  useTablePro,
  useRequest,
  useHash,
  useOptions,
  useVisible,
  useConfirm,
  useBulkStatisticsResult,
  useInfo,
} from 'hooks';
import {
  _getList,
  _getClassRegisterResult,
  _getStudentClassRegister,
  _stuClassExport,
  _stuClassExportBefore,
} from './_api';
import { Button, message, Modal, Row, Tooltip } from 'antd';
import { Search, AuthButton, CustomTable, ButtonContainer } from 'components';
import { getTableMaxHeightRef, _get, downloadFile, _handleIdCard } from 'utils';
import { QuestionCircleOutlined } from '@ant-design/icons';

import Review from './Review';
import ClassManage from './ClassManage';
import StudentOpenClass from './StudentOpenClass';
import { TableRowSelection } from 'antd/lib/table/interface';
import BatchProcessResult from 'components/BatchProcessResult';

export default function OpenClass() {
  const {
    tableProps,
    search,
    _refreshTable,
    _handleSearch,
    currentRecord,
    setCurrentRecord,
    currentId,
    setCurrentId,
  } = useTablePro({
    request: _getList,
  });
  const [reviewVisible, _switchReviewVisible] = useVisible();
  const [studentVisible, _switchStudentVisible] = useVisible();
  const [classVisible, _switchClassVisible] = useVisible();
  const [sids, setSids] = useState([] as string[]);
  const [tableRows, setTableRows] = useState([] as any[]);
  const [tableRowsKey, setTableRowsKey] = useState([] as any[]);
  const [_showConfirm] = useConfirm();
  const searchRef = useRef(null);
  const [_showInfo] = useInfo();
  const [visible, setVisible] = useVisible();
  // 获取备案结果
  const { loading: registerResultLoading, run: registerResultRun } = useRequest(_getClassRegisterResult, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  const auditStatusTypeHash = useHash('audit_status_type'); // 审核状态

  const columns = [
    {
      title: '所属驾校',
      dataIndex: 'practiceSchoolName',
      width: 100,
    },
    {
      title: '班次',
      dataIndex: 'classFrequency',
      width: 100,
    },
    {
      title: '班次名称',
      dataIndex: 'className',
      width: 100,
    },
    {
      title: '申请日期',
      dataIndex: 'applyTime',
      width: 120,
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
      width: 80,
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
      width: 80,
    },
    {
      title: '报名日期',
      dataIndex: 'applydate',
      width: 120,
    },
    {
      title: '审核状态',
      width: 100,
      dataIndex: 'auditStatus',
      render: (auditStatus: string, record: any) => (
        <>
          {auditStatusTypeHash[auditStatus]}
          {auditStatus === '3' && (
            <Tooltip placement="topLeft" title={record.message}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </>
      ),
    },
    {
      title: '审核日期',
      width: 120,
      dataIndex: 'auditTime',
    },
    {
      title: '审核人',
      width: 80,
      dataIndex: 'reviewer',
    },
    {
      title: '操作',
      width: 120,
      dataIndex: 'operate',
      render: (_: void, record: object) => (
        <div>
          {/* auditStatus "待审核":1;   "审核通过":2;   "审核不通过":3;    "审核中":4, */}
          {/* <AuthButton
            insertWhen={_get(record, 'auditStatus', '') === '1' || _get(record, 'auditStatus', '') === '3'}
            authId="student/openClass:btn4"
            onClick={() => {
              _switchReviewVisible();
              setCurrentId(_get(record, 'sid', ''));
            }}
            className="operation-button"
          >
            理科中心财务审核
          </AuthButton> */}
          <AuthButton
            insertWhen={_get(record, 'auditStatus', '') === '3' || _get(record, 'auditStatus', '') === '4'}
            authId="student/openClass:btn5"
            loading={_get(currentRecord, 'sid') === _get(record, 'sid') && registerResultLoading}
            onClick={() => {
              setCurrentRecord(record);
              registerResultRun({ sid: _get(record, 'sid', '') });
            }}
            className="operation-button"
          >
            获取备案结果
          </AuthButton>
        </div>
      ),
    },
  ];

  const rowSelection: TableRowSelection<{ sid: string }> = {
    selectedRowKeys: tableRowsKey,
    onChange: (selectedRowKeys: React.Key[], selectedRows: { sid: string }[]): void => {
      const sids = selectedRows.map((x: { sid: string }) => x.sid);
      setSids(sids);
      setTableRowsKey(selectedRowKeys);
      setTableRows(selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      disabled: _get(record, 'auditStatus', '') !== '1' && _get(record, 'auditStatus', '') !== '3',
    }),
  };
  const { loading, run } = useBulkStatisticsResult(_getStudentClassRegister, {
    onOk: (data) => {
      const { total, errorTotal, errHashList } = data;
      _showInfo({
        content: (
          <BatchProcessResult
            total={total}
            successTotal={total - errorTotal}
            errorTotal={errorTotal}
            errHashList={errHashList}
          />
        ),
      });
      setVisible();
      _refreshTable();
      setTableRowsKey([]);
      setSids([]);
      setTableRows([]);
    },
  });

  return (
    <>
      {/* 班次管理 */}
      {classVisible && <ClassManage onCancel={_switchClassVisible} />}

      {/* 学员开班 */}
      {studentVisible && <StudentOpenClass onCancel={_switchStudentVisible} _refreshTable={_refreshTable} />}

      {/* 开班备案 */}
      {reviewVisible && (
        <Review
          onCancel={_switchReviewVisible}
          onOk={() => {
            _switchReviewVisible();
            setTableRowsKey([]);
            _refreshTable();
            setSids([]);
            setTableRows([]);
          }}
          sid={currentId as string}
          rows={tableRows}
        />
      )}

      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Input',
            field: 'name',
            placeholder: '姓名',
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
          },
          {
            type: 'RangePicker',
            field: ['applyTimeStart', 'applyDateEnd'],
            placeholder: ['申请日期起', '申请日期止'],
          },
          {
            type: 'Input',
            field: 'year',
            placeholder: '班次年度',
          },
          {
            type: 'Input',
            field: 'classFrequency',
            placeholder: '班次',
          },
          {
            type: 'Select',
            field: 'auditStatus',
            options: [{ label: '审核状态(全部)', value: '' }, ...useOptions('audit_status_type')],
          },
        ]}
        search={search}
        ref={searchRef}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        showSearchButton={false}
      />
      {visible && (
        <Modal title={null} visible width={400} onCancel={setVisible} footer={null}>
          <p>确认向监管平台备案吗？</p>
          <Row justify="end">
            <Button onClick={setVisible}>取消</Button>
            <Button
              className="ml20"
              type="primary"
              ghost
              loading={loading}
              onClick={() => {
                run(tableRows, { priKeyValMap: [{ key: 'sid', value: 'sid' }] });
              }}
            >
              确定
            </Button>
          </Row>
        </Modal>
      )}
      <ButtonContainer
        searchRef={searchRef}
        showSearchButton={true}
        refreshTable={_refreshTable}
        loading={tableProps.loading}
      >
        <AuthButton type="primary" authId="student/openClass:btn1" className="mb20 mr20" onClick={_switchClassVisible}>
          班次管理
        </AuthButton>

        <AuthButton
          type="primary"
          authId="student/openClass:btn2"
          className="mb20 mr20"
          onClick={_switchStudentVisible}
        >
          学员开班
        </AuthButton>

        <AuthButton
          type="primary"
          authId="student/openClass:btn3"
          className="mb20  mr20"
          onClick={() => {
            if (sids.length === 0) {
              message.error('请选择学员');
              return;
            }
            setVisible();
          }}
        >
          开班备案
        </AuthButton>
        <AuthButton
          type="primary"
          authId="student/openClass:btn4"
          className="mb20  mr20"
          onClick={() => {
            if (tableRows.length === 0) {
              return message.error('请选择学员');
            }
            const record = tableRows.filter((record: any) => {
              return _get(record, 'auditStatus', '') === '1' || _get(record, 'auditStatus', '') === '3';
            });
            if (_get(record, 'length', 0) === 0) {
              return message.error('无学员满足条件');
            }
            _switchReviewVisible();
            setTableRows(record);
          }}
        >
          理科中心财务审核
        </AuthButton>
        <AuthButton
          type="primary"
          authId="student/openClass:btn6"
          onClick={async () => {
            const query = { ...search };
            const res = await _stuClassExportBefore(query);

            if (_get(res, 'code') === 200) {
              _stuClassExport({
                ...search,
              }).then((res: any) => {
                downloadFile(res, '开班管理', 'application/vnd.ms-excel', 'xlsx');
              });
            } else {
              message.error(_get(res, 'message'));
            }
          }}
          className="mb20"
        >
          导出
        </AuthButton>
      </ButtonContainer>

      <CustomTable
        {...tableProps}
        columns={columns}
        rowKey="sid"
        scroll={{ y: getTableMaxHeightRef(searchRef) }}
        rowSelection={rowSelection}
      />
    </>
  );
}
