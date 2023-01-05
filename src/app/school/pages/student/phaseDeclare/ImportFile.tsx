import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Auth, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';

export default function ImportFile(props: any) {
  const { hasFileId, fileId, setFileId } = props;
  function beforeUpload(file: any) {
    const isValidFileType = /\.(jpg|jpeg|png|pdf)$/.test(file.name);

    const isValidSize = file.size / 1024 / 1024 < 10;

    if (!isValidFileType) {
      message.error('上传文件格式不对!');
      return false || Upload.LIST_IGNORE;
    }

    if (!isValidSize) {
      message.error(`图片必须小于${10}M!`);
      return false || Upload.LIST_IGNORE;
    }
    return true;
  }

  return (
    <div>
      <Upload
        name={'file'}
        action={USER_CENTER_URL + '/api/video-face/tmpFile/upload'}
        headers={{
          token: Auth.get('token') as string,
          Authorization: 'bearer' + Auth.get('token'),
          username: Auth.get('username') as string,
          schoolId: Auth.get('schoolId') as string,
        }}
        maxCount={1}
        beforeUpload={beforeUpload}
        onChange={(info: any) => {
          if (info.file.status !== 'uploading') {
          }
          if (info.file.status === 'done') {
            message.success(`${info.file.name} 文件上传成功`);
            setFileId(_get(info, 'file.response.data.id', ''));
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败`);
          }
        }}
      >
        {hasFileId ? (
          <>
            <Button icon={<UploadOutlined />}>重新上传</Button>
            {!fileId && <div>{hasFileId}</div>}
          </>
        ) : (
          <Button icon={<UploadOutlined />}>上传文件</Button>
        )}
      </Upload>
    </div>
  );
}
