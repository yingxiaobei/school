import { Button, Modal, Upload, message } from 'antd';
import React from 'react';
import { USER_CENTER_URL } from 'constants/env';
import { _get, downloadFile } from 'utils';
import { InboxOutlined } from '@ant-design/icons';
import { _importExcel, _downloadTemplate } from '../_api';
import { useVisible } from 'hooks';

const { Dragger } = Upload;

interface IProps {
  visible: boolean;
  onCancel: () => void;
}

const ImportModal = (props: IProps) => {
  const { visible, onCancel } = props;
  const [load, setLoad] = useVisible();
  const prop = {
    name: 'file',
    multiple: true,
    customRequest(info: any) {
      let formDate = new FormData();
      formDate.append('file', info.file);
      console.log(info, 'info');
      _importExcel(formDate).then((res: any) => {
        if (res && res.code === 200) {
          info.onSuccess();
          message.info(res.message);
          onCancel();
        } else {
          info.onError();
          message.error(res.message);
        }
      });
    },
    onDrop(e: any) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
  return (
    <Modal title="导入" visible={visible} onCancel={onCancel}>
      <Button
        className="mb10"
        loading={load}
        onClick={() => {
          setLoad();
          _downloadTemplate({}).then((res) => {
            setLoad();
            downloadFile(res, '下载模板', 'application/vnd.ms-excel', 'xlsx');
          });
        }}
      >
        下载模板
      </Button>
      <Dragger {...prop}>
        <p className="ant-upload-text">点击导入或拖拽文件到此区域</p>
        <p className="ant-upload-hint">仅支持.2003版本xls文件类型</p>
      </Dragger>
    </Modal>
  );
};
export default ImportModal;
