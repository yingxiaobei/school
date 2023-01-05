// 电子教学日志管理

import { useTablePagination, useForceUpdate, useSearch, useOptions, useBulkStatisticsResult, useInfo } from 'hooks';
import TeachingJournalTable from '../../teachingJournal/teachingJournalTable';
import { _get } from 'utils';
import { Select, message } from 'antd';
import React, { useState } from 'react';
import RowSetting from 'components/RowSetting';
import { AuthButton, BatchProcessResult } from 'components';
import { _getResult } from '../../teachingJournal/_api';

function TeachingJournal(props: { sid: string }) {
  const { sid } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [columns, setColumns] = useState<any>([]);
  const [_showInfo] = useInfo();
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, _handleSearch] = useSearch();
  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    stuid: sid,
    // 增加条件
    crstate: _get(search, 'crstate'),
    subjectcode: _get(search, 'subjectcode'),
    traincode: _get(search, 'traincode'),
    reviewStatus: _get(search, 'reviewStatus'),
    checkstatus_jg: _get(search, 'checkstatus_jg'),
  };

  const crstateOptions = [{ value: '', label: '是否有效(全部)' }, ...useOptions('crstate_type')]; // 有效部分
  const subjectcodeOptions = [
    { value: '', label: '培训部分(全部)' },
    ...useOptions('trans_part_type', false, '-1', ['0']),
  ]; // 培训部分
  const traincodeOptions = [{ value: '', label: '课程方式(全部)' }, ...useOptions('subject_type')];
  const reviewStatusOptions = [{ value: '', label: '计时审核状态(全部)' }, ...useOptions('review_status_type')];
  const checkstatusJgOptions = [{ value: '', label: '监管审核状态(全部)' }, ...useOptions('checkstatus_jg_type')];

  const changeHandler = (field: string, value: string) => {
    _handleSearch(field, value);
    setPagination({ ...pagination, current: 1 });
    forceUpdate();
  };

  const { run: batchRecord, loading: getApplicationLoading } = useBulkStatisticsResult(_getResult, {
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
      setSelectedRows([]);
      forceUpdate();
    },
  });

  const selectStyle = React.useMemo(
    () => ({
      margin: '0 10px 16px 0',
      width: '176px',
    }),
    [],
  );

  return (
    <>
      <Select
        options={crstateOptions}
        style={selectStyle}
        onChange={(value) => {
          changeHandler('crstate', value);
        }}
        value={_get(search, 'crstate', '')}
      />
      {/* 12-13 学员档案 */}
      <Select
        options={subjectcodeOptions}
        style={selectStyle}
        onChange={(value) => {
          changeHandler('subjectcode', value);
        }}
        value={_get(search, 'subjectcode', '')}
      />

      {/* 课程方式  */}
      <Select
        options={traincodeOptions}
        style={selectStyle}
        onChange={(value) => {
          changeHandler('traincode', value);
        }}
        value={_get(search, 'traincode', '')}
      />
      {/* 计时审核状态 */}
      <Select
        options={reviewStatusOptions}
        style={selectStyle}
        onChange={(value) => {
          changeHandler('reviewStatus', value);
        }}
        value={_get(search, 'reviewStatus', '')}
      />
      {/* 监管审核状态  */}
      <Select
        options={checkstatusJgOptions}
        style={selectStyle}
        onChange={(value) => {
          changeHandler('checkstatus_jg', value);
        }}
        value={_get(search, 'checkstatus_jg', '')}
      />
      {/**学员详情-教学日志和电子教学日志的列分开配置显示隐藏       */}
      <RowSetting columns={columns} show={true} pageType="teaching_journal_student" />
      <AuthButton
        authId="student/teachingJournal:btn6"
        loading={getApplicationLoading}
        onClick={() => {
          if (selectedRows.length === 0) {
            message.error('请选择至少一条记录再查询');
            return;
          }
          batchRecord(selectedRows, {
            priKeyValMap: [
              { key: 'id', value: 'classid' },
              { key: 'sid', value: 'stuid' },
              { key: 'subject', value: 'subjectcode' },
              { key: 'signstarttime', value: 'signstarttime' },
            ],
          });
        }}
        className="ml20"
      >
        查询审核结果
      </AuthButton>
      <TeachingJournalTable
        query={query}
        setColumns={setColumns}
        ignore={ignore}
        forceUpdate={forceUpdate}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        withOutQueryTime={true}
        isFromStudent={true}
        radioOpen={true}
        setSelectedRow={setSelectedRows}
        pageType="teaching_journal_student"
      />
    </>
  );
}

export default TeachingJournal;
