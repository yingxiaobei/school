import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Auth, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';

export default function ImportFile(props: any) {
  const { setFileId } = props;

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
        onRemove={() => {
          setFileId('');
        }}
      >
        <Button icon={<UploadOutlined />}>上传文件</Button>
      </Upload>
    </div>
  );
}
