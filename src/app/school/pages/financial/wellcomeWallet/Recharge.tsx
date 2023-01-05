import { Button, Drawer, Form, Input, Modal, Row, message } from 'antd';
import { ItemCol } from 'components';
import { RULES } from 'constants/rules';
import { useEffect, useState } from 'react';
import { _get } from 'utils';
import './index.scss';

export default function Recharge(props: any) {
  const { onCancel, data, setPayTypeVisible, setRechargeValues } = props;
  const [form] = Form.useForm();
  const [rechargeMoney, setRechargeMoney] = useState(0);
  const { confirm } = Modal;
  const [rechargeNumApply, setRechargeNumApply] = useState(100);

  const _handleOk = () => {
    if (!rechargeNumApply) {
      return message.error('充值数量不能为空');
    }
    if (
      rechargeNumApply &&
      !(
        Number(rechargeNumApply) >= 1 &&
        Number(rechargeNumApply) <= 10000 &&
        /^[0-9]\d*$/.test(String(rechargeNumApply))
      )
    ) {
      return message.error('充值数量区间为1-10000的正整数');
    }
    form.validateFields().then((values: any) => {
      onCancel();
      let secondsToGo = 3;
      const modal = confirm({
        title: (
          <span>
            您正在发起
            <span className="color-primary bold text-underline">{_get(data, 'subAccountName')}</span>
            充值申请，其他用途款项请勿转入！
          </span>
        ),
        content: '',
        okText: '确定充值(3)',
        okButtonProps: { disabled: true },
        okType: 'danger',
        cancelText: '取消充值',
        onOk() {
          setRechargeValues({ ...values, rechargeTotal: rechargeMoney, rechargeNumApply });
          setPayTypeVisible();
        },
      });
      const timer = setInterval(() => {
        secondsToGo -= 1;
        modal.update({
          okText: `确定充值${secondsToGo > 0 ? secondsToGo : ''}`,
          okButtonProps: { disabled: secondsToGo > 0 ? true : false },
        });
        if (secondsToGo == 0) {
          clearInterval(timer);
        }
      }, 1000);
    });
  };

  useEffect(() => {
    setRechargeMoney(rechargeNumApply * _get(data, 'unitPrice', 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rechargeNumApply, _get(data, 'unitPrice', 0)]);

  const _handleAdd = (num: number) => {
    setRechargeNumApply((val) => Number(val) + Number(num));
  };

  return (
    <Drawer
      destroyOnClose
      visible
      width={800}
      title={'充值'}
      onClose={onCancel}
      footer={
        <div className="text-right">
          <Button onClick={onCancel} className="mr10">
            取消
          </Button>
          <Button onClick={_handleOk} type="primary">
            确定
          </Button>
        </div>
      }
    >
      <Form form={form} autoComplete="off" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Row>
          <ItemCol label="充值账户">{_get(data, 'subAccountName')}</ItemCol>
        </Row>
        <Row>
          <ItemCol label="单价">
            <span className="fz20">￥{Number(_get(data, 'unitPrice', 0)).toFixed(2)}</span>
          </ItemCol>
        </Row>
        <Row>
          <ItemCol
            label="充值数量"
            // name="rechargeNumApply"
            rules={[
              { required: true, message: '充值数量不能为空' },
              {
                validator: RULES.TEACH_AREA_CAR_NUM,
              },
            ]}
          >
            <Input
              type="number"
              value={rechargeNumApply}
              onChange={(e: any) => {
                setRechargeNumApply(e.target.value);
                setRechargeMoney(e.target.value * _get(data, 'unitPrice', 0));
              }}
            />
          </ItemCol>

          <div className="add-div">
            <div
              className="width-40 commonBorder"
              onClick={() => {
                _handleAdd(30);
              }}
            >
              +30
            </div>
            <div
              className="width-50 commonBorder"
              onClick={() => {
                _handleAdd(50);
              }}
            >
              +50
            </div>
            <div
              className="width-50 commonBorder"
              onClick={() => {
                _handleAdd(100);
              }}
            >
              +100
            </div>
          </div>
        </Row>
        <Row>
          <ItemCol label="充值金额">
            <span className="text-underline fz28">
              ￥<span className="color-primary">{Number(rechargeMoney).toFixed(2)}</span>
            </span>
          </ItemCol>
        </Row>
      </Form>
    </Drawer>
  );
}
