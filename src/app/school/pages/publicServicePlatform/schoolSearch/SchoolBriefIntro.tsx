import { Input, Row } from 'antd';
import { _createImg, _getImg } from 'api';
import { IF, Loading, PopoverImg, UploadPro } from 'components';
import { useFetch } from 'hooks';
import { useState } from 'react';
import { _get } from 'utils';
import { _getDesc } from './_api';

export default function SchoolBriefIntro(props: any) {
  const { currentId, isEdit = false, schoolBriefValue, setSchoolBriefValue } = props;
  const [imageUrl, setImageUrl] = useState('');
  const [imgId, setImgId] = useState('');
  // 资质信息
  const { isLoading } = useFetch<any>({
    query: {
      id: currentId,
      permissionType: 1,
    },
    request: _getImg,
    callback: (data) => {
      const imgData = (data || []).filter((x: any) => _get(x, 'type') === '7');
      setImgId(_get(imgData, '0.id', ''));
      setImageUrl(_get(imgData, '0.url', ''));
    },
  });

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <>
            <Row className="bold mt20 mb20">驾校头像</Row>
            {!isEdit ? (
              imageUrl ? (
                <PopoverImg src={imageUrl} imgStyle={{ width: 100, height: 100 }} />
              ) : (
                '未上传'
              )
            ) : (
              <UploadPro
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                setImgId={setImgId}
                callback={async (data: any) => {
                  const { url, id } = data;
                  await _createImg({
                    id: currentId,
                    tmpId: id,
                    type: '7',
                    permissionType: 1,
                  });
                }}
              />
            )}
            <Row className="bold mt20 mb20">驾校简介</Row>
            {isEdit ? (
              <Input.TextArea
                rows={4}
                value={schoolBriefValue}
                placeholder="驾校简介"
                onChange={(e) => {
                  setSchoolBriefValue(e.target.value);
                }}
              />
            ) : (
              <Row style={{ whiteSpace: 'pre-line' }} className="mt20 ml20 mr20">
                {schoolBriefValue}
              </Row>
            )}
          </>
        }
      />
    </div>
  );
}
