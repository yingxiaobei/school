import { audioUtil } from '../audioUtil';
import { _carControl, _get, _getVideoViewCar, _carTalkControl } from 'utils';
import { message } from 'antd';

export const VIDEO_MAX_COUNT = 9;

export function handleSeletedData(props: any) {
  const {
    item,
    videoAddress,
    video = false,
    audio = false,
    calling = false,
    spinning = false,
    ws = undefined,
    rec = undefined,
    callInTimeout = false,
    busy = false,
    hangUpFromCar = false,
    hangUpFromBrowser = false,
    isPush = true,
    setVisible,
    state,
    dispatch,
  } = props;
  dispatch({
    type: 'handleSelect',
    payLoad: {
      ...item,
      videoAddress,
      video,
      calling,
      audio,
      spinning,
      ws,
      rec,
      callInTimeout,
      hangUpFromCar,
      hangUpFromBrowser,
      busy,
    },
    isPush,
    setVisible,
  });
}
export function reducer(state: any, action: any) {
  switch (action.type) {
    case 'handleSelect':
      if (
        _get(state, 'selected', []).every((x: any) => {
          return x.licnum !== action.payLoad.licnum;
        }) &&
        action.isPush
      ) {
        if (_get(state, 'selected.length', 0) + 1 > VIDEO_MAX_COUNT) {
          message.info(`语音/视频连接上限为${VIDEO_MAX_COUNT}，请关闭部分监控界面后重试`);
          return {
            selected: _get(state, 'selected', []),
          };
        }
        action.setVisible(true);
        return {
          selected: [..._get(state, 'selected', []), action.payLoad],
        };
      } else {
        const data = _get(state, 'selected', []).map((x: any) => {
          if (x.licnum === action.payLoad.licnum) {
            return action.payLoad;
          }
          return x;
        });
        return {
          selected: data,
        };
      }
    case 'map':
      const data = _get(state, 'selected', []).map((x: any) => {
        return { ...x, ...action.payLoad };
      });
      return {
        selected: data,
      };
    case 'addSpinning': //处理未在seleted,终端呼入
      if (
        _get(state, 'selected', []).every((x: any) => {
          return x.licnum !== action.licnum;
        })
      ) {
        return {
          selected: [..._get(state, 'selected', []), action.payLoad],
        };
      } else {
        return { selected: _get(state, 'selected', []) };
      }
    case 'mapWithCondition':
      const data2 = _get(state, 'selected', []).map((x: any) => {
        if (x.licnum === action.licnum) {
          return { ...x, ...action.payLoad };
        }
        return x;
      });
      return {
        selected: data2,
      };
    case 'filterSet':
      const selected = _get(state, 'selected', []).filter((item: any) => {
        return !(item.licnum === action.licnum);
      });
      return { selected };
    default:
      throw new Error();
  }
}
export async function commonAudioFun(props: any) {
  const {
    item,
    videoAddress,
    setVisible,
    listData,
    setListData,
    recArray,
    wsArray,
    state,
    dispatch,
    setCurrentData,
    currentData,
  } = props;
  setVisible(true);
  handleSeletedData({
    item,
    videoAddress,
    video: true,
    calling: true,
    isPush: true,
    callInTimeout: false,
    busy: false,
    hangUpFromCar: false,
    hangUpFromBrowser: false,
    setVisible,
    state,
    dispatch,
  });

  //向终端下发语音请求指令，收到返回成功后打开wss语音
  //等待终端接听，60s超时
  const res = await _carControl({
    CarLicence: _get(item, 'licnum', ''), // 车牌号
    ControlType: '2', // 1：刹车控制 2：对讲状态
    status: '1', //1：使能 2：禁能
  });
  if (_get(res, 'RetCode') === 1) {
    //拒绝
    handleSeletedData({
      item,
      videoAddress,
      video: true,
      calling: false,
      isPush: false,
      callInTimeout: false,
      busy: false,
      hangUpFromCar: false,
      hangUpFromBrowser: false,
      setVisible,
      state,
      dispatch,
    });
    return message.error('终端已拒绝');
  }
  if (_get(res, 'RetCode') === -1) {
    //超时
    handleSeletedData({
      item,
      videoAddress,
      video: true,
      calling: false,
      isPush: false,
      callInTimeout: false,
      hangUpFromCar: false,
      hangUpFromBrowser: false,
      busy: false,
      setVisible,
      state,
      dispatch,
    });

    message.error(_get(res, 'Description'));
    await _carControl({
      CarLicence: _get(item, 'licnum', ''), // 车牌号
      ControlType: '2', // 1：刹车控制 2：对讲状态
      status: '2', //1：使能 2：禁能
    });
    return;
  }
  // if (!_get(state, 'selected', []).find((x: any) => x.licnum === item.licnum)) {
  //   return; //seletedData可能在请求返回时已被删除
  // }
  // if (_get(state, 'selected.length', 0) + 1 > VIDEO_MAX_COUNT) {
  //   message.info(`语音/视频连接上限为${VIDEO_MAX_COUNT}，请关闭部分监控界面后重试`);
  //   return;
  // }

  if (currentData && setCurrentData) {
    setCurrentData({ ...currentData, audio: true, video: true });
  }

  audioUtil(
    item,
    async (rec: any, ws: any) => {
      if (!rec || !ws) {
        await _carTalkControl({ CarLicence: _get(item, 'licnum', ''), VoiceTalk: '0' });
        dispatch({
          type: 'mapWithCondition',
          payLoad: { audio: false, calling: false },
          licnum: _get(item, 'licnum', ''),
        });
        const newData = listData.map((x: any) => {
          if (x.licnum === item.licnum) {
            return { ...x, audio: false, video: true };
          }
          return x;
        });
        setListData(newData);
        return;
      }
      recArray[item.id] = rec;
      wsArray[item.id] = ws;
      const newData = listData.map((x: any) => {
        if (x.licnum === item.licnum) {
          return { ...x, audio: true, video: true };
        }
        return x;
      });
      setListData(newData);
      handleSeletedData({
        item,
        videoAddress,
        ws,
        rec,
        audio: true,
        video: true,
        calling: false,
        isPush: false,
        callInTimeout: false,
        hangUpFromCar: false,
        hangUpFromBrowser: false,
        busy: false,
        setVisible,
        state,
        dispatch,
      });
    },
    _get(item, 'id', ''),
    false,
  );
}
