import { Modal, Upload, message } from 'antd';
import { Auth, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';
import { InboxOutlined } from '@ant-design/icons';

interface IProps {
  onCancel(): void;
  fileUrl: string;
  accept?: string;
  callback?: Function;
  typeLimit?: string;
}

export default function ImportFile(props: IProps) {
  const {
    onCancel,
    fileUrl,
    accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    callback,
    typeLimit = '',
  } = props;
  // 默认限制只能上传.xls、.xlsx文件
  // 导入
  const headers = { Accept: '*/*' };
  if (Auth.isAuthenticated()) {
    Object.assign(headers, {
      token: 'bearer' + Auth.get('token'),
      schoolId: Auth.get('schoolId'),
      username: Auth.get('username'),
      Authorization: 'bearer' + Auth.get('token'),
      companyId: Auth.get('companyId'),
      userId: Auth.get('userId'),
      sysId: 'ERP',
    });
  }

  let action = `${USER_CENTER_URL}${fileUrl}`;

  function _handleFileChange(info: any) {
    if (typeLimit && !_get(info, 'file.type').split(',').includes(accept) && _get(info, 'file.status') === 'done') {
      return message.error('文件类型错误！');
    }
    if (_get(info, 'file.response') && _get(info, 'file.response.code') !== 200) {
      message.error(_get(info, 'file.response.message'));
      return;
    }

    const { status } = _get(info, 'file');
    if (status !== 'uploading') {
    }
    if (status === 'done') {
      message.success(`${info.file.name}文件导入成功`);
      callback && callback();
    }
    if (status === 'error') {
      message.error(`${_get(info, 'file.response', '文件导入失败')}`);
    }
  }

  return (
    <>
      <Modal visible title={'导入文件'} onCancel={onCancel} footer={null}>
        <Upload.Dragger
          accept={accept}
          multiple={false}
          name="file"
          headers={headers}
          onChange={_handleFileChange}
          action={action}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击导入或拖拽文件到此区域</p>
          {typeLimit && <p className="ant-upload-text"> 请上传{typeLimit}格式文件</p>}
        </Upload.Dragger>
      </Modal>
    </>
  );
}
