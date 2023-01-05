import { Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { CustomTable, Search } from 'components';
import { useFetch, useHash, useOptions, useTablePro, useVisible } from 'hooks';
import { Auth, _get, _handleIdCard, _handlePhone } from 'utils';
import { AuthButton } from 'components';
import Details from '../studentInfo/StudentInfoDetail';
import { _getPageList, _queryOpenedBanks } from './_api';
import {
  isFreezingModeStudent,
  showNetworkTimeButton,
  _getChangeSchoolAuditSwitch,
  _getClassList,
  _getCoachListData,
} from '../studentInfo/_api';
import { useCallback } from 'react';
import ChangeNormalStudentModal from './components/ChangeNormalStudentModal';
import { _getMenuTreeAboutExam } from '_api';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { FiltersType } from 'components/Search';

export default function HistoricalStudentProfile() {
  const [detailsVisible, _switchDetailsVisible] = useVisible(); // 详情弹出框
  const [isFrozenStudent, setIsFrozenStudent] = useState(false); //是否是一次性冻结、预约冻结的学员
  const [showBtn, setShowBtn] = useState(false); //是否显示获取远程教育学时按钮
  const [normalVisible, setNormalVisible] = useState(false);

  const { data: examRes } = useFetch({
    request: _getMenuTreeAboutExam,
    depends: [],
  });

  const setIsOpenExamInfoTab: () => boolean = useCallback(() => {
    if (examRes) {
      return (examRes as any[]).some((exam) => exam.code === 'StuAppointment');
    }
    return false;
  }, [examRes]);

  const { search, _handleSearch, tableProps, _refreshTable, currentRecord, setCurrentRecord } = useTablePro({
    request: _getPageList,
  });

  const { data: banks = [] } = useFetch({
    request: _queryOpenedBanks,
    query: {
      userId: Auth.get('schoolId'),
    },
    depends: [],
  });

  const bankOptions = banks.map((bank: { acctBankName: string; bankAccount: string; bankChannelId: string }) => {
    return {
      label: bank.acctBankName,
      value: bank.bankChannelId,
    };
  });

  const { data } = useFetch({
    request: _getClassList,
    query: {
      page: 1,
      limit: 300,
      isEffective: 1, // 包含已经注销的班级
      isEnabled: 1,
    },
    depends: [currentRecord],
  });

  const classOptions = useMemo(() => {
    return _get(data, 'rows', []).map((item: { packlabel: string; packid: string; train_price_online: number }) => {
      return { label: item.packlabel, value: item.packid, price: item.train_price_online };
    });
  }, [data]);

  // 查询转校审核开关 "1":开"0":关
  const { data: schoolAudit } = useFetch({
    request: _getChangeSchoolAuditSwitch,
  });
  const { pagination } = tableProps;
  const businessTypeHash = useHash('businessType'); // 业务类型
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const recordStatusTypeHash = useHash('stu_record_status_type'); // 学员备案状态
  const registeredNationalFlagHash = useHash('registered_national_flag'); // 统一编码
  const studentTypeHash = useHash('student_type'); // 学员类型
  const genderHash = useHash('gender_type'); // 性别
  // 学员状态 查询转校审核开关 "1":开 使用stu_drivetrain_status 枚举字段 "0":关 使用stu_drivetrain_status_old枚举字段
  const stuDrivetrainStatusOptions = useOptions('stu_drivetrain_status');
  const stuDrivetrainStatusOldOptions = useOptions('stu_drivetrain_status_old');
  const studentStatusOptions = schoolAudit === '1' ? stuDrivetrainStatusOptions : stuDrivetrainStatusOldOptions;

  //是否是一次性冻结、预约冻结的学员
  const getIsFrozenStudent = async (id: any) => {
    const res = await isFreezingModeStudent({ sid: id });
    setIsFrozenStudent(_get(res, 'data', false));
  };

  //是否显示获取远程教育学时按钮
  const showDistanceLearnBtn = async () => {
    const res = await showNetworkTimeButton();
    setShowBtn(_get(res, 'data', false));
  };

  const studentInfoFilter: FiltersType = [
    { type: 'Input', field: 'name', placeholder: '学员姓名' },
    { type: 'Input', field: 'idcard', placeholder: '证件号码' },
    {
      type: 'SimpleSelectOfCoach',
      field: 'cid',
    },
    {
      type: 'Select',
      field: 'registeredFlag',
      options: [{ label: '备案状态(全部)', value: '' }, ...useOptions('stu_record_status_type')],
    },
    {
      type: 'Select',
      field: 'status',
      options: [{ label: '学员状态(全部)', value: '' }, ...studentStatusOptions],
    },
    {
      type: 'Select',
      field: 'traintype',
      options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('business_scope', false, '-1', [])],
    },
    {
      type: 'Select',
      field: 'busitype',
      options: [{ label: '业务类型(全部)', value: '' }, ...useOptions('businessType')],
    },
    {
      type: 'RangePicker',
      field: ['applydatebegin', 'applydateend'],
      placeholder: ['报名日期起', '报名日期止'],
    },
    {
      type: 'Select',
      field: 'studenttype',
      options: [{ label: '学员类型(全部)', value: '' }, ...useOptions('student_type')],
    },
  ];

  const columns = [
    {
      title: '序号',
      render: (_: any, record: any, index: number) =>
        index + 1 + (pagination.current - 1) * (pagination.pageSize || 10),
      fixed: 'left',
      width: 40,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      fixed: 'left',
      width: 100,
    },
    {
      title: '证件号',
      dataIndex: 'idcard',
      fixed: 'left',
      width: 170,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 80,
      render(sex: string) {
        return genderHash[sex];
      },
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 80,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 100,
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '学车教练',
      dataIndex: 'coachname',
      width: 100,
    },
    {
      title: '入学天数',
      width: 80,
      dataIndex: 'enterdays',
    },
    {
      title: '业务类型',
      width: 80,
      dataIndex: 'busitype',
      render: (busitype: any) => businessTypeHash[busitype],
    },
    {
      title: '培训车型',
      width: 80,
      dataIndex: 'traintype',
    },
    {
      title: '报名日期',
      width: 100,
      dataIndex: 'applydate',
    },
    {
      title: '学员状态',
      width: 100,
      dataIndex: 'status',
      render: (status: any) => stuStatusHash[status],
    },
    {
      title: '学员类型',
      width: 100,
      dataIndex: 'studenttype',
      render: (studenttype: string) => studentTypeHash[studenttype],
    },
    {
      title: '备案状态',
      width: 100,
      dataIndex: 'registeredFlag',
      render: (registeredFlag: string, record: any) => {
        if (registeredFlag === '2') {
          return (
            // TODO: 11-10 备案失败效果
            <Tooltip title={record['message']}>
              <span style={{ color: PRIMARY_COLOR }}>{recordStatusTypeHash[registeredFlag]}</span>
            </Tooltip>
          );
        }
        return recordStatusTypeHash[registeredFlag];
      },
    },
    {
      title: '统一编码',
      width: 100,
      dataIndex: 'registeredNationalFlag',
      render: (registered_NationalFlag: string) => registeredNationalFlagHash[registered_NationalFlag],
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 160,
      render: (_: void, record: any) => {
        return (
          // 00：'报名',01：'学驾中',02：'退学',03：'结业',04：'注销',
          <>
            <AuthButton
              authId={'student/historicalStudentProfile:btn1'}
              onClick={() => {
                getIsFrozenStudent(_get(record, 'sid', ''));
                showDistanceLearnBtn();
                _switchDetailsVisible();
                setCurrentRecord(record);
              }}
              className="operation-button"
            >
              详情
            </AuthButton>
            <AuthButton
              authId={'student/historicalStudentProfile:btn2'}
              onClick={() => {
                setCurrentRecord(record);
                setNormalVisible(true);
              }}
              className="operation-button"
            >
              转正常学员
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <>
      {normalVisible && (
        <ChangeNormalStudentModal
          classOptions={classOptions}
          bankOptions={bankOptions}
          // visible={normalVisible}
          setVisible={setNormalVisible}
          sid={_get(currentRecord, 'sid')}
          currentRecord={currentRecord}
          refreshTable={_refreshTable}
          cid={_get(currentRecord, 'cid')}
        />
      )}
      <Search
        loading={tableProps.loading}
        filters={studentInfoFilter}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          _refreshTable();
        }}
        simpleCoachRequest={_getCoachListData}
      />
      {detailsVisible && (
        <Details
          onCancel={_switchDetailsVisible}
          sid={_get(currentRecord, 'sid')}
          idcard={_get(currentRecord, 'idcard')}
          isFrozenStudent={isFrozenStudent}
          showBtn={showBtn}
          currentRecord={currentRecord}
          customSchoolId={''}
          type={'history'}
          isShowExamInfo={setIsOpenExamInfoTab()}
        />
      )}

      <CustomTable
        columns={columns}
        {...tableProps}
        rowKey="sid"
        scroll={{ x: '1600', y: document.body?.clientHeight - 330 }}
        sort
      />
    </>
  );
}
