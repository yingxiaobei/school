// 电子教学日志管理
import { useRef, useState } from 'react';
import moment from 'moment';
import {
  useTablePagination,
  useSearch,
  useForceUpdate,
  useOptions,
  useVisible,
  useAuth,
  useFetch,
  useBulkStatisticsResult,
  useInfo,
} from 'hooks';
import { Search, AuthButton, ButtonContainer, BatchProcessResult } from 'components';
import { formatTime, insertWhen, _get, Auth } from 'utils';
import TeachingJournalTable from './teachingJournalTable';
import { _getCoachList, _getCarList, _appealArguments, _getResult } from './_api';
import { _getStudentList, _getCustomParam } from 'api';
import UploadArr from './UploadArr';
import RowSetting from 'components/RowSetting';
import VerifyArr from './VerifyArr';
import { message } from 'antd';
import { FiltersType } from 'components/Search';

function TeachingJournal() {
  const [search, _handleSearch] = useSearch({
    signstarttime_start: moment().startOf('month'),
    signstarttime_end: moment(),
  });
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [optionCarData, setOptionCarData] = useState<{ label: string; value: string }[]>([]); // 车牌号下拉数据
  const [visible, _switchVisible] = useVisible();
  const [verifyArrVisible, _verifyArrSwitchVisible] = useVisible();
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [renderTable, forceRender] = useForceUpdate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [_showInfo] = useInfo();

  const [columns, setColumns] = useState<unknown[]>([]);
  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    signstarttime_start: formatTime(_get(search, 'signstarttime_start'), 'DATE'),
    signstarttime_end: formatTime(_get(search, 'signstarttime_end'), 'DATE'),
    create_date_start: formatTime(_get(search, 'create_date_start'), 'DATE'),
    create_date_end: formatTime(_get(search, 'create_date_end'), 'DATE'),
    coachname: _get(search, 'coachname'),
    coa_idcard: _get(search, 'coa_idcard'),
    carid: _get(search, 'carid'),
    stu_status: _get(search, 'stu_status'),
    subjectcode: _get(search, 'subjectcode'),
    reviewStatus: _get(search, 'reviewStatus'),
    checkstatus_jg: _get(search, 'checkstatus_jg'),
    crstate: _get(search, 'crstate'),
    stuid: _get(search, 'sid'),
    coachid: _get(search, 'cid'),
    iscyzg: _get(search, 'iscyzg'),
    traincode: _get(search, 'traincode', ''),
    stuFundConfirmStatus: _get(search, 'stuFundConfirmStatus', ''),
    appealStatus: _get(search, 'appealStatus', ''),
    isshare: _get(search, 'isshare', ''), // 配比学时
  };

  const { data: paramData } = useFetch({
    request: _getCustomParam, //"是否开启学员资金确认(0-不开启，1-开启)"
    query: { paramCode: 'open_student_fund_confirmation', schoolId: Auth.get('schoolId') },
  });
  const isHidden = _get(paramData, 'paramValue', '0') === '1';

  const { data: areaData } = useFetch({
    request: _appealArguments, // 监管请求平台类型（0：国交，1：至正，2：福建）
    query: { schoolId: Auth.get('schoolId') },
  });

  const IsFuJian =
    _get(
      areaData?.find((item) => item.trainType === '0'),
      'superviseComplainStatus',
    ) === '1'; // 福建

  const tableHeight = () => {
    return (
      document.body.clientHeight -
      Number(searchRef?.current?.clientHeight || 168) - //search组件三行的高度
      Number(document.querySelector('.ant-tabs-nav')?.clientHeight || 0) -
      Number(document.querySelector('.ant-layout-header')?.clientHeight || 0) -
      175 -
      50
    );
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

  const filter: FiltersType = [
    {
      type: 'RangePicker',
      field: ['signstarttime_start', 'signstarttime_end'],
      placeholder: ['签到日期起', '签到日期止'],
      otherProps: {
        allowClear: false,
        defaultValue: [moment().startOf('month'), moment()],
      },
    },
    {
      type: 'RangePicker',
      field: ['create_date_start', 'create_date_end'],
      placeholder: ['上传监管日期起', '上传监管日期止'],
    },
    {
      type: 'SimpleSelectOfStudent',
      field: 'sid',
    },
    {
      type: 'SimpleSelectOfCoach',
      field: 'cid',
    },
    {
      type: 'Select',
      field: 'carid',
      options: [{ label: '车牌号(全部)', value: '' }, ...optionCarData],
      otherProps: {
        showSearch: true,
        filterOption: false,
        allowClear: true,
        onSearch: async (value: string) => {
          const res = await _getCarList({ licnum: value });
          const carData = _get(res, 'data', []).map((carNum) => {
            return {
              label: carNum.text,
              value: carNum.value,
            };
          });
          setOptionCarData(carData);
        },
      },
    },
    {
      type: 'Select',
      field: 'subjectcode',
      options: [{ value: '', label: '培训部分(全部)' }, ...useOptions('trans_part_type')],
    },
    {
      type: 'Select',
      field: 'reviewStatus',
      options: [{ value: '', label: '计时审核状态(全部)' }, ...useOptions('review_status_type')],
    },
    {
      type: 'Select',
      field: 'checkstatus_jg',
      options: [{ value: '', label: '监管审核状态(全部)' }, ...useOptions('checkstatus_jg_type')],
    },
    {
      type: 'Select',
      field: 'traincode',
      options: [{ value: '', label: '课程类型(全部)' }, ...useOptions('subject_type')],
    },
    {
      type: 'Select',
      field: 'crstate',
      options: [{ value: '', label: '是否有效(全部)' }, ...useOptions('crstate_type')],
    },

    ...(insertWhen(useAuth('student/teachingJournal:iscyzg'), [
      {
        type: 'Select',
        field: 'iscyzg',
        options: [{ value: '', label: '从业资格学时(全部)' }, ...useOptions('iscyzg_type', false, '-1', ['0'])], // '0'代表否(排除了否)，下拉只需展示全部和是
      },
    ]) as any),
    ...(insertWhen(isHidden, [
      {
        type: 'Select',
        field: 'stuFundConfirmStatus',
        options: [{ value: '', label: '资金确认状态(全部)' }, ...useOptions('stu_fund_confirm_status_type')],
      },
    ]) as any),
    ...insertWhen(IsFuJian, [
      {
        type: 'Select',
        field: 'appealStatus',
        options: [{ value: '', label: '申诉状态(全部)' }, ...useOptions('classrecord_appeal_status')],
      },
    ]),

    {
      type: 'Select',
      field: 'isshare',
      options: [{ value: '', label: '配比学时(全部)' }, ...useOptions('ratio_is_share')],
    },
  ];
  return (
    <>
      {visible && <UploadArr signstarttime_start={_get(search, 'signstarttime_start')} onCancel={_switchVisible} />}
      {verifyArrVisible && <VerifyArr onCancel={_verifyArrSwitchVisible} />}
      <Search
        loading={isLoading}
        filters={filter}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (moment(_get(search, 'signstarttime_start')).year() !== moment(_get(search, 'signstarttime_end')).year()) {
            message.error('签到日期不能跨年');
          } else {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }
        }}
        simpleStudentRequest={_getStudentList}
        simpleCoachRequest={_getCoachList}
        showSearchButton={false}
        ref={searchRef}
      />
      <ButtonContainer
        showSearchButton={true}
        showOpenBtn
        searchRef={searchRef}
        renderTable={forceRender}
        refreshTable={() => {
          if (moment(_get(search, 'signstarttime_start')).year() !== moment(_get(search, 'signstarttime_end')).year()) {
            message.error('签到日期不能跨年');
          } else {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }
        }}
        loading={isLoading}
        update={[IsFuJian, isHidden, filter.length]}
      >
        <AuthButton authId="student/teachingJournal:btn5" type="primary" className="mb20" onClick={_switchVisible}>
          批量上传
        </AuthButton>

        <AuthButton
          authId="student/teachingJournal:btn8"
          type="primary"
          className="ml20 mb20"
          onClick={_verifyArrSwitchVisible}
        >
          批量学时初审
        </AuthButton>

        <RowSetting columns={columns} show={true} pageType="teaching_journal" />
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
      </ButtonContainer>
      <TeachingJournalTable
        radioOpen={true}
        query={query}
        setColumns={setColumns}
        ignore={ignore}
        isHidden={isHidden}
        forceUpdate={forceUpdate}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        setIsLoading={setIsLoading}
        IsFuJian={IsFuJian}
        tableHeight={tableHeight}
        renderKey={renderTable}
        pageType="teaching_journal"
        setSelectedRow={setSelectedRows}
      />
    </>
  );
}

export default TeachingJournal;
