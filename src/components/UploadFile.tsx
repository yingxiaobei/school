import { useState } from 'react';
import { Upload, message, Button } from 'antd';
import { Auth, _get } from 'utils';
import { UploadOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';

interface IProps {
  imageUrl?: string;
  setImageUrl(imageUrl: any): void;
  callback?: Function;
  setImgId(imgId: any): void;
  disabled?: boolean;
  uploadTitle?: string;
  title?: string;
  maxSize?: number;
  fileType?: any;
  messageTip?: any;
}
//支持图片和pdf上传
export default function UploadFile(props: IProps) {
  const {
    imageUrl,
    setImageUrl,
    callback = () => {},
    setImgId,
    disabled,
    uploadTitle = '点击上传',
    title,
    maxSize = 20,
    fileType = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'application/pdf'],
    messageTip = '仅支持jpg/jpeg/png/bmp/gif/pdf格式的文件',
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

  function handleChange(info: any) {
    if (info.file.status === 'uploading') {
      setIsLoading(true);
    }

    if (info.file.status === 'done') {
      message.success('上传成功');
      setIsLoading(false);
      const fileUrl = _get(info, 'file.response.data.url');
      setImageUrl(fileUrl);
      setImgId && setImgId(_get(info, 'file.response.data.id'));
      callback({ img: fileUrl, id: _get(info, 'file.response.data.id') });
    }

    if (info.file.status === 'error') {
      message.error('上传失败');
      setIsLoading(false);
    }
  }

  function beforeUpload(file: File) {
    const isValidFileType = fileType.includes(file.type);
    const isValidSize = file.size / 1024 / 1024 < maxSize;

    if (!isValidFileType) {
      message.error(messageTip);
      return false;
    }

    if (!isValidSize) {
      message.error(`图片必须小于${maxSize}M!`);
      return false;
    }
    return true;
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
        showUploadList={false}
        action={action}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        disabled={isLoading || disabled}
      >
        {
          <>
            {imageUrl ? (
              <div className="mb10" style={{ marginTop: 6 }}>
                <span
                  className="color-primary pointer"
                  onClick={() => {
                    window.open(imageUrl);
                  }}
                >
                  {title}
                </span>
              </div>
            ) : (
              <div className="mb10" style={{ marginTop: 6, visibility: 'hidden' }}>
                <span className="color-primary pointer"> {title}</span>
              </div>
            )}
            {/* {isLoading ? <LoadingOutlined /> : <PlusOutlined />} */}
            <Button loading={isLoading} icon={<UploadOutlined />}>
              上传文件
            </Button>
          </>
        }
      </Upload>
    </>
  );
}
