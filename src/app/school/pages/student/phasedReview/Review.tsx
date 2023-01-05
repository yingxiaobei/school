import { useState } from 'react';
import { Drawer, Button, Tooltip } from 'antd';
import {
  useFetch,
  useTablePagination,
  useSearch,
  useOptions,
  useHash,
  useForceUpdate,
  useAuth,
  useVisible,
  useRequest,
  useBulkStatisticsResult,
  useInfo,
} from 'hooks';
import { _getStudent, _addReview, _settleProducerPerson } from './_api';
import { _getStudentList } from 'api';
import { Search, CustomTable, BatchProcessResult } from 'components';
import { insertWhen, _get, _handleIdCard } from 'utils';
import SettlementRecords from '../../financial/settlementRecords';

interface ReviewProps {
  onCancel: () => void;
  onOk: () => void;
  title: string;
  currentRecord?: any;
  sid?: string;
}

function Review({ onCancel, title, currentRecord, sid }: ReviewProps) {
  const [search, _handleSearch] = useSearch({ sid: sid });
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const [currentRec, setCurrentRec] = useState();
  const [visible, setVisible] = useVisible();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [_showInfo] = useInfo();

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getStudent,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      subject: _get(search, 'subject'),
      sid: _get(search, 'sid'),
      status: _get(search, 'status'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setSelectedRowKeys([]);
    },
  });
  const { run } = useRequest(_settleProducerPerson, {
    onSuccess: () => {
      setVisible();
    },
  });

  const subjectHash = useHash('SchoolSubjectApply'); // 报审类型
  const reportStatusHash = useHash('report_status_type'); // 报审状态

  // FIXME:改部分根据老倪提出，更改了排序及展示字段
  const columns = [
    {
      title: '报审类型',
      width: 80,
      dataIndex: 'subject',
      render: (subject: any) => subjectHash[subject],
    },
    {
      title: '评判描述',
      dataIndex: 'msg',
      width: 180,
      // 接口侧要求以 ; 作为分隔换行显示
      render: (msg: any, record: any) => (
        <Tooltip
          title={
            <div>
              {(msg || '').split(';').map((x: any, index: number) => (
                <div key={index}>{x}</div>
              ))}
            </div>
          }
        >
          {(msg || '').split(';').map((x: any, index: number) => (
            <div
              key={index}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: 170,
                whiteSpace: 'nowrap',
              }}
            >
              {x.indexOf('账户结算未完成') !== -1 ? (
                <span>
                  {x}
                  <span
                    onClick={() => {
                      setCurrentRec(record);
                      run({ sid: _get(record, 'sid') });
                    }}
                    className=" color-primary text-underline  hover-active ml10"
                  >
                    去结算
                  </span>
                </span>
              ) : (
                x
              )}
            </div>
          ))}
        </Tooltip>
      ),
    },
    {
      title: '学员姓名',
      width: 80,
      dataIndex: 'name',
    },
    {
      title: '证件号码',
      width: 150,
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '教练姓名',
      dataIndex: 'coachname',
      width: 80,
    },
    {
      title: '可报审学时/分钟',
      ellipsis: false,
      width: 70,
      dataIndex: 'traintime',
    },
    {
      title: '可报审里程/公里',
      ellipsis: false,
      width: 70,
      dataIndex: 'mileage',
    },
    ...insertWhen(useAuth('student/phasedReview:traincerttime'), [
      {
        title: (
          <>
            <div>已训学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        width: 90,
        dataIndex: 'traincerttime',
      },
    ]),
    ...insertWhen(useAuth('student/phasedReview:outlineCertTotaltime'), [
      {
        title: (
          <>
            <div>额定学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        width: 90,
        dataIndex: 'outlineCertTotaltime',
      },
    ]),
    {
      title: '学驾车型',
      width: 70,
      dataIndex: 'traintype',
    },
    {
      title: '大纲规定学时/分钟',
      ellipsis: false,
      width: 70,
      dataIndex: 'outlineTotaltime',
    },
    {
      title: '大纲规定里程/公里',
      ellipsis: false,
      width: 70,
      dataIndex: 'outlineMileage',
    },
    {
      title: '报审状态',
      width: 70,
      dataIndex: 'status',
      render: (status: any) => reportStatusHash[status],
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    selectedRowKeys,
  };

  const schoolSubjectApplyOptions = useOptions('SchoolSubjectApply'); // 报审类型
  const reportStatusTypeOptions = useOptions('report_status_type'); // 报审状态
  const { loading: uploadLoading, run: batchProcessRun } = useBulkStatisticsResult(_addReview, {
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
      setSelectedRowKeys([]);
      setSelectedRows([]);
      forceUpdate();
    },
  });

  return (
    <>
      {visible && (
        <Drawer destroyOnClose visible width={900} title={'结算记录'} onClose={setVisible} maskClosable={false}>
          <SettlementRecords idcard={_get(currentRec, 'idcard')} sid={_get(currentRec, 'sid')} type="phasedReview" />
        </Drawer>
      )}
      <Drawer
        destroyOnClose
        visible
        width={1100}
        title={title}
        onClose={onCancel}
        maskClosable={false}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={onCancel} className="mr20">
              取消
            </Button>
            <Button
              disabled={selectedRowKeys.length === 0}
              loading={uploadLoading}
              type="primary"
              onClick={async () => {
                batchProcessRun(selectedRows, {
                  priKeyValMap: [{ key: 'applyPrestepId', value: 'id' }],
                });
              }}
              className="mr20"
            >
              确定
            </Button>
          </div>
        }
      >
        <>
          <Search
            studentOptionData={
              currentRecord
                ? [
                    {
                      value: sid,
                      label:
                        (_get(currentRecord, 'name') || _get(currentRecord, 'studentname')) +
                        '-' +
                        _get(currentRecord, 'idcard'),
                    },
                  ]
                : []
            }
            filters={[
              {
                type: 'SimpleSelectOfStudent',
                field: 'sid',
              },
              {
                type: 'Select',
                field: 'subject',
                options: [{ value: '', label: '报审类型(全部)' }, ...schoolSubjectApplyOptions],
              },
              {
                type: 'Select',
                field: 'status',
                options: [{ value: '', label: '报审状态(全部)' }, ...reportStatusTypeOptions],
              },
            ]}
            search={search}
            _handleSearch={_handleSearch}
            refreshTable={() => {
              setPagination({ ...pagination, current: 1 });
              forceUpdate();
            }}
            simpleStudentRequest={_getStudentList}
            extraParamsForCustomRequest={{ status: '01' }}
          />

          <CustomTable
            scroll={{ x: 1300, y: document.body?.clientHeight - 300 }}
            columns={columns}
            bordered
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
            dataSource={_get(data, 'rows', [])}
            rowKey={(record: any) => _get(record, 'id')}
            pagination={tablePagination}
            loading={isLoading}
          />
        </>
      </Drawer>
    </>
  );
}

export default Review;
