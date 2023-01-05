import { Button, DatePicker, Drawer, Form, Input, Row } from 'antd';
import { ItemCol, PopoverImg, UploadPro } from 'components';
import { useRequest } from 'hooks';
import { useState } from 'react';
import { Auth, formatTime, _get } from 'utils';
import { _confirmPayment } from './_api';
import moment from 'moment';
import { RULES } from 'constants/rules';

export default function OfflinePayed(props: any) {
  const { onCancel, offlinePayData, subAccountType, rechargeNumber, onOk, rechargeValues } = props;
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [imgId, setImgId] = useState('');
  const { loading, run } = useRequest(_confirmPayment, {
    onSuccess: () => {
      onOk();
    },
  });
  const _handleOk = () => {
    form.validateFields().then((values: any) => {
      run({
        bankFlowId: _get(values, 'bankFlowId'),
        bankId: _get(offlinePayData, 'bankId'),
        payTime: formatTime(_get(values, 'payTime'), 'NORMAL'),
        payWay: '0',
        payer: _get(values, 'payer'),
        queryOperator: `${Auth.get('userId')}${Auth.get('operatorName')}`,
        rechargeNumApply: _get(offlinePayData, 'rechargeNumApply', '0'),
        rechargeNumber,
        rechargeVoucherUrl: imgId,
        remark: _get(values, 'remark', ''),
        subAccountType,
      });
    });
  };

  return (
    <Drawer
      destroyOnClose
      visible
      width={1000}
      title={'上传转账回执单'}
      onClose={onCancel}
      footer={
        <div className="text-right">
          <Button onClick={_handleOk} type="primary" loading={loading}>
            我已付款
          </Button>
        </div>
      }
    >
      <Form form={form} autoComplete="off" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <div>
          <ItemCol label="应付金额" style={{ marginBottom: 0 }}>
            ￥{Number(_get(rechargeValues, 'rechargeTotal', 0)).toFixed(2)}
          </ItemCol>
          <div className="flex-box">
            <span className="color-primary">请足额付款，否则由此造成的后果需您承担。</span>
          </div>
        </div>

        <Row>
          <ItemCol label="收款银行">{_get(offlinePayData, 'bankName')}</ItemCol>
        </Row>
        <Row>
          <ItemCol label="收款账户名">{_get(offlinePayData, 'accountName')}</ItemCol>
        </Row>
        <Row>
          <ItemCol label="收款账号">{_get(offlinePayData, 'bankAccount')}</ItemCol>
        </Row>
        <Row>
          <ItemCol
            label="付款凭证（流水）号"
            name="bankFlowId"
            rules={[{ whitespace: true, required: true }, RULES.ORG_CODE]}
          >
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol label="付款方" name="payer" rules={[{ whitespace: true, required: true }, RULES.PAYER_NAME]}>
            <Input placeholder="填写转账账户名称" />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol label="付款时间" name="payTime" rules={[{ required: true, message: '请选择付款时间' }]}>
            <DatePicker
              showTime
              disabledDate={(current: any) => {
                return current.diff(moment(new Date(), 'second')) > 0;
              }}
            />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol label="付款摘要/用途" name="remark" rules={[{ whitespace: true, required: true }, RULES.MEMO]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol label="回执单照片" required>
            {imageUrl ? (
              <PopoverImg src={imageUrl} alt="" imgStyle={{ width: '100%' }} />
            ) : (
              <UploadPro imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} />
            )}
          </ItemCol>
        </Row>
      </Form>
    </Drawer>
  );
}
