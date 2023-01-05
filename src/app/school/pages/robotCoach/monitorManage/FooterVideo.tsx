import { Spin, message } from 'antd';
import ReactPlayer from 'react-player';
import closeMic from 'statics/images/robotCoach/closeMic.png';
import closeVoice from 'statics/images/robotCoach/closeVoice.png';
import openMic from 'statics/images/robotCoach/openMic.png';
import openVoice from 'statics/images/robotCoach/openVoice.png';
import audio from 'statics/images/robotCoach/audio.png';
import HangUp from 'statics/images/robotCoach/HangUp.png';
import brake from 'statics/images/robotCoach/brake.png';
import close_small from 'statics/images/robotCoach/close_small.png';
import close from 'statics/images/robotCoach/close.png';
import bg from 'statics/images/robotCoach/bg.png';
import { _carControl, _carTalkControl, _get, _getVideoViewCar } from 'utils';
import { audioUtil } from './audioUtil';
import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom';
import { FullscreenOutlined, SyncOutlined } from '@ant-design/icons';
import loading from 'statics/images/robotCoach/loading.png';
import refresh from 'statics/images/robotCoach/refresh.png';
import right from 'statics/images/robotCoach/right.png';
import left from 'statics/images/robotCoach/left.png';
import call from 'statics/images/robotCoach/call.png';
import { handleSeletedData, commonAudioFun, VIDEO_MAX_COUNT } from './utils/commonUtils';
import { useForceUpdate } from 'hooks';
import { useEffect } from 'react';

const commonWidth = 500;
const commonHeight = 225;
const iconWidth = 40;

export default function FooterVideo(props: any) {
  const { setVisible, wsArray, recArray, listData = [], setListData, state, dispatch } = props;

  //绿色接听或呼出按钮
  const showAudioImg = (item: any) => {
    if (_get(item, 'spinning', false)) {
      //呼入中显示
      return true;
    }
    if (_get(item, 'busy', false)) {
      //忙线不显示挂断
      return false;
    }
    if (_get(item, 'video', false) && !_get(item, 'audio', false)) {
      //仅接通视频，默认显示绿钮
      return true;
    }
    if (_get(item, 'video', false) && _get(item, 'audio', false)) {
      //视频和语音都接通，隐藏绿钮，显示挂断
      return false;
    }
    return true;
  };
  //挂断按钮
  const showHangUpImg = (item: any) => {
    if (_get(item, 'hangUpFromBrowser', false)) {
      //终端挂断不显示挂断
      return false;
    }
    if (_get(item, 'hangUpFromCar', false)) {
      //终端挂断不显示挂断
      return false;
    }
    if (_get(item, 'callInTimeout', false)) {
      //超时不显示挂断
      return false;
    }
    if (!_get(item, 'audio', false) && _get(item, 'busy', false)) {
      //忙线不显示挂断
      return false;
    }
    if (_get(item, 'spinning', false)) {
      //呼入中显示
      return true;
    }
    if (_get(item, 'video', false) && !_get(item, 'audio', false)) {
      //仅接通视频，不显示挂断
      return false;
    }
    if (_get(item, 'video', false) && _get(item, 'audio', false)) {
      //视频和语音都接通，隐藏绿钮，显示挂断
      return true;
    }
    return false;
  };

  const hangUp = async (x: any, isClose: boolean = false) => {
    //挂断
    if (wsArray[x.id]) {
      wsArray[x.id].close();
      recArray[x.id].stop();
      console.log('关闭对讲以及WebSocket');
    }

    if (isClose) {
      //是否关闭
      // const selected = _get(state, 'selected', []).filter((item: any) => {
      //   return !(x.licnum === item.licnum);
      // });
      // setSelectedData(selected);

      if (x.player) {
        x.player.destroy();
      }
      dispatch({
        type: 'mapWithCondition',
        payLoad: { player: null },
        licnum: x.licnum,
      });
      dispatch({
        type: 'filterSet',
        licnum: x.licnum,
      });

      const newData = listData.map((item: any) => {
        if (x.licnum === item.licnum) {
          return {
            ...item,
            audio: false,
            video: false,
            spinning: false,
            callInTimeout: false,
            hangUpFromCar: false,
            hangUpFromBrowser: false,
            // busy: false,
          };
        }
        return item;
      });
      setListData(newData);

      const query = {
        CarLicence: _get(x, 'licnum', ''),
        status: 'disable', //调用接口 关闭视频
        mode: 'rtsp',
        ip: _get(x, 'ipc_ip', ''),
        user: _get(x, 'nvr_account', ''),
        code: _get(x, 'nvr_pwd', ''),
        channel: _get(x, 'nvr_channel', ''),
        port: _get(x, 'ipc_port', ''),
      };

      await _getVideoViewCar(query);
    } else {
      //修改底部数据
      handleSeletedData({
        item: x,
        videoAddress: _get(x, 'videoAddress', ''),
        spinning: false,
        callInTimeout: false,
        hangUpFromCar: false,
        hangUpFromBrowser: false,
        busy: false,
        audio: false,
        video: true,
        isPush: false,
        setVisible,
        state,
        dispatch,
      });
    }
    if (x.audio || x.spinning) {
      //语音已接通或有语音呼入
      await _carTalkControl({ CarLicence: _get(x, 'licnum', ''), VoiceTalk: x.audio ? '2' : '0' });
    }
    const newData = listData.map((item: any) => {
      if (x.licnum === item.licnum) {
        return {
          ...item,
          audio: false,
          video: !isClose,
          spinning: false,
          callInTimeout: false,
          hangUpFromCar: false,
          hangUpFromBrowser: false,
          busy: _get(item, 'busy', false),
        };
      }
      return item;
    });
    setListData(newData); //修改左边列表数据
  };

  const [ignore, forceUpdate] = useForceUpdate();

  function sleep(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function refreshVideo(item: any) {
    const query = {
      CarLicence: _get(item, 'licnum', ''),
      status: 'enable',
      mode: 'rtsp',
      ip: _get(item, 'ipc_ip', ''),
      user: _get(item, 'nvr_account', ''),
      code: _get(item, 'nvr_pwd', ''),
      channel: _get(item, 'nvr_channel', ''),
      port: _get(item, 'ipc_port', ''),
    };
    /* if (Object.values(query).includes('')) {
      return { RetCode: -1, Description: 'NVR配置信息不全,无法打开监控视频' };
    } */
    const data = await _getVideoViewCar(query);
    if (_get(data, 'RetCode') === -1) {
      return data;
    }
    return data;
  }

  useEffect(() => {
    console.log(_get(state, 'selected', []));
    // eslint-disable-next-line array-callback-return
    _get(state, 'selected', []).map((x: any) => {
      // var videoUrl = 'wss://172.16.8.134:8012/';
      if (!x.player) {
        const videoUrl = _get(x, 'videoAddress', '');
        var canvas = document.getElementById(`my-video-${x.id}`);
        const player = new window.JSMpeg.Player(videoUrl, { canvas: canvas, audio: true });
        dispatch({
          type: 'mapWithCondition',
          payLoad: { player },
          licnum: x.licnum,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_get(state, 'selected.length', 0)]);

  return (
    <div
      style={{
        width: 1600,
        height: 390,
        position: 'absolute',
        bottom: 0,
        left: 0,
      }}
      // className="robotVideo"
    >
      <div
        style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden', width: 1580 /* overflowX: 'scroll'  */ }}
        id="drawerContent"
      >
        {_get(state, 'selected.length', 0) > 3 && (
          <span
            className="pointer"
            style={{ position: 'absolute', top: '40%', left: 20, zIndex: 99999 }}
            onClick={() => {
              const content: any = document.getElementById('drawerContent');
              content.scrollLeft -= 50;
            }}
          >
            <img alt="" src={left} />
          </span>
        )}
        {_get(state, 'selected.length', 0) > 3 && (
          <span
            className="pointer"
            style={{ position: 'absolute', top: '40%', right: 40, zIndex: 99999 }}
            onClick={() => {
              const content: any = document.getElementById('drawerContent');
              content.scrollLeft += 50;
            }}
          >
            <img alt="" src={right} />
          </span>
        )}
        {_get(state, 'selected', []).map((x: any) => {
          if (_get(x, 'hangUpFromCar', false)) {
            if (wsArray[x.id]) {
              wsArray[x.id].close();
              recArray[x.id].stop();
              wsArray[x.id] = '';
              recArray[x.id] = '';
              console.log('关闭对讲以及WebSocket');
            }
          }
          return (
            <div
              key={x.CarLicence}
              style={{
                // width: 520,
                height: 380,
                flexDirection: 'column',
                background: 'url(' + bg + ') no-repeat',
                backgroundSize: '100% 100%',
                color: 'white',
                padding: 5,
              }}
              className="flex-box mr10"
            >
              <div style={{ width: '100%', position: 'relative', height: 60 }}>
                <img
                  alt=""
                  src={close}
                  className="pointer"
                  style={{ right: 15, top: 0, width: 30, position: 'absolute' }}
                  onClick={async () => {
                    // if (_get(x, 'calling', false)) {
                    //   return message.info('正在语音连接');
                    // }
                    //关闭按钮
                    hangUp(x, true);
                  }}
                />
                <span style={{ fontSize: 24, position: 'absolute', top: '10%', left: '40%' }}>{x.licnum}</span>
              </div>
              <Spin tip="呼入中..." style={{ width: '100%', height: '90%' }} spinning={_get(x, 'spinning', false)}>
                {_get(x, 'videoError', false) && (
                  <div
                    style={{
                      width: commonWidth,
                      height: commonHeight,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      flexDirection: 'column',
                    }}
                    className="flex-box"
                    onClick={() => {
                      forceUpdate(); //报错后刷新，防止监控视频出现转圈卡顿
                    }}
                  >
                    <img alt="" src={refresh} />
                    <span>视频连接超时</span>
                  </div>
                )}
                {_get(x, 'calling', false) && ( //浏览器正在呼出到终端
                  <div
                    style={{
                      width: commonWidth,
                      height: commonHeight,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      flexDirection: 'column',
                      background: 'gray',
                      opacity: 0.7,
                    }}
                    className="flex-box"
                  >
                    <span>正在建立语音连接...</span>
                  </div>
                )}
                {x.audio === true &&
                _get(x, 'hangUpFromCar', false) && ( //终端呼入到浏览器超时或终端主动挂断
                    <div
                      style={{
                        width: commonWidth,
                        height: commonHeight,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        flexDirection: 'column',
                        background: 'gray',
                        opacity: 0.7,
                      }}
                      className="flex-box"
                    >
                      <span>
                        终端已挂断
                        <img alt="" src={call} className="ml10" />
                      </span>
                    </div>
                  )}
                {x.audio !== true &&
                (_get(x, 'callInTimeout', false) || _get(x, 'hangUpFromCar', false)) && ( //终端呼入到浏览器超时或终端主动挂断
                    <div
                      style={{
                        width: commonWidth,
                        height: commonHeight,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        flexDirection: 'column',
                        background: 'gray',
                        opacity: 0.7,
                      }}
                      className="flex-box"
                    >
                      <span>
                        {_get(x, 'callInTimeout', false) ? '语音请求超时未接听' : '语音请求未接听'}
                        <img alt="" src={call} className="ml10" />
                      </span>
                      <span>{_get(x, 'time', '')}</span>
                    </div>
                  )}
                {x.audio !== true &&
                _get(x, 'busy', false) && ( //终端对讲通道被占用
                    <div
                      style={{
                        width: commonWidth,
                        height: commonHeight,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        flexDirection: 'column',
                        background: 'gray',
                        opacity: 0.7,
                      }}
                      className="flex-box"
                    >
                      <span>
                        终端对讲通道被占用
                        <img alt="" src={call} className="ml10" />
                      </span>
                    </div>
                  )}
                {x.videoLoading && (
                  <div
                    style={{
                      width: commonWidth,
                      height: commonHeight,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      flexDirection: 'column',
                      background: 'gray',
                      // opacity: 0.9,
                    }}
                    className="flex-box"
                  >
                    视频加载中
                    <SyncOutlined spin={x.videoLoading} />
                  </div>
                )}
                <div className="mb10 robotVideo">
                  <canvas id={`my-video-${x.id}`} style={{ width: commonWidth, height: commonHeight }}></canvas>
                </div>
                {/* <ReactPlayer
                  key={ignore}
                  onClick={() => {
                    if (x.videoError) {
                      forceUpdate(); //报错后刷新，防止监控视频出现转圈卡顿
                    }
                  }}
                  playing
                  id={x.id}
                  width={`${commonWidth}px`}
                  height={`${commonHeight}px`}
                  // style={{ background: 'black' }}
                  className="mb10 robotVideo"
                  url={x.videoAddress}
                  muted={_get(x, 'videoMute', false)}
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload',
                      },
                    },
                  }}
                  onPlay={() => {
                    console.log('play');
                  }}
                  onReady={async () => {
                    console.log('ready');
                    if (!x.loadingTime) {
                      dispatch({
                        type: 'mapWithCondition',
                        payLoad: { videoLoading: true, loadingTime: 1 },
                        licnum: x.licnum,
                      }); //修改底部数据
                      await sleep(6000);
                      dispatch({
                        type: 'mapWithCondition',
                        payLoad: { videoLoading: false, loadingTime: 2 },
                        licnum: x.licnum,
                      }); //修改底部数据
                    } else {
                      dispatch({
                        type: 'mapWithCondition',
                        payLoad: { videoLoading: true, loadingTime: x.loadingTime + 1 },
                        licnum: x.licnum,
                      }); //修改底部数据
                    }
                  }}
                  onStart={() => {
                    console.log('start');
                  }}
                  onBuffer={() => {
                    console.log('buffer');
                  }}
                  onBufferEnd={() => {
                    console.log('bufferend');
                  }}
                  onProgress={(e) => {
                    console.log('pro', e);
                    if (_get(x, 'loadingTime', 1) != 1) {
                      dispatch({
                        type: 'mapWithCondition',
                        payLoad: { videoLoading: false, loadingTime: x.loadingTime + 1 },
                        licnum: x.licnum,
                      });
                    }
                    dispatch({
                      type: 'mapWithCondition',
                      payLoad: { videoError: false },
                      licnum: x.licnum,
                    }); //修改底部数据
                  }}
                  onError={(e) => {
                    console.log('error', e);
                    if (ignore < 7) {
                      //报错后刷新，防止监控视频出现转圈卡顿
                      setTimeout(forceUpdate, 1000);
                    } else {
                      dispatch({
                        type: 'mapWithCondition',
                        payLoad: { videoError: true },
                        licnum: x.licnum,
                      }); //修改底部数据
                    }
                  }}
                  onPause={() => {
                    console.log('pause1');
                    setTimeout(forceUpdate, 1000);
                  }}
                  onStalled={(e: any) => {
                    console.log('stalled', e);
                  }}
                  // onTimeUpdate={(e: any) => {
                  //   console.log('timeupdate');
                  // }}
                  onPlaying={(e: any) => {
                    console.log('onPlaying', e);
                  }}
                  onWaiting={(e: any) => {
                    console.log('onWaiting', e);
                  }}
                  onCanPlayThrough={(e: any) => {
                    console.log('onCanplaythrough', e);
                  }}
                  onCanPlay={(e: any) => {
                    console.log('onCanplay', e);
                  }}
                /> */}
                {/* <span
                  style={{ cursor: 'pointer', position: 'absolute', bottom: '15px', right: '5px', color: 'white' }}
                  onClick={() => {
                    const screen: any = screenfull;
                    const player = document.getElementById(x.id);
                    screen.request(findDOMNode(player));
                  }}
                >
                  <FullscreenOutlined />
                </span> */}
              </Spin>

              <div className="flex mt10" style={{ width: '100%', justifyContent: 'space-evenly' }}>
                <img
                  alt=""
                  src={brake} //刹车
                  style={{ width: iconWidth, height: iconWidth }}
                  className="pointer"
                  onClick={async () => {
                    const res = await _carControl({
                      CarLicence: _get(x, 'licnum', ''),
                      ControlType: '1',
                      status: '1',
                    });
                    if (_get(res, 'RetCode') == 0) {
                      return message.success('刹车成功');
                    }
                    message.error(_get(res, 'Description'));
                  }}
                />
                {x.audio && (
                  <img
                    alt=""
                    src={x.mute ? closeMic : openMic} // 话筒静音
                    className="pointer"
                    style={{ width: iconWidth, height: iconWidth }}
                    onClick={() => {
                      const isMute = _get(x, 'mute', false);
                      if (isMute) {
                        recArray[x.id] && recArray[x.id].start();
                        message.info('麦克风已开启');
                      } else {
                        recArray[x.id] && recArray[x.id].stop();
                        message.info('麦克风已关闭');
                      }
                      dispatch({
                        type: 'mapWithCondition',
                        payLoad: { mute: !isMute },
                        licnum: x.licnum,
                      }); //修改底部数据
                    }}
                  />
                )}
                <img
                  alt=""
                  src={x.videoMute ? closeVoice : openVoice} //视频静音
                  style={{ width: iconWidth, height: iconWidth }}
                  className="pointer"
                  onClick={() => {
                    const isMute = _get(x, 'videoMute', false);
                    x.player.setVolume(isMute ? 1 : 0);
                    dispatch({
                      type: 'mapWithCondition',
                      payLoad: { videoMute: !isMute, player: x.player },
                      licnum: x.licnum,
                    });
                  }}
                />
                {showAudioImg(x) && ( //接听或呼出按钮
                  <img
                    alt=""
                    src={audio}
                    style={{ width: iconWidth, height: iconWidth }}
                    className="pointer"
                    onClick={() => {
                      if (!_get(x, 'spinning', false)) {
                        //如果不是呼入状态，点击该按钮即主动呼出到终端
                        const filter = _get(state, 'selected', []).filter((item: any) => {
                          return x.licnum == item.licnum;
                        });
                        if (_get(filter, 'length', 0) > 0 && _get(filter, '0.calling')) {
                          return message.info('正在建立语音连接');
                        }
                        return commonAudioFun({
                          item: x,
                          videoAddress: _get(x, 'videoAddress'),
                          setVisible,
                          listData,
                          setListData,
                          recArray,
                          wsArray,
                          state,
                          dispatch,
                        });
                      }
                      //接听
                      //车载端呼入弹窗不受上限值影响，但是无法接起，提醒【语音/视频连接上限为N，请关闭部分监控界面后重试】；
                      if (_get(state, 'selected.length', 0) > VIDEO_MAX_COUNT) {
                        message.info(`语音/视频连接上限为${VIDEO_MAX_COUNT}，请关闭部分监控界面后重试`);
                        return;
                      }
                      audioUtil(
                        x,
                        async (rec: any, ws: any) => {
                          if (!rec || !ws) {
                            await _carTalkControl({ CarLicence: _get(x, 'licnum', ''), VoiceTalk: '0' });
                            dispatch({
                              type: 'mapWithCondition',
                              payLoad: { audio: false, calling: false },
                              licnum: _get(x, 'licnum', ''),
                            });
                            const newData = listData.map((item: any) => {
                              if (x.licnum === item.licnum) {
                                return {
                                  ...item,
                                  spinning: false,
                                  callInTimeout: false,
                                  hangUpFromCar: false,
                                  hangUpFromBrowser: false,
                                  busy: false,
                                  audio: false,
                                  calling: false,
                                  video: true,
                                };
                              }
                              return item;
                            });
                            setListData(newData);
                            return;
                          }
                          wsArray[x.id] = ws;
                          recArray[x.id] = rec;
                          dispatch({
                            type: 'handleSelect',
                            payLoad: {
                              ...x,
                              videoAddress: x.videoAddress,
                              spinning: false,
                              callInTimeout: false,
                              hangUpFromCar: false,
                              hangUpFromBrowser: false,
                              busy: false,
                              audio: true,
                              video: true,
                              ws,
                              rec,
                            },
                            isPush: false,
                            setVisible,
                          });
                          const newData = listData.map((item: any) => {
                            if (x.licnum === item.licnum) {
                              return {
                                ...item,
                                spinning: false,
                                callInTimeout: false,
                                hangUpFromCar: false,
                                hangUpFromBrowser: false,
                                busy: false,
                                audio: true,
                                video: true,
                              };
                            }
                            return item;
                          });
                          setListData(newData);
                        },
                        _get(x, 'id', ''),
                        true,
                      );
                    }}
                  />
                )}
                {showHangUpImg(x) && ( //挂断按钮
                  <img
                    alt=""
                    src={HangUp}
                    style={{ width: iconWidth, height: iconWidth }}
                    className="pointer"
                    onClick={() => {
                      //挂断
                      hangUp(x, false);
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
