import { useState } from 'react';
import { Drawer } from 'antd';
import 'quill/dist/quill.snow.css';

export default function AddOrEdit(props: any) {
  const { onCancel, richtextContent } = props;

  return (
    <div>
      <Drawer destroyOnClose visible width={800} title={'预览'} onClose={onCancel} style={{ whiteSpace: 'pre-wrap' }}>
        <div className="ql-snow">
          <div className="ql-editor" dangerouslySetInnerHTML={{ __html: richtextContent }}></div>
        </div>
      </Drawer>
    </div>
  );
}
