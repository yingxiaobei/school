import { useState } from 'react';
import { Upload, message, Button } from 'antd';
import { Auth, _get } from 'utils';
import { UploadOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';
import { AuthButton } from 'components';

interface IProps {
  imageUrl?: string;
  setImageUrl(imageUrl: any): void;
  callback?: Function;
  setImgId(imgId: any): void;
  disabled?: boolean;
  uploadTitle?: string;
  title?: string;
}
//支持图片和pdf上传
export default function InlineUploadFile(props: IProps) {
  const { imageUrl, setImageUrl, callback = () => {}, setImgId, disabled, uploadTitle = '点击上传', title } = props;
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
      // TODO: callback 这个时候 提示的时快的
      callback({ img: fileUrl, id: _get(info, 'file.response.data.id') });
    }

    if (info.file.status === 'error') {
      message.error('上传失败');
      setIsLoading(false);
    }
  }

  function beforeUpload(file: File) {
    const isValidFileType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
    const isValidSize = file.size / 1024 / 1024 < 10;

    if (!isValidFileType) {
      message.error('仅支持jpg/jpeg/png/bmp/gif/pdf格式的文件');
      return false;
    }

    if (!isValidSize) {
      message.error(`图片必须小于${10}M!`);
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
        <AuthButton
          authId="trainingInstitution/carInfo:btn16"
          className="operation-button"
          type="primary"
          ghost
          size="small"
          loading={isLoading}
          // icon={<UploadOutlined />}
        >
          上传附件
        </AuthButton>
      </Upload>
    </>
  );
}
