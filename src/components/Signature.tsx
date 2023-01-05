/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import {
  _openHanDev,
  _initHanDev,
  _closeHanDev,
  _getSign,
  _clearDev,
  _quitHWProc,
  _getConfirm,
  base64ConvertFile,
} from 'utils';
import { _uploadImg } from 'api';
import { useInterval, useVisible } from 'hooks';
import { PUBLIC_URL } from 'constants/env';
import { isForceUpdatePlugin, _get } from 'utils';
import { UpdatePlugin } from 'components';
interface TProps {
  onCancel(): void;
  onOk(result?: object): void;
}

export default function Signature(props: TProps) {
  const { onCancel, onOk } = props;
  const [sign, setSign] = useState('');
  const [delay, setDelay] = useState(0);
  const [visible, _switchVisible] = useVisible();
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const [loading, setLoading] = useState(false);

  const getSign = async () => {
    const res = await _getSign();
    if (_get(res, 'return', '') !== -1) {
      setSign(_get(res, 'result', ''));
      const res2 = await _getConfirm();
      if (_get(res2, 'return', '') === 0) {
        setDelay(0);
      }
    } else {
      message.error('请确认写字板是否连接');
    }
  };
  const closeDev = async () => {
    await _closeHanDev();
    await _quitHWProc();
  };

  useInterval(getSign, delay); //轮训获取写字板上的签字

  useEffect(() => {
    async function openDev() {
      const update: any = await isForceUpdatePlugin();
      if (update) {
        return setUpdatePluginVisible();
      }
      const res = await _openHanDev();
      if (_get(res, 'result', '') === false) {
        _switchVisible(); //新增没有签字版的弹框
        return;
      }
      if (_get(res, 'return', '') !== -1) {
        const res2 = await _initHanDev();
        if (_get(res2, 'return', '') === 0) {
          await getSign();
          setDelay(800);
        } else {
          message.error('请确认写字板是否连接');
        }
      } else {
        message.error('请确认写字板是否连接');
      }
    }
    openDev();
  }, []);

  return (
    <Modal
      visible
      width={630}
      style={{ minWidth: 630 }}
      title={'签字板'}
      maskClosable={false}
      onCancel={() => {
        setDelay(0);
        closeDev();
        onCancel();
      }}
      confirmLoading={loading}
      onOk={async () => {
        if (!sign) {
          return message.error('未获取到签名');
        }
        setDelay(0);
        await _clearDev();
        setLoading(true);
        const file = base64ConvertFile(sign);
        let formData = new FormData();
        formData.append('file', file);
        const imgRes = await _uploadImg(formData); // 上传
        // setSignImgId(get(imgRes, 'data.id', ''));
        // setSignImgUrl(get(imgRes, 'data.url', ''));
        closeDev();
        onOk(imgRes);
        setLoading(false);
      }}
    >
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法在线签字" />}
      {visible && (
        <Modal
          width={630}
          maskClosable={false}
          title={'无法在线签字'}
          visible
          footer={null}
          onCancel={() => {
            _switchVisible();
            onCancel();
          }}
        >
          <p>如您已安装，请启动签字版程序，再使用本功能</p>
          <p>
            如您未安装，请
            <span
              className="color-primary pointer"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `${PUBLIC_URL}package.zip`;
                link.download = 'package.zip';
                link.click();
              }}
            >
              点击下载
            </span>
            ，安装并启动程序后，再使用本功能
          </p>
        </Modal>
      )}
      <div style={{ height: 300 }}>
        <img src={sign} alt="" />
      </div>
    </Modal>
  );
}
