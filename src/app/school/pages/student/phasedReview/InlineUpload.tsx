import { Upload, message, Button } from 'antd';
import { Auth, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';

interface IProps {
  callback?: ({ img, id }: { img: string; id: string }) => void;
  insertWhen?: boolean;
  setImgId?(imgId: any): void;
  title?: string;
  typeRule: {
    rule: string[];
    message: string;
    size: number;
  };
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  currentKey: string;
  uploadKey: string;
}
//支持图片和pdf上传
function InlineUpload(props: IProps) {
  const {
    callback = () => {},
    setImgId,
    typeRule,
    insertWhen = true,
    setUploading,
    uploading,
    currentKey,
    uploadKey,
  } = props;
  const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

  function handleChange(info: any) {
    if (info.file.status === 'uploading') {
      setUploading(true);
    }

    if (info.file.status === 'done') {
      // message.success('上传成功');
      // setIsLoading(false);
      const fileUrl = _get(info, 'file.response.data.url');
      // setImageUrl(fileUrl);
      setImgId && setImgId(_get(info, 'file.response.data.id'));
      callback({ img: fileUrl, id: _get(info, 'file.response.data.id') });
    }

    if (info.file.status === 'error') {
      message.error('上传失败');
      setUploading(false);
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
      >
        <Button
          type="primary"
          ghost
          size="small"
          className="operation-button"
          loading={uploading && currentKey === uploadKey}
        >
          上传学时证明
        </Button>
      </Upload>
    </>
  );
}

export default InlineUpload;
