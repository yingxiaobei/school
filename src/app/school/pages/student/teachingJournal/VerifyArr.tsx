import { useState } from 'react';
import { Modal, Select, message, Row, Drawer } from 'antd';
import {
  useFetch,
  useTablePagination,
  useHash,
  useForceUpdate,
  useOptions,
  useBulkStatisticsResult,
  useInfo,
} from 'hooks';
import { _getFinalAssess, _reviewLog } from './_api';
import { _get, _handleIdCard } from 'utils';
import { AuthButton, CustomTable, ItemCol, BatchProcessResult } from 'components';

import moment from 'moment';

export default function VerifyArr(props: any) {
  const { onCancel } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [checkstatus_jx, setCheckstatus_jx] = useState('0');
  const [ignore, forceUpdate] = useForceUpdate();
  const [time, setTime] = useState(`${moment().startOf('year').format('YYYY-MM-DD')}`); // 取到当前年年初 1月1号
  const [subjectcode, setSubjectcode] = useState(''); // 培训部分
  const [offsetLoading, setOffsetLoading] = useState(false);
  const subjectTypeOptions = useOptions('trans_part_type');
  const [reviewType, setReviewType] = useState('pass');
  const [_showInfo] = useInfo();

  const { isLoading, data } = useFetch({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      signstarttime_start: time,
      checkstatus_jx,
      batchSetupFlag: '1', // 这个选填字段新加 目的在于过滤查询数据中系统自动审批但未上传的数据，这些数据可以批量审核
      subjectcode,
    },
    request: _getFinalAssess,
    depends: [pagination.current, pagination.pageSize, checkstatus_jx, ignore, time, subjectcode],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      // 系统自动审批；checkstatus_jx:'9'
      // 训练时长: duration : 0
      // 整体无效：crstate：'3'
      disabled:
        record.checkstatus_jx === '9' &&
        record.crstate === '3' &&
        moment(_get(record, 'signendtime', '')).diff(moment(_get(record, 'signstarttime', '')), 'minute') < 1,
      name: record.name,
    }),
    selectedRowKeys,
  };

  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const crstateHash = useHash('crstate_type'); // 是否有效
  const checkstatusJxHash = useHash('checkstatus_jx_type'); // 初审状态
  const checkstatusJgHash = useHash('checkstatus_jg_type'); // 上传状态监管审核
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const { loading: uploadLoading, run } = useBulkStatisticsResult(_reviewLog, {
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
  const columns = [
    {
      title: '上传时间',
      dataIndex: 'create_date',
      width: 110,
    },
    {
      title: '编号',
      dataIndex: 'recnum',
      width: 50,
    },
    {
      title: '教练姓名',
      width: 70,
      dataIndex: 'coachname',
    },
    {
      title: '学员姓名',
      width: 70,
      dataIndex: 'name',
    },
    {
      title: '学员证件',
      dataIndex: 'stu_idcard',
      width: 140,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '车牌号',
      dataIndex: 'licnum',
      width: 80,
    },
    {
      title: '培训部分',
      dataIndex: 'subjectcode',
      width: 80,
      render: (subjectcode: any) => subjectcodeHash[subjectcode],
    },
    {
      title: '课程方式',
      width: 60,
      dataIndex: 'traincode',
      render: (traincode: any) => traincodeHash[traincode],
    },
    {
      title: '签到时间',
      width: 150,
      dataIndex: 'signstarttime',
    },
    {
      title: '签退时间',
      width: 150,
      dataIndex: 'signendtime',
    },
    {
      title: '训练时长/分钟',
      dataIndex: 'duration',
      ellipsis: false,
      width: 50,
    },
    {
      title: '有效训练时长/分钟',
      dataIndex: 'validtime',
      ellipsis: false,
      width: 60,
    },
    {
      title: '训练里程/公里',
      dataIndex: 'mileage',
      ellipsis: false,
      width: 50,
    },
    {
      title: '有效训练里程/公里',
      dataIndex: 'validmileage',
      ellipsis: false,
      width: 60,
    },
    {
      title: '是否有效',
      width: 70,
      dataIndex: 'crstate',
      render: (crstate: any) => crstateHash[crstate],
    },
    {
      title: '学员状态',
      dataIndex: 'stu_status',
      width: 80,
      render: (stu_status: any) => stuStatusHash[stu_status],
    },
    {
      title: '计时审核状态',
      width: 80,
      dataIndex: 'checkstatus_jx',
      render: (checkstatus_jx: any) => checkstatusJxHash[checkstatus_jx],
    },
    {
      title: '监管审核状态',
      ellipsis: false,
      width: 60,
      dataIndex: 'checkstatus_jg',
      render: (checkstatus_jg: any) => checkstatusJgHash[checkstatus_jg],
    },
  ];

  return (
    <>
      <Drawer
        visible
        destroyOnClose
        width={1100}
        title={'批量学时初审'}
        maskClosable={false}
        onClose={onCancel}
        footer={null}
      >
        <Row>
          <ItemCol label="培训部分" span={8}>
            <Select
              options={[{ value: '', label: '培训部分(全部)' }, ...subjectTypeOptions]}
              value={subjectcode}
              onChange={(value: any) => {
                setSubjectcode(value);
                setPagination({ ...pagination, current: 1 });
              }}
              style={{ width: 180, marginLeft: 20 }}
            />
          </ItemCol>
          <ItemCol label="计时审核状态" span={8}>
            <Select
              options={[
                { value: '0', label: '未初审' },
                { value: '2', label: '已初审' },
                { value: '9', label: '系统自动审批' },
              ]}
              value={checkstatus_jx}
              onChange={(value: any) => {
                setCheckstatus_jx(value);
                setPagination({ ...pagination, current: 1 });
              }}
              style={{ width: 180, marginLeft: 20 }}
            />
          </ItemCol>
          {/* 年份选择现在默认当前后三年 */}
          <ItemCol label="年份" span={8}>
            <Select
              options={[
                { value: `${moment().startOf('year').format('YYYY-MM-DD')}`, label: `${moment().format('YYYY')}` },
                {
                  value: `${moment()
                    .year(moment().year() - 1)
                    .startOf('year')
                    .format('YYYY-MM-DD')}`,
                  label: `${moment()
                    .year(moment().year() - 1)
                    .format('YYYY')}`,
                },
                {
                  value: `${moment()
                    .year(moment().year() - 2)
                    .startOf('year')
                    .format('YYYY-MM-DD')}`,
                  label: `${moment()
                    .year(moment().year() - 2)
                    .format('YYYY')}`,
                },
              ]}
              value={time}
              onChange={(value: any) => {
                setTime(value);
                setPagination({ ...pagination, current: 1 });
              }}
              style={{ width: 180, marginLeft: 20 }}
            />
          </ItemCol>
        </Row>

        <AuthButton
          authId="student/teachingJournal:btn8"
          className="mb20"
          // 只有当计时审核状态为未初审和系统自动审批的时候展示按钮
          insertWhen={checkstatus_jx === '0' || checkstatus_jx === '9' || checkstatus_jx === '2'}
          type="primary"
          loading={reviewType === 'pass' && uploadLoading}
          onClick={async () => {
            if (selectedRows.length < 1) {
              message.error('请选中需要通过的记录');
              return;
            }
            setReviewType('pass');
            run(selectedRows, {
              otherParams: { crstate: '1' }, //1 审核通过 3 审核不通过
              priKeyValMap: [
                { key: 'classids', value: 'classid' },
                { key: 'signstarttime', value: 'signstarttime' },
              ],
              customHeader: { withFeedback: false },
            });
          }}
        >
          批量有效
        </AuthButton>
        <AuthButton
          authId="student/teachingJournal:btn8"
          className="ml20 mb20"
          insertWhen={checkstatus_jx === '0' || checkstatus_jx === '9' || checkstatus_jx === '2'}
          type="primary"
          loading={reviewType === 'unPass' && uploadLoading}
          onClick={async () => {
            if (selectedRows.length < 1) {
              message.error('请选中需要不通过的记录');
              return;
            }

            setReviewType('unPass');
            run(selectedRows, {
              otherParams: { crstate: '3' }, //1 审核通过 3 审核不通过
              priKeyValMap: [
                { key: 'classids', value: 'classid' },
                { key: 'signstarttime', value: 'signstarttime' },
              ],
              customHeader: { withFeedback: false },
            });
          }}
        >
          批量无效
        </AuthButton>
        <CustomTable
          scroll={{ x: 2300, y: document.body.clientHeight - 300 }}
          columns={columns}
          loading={isLoading}
          bordered
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          dataSource={_get(data, 'rows', [])}
          rowKey={(record: any) => _get(record, 'classid')}
          pagination={tablePagination}
        />
      </Drawer>
    </>
  );
}
