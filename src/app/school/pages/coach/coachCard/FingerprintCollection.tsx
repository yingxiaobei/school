/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, CSSProperties } from 'react';
import { Button, message, Modal, Alert } from 'antd';
import { _saveCoaFingerTemplate, _getCoaFingerTemplate } from './_api';
import { isEmpty } from 'lodash';
import { useFetch, useRequest, useVisible } from 'hooks';
import { _connectDevice, _fingerprintCollection, _getFingerprint, _get } from 'utils';
import IMG_MAP from 'statics/images/Fingerprint_map.png';
import IMG_IDENTIFY from 'statics/images/Fingerprint_identification.png';
import IMG_SUCCESS from 'statics/images/Fingerprint_success.png';
import { IF, Loading } from 'components';
import { isForceUpdatePlugin } from 'utils';
import { UpdatePlugin } from 'components';

const commonStyle1: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #d1cccc',
  padding: 5,
  width: 130,
  height: 130,
};

const commonStyle2: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' };

const imgSize: CSSProperties = {
  width: 100,
  height: 100,
};

interface IFingerprintCollection {
  onOk(): void;
  onCancel(): void;
  currentRecord: object | null;
}

export default function FingerprintCollection(props: IFingerprintCollection) {
  const { onCancel, onOk, currentRecord } = props;
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [imgStatus1, setImgStatus1] = useState(IMG_MAP);
  const [imgStatus2, setImgStatus2] = useState(IMG_MAP);
  const [fingerData1, setFingerData1] = useState({});
  const [fingerData2, setFingerData2] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [btnsLoading, setBtnsLoading] = useState({
    btn1: false,
    btn2: false,
  });
  const [isCollect, setIsCollect] = useState(false);
  const [btnNum, setBtnNum] = useState('');
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();

  const { isLoading } = useFetch({
    request: _getCoaFingerTemplate,
    query: { cid: _get(currentRecord, 'cid', '') },
    callback: (data) => {
      console.log(data);
      if (_get(data, 'length', 0) === 0) {
        return;
      }
      if (_get(data, 'length', 0) === 1) {
        if (_get(data, '0.fgcode', '') === '1') {
          setFingerData1(_get(data, '0', {}));
          setText1('已采集');
          setImgStatus1(IMG_SUCCESS);
        }
        if (_get(data, '0.fgcode', '') === '2') {
          setFingerData2(_get(data, '0', {}));
          setText2('已采集');
          setImgStatus2(IMG_SUCCESS);
        }
      }
      if (_get(data, 'length', 0) > 1) {
        setText1('已采集');
        setText2('已采集');
        setImgStatus1(IMG_SUCCESS);
        setImgStatus2(IMG_SUCCESS);
        if (_get(data, '0.fgcode', '') === '1') {
          setFingerData1(_get(data, '0', {}));
          setFingerData2(_get(data, '1', {}));
        }
        if (_get(data, '0.fgcode', '') === '2') {
          setFingerData2(_get(data, '0', {}));
          setFingerData1(_get(data, '1', {}));
        }
      }
    },
  });

  useEffect(() => {
    const fingerprintCollection = async (signal: any) => {
      const update: any = await isForceUpdatePlugin();
      if (update) {
        setDisabled(false);
        setBtnsLoading({
          btn1: false,
          btn2: false,
        });
        return setUpdatePluginVisible();
      }
      const openDevice = await _connectDevice(signal);
      if (_get(openDevice, 'error')) {
        setIsCollect(false);
        if (_get(_get(openDevice, 'error', {}), 'message', '').includes('aborted')) {
          return;
        }
        setDisabled(false);
        setBtnsLoading({
          btn1: false,
          btn2: false,
        });
        return message.error('请确认插件是否开启或已下载最新插件');
      }
      if (_get(openDevice, 'return') === 0) {
        if (btnNum === '1') {
          setText1('采集中');
          setImgStatus1(IMG_IDENTIFY);
        } else {
          setText2('采集中');
          setImgStatus2(IMG_IDENTIFY);
        }
        const collectResult = await _fingerprintCollection(signal);
        if (_get(_get(collectResult, 'error', {}), 'message', '').includes('aborted')) {
          return;
        }
        if (_get(collectResult, 'return') === 0) {
          const res = await _getFingerprint();
          setDisabled(false);
          setIsCollect(false);
          if (_get(res, 'return', '') === 0) {
            const templateString = _get(res, 'data', '');
            const templateArr = templateString.split('|');
            const zwpf = _get(templateArr, '0', '');
            const zwmb = _get(templateArr, '1', '');
            const zwcd = _get(templateArr, '1.length', '');
            if (btnNum === '1') {
              setImgStatus1(IMG_SUCCESS);
              setText1('已采集');
              setFingerData1({ cid: _get(currentRecord, 'cid', ''), zwmb, zwpf, zwcd, fgcode: btnNum });
            } else {
              setImgStatus2(IMG_SUCCESS);
              setText2('已采集');

              setFingerData2({ cid: _get(currentRecord, 'cid', ''), zwmb, zwpf, zwcd, fgcode: btnNum });
            }

            setBtnsLoading({
              btn1: false,
              btn2: false,
            });
          }
        } else {
          setIsCollect(false);
          if (btnNum === '1') {
            setText1('');
            setImgStatus1(IMG_MAP);
          } else {
            setText2('');
            setImgStatus2(IMG_MAP);
          }
          setDisabled(false);
          setBtnsLoading({
            btn1: false,
            btn2: false,
          });
          return message.error('指纹模板采集质量不符合要求,请重新采集');
        }
      } else {
        setIsCollect(false);
        setDisabled(false);
        setBtnsLoading({
          btn1: false,
          btn2: false,
        });
        return message.error('请确认指纹采集设备已连接');
      }
    };
    const abortController: any = new AbortController();
    if (isCollect) {
      fingerprintCollection(abortController.signal);
    }

    return () => {
      abortController && abortController.abort();
    };
  }, [isCollect]);

  const { loading: btnLoading, run } = useRequest(_saveCoaFingerTemplate, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      width={600}
      title={'指纹管理'}
      maskClosable={false}
      confirmLoading={btnLoading}
      onCancel={onCancel}
      onOk={async () => {
        if (isEmpty(fingerData1) && isEmpty(fingerData2)) {
          return message.error('请采集指纹');
        }
        if (isEmpty(fingerData1)) {
          return message.error('请采集指纹1');
        }
        if (isEmpty(fingerData2)) {
          return message.error('请采集指纹2');
        }
        let query = {};
        if (!isEmpty(fingerData1) && !isEmpty(fingerData2)) {
          query = { coaFingerTemplateDtos: [fingerData1, fingerData2] };
        } else {
          if (!isEmpty(fingerData1)) {
            query = { coaFingerTemplateDtos: [fingerData1] };
          }
          if (!isEmpty(fingerData2)) {
            query = { coaFingerTemplateDtos: [fingerData2] };
          }
        }
        run(query);
      }}
    >
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法进行指纹采集" />}
      <Alert
        message={
          <span style={{ color: '#faad14' }}>
            采集指纹过程中，请勿关闭页面，待一个指纹采集完成，再进行另一个指纹采集
          </span>
        }
        type="warning"
        className="mb20  text-center"
      />
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={commonStyle2}>
              <div style={commonStyle1}>
                <img src={imgStatus1} style={imgSize} alt="" />
                <span style={{ alignSelf: 'flex-end', fontWeight: 'bold' }}>{text1}</span>
              </div>

              <span className="ml10 mr10 mt10 mb10 bold">指纹1</span>
              <Button
                onClick={() => {
                  setDisabled(true);
                  setBtnsLoading({
                    btn1: true,
                    btn2: false,
                  });

                  setIsCollect(true);
                  setBtnNum('1');
                }}
                disabled={disabled}
                loading={btnsLoading.btn1}
              >
                采集1
              </Button>
            </div>
            <div style={commonStyle2}>
              <div style={commonStyle1}>
                <img src={imgStatus2} style={imgSize} alt="" />
                <span style={{ alignSelf: 'flex-end', fontWeight: 'bold' }}>{text2}</span>
              </div>
              <span className="ml10 mr10 mt10 mb10 bold">指纹2</span>
              <Button
                onClick={() => {
                  setDisabled(true);
                  setBtnsLoading({
                    btn1: false,
                    btn2: true,
                  });
                  setIsCollect(true);
                  setBtnNum('2');
                }}
                disabled={disabled}
                loading={btnsLoading.btn2}
              >
                采集2
              </Button>
            </div>
          </div>
        }
      />
    </Modal>
  );
}
