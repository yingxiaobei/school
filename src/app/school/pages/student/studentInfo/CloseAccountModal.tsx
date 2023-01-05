import React from 'react';
import { useFetch, useRequest } from 'hooks';
import {
  _queryAccountInfo,
  _studentCancelAccount,
  _getDetails,
  _checkAlreadySettlementAmount,
  _addSettlementAmount,
} from './_api';
import { Modal, Descriptions, Row, Spin } from 'antd';
import { _get } from 'utils';

interface Iprops {
  visible: boolean;
  handleCancel: () => void;
  sid: string;
  customSchoolId: string;
  currentData: object;
  setSettlementRecordsVisible: () => void;
  handleOk: () => void;
}
const CloseAccountModal = (props: Iprops) => {
  const { visible, handleCancel, setSettlementRecordsVisible, sid, customSchoolId, handleOk } = props;
  const { data, isLoading } = useFetch({
    request: _queryAccountInfo,
    query: { sid },
    customHeader: { customSchoolId: '' },
  });
  const { data: detail } = useFetch({
    //个人信息
    query: {
      id: sid,
    } as any,
    customHeader: { customSchoolId },
    request: _getDetails,
  });

  const { run, loading } = useRequest(_studentCancelAccount, {
    onSuccess: () => {
      handleOk();
    },
  });

  const { loading: btnLoading, run: _addSettlement } = useRequest(_addSettlementAmount, {
    onSuccess: () => {
      run({ id: sid });
    },
  });
  const { run: check } = useRequest(_checkAlreadySettlementAmount, {
    onSuccess: (res) => {
      if (res === true) {
        run({ id: sid });
        return;
      } else {
        Modal.info({
          title: '温馨提醒',
          content: (
            <p>
              该学员已结算资金总额与已学学时不一致，请
              <div
                onClick={setSettlementRecordsVisible}
                style={{ color: 'red', display: 'inline-block', cursor: 'pointer' }}
              >
                点击此处
              </div>
              查看，确认仍要销户吗？
            </p>
          ),
          closable: true,
          okText: '确定',
          onOk() {
            _addSettlement({ sid: sid });
            return;
          },
        });
      }
    },
  });
  return (
    <Modal
      title="销户"
      visible={visible}
      onOk={() => {
        check({ sid: sid });
      }}
      onCancel={handleCancel}
      width={800}
      confirmLoading={loading || btnLoading}
    >
      <Spin spinning={isLoading}>
        <Descriptions title="基本信息">
          <Descriptions.Item label="学员姓名">{_get(detail, 'name')}</Descriptions.Item>
          <Descriptions.Item label="培训车型">{_get(detail, 'traintype')}</Descriptions.Item>
          <Descriptions.Item label="学员当前银行">{_get(detail, 'bankchannelname')}</Descriptions.Item>
        </Descriptions>
        <Descriptions title="账户信息" />
        <div>
          <div className="flex-box mb20  ml20 mr20">
            <div className="flex1">
              套餐托管总额<Row className="fz20 bold">{_get(data, 'packageAmount', 0)}元</Row>
            </div>
            <div className="flex1">
              充值总额<Row className="fz20 bold">{_get(data, 'rechargeAmount', 0)}元</Row>
            </div>
            <div className="flex1">
              当前余额<Row className="fz20 bold">{_get(data, 'currentBalance', 0)}元</Row>
            </div>
          </div>
          <div className="flex-box ml20 mr20">
            <div className="flex1">
              已结算金额<Row className="fz20 bold">{_get(data, 'settledAmount', 0)}元</Row>
            </div>
            <div className="flex1">
              待结算金额
              <Row className="fz20 bold">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a onClick={setSettlementRecordsVisible}>{_get(data, 'toBeSettledAmount', 0)}元</a>
              </Row>
            </div>
            <div className="flex1"></div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};
export default CloseAccountModal;
