import { useEffect, useState } from 'react';
import { Modal, message, Drawer } from 'antd';
import {
  useFetch,
  useTablePagination,
  useHash,
  useForceUpdate,
  useOptions,
  useBulkStatisticsResult,
  useInfo,
  useSearch,
} from 'hooks';
import { _getStudentList, _getCustomParam } from 'api';
import { _getWaitUpload, _uploadLog, _getTrainningTimeMinPatch, _getJsImageupPatch, _getClassrecord } from './_api';
import { _get, insertWhen, Auth, _handleIdCard } from 'utils';
import { AuthButton, CustomTable, BatchProcessResult, Search } from 'components';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import UploadArrLoading from './UploadArrLoading';

const { warning } = Modal;

interface IProps {
  onCancel: any;
  signstarttime_start: string; //从搜索组件获取时间
}

export default function UploadArr(props: IProps) {
  const { onCancel, signstarttime_start } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({ pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [checkstatus_jg, setCheckstatus_jg] = useState('0'); // 默认是待上传（保持和原先一样）
  const [ignore, forceUpdate] = useForceUpdate();
  const [offsetLoading, setOffsetLoading] = useState(false);
  const [search, _handleSearch] = useSearch({ checkstatus_jg: '0' });
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [_showInfo] = useInfo();

  const { loading, run } = useBulkStatisticsResult(_uploadLog, {
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

  // FIXME:any
  const { isLoading, data } = useFetch<any>({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      signstarttime_start: moment(signstarttime_start).format('YYYY-MM-DD'),
      ...search,
    },
    request: _getWaitUpload,
    depends: [
      pagination.current,
      pagination.pageSize,
      ignore,
      _get(search, 'checkstatus_jg', ''),
      _get(search, 'stuid', ''),
      _get(search, 'subjectcode', ''),
      _get(search, 'traincode', ''),
      _get(search, 'stuFundConfirmStatus', ''),
    ],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  useEffect(() => {
    setPagination({ ...pagination, current: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    selectedRowKeys,
  };

  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const crstateHash = useHash('crstate_type'); // 是否有效
  const checkstatusJxHash = useHash('checkstatus_jx_type'); // 初审状态
  const checkstatusJgHash = useHash('checkstatus_jg_type'); // 上传状态监管审核
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const stuFundConfirmHash = useHash('stu_fund_confirm_status_type'); // 资金确认状态

  const { data: paramData } = useFetch({
    request: _getCustomParam, //"是否开启学员资金确认(0-不开启，1-开启)"
    query: { paramCode: 'open_student_fund_confirmation', schoolId: Auth.get('schoolId') },
  });
  const isHidden = _get(paramData, 'paramValue', '0') === '1';
  const stuFundStatus = useOptions('stu_fund_confirm_status_type');
  const columns = [
    {
      title: '上传时间',
      dataIndex: 'create_date',
      width: 110,
    },
    {
      title: '编号',
      width: 50,
      dataIndex: 'recnum',
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
      width: 70,
      dataIndex: 'licnum',
    },
    {
      title: '培训部分',
      width: 70,
      dataIndex: 'subjectcode',
      render: (subjectcode: any) => subjectcodeHash[subjectcode],
    },
    {
      title: '课程方式',
      width: 70,
      dataIndex: 'traincode',
      render: (traincode: any) => traincodeHash[traincode],
    },
    {
      title: '签到时间',
      width: 130,
      dataIndex: 'signstarttime',
    },
    {
      title: '签退时间',
      width: 130,
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
      dataIndex: 'crstate',
      width: 70,
      render: (crstate: any) => crstateHash[crstate],
    },
    {
      title: '学员状态',
      width: 70,
      dataIndex: 'stu_status',
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
    ...insertWhen(isHidden, [
      {
        title: '资金确认状态',
        width: 120,
        dataIndex: 'stuFundConfirmStatus',
        render: (text: any) => stuFundConfirmHash[text],
      },
    ]),
  ];

  return (
    <>
      {loading && <UploadArrLoading />}
      {offsetLoading && <UploadArrLoading />}
      <Drawer
        visible
        destroyOnClose
        width={1100}
        title={'批量上传'}
        maskClosable={false}
        onClose={onCancel}
        footer={null}
      >
        <Search
          loading={isLoading}
          filters={[
            {
              type: 'SimpleSelectOfStudent',
              field: 'stuid',
            },
            {
              type: 'Select',
              field: 'checkstatus_jg',
              placeholder: '监管审核状态',
              options: [...useOptions('checkstatus_jg_type')],
            },
            {
              type: 'Select',
              field: 'traincode',
              placeholder: '课程方式',
              options: [
                { value: '', label: '课程方式(全部)' },
                { value: '1', label: '实操' },
                { value: '2', label: '课堂教学' },
                { value: '3', label: '模拟器教学' },
                { value: '4', label: '远程教学' },
              ],
            },
            {
              type: 'Select',
              field: 'subjectcode',
              placeholder: '培训部分',
              options: [{ value: '', label: '培训部分(全部)' }, ...useOptions('trans_part_type')],
            },
            ...(insertWhen(isHidden, [
              {
                type: 'Select',
                field: 'stuFundConfirmStatus',
                placeholder: '资金确认状态',
                options: [{ value: '', label: '资金确认状态(全部)' }, ...stuFundStatus],
              },
            ]) as any),
          ]}
          search={search}
          _handleSearch={(value, data) => {
            value === 'checkstatus_jg' && setCheckstatus_jg(data);
            _handleSearch(value, data);
          }}
          refreshTable={forceUpdate}
          simpleStudentRequest={_getStudentList}
          showSearchButton={false}
        />
        <AuthButton
          authId="student/teachingJournal:btn14"
          type="primary"
          loading={loading}
          style={{ margin: '0 20px 20px 0' }}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要上传的记录');
              return;
            }
            run(selectedRows, {
              otherParams: { year: moment(signstarttime_start).format('YYYY'), reqSource: '1' },
              priKeyValMap: [
                { key: 'classid', value: 'classid' },
                { key: 'checkstatus_jg', value: 'checkstatus_jg' },
              ],
              customHeader: { withFeedback: false },
            });
          }}
        >
          确定上传
        </AuthButton>

        <AuthButton
          authId="student/teachingJournal:btn7"
          className={isHidden ? '' : 'ml20'}
          insertWhen={checkstatus_jg === '4' || checkstatus_jg === '1'} // 已上传 || 上传失败
          type="primary"
          loading={offsetLoading}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要上传的记录');
              return;
            }

            setOffsetLoading(true);

            let isAllSuccess = true; // 记录日志是否全部上传成功
            let errData = []; // 错误数据
            let errCount = 0;
            const total = selectedRowKeys.length;
            for (let i = 0; i < selectedRowKeys.length; i++) {
              // 分钟学时
              const res1 = await _getTrainningTimeMinPatch({
                classid: selectedRowKeys[i],
                year: moment(signstarttime_start).format('YYYY'),
              });
              // 日志照片
              const res2 = await _getJsImageupPatch({
                classid: selectedRowKeys[i],
                year: moment(signstarttime_start).format('YYYY'),
              });
              // 日志上报
              const res3 = await _getClassrecord({
                classid: selectedRowKeys[i],
                year: moment(signstarttime_start).format('YYYY'),
                checkstatus_jg,
              });
              if (_get(res1, 'code') !== 200 || _get(res2, 'code') !== 200 || _get(res3, 'code') !== 200) {
                isAllSuccess = false;
                errCount++;
                errData.push(`
                编号:${_get(data, `rows.${i}.recnum`)}
                ${_get(res1, 'code') === 200 ? '' : `,分钟学时: ${_get(res1, 'message')}`}
                ${_get(res2, 'code') === 200 ? '' : `,日志照片: ${_get(res2, 'message')}`}
                ${_get(res3, 'code') === 200 ? '' : `,日志上报: ${_get(res3, 'message')}`}
                `);
              }
            }

            if (isAllSuccess) {
              // message.success('全部教学日志补传成功');
              warning({
                icon: <ExclamationCircleOutlined />,
                title: '提示信息',
                maskClosable: true,
                content: (
                  <>
                    <div className="bold">
                      本次共处理{total}条, 处理成功{total}条，处理失败0条
                    </div>
                  </>
                ),
              });
            } else {
              warning({
                icon: <ExclamationCircleOutlined />,
                title: '提示信息',
                maskClosable: true,
                content: (
                  <>
                    <div className="bold">
                      本次共处理{total}条, 处理成功{total - errCount}条，处理失败{errCount}条
                    </div>
                    {errData.map((x) => (
                      <div>{x}</div>
                    ))}
                  </>
                ),
              });
            }
            setSelectedRows([]);
            setSelectedRowKeys([]);
            setOffsetLoading(false);
            forceUpdate();
          }}
        >
          批量补传
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
