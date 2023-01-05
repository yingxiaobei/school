import { useEffect, useState, useRef } from 'react';
import { Modal, Row, Button } from 'antd';
import { _get } from 'utils';
import ReactPlayer from 'react-player';
import { _carControl, _getVideoViewCar, _carTalkControl } from 'utils';
import { IF, Loading } from 'components';
import { useForceUpdate, useVisible } from 'hooks';
import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom';
import { FullscreenOutlined } from '@ant-design/icons';

export default function CarVideo(props) {
  const { onCancel, currentData, isNvr = false } = props;

  const playerRef = useRef(null);
  const [videoAddress, setVideoAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [ignore, forceUpdate] = useForceUpdate();

  const [record, setRecord] = useState();
  const [ws, setWs] = useState();

  useEffect(() => {
    async function getVideoSrc() {
      const query = {
        CarLicence: _get(currentData, 'licnum', ''),
        status: 'enable',
        mode: 'rtsp',
        ip: _get(currentData, 'ipc_ip', ''),
        user: _get(currentData, 'nvr_account', ''),
        code: _get(currentData, 'nvr_pwd', ''),
        channel: _get(currentData, 'nvr_channel', ''),
        port: _get(currentData, 'ipc_port', ''),
      };
      const data = await _getVideoViewCar(query);
      setIsLoading(false);
      // if (_get(data, 'error', '')) {
      //   return setUpdatePluginVisible();
      // }
      setVideoAddress(_get(data, 'VideoAddress', ''));
    }
    getVideoSrc();
  }, [currentData]);

  return (
    <Modal
      visible
      width={700}
      maskClosable={false}
      onCancel={async () => {
        record && record.stop();
        if (ws) {
          ws.close();
          console.log('关闭对讲以及WebSocket');
        }
        const query = {
          CarLicence: _get(currentData, 'licnum', ''),
          status: 'disable', //调用接口 关闭视频
          mode: 'rtsp',
          ip: _get(currentData, 'ipc_ip', ''),
          user: _get(currentData, 'nvr_account', ''),
          code: _get(currentData, 'nvr_pwd', ''),
          channel: _get(currentData, 'nvr_channel', ''),
          port: _get(currentData, 'ipc_port', ''),
        };

        await _getVideoViewCar(query);
        await _carTalkControl({ CarLicence: _get(currentData, 'licnum', ''), VoiceTalk: '0' });
        onCancel();
      }}
      title={'车载画面'}
      footer={null}
    >
      {/* {updatePluginVisible && (
        <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法获取视频资源" plugin="robotcoach_package.zip" />
      )} */}
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div>
            <div style={{ position: 'relative' }}>
              <ReactPlayer
                ref={playerRef}
                key={ignore}
                playing
                style={{ background: 'black' }}
                className="mb10"
                url={videoAddress}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                    },
                  },
                }}
                onError={() => {
                  console.log('error');
                  forceUpdate(); //报错后刷新，防止监控视频出现转圈卡顿
                }}
              />

              <span
                style={{ cursor: 'pointer', position: 'absolute', bottom: '10px', right: '20px', color: 'white' }}
                onClick={() => {
                  screenfull.request(findDOMNode(playerRef.current));
                }}
              >
                <FullscreenOutlined style={{ marginTop: 5 }} />
                全屏
              </span>
            </div>

            {!isNvr && (
              <Row style={{ display: 'flex' }} className="mt20">
                <div style={{ flex: 1 }}>
                  <Row>登录账号：{_get(currentData, 'nvr_account', '')}</Row>
                  <Row>
                    <span>车牌号：{_get(currentData, 'licnum', '')}</span>
                    <span className="ml20">训练时长：{_get(currentData, 'trainTime', '0')}分钟</span>
                  </Row>
                  <Row>
                    <span>车辆状态：{_get(currentData, 'Status', '')}</span>
                    <span className="ml20">车辆速度：{_get(currentData, 'GPS.Speed', '0')}km/h</span>
                  </Row>
                </div>
                <div style={{ alignSelf: 'center' }}>
                  <Button
                    onClick={async () => {
                      // audioUtil(currentData, (rec, ws) => {
                      //   setRecord(rec);
                      //   setWs(ws);
                      // });
                    }}
                  >
                    远程通话
                  </Button>
                  <Button
                    className="ml20"
                    onClick={async () => {
                      const res = await _carControl({
                        CarLicence: _get(currentData, 'licnum', ''),
                        ControlType: '1',
                        status: '1',
                      });
                      console.log(res);
                    }}
                  >
                    远程刹车
                  </Button>
                </div>
              </Row>
            )}
          </div>
        }
      />
    </Modal>
  );
}
