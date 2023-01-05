import { message, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Auth, beforeUpload, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';
import { UploadFile } from 'antd/lib/upload/interface';

interface IProps {
  fileList: UploadFile[];
  setFileList(fileList: any): void;
  limit?: number;
  callback?: Function;
  onRemove?: Function;
  disabled?: boolean;

  setConfirmLoading: (loading: boolean) => void;
}

const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

export default function MultipleUpload(props: IProps) {
  const {
    fileList = [],
    setFileList,
    limit = 100,
    callback = () => {},
    onRemove = () => {},
    disabled = false,
    setConfirmLoading,
  } = props;
  return (
    <Upload
      disabled={disabled}
      multiple
      maxCount={limit}
      accept={'.jpg,.png,.jpeg'}
      headers={{
        token: Auth.get('token') as string,
        Authorization: 'bearer' + Auth.get('token'),
        username: Auth.get('username') as string,
        schoolId: Auth.get('schoolId') as string,
      }}
      action={action}
      listType="picture-card"
      onPreview={() => {
        return;
      }}
      beforeUpload={(file, fileList) =>
        beforeUpload(file, fileList, ['image/jpeg', 'image/png', 'image/jpg'], 10, true)
      }
      onChange={({ fileList, file }) => {
        if (file.status === 'uploading') {
          setConfirmLoading(true);
        } else {
          setConfirmLoading(false);
        }

        if (file.status === 'error') {
          message.error('上传失败');
        }

        if (file.status === 'done') {
          const code = _get(file, ['response', 'code']);
          if (code !== 200) {
            message.error(_get(file, ['response', 'message']));
            const tempFiles = [...fileList];
            tempFiles.pop();
            setFileList(tempFiles);
            return;
          }
        }
        setFileList(
          fileList.map((file) => {
            if (file.status === 'error') {
              file.error = '上传错误';
              return file;
            } else {
              return file;
            }
          }),
        );
      }}
      onRemove={(obj) => {
        onRemove({ id: _get(obj, 'id') });
      }}
      showUploadList={{ showPreviewIcon: false }}
      fileList={fileList}
      // defaultFileList={[...fileList.map((x: any) => ({ ...x, uid: Math.random() }))]}
    >
      {limit > _get(fileList, 'length') && (
        <>
          <PlusOutlined />
          <div>点击上传</div>
        </>
      )}
    </Upload>
  );
}
