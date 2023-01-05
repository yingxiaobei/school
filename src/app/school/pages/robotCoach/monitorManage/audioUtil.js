import { _carTalkControl } from 'utils';
import { _get, Auth } from 'utils';
import { message } from 'antd';

var ws = [];
let wsId = '';
let recArr = [];
//录音对象
var Recorder = function (stream) {
  var sampleBits = 16; //输出采样数位 8, 16
  var sampleRate = 8000; //输出采样率
  var context = new AudioContext();
  var audioInput = context.createMediaStreamSource(stream);
  var recorder = context.createScriptProcessor(4096, 1, 1);
  var audioData = {
    size: 0, //录音文件长度
    buffer: [], //录音缓存
    inputSampleRate: 48000, //输入采样率
    inputSampleBits: 16, //输入采样数位 8, 16
    outputSampleRate: sampleRate, //输出采样数位
    oututSampleBits: sampleBits, //输出采样率
    clear: function () {
      this.buffer = [];
      this.size = 0;
    },
    input: function (data) {
      const arr = new Float32Array(data);
      this.buffer.push(arr);
      this.size += data.length;
    },
    compress: function () {
      //合并压缩
      //合并
      var data = new Float32Array(this.size);
      var offset = 0;
      for (var i = 0; i < this.buffer.length; i++) {
        data.set(this.buffer[i], offset);
        offset += this.buffer[i]['length'];
      }
      //压缩
      const rate = this.inputSampleRate / this.outputSampleRate;
      var compression = parseInt(rate);
      var length = data.length / compression;
      var result = new Float32Array(length);
      var index = 0,
        j = 0;
      while (index < length) {
        result[index] = data[j];
        j += compression;
        index++;
      }
      return result;
    },
    encodePCM: function () {
      //这里不对采集到的数据进行其他格式处理，如有需要均交给服务器端处理。
      var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
      var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
      var bytes = this.compress();
      var dataLength = bytes.length * (sampleBits / 8);
      var buffer = new ArrayBuffer(dataLength);
      var data = new DataView(buffer);
      var offset = 0;
      for (var i = 0; i < bytes.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, bytes[i]));
        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      return new Blob([data]);
    },
  };

  var sendData = function () {
    //对以获取的数据进行处理(分包)
    var reader = new FileReader();
    reader.onload = (e) => {
      var outbuffer = e.target.result;
      var arr = new Int8Array(outbuffer);
      if (arr.length > 0) {
        var tmparr = new Int8Array(1024);
        var j = 0;
        for (var i = 0; i < arr.byteLength; i++) {
          tmparr[j++] = arr[i];
          if ((i + 1) % 1024 == 0) {
            if (ws[wsId] && ws[wsId].readyState === 1) {
              ws[wsId] && ws[wsId].send(tmparr);
            }
            if (arr.byteLength - i - 1 >= 1024) {
              tmparr = new Int8Array(1024);
            } else {
              tmparr = new Int8Array(arr.byteLength - i - 1);
            }
            j = 0;
          }
          if (i + 1 == arr.byteLength && (i + 1) % 1024 != 0) {
            if (ws[wsId] && ws[wsId].readyState === 1) {
              ws[wsId] && ws[wsId].send(tmparr);
            }
          }
        }
      }
    };
    reader.readAsArrayBuffer(audioData.encodePCM());
    audioData.clear(); //每次发送完成则清理掉旧数据
  };
  this.start = function () {
    audioInput.connect(recorder);
    recorder.connect(context.destination);
  };

  this.stop = function () {
    audioInput.disconnect();
    recorder.disconnect();
    // if (stream) {
    // stream.getAudioTracks().forEach(function (track) {
    //   track.stop();
    // });
    // stream = null;
    // }
  };

  this.getBlob = function () {
    return audioData.encodePCM();
  };

  this.clear = function () {
    audioData.clear();
  };

  recorder.onaudioprocess = function (e) {
    var inputBuffer = e.inputBuffer.getChannelData(0);
    audioData.input(inputBuffer);
    sendData();
  };
};

function uWebSocket(rec, currentData, id, isFromTerminal) {
  const INTRANET_IP = Auth.get('intranetIP') || '192.168.191.34'; //TODO:默认值，后续删除
  const INTRANET_PORT = '5558'; //TODO:目前写死
  const INTRANET_ADDRESS = `${INTRANET_IP}:${INTRANET_PORT}`; //内网地址
  ws[id] = new WebSocket(`wss://${INTRANET_ADDRESS}/websocket`);
  ws[id].binaryType = 'arraybuffer'; //传输的是 ArrayBuffer 类型的数据
  ws[id].onopen = async function () {
    console.log('握手成功');
    if (isFromTerminal) {
      // const res = await _talkbackResponse({ CarLicences: _get(currentData, 'licnum', '') }); // 允许指定车辆打开语音，针对服务；
      await _carTalkControl({ CarLicence: _get(currentData, 'licnum', ''), VoiceTalk: '1' }); // 开启车辆语音，针对终端（服务会转发给终端）
      // console.log(res);
      // if (_get(res, 'RetCode') !== 0) {
      //   return message.error('对讲失败');
      // }
    } else {
      await _carTalkControl({ CarLicence: _get(currentData, 'licnum', ''), VoiceTalk: '1' }); // 开启车辆语音，针对终端（服务会转发给终端）
    }

    message.info('连接成功，开始对讲');
    if (ws[id].readyState == 1) {
      //ws进入连接状态，则每隔500毫秒发送一包数据
      rec.start();
    }
  };
  ws[id].onmessage = function (msg) {
    console.info(msg);
  };

  ws[id].onerror = function (err) {
    console.log(err);
    ws[id].close();
  };
  return ws[id];
}

export function audioUtil(currentData, callback, id, isFromTerminal) {
  wsId = id;
  // eslint-disable-next-line no-self-assign
  navigator.getUserMedia = navigator.getUserMedia /* || navigator.webkitGetUserMedia */;
  if (!navigator.getUserMedia) {
    alert('浏览器不支持音频输入');
  } else {
    navigator.getUserMedia(
      {
        audio: true,
      },
      function (mediaStream) {
        recArr[id] = new Recorder(mediaStream);
        // setRecord(rec);
        const ws = uWebSocket(recArr[id], currentData, id, isFromTerminal);
        callback(recArr[id], ws);
      },
      function (error) {
        console.log(error);
        callback('', '');
        switch (error.message || error.name) {
          case 'PERMISSION_DENIED':
          case 'PermissionDeniedError':
            message.error('用户拒绝提供信息。');
            break;
          case 'NOT_SUPPORTED_ERROR':
          case 'NotSupportedError':
            message.error('浏览器不支持硬件设备。');
            break;
          case 'MANDATORY_UNSATISFIED_ERROR':
          case 'MandatoryUnsatisfiedError':
            message.error('无法发现指定的硬件设备。');
            break;
          default:
            message.error('无法打开麦克风');
            console.info('无法打开麦克风。异常信息:' + (error.code || error.name));
            break;
        }
      },
    );
  }
}
