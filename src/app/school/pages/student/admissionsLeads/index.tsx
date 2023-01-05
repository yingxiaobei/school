// import { useState } from 'react';
import { useTablePro } from 'hooks';
import { message } from 'antd';
import { Search, AuthButton, CustomTable, ButtonContainer } from 'components';
import { _getAdmissions, _export, _beforeExport } from './_api';
import type { Admissions } from './_api';
import type { ColumnsType } from 'antd/es/table/interface';
import { downloadFile, _get } from 'utils';

function AdmissionsLeads() {
  // TODO: 目前不需要复选的操作
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // const [selectedAdmissions, SetSelectedAdmissions] = useState<Admissions[]>([]);

  const { tableProps, search, _handleSearch, _refreshTable } = useTablePro({
    request: _getAdmissions,
  });

  const exportExcel = async () => {
    try {
      const beforeRes = await _beforeExport({ ...search, isExport: 1 });
      if (_get(beforeRes, 'code') === 200) {
        const res = await _export({ ...search, isExport: 1 });
        downloadFile(res, '招生线索', 'application/xlsx', 'xlsx');
      } else {
        message.error(_get(beforeRes, 'message'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: ColumnsType<Admissions> = [
    {
      title: '线索手机号',
      dataIndex: 'phone',
    },
    {
      title: '线索日期',
      dataIndex: 'createDate',
    },
    {
      title: '推荐人',
      dataIndex: 'referrer',
    },
    {
      title: '推荐人手机号',
      dataIndex: 'referrerPhone',
    },
  ];

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (selectedRowKeys: React.Key[], selectedRows: Admissions[]) => {
  //     SetSelectedAdmissions(selectedRows);
  //     setSelectedRowKeys(selectedRowKeys);
  //   },
  //   getCheckboxProps: (record: any) => ({
  //     // 是否可选的条件
  //     disabled: record.train_price_online === 0, // Column configuration not to be checked
  //   }),
  // };

  return (
    <>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Input',
            field: 'phone',
            placeholder: '线索手机号',
          },
          {
            type: 'Input',
            field: 'referrer',
            placeholder: '推荐人',
          },
          {
            type: 'RangePicker',
            field: ['startTime', 'endTime'],
            placeholder: ['意向绑定开始时间', '意向绑定结束时间'],
            otherProps: {
              allowClear: true,
              // defaultValue: [moment(_get(search, 'startDate')), moment(_get(search, 'endDate'))],
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        {/* TODO: 导出权限 */}
        <AuthButton authId="student/admissionsLeads:btn1" type="primary" className="mb20" onClick={exportExcel}>
          导出
        </AuthButton>
      </ButtonContainer>
      <CustomTable
        columns={columns}
        {...tableProps}
        rowKey="id"
        // rowSelection={{
        //   type: 'checkbox',
        //   ...rowSelection,
        // }}
      />
    </>
  );
}

export default AdmissionsLeads;
