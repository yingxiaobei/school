import { useState } from 'react';
import { Form, Modal, InputNumber, message, Tooltip } from 'antd';
import { ItemCol, Loading, UploadFileCustomized } from 'components';
import { _apply, _detailBySchoolId } from './api';
import { useFetch, useRequest } from 'hooks';
import { _get } from 'utils';

interface Iprops {
  onCancel: () => void;
  withdrawVerfiy: string; //（0.要审 1. 免审）
  applyDetail: { amount: number | string; count: number; shopId: string; list: Array<string> };
  onSuccess: () => void;
}
const WithdrawalApplication = (props: Iprops) => {
  const { onCancel, withdrawVerfiy, applyDetail, onSuccess } = props;
  const [form] = Form.useForm();
  const [insuranceFileUrl, setInsuranceFileUrl] = useState('');
  const [insuranceFileOssId, setInsuranceFileOssId] = useState('');
  const { loading: withdrawalLoading, run } = useRequest(_apply, {
    onSuccess: (res) => {
      onSuccess();
    },
  });
  const { isLoading, data } = useFetch({
    query: { schoolId: applyDetail.shopId },
    request: _detailBySchoolId,
  });

  return (
    <Modal
      width={400}
      visible
      title={'操作确认'}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={withdrawalLoading}
      onOk={() => {
        if (withdrawVerfiy.toString() === '0' && !insuranceFileOssId) {
          message.error('请输入发票号码并上传发票文件后再提交申请');
          return;
        }
        form.validateFields().then(async (values) => {
          run({
            orderAmount: applyDetail.amount,
            orderCount: applyDetail.count,
            receiptNo: _get(values, 'receiptNo'),
            receiptFile: insuranceFileOssId,
            orderIds: applyDetail.list,
          });
        });
      }}
    >
      {isLoading && <Loading />}
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} form={form}>
        <ItemCol span={24} label="提现额" name="orderAmount">
          ￥{applyDetail.amount}
        </ItemCol>
        <ItemCol span={24} label="订单数" name="orderCount">
          {applyDetail.count}笔
        </ItemCol>
        {withdrawVerfiy.toString() === '0' ? (
          <>
            <ItemCol
              span={24}
              label="发票号码"
              name="receiptNo"
              type="string"
              rules={[
                { required: true },
                {
                  pattern: /^\d{1,32}$/,
                  message: '输入内容需在32个数字以内',
                },
              ]}
            >
              <InputNumber placeholder="请输入发票号码" style={{ width: '180px' }} />
            </ItemCol>
            <ItemCol span={24} label="发票文件" name="receiptFile">
              <UploadFileCustomized
                imageUrl={insuranceFileUrl}
                setImageUrl={setInsuranceFileUrl}
                setImgId={setInsuranceFileOssId}
                title={'发票文件'}
                typeRule={{
                  rule: ['image/jpeg', 'image/png', 'application/pdf'],
                  message: '仅支持jpg/jpeg/pdf格式的文件',
                  size: 10,
                }}
                layout={'hor'}
              />
            </ItemCol>
          </>
        ) : null}

        <div style={{ textAlign: 'center', backgroundColor: '#f6f6f6' }} className="mb20">
          {withdrawVerfiy.toString() !== '0' ? '若要开发票， 发票抬头如下' : '以下为开票抬头'}
        </div>
        <ItemCol span={24} label="名称" name="shopName">
          {_get(data, 'name')}
        </ItemCol>
        <ItemCol span={24} label="税号" name="name">
          {_get(data, 'taxId')}
        </ItemCol>
        <ItemCol span={24} label="地址电话" name="name">
          <Tooltip placement="topLeft" title={_get(data, 'addressMobile')}>
            <div
              style={{
                width: '240px',
                wordBreak: 'break-all',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}
            >
              {_get(data, 'addressMobile')}
            </div>
          </Tooltip>
        </ItemCol>
        <ItemCol span={24} label="银行账户" name="name">
          {_get(data, 'account')}
        </ItemCol>
      </Form>
    </Modal>
  );
};
export default WithdrawalApplication;
