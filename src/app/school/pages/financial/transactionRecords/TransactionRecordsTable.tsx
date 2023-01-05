// 商品信息

import { _getInfo } from './_api';
import { useFetch, useVisible } from 'hooks';
import { generateIdForDataSource, _get } from 'utils';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';
import { CustomTable, AuthButton } from 'components';
import Drawback from './Drawback';
import Record from './Record';
import { message, Modal } from 'antd';

export default function TransactionRecordsTable(props: any) {
  const { query, ignore, pagination, setPagination, tablePagination, setLoading, forceUpdate, type = '' } = props;
  const [recordVisible, setRecordVisible] = useVisible(); //退款详情
  const [drawbackVisible, setDrawbackVisible] = useVisible(); //退款操作
  const [showId, setshowId] = useState('');
  const [record, setRecord] = useState({});
  const history = useHistory();
  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize, query.payFactory],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
    failCallback(res) {
      setPagination({ ...pagination, total: 0 });
    },
  });

  useEffect(() => {
    setLoading && setLoading(isLoading);
  }, [isLoading, setLoading]);

  const columns = [
    {
      title: '交易号',
      width: 150,
      dataIndex: 'payFlowId',
    },
    {
      title: '订单号',
      width: 150,
      dataIndex: 'orderId',
    },
    {
      title: '钱包',
      width: 120,
      dataIndex: 'payFactoryName',
    },
    {
      title: '对方信息',
      ellipsis: true,
      dataIndex: 'targetAccountEntity',
      render: (targetAccountEntity: any, record: any, index: number) => {
        if (type === 'sale' || type === 'sold') {
          //增值订单的交易记录 数据直接展示，不处理
          return targetAccountEntity ? targetAccountEntity : '';
        }
        if (targetAccountEntity) {
          let settle = JSON.parse(targetAccountEntity);
          let arr = [];
          if (settle.bandCardBankName) {
            arr.push(settle.bandCardBankName);
          }
          if (settle.acctNo) {
            arr.push(settle.acctNo);
          }

          return arr.join('-');
        }
        return '';
      },
    },
    {
      title: '银行流水号',
      width: 170,
      dataIndex: 'tradeNo',
    },
    {
      title: '金额',
      dataIndex: 'awaitAmount',
      render: (awaitAmount: any, record: any) => {
        if (String(_get(record, 'statusName', '')) === '交易成功') {
          return <span style={{ color: '#009900' }}>{Number(awaitAmount).toFixed(2)}</span>;
        }
        if (String(_get(record, 'statusName', '')) === '交易失败') {
          return <span style={{ color: '#FF0000' }}>{Number(awaitAmount).toFixed(2)}</span>;
        }
        return awaitAmount || awaitAmount === 0 ? Number(awaitAmount).toFixed(2) : '';
      },
    },
    {
      title: '已退款额',
      dataIndex: 'refundAmount',
      render: (text: string, record: any) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
          onClick={() => {
            setshowId(_get(record, 'payFlowId', ''));
            setRecordVisible();
          }}
        >
          {Number(_get(record, 'refundAmount', 0)).toFixed(2)}
        </a>
      ),
    },
    {
      title: '交易状态',
      dataIndex: 'statusName',
    },
    {
      title: '完成时间',
      width: 160,
      dataIndex: 'successTime',
    },
    {
      title: '入账状态',
      dataIndex: 'settleStatusName',
    },
    {
      title: '失败原因',
      ellipsis: true,
      dataIndex: 'failReason',
    },
    {
      title: '交易类型',
      dataIndex: 'transTypeName',
    },
    {
      title: '备注',
      ellipsis: true,
      dataIndex: 'memo',
    },
    {
      title: '创建时间',
      width: 150,
      dataIndex: 'createdTime',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: any, record: any) => (
        <AuthButton
          authId="financial/transactionRecords:btn1"
          onClick={() => {
            if (_get(record, 'statusName') === '交易成功' && _get(record, 'settleStatusName') === '未入账') {
              message.info('交易金额未入账，不可进行退款');
            } else if (_get(record, 'bindcard') === 0) {
              Modal.error({
                title: '绑卡',
                content: '您还未在平安银行电子户绑卡，无法进行退款操作，请绑卡后再进行操作',
                onOk() {
                  history.push(`./wallet`);
                },
              });
            } else {
              setRecord(record);
              setDrawbackVisible();
            }
          }}
          className="operation-button"
          insertWhen={
            _get(record, 'payFactory') === 'pa_bank' &&
            _get(record, 'transType') === '6' &&
            _get(record, 'busiType') === 6
          }
        >
          退款
        </AuthButton>
      ),
    },
  ];

  return (
    <div>
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={generateIdForDataSource(_get(data, 'rows', []))}
        rowKey="id"
        pagination={tablePagination}
        scroll={{ x: 1800, y: document.body?.clientHeight - 400 }}
      />
      <Drawback
        visible={drawbackVisible}
        record={record}
        handleCancel={setDrawbackVisible}
        handleOk={() => {
          setDrawbackVisible();
          forceUpdate();
        }}
      />
      <Record visible={recordVisible} payFlowId={showId} handleOk={setRecordVisible} />
    </div>
  );
}
