// 车辆轨迹
import { useRef, useState, useEffect, useReducer } from 'react';
import { Button, List, Row, message, Input } from 'antd';
import { useFetch, useVisible, useInterval, useUnload } from 'hooks';
import { _getNvrSetupList } from '../nvrSet/_api';
import { _getRobotCoachModelList, _getRobotCoachPlaceList, _getRobotCoachPlace } from './_api';
import { trim } from 'lodash';
import Monitor from './Monitor';
import { Auth, _carControl, _get, _getVideoViewCar } from 'utils';
import { UpdatePlugin } from 'components';
import CarVideo from './CarVideo';
import Detail from './Detail';
import { handleSeletedData, reducer, commonAudioFun, VIDEO_MAX_COUNT } from './utils/commonUtils';
import {
  GPS,
  _getServerInfo,
  _getTalkbackRequest,
  _getCarsPosition,
  _getCarStatus,
  _carTalkControl,
  _platformTalkControl,
} from 'utils';
import { createLines } from './methods/createLines';
import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom';
import FooterVideo from './FooterVideo';
import logo from 'statics/images/robotCoach/logo.png';
import videoSmall from 'statics/images/robotCoach/videoSmall.png';
import videoRed from 'statics/images/robotCoach/videoRed.png';
import audio_small from 'statics/images/robotCoach/audio_small.png';
import hangUp_small from 'statics/images/robotCoach/hangUp_small.png';
import close_small from 'statics/images/robotCoach/close_small.png';
import search from 'statics/images/robotCoach/search.png';
import fullScreen from 'statics/images/robotCoach/fullScreen.png';
import bg from 'statics/images/robotCoach/bg2.png';
import bg3 from 'statics/images/robotCoach/bg3.png';
import moment from 'moment';

const LIMIT = 99;
let wsArray: any = [];
let recArray: any = [];
const initialState = { selected: [] };
const commonWidth = 330;

function MonitorManage() {
  const [pageSize, setPageSize] = useState(LIMIT);
  const [videoVisible, setVideoVisible] = useVisible();
  const [talkRequestCars, setTalkRequestCars] = useState<any>([]);
  const [currentData, setCurrentData] = useState<any>([]);
  const [listData, setListData] = useState<any>([]);
  const [delay, setDelay] = useState({
    positionDelay: 0, //查询位置信息间隔
    listDelay: 0, //查询列表信息间隔
    talkRequestDelay: 0, //查询呼入语音信息间隔
  });
  const [carList, setCarList] = useState([]);
  const [pointsData, setPointsData] = useState('');
  const [carStatus, setCarStatus] = useState({});
  const [visible, setVisible] = useState(false);
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const [detailVisible, setDetailVisible] = useState(false);
  const [carInput, setCarInput] = useState('');
  const [searchCar, setSearchCar] = useState('');
  const [listVisible, setListVisible] = useState(true);
  const [statusData, setStatusData] = useState({});
  const [isFlowingCar, setIsFlowingCar] = useState(false);
  const statusArr = ['训练中', '待机', '离线'];
  const [carNumber, setCarNumber] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef(null as any);
  const [state, dispatch] = useReducer(reducer, initialState);

  let screen = screenfull as any;
  useEffect(() => {
    if (!sessionStorage.getItem('reload')) {
      window.location.reload(); //进入页面后，执行刷新后，onbeforeunload才可以生效
      window.sessionStorage.setItem('reload', '1');
    } else {
      window.sessionStorage.setItem('reload', '1');
    }
  }, []);
  useUnload((e: any) => {
    //关闭页面时，调用接口，通知终端页面已挂断
    async function cancelTalk() {
      const res = await _carTalkControl({
        CarLicence: 'ALL',
        VoiceTalk: '0',
      });
      localStorage.setItem('closeWinRes', `${_get(res, 'RetCode', '')}${_get(res, 'Description', '')}`);
    }
    cancelTalk();
    e.preventDefault();
    e.returnValue = '';
  });
  useEffect(() => {
    if (_get(state, 'selected.length', []) === 0) {
      setVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_get(state, 'selected.length', [])]);

  const monitorRef = useRef(null);
  // 左侧列表
  const { data: list = [], isLoading } = useFetch({
    query: { page: 1, limit: pageSize, licnum: searchCar, isMonitor: '1' },
    depends: [pageSize, searchCar],
    request: _getNvrSetupList,
    callback: async (data) => {
      const carData = _get(data, 'rows', []);
      if (_get(carData, 'length', 0) === 0) {
        setListData(carData);
        return;
      }
      const carList = _get(data, 'rows', []).map((item: any) => item.licnum);
      setCarList(carList);
      setListData(carData);
      const res = await _getServerInfo();
      if (_get(res, 'RetCode', '') === 'NO_IP_OR_PORT') {
        //内网IP未配置
        message.info(_get(res, 'Description', ''));
        return;
      } else if (_get(res, 'result') === false) {
        return;
      } else {
        setDelay({
          positionDelay: 200, //查询位置信息间隔
          listDelay: 1000, //查询列表信息间隔
          talkRequestDelay: 1000, //查询呼入语音信息间隔
        });
      }

      if (listData) {
        //查询车牌号时进入
        const carDataMap = carData.map((x: any) => {
          const filterData: any = listData.filter((item: any) => {
            return item.licnum == x.licnum;
          });
          return { ...x, ..._get(filterData, '0', {}) };
        });

        setListData(carDataMap);
        return;
      }
      refreshListData(carData);
    },
  });

  const { res: initStatusData, finished: isFinishedInitCarStatus } = useFetch({
    request: _getCarsPosition,
    query: { CarLicence: carList.join(','), Forceget: '2' },
    forceCancel: carList.length === 0,
    depends: [carList],
  });

  // 获取车辆信息列表
  const { data: carData = [], isLoading: carDataLoading } = useFetch({
    request: _getRobotCoachModelList,
    query: { carType: 'C1' },
    requiredFields: ['carType'],
  });

  // 获取场地信息列表
  const { data: placeData = [], isLoading: placeDataLoading } = useFetch({
    request: _getRobotCoachPlaceList,
  });

  // 获取场地信息
  const { data: placeInfoData = {}, isLoading: placeInfoDataLoading } = useFetch({
    request: _getRobotCoachPlace,
    query: { placeId: _get(placeData, '0.id') },
    forceCancel: !_get(placeData, '0.id'),
    depends: [_get(placeData, '0.id')],
  });

  useEffect(() => {
    if (!_get(Object.keys(placeInfoData), 'length', 0)) {
      return;
    }
    console.log('没有执行', placeInfoData);
    const pointsData = createLines(placeInfoData);
    // 转换成json字符串
    setPointsData(JSON.stringify(pointsData));
    console.log(pointsData);
  }, [placeInfoData]);

  useInterval(() => {
    refreshListData(listData);
  }, delay.listDelay);

  //3D地图获取车辆位置
  async function getCarsPosition(param = '0') {
    if (carList.length === 0) {
      return;
    }
    const res = await _getCarsPosition({ CarLicence: carList.join(','), Forceget: param });
    const positionRes = _get(res, 'Position', []);
    const list = positionRes.map((item: any, index: number) => {
      const gpsData = _get(item, 'GPS', {});
      return {
        index: _get(item, 'CarLicence', ''),
        x: _get(gpsData, 'xAxis', 0) / 100,
        y: _get(gpsData, 'yAxis', 0) / 100,
        z: _get(gpsData, 'zAxis', 0) / 100,
        rotation: _get(gpsData, 'Azimuth', 0),
        angle: _get(gpsData, 'WheelAngle', 0),
        speed: _get(gpsData, 'Speed', 0),
        moveState: _get(gpsData, 'MoveState', 0),
        rotationX: _get(gpsData, 'Pitch', 0),
        rotationZ: _get(gpsData, 'Roll', 0),
        carNumber: _get(item, 'CarLicence', ''),
      };
    });
    replaceNewCar(list);
  }

  function replaceNewCar(currentArr: any) {
    const positionRes = _get(initStatusData, 'Position', []);
    const initList = positionRes.map((item: any, index: number) => {
      const gpsData = _get(item, 'GPS', {});
      return {
        index: _get(item, 'CarLicence', ''),
        x: _get(gpsData, 'xAxis', 0) / 100,
        y: _get(gpsData, 'yAxis', 0) / 100,
        z: _get(gpsData, 'zAxis', 0) / 100,
        rotation: _get(gpsData, 'Azimuth', 0),
        angle: _get(gpsData, 'WheelAngle', 0),
        speed: _get(gpsData, 'Speed', 0),
        moveState: _get(gpsData, 'MoveState', 0),
        rotationX: _get(gpsData, 'Pitch', 0),
        rotationZ: _get(gpsData, 'Roll', 0),
        carNumber: _get(item, 'CarLicence', ''),
      };
    });
    if (!carStatus) {
      setCarStatus({ list: initList });
    }

    const hashCarStatus = currentArr.reduce(
      (pre: any, cur: any) => ({
        ...pre,
        [cur.carNumber]: cur,
      }),
      {},
    );
    const newCarStatus = initList.map((item: any) => {
      const newItem = hashCarStatus[item.carNumber];
      if (newItem) {
        return newItem;
      }
      return item;
    });
    setCarStatus({ list: newCarStatus });
  }

  useInterval(() => {
    if (initStatusData) {
      getCarsPosition('0');
    }
  }, delay.positionDelay);

  function refreshListData(data?: []) {
    if (carList.length === 0) {
      return;
    }
    const carData = data ? data : _get(list, 'rows', []);

    let dataList = carData;

    _getCarStatus({ CarLicence: carList.join(',') }).then((result) => {
      const statusRes = _get(result, 'Info', []).map((item: any) => {
        return { ...item, licnum: item.CarLicence };
      });
      let obj: any = {};
      if (_get(statusRes, 'length', 0) > 0) {
        dataList = dataList.map((x: any) => {
          const filterData: any = statusRes.filter((item: any) => {
            return item.CarLicence == x.licnum;
          });
          if (_get(currentData, 'licnum', '') === _get(x, 'licnum', '')) {
            setCurrentData({ ...x, ...filterData[0] });
          }
          return { ...x, ...filterData[0] };
        });

        for (let i = 0; i < statusRes.length; i++) {
          var item = statusRes[i].Status;
          var name = statusRes[i].stu_name;
          if (item != '离线') {
            if (name) {
              obj['训练中'] = obj['训练中'] + 1 || 1;
            } else {
              obj['待机'] = obj['待机'] + 1 || 1;
            }
          } else {
            obj[item] = obj[item] + 1 || 1;
          }
        }
        // setStatusData({ ...{ 训练中: 0, 待机: 0, 离线: 0 }, ...obj });
      } else {
        setCurrentData({ ...currentData, Status: '离线' });
        dataList = dataList.map((item: any) => {
          return { ...item, Status: '离线' };
        });
      }

      setStatusData({ ...{ 训练中: 0, 待机: 0, 离线: 0 }, ...obj });
      setListData(dataList);
    });
  }
  function sortList(listData: any = []) {
    if (listData.length === 0) {
      return listData;
    }
    const dataListSort = listData.sort((a: any, b: any) => {
      const statusX = _get(a, 'Status', ''); //在线的排到上边
      const statusY = _get(b, 'Status', '');
      const videoX = _get(a, 'video', false);
      const videoY = _get(b, 'video', false);
      const audioX = _get(a, 'audio', false);
      const audioY = _get(b, 'audio', false);
      const callInX = _get(a, 'spinning', false);
      const callInY = _get(b, 'spinning', false);

      const isVideo = videoY - videoX;
      const isAudio = audioY - audioX;
      const isCallIn = callInY - callInX;
      /* 排序规则：
      1、车载端呼叫请求中的车辆
      2、语音连接建立中车辆
      3、语音连接超时车辆
      4、语音请求未接听车辆
      5、语音接通的车辆
      6、仅打开视频界面车辆（不区分是否联通）
      7、训练中
      8、待机
      9、离线 */

      return isCallIn || isAudio || isVideo || statusY.localeCompare(statusX);
    });
    return dataListSort;
  }

  useInterval(async () => {
    if (carList.length === 0) {
      //没有车，不发请求
      return;
    }
    const res = await _getTalkbackRequest(); //轮询车辆是否有电话请求
    setTalkRequestCars(_get(res, 'Request', []) /* .map((item: any) => {return {licnum:item.CarLicence,}}) */);
    // setPopVisible(true);
  }, delay.talkRequestDelay);

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
    /* if (Object.values(query).includes('')) {
      return { RetCode: -1, Description: 'NVR配置信息不全,无法打开监控视频' };
    } */
    const data = await _getVideoViewCar(query);
    if (_get(data, 'RetCode') === -1) {
      return data;
    }
    const newData = listData.map((x: any) => {
      if (x.licnum === item.licnum) {
        return { ...x, video: true };
      }
      return x;
    });
    setListData(newData);
    return data;
  };

  useEffect(() => {
    // return;
    if (_get(talkRequestCars, 'length', 0) == 0) {
      dispatch({
        type: 'map',
        payLoad: { spinning: false, busy: false },
      });
      const data = listData.map((x: any) => {
        return { ...x, busy: false };
      });
      setListData(data);
      return;
    }
    //终端发语音到前端
    talkRequestCars.forEach(async (item: any) => {
      const status = _get(item, 'status', '');
      const time = _get(item, 'ReqTime', '');
      if (status == 2) {
        console.log('超时');
      }
      if (status == 3) {
        console.log('终端主动挂断');
      }
      if (status == 4) {
        console.log('其他平台已接听');
      }
      if (status == 5) {
        console.log('平台挂断了对讲请求（未接听）');
      }
      if (status == 6) {
        console.log('666）');
      }
      const statusObj = {
        spinning: status === '1',
        callInTimeout: status === '2',
        hangUpFromCar: status === '3',
        busy: status === '4',
        hangUpFromBrowser: status === '5',
      };
      if (
        _get(state, 'selected', []).every((x: any) => {
          //是否已经在下方视频界面
          return x.licnum != item.CarLicence;
        })
      ) {
        if (!statusObj.spinning) {
          return; //除了终端来电，其他情况不弹出
        }
        const filterData = listData.filter((x: any) => {
          return x.licnum === item.CarLicence;
        });
        if (_get(filterData, 'length', 0) == 0) {
          return;
        }
        const data = await commonVideoMonitorFun(_get(filterData, '0'));
        if (_get(data, 'RetCode') === -1) {
          message.info(_get(data, 'Description', ''));
        }

        setVisible(true);
        dispatch({
          type: 'addSpinning',
          licnum: item.CarLicence,
          payLoad: { ..._get(filterData, '0'), videoAddress: _get(data, 'VideoAddress', ''), ...statusObj, time },
        });
        const newData = listData.map((x: any) => {
          if (x.licnum === item.CarLicence) {
            return { ...x, video: true, ...statusObj, audio: status === '4' ? x.audio : false, time }; //有语音呼入，视频自动打开
          }
          return x;
        });
        setListData(newData);
      } else {
        dispatch({
          type: 'mapWithCondition',
          payLoad: { ...statusObj, time },
          licnum: item.CarLicence,
        });
        const newData = listData.map((x: any) => {
          if (x.licnum === item.CarLicence) {
            return { ...x, video: true, ...statusObj, audio: status === '4' ? x.audio : false, time }; //有语音呼入，视频自动打开
          }
          return x;
        });
        setListData(newData);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talkRequestCars /* listData */]);

  const total = _get(list, 'total', 0);

  // 加载更多
  const onLoadMore = function () {
    if (pageSize < total) {
      setPageSize(pageSize + LIMIT);
    }
  };

  const loadMore = pageSize < total && (
    <div className="text-center mt10 mb10">
      <Button onClick={onLoadMore} className="pointer">
        加载更多
      </Button>
    </div>
  );

  const getColorText = (status: string) => {
    if (!status) return;
    // NVR状态 1：正在运行 2：离线 3：设备故障
    if (trim(status) === '在线') {
      return '#ED2A30';
    }
    if (trim(status) === '离线') {
      return '#FFFFFF';
    }
  };
  // 退出跟随模式的方法
  function resetFlowingModel() {
    setIsFlowingCar(false);
    setCarNumber('');
  }

  // 开启跟随模式的方法
  function openFlowingModel(carNumber: string) {
    setIsFlowingCar(true);
    setCarNumber(carNumber);

    // three模块点击车辆后寻找该点击车辆左侧详情并打开
    const carItem = listData.find((item: any) => {
      return carNumber === _get(item, 'licnum', '');
    });
    if (carItem) {
      setCurrentData(carItem);
      setDetailVisible(true);
      setListVisible(false);
    }
  }

  // 鼠标移入监控区域后搜索框鼠标聚焦失去焦点
  function carInputBlur() {
    inputRef.current?.blur();
  }

  function getVideoImg(item: any) {
    return (
      <img
        alt=""
        className="ml10 mt4 pointer"
        style={{ height: 26 }}
        src={item.video ? videoRed : videoSmall}
        onClick={async (event) => {
          event.stopPropagation();
          if (item.video) return;

          if (_get(state, 'selected.length', 0) + 1 > VIDEO_MAX_COUNT) {
            message.info(`语音/视频连接上限为${VIDEO_MAX_COUNT}，请关闭部分监控界面后重试`);
            return;
          }
          const data = await commonVideoMonitorFun(item);
          if (_get(data, 'RetCode') === -1) {
            return message.info(_get(data, 'Description', ''));
          }
          const newData = listData.map((x: any) => {
            if (x.licnum === item.licnum) {
              return { ...x, video: true };
            }
            return x;
          });
          setListData(newData);

          setVisible(true);

          handleSeletedData({
            item,
            videoAddress: _get(data, 'VideoAddress', ''),
            video: true,
            setVisible,
            state,
            dispatch,
          });
        }}
      />
    );
  }

  function getAudioImg(item: any) {
    return (
      <img
        alt=""
        src={item.audio ? hangUp_small : audio_small} //拨出或挂断
        style={{ height: 26 }}
        className="ml20 mt4 pointer"
        onClick={async (event) => {
          event.stopPropagation();
          if (!item.audio && item.busy) {
            return message.info('终端对讲通道被占用');
          }
          if (item.spinning) {
            return message.info('终端呼入中，无法进行呼出');
          }
          const filter = _get(state, 'selected', []).filter((x: any) => {
            return x.licnum == item.licnum;
          });
          if (_get(filter, 'length', 0) > 0 && _get(filter, '0.calling')) {
            return message.info('正在建立语音连接');
          }
          if (item.audio) {
            //如果已经拨通了则点击该按钮会【挂断】
            wsArray[item.id] && wsArray[item.id].close();
            recArray[item.id] && recArray[item.id].stop();
            await _carTalkControl({ CarLicence: _get(item, 'licnum', ''), VoiceTalk: '2' });
            const newData = listData.map((x: any) => {
              if (x.licnum === item.licnum) {
                return { ...x, audio: false };
              }
              return x;
            });
            setListData(newData);
            dispatch({
              type: 'mapWithCondition',
              payLoad: { audio: false },
              licnum: item.licnum,
            });
            return;
          }
          if (item.video !== true && _get(state, 'selected.length', 0) + 1 > VIDEO_MAX_COUNT) {
            message.info(`语音/视频连接上限为${VIDEO_MAX_COUNT}，请关闭部分监控界面后重试`);
            return;
          }
          const data = await commonVideoMonitorFun(item);
          if (_get(data, 'RetCode') === -1) {
            message.info(_get(data, 'Description', ''));
          }
          setVisible(true);
          commonAudioFun({
            item,
            videoAddress: _get(data, 'VideoAddress'),
            setVisible,
            listData,
            setListData,
            recArray,
            wsArray,
            state,
            dispatch,
          });
        }}
      />
    );
  }

  return (
    <div style={{ background: '#060520', color: '#FFFFFF', height: '100vh', overflowY: 'hidden' }}>
      {/* {updatePluginVisible && (
        <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法获取视频资源" plugin="robotcoach_package.zip" />
      )} */}
      {/* {videoVisible && (
        <CarVideo
          onCancel={() => {
            setVideoVisible();
            setTalkRequestDelay(2000);
          }}
          currentData={currentData}
        />
      )} */}
      <div style={{ height: '10%', color: '#FFFFFF' }} className="flex-box p10">
        <span className="fz26 ml20 ">远方学车智能监控中心</span>
        <span className="bold flex1 fz36" style={{ textAlign: 'center', color: '#DC151B', letterSpacing: 8 }}>
          {Auth.get('schoolName')}
        </span>
        <span className="mr20">
          <img alt="" src={logo} style={{ height: 46 }} />
        </span>
      </div>
      <div style={{ height: '90%', display: 'flex', position: 'relative' }}>
        {detailVisible && (
          <div className="" style={{ width: commonWidth }}>
            <Detail
              onCancel={() => {
                setDetailVisible(false);
                setListVisible(true);
              }}
              currentData={currentData}
              setCurrentData={setCurrentData}
              wsArray={wsArray}
              recArray={recArray}
              setVisible={setVisible}
              listData={listData}
              setListData={setListData}
              resetFlowingModel={resetFlowingModel}
              state={state}
              dispatch={dispatch}
            />
          </div>
        )}
        {listVisible && (
          <div className="flex" style={{ width: commonWidth, alignItems: 'center', flexDirection: 'column' }}>
            <Input
              ref={inputRef}
              className="robotCoachInput"
              style={{
                background: '#060520',
                border: '1px solid #ED2A30',
                borderRadius: 20,
                width: 260,
                marginBottom: 10,
                height: 38,
              }}
              prefix={
                <img
                  alt=""
                  className="ml10 mr10"
                  src={search}
                  style={{ width: 15 }}
                  // onClick={() => {
                  //   setSearchCar(carInput);
                  // }}
                />
              }
              suffix={
                <div>
                  {carInput && (
                    <img
                      alt=""
                      src={close_small}
                      className="pointer mr10"
                      onClick={() => {
                        setCarInput('');
                        setSearchCar('');
                      }}
                      style={{ width: 16 }}
                    />
                  )}
                </div>
              }
              placeholder="输入车牌号"
              value={carInput}
              onChange={(e) => {
                const val = e.target.value;
                setCarInput(val);
              }}
              onKeyDown={(e) => {
                if (e.key == 'Enter') {
                  setSearchCar(carInput);
                }
              }}
            />
            <List
              // bordered
              style={{ height: 790, overflow: 'auto', padding: 10 }}
              className="demo-loadmore-list"
              loading={isLoading}
              itemLayout="horizontal"
              loadMore={loadMore}
              dataSource={sortList(listData)}
              split={false}
              renderItem={(item: any) => {
                const statusInit = _get(item, 'Status', '离线'); //硬件取到的数据
                const status = statusInit === '在线' ? (_get(item, 'stu_name', '') ? '训练中' : '待机') : '离线'; //实际要显示的数据
                // const status: any = '训练中'; //测试数据
                // const statusInit = '在线';
                return (
                  <List.Item
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      position: 'relative',
                      padding: '18px 0px 14px 20px',
                      width: 300,
                      background:
                        status === '训练中'
                          ? 'url(' + bg + ') no-repeat 0 0 /100% 100%'
                          : 'url(' + bg3 + ') no-repeat 0 0 /100% 100%', //'加了‘/’才生效'
                      marginBottom: 18,
                    }}
                    className="pointer  "
                    onClick={() => {
                      // 在线情况下双击执行方法 离线无效
                      if (statusInit === '在线') {
                        openFlowingModel(_get(item, 'licnum', ''));
                        setCurrentData(item);
                        setDetailVisible(true);
                        setListVisible(false);
                      }
                    }}
                  >
                    {/* <div
                    > */}
                    <div style={{ color: '#FFFFFF' }}>
                      <Row>
                        <span className="fz24 bold-400 mr10">{_get(item, 'licnum', '')}</span>
                        <div
                          className=" flex-box mr10"
                          style={{
                            borderRadius: 14,
                            background: getColorText(statusInit),
                            textAlign: 'center',
                            color: status === '离线' ? '#999999' : '#FFFFFF',
                            // padding: 4,
                            marginTop: 4,
                            height: 28,
                            fontSize: 16,
                            width: status === '训练中' ? 70 : 50,
                          }}
                        >
                          {status}
                        </div>
                        {status === '待机' && getVideoImg(item)}
                        {status === '待机' && getAudioImg(item)}
                      </Row>
                      {status === '训练中' && (
                        <div style={{ color: '#CFCFCF' }} className="mt10 fz20">
                          {_get(item, 'stu_name', '') && <Row>学员姓名：{_get(item, 'stu_name', '')}</Row>}
                          <Row>
                            {_get(item, 'stu_name', '') && (
                              <span>训练时长：{(Number(_get(item, 'stu_traintime', 0)) / 60).toFixed(0)}分钟</span>
                            )}
                            {status === '训练中' && getVideoImg(item)}
                            {status === '训练中' && getAudioImg(item)}
                          </Row>
                        </div>
                      )}
                    </div>
                    {/* </div> */}
                  </List.Item>
                );
              }}
            />
          </div>
        )}

        <div style={{ width: 'calc(100% - 300px)', position: 'relative' }}>
          {pointsData && isFinishedInitCarStatus && (
            <div onMouseOver={carInputBlur}>
              <Monitor
                id="carMonitor"
                str={pointsData}
                carStatus={carStatus}
                ref={monitorRef}
                isFlowingCar={isFlowingCar}
                openFlowingModel={openFlowingModel}
                carNumber={carNumber}
                isFullscreen={isFullscreen}
              />
            </div>
          )}
          {
            <span style={{ position: 'absolute', left: '10px', top: '10px', padding: 6 }}>
              <img
                alt=""
                className="pointer"
                style={{ width: 28 }}
                src={fullScreen}
                onClick={() => {
                  const instanceMap = monitorRef.current;
                  if (instanceMap) {
                    screen.toggle(findDOMNode(instanceMap));
                  }
                  screen.on('change', () => {
                    setIsFullscreen(screen.isFullscreen);
                  });
                }}
              />
            </span>
          }
          {Object.keys(statusData).length > 0 && (
            <div
              style={{
                position: 'absolute',
                left: '35%',
                top: '10px',
                padding: 10,
                background: 'rgba(18, 18, 43, 0.75)',
                color: '#FFFFFF',
                borderRadius: 30,
                paddingLeft: 20,
                width: 490,
                textAlign: 'center',
              }}
              className="fz24"
            >
              {statusArr.map((x: any, index: any) => {
                return <span className="mr20" key={index}>{`${x}：${_get(statusData, x, '')}`}</span>;
              })}
            </div>
          )}
          {visible && (
            <FooterVideo
              visible={visible}
              setVisible={setVisible}
              wsArray={wsArray}
              recArray={recArray}
              listData={listData}
              setListData={setListData}
              state={state}
              dispatch={dispatch}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MonitorManage;
