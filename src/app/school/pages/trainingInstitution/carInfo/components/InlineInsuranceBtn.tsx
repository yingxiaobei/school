import InlineUploadFile from 'components/InlineUploadFile';
import { useState } from 'react';
import { _get } from 'utils';
import { _updateInsurance } from '../_api';

interface Props {
  cb: (loading: boolean) => void;
  currentRecord: any;
  carid: string;
  forceUpdate: () => void;
}

function InlineInsuranceBtn({ cb, currentRecord, carid, forceUpdate }: Props) {
  const [, setImgUrl] = useState('');
  const [imgId, setImgId] = useState('');

  return (
    <InlineUploadFile
      setImageUrl={setImgUrl}
      setImgId={setImgId}
      callback={({ id }: any) => {
        // 调动对应的update接口
        cb(true);
        const query = {
          carid,
          insuranceFileOssId: id,
        };
        _updateInsurance({ ...query, id: _get(currentRecord, 'id') })
          .then((res) => {
            // 刷新页面
            forceUpdate();
            cb(false);
          })
          .catch((err) => {
            console.error(err);
          });
      }}
    />
  );
}

export default InlineInsuranceBtn;
