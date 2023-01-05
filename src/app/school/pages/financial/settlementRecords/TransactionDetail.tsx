import { Drawer, Form, Row } from 'antd';
import { IF, ItemCol, Loading } from 'components';
import { useFetch } from 'hooks';
import { TransRecordDetail, _getTransRecordDetail } from './_api';
import { _get, Amount } from 'utils';

interface TransactionDetailProps {
  visible: boolean;
  onCancel: () => void;
  payFlowId: string;
}

export default function TransactionDetail({ visible, onCancel, payFlowId }: TransactionDetailProps) {
  const [form] = Form.useForm();
  const query = {
    page: 1,
    limit: 1,
    payFlowId,
  };
  const { data: currentData = {} as TransRecordDetail, isLoading } = useFetch({
    query,
    request: _getTransRecordDetail,
  });

  const isShowAccountSharingInfo = _get(currentData, 'fundtran') === 1 && _get(currentData, 'fundtranStatus') === 1;

  function getTGargetAccountEntity(targetAccountEntity: string) {
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
  }

  function getAwaitAmount(awaitAmount: string | number) {
    if (String(_get(currentData, 'statusName', '')) === '交易成功') {
      return <span style={{ color: '#009900' }}>{Amount.toFix(awaitAmount, '￥')}</span>;
    }
    if (String(_get(currentData, 'statusName', '')) === '交易失败') {
      return <span style={{ color: '#FF0000' }}>{Amount.toFix(awaitAmount, '￥')}</span>;
    }
    return Amount.toFix(awaitAmount, '￥');
  }

  return (
    <Drawer visible={visible} destroyOnClose width={800} title={'交易记录详情'} onClose={onCancel} footer={null}>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <>
            <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Row>
                <ItemCol span={12} label="订单号">
                  {_get(currentData, 'orderId', '')}
                </ItemCol>

                <ItemCol span={12} label="钱包名称">
                  {_get(currentData, 'payFactoryName', '')}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={12} label="交易号">
                  {_get(currentData, 'payFlowId', '')}
                </ItemCol>

                <ItemCol span={12} label="对方信息">
                  {getTGargetAccountEntity(_get(currentData, 'targetAccountEntity'))}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={12} label="银行流水号">
                  {_get(currentData, 'tradeNo', '')}
                </ItemCol>

                <ItemCol span={12} label="入账状态">
                  {_get(currentData, 'settleStatusName', '')}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={12} label="交易时间">
                  {_get(currentData, 'transTime', '')}
                </ItemCol>

                <ItemCol span={12} label="交易金额">
                  {getAwaitAmount(_get(currentData, 'awaitAmount'))}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={12} label="交易状态">
                  {_get(currentData, 'statusName', '')}
                </ItemCol>

                <ItemCol span={12} label="交易类型">
                  {_get(currentData, 'transTypeName', '')}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={12} label="失败原因">
                  {_get(currentData, 'failReason') || '/'}
                </ItemCol>

                <ItemCol span={12} label="备注">
                  {_get(currentData, 'memo', '')}
                </ItemCol>
              </Row>
              {isShowAccountSharingInfo && (
                <>
                  <Row>
                    <ItemCol span={12} label="驾校分账">
                      {`${_get(currentData, 'fundtranSDate', '')} ${Amount.toFix(
                        _get(currentData, 'fundtranSAmount'),
                        '￥',
                      )}`}
                    </ItemCol>
                  </Row>
                  <Row>
                    <ItemCol span={12} label="教练分账">
                      {`${_get(currentData, 'fundtranCDate', '')} ${Amount.toFix(
                        _get(currentData, 'fundtranCAmount'),
                        '￥',
                      )}`}
                    </ItemCol>
                  </Row>
                </>
              )}
            </Form>
          </>
        }
      />
    </Drawer>
  );
}
