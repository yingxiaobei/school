import { Button, Tooltip } from 'antd';
import Review from '../../phasedReview/Review';
import { useFetch, useTablePagination, useVisible, useForceUpdate, useHash } from 'hooks';
import { _getFinalAssess, _getReport } from '../../phasedReview/_api';
import { previewPdf, _get, _handleIdCard } from 'utils';
import { AuthButton, CustomTable, UploadArrLoading } from 'components';
import type { Extras } from '../StudentInfoDetail';

function PhasedReview(props: {
  currentRecord: unknown;
  type: Extras['type'];
  sid: string;
  updateFlag: number;
  loading: boolean;
  syncInfoForJGReportAuditRecords: () => void;
}) {
  const { currentRecord, type, sid, syncInfoForJGReportAuditRecords, loading, updateFlag } = props;
  const [visible, _switchVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const subjectHash = useHash('SchoolSubjectApply'); // 报审类型

  const { isLoading, data } = useFetch({
    request: _getFinalAssess,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sid: sid,
    },
    depends: [ignore, pagination.current, pagination.pageSize, updateFlag],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const SubjectApplyStatusHash = useHash('SubjectApplyStatus'); // 核实状态
  const genderHash = useHash('gender_type'); //性别

  const columns = [
    {
      title: '报审类型',
      dataIndex: 'subject',
      render: (subject: any) => subjectHash[subject],
    },
    {
      title: '申请日期',
      dataIndex: 'createtime',
      width: 120,
    },
    {
      title: '学号',
      dataIndex: 'studentnum',
      width: 150,
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (subject: any) => genderHash[subject],
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '学驾车型',
      dataIndex: 'traintype',
    },
    {
      title: '核实状态',
      dataIndex: 'isapply',
      render: (isapply: any) => SubjectApplyStatusHash[isapply],
    },
    {
      title: '提交人',
      dataIndex: 'applyname',
      width: 120,
    },
    {
      title: '提交时间',
      dataIndex: 'applytime',
      width: 150,
    },
    {
      title: '核实日期',
      dataIndex: 'resptime',
      width: 150,
    },
    {
      title: '备注',
      dataIndex: 'respmsg',
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (respmsg: any) => {
        if (respmsg === '监管') {
          return <Tooltip title="监管下发消息或向监管拉取到的报审记录">{respmsg}</Tooltip>;
        }
        return <Tooltip title={respmsg}>{respmsg}</Tooltip>;
      },
    },
    {
      title: '三联单显示',
      width: 150,
      dataIndex: 'preivewFlag',
      render: (preivewFlag: string, record: any) =>
        // preivewFlag (string)  0-不展示三联单  1-展示三联单
        preivewFlag === '1' && (
          <span
            className="color-primary pointer"
            onClick={async () => {
              const res = await _getReport({ id: _get(record, 'said') });
              previewPdf(_get(res, 'data'), false);
            }}
          >
            查看三联单
          </span>
        ),
    },
  ];

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <div>
      {loading && <UploadArrLoading message={'监管平台接收速度限制，请耐心等待'} />}
      {visible && (
        <Review onCancel={_switchVisible} onOk={_handleOk} title="初审信息" currentRecord={currentRecord} sid={sid} />
      )}

      {type !== 'history' && (
        <Button style={{ margin: '0 20px 20px 0' }} type="primary" onClick={() => _switchVisible()} className="mb20">
          去报审
        </Button>
      )}
      {/* 1. 权限控制 AuthButton */}
      {/* 2. 交互样式 由于同步数据 速度缓慢 需要长时间等待  */}
      {/* 3. 由于更新完毕后 需要刷新表格 */}
      <AuthButton
        authId="student/studentInfo:btn36"
        insertWhen={type !== 'history'}
        type="primary"
        loading={loading}
        style={{ margin: '0 20px 20px 0' }}
        onClick={syncInfoForJGReportAuditRecords}
      >
        同步监管报审记录
      </AuthButton>
      {/* {type !== 'history' && <RequestBtn />} */}

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'said')}
        pagination={tablePagination}
        scroll={{ x: 1700, y: 400 }}
      />
    </div>
  );
}

export default PhasedReview;
