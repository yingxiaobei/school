// 结业考核管理
import { useContext } from 'react';
import { _getFinalAssess, _getSchoolSubjectExamCombo } from './_api';
import { _getStudentList } from 'api';

import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';
import AddOrEdit from './AddOrEdit';
import { useHash, useTablePro, useFetch } from 'hooks';
import { message } from 'antd';
import { _get, _handleIdCard } from 'utils';
import GlobalContext from 'globalContext';

function FinalAssessment() {
  const examResultHash = useHash('appraisalresult_type'); // 考核结果
  const { $elementAuthTable } = useContext(GlobalContext);

  // 考核科目下拉数据
  const { data: schoolSubject = [] } = useFetch({
    request: _getSchoolSubjectExamCombo,
  });
  const schoolSubjectOptions = schoolSubject.map((item: any) => {
    return { label: item.text, value: item.value };
  });

  // 考核科目（报审科目）HASH
  const subjectCodeHash: any = {};
  schoolSubject.forEach((x: any) => {
    subjectCodeHash[x.value] = x.text;
  });

  const {
    tableProps,
    search,
    isAddOrEditVisible,
    currentId,
    currentRecord,
    isEdit,
    _refreshTable,
    _handleSearch,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({ request: _getFinalAssess });

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'studentname',
      width: 80,
    },
    {
      title: '证件号码',
      dataIndex: 'stuidcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '考核科目',
      dataIndex: 'subjectcode',
      width: 80,
      render: (subjectcode: any) => subjectCodeHash[subjectcode],
    },
    {
      title: '考核员',
      width: 80,
      dataIndex: 'appraisername',
    },
    {
      title: '考核时间',
      width: 80,
      dataIndex: 'appraisaltime',
    },
    {
      title: '考核结果',
      width: 80,
      dataIndex: 'appraisalresult',
      render: (appraisalresult: any) => examResultHash[appraisalresult],
    },
    {
      title: '考核成绩',
      width: 80,
      dataIndex: 'achievement',
    },
    {
      title: '操作人',
      width: 80,
      dataIndex: 'operatorname',
    },
    {
      title: '操作时间',
      width: 140,
      dataIndex: 'update_time',
    },
    {
      title: '操作',
      width: 100,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="student/finalAssessment:btn2"
            onClick={() => {
              // 当考试科目subjectcode：5是从业资格，且没有配置相关权限，不展示弹框
              if (_get(record, 'subjectcode') === '5' && !$elementAuthTable['student/finalAssessment:btn3']) {
                message.error('没有权限,请联系管理员');
                return;
              }
              _handleEdit(record, _get(record, 'id', ''));
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentId={currentId as string}
          currentRecord={currentRecord}
          isEdit={isEdit}
          title={'结业考核信息'}
          isVisibleWorkTab={$elementAuthTable['student/finalAssessment:btn3']}
        />
      )}
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'SimpleSelectOfStudent',
            field: 'stuid',
          },
          { type: 'Input', field: 'appraisername', placeholder: '考核员姓名' },
          {
            type: 'Select',
            field: 'subjectcode',
            options: [{ label: '考核科目(全部)', value: '' }, ...schoolSubjectOptions],
          },
          {
            type: 'RangePicker',
            field: ['sdate', 'edate'],
            placeholder: ['考核开始日期', '考核结束日期'],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <AuthButton
          authId="student/finalAssessment:btn1"
          type="primary"
          onClick={() => {
            _handleAdd();
          }}
          className="mb20"
        >
          新增
        </AuthButton>
      </ButtonContainer>
      <CustomTable {...tableProps} columns={columns} rowKey="id" />
    </>
  );
}

export default FinalAssessment;
