import { isEmpty } from 'lodash';
import { printPdf, _get } from 'utils';
import {
  _getContractFile,
  _getDriveTrainApplyReport,
  _getEmploymentApplyReport,
  _getFileUrl,
  _getSchContractTemp,
  _getStatisticTheoryClassRecord,
  _getStuClassRecordReportStageTaodaSubject,
  _getStuStageReportForLastVersion,
  _getStuStageReportStageTaoda,
  _getTrainClassReport,
  _trainExam,
} from './_api';
import { createTeachJournal, createTrainRecordData, previewTheoryLog } from './_printUtils';

export async function batchPrintFile(
  type: string,
  selectedRows: any[],
  subject: string,
  subjectcodeHash: any,
  traincodeHash: any,
  dispatch: any,
) {
  const win = window as any;
  let LODOP = win?.getLodop?.();
  if (!LODOP || !LODOP.VERSION || !LODOP.CVERSION) {
    return 'NO_SOFTWARE';
  }

  if (LODOP.CVERSION < '6.5.6.9') {
    console.log(LODOP.CVERSION);
    return 'LOW_VERSION';
  }

  const isOpen = await isLodopServiceOPen();
  if (isOpen.indexOf('Error') !== -1) {
    return 'NO_SOFTWARE';
  }

  dispatch({ type, payLoad: { status: 'printing' } });
  //电子合同
  if (type == 'contract') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      if (String(_get(selectedRows[i], 'contractflag', '')) === '0') {
        handleError(type, dispatch, {
          code: 'NOT_GENERATE',
          msg: '合同未生成',
        });
        errorCount++;
        continue;
      }
      const res = await _getSchContractTemp({ sid: selectedRows[i]['sid'] });
      if (Object.keys(_get(res, 'data', {})).length === 0) {
        handleError(type, dispatch, {
          code: 'NO_Template',
          msg: '当前没有该车型的合同内容项模板',
        });
        errorCount++;
        continue;
      }
      const res2 = await _getContractFile({ sid: selectedRows[i]['sid'] });
      if (!_get(res2, 'data')) {
        handleError(type, dispatch, {
          code: _get(res2, 'code'),
          msg: _get(res2, 'message'),
        });
        errorCount++;
        continue;
      }

      resArr.push(_get(res2, 'data'));
      // printPdf(_get(res2, 'data'), type, dispatch, LODOP);
    }
    resArr.forEach((item) => {
      if (item) {
        printPdf(item, type, dispatch, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return '';
  }
  //培训记录单
  if (type == 'train') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const res = await _trainExam({ id: selectedRows[i]['sid'] });
      if (!_get(res, 'data')) {
        handleError(type, dispatch, {
          code: _get(res, 'code'),
          msg: _get(res, 'message'),
        });
        errorCount++;
        continue;
      }

      resArr.push(_get(res, 'data'));
      // printPdf(_get(res, 'data'), type, dispatch, LODOP);
    }
    resArr.forEach((item) => {
      if (item) {
        printPdf(item, type, dispatch, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return '';
  }
  //老版本培训记录单
  if (type == 'train_old') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const res = await _getStuStageReportForLastVersion({ sid: selectedRows[i]['sid'] });
      if (!_get(res, 'data')) {
        handleError(type, dispatch, {
          code: _get(res, 'code'),
          msg: _get(res, 'message'),
        });
        errorCount++;
        continue;
      }

      resArr.push(_get(res, 'data'));
    }
    resArr.forEach((item) => {
      if (item) {
        printPdf(item, type, dispatch, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return '';
  }
  //结业证书
  if (type == 'graduation') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const res = await _getFileUrl({ id: selectedRows[i]['sid'] });

      console.log(type, i);
      if (!_get(res, 'data')) {
        handleError(type, dispatch, {
          code: _get(res, 'code'),
          msg: _get(res, 'message', '当前没有该车型的结业证书'),
        });
        errorCount++;
        continue;
      }

      resArr.push(_get(res, 'data'));
      // printPdf(_get(res, 'data'), type, dispatch, LODOP);
    }
    resArr.forEach((item) => {
      if (item) {
        printPdf(item, type, dispatch, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return '';
  }
  //电子申请表
  if (type == 'apply') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const res = await _getDriveTrainApplyReport({ id: selectedRows[i]['sid'] });
      if (!_get(res, 'data')) {
        handleError(type, dispatch, {
          code: _get(res, 'code'),
          msg: _get(res, 'message'),
        });
        errorCount++;
        continue;
      }
      resArr.push(_get(res, 'data'));
      // printPdf(_get(res, 'data'), type, dispatch, LODOP);
    }

    resArr.forEach((item) => {
      if (item) {
        printPdf(item, type, dispatch, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return '';
  }
  //教学日志
  if (type == 'journal') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      console.log(type, i);
      const res = await _getTrainClassReport({ id: selectedRows[i]['sid'], subject });
      if (!_get(res, 'data')) {
        handleError(type, dispatch, {
          code: _get(res, 'code'),
          msg: _get(res, 'message'),
        });
        errorCount++;
        continue;
      }

      resArr.push(_get(res, 'data'));
    }
    resArr.forEach((item) => {
      if (item) {
        printPdf(item, type, dispatch, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return;
  }
  //从业证书申领登记表
  if (type == 'practice') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      if (!supportPrint(selectedRows[i])) {
        errorCount++;
        handleError(type, dispatch, {
          code: 'NO_SUPPORT_TAO',
          msg: '该车型不支持从业证书申领登记表打印',
        });
        continue;
      }
      const res = await _getEmploymentApplyReport({ sid: selectedRows[i]['sid'] });
      if (!_get(res, 'data')) {
        handleError(type, dispatch, {
          code: _get(res, 'code'),
          msg: _get(res, 'message'),
        });
        errorCount++;
        continue;
      }
      resArr.push(_get(res, 'data'));
    }
    resArr.forEach((item) => {
      if (item) {
        printPdf(item, type, dispatch, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);

    return '';
  }
  //理论教学日志
  if (type == 'theory') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const res = await _getStatisticTheoryClassRecord({ sid: selectedRows[i]['sid'] });
      if (Object.keys(_get(res, 'data', {})).length === 0) {
        handleError(type, dispatch, {
          code: 'NO_MSG',
          msg: '暂无理论教学日志信息',
        });
        errorCount++;
        continue;
      }
      resArr.push(_get(res, 'data'));
    }
    resArr.forEach((item) => {
      if (item) {
        previewTheoryLog(item, true, subjectcodeHash, traincodeHash, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return '';
  }
  //培训记录单套打
  if (type == 'train_tao') {
    let errorCount = 0;
    let resArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      if (!supportPrint(selectedRows[i])) {
        errorCount++;
        handleError(type, dispatch, {
          code: 'NO_SUPPORT_TAO',
          msg: '该车型不支持培训记录单套打',
        });
        continue;
      }
      const res = await _getStuStageReportStageTaoda({ sid: selectedRows[i]['sid'] });
      const data = _get(res, 'data', {});
      if (Object.keys(data).length === 0) {
        handleError(type, dispatch, {
          code: _get(res, 'code'),
          msg: _get(res, 'message'),
        });
        errorCount++;
        continue;
      }
      resArr.push(data);
    }
    resArr.forEach((item) => {
      if (item) {
        createTrainRecordData(item, true, LODOP);
      }
    });
    handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
    return '';
  } //电子教学日志第一部分套打
  if (type == 'journal1_tao') {
    handleJournalTaoPrint(type, selectedRows, 1, dispatch, LODOP);

    return '';
  } //电子教学日志第二部分套打
  if (type == 'journal2_tao') {
    handleJournalTaoPrint(type, selectedRows, 2, dispatch, LODOP);
    return '';
  } //电子教学日志第三部分套打
  if (type == 'journal3_tao') {
    handleJournalTaoPrint(type, selectedRows, 3, dispatch, LODOP);
    return '';
  } //电子教学日志第四部分套打
  if (type == 'journal4_tao') {
    handleJournalTaoPrint(type, selectedRows, 4, dispatch, LODOP);
    return '';
  }
  return '';
}

//校验打印插件服务是否开启
function isLodopServiceOPen() {
  return fetch('http://localhost:8000/CLodopfuncs.js')
    .then((response) => {
      return '';
    })
    .catch((err) => {
      console.log(111, err);
      return err?.name || 'error';
    });
}
export function reducer(state: any, action: any) {
  const isAdd = _get(action, 'payLoad.isPrinted', false);
  const isError = _get(action, 'payLoad.isError', false);
  const isInit = _get(action, 'payLoad.isInit', false);
  const code = _get(action, 'payLoad.errorMsgMap.code', '');
  const msg = _get(action, 'payLoad.errorMsgMap.msg', '');
  const pid = _get(action, 'payLoad.pid', '');

  const errorMsgState = state[action.type].errorMsg || {};
  const total = errorMsgState[code] ? ++errorMsgState[code]['total'] : 0;
  if (isError) {
    return {
      ...state,
      [action.type]: {
        successCount: state[action.type].successCount,
        status: _get(action, 'payLoad.status', state[action.type].status),
        errorMsg: {
          ...errorMsgState,
          [code]: {
            total: errorMsgState[code] ? total : 1,
            msg,
          },
        },
      },
    };
  }
  if (isInit) {
    return {
      ...state,
      [action.type]: {
        successCount: 0,
        status: 'not-print',
        errorMsg: {},
        printId: [],
      },
    };
  }
  return {
    ...state,
    [action.type]: {
      successCount: isAdd ? state[action.type].successCount + 1 : state[action.type].successCount,
      status: _get(action, 'payLoad.status', state[action.type].status),
      errorMsg: errorMsgState,
    },
  };
}
//打印回调，获取打印是否执行成功
function handlePrintCallback(selectedRows: any, LODOP: any, dispatch: any, type: string, errorCount = 0) {
  let i = 0;
  const len = selectedRows.length;
  if (errorCount == len) {
    handlePrinted(type, dispatch);
    return;
  }
  LODOP.On_Return_Remain = true;
  LODOP.On_Return = function (TaskID: any, Value: any) {
    if (Value === true) {
      i++;
      dispatch({ type, payLoad: { status: 'printing', isPrinted: true } });
      console.log('已发出实际打印命令！');
    } else {
      console.log('放弃打印！');
    }
    console.log(type, TaskID, Value, i, '=========');
    if (i + errorCount == len) {
      handlePrinted(type, dispatch);
    }
  };
}
//是否支持打印
function supportPrint(record: any) {
  return (
    _get(record, 'traintype', '') === 'A2' ||
    _get(record, 'traintype', '') === 'B2' ||
    _get(record, 'transCarType', '') === 'A2' ||
    _get(record, 'transCarType', '') === 'B2'
  );
}
function isTaodaDataEmpty(subject: number, data: any = {}) {
  if (subject === 1) {
    return isEmpty(data?.stuClassrecordStageOneTaodaDto || {});
  }
  if (subject === 2) {
    return isEmpty(data?.stuClassrecordStageTwoTaodaDto || {});
  }
  if (subject === 3) {
    return isEmpty(data?.stuClassrecordStageThreeTaodaDto || {});
  }
  if (subject === 4) {
    return isEmpty(data?.stuClassrecordStageFourTaodaDto || {});
  }
  return true;
}
//电子教学日志套打
async function handleJournalTaoPrint(type: string, selectedRows: any, subject: number, dispatch: any, LODOP: any) {
  let errorCount = 0;
  let resArr = [];
  for (let i = 0; i < selectedRows.length; i++) {
    if (!supportPrint(selectedRows[i])) {
      handleError(type, dispatch, {
        code: 'NO_SUPPORT_TAO',
        msg: '该车型不支持电子教学日志套打',
      });
      errorCount++;
      continue;
    }
    const res = await _getStuClassRecordReportStageTaodaSubject({ sid: selectedRows[i]['sid'], subject });
    const data = _get(res, 'data', {});
    console.log(type, i);
    if (Object.keys(data).length === 0) {
      handleError(type, dispatch, {
        code: _get(res, 'code'),
        msg: _get(res, 'message'),
      });
      errorCount++;
      continue;
    }
    if (isTaodaDataEmpty(subject, data)) {
      handleError(type, dispatch, {
        code: 'NO_MESSAGE',
        msg: '暂无数据',
      });
      errorCount++;
      continue;
    }
    resArr.push(data);

    // dispatch({ type, payLoad: { status: 'printing', pid } });
  }

  resArr.forEach((item) => {
    if (item) {
      createTeachJournal(item, subject, true, LODOP);
    }
  });
  handlePrintCallback(selectedRows, LODOP, dispatch, type, errorCount);
  return '';
}

function handleError(type: string, dispatch: any, errorMsgMap?: any) {
  dispatch({ type, payLoad: { status: 'printing', isError: true, errorMsgMap } });
}

function handlePrinted(type: string, dispatch: any) {
  dispatch({ type, payLoad: { status: 'printed', isError: false } });
}

export const initialState = {
  //TODO:
  journal: { successCount: 0, status: 'not-print', errorMsg: {}, printId: [] },
  graduation: { successCount: 0, status: 'not-print', errorMsg: {}, printId: [] },
  contract: { successCount: 0, status: 'not-print', errorMsg: {} },
  train: { successCount: 0, status: 'not-print', errorMsg: {} },
  train_old: { successCount: 0, status: 'not-print', errorMsg: {} },
  apply: { successCount: 0, status: 'not-print', errorMsg: {} },
  practice: { successCount: 0, status: 'not-print', errorMsg: {} },
  theory: { successCount: 0, status: 'not-print', errorMsg: {} },
  train_tao: { successCount: 0, status: 'not-print', errorMsg: {} },
  journal1_tao: { successCount: 0, status: 'not-print', errorMsg: {}, printId: [] },
  journal2_tao: { successCount: 0, status: 'not-print', errorMsg: {}, printId: [] },
  journal3_tao: { successCount: 0, status: 'not-print', errorMsg: {}, printId: [] },
  journal4_tao: { successCount: 0, status: 'not-print', errorMsg: {}, printId: [] },
};

export const typeTextMap = [
  {
    type: 'contract',
    text: '电子合同',
  },
  {
    type: 'train',
    text: '培训记录单',
  },
  {
    type: 'train_old',
    authId: 'student/studentInfo:btn22',
    text: '老版本培训记录单',
  },
  {
    type: 'graduation',
    text: '结业证书',
  },
  {
    type: 'apply',
    text: '电子申请表',
  },
  {
    type: 'journal',
    text: '教学日志',
  },
  {
    type: 'practice',
    authId: 'student/studentInfo:btn23',
    text: '从业证书申领登记表',
  },
  {
    type: 'theory',
    authId: 'student/studentInfo:btn29',
    text: '理论教学日志',
  },
];

export const typeTextTaoPrintMap = [
  {
    type: 'train_tao',
    authId: 'student/studentInfo:btn18',
    text: '培训记录单',
  },
  {
    type: 'journal1_tao',
    authId: 'student/studentInfo:btn19',
    text: '电子教学日志第一部分',
  },
  {
    type: 'journal2_tao',
    authId: 'student/studentInfo:btn19',
    text: '电子教学日志第二部分',
  },
  {
    type: 'journal3_tao',
    authId: 'student/studentInfo:btn19',
    text: '电子教学日志第三部分',
  },
  {
    type: 'journal4_tao',
    authId: 'student/studentInfo:btn19',
    text: '电子教学日志第四部分',
  },
];
export function filterArray(_arr: any, elementAuthTable: any) {
  var length = _arr.length;
  for (var i = 0; i < length; i++) {
    if (_arr[i]?.authId && !elementAuthTable[_arr[i]?.authId]) {
      _arr.splice(i, 1); //删除下标为i的元素
    }
  }
  return _arr;
}
