import { Tooltip } from 'antd';
import { useState } from 'react';
import { useHash, useOptions, useTablePro, useVisible } from 'hooks';
import { _getApplicationList } from './_api';
import type { ApplicationItem } from './_api';
import type { ColumnsType } from 'antd/lib/table';

import { AddOrEdit, ApplicationDetail } from './components';
import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';
import { formatTime, _get, _handleIdCard } from 'utils';
import StudentInfoDetail from '../studentInfo/StudentInfoDetail';
import { useIsFrozen, useIsOpenExamInfo, useShowDistanceEduBtn } from '../studentInfo/hooks';
import { _getStudentList } from 'api';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import ApplicationJGReview from './components/ApplicationJGReview';
import JGAddOrEdit from './components/JGAddOrEdit';

export default function Application() {
  const {
    tableProps,
    search,
    isEdit,
    setIsEdit,
    currentId,
    currentRecord,
    setCurrentRecord,
    setCurrentId,
    _handleSearch,
    _refreshTable,
    isAddOrEditVisible,
    _handleEdit,
    _handleAdd,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({
    request: _getApplicationList,
  });

  const [studentDetailVisible, setStudentDetailVisible] = useVisible();
  const [applicationDetailVisible, setApplicationDetailVisible] = useVisible();
  const [isReSubmit, setIsReSubmit] = useState(false);

  const isFrozenStudent = useIsFrozen(_get(currentRecord, 'sid', '')); // 是否是一次性冻结、预约冻结的学员 (注意这个currentId)
  const isShowExamInfo = useIsOpenExamInfo(); // 详情页是否开放考试信息
  const isShowDistanceEducationBtn = useShowDistanceEduBtn(); // 远程教育按钮

  const [applicationJGVisible, setApplicationJGVisible] = useVisible();
  const [applicationJGAddOrEditVisible, setApplicationJGAddOrEditVisible] = useVisible();

  const applyHash = useHash('stu_apply_type');
  const applyHashExtra = useHash('stu_apply_type', false, '10');

  const auditHash = useHash('stu_apply_status');
  const applyTypeHash = [...useOptions('stu_apply_type'), ...useOptions('stu_apply_type', false, '10')].filter(
    (item) => item.value !== '6',
  );

  const handleApplicationDetail = (record: ApplicationItem) => {
    setCurrentRecord(record);
    setCurrentId(_get(record, 'id'));
    setApplicationDetailVisible();
  };

  const handleReSubmit = (record: ApplicationItem) => {
    setIsReSubmit(true);
    setIsEdit(false);
    setCurrentRecord(record);
    setCurrentId(_get(record, 'id'));
    _switchIsAddOrEditVisible();
  };

  const handleCancel = () => {
    setIsReSubmit(false);
    _switchIsAddOrEditVisible();
  };

  const handleOk = () => {
    setIsReSubmit(false);
    _handleOk();
  };

  // 监管申请相关功能
  const handleApplicationDetailJG = (record: ApplicationItem) => {
    setCurrentRecord(record);
    setCurrentId(_get(record, 'id'));
    setApplicationJGVisible();
  };

  const handleCancelJG = () => {
    setIsReSubmit(false);
    setApplicationJGAddOrEditVisible();
  };

  const handleOkJG = () => {
    setIsReSubmit(false);
    setApplicationJGAddOrEditVisible();
    _refreshTable();
  };

  const handleApplicationEditJG = (record: ApplicationItem) => {
    setApplicationJGAddOrEditVisible();
    setCurrentRecord(record);
    setCurrentId(_get(record, 'id'));
    setIsEdit(true);
  };

  const handleApplicationAddJG = () => {
    setApplicationJGAddOrEditVisible();
    setCurrentId(null);
    setCurrentRecord(null);
    setIsEdit(false);
  };

  const handleReSubmitJG = (record: ApplicationItem) => {
    setIsReSubmit(true);
    setIsEdit(false);
    setCurrentRecord(record);
    setCurrentId(_get(record, 'id'));
    setApplicationJGAddOrEditVisible();
  };

  const handleDiffStatusCallback = (record: ApplicationItem, common: () => void, special: () => void) => {
    const type = _get(record, ['applyType'], '');
    switch (type) {
      case '1':
      case '2':
      case '3':
        common();
        break;
      case '4':
      case '5':
        special();
        break;
      default:
        break;
    }
  };

  const columns: ColumnsType<ApplicationItem> = [
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      render: (text: string, record) => {
        return (
          <Tooltip title={text}>
            <div
              style={{
                color: PRIMARY_COLOR,
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onClick={() => {
                setCurrentRecord(record);
                setStudentDetailVisible();
              }}
            >
              {text}
            </div>
          </Tooltip>
        );
      },
      width: 80,
    },
    {
      title: '证件号码',
      dataIndex: 'idCard', // note: 证件号相关的默认全部展示
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '车型',
      dataIndex: 'carType',
      width: 80,
    },
    {
      title: '申请类型',
      dataIndex: 'applyType',
      render(text: string) {
        const hash = { ...applyHash, ...applyHashExtra };
        return hash[text];
      },
      width: 178,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      width: 160,
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      render(text: string) {
        return auditHash[text];
      },
      width: 80,
    },
    {
      title: '审核时间',
      dataIndex: 'auditTime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 100,
    },
    {
      title: '操作',
      width: 160,
      render(_, record) {
        return (
          <>
            <AuthButton
              authId="student/application:btn1"
              onClick={() => {
                handleDiffStatusCallback(
                  record,
                  () => {
                    handleApplicationDetail(record);
                  },
                  () => {
                    handleApplicationDetailJG(record);
                  },
                );
              }}
              className="operation-button"
            >
              详情
            </AuthButton>
            <AuthButton
              insertWhen={_get(record, 'auditStatus') === '0'} // 审核状态状态为待审核的时候显示编辑
              authId="student/application:btn2"
              onClick={() => {
                handleDiffStatusCallback(
                  record,
                  () => {
                    _handleEdit(record, _get(record, 'id', ''));
                  },
                  () => {
                    handleApplicationEditJG(record);
                  },
                );
              }}
              className="operation-button"
            >
              编辑
            </AuthButton>
            <AuthButton
              insertWhen={
                _get(record, 'auditStatus') === '2' ||
                (_get(record, 'auditStatus') === '1' && _get(record, 'applyType') === '1')
              }
              // 审核状态为审核成功或者审核失败
              // 报审通过的情况下，更换班级和提前结清不应该显示 "重新提交"
              authId="student/application:btn3"
              onClick={() => {
                handleDiffStatusCallback(
                  record,
                  () => {
                    handleReSubmit(record);
                  },
                  () => {
                    handleReSubmitJG(record);
                  },
                );
              }}
              className="operation-button"
            >
              重新提交
            </AuthButton>
          </>
        );
      },
    },
  ];
  return (
    <>
      {studentDetailVisible && (
        <StudentInfoDetail
          onCancel={setStudentDetailVisible}
          currentRecord={currentRecord}
          showBtn={isShowDistanceEducationBtn}
          isShowExamInfo={isShowExamInfo}
          isFrozenStudent={isFrozenStudent}
          idcard={_get(currentRecord, 'idcard')}
          sid={_get(currentRecord, 'sid', '')}
          isShowElectronicFile={false}
        />
      )}

      {applicationDetailVisible && <ApplicationDetail currentId={currentId} onCancel={setApplicationDetailVisible} />}

      {isAddOrEditVisible && (
        <AddOrEdit
          currentRecord={currentRecord}
          isEdit={isEdit}
          onOk={handleOk}
          onCancel={handleCancel}
          isReSub={isReSubmit}
        />
      )}

      {applicationJGVisible && <ApplicationJGReview currentId={currentId} onCancel={setApplicationJGVisible} />}

      {applicationJGAddOrEditVisible && (
        <JGAddOrEdit
          currentRecord={currentRecord}
          isEdit={isEdit}
          onOk={handleOkJG}
          onCancel={handleCancelJG}
          isReSub={isReSubmit}
        />
      )}

      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'RangePicker',
            field: ['applyTimeBegin', 'applyTimeEnd'],
            placeholder: ['申请日期开始', '申请日期结束'],
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'applyType',
            options: [{ value: '', label: '申请类型(全部)' }, ...applyTypeHash],
          },
          {
            type: 'Select',
            field: 'auditStatus',
            options: [{ value: '', label: '审核状态(全部)' }, ...useOptions('stu_apply_status')],
          },
        ]}
        search={search}
        simpleStudentRequest={_getStudentList}
        _handleSearch={(name, value) => {
          if (name === 'applyTimeBegin') {
            if (value) {
              _handleSearch(name, formatTime(value, 'BEGIN'));
            } else {
              _handleSearch(name, undefined);
            }
          } else if (name === 'applyTimeEnd') {
            if (value) {
              _handleSearch(name, formatTime(value, 'END'));
            } else {
              _handleSearch(name, undefined);
            }
          } else {
            _handleSearch(name, value);
          }
        }}
        refreshTable={_refreshTable}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <AuthButton authId="student/application:btn4" type="primary" className="mb20 mr20" onClick={_handleAdd}>
          新增申请
        </AuthButton>
        <AuthButton authId="student/application:btn5" className="mr20 mb20" onClick={handleApplicationAddJG}>
          申请监管审核
        </AuthButton>
      </ButtonContainer>

      <CustomTable columns={columns} {...tableProps} rowKey="id" />
    </>
  );
}
