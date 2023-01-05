import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { _setMinState, _reviewLog } from './_api';
import { _get } from 'utils';

export default function Reason(props: any) {
  const { onCancel, onOk, query, invalidReasonWay } = props;
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);

  function _handleChange(e: any): any {
    setReason(e.target.value);
  }

  return (
    <Modal
      visible
      title={'无效原因'}
      maskClosable={false}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={async () => {
        if (!reason.trim()) {
          message.error('请输入无效原因');
          return;
        }
        if (reason.length > 80) {
          message.error('无效原因长度不能超过80个字符');
          return;
        }
        const queryData = { ...query, msg_jx: reason };
        const customHeader = { menuId: 'trainingDetailReview', elementId: 'student/trainingDetailReview:btn5' };
        // invalidReasonWay 该弹框在两处使用：
        // 一、详情下方设置无效原因，为整条日志的无效原因，接口：_reviewLog，值：'all',
        // 二、分钟学时设置无效原因，为日志的部分无效原因，接口：_setMinState，值：'section',
        setLoading(true);
        const res =
          invalidReasonWay === 'all' ? await _reviewLog(queryData) : await _setMinState(queryData, customHeader);
        if (_get(res, 'code') === 200) {
          onOk();
        }
        setLoading(false);
        // run(invalidReasonWay === 'all' ? queryData : { queryData, customHeader });
      }}
    >
      <Input placeholder={'请输入无效原因'} onChange={_handleChange} />
    </Modal>
  );
}
