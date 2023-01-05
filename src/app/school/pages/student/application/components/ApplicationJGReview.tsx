import { Form, message, Modal, Spin } from 'antd';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { formatTime, _get } from 'utils';
import { useApplicationDetail } from '../hooks';

interface JGReview {
  currentId: string | number | null;
  onCancel: () => void;
}

export default function ApplicationJGReview({ currentId, onCancel }: JGReview) {
  const { data, isLoading } = useApplicationDetail(currentId);

  const renderDifferentByJG = (applicationTypeJGType: string) => {
    switch (applicationTypeJGType) {
      case '4':
        return (
          <>
            <Form.Item label="现学驾车型">{_get(data, ['stuChangeTraintypeDetailVo', 'oldTrainType'], '')}</Form.Item>
            <Form.Item label="修改后学驾车型">
              {_get(data, ['stuChangeTraintypeDetailVo', 'newTrainType'], '')}
            </Form.Item>
          </>
        );

      case '5':
        return (
          <>
            <Form.Item label="学员报名日期">
              {formatTime(_get(data, ['stuChangeApplydateDetailVo', 'oldApplyDate'], ''), 'DATE')}
            </Form.Item>
            <Form.Item label="修改后报名日期">
              {formatTime(_get(data, ['stuChangeApplydateDetailVo', 'newApplyDate'], ''), 'DATE')}
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal title={'详情'} footer={null} visible onCancel={onCancel} maskClosable={false}>
      <Spin spinning={isLoading}>
        <Form labelCol={{ span: 10 }}>
          <Form.Item label="学员姓名">{_get(data, ['stuApplyFormTotalVO', 'studentName'], '')}</Form.Item>
          <Form.Item label="证件号码">{_get(data, ['stuApplyFormTotalVO', 'idCard'], '')}</Form.Item>
          {renderDifferentByJG(_get(data, ['stuApplyFormTotalVO', 'applyType'], ''))}
          <Form.Item label="申请文件">
            <span
              style={{
                color: PRIMARY_COLOR,
                cursor: 'pointer',
              }}
              onClick={() => {
                const pdf = _get(data, ['stuApplyFormTotalVO', 'applyFileUrls', 0], '');
                if (!pdf) {
                  return message.error('申请文件不存在！');
                }
                window.open(pdf);
              }}
            >
              预览
            </span>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
