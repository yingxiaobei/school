import { useState } from 'react';
import { Upload, message, Button } from 'antd';
import { Auth, _get } from 'utils';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';
import styles from './index.module.css';
import { useVisible } from 'hooks';

interface IProps {
  imageUrl?: string;
  setImageUrl(imageUrl: any): void;
  callback?: Function;
  setImgId(imgId: any): void;
  disabled?: boolean;
  uploadTitle?: string;
  title?: string;
  setConfirmLoading: (loading: boolean) => void;
  maxSize?: number;
}
//仅支持pdf上传
export default function InlineUploadPdf(props: IProps) {
  const {
    imageUrl,
    setImageUrl,
    callback = () => {},
    setImgId,
    disabled,
    uploadTitle = '点击上传',
    title,
    setConfirmLoading,
    maxSize = 10,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';
  const [delVisible, setDelVisible] = useState(false);
  function handleChange(info: any) {
    if (info.file.status === 'uploading') {
      setIsLoading(true);
      setConfirmLoading(true);
    } else {
      setConfirmLoading(false);
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
    const isValidFileType = ['application/pdf'].includes(file.type);
    const isValidSize = file.size / 1024 / 1024 < maxSize;

    if (!isValidFileType) {
      message.error('仅支持pdf格式的文件');
      return false;
    }

    if (!isValidSize) {
      message.error(`文件必须小于${maxSize}M!`);
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
        <div className={styles['inlineUploadWrapper']}>
          <Button loading={isLoading} icon={<UploadOutlined />}>
            上传文件
          </Button>
          {imageUrl ? (
            <div
              onMouseEnter={() => {
                setDelVisible(true);
              }}
              onMouseLeave={() => {
                setDelVisible(false);
              }}
              className={styles['uploadContentWrapper']}
            >
              <span
                className="color-primary pointer"
                onClick={() => {
                  window.open(imageUrl);
                }}
              >
                {title}
              </span>
              {delVisible && (
                <span
                  title="删除"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageUrl('');
                    setImgId('');
                  }}
                  className={styles['del']}
                >
                  <DeleteOutlined />
                </span>
              )}
            </div>
          ) : null}
        </div>
      </Upload>
    </>
  );
}
