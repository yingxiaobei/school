import { useState, useEffect } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Auth, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';

export default function ImportFile(props: any) {
  const { fileList = [], setFileList } = props;
  function beforeUpload(file: any) {
    const a = _get(fileList, 'length', 0);
    if (a + 1 > 10) {
      message.error('文件上传数量超过限制');
      return false;
    }
    const isValidFileType = /\.(rar|zip|doc|docx|pdf)$/.test(file.name);
    //.rar .zip .doc .docx .pdf
    const isValidSize = file.size / 1024 / 1024 < 20;

    if (!isValidFileType) {
      message.error('上传文件格式不对!');
      return false;
    }

    if (!isValidSize) {
      message.error(`图片必须小于${20}M!`);
      return false;
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
        fileList={fileList}
        maxCount={10}
        beforeUpload={beforeUpload}
        onChange={(info: any) => {
          const isValidFileType = /\.(rar|zip|doc|docx|pdf)$/.test(info.file.name);
          //.rar .zip .doc .docx .pdf
          const isValidSize = info.file.size / 1024 / 1024 < 20;
          if (!isValidFileType || !isValidSize) {
            return;
          }
          if (info.file.status === 'error') {
            return message.error(`${info.file.name} 文件上传失败`);
          }
          let fileList1 = [...info.fileList];
          if (info.file.status !== 'uploading') {
          }
          if (info.file.status === 'done') {
            console.log('aaaaa');
            console.log('info', info);
            message.success(`${info.file.name} 文件上传成功`);
          }
          fileList1 = fileList1.map((file) => {
            if (file.response) {
              return {
                url: _get(file, 'response.data.url', ''),
                uid: _get(file, 'response.data.id', ''),
                name: _get(file, 'response.data.fileName', ''),
                osskey: '',
              };
            }
            return file;
          });
          setFileList([...fileList1]);
        }}
      >
        <Button icon={<UploadOutlined />}>上传文件</Button>
      </Upload>
    </div>
  );
}
