import { Row, Button, message, Divider } from 'antd';
import { useState } from 'react';
import { _carControl, _carTalkControl, _get, _getCarInfo, _getVideoViewCar } from 'utils';
import { useInterval } from 'hooks';
import audio from 'statics/images/robotCoach/audio.png';
import brake from 'statics/images/robotCoach/brake.png';
import carDoor_red from 'statics/images/robotCoach/carDoor.png';
import ClearanceLamp from 'statics/images/robotCoach/ClearanceLamp.png';
import clutch from 'statics/images/robotCoach/clutch.png';
import dippedHeadlight from 'statics/images/robotCoach/dippedHeadlight.png';
import highBeam from 'statics/images/robotCoach/highBeam.png';
import fire from 'statics/images/robotCoach/fire.png';
import footBrake from 'statics/images/robotCoach/footBrake.png';
import Gear from 'statics/images/robotCoach/Gear.png';
import handbrake from 'statics/images/robotCoach/handbrake.png';
import horn from 'statics/images/robotCoach/horn.png';
import RightTurnlight from 'statics/images/robotCoach/RightTurnlight.png';
import leftTurnlight from 'statics/images/robotCoach/leftTurnlight.png';

import rotationRate from 'statics/images/robotCoach/rotationRate.png';
import Safetybelt_red from 'statics/images/robotCoach/Safetybelt.png';

import speed from 'statics/images/robotCoach/speed.png';
import SteeringWheel from 'statics/images/robotCoach/SteeringWheel.png';
import throttle from 'statics/images/robotCoach/throttle.png';
import video from 'statics/images/robotCoach/video.png';
import carDoor from 'statics/images/robotCoach/carDoorWhite.png';
import ClearanceLamp_red from 'statics/images/robotCoach/ClearanceLamp_red.png';
import clutch_red from 'statics/images/robotCoach/clutch_red.png';
import dippedHeadlight_red from 'statics/images/robotCoach/dippedHeadlight_red.png';
import fire_red from 'statics/images/robotCoach/fire_red.png';
import footBrake_red from 'statics/images/robotCoach/footBrake_red.png';
import Gear_red from 'statics/images/robotCoach/Gear_red.png';
import handbrake_red from 'statics/images/robotCoach/handbrake_red.png';
import highBeam_red from 'statics/images/robotCoach/highBeam_red.png';
import horn_red from 'statics/images/robotCoach/horn_red.png';
import leftTurnlight_red from 'statics/images/robotCoach/leftTurnlight_red.png';
import RightTurnlight_red from 'statics/images/robotCoach/RightTurnlight_red.png';
import Safetybelt from 'statics/images/robotCoach/Safetybelt_red.png';
import throttle_red from 'statics/images/robotCoach/throttle_red.png';
import warningLight_red from 'statics/images/robotCoach/warningLight_red.png';
import warningLight from 'statics/images/robotCoach/warningLight.png';
import { handleSeletedData, commonAudioFun, VIDEO_MAX_COUNT } from './utils/commonUtils';

import videoOpen from 'statics/images/robotCoach/videoOpen.png';
import hangUp from 'statics/images/robotCoach/HangUp.png';

const width1 = 60;

export default function Detail(props: any) {
  const {
    onCancel,
    currentData,
    setCurrentData,
    wsArray,
    recArray,
    setVisible,
    listData = [],
    setListData,
    resetFlowingModel,
    state,
    dispatch,
  } = props;
  const [data, setData] = useState({});
  // const [isLoading,setIsLoading]
  // const { data, isLoading } = useFetch({
  //   request: _getCarInfo,
  //   query: { CarLicence: currentData.licnum, CarStatus: '0' },
  // });
  const getDetailData = async () => {
    const res = await _getCarInfo({ CarLicence: currentData.licnum, CarStatus: '1' });
    setData(res);
  };
  useInterval(() => {
    getDetailData();
  }, 800);

  const commonVideoMonitorFun = async (item: any) => {
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

    if (Object.values(query).includes('')) {
      return { RetCode: -1, Description: 'NVR配置信息不全,无法打开监控视频' };
    }
    const data = await _getVideoViewCar(query);
    return data;
  };

  const imgDoor = _get(data, 'IoStatus.Door', '0') == '1' ? carDoor_red : carDoor;
  const imgSafetybelt = _get(data, 'IoStatus.SeatBelt', '0') == '1' ? Safetybelt : Safetybelt_red;
  const imgFire = _get(data, 'IoStatus.KeyState', '0') == '0' ? fire : fire_red;
  const imgGear = _get(data, 'IoStatus.Gear', '0') == '0' ? Gear : Gear_red;
  const imgHandBrake = _get(data, 'IoStatus.HandBrake', '0') == '0' ? handbrake : handbrake_red;
  const imgFootBrake = _get(data, 'IoStatus.FootBrake', '0') == '0' ? footBrake : footBrake_red;
  const imgClutch = _get(data, 'IoStatus.Clutch', '0') == '0' ? clutch : clutch_red; //
  const imgAccelerator = _get(data, 'IoStatus.Accelerator', '0') == '0' ? throttle : throttle_red;
  const imgHorn = _get(data, 'IoStatus.Horn', '0') == '0' ? horn : horn_red; //
  const imgLeftTurnLamp = _get(data, 'IoStatus.LeftTurnLamp', '0') == '0' ? leftTurnlight : leftTurnlight_red;
  const imgRightTurnLamp = _get(data, 'IoStatus.RightTurnLamp', '0') == '0' ? RightTurnlight : RightTurnlight_red;
  const imgLowBeam = _get(data, 'IoStatus.LowBeam', '0') == '0' ? dippedHeadlight : dippedHeadlight_red;
  const imgHighBeam = _get(data, 'IoStatus.HighBeam', '0') == '0' ? highBeam : highBeam_red;
  const imgClearanceLamp = _get(data, 'IoStatus.ClearanceLamp', '0') == '0' ? ClearanceLamp : ClearanceLamp_red;
  const imgAlarmLamp = _get(data, 'IoStatus.AlarmLamp', '0') == '0' ? warningLight : warningLight_red;

  return (
    <div
      // destroyOnClose
      // maskClosable={false}
      // placement={'left'}
      // visible={visible}
      // closable={false}
      // getContainer={false}
      style={{ position: 'absolute', background: 'black', width: 310, height: '100%' }}
      // drawerStyle={{ background: 'black' }}
      // width={300}
    >
      <div>
        <div className="flex mb20 mt10" style={{ marginLeft: 40 }}>
          <span className="fz24 bold">{_get(currentData, 'licnum')}</span>
          <div
            className="ml20 flex-box"
            style={{
              borderRadius: 16,
              background: _get(currentData, 'Status', '离线') == '离线' ? '#FFFFFF' : '#ED2A30',
              textAlign: 'center',
              color: _get(currentData, 'Status', '离线') == '离线' ? '#999999' : '#FFFFFF',
              padding: 4,
              height: 30,
              fontSize: 16,
              width: 70,
            }}
          >
            {_get(currentData, 'Status', '离线') == '在线'
              ? _get(currentData, 'stu_name', '')
                ? '训练中'
                : '待机'
              : _get(currentData, 'Status', '离线')}
          </div>
        </div>
        {_get(currentData, 'stu_name', '') != '' && (
          <div className="fz20" style={{ marginLeft: 40 }}>
            <Row className="" style={{ marginBottom: 5 }}>
              学员姓名：{_get(currentData, 'stu_name')}
            </Row>
            <Row className=" mb20">训练时长：{(Number(_get(currentData, 'stu_traintime', 0)) / 60).toFixed(0)}分钟</Row>
          </div>
        )}

        <Row style={{ justifyContent: 'space-around' }} className="fz14">
          <div className="robotImgDiv">
            <img alt="" src={rotationRate} style={{ width: width1, marginBottom: 20 }} />
            <span>发动机转速</span>
            <span>{_get(data, 'IoStatus.EngineSpeed', 0)}rpm</span>
          </div>
          <Divider
            type="vertical"
            className="mt20"
            style={{ borderLeft: '1px solid #FFFFFF', color: 'white', height: 19, opacity: 0.5 }}
          />
          <div className="robotImgDiv">
            <img alt="" src={speed} style={{ width: width1, marginBottom: 20 }} />
            <span>速度</span>
            <span>{_get(data, 'IoStatus.Speed', 0)}km/h</span>
          </div>
          <Divider
            type="vertical"
            className="mt20"
            style={{ borderLeft: '1px solid #FFFFFF', color: 'white', height: 19, opacity: 0.5 }}
          />
          <div className="robotImgDiv">
            <img alt="" src={SteeringWheel} style={{ width: width1, height: width1, marginBottom: 10 }} />
            <span>方向盘角度</span>
            <span>{_get(data, 'IoStatus.SteeringWheel', 0)}°</span>
          </div>
        </Row>
        <div className="flex-box" style={{ marginTop: 30, marginBottom: 40 }}>
          <div
            style={{ border: '#F3302B 1px solid', padding: '20px 0 25px 0', width: 260, background: '#1E1E36' }}
            className="fz12"
          >
            <Row style={{ justifyContent: 'space-around', marginBottom: 6 }}>
              <div className="robotImgDiv">
                <img alt="" src={imgDoor} className="robotDetailImg" />
                <span>车门</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgSafetybelt} className="robotDetailImg" />
                <span>安全带</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgFire} className="robotDetailImg" />
                <span>点火</span>
              </div>
            </Row>
            <Row style={{ justifyContent: 'space-around', marginBottom: 6 }}>
              <div className="robotImgDiv">
                {/* <Tooltip color={'#333'} className="ml20" placement="right" title={_get(data, 'IoStatus.Gear', '0')}> */}
                <img alt="" src={imgGear} className="robotDetailImg" />
                {/* </Tooltip> */}
                <span>档位</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgHandBrake} className="robotDetailImg" />
                <span>手刹</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgFootBrake} className="robotDetailImg" />
                <span>脚刹</span>
              </div>
            </Row>
            <Row style={{ justifyContent: 'space-around', marginBottom: 6 }}>
              <div className="robotImgDiv">
                <img alt="" src={imgClutch} className="robotDetailImg" />
                <span>离合</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgAccelerator} className="robotDetailImg" />
                <span>油门</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgHorn} className="robotDetailImg" />
                <span>喇叭</span>
              </div>
            </Row>
            <Row style={{ justifyContent: 'space-around', marginBottom: 6 }}>
              <div className="robotImgDiv">
                <img alt="" src={imgLeftTurnLamp} className="robotDetailImg" />
                <span>左转灯</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgRightTurnLamp} className="robotDetailImg" />
                <span>右转灯</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgLowBeam} className="robotDetailImg" />
                <span>近光灯</span>
              </div>
            </Row>
            <Row style={{ justifyContent: 'space-around', marginBottom: 6 }}>
              <div className="robotImgDiv">
                <img alt="" src={imgHighBeam} className="robotDetailImg" />
                <span>远光灯</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgClearanceLamp} className="robotDetailImg" />
                <span>示廊灯</span>
              </div>
              <div className="robotImgDiv">
                <img alt="" src={imgAlarmLamp} className="robotDetailImg" />
                <span>警示灯</span>
              </div>
            </Row>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: 30, marginTop: 50 }}>
          <img
            alt=""
            src={brake} //刹车
            className="pointer"
            onClick={async () => {
              const res = await _carControl({
                CarLicence: _get(currentData, 'licnum', ''),
                ControlType: '1', // 1：刹车控制 2：对讲状态
                status: '1',
              });
              if (_get(res, 'RetCode') == 0) {
                return message.success('刹车成功');
              }
              message.error(_get(res, 'Description'));
            }}
          />
          <img
            alt=""
            src={_get(currentData, 'video', false) ? videoOpen : video} //视频
            className="pointer"
            onClick={async () => {
              if (_get(currentData, 'video', false)) {
                return message.info('视频已开启');
              }
              if (_get(state, 'selected.length', 0) + 1 > VIDEO_MAX_COUNT) {
                message.info(`语音/视频连接上限为${VIDEO_MAX_COUNT}，请关闭部分监控界面后重试`);
                return;
              }
              const data = await commonVideoMonitorFun(currentData);
              if (_get(data, 'RetCode') === -1) {
                message.info(_get(data, 'Description', ''));
                return;
              }
              const newData = listData.map((x: any) => {
                if (x.licnum === currentData.licnum) {
                  return { ...x, video: true };
                }
                return x;
              });
              setListData(newData);

              setCurrentData({ ...currentData, video: true });
              setVisible(true);

              handleSeletedData({
                item: currentData,
                videoAddress: _get(data, 'VideoAddress', ''),
                video: true,
                isPush: true,
                setVisible,
                state,
                dispatch,
              });
            }}
          />
          <img
            alt=""
            src={_get(currentData, 'audio', false) ? hangUp : audio} //语音
            className="pointer"
            onClick={async () => {
              if (_get(currentData, 'audio', false)) {
                //如果已经拨通了则点击该按钮会【挂断】
                wsArray[currentData.id] && wsArray[currentData.id].close();
                recArray[currentData.id] && recArray[currentData.id].stop();
                await _carTalkControl({ CarLicence: _get(currentData, 'licnum', ''), VoiceTalk: '2' });
                setCurrentData({ ...currentData, audio: false });
                const newData = listData.map((x: any) => {
                  if (x.licnum === currentData.licnum) {
                    return { ...x, audio: false };
                  }
                  return x;
                });
                setListData(newData);
                dispatch({
                  type: 'mapWithCondition',
                  payLoad: { audio: false },
                  licnum: currentData.licnum,
                });
                return;
              }
              if (!_get(currentData, 'video', false)) {
                if (_get(state, 'selected.length', 0) + 1 > VIDEO_MAX_COUNT) {
                  message.info(`语音/视频连接上限为${VIDEO_MAX_COUNT}，请关闭部分监控界面后重试`);
                  return;
                }
              }

              const filter = _get(state, 'selected', []).filter((x: any) => {
                return x.licnum == currentData.licnum;
              });
              if (_get(filter, 'length', 0) > 0 && _get(filter, '0.calling')) {
                return message.info('正在建立语音连接');
              }
              const data = await commonVideoMonitorFun(currentData);

              if (_get(data, 'RetCode') === -1) {
                message.info(_get(data, 'Description', ''));
              }
              const newData = listData.map((x: any) => {
                if (x.licnum === currentData.licnum) {
                  return { ...x, video: true };
                }
                return x;
              });
              setListData(newData);
              setCurrentData({ ...currentData, video: true });
              setVisible(true);
              commonAudioFun({
                item: currentData,
                videoAddress: _get(data, 'VideoAddress'),
                setVisible,
                listData,
                setListData,
                recArray,
                wsArray,
                state,
                dispatch,
                currentData,
                setCurrentData,
              });
            }}
          />
        </div>
        <Button
          className="mt20 pointer bold-400"
          style={{
            width: 240,
            height: 51,
            fontSize: 24,
            background: '#F5343A',
            border: '1px solid #F5343A',
            color: '#FFFFFF',
            marginLeft: 30,
          }}
          onClick={() => {
            onCancel();
            resetFlowingModel();
          }}
        >
          返回
        </Button>
      </div>
    </div>
  );
}
