import { Col, Modal, Row } from 'antd';

//付款可选银行
export default function PayBankList(props: any) {
  const { onCancel } = props;

  const bankList = [
    {
      label: '工商银行',
      value: 'ICBC',
    },
    {
      label: '农业银行',
      value: 'ABC',
    },
    {
      label: '中国银行',
      value: 'BOC',
    },
    {
      label: '建设银行',
      value: 'CCB',
    },
    {
      label: '招商银行',
      value: 'CMB',
    },
    {
      label: '广发银行',
      value: 'GDB',
    },
    {
      label: '民生银行',
      value: 'CMBC',
    },
    {
      label: '光大银行',
      value: 'CEB',
    },
    {
      label: '华夏银行',
      value: 'HXB',
    },
    {
      label: '邮政银行',
      value: 'PSBC',
    },
    {
      label: '北京银行',
      value: 'BCCB',
    },
    {
      label: '平安银行',
      value: 'PAB',
    },
    {
      label: '浦发银行',
      value: 'SPDB',
    },
    {
      label: '浙商银行',
      value: 'CZSB',
    },
  ];
  return (
    <Modal title="查看银行" visible footer={null} onCancel={onCancel}>
      <Row>支付可选银行如下：</Row>
      <Row className="mt10 mb10">
        {bankList.map((x: any) => {
          return <Col span={8}>{x.label}</Col>;
        })}
      </Row>
      <Row>具体以银行页面展示为准。</Row>
    </Modal>
  );
}
