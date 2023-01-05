// 学员推送记录

import { useEffect, useState } from 'react';
import { message } from 'antd';
import { _getInfo, _sendSync } from './_api';
import { _getStudentList } from 'api';
import { useTablePro, useOptions, useHash, useRequest } from 'hooks';
import { AuthButton, CustomTable, Search } from 'components';
import { generateIdForDataSource, _get, _handleIdCard } from 'utils';

export default function StudentPushRecord(props: any) {
  const {
    customSchoolId = '',
    detailAuthId = 'pushManagement/studentPushRecord:btn1',
    type = 'studentPush',
    menuId = 'pushManagement/studentPushRecord',
  } = props;
  const sendFlagHash = useHash('student_send_status');
  const [currentRecord, setCurrentRecord] = useState(null);
  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getInfo,
    extraParams: { customSchoolId },
    dataSourceFormatter: (dataSource: any[]) => generateIdForDataSource(dataSource),
  });

  useEffect(() => {
    _refreshTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customSchoolId]);

  const { loading: pushLoading, run } = useRequest(_sendSync, {
    onSuccess: _refreshTable,
    onFail: _refreshTable,
  });

  const columns = [
    { title: '学员姓名', dataIndex: 'name', width: 80 },
    {
      title: '证件号',
      width: 160,
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '推送状态', dataIndex: 'sendflag', width: 120, render: (sendflag: any) => sendFlagHash[sendflag] },
    { title: '推送描述', dataIndex: 'sendmemo', width: 120, hide: type === 'studentPushSearch' },
    { title: '推送时间', dataIndex: 'createtime', width: 140 },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 140,
      render: (_: void, record: any) => (
        <AuthButton
          authId={detailAuthId}
          loading={_get(currentRecord, 'sid') === _get(record, 'sid') && pushLoading}
          onClick={async () => {
            setCurrentRecord(record);
            run({ id: _get(record, 'sid') }, { customSchoolId, menuId, elementId: detailAuthId });
          }}
          className="operation-button"
          type="primary"
          ghost
          size="small"
        >
          推送
        </AuthButton>
      ),
    },
  ];

  const lastColumns: any = columns.filter((index: any) => {
    return index.hide !== true;
  });

  return (
    <div style={{ flex: 1 }}>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'sendflag',
            options: [{ label: '推送状态(全部)', value: '' }, ...useOptions('student_send_status')], // 推送状态
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (type === 'studentPushSearch' && !customSchoolId) {
            return message.info('请先选择培训机构');
          }
          _refreshTable();
        }}
        simpleStudentRequest={_getStudentList}
      />
      <CustomTable {...tableProps} columns={lastColumns} rowKey="id" />
    </div>
  );
}
