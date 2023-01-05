import { Upload } from 'antd';
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
}

const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

export default function MultipleUpload(props: IProps) {
  const { fileList = [], setFileList, limit = 100, callback = () => {}, onRemove = () => {} } = props;

  return (
    <Upload
      accept={'.jpg,.png,.bmp,.gif,.jpeg'}
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
        beforeUpload(file, fileList, ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'], 10, true)
      }
      onChange={(obj) => {
        const foo = _get(obj, 'fileList', []).map((x: any) => {
          return x.name
            ? { id: _get(x, 'response.data.id'), url: _get(x, 'response.data.url') }
            : { id: _get(x, 'id', ''), url: _get(x, 'url') };
        });
        setFileList(foo);
        if (_get(obj, 'file.status', '') === 'done') {
          const url = _get(obj, 'file.response.data.url');
          callback({ url, id: _get(obj, 'file.response.data.id') });
        }
      }}
      onRemove={(obj) => {
        onRemove({ id: _get(obj, 'id') });
      }}
      showUploadList={{ showPreviewIcon: false }}
      defaultFileList={[...fileList.map((x: any) => ({ ...x, uid: Math.random() }))]}
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
