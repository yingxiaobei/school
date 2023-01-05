import { CustomTable, Search } from 'components';
import { useHash, useTablePro, useOptions } from 'hooks';
import { _getStudentList } from 'api';
import { _getNetWorkPhaseTestList } from './_api';
import Details from 'app/school/pages/student/studentInfo/StudentInfoDetail';
import { _get, _handleIdCard } from 'utils';
import { Tooltip } from 'antd';
import { FiltersType } from 'components/Search';

export default function NetworkPhaseTesting() {
  // 考核结果
  const appraisalResultHash = useHash('appraisalresult_type');
  // 课程类型
  const theoryCourseHash = useHash('theory_course_type');
  // 车型
  const businessHash = useHash('trans_car_type');
  // 考核科目
  const transPartHash = useHash('trans_part_type');

  const {
    tableProps,
    search,
    _refreshTable,
    _handleSearch,
    currentRecord,
    setCurrentRecord,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
  } = useTablePro({ request: _getNetWorkPhaseTestList });

  // TODO: 补充columns
  const columns = [
    {
      title: '学员姓名',
      width: 100,
      dataIndex: 'studentname',
      render: (studentname: any, record: any) => {
        return (
          <span
            className="color-primary pointer"
            onClick={() => {
              _switchIsAddOrEditVisible();
              setCurrentRecord(record);
            }}
          >
            {studentname}
          </span>
        );
      },
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '培训车型',
      width: 120,
      dataIndex: 'transCarType',
      render: (transCarType: any) => businessHash[transCarType],
    },
    {
      title: '测试科目',
      width: 100,
      dataIndex: 'subjectcode',
      render: (subjectcode: any) => transPartHash[subjectcode],
    },
    {
      title: '课程类型',
      dataIndex: 'courseType',
      width: 100,
      render: (courseType: any) => {
        return <Tooltip title={theoryCourseHash[courseType]}>{theoryCourseHash[courseType]}</Tooltip>;
      },
    },
    {
      title: '测试时间',
      width: 120,
      dataIndex: 'createTime',
    },
    {
      title: '测试结果',
      width: 80,
      dataIndex: 'appraisalresult',
      render: (appraisalresult: any) => appraisalResultHash[appraisalresult],
    },
    {
      title: '测试成绩',
      width: 70,
      dataIndex: 'achievement',
    },
  ];

  const filter: FiltersType = [
    {
      type: 'SimpleSelectOfStudent',
      field: 'stuid',
    },
    {
      type: 'Select',
      field: 'transCarType',
      options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('trans_car_type')],
    },
    {
      type: 'Select',
      field: 'transPartType',
      options: [{ label: '考核科目(全部)', value: '' }, ...useOptions('trans_part_type')],
    },
    {
      type: 'Select',
      field: 'appraisalresult',
      options: [{ label: '测试结果(全部)', value: '' }, ...useOptions('appraisalresult_type')],
    },
    {
      type: 'RangePicker',
      field: ['startTime', 'endTime'],
      placeholder: ['考核开始日期', '考核结束日期'],
    },
  ];

  return (
    <>
      {isAddOrEditVisible && (
        <Details
          onCancel={_switchIsAddOrEditVisible}
          currentRecord={currentRecord}
          sid={_get(currentRecord, 'stuid', '')}
        />
      )}
      <Search
        loading={tableProps.loading}
        filters={filter}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
      />
      <CustomTable {...tableProps} columns={columns} rowKey={'id'} />
    </>
  );
}
