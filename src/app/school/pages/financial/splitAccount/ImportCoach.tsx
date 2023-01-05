import { useState } from 'react';
import { Drawer, Button, Radio, message } from 'antd';
import { _getCoachImport } from './_api';
import { useVisible } from 'hooks';
import { Auth, _get, downloadURL } from 'utils';
import ImportFile from './ImportFile';
import ImportResult from './ImportResult';
import { PUBLIC_URL } from 'constants/env';

interface IProps {
  onCancel(): void;
  onOk(): void;
}

export default function ImportCoach(props: IProps) {
  const { onCancel, onOk } = props;
  const [handleType, setHandleType] = useState('0');
  const [visible, _switchVisible] = useVisible();
  const [ossid, setOssid] = useState('');
  const [resultData, setResultData] = useState({} as object);

  return (
    <>
      {visible && (
        <ImportResult
          onCancel={() => {
            _switchVisible();
            onCancel();
          }}
          resultData={resultData}
        />
      )}

      <Drawer
        destroyOnClose
        visible
        width={800}
        title={'分账教练导入'}
        onClose={onCancel}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={onCancel} className="mr20">
              取消
            </Button>
            <Button
              onClick={async () => {
                if (!ossid) {
                  message.error('请上传文件');
                  return;
                }

                const res = await _getCoachImport({ handleType, ossid });
                if (_get(res, 'code') === 200) {
                  setResultData(_get(res, 'data', {}));
                  _switchVisible();
                  onOk();
                }
              }}
              type="primary"
            >
              立即导入
            </Button>
          </div>
        }
      >
        <div>
          <div className="mt20">机构名称：{Auth.get('schoolName')}</div>
          <div className="mt20">
            文件模板：
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => downloadURL({ url: `${PUBLIC_URL}splitCount.xlsx`, filename: '分账模板下载' })}>
              分账模板下载
            </a>
          </div>
          <div className="mt20 flex">
            文件上传：
            <ImportFile setFileId={setOssid} />
          </div>
          <div className="mt20">
            重复数据处理：
            <Radio.Group
              onChange={(e) => {
                setHandleType(e.target.value);
              }}
              value={handleType}
            >
              <Radio value={'0'}>跳过</Radio>
              <Radio value={'1'}>替换</Radio>
            </Radio.Group>
          </div>
          <div className="color-primary mt20">注：单次导入教练人数不得超过100人。</div>
        </div>
      </Drawer>
    </>
  );
}
