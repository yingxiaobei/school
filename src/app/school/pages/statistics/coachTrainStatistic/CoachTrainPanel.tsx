import { useState } from 'react';
import { Button } from 'antd';
import { _get, _handleIdCard, _handlePhone } from 'utils';
import { _getInfo } from './_api';
import { useHash, useTablePro, useVisible } from 'hooks';
import { CustomTable, Search } from 'components';
import CoachClassRecord from './CoachClassRecord';
import { _getCoachList } from 'api';

interface IProps {
  statisticType: number;
}

function CoachTrainPanel(props: IProps) {
  const { statisticType } = props;
  const genderHash = useHash('gender_type');

  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getInfo,
    extraParams:
      typeof statisticType === 'number'
        ? {
            statisticType,
          }
        : {
            startDate: statisticType[0],
            endDate: statisticType[1],
          },
  });
  const [classRecordVisible, setClassRecordVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState(null);
  const columns = [
    { title: '教练员', width: 80, dataIndex: 'cname' },
    { title: '性别', width: 80, dataIndex: 'sex', render: (sex: any) => genderHash[sex] },
    {
      title: '证件号',
      width: 160,
      dataIndex: 'idCardNo',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '联系电话', width: 100, dataIndex: 'phone', render: (value: any, record: any) => _handlePhone(value) },
    { title: '准教车型', width: 80, dataIndex: 'trainCarType' },
    // { title: '科目', dataIndex: 'createtime' },
    { title: '车牌号', width: 80, dataIndex: 'licNum' },
    { title: '带教人数', width: 80, dataIndex: 'statisticStuNum' },
    { title: '科目二', width: 80, dataIndex: 'statisticSubject2StuNum' },
    { title: '科目三', width: 80, dataIndex: 'statisticSubject3StuNum' },
    { title: '总时长', width: 80, dataIndex: 'statisticTimeSum' },
    { title: '总里程', width: 80, dataIndex: 'statisticMileSum' },
    { title: '日均时长', width: 80, dataIndex: 'statisticTimeDay' },
    {
      title: '操作',
      width: 80,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <Button
          // authId="pushManagement/studentPushRecord:btn1"
          // loading={_get(currentRecord, 'sid') === _get(record, 'sid') && pushLoading}
          onClick={() => {
            setCurrentRecord(record);
            setClassRecordVisible();
          }}
          className="operation-button"
          type="primary"
          ghost
          size="small"
        >
          明细
        </Button>
      ),
    },
  ];

  return (
    <>
      {classRecordVisible && <CoachClassRecord onCancel={setClassRecordVisible} currentRecord={currentRecord} />}
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'SimpleSelectOfCoach',
            field: 'cid',
          },
          { type: 'Input', field: 'phone', placeholder: '联系电话' },
          {
            type: 'Select',
            field: 'subjectCode',
            options: [
              { label: '科目(全部)', value: '' },
              { label: '科目二', value: '2' }, // 此处仅需要科二科三，与乙元商量，前端写死，不走数据字典。
              { label: '科目三', value: '3' },
            ],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleCoachRequest={_getCoachList}
      />

      {_get(tableProps, 'dataSource.length', 0) > 0 && (
        <div style={{ marginBottom: 10, fontSize: 16 }}>
          {'日期区间：' +
            _get(tableProps, 'dataSource.0.statisticStartTime', '') +
            ' - ' +
            _get(tableProps, 'dataSource.0.statisticEndTime', '')}
        </div>
      )}

      <CustomTable {...tableProps} columns={columns} rowKey="cid" scroll={{ y: document.body.clientHeight - 400 }} />
    </>
  );
}

export default CoachTrainPanel;
