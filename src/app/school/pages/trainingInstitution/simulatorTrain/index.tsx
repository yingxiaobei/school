// 模拟器培训
import { useState, useRef } from 'react';
import { message } from 'antd';
import { _get, downloadFile, _handleIdCard, _handlePhone } from 'utils';
import { useConfirm, useTablePro } from 'hooks';
import { AuthButton, Search, ButtonContainer, CustomTable } from 'components';
import { _getStudentList } from 'api';
import moment from 'moment';
import { _export, _exportBefore, _getList } from './_api';

function SimulatorTrain() {
  const [isLoading, setIsLoading] = useState(false);
  const [_showConfirm] = useConfirm();

  const searchRef = useRef<HTMLDivElement>(null);
  const { tableProps, _refreshTable, search, _handleSearch } = useTablePro({
    request: _getList,
  });

  const columns: any = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 200,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    // {
    //   title: '性别',
    //   dataIndex: 'sex',
    //   width: 200,
    // },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 200,
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '所属驾校',
      dataIndex: 'schoolName',
      width: 200,
    },
    {
      title: '模拟器名称',
      dataIndex: 'simulatorname',
      width: 200,
    },
    {
      title: '签到时间',
      dataIndex: 'signstarttime',
      width: 200,
    },
    {
      title: '签退时间',
      dataIndex: 'signendtime',
      width: 200,
    },
  ];
  return (
    <div>
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['signstarttimeBegin', 'signstarttimeEnd'],
            placeholder: ['签到日期起', '签到日期止'],
          },
          { type: 'Input', field: 'schoolName', placeholder: '所属驾校' },
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '学员证件号' },
          { type: 'Input', field: 'simulatorname', placeholder: '模拟器名称' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        showSearchButton={false}
        refreshTable={_refreshTable}
      />

      <ButtonContainer
        refreshTable={_refreshTable}
        showSearchButton={true}
        loading={tableProps.loading}
        searchRef={searchRef}
        openToggle={true}
      >
        <AuthButton
          className="mb10"
          type="primary"
          authId="trainingInstitution/simulatorTrain:export"
          onClick={() => {
            _showConfirm({
              title: `当前申请导出记录数${_get(tableProps.pagination, 'total', 0)}，确定立即导出？`,
              handleOk: async () => {
                const query = {
                  signstarttimeBegin: _get(search, 'signstarttimeBegin', ''),
                  signstarttimeEnd: _get(search, 'signstarttimeEnd', ''),
                  schoolName: _get(search, 'schoolName', ''),
                  name: _get(search, 'name', ''),
                  idcard: _get(search, 'idcard', ''),
                  simulatorname: _get(search, 'simulatorname', ''),
                };
                const res = await _exportBefore(query);
                if (_get(res, 'code') === 200) {
                  if (_get(res, 'data') > 2000) {
                    message.error('导出条数不超过2000条！');
                    return;
                  }
                  _export(query).then((res: any) => {
                    downloadFile(
                      res,
                      `模拟器培训${moment().format('YYYY-MM-DD-HH-mm-ss')}`,
                      'application/vnd.ms-excel',
                      'xlsx',
                    );
                  });
                } else {
                  message.error(_get(res, 'message'));
                }
              },
            });
          }}
        >
          导出
        </AuthButton>
      </ButtonContainer>
      <CustomTable {...tableProps} columns={columns} rowKey={'classid'} />
    </div>
  );
}

export default SimulatorTrain;
