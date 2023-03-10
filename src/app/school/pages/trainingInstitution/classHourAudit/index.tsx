import React, { useEffect, useState } from 'react';
import { _getFinalAssess, _getStudentList } from 'api';
import { AuthButton, ButtonContainer, CustomTable, Search, BatchProcessResult } from 'components';
import moment from 'moment';
import { formatTime, _get } from 'utils';
import { message, Tooltip } from 'antd';
import { useForceUpdate, useHash, useOptions, useTablePro, useVisible, useBulkStatisticsResult, useInfo } from 'hooks';
import Detail from './Detail';
import Reason from '../../student/teachingJournal/Reason';
import { _reviewLog } from '../../student/teachingJournal/_api';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { _timeAppeal } from './_api';
const crstateColor = ['black', 'green', 'orange', 'red'];

export default function ClassHourAudit() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const [reviewType, setReviewType] = useState('pass');
  const [_showInfo] = useInfo();
  const [isButtonDisable, setIsButtonDisable] = useState(false);
  const { tableProps, search, _refreshTable, _handleSearch, _data } = useTablePro({
    request: _getFinalAssess,
    initialSearch: {
      signstarttime_start: formatTime(moment().subtract(2, 'day'), 'DATE'),
      signstarttime_end: formatTime(moment(), 'DATE'),
      crstate: '0',
      isTrainAnalysisQuery: '1',
    },
    cb(data: any) {
      _get(data, 'rows.0', '') ? setSelectedRows([_get(data, 'rows.0', '')]) : setSelectedRows([]);
      _get(data, 'rows.0.classid', '')
        ? setSelectedRowKeys([_get(data, 'rows.0.classid', '')])
        : setSelectedRowKeys([]);
    },
  });

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
      _refreshTable();
    },
  });

  const subjectcodeHash = useHash('trans_part_type'); // ????????????
  const traincodeHash = useHash('subject_type'); // ????????????
  const crstateHash = useHash('crstate_type'); // ????????????
  const checkstatusJxHash = useHash('review_status_type'); // ????????????
  const reviewTypeHash = useHash('classrecord_review_type'); // ????????????
  const timeAppealHash = useHash('classrecord_appeal_status_jx'); // ????????????
  const [visible, _switchVisible] = useVisible();

  // ?????????????????????????????????/??????????????????????????? ?????????????????????????????????????????????????????????
  const commonRender = (val: string, record: any) => {
    if (
      _get(record, 'reviewStatus', '') === '2' ||
      _get(record, 'reviewStatus', '') === '4' ||
      _get(record, 'crstate', '') === '3'
    ) {
      return <span className="color-primary">{val}</span>;
    }
    return val;
  };

  const columns = [
    { title: '????????????', dataIndex: 'name', render: commonRender },
    {
      title: '????????????',
      width: 320,
      dataIndex: 'signstarttime',
      render: (signstarttime: string, record: any) => {
        const endTime = _get(record, 'signendtime', '');
        let val = '';
        if (!signstarttime) {
          val = endTime;
        }
        if (!endTime) {
          val = signstarttime;
        }
        val = `${signstarttime} - ${endTime}`;

        return commonRender(val, record);
      },
    },
    {
      title: '????????????',
      dataIndex: 'subjectcode',
      render: (subjectcode: string, record: any) => commonRender(subjectcodeHash[subjectcode], record),
    },
    {
      title: '????????????',
      dataIndex: 'traincode',
      render: (traincode: string, record: any) => commonRender(traincodeHash[traincode], record),
    },
    {
      title: '????????????',
      dataIndex: 'reviewStatus',
      render: (reviewStatus: string, record: any) => commonRender(checkstatusJxHash[reviewStatus], record),
    },
    {
      title: (
        <>
          {'???????????? '}
          <Tooltip
            placement="bottom"
            title={
              <>
                <div> ??????????????????</div>
                <div> ?????????????????????</div>
                <div> ?????????????????????</div>
                <div> ?????????????????????</div>
              </>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: 'crstate',
      render: (crstate: string) => <span style={{ color: crstateColor[Number(crstate)] }}>{crstateHash[crstate]}</span>,
    },
    {
      title: '????????????',
      dataIndex: 'reviewType',
      render: (reviewType: string, record: any) => commonRender(reviewTypeHash[reviewType], record),
    },
    {
      title: '??????????????????',
      dataIndex: 'appealStatusJx',
      render: (appealStatusJx: string, record: any) => commonRender(timeAppealHash[appealStatusJx], record),
    },
  ];
  useEffect(() => {
    if (selectedRows.length === 0) {
      setIsButtonDisable(false);
    }
    function isDisable(x: any) {
      return (
        x.reviewStatus === '7' &&
        x.crstate === '3' &&
        moment(_get(x, 'signendtime', '')).diff(moment(_get(x, 'signstarttime', '')), 'minute') < 1
      );
    }

    setIsButtonDisable(selectedRows.some(isDisable));
  }, [selectedRows]);
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    selectedRowKeys,
  };

  // ??????????????????
  const { run: batchTimeAppeal, loading: batchTimeAppealLoading } = useBulkStatisticsResult(_timeAppeal, {
    onOk: (data) => {
      const { total, errorTotal, errHashList } = data;
      showBatchProcessResult(total, errorTotal, errHashList);
      clearSelects();
    },
  });

  function clearSelects() {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    _refreshTable();
  }

  function showBatchProcessResult(
    total: number,
    errorTotal: number,
    errHashList: { [code: string]: { total: number; msg: string } },
  ) {
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
  }

  return (
    <div>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'RangePicker',
            field: ['signstarttime_start', 'signstarttime_end'],
            placeholder: ['???????????????', '???????????????'],
            otherProps: {
              allowClear: false,
              defaultValue: [moment().subtract(2, 'day'), moment()],
            },
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'stuid',
          },
          {
            type: 'Select',
            field: 'subjectcode',
            options: [{ value: '', label: '????????????(??????)' }, ...useOptions('trans_part_type')],
          },
          {
            type: 'Select',
            field: 'traincode',
            options: [{ value: '', label: '????????????(??????)' }, ...useOptions('subject_type')],
          },
          {
            type: 'Select',
            field: 'reviewType',
            options: [{ value: '', label: '????????????(??????)' }, ...useOptions('classrecord_review_type')],
          },
          {
            type: 'Select',
            field: 'crstate',
            options: [...useOptions('crstate_type'), { value: '', label: '????????????(??????)' }],
          },
          {
            type: 'Select',
            field: 'reviewStatus',
            options: [{ value: '', label: '????????????(??????)' }, ...useOptions('review_status_type')],
          },
          {
            type: 'Select',
            field: 'appealStatusJx',
            options: [{ value: '', label: '??????????????????(??????)' }, ...useOptions('classrecord_appeal_status_jx')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (moment(_get(search, 'signstarttime_start')).year() !== moment(_get(search, 'signstarttime_end')).year()) {
            message.error('????????????????????????');
          } else {
            _refreshTable();
            // setPagination({ ...pagination, current: 1 });
          }
        }}
        showSearchButton={false}
        simpleStudentRequest={_getStudentList}
      />
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          if (moment(_get(search, 'signstarttime_start')).year() !== moment(_get(search, 'signstarttime_end')).year()) {
            message.error('????????????????????????');
          } else {
            _refreshTable();
          }
        }}
        loading={tableProps.loading}
      >
        <AuthButton
          authId="trainingInstitution/classHourAudit:btn1"
          className="mb20"
          type="primary"
          loading={reviewType === 'pass' && uploadLoading}
          disabled={isButtonDisable}
          onClick={async () => {
            if (selectedRows.length < 1) {
              message.error('??????????????????????????????');
              return;
            }
            setReviewType('pass');
            run(selectedRows, {
              otherParams: { crstate: '1' }, //1 ???????????? 3 ???????????????
              priKeyValMap: [
                { key: 'classids', value: 'classid' },
                { key: 'signstarttime', value: 'signstarttime' },
              ],
              customHeader: { withFeedback: false },
            });
          }}
        >
          ????????????
        </AuthButton>
        <AuthButton
          authId="trainingInstitution/classHourAudit:btn2"
          className="ml20 mb20"
          type="primary"
          loading={reviewType === 'unPass' && uploadLoading}
          onClick={async () => {
            if (selectedRows.length < 1) {
              message.error('??????????????????????????????');
              return;
            }
            setReviewType('unPass');
            run(selectedRows, {
              otherParams: { crstate: '3' }, //1 ???????????? 3 ???????????????
              priKeyValMap: [
                { key: 'classids', value: 'classid' },
                { key: 'signstarttime', value: 'signstarttime' },
              ],
              customHeader: { withFeedback: false },
            });
          }}
        >
          ????????????
        </AuthButton>

        <AuthButton
          type="primary"
          className="ml20 mb20"
          authId={'trainingInstitution/classHourAudit:btn5'}
          loading={batchTimeAppealLoading}
          onClick={() => {
            if (selectedRows.length < 1) {
              return message.error('??????????????????????????????');
            }

            const isAllowedClick = selectedRows.every((item) => item.checkstatus_jg === '0' && item.crstate === '3');

            if (!isAllowedClick) return message.error('????????????????????????????????????????????????');

            batchTimeAppeal(selectedRows, {
              priKeyValMap: [
                { key: 'classid', value: 'classid' },
                { key: 'signstarttime', value: 'signstarttime' },
              ],
              otherParams: { updateType: '1' },
              customHeader: { withFeedback: false },
            });
          }}
        >
          ????????????
        </AuthButton>
      </ButtonContainer>
      <div style={selectedRowKeys.length === 1 ? { display: 'flex' } : {}}>
        <CustomTable
          scroll={{ x: 1300, y: document.body?.clientHeight - 440 }}
          style={selectedRowKeys.length === 1 ? { width: 500 } : {}}
          {...tableProps}
          columns={columns}
          rowKey="classid"
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
        />
        {selectedRowKeys.length === 1 && (
          <div style={{ flex: 1, border: ' 1px solid #d9d9d9', width: 'calc(100% - 520px)' }} className="ml20 mt20">
            <Detail
              classid={_get(selectedRows, '0.classid')}
              onOk={() => {
                _refreshTable();
                setSelectedRows([_get(_data, 'rows.0', '')]);
                setSelectedRowKeys([_get(_data, 'rows.0.classid', '')]);
              }}
              currentRecord={_get(selectedRows, '0', '')}
              stuid={_get(selectedRows, '0.stuid')}
              _switchVisible={_switchVisible}
              ignore={ignore}
              forceUpdate={forceUpdate}
              coachid={_get(selectedRows, [0, 'coachid'])}
            />
          </div>
        )}

        {visible && (
          <Reason
            onCancel={_switchVisible}
            onOk={() => {
              forceUpdate();
              _switchVisible();
              _refreshTable();
            }}
            query={{
              classids: _get(selectedRows, '0.classid', ''),
              signstarttime: _get(selectedRows, '0.signstarttime', ''),
              crstate: '3',
            }}
            invalidReasonWay={'all'}
          />
        )}
      </div>
    </div>
  );
}
