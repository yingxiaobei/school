// 培训明细审核
import { useState } from 'react';
import { Tabs } from 'antd';
import { _get } from 'utils';
import { useFetch, useTablePagination, useSearch, useForceUpdate, useHash } from 'hooks';
import { CustomTable, Search } from 'components';
import { _getStudentSubjectList } from './_api';
import { _getStudentList } from 'api';
import TeachingJournalTable from 'app/school/pages/student/teachingJournal/teachingJournalTable';
import Minutes from 'app/school/pages/student/teachingJournal/Minutes';
import { VehicleTrajectoryMap } from 'components';

function TrainingDetailReview() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectType, setSelectType] = useState('');
  const [vehicletimeSum, setVehicletimeSum] = useState(''); //实车有效学时总和
  const [mileageSum, setMileageSum] = useState(''); //实车有效里程总和
  const [classtimeSum, setClasstimeSum] = useState(''); //课堂有效学时总和
  const [simulatortimeSum, setSimulatortimeSum] = useState(''); //模拟器有效学时总和
  const [networktimeSum, setNetworktimeSum] = useState(''); //远程有效学时总和
  const [sid, setSid] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [selectRecord, setSelectRecord] = useState();
  const [tracks, setTracks] = useState([]);
  const { TabPane } = Tabs;
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '培训科目',
      dataIndex: 'subjectcode',
      render: (subjectcode: any) => subjectcodeHash[subjectcode],
    },
    {
      title: '实车有效学时',
      dataIndex: 'vehicletime_statistic',
    },
    {
      title: '实车有效里程',
      dataIndex: 'mileage_statistic',
    },
    {
      title: '课堂有效学时',
      dataIndex: 'classtime_statistic',
    },
    {
      title: '模拟器有效学时',
      dataIndex: 'simulatortime_statistic',
    },
    {
      title: '远程有效学时',
      dataIndex: 'networktime_statistic',
    },
  ];
  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
      let selectRow = _get(data, 'subjectStatisticList', []).filter((x: any) => selectedRowKeys.includes(x.sttid));
      setSid(_get(selectRow, '0.sid', ''));
      setSubjectCode(_get(selectRow, '0.subjectcode', ''));
    },
    getCheckboxProps: (selectedRowKeys: any) => ({
      disabled: selectedRowKeys.name === '合计', // 配置无法勾选的列
    }),
    selectedRowKeys,
  };
  const { isLoading, data } = useFetch({
    request: _getStudentSubjectList,
    query: {
      stuid: _get(search, 'sid'),
      stunum: _get(search, 'stunum'),
      idcard: _get(search, 'idcard'),
    },
    depends: [ignore],
    callback: (data) => {
      let key = [_get(data, 'subjectStatisticList.0.sttid')];
      setSelectedRowKeys(key);
      let selectRow = _get(data, 'subjectStatisticList', []).filter((x: any) => key.includes(x.sttid));
      setSid(_get(selectRow, '0.sid', ''));
      setSubjectCode(_get(selectRow, '0.subjectcode', ''));
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setVehicletimeSum(_get(data, 'vehicletimeSum', ''));
      setMileageSum(_get(data, 'mileageSum', ''));
      setClasstimeSum(_get(data, 'classtimeSum', ''));
      setSimulatortimeSum(_get(data, 'simulatortimeSum', ''));
      setNetworktimeSum(_get(data, 'networktimeSum', ''));
    },
  });

  return (
    <>
      {
        <Search
          loading={isLoading}
          filters={[
            {
              type: 'SimpleSelectOfStudent',
              field: 'sid',
            },
            // { type: 'Input', field: 'idcard', placeholder: '身份证号' },
            { type: 'Input', field: 'stunum', placeholder: '学员统一编码' },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
          simpleStudentRequest={_getStudentList}
        />
      }
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ width: 600 }}>
          <CustomTable
            style={{ marginBottom: 20, border: '1px solid #f0f0f0' }}
            scroll={{ x: 800, y: 200 }}
            columns={columns}
            loading={isLoading}
            bordered
            rowSelection={{
              type: 'radio',
              ...rowSelection,
            }}
            dataSource={
              _get(data, 'subjectStatisticList.length', 0) > 0
                ? [
                    ..._get(data, 'subjectStatisticList', []),
                    {
                      name: '合计',
                      sttid: Math.random(),
                      vehicletime_statistic: vehicletimeSum,
                      mileage_statistic: mileageSum,
                      classtime_statistic: classtimeSum,
                      simulatortime_statistic: simulatortimeSum,
                      networktime_statistic: networktimeSum,
                    },
                  ]
                : _get(data, 'subjectStatisticList', [])
            }
            rowKey={(record: any) => {
              return _get(record, 'sttid');
            }}
            pagination={false}
          />
          {
            <TeachingJournalTable
              query={{
                page: pagination.current,
                limit: pagination.pageSize,
                stuid: sid,
                subjectcode: subjectCode,
              }}
              isTraningDetail={true}
              withOutQueryTime={true}
              radioOpen={true}
              selectType={selectType}
              ignore={ignore}
              forceUpdate={forceUpdate}
              selectCallback={(selectRec: any) => {
                setSelectRecord(selectRec);
              }}
              trackCallback={(tracks: any) => {
                setTracks(tracks);
              }}
              pagination={pagination}
              setPagination={setPagination}
              tablePagination={tablePagination}
              pageType="training_detail_review"
            />
          }
        </div>
        <div
          style={{
            flex: 1,
            marginLeft: 10,
            padding: 10,
            border: '1px solid #f0f0f0',
            borderRadius: '4px 4px 0 0',
            width: 'calc(100% - 700px)',
          }}
        >
          <Tabs
            defaultActiveKey="1"
            onChange={(active) => {
              if (String(active) === '1') {
                setSelectType('checkbox');
              } else {
                setSelectType('radio');
              }
            }}
          >
            <TabPane tab="车辆轨迹" key="1">
              <div style={{ width: '100%', height: 500 }}>
                {<VehicleTrajectoryMap paths={tracks} zoom={16} mapType="Polyline" />}
              </div>
            </TabPane>
            <TabPane tab="驾训明细信息" key="2">
              <div>
                <Minutes currentRecord={selectRecord} isTrainingDetail={true} />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default TrainingDetailReview;
