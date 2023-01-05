import { Row, Drawer, DatePicker, Col, Button, Input, message } from 'antd';
import { CustomTable, ItemCol } from 'components';
import moment from 'moment';
import { useFetch, useForceUpdate, useHash, useRequest } from 'hooks';
import { Auth, _get, _handleIdCard } from 'utils';
import { _addApplyRecord, _selectDropOutStudent } from './_api';
import { useState } from 'react';

export default function AddCardReturn(props: any) {
  const { onCancel, accountInfo } = props;
  const [search, setSearch] = useState(moment().subtract(1, 'months').format('YYYYMM'));
  const [selectedRows, setSelectedRows] = useState([]);
  const payWayHash = useHash('pay_way_type');
  const [ignore, forceUpdate] = useForceUpdate();
  const [msg, setMsg] = useState('');
  const busiTypeHash = useHash('businessType');

  const columns = [
    { title: '学员姓名', dataIndex: 'studentName', width: 100 },
    {
      title: '学员证件号',
      dataIndex: 'idcard',
      width: 100,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '消费环节',
      dataIndex: 'consumePoint',
      width: 80,
    },
    { title: '学驾车型', width: 80, dataIndex: 'trainType' },
    { title: '业务类型', width: 80, dataIndex: 'busiType', render: (payStatus: any) => busiTypeHash[payStatus] },
    { title: '消费时间', dataIndex: 'consumeTime', width: 120 },
    { title: '退学日期', dataIndex: 'dropOutDate', width: 120 },
  ];

  const { data, isLoading } = useFetch({
    request: _selectDropOutStudent,
    depends: [ignore, _get(accountInfo, 'subAccountType')],
    query: {
      subAccountType: _get(accountInfo, 'subAccountType'),
      dropOutMonth: search,
    },
  });

  const { loading, run } = useRequest(_addApplyRecord, {
    onSuccess: () => {
      onCancel();
    },
    onFail: (res) => {
      message.error(res);
    },
  });

  return (
    <Drawer
      destroyOnClose
      visible
      width={1000}
      title={'退卡申请'}
      onClose={onCancel}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onCancel} className="mr20">
            取消
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              if (!msg) {
                message.error('请输入附言');
                return;
              }
              if (!selectedRows.length) {
                message.error('请选择要退卡的学员');
                return;
              }
              run({
                stuApplyFormTotalVO: {
                  accountType: _get(accountInfo, 'subAccountType'),
                  applyMessage: msg,
                  dropOutMonth: search,
                  auditStatus: 0,
                  applyType: 6,
                  schoolId: Auth.get('schoolId'),
                  returnCardNum: selectedRows.length,
                },
                stuReturnCardApplyDetailList: selectedRows,
              });
            }}
          >
            确定
          </Button>
        </div>
      }
    >
      <Row>
        <ItemCol span={8} label="账户全称">
          {_get(accountInfo, 'account')}
        </ItemCol>
        <ItemCol span={8} label="账户类型">
          {_get(accountInfo, 'type')}
        </ItemCol>
      </Row>
      <Row>
        <ItemCol span={24} label="附言" required>
          <Input.TextArea
            rows={4}
            maxLength={300}
            showCount
            onChange={(val: any) => {
              setMsg(val.target.value);
            }}
          />
        </ItemCol>
      </Row>
      <Row className="mb10">
        <ItemCol span={12} label="退学月份">
          <DatePicker
            picker="month"
            onChange={(value: any, valueString: string) => {
              setSearch(moment(valueString).format('YYYYMM'));
            }}
            defaultValue={moment().subtract(1, 'months')}
          />
        </ItemCol>
        <Col span={8}>
          <Button
            type="primary"
            onClick={() => {
              forceUpdate();
            }}
          >
            查询
          </Button>
        </Col>
      </Row>
      <Row className="mb10">
        <Col span={8}>退卡学员</Col>
        <Col span={8}>仅可对已退学的学员发起申请</Col>
        <Col span={8}>已选数量：{selectedRows.length}</Col>
      </Row>
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={data}
        rowKey={(record: any) => _get(record, 'orderCode')}
        pagination={false}
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys: any, selectedRows: any) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
    </Drawer>
  );
}
