// 培训项目查询
import { useState } from 'react';
import { _getList } from './_api';
import { Popover, Spin, Tooltip } from 'antd';

import { CustomTable, Search } from 'components';
import { useTablePro, useOptions, useVisible, useHash, useFetch, useInfo } from 'hooks';
import StudentDetails from '../../student/studentInfo/StudentInfoDetail';
import RowSetting from 'components/RowSetting';
import { useIsOpenExamInfo } from '../../student/studentInfo/hooks/useIsOpenExamInfo';
import { _getChangeSchoolAuditSwitch, _getStudentTrain } from '../../student/studentInfo/_api';
import { Auth, _get, _handleIdCard } from 'utils';
import { _getSyncInfoForJGReportAuditRecords } from '../../student/phasedReview/_api';
import { useShowDistanceEduBtn } from '../../student/studentInfo/hooks';
import { _addMessage } from '../../financial/wallet/_api';
import { ClassTime, scoreRender, getOutlineData, STATUS_ARR, ColorDescription } from './ClassTime';

export default function TrainProject() {
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [sid, setSid] = useState('');
  const [_showInfo] = useInfo();
  const { tableProps, search, _refreshTable, _handleSearch, currentRecord, setCurrentRecord } = useTablePro({
    request: _getList,
    initialSearch: {
      status: '01',
    },
  });
  const [loading, setLoading] = useState(false);
  const [hoverData, setHoverData] = useState() as any;

  // 查询转校审核开关 "1":开 "0":关
  const { data: schoolAudit } = useFetch({
    request: _getChangeSchoolAuditSwitch,
  });

  // 学员状态 查询转校审核开关 "1":开 使用stu_drivetrain_status 枚举字段 "0":关 使用stu_drivetrain_status_old枚举字段
  const stuDrivetrainStatusOptions = useOptions('stu_drivetrain_status');
  const stuDrivetrainStatusOldOptions = useOptions('stu_drivetrain_status_old');
  const studentStatusOptions = schoolAudit === '1' ? stuDrivetrainStatusOptions : stuDrivetrainStatusOldOptions;
  const isOpenExamInfo = useIsOpenExamInfo(); // 是否开放考试成绩;

  const genderHash = useHash('gender_type'); // 性别
  const businessTypeHash = useHash('businessType'); // 业务类型
  const studentStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const isShowDistanceEducationBtn = useShowDistanceEduBtn(); // 驾训信息-远程教育按钮

  const tagShape: any = (status: any, record: any, subject: string) => {
    if (STATUS_ARR.includes(status)) {
      return <ColorDescription status={status} />;
    }
    // 需要参加从业资格课程   0-不需要  ； 1-需要
    const isPractice = _get(record, 'certproclass') == 1;
    const disableClick = status === '5'; // 暂未配置大纲不可点击查看大纲

    return (
      <Popover
        content={<div>{loading ? <Spin size="small" /> : <div>{hoverData}</div>}</div>}
        trigger={disableClick ? '' : 'click'}
      >
        <span
          className={disableClick ? ' flex-box' : 'pointer flex-box'}
          style={{ minHeight: 20 }}
          onClick={async () => {
            if (disableClick) {
              return;
            }
            setLoading(true);
            const res = await _getStudentTrain({ sid: record.sid });
            const subjectData = _get(res, 'data.stuStagetrainningTimeVOList', []);
            setHoverData(getOutlineData(subject, subjectData, isPractice));
            setLoading(false);
          }}
        >
          <ClassTime record={record} subject={subject} />
        </span>
      </Popover>
    );
  };

  const columns = [
    {
      title: '报名日期',
      fixed: 'left',
      width: 80,
      disableCheckbox: true,
      dataIndex: 'applyDate',
    },
    {
      title: '姓名',
      fixed: 'left',
      width: 80,
      disableCheckbox: true,
      dataIndex: 'name',
      render: (name: any, record: any) => {
        return (
          <Tooltip title={name}>
            <span
              style={{ color: '#F3302B', cursor: 'pointer' }}
              onClick={() => {
                setSid(_get(record, 'sid'));
                setCurrentRecord({ name: _get(record, 'name'), idcard: _get(record, 'idcard') });
                _switchDetailsVisible();
              }}
            >
              {name}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '证件号',
      fixed: 'left',
      disableCheckbox: true,
      width: 140,
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '性别',
      width: 40,
      dataIndex: 'sex',
      render(sex: string) {
        return genderHash[sex];
      },
    },
    {
      title: '学员状态',
      dataIndex: 'status',
      width: 70,
      render(busitype: string) {
        return studentStatusHash[busitype];
      },
    },
    {
      title: '业务类型',
      dataIndex: 'busitype',
      width: 70,
      render(busitype: string) {
        return <Tooltip title={businessTypeHash[busitype]}>{businessTypeHash[busitype]}</Tooltip>;
      },
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
      width: 60,
    },
    {
      title: '学车教练',
      dataIndex: 'coachName',
      width: 70,
    },
    {
      title: '第一部分',
      dataIndex: 'firstPartStatus',
      width: 110,
      render: (firstPartStatus: string, record: any) => {
        return tagShape(firstPartStatus, record, '1');
      },
    },
    {
      title: '科一成绩',
      dataIndex: 'firstPartScore',
      width: 80,
      render: (score: any, record: any) => {
        return scoreRender(score, record, isOpenExamInfo, '1');
      },
    },
    {
      title: '第二部分',
      dataIndex: 'secondPartStatus',
      width: 110,
      render: (secondPartStatus: string, record: any) => {
        return tagShape(secondPartStatus, record, '2');
      },
    },
    {
      title: '科二成绩',
      dataIndex: 'secondPartScore',
      width: 80,
      render: (score: any, record: any) => {
        return scoreRender(score, record, isOpenExamInfo, '2');
      },
    },
    {
      title: '第三部分',
      dataIndex: 'thirdPartStatus',
      width: 110,
      render: (thirdPartStatus: string, record: any) => {
        return tagShape(thirdPartStatus, record, '3');
      },
    },
    {
      title: '科三成绩',
      dataIndex: 'thirdPartScore',
      width: 80,
      render: (score: any, record: any) => {
        return scoreRender(score, record, isOpenExamInfo, '3');
      },
    },
    {
      title: '第四部分',
      width: 110,
      dataIndex: 'fourthPartStatus',
      render: (fourthPartStatus: string, record: any) => {
        return tagShape(fourthPartStatus, record, '4');
      },
    },
    {
      title: '科四成绩',
      dataIndex: 'fourthPartScore',
      width: 80,
      render: (score: any, record: any) => {
        return scoreRender(score, record, isOpenExamInfo, '4');
      },
    },
  ];

  return (
    <>
      {detailsVisible && (
        <StudentDetails
          onCancel={_switchDetailsVisible}
          currentRecord={currentRecord}
          sid={sid}
          isTrainProject={false}
          showBtn={isShowDistanceEducationBtn}
        />
      )}

      <Search
        loading={tableProps.loading}
        filters={[
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          { type: 'Input', field: 'coachName', placeholder: '教练姓名' },
          {
            type: 'Select',
            field: 'status',
            placeholder: '学员状态',
            options: [{ label: '学员状态(全部)', value: '' }, ...studentStatusOptions],
          },
          {
            type: 'Select',
            field: 'traintype',
            options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('business_scope')],
          },
          {
            type: 'Select',
            field: 'busitype',
            placeholder: '业务类型',
            options: [{ label: '业务类型(全部)', value: '' }, ...useOptions('businessType')],
          },
          {
            type: 'RangePicker',
            field: ['applyDateBegin', 'applyDateEnd'],
            placeholder: ['报名日期(起)', '报名日期(止)'],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />
      <div className="flex align-center mb10">
        <span>颜色说明：</span>
        <span className="mr10">{<ColorDescription status="2" />}</span>
        <span className="mr10">{<ColorDescription status="1" />}</span>
        <span className="mr10">{<ColorDescription status="3" />}</span>
        <span>{<ColorDescription status="0" />}</span>
        <div className="flex1"></div>
        <RowSetting columns={columns} pageType="train_item_info" />
      </div>
      <CustomTable
        {...tableProps}
        columns={columns}
        rowKey="sid"
        pageType="train_item_info"
        scroll={{ x: 1600, y: document?.body?.clientHeight - 420 }}
      />
    </>
  );
}
