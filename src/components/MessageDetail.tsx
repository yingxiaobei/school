import React, { useImperativeHandle, useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { useVisible } from 'hooks';
import 'quill/dist/quill.snow.css';

type TProps = {
  title?: string;
};

const MessageDetail = React.forwardRef((props: TProps, ref) => {
  const { title } = props;
  const [detail, setDetail] = useState<{ [key: string]: string }>({});
  const [visible, _switchVisible] = useVisible();
  useImperativeHandle(ref, () => ({
    _switchVisible,
    setDetail,
  }));
  useEffect(() => {
    if (detail.id) {
      _switchVisible();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.id]);
  useEffect(() => {
    if (!visible) {
      setDetail({});
    }
  }, [visible]);
  return (
    <Modal
      title={title || '公告详情'}
      visible={visible}
      closable={false}
      bodyStyle={{ maxHeight: '76vh' }}
      footer={[
        <Button key="ok" type="primary" onClick={_switchVisible}>
          确定
        </Button>,
      ]}
    >
      <h2 style={{ textAlign: 'center' }}>{detail.title}</h2>
      <p style={{ textAlign: 'center' }}>{detail.sendTime}</p>
      <div className="ql-snow">
        <div className="ql-editor" dangerouslySetInnerHTML={{ __html: detail.targetUrl }}></div>
      </div>
    </Modal>
  );
});

export default MessageDetail;
