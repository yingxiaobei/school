import { useState } from 'react';
import { Modal, Radio } from 'antd';
import { _getReview } from './_api';
import { useInfo, useBulkStatisticsResult } from 'hooks';
import { UploadArrLoading, BatchProcessResult } from 'components';
import { _get } from 'utils';

interface Iprops {
  onCancel(): void;
  onOk(): void;
  sid: string;
  rows: any;
}

export default function Review(props: Iprops) {
  const { onCancel, onOk, rows } = props;
  const [reviewValue, setReviewValue] = useState('2');
  const [_showInfo] = useInfo();
  // 理科中心财务审核

  const { loading: confirmLoading, run } = useBulkStatisticsResult(_getReview, {
    onOk: (data) => {
      const { total, errorTotal, errHashList } = data;
      _showInfo({
        content: (
          <BatchProcessResult
            total={total}
            successTotal={total - errorTotal}
            errorTotal={errorTotal}
            errHashList={errHashList}
          />
        ),
      });
      onOk();
    },
  });

  return (
    <div>
      <Modal
        visible
        title={'理科中心财务审核'}
        maskClosable={false}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        bodyStyle={{ textAlign: 'center' }}
        onOk={() => {
          run(rows, { otherParams: { auditStatus: reviewValue }, priKeyValMap: [{ key: 'sid', value: 'sid' }] });
        }}
      >
        <Radio.Group onChange={(e) => setReviewValue(e.target.value)} value={reviewValue}>
          <Radio value={'2'}>通过</Radio>
          <Radio value={'3'}>拒绝</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
}
