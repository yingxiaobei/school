import { Button, Drawer, Form, Input, message, Radio, Row, Space } from 'antd';
import { ItemCol } from 'components';
import { useFetch, useRequest } from 'hooks';
import { useState } from 'react';
import { _get } from 'utils';
import { _queryAccountBalanceAll, _integralExchange } from './_api';
import { IF, Loading } from 'components';
import { RULES } from 'constants/rules';

interface IPointsExchange {
  onCancel(): void;
  currentRecord: any;
  onOk(): void;
}

export function PointsExchange(props: IPointsExchange) {
  const { onCancel, currentRecord, onOk } = props;
  const [form] = Form.useForm();
  const [currentPay, setCurrentPay] = useState(0);
  const [max, setMax] = useState(0) as any;
  const [placeholder, setPlaceholder] = useState('<=0');
  const [currentRatio, setCurrentRatio] = useState(0);
  const [subAccountType, setSubAccountType] = useState('');

  const { data, isLoading } = useFetch({
    request: _queryAccountBalanceAll,
    query: {
      accountType: '00', // 账户类型 00:普通 10-代理商
    },
  });

  const { loading, run } = useRequest(_integralExchange, {
    onSuccess: onOk,
  });

  const _handleOk = () => {
    form.validateFields().then(async (values) => {
      if (!subAccountType) {
        return message.error('请选择兑换物');
      }
      if (!/^[0-9]\d*$/.test(_get(values, 'rechargeNumApply'))) {
        return message.error('兑换数量必须为正整数');
      }
      if (_get(values, 'rechargeNumApply') > max) {
        return message.error('兑换数量超过最大值');
      }
      const query = { rechargeNumApply: _get(values, 'rechargeNumApply'), subAccountType };
      run(query);
    });
  };

  const _handleRadioChange = (e: any) => {
    const value = e.target.value;
    setSubAccountType(value);
    const arr = _get(data, 'subAccounts', []).filter((x: any) => {
      return x.subAccountType === value;
    });

    const ratio = _get(arr, `0.ratio`, 0);
    setCurrentRatio(ratio);
    if (ratio && ratio != 0) {
      const max = Math.floor(_get(currentRecord, 'accountBalance') * ratio);
      setMax(max);
      setPlaceholder(`<=${max}`);
    } else {
      setMax(0);
      setPlaceholder(`<=0`);
    }

    const number = form.getFieldValue('rechargeNumApply');
    if (ratio && ratio != 0) {
      number && setCurrentPay(Number(number) / Number(ratio));
    } else {
      setCurrentPay(0);
    }
  };

  return (
    <Drawer
      destroyOnClose
      visible
      width={800}
      title={'积分兑换'}
      onClose={onCancel}
      footer={
        <div className="text-right">
          <Button onClick={onCancel} className="mr10">
            取消
          </Button>
          <Button onClick={_handleOk} type="primary" loading={loading}>
            确定
          </Button>
        </div>
      }
    >
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <Form form={form} autoComplete="off" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Row>
              <ItemCol label="剩余可用">{Number(_get(currentRecord, 'accountBalance', 0)).toFixed(2)}</ItemCol>
            </Row>
            <Row className="align-center flex">
              <ItemCol label="兑换物" required>
                <Row style={{ background: '#d4d1d1' }} className="flex p6">
                  <span className="flex1">类型</span>
                  <span>兑换比例 - 100积分可换</span>
                </Row>
                <Radio.Group onChange={_handleRadioChange} className="width-200">
                  <Space direction="vertical" className="width-200">
                    {_get(data, 'subAccounts', [])
                      .filter((x: any) => {
                        return x.subAccountType != '04' && x.subAccountType != 'A1'; //A1镇江 学员档案专用：剩余注册名额，此处不用
                      })
                      .map((x: any) => {
                        return (
                          <Radio value={x.subAccountType} className=" flex" key={x.subAccountType}>
                            <Row className="width-200 flex">
                              <span className="flex1">{x.subAccountName}</span>
                              <span>100:{Number(x.ratio * 100).toFixed(2)}</span>
                            </Row>
                          </Radio>
                        );
                      })}
                  </Space>
                </Radio.Group>
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                label="兑换数量"
                name="rechargeNumApply"
                rules={[{ whitespace: true, required: true }, RULES.COMMON_NUM]}
              >
                <Input
                  type="number"
                  placeholder={placeholder}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (currentRatio && currentRatio != 0) {
                      setCurrentPay(Number(val) / Number(currentRatio));
                    } else {
                      setCurrentPay(0);
                    }
                  }}
                />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol label="本次消耗">{Number(currentPay).toFixed(2)}</ItemCol>
            </Row>
          </Form>
        }
      />
    </Drawer>
  );
}
