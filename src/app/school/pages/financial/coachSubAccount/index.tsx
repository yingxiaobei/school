//教练分账
import { useTablePro, useOptions, useFetch, useHash, useVisible, useRequest } from 'hooks';
import { useState } from 'react';
import { ButtonContainer, CustomTable, Search, AuthButton } from 'components';
import { _getStudentList, _getCoachList } from 'api';
import { _getList, _getOpenAccount, _getManualSubAccount } from './_api';
import SplitAccount from '../splitAccount';
import { message, Modal } from 'antd';
import { _get, formatTime, _handleIdCard } from 'utils';
import moment from 'moment';

const CoachSubAccount = () => {
  const [walletData, setWalletData] = useState([]);
  const statusHash = useHash('split_ratio_status_type');
  const [stuFreeVisible, setStuFreeVisible] = useVisible();
  const { search, _handleSearch, tableProps, _refreshTable } = useTablePro({
    request: _getList,
    searchFormat: {
      startDate: { fun: formatTime, param: 'BEGIN' },
      endDate: { fun: formatTime, param: 'END' },
      startSuccessDate: { fun: formatTime, param: 'BEGIN' },
      endSuccessDate: { fun: formatTime, param: 'END' },
    },
    initialSearch: {
      startDate: formatTime(moment().subtract(30, 'day'), 'BEGIN'),
      endDate: formatTime(moment(), 'END'),
    },
    cb: (data: any) => {
      console.log(data);
    },
  });

  useFetch({
    request: _getOpenAccount,
    callback(data: any) {
      setWalletData(
        data.map((x: any) => {
          return { label: x.bankName, value: x.bankchannelid };
        }),
      );
    },
  });

  const { run } = useRequest(_getManualSubAccount, {
    onSuccess: _refreshTable,
    onFail: (res) => message.error(res),
  });

  const columns = [
    {
      title: '结算编号',
      width: 200,
      dataIndex: 'settleAccountId',
    },
    {
      title: '创建日期',
      width: 160,
      dataIndex: 'createdTime',
    },
    {
      title: '完成日期',
      width: 160,
      dataIndex: 'successTime',
    },
    {
      title: '学员名字',
      width: 80,
      dataIndex: 'userName',
    },
    {
      title: '学员证件号',
      dataIndex: 'userAcctId',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '结算金额',
      width: 80,
      dataIndex: 'settleAmount',
      render: (data: any) => (data || data === 0 ? Number(data).toFixed(2) : ''),
    },
    {
      title: '结算钱包',
      width: 120,
      dataIndex: 'payFactoryName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (data: any) => statusHash[data],
    },
    {
      title: '教练姓名',
      width: 80,
      dataIndex: 'shopName',
    },
    {
      title: '教练身份证',
      width: 160,
      dataIndex: 'shopAcctId',
    },
    {
      title: '教练分账比率',
      width: 100,
      render: (record: any) => {
        let date: Number = Number(_get(record, 'awaitAmount', 0) || 0) / Number(_get(record, 'settleAmount', 1) || 1);
        return date > 0 && date < 1 ? date.toFixed(2) : 0;
      },
    },
    {
      title: '教练分账金额',
      width: 100,
      dataIndex: 'awaitAmount',
      render: (data: any) => (data || data === 0 ? Number(data).toFixed(2) : ''),
    },
    {
      title: '驾校分账金额',
      width: 100,
      render: (record: any) => {
        let data = Number(_get(record, 'settleAmount', 0) || 0) - Number(_get(record, 'awaitAmount', 0) || 0);
        return data > 0 ? data.toFixed(2) : 0;
      },
    },
    {
      title: '备注',
      width: 120,
      dataIndex: 'failReason',
    },
    {
      title: '操作',
      dataIndex: '',
      width: 100,
      render: (_: void, record: any) => {
        return (
          <>
            <AuthButton
              className="operation-button"
              authId="financial/splitAccount:btn1"
              insertWhen={statusHash[record?.status] !== '已成功'}
              onClick={() => {
                run({ payFlowId: record?.settleAccountId });
              }}
            >
              立即分账
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'RangePicker',
            field: ['startDate', 'endDate'],
            placeholder: ['创建日期起', '创建日期止'],
            otherProps: {
              allowClear: false,
              defaultValue: [moment().subtract(30, 'day'), moment()],
            },
          },
          {
            type: 'RangePicker',
            field: ['startSuccessDate', 'endSuccessDate'],
            placeholder: ['完成日期起', '完成日期止'],
            otherProps: {
              allowClear: true,
            },
          },
          {
            type: 'SimpleSelectOfCoach',
            field: 'cid',
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'bankChannelId',
            placeholder: '结算钱包',
            options: [{ label: '结算钱包(全部)', value: '' }, ...walletData],
          },
          {
            type: 'Select',
            field: 'splitRatioStatus',
            placeholder: '状态',
            options: [{ label: '状态(全部)', value: '' }, ...useOptions('split_ratio_status_type')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
        simpleCoachRequest={_getCoachList}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <AuthButton
          className="mb10"
          type="primary"
          authId="financial/splitAccount"
          onClick={() => {
            setStuFreeVisible();
          }}
        >
          分账比例设置
        </AuthButton>
      </ButtonContainer>
      <Modal
        visible={stuFreeVisible}
        onOk={setStuFreeVisible}
        onCancel={setStuFreeVisible}
        destroyOnClose
        width="1000px"
        title="学费分账"
        footer={[]}
      >
        <SplitAccount />
      </Modal>
      <CustomTable columns={columns} {...tableProps} rowKey="cid" scroll={{ x: 800 }} />
    </>
  );
};

export default CoachSubAccount;
