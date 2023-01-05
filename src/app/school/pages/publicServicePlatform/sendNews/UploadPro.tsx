import { useState } from 'react';
import { Upload, message } from 'antd';
import { Auth, _get } from 'utils';
import { DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';
import { isEmpty } from 'lodash';
import { beforeUpload } from 'utils';

interface IProps {
  imgData?: object;
  setImgData(imgData: any): void;
}

export default function UploadPro(props: IProps) {
  const { imgData, setImgData } = props;
  const [isLoading, setIsLoading] = useState(false);
  const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

  function handleChange(info: any) {
    const isValidFileType = ['image/jpeg', 'image/png'].includes(info.file.type);
    const isValidSize = info.file.size / 1024 / 1024 < 10;
    if (!isValidFileType || !isValidSize) {
      return false;
    }

    if (info.file.status === 'uploading') {
      setIsLoading(true);
    }
    if (info.file.status === 'done') {
      setIsLoading(false);

      const fileData = _get(info, 'file.response.data');
      setImgData({
        tmpFileId: _get(fileData, 'id', ''),
        fileName: _get(fileData, 'fileName', ''),
        fileUrl: _get(fileData, 'url', ''),
      });
    }

    if (info.file.status === 'error') {
      message.error('上传失败');
      setIsLoading(false);
    }
  }

  return (
    <>
      <Upload
        headers={{
          token: Auth.get('token') as string,
          Authorization: 'bearer' + Auth.get('token'),
          username: Auth.get('username') as string,
          schoolId: Auth.get('schoolId') as string,
        }}
        listType="picture-card"
        className="avatar-uploader"
        action={action}
        beforeUpload={(file) => {
          beforeUpload(file, [], ['image/jpeg', 'image/png'], 10);
        }}
        showUploadList={false}
        onChange={handleChange}
      >
        {!isEmpty(imgData) ? (
          <img src={_get(imgData, 'fileUrl')} alt="" style={{ width: '100%', height: '100%' }} />
        ) : (
          <>
            {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div>{'点击上传'}</div>
          </>
        )}
      </Upload>
      {!isEmpty(imgData) && (
        <span onClick={() => setImgData({})} className="pointer">
          <DeleteOutlined />
        </span>
      )}
    </>
  );
}
