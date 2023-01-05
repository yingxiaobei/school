// 教练投诉管理

import { useSearch, useTablePagination, useFetch, useForceUpdate, useVisible } from 'hooks';
import { _getCoachComplaintsList, _getSchoolComplaintList } from './_api';
import Add from './Add';
import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';
import { _get, _handleIdCard } from 'utils';

interface IProps {
  isTrainingInstitution?: boolean;
}

export default function CoachComplaints(props: IProps) {
  const { isTrainingInstitution = false } = props;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();
  const columns = [
    {
      title: '投诉人',
      dataIndex: 'name',
    },
    {
      title: '身份证号',
      dataIndex: 'idcard',
      hide: isTrainingInstitution,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '车牌号',
      dataIndex: 'licnum',
      hide: isTrainingInstitution,
    },
    {
      title: '准驾证号',
      dataIndex: 'occupationno',
      hide: isTrainingInstitution,
    },
    {
      title: '投诉对象',
      dataIndex: 'coachname',
      hide: isTrainingInstitution,
    },
    {
      title: '投诉对象类型',
      dataIndex: 'type',
      render: (type: any) => {
        return Number(type) === 1 ? '教练员' : '培训机构';
      },
    },

    {
      title: '投诉日期',
      dataIndex: 'evaluatedate',
    },
    {
      title: '投诉内容',
      dataIndex: 'content',
    },
    {
      title: '部门意见',
      dataIndex: 'depaopinion',
    },
    {
      title: '驾校意见',
      dataIndex: 'schopinion',
    },
  ];
  const lastColumns: any = columns.filter((index: any) => {
    return index.hide !== true;
  });
  const coachFilters: any = isTrainingInstitution //培训机构页面没有如下几个过滤项
    ? []
    : [
        { type: 'Input', field: 'occupationno', placeholder: '准教证号' },
        { type: 'Input', field: 'licnum', placeholder: '车牌号码' },
        { type: 'Input', field: 'coachname', placeholder: '教练姓名' },
        { type: 'Input', field: 'idcard', placeholder: '证件号码' },
      ];

  const { isLoading, data } = useFetch<any>({
    request: isTrainingInstitution ? _getSchoolComplaintList : _getCoachComplaintsList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      licnum: _get(search, 'licnum'),
      occupationno: _get(search, 'occupationno'),
      evaluatetimeStart: _get(search, 'evaluatetimeStart'),
      evaluatetimeEnd: _get(search, 'evaluatetimeEnd'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }
  let authId = isTrainingInstitution
    ? 'trainingInstitution/trainingInstitutionComplaints:btn1'
    : 'coach/coachComplaints:btn1';

  return (
    <>
      {visible && <Add onCancel={_switchVisible} onOk={_handleOk} isTrainingInstitution={isTrainingInstitution} />}
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['evaluatetimeStart', 'evaluatetimeEnd'],
            placeholder: ['投诉时间(起)', '投诉时间(止)'],
          },
          ...coachFilters,
        ]}
        search={search}
        _handleSearch={_handleSearch}
        showSearchButton={false}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />
      <ButtonContainer
        loading={isLoading}
        showSearchButton={true}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      >
        <AuthButton
          authId={authId}
          type="primary"
          className="mr20 mb20"
          onClick={() => {
            _switchVisible();
          }}
        >
          新增
        </AuthButton>
      </ButtonContainer>

      <CustomTable
        columns={lastColumns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'id')}
        pagination={tablePagination}
      />
    </>
  );
}
