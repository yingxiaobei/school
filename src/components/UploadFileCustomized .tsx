import { useState } from 'react';
import { Upload, message, Button, Modal } from 'antd';
import { Auth, _get } from 'utils';
import { CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;
interface IProps {
  imageUrl?: string;
  setImageUrl(imageUrl: any): void;
  callback?: Function;
  setImgId(imgId: any): void;
  disabled?: boolean;
  uploadTitle?: string;
  title?: string;
  typeRule: {
    rule: string[];
    message: string;
    size: number;
  };
  layout?: string;
}
//支持图片和pdf上传
export default function UploadFileCustomized(props: IProps) {
  const {
    imageUrl,
    setImageUrl,
    callback = () => {},
    setImgId,
    disabled,
    uploadTitle = '点击上传',
    title,
    typeRule,
    layout = 'ver',
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
    const isValidFileType = typeRule.rule.includes(file.type);
    const isValidSize = file.size / 1024 / 1024 < typeRule.size;

    if (!isValidFileType) {
      message.error(typeRule.message);
      return false;
    }

    if (!isValidSize) {
      message.error(`图片必须小于${typeRule.size}M!`);
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
          <div className={layout !== 'ver' ? 'flex' : ''}>
            {imageUrl ? (
              <div className={layout === 'ver' ? 'mb10' : 'mr10'} style={{ marginTop: 6 }}>
                <span
                  className="color-primary pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(imageUrl);
                  }}
                >
                  {title}
                </span>
                {/* todo 暂时隐藏 便于后续 功能添加 */}
                {/* <span
                  className="ml10 pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirm({
                      title: '确认删除?',
                      icon: <ExclamationCircleOutlined />,
                      okType: 'danger',
                      onOk() {
                        setImgId('');
                        setImageUrl('');
                      },
                      onCancel() {
                        console.log('Cancel');
                      },
                    });
                  }}
                >
                  <CloseCircleOutlined />
                </span> */}
              </div>
            ) : (
              <div className={layout === 'ver' ? 'mb10' : 'mr10'} style={{ marginTop: 6, visibility: 'hidden' }}>
                <span className="color-primary pointer"> {title}</span>
              </div>
            )}
            {/* {isLoading ? <LoadingOutlined /> : <PlusOutlined />} */}
            <Button loading={isLoading} icon={<UploadOutlined />}>
              上传文件
            </Button>
          </div>
        }
      </Upload>
    </>
  );
}
