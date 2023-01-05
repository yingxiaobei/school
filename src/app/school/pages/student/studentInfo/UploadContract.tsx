import { useState } from 'react';
import { Modal } from 'antd';
import { _submitStuSignature } from './_api';
import { UploadFile } from 'components';
import { _get } from 'utils';

export default function GenerateContract(props: any) {
  const { onCancel, currentRecord, title, onOk } = props;
  const [contractImgUrl, setContractImgUrl] = useState();
  const [contractImgOssId, setContractImgOssId] = useState('');

  return (
    <>
      <Modal
        getContainer={false}
        visible
        title={title}
        maskClosable={false}
        onCancel={onCancel}
        onOk={async () => {
          const res = await _submitStuSignature({
            fileid: contractImgOssId,
            sid: _get(currentRecord, 'sid'),
            flag: 'true', // 鹿山的需要这个字段
          });
          if (_get(res, 'code') === 200) {
            onOk();
          }
        }}
      >
        <UploadFile imageUrl={contractImgUrl} setImageUrl={setContractImgUrl} setImgId={setContractImgOssId} />
      </Modal>
    </>
  );
}
