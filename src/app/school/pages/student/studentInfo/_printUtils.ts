import {
  getTeachJournalImg1,
  getTeachJournalImg2,
  getTeachJournalImg3,
  getTeachJournalImg4,
  getTrainRecordImg,
  getBase64Img,
} from './printImg';

import { _get } from 'utils';

function formatHourMin(time: number) {
  return Math.floor(time / 60) + '小时' + (time % 60) + '分';
}

// 预览打印理论教学日志
// isPrint:是否直接打印 true:是 否：预览
export async function previewTheoryLog(
  data: any = {},
  isPrint = false,
  subjectcodeHash: any,
  traincodeHash: any,
  LODOP1?: any,
) {
  const win = window as any;
  let LODOP = LODOP1 ? LODOP1 : win.getLodop();
  console.log(LODOP);
  if (!LODOP || !LODOP.VERSION) {
    return 'NO_SOFTWARE';
  }

  LODOP.PRINT_INIT('打印控件功能演示_Lodop功能_打印表格');
  LODOP.SET_PRINT_PAGESIZE(1, 0, 0, 'A4');
  LODOP.SET_PRINT_MODE('PROGRAM_CONTENT_BYVAR', true);
  LODOP.ADD_PRINT_TEXT(123, 80, 151, 20, '训练开始时间');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.ADD_PRINT_TEXT(123, 230, 153, 20, '训练结束时间');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.ADD_PRINT_TEXT(123, 380, 104, 20, '合计时间');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.ADD_PRINT_TEXT(123, 483, 65, 20, '培训科目');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.ADD_PRINT_TEXT(123, 549, 85, 20, '教练员');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.ADD_PRINT_TEXT(123, 632, 100, 20, '理论类型');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  const records = _get(data, 'classRecords', []);
  data['totaltime_0'] = _get(data, 'totalTime');
  data['totaltime_1'] = _get(data, 'subjectOneTime');
  data['totaltime_4'] = _get(data, 'subjectFourTime');
  var cType,
    nType,
    e = [],
    h = 0,
    hh = 0,
    size = 20,
    max = 706;
  const records1 = records.filter((x: any) => {
    return x.subjectcode === '1';
  });
  const records4 = records.filter((x: any) => {
    return x.subjectcode === '4';
  });
  const recordsAll = [...records1, ...records4];
  for (var i = 0, len = recordsAll.length; i < len; i++) {
    var record = recordsAll[i],
      // eslint-disable-next-line @typescript-eslint/no-redeclare
      nType = record.subjectcode;
    if (cType && cType != nType) {
      LODOP.ADD_PRINT_TEXT(145 + h, 223, 37, 20, '小计');
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
      LODOP.ADD_PRINT_TEXT(145 + h, 381, 105, 20, formatHourMin(data['totaltime_' + cType] || 0));
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
      cType = nType;
      h = h + size;
      if (h > max) {
        LODOP.NEWPAGE();
        h = 0;
      }
    }
    cType = record.subjectcode;
    LODOP.ADD_PRINT_TEXT(145 + h, 81, 150, 20, record.signstarttime);
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
    LODOP.ADD_PRINT_TEXT(145 + h, 231, 150, 20, record.signendtime);
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
    LODOP.ADD_PRINT_TEXT(145 + h, 381, 104, 20, formatHourMin(_get(record, 'duration', 0)));
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
    LODOP.ADD_PRINT_TEXT(145 + h, 484, 65, 20, subjectcodeHash[_get(record, 'subjectcode')]);
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
    LODOP.ADD_PRINT_TEXT(145 + h, 548, 85, 20, record.coachname);
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
    LODOP.ADD_PRINT_TEXT(145 + h, 632, 100, 20, traincodeHash[_get(record, 'traincode')]);
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
    LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
    h = h + size;
    hh = h;
    if (h > max) {
      LODOP.NEWPAGE();
      h = 0;
    }
  }
  console.log(data);
  LODOP.ADD_PRINT_TEXT(145 + hh, 223, 37, 20, '小计');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.ADD_PRINT_TEXT(145 + hh, 381, 105, 20, formatHourMin(data['totaltime_' + nType] || 0));
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.ADD_PRINT_TEXT(166 + hh, 223, 69, 19, '累计时间');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.ADD_PRINT_TEXT(166 + hh, 381, 136, 20, formatHourMin(_get(data, 'totaltime_0', 0)));
  //LODOP.ADD_PRINT_TEXT(166+h,453,270,19,"(模拟:"+formatMin(data.totaltime_03) +" 电动车:)");
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.ADD_PRINT_TEXT(898, 94, 57, 20, '总计:');
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  LODOP.ADD_PRINT_TEXT(898, 139, 93, 20, formatHourMin(_get(data, 'totaltime_0', 0)));
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
  //LODOP.ADD_PRINT_TEXT(898,222,57,20,"科目三:");
  //LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
  //LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
  //LODOP.ADD_PRINT_TEXT(898,346,48,20,"总计:");
  //LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
  //LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
  //LODOP.ADD_PRINT_TEXT(898,265,88,20,formatMin(data.totaltime_3));
  //LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
  //LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
  //LODOP.ADD_PRINT_TEXT(898,470,153,20,"审批前(术科二)时间：");
  //LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
  //LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
  //LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
  //LODOP.ADD_PRINT_TEXT(898,379,94,20,formatMin(data.totaltime));
  //LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
  //LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
  //LODOP.ADD_PRINT_TEXT(898,598,95,20,formatMin(data.totaltime));
  //LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
  //LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
  LODOP.ADD_PRINT_LINE(115, 53, 116, 740, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(77, 52, 79, 740, 0, 3);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(1064, 51, 1067, 742, 0, 3);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(78, 51, 1065, 54, 0, 3);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(77, 740, 1064, 743, 0, 3);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(115, 113, 76, 114, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(115, 189, 76, 190, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(77, 257, 116, 258, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(115, 415, 76, 416, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(115, 503, 76, 504, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(116, 549, 77, 550, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(115, 599, 76, 600, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(42, 274, 228, 35, '理论教学日志');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 20);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(86, 56, 57, 30, '姓名');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(86, 190, 67, 30, '身份证');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(86, 415, 87, 30, '培训车型');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(85, 548, 50, 30, '学号');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(985, 79, 115, 80, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(985, 52, 986, 740, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(920, 80, 921, 740, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(946, 78, 111, 31, '学员签字');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(1065, 190, 920, 191, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(985, 400, 919, 401, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_LINE(986, 516, 920, 517, 0, 1);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(931, 400, 116, 51, '教练员评价及签字');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(1002, 71, 95, 51, '培训机构审核意见');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXT(478, 51, 30, 198, '培训计时记录');
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.ADD_PRINT_TEXTA('studentname', 86, 108, 89, 30, data.studentName);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'ContentVName', 'data.studentname');
  LODOP.ADD_PRINT_TEXTA('idnum', 87, 255, 163, 30, data.idCard);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'ContentVName', 'data.idnum');
  LODOP.ADD_PRINT_TEXTA('drivecartype', 86, 505, 42, 30, data.trainType);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 14);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'ContentVName', 'data.drivecartype');
  LODOP.ADD_PRINT_TEXTA('printcode', 88, 599, 145, 30, data.studentCode);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12);
  LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2);
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'ContentVName', 'data.printcode');
  // LODOP.SAVE_TO_FILE("新文件名.xls");
  if (isPrint) {
    const pid = LODOP.PRINT();
    return LODOP.GET_VALUE('PRINT_STATUS_OK', pid);
  } else {
    LODOP.PREVIEW();
  }
}
export async function createTrainRecordData(data: any, isPrint = false, LODOP1?: any) {
  const win = window as any;
  let LODOP = LODOP1 ? LODOP1 : win.getLodop();
  if (!LODOP || !LODOP.VERSION) {
    return 'NO_SOFTWARE';
  }
  const trainRecordImg: any = getTrainRecordImg();
  const k1_studen_date = _get(data, 'stuStageReportStageOneTaodaDto.k1_studen_date', '').split('-');
  const k2_studen_date = _get(data, 'stuStageReportStageTwoTaodaDto.k2_studen_date', '').split('-');
  const k3_studen_date = _get(data, 'stuStageReportStageThreeTaodaDto.k3_studen_date', '').split('-');
  const k1_coach_date = _get(data, 'stuStageReportStageOneTaodaDto.k1_coach_date', '').split('-');
  const k2_coach_date = _get(data, 'stuStageReportStageTwoTaodaDto.k2_coach_date', '').split('-');
  const k3_coach_date = _get(data, 'stuStageReportStageThreeTaodaDto.k3_coach_date', '').split('-');
  const k1_school_date = _get(data, 'stuStageReportStageOneTaodaDto.k1_school_date', '').split('-');
  const k2_school_date = _get(data, 'stuStageReportStageTwoTaodaDto.k2_school_date', '').split('-');
  const k3_school_date = _get(data, 'stuStageReportStageThreeTaodaDto.k3_school_date', '').split('-');
  const k1_jggz_date = _get(data, 'stuStageReportStageOneTaodaDto.k1_jggz_date', '').split('-');
  const k2_jggz_date = _get(data, 'stuStageReportStageTwoTaodaDto.k2_jggz_date', '').split('-');
  const k3_jggz_date = _get(data, 'stuStageReportStageThreeTaodaDto.k3_jggz_date', '').split('-');
  const k1_studen_date_year = _get(k1_studen_date, '0', '');
  const k2_studen_date_year = _get(k2_studen_date, '0', '');
  const k3_studen_date_year = _get(k3_studen_date, '0', '');
  const k3_studen_date_month = _get(k3_studen_date, '1', '');
  const k3_studen_date_day = _get(k3_studen_date, '2', '');
  const k2_studen_date_day = _get(k2_studen_date, '2', '');
  const k2_studen_date_month = _get(k2_studen_date, '1', '');
  const k1_studen_date_month = _get(k1_studen_date, '1', '');
  const k1_studen_date_day = _get(k1_studen_date, '2', '');
  const k1_coach_date_year = _get(k1_coach_date, '0', '');
  const k1_coach_date_month = _get(k1_coach_date, '1', '');
  const k1_coach_date_day = _get(k1_coach_date, '2', '');
  const k2_coach_date_year = _get(k2_coach_date, '0', '');
  const k2_coach_date_month = _get(k2_coach_date, '1', '');
  const k2_coach_date_day = _get(k2_coach_date, '2', '');
  const k3_coach_date_year = _get(k3_coach_date, '0', '');
  const k3_coach_date_month = _get(k3_coach_date, '1', '');
  const k3_coach_date_day = _get(k3_coach_date, '2', '');

  const k1_school_date_year = _get(k1_school_date, '0', '');
  const k1_school_date_month = _get(k1_school_date, '1', '');
  const k1_school_date_day = _get(k1_school_date, '2', '');
  const k2_school_date_year = _get(k2_school_date, '0', '');
  const k2_school_date_month = _get(k2_school_date, '1', '');
  const k2_school_date_day = _get(k2_school_date, '2', '');
  const k3_school_date_year = _get(k3_school_date, '0', '');
  const k3_school_date_month = _get(k3_school_date, '1', '');
  const k3_school_date_day = _get(k3_school_date, '2', '');
  const k1_jggz_date_year = _get(k1_jggz_date, '0', '');
  const k1_jggz_date_month = _get(k1_jggz_date, '1', '');
  const k1_jggz_date_day = _get(k1_jggz_date, '2', '');
  const k2_jggz_date_year = _get(k2_jggz_date, '0', '');
  const k2_jggz_date_month = _get(k2_jggz_date, '1', '');
  const k2_jggz_date_day = _get(k2_jggz_date, '2', '');
  const k3_jggz_date_year = _get(k3_jggz_date, '0', '');
  const k3_jggz_date_month = _get(k3_jggz_date, '1', '');
  const k3_jggz_date_day = _get(k3_jggz_date, '2', '');

  const studentname = _get(data, 'stuStageReportStuInfoTaodaDto.studentname');
  const stusex = _get(data, 'stuStageReportStuInfoTaodaDto.stusex');
  const stuidnum = _get(data, 'stuStageReportStuInfoTaodaDto.stuidnum');
  const signdate = _get(data, 'stuStageReportStuInfoTaodaDto.signdate');
  const address = _get(data, 'stuStageReportStuInfoTaodaDto.address');
  const telnum = _get(data, 'stuStageReportStuInfoTaodaDto.telnum');
  const stuimg = _get(data, 'stuStageReportStuInfoTaodaDto.stuimg');
  // const stuBase64Img = await getBase64Img(stuimg);

  const stuimg_b64 = 'data:image/jpg;base64,' + _get(data, 'stuStageReportStuInfoTaodaDto.stuimg_b64', '');
  const jggz_b64 = 'data:image/png;base64,' + _get(data, 'stuStageReportStuInfoTaodaDto.jggz_b64', '');
  const jxgz_b64 = 'data:image/png;base64,' + _get(data, 'stuStageReportStuInfoTaodaDto.jxgz_b64', '');
  // const stuimgHtml = stuBase64Img ? `<img src='${stuBase64Img}'/>` : '';
  const k1_totaltime = _get(data, 'stuStageReportStageOneTaodaDto.k1_totaltime');
  const k2_totaltime = _get(data, 'stuStageReportStageTwoTaodaDto.k2_totaltime');
  const k3_totaltime = _get(data, 'stuStageReportStageThreeTaodaDto.k3_totaltime');
  const k1_studen_name = _get(data, 'stuStageReportStageOneTaodaDto.k1_studen_name');
  const k2_studen_name = _get(data, 'stuStageReportStageTwoTaodaDto.k2_studen_name');
  const k3_studen_name = _get(data, 'stuStageReportStageThreeTaodaDto.k3_studen_name');
  const k1_coach_name = _get(data, 'stuStageReportStageOneTaodaDto.k1_coach_name');
  const k2_coach_name = _get(data, 'stuStageReportStageTwoTaodaDto.k2_coach_name');
  const k3_coach_name = _get(data, 'stuStageReportStageThreeTaodaDto.k3_coach_name');
  const k1_jxgz = _get(data, 'stuStageReportStageOneTaodaDto.k1_jxgz');
  const k2_jxgz = _get(data, 'stuStageReportStageTwoTaodaDto.k2_jxgz');
  const k3_jxgz = _get(data, 'stuStageReportStageThreeTaodaDto.k3_jxgz');

  // const k1_jxgzBase64Img = await getBase64Img(k1_jxgz);
  // const k2_jxgzBase64Img = await getBase64Img(k2_jxgz);
  // const k3_jxgzBase64Img = await getBase64Img(k3_jxgz);
  // const k1_jxgzHtml = k1_jxgzBase64Img ? `<img src='${k1_jxgzBase64Img}'/>` : '';
  // const k2_jxgzHtml = k2_jxgzBase64Img ? `<img src='${k2_jxgzBase64Img}'/>` : '';
  // const k3_jxgzHtml = k3_jxgzBase64Img ? `<img src='${k3_jxgzBase64Img}'/>` : '';
  // k1_jggz
  const k1_jggz = _get(data, 'stuStageReportStageOneTaodaDto.k1_jggz');
  const k2_jggz = _get(data, 'stuStageReportStageTwoTaodaDto.k2_jggz');
  const k3_jggz = _get(data, 'stuStageReportStageThreeTaodaDto.k3_jggz');
  // const k1_jggzBase64Img = await getBase64Img(k1_jggz);
  // const k2_jggzBase64Img = await getBase64Img(k2_jggz);
  // const k3_jggzBase64Img = await getBase64Img(k3_jggz);
  // const k1_jggzHtml = k1_jggzBase64Img ? `<img src='${k1_jggzBase64Img}'/>` : '';
  // const k2_jggzHtml = k2_jggzBase64Img ? `<img src='${k2_jggzBase64Img}'/>` : '';
  // const k3_jggzHtml = k3_jggzBase64Img ? `<img src='${k3_jggzBase64Img}'/>` : '';
  LODOP.PRINT_INITA(9, -8, 1200, 999, '打印控件');
  LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1);
  // LODOP.ADD_PRINT_SETUP_BKIMG("<img border='0' src=" + trainRecordImg + " style='z-index: -1'/>"); //设置背景图片(此处img标签的属性值不可使用双引号包裹,必须使用单引号)
  LODOP.ADD_PRINT_SETUP_BKIMG(trainRecordImg); //设置背景图片(此处img标签的属性值不可使用双引号包裹,必须使用单引号)
  LODOP.SET_PRINT_STYLEA(0, 'HtmWaitMilSecs', 1000);
  LODOP.SET_SHOW_MODE('BKIMG_IN_PREVIEW', true); //设置预览包含背景图
  LODOP.SET_SHOW_MODE('BKIMG_PRINT', 0); //设置打印不包含背景图
  LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1); //横向打印的预览默认旋转90度（正向显示）
  LODOP.SET_SHOW_MODE('BKIMG_WIDTH', '291.04mm');
  LODOP.SET_SHOW_MODE('BKIMG_HEIGHT', '205mm');
  LODOP.SET_PRINT_PAGESIZE(2, 0, 0, 'A4');
  LODOP.ADD_PRINT_TEXT(135, 258, 78, 20, studentname);
  LODOP.ADD_PRINT_TEXT(135, 411, 36, 20, stusex);
  LODOP.ADD_PRINT_TEXT(135, 588, 123, 20, stuidnum);
  LODOP.ADD_PRINT_TEXT(135, 797, 127, 26, signdate);
  LODOP.ADD_PRINT_TEXT(194, 257, 324, 21, address);
  LODOP.ADD_PRINT_TEXT(194, 691, 225, 21, telnum);
  LODOP.ADD_PRINT_IMAGE(120, 940, 127, 179, stuimg_b64);
  LODOP.SET_PRINT_STYLEA(0, 'Stretch', 1); //(可变形)扩展缩放模式
  LODOP.ADD_PRINT_TEXT(403, 160, 83, 20, k1_totaltime);
  LODOP.ADD_PRINT_TEXT(521, 163, 83, 20, k2_totaltime);
  LODOP.ADD_PRINT_TEXT(635, 160, 83, 20, k3_totaltime);
  LODOP.ADD_PRINT_TEXT(404, 291, 83, 20, k1_studen_name);
  LODOP.ADD_PRINT_TEXT(522, 291, 83, 20, k2_studen_name);
  LODOP.ADD_PRINT_TEXT(635, 293, 83, 20, k3_studen_name);

  LODOP.ADD_PRINT_TEXT(402, 455, 113, 20, k1_coach_name);
  LODOP.ADD_PRINT_TEXT(519, 452, 118, 20, k2_coach_name);
  LODOP.ADD_PRINT_TEXT(634, 451, 121, 27, k3_coach_name);

  k1_jxgz && LODOP.ADD_PRINT_IMAGE(344, 701, 100, 100, jxgz_b64); //驾校盖章
  LODOP.SET_PRINT_STYLEA(0, 'Stretch', 1); //(可变形)扩展缩放模式
  k2_jxgz && LODOP.ADD_PRINT_IMAGE(472, 701, 100, 100, jxgz_b64);
  LODOP.SET_PRINT_STYLEA(0, 'Stretch', 1); //(可变形)扩展缩放模式
  k3_jxgz && LODOP.ADD_PRINT_IMAGE(584, 701, 100, 100, jxgz_b64);
  LODOP.SET_PRINT_STYLEA(0, 'Stretch', 1); //(可变形)扩展缩放模式

  k1_jggz && LODOP.ADD_PRINT_IMAGE(343, 914, 100, 100, jggz_b64); //科一道路
  LODOP.SET_PRINT_STYLEA(0, 'Stretch', 1); //(可变形)扩展缩放模式
  k2_jggz && LODOP.ADD_PRINT_IMAGE(471, 914, 100, 100, jggz_b64);
  LODOP.SET_PRINT_STYLEA(0, 'Stretch', 1); //(可变形)扩展缩放模式
  k3_jggz && LODOP.ADD_PRINT_IMAGE(583, 914, 100, 100, jggz_b64);
  LODOP.SET_PRINT_STYLEA(0, 'Stretch', 1); //(可变形)扩展缩放模式

  LODOP.ADD_PRINT_TEXT(452, 264, 37, 23, k1_studen_date_year); //学生科一年份
  LODOP.ADD_PRINT_TEXT(567, 264, 37, 23, k2_studen_date_year); //学生科二年份
  LODOP.ADD_PRINT_TEXT(679, 264, 37, 23, k3_studen_date_year); //学生科三年份
  LODOP.ADD_PRINT_TEXT(679, 320, 27, 23, k3_studen_date_month); //学生科三月份
  LODOP.ADD_PRINT_TEXT(679, 362, 27, 23, k3_studen_date_day); //学生科三日
  LODOP.ADD_PRINT_TEXT(567, 361, 27, 23, k2_studen_date_day); //学生科二日
  LODOP.ADD_PRINT_TEXT(567, 316, 27, 23, k2_studen_date_month); //学生科二月份
  LODOP.ADD_PRINT_TEXT(452, 314, 27, 23, k1_studen_date_month); //学生科一月份
  LODOP.ADD_PRINT_TEXT(452, 360, 27, 23, k1_studen_date_day); //学生科一日
  LODOP.ADD_PRINT_TEXT(452, 446, 37, 23, k1_coach_date_year); //教练科一年
  LODOP.ADD_PRINT_TEXT(452, 506, 27, 23, k1_coach_date_month); //教练科一月
  LODOP.ADD_PRINT_TEXT(452, 552, 27, 23, k1_coach_date_day); //教练科一日
  LODOP.ADD_PRINT_TEXT(567, 446, 37, 23, k2_coach_date_year); //教练科二年
  LODOP.ADD_PRINT_TEXT(567, 501, 27, 23, k2_coach_date_month); //教练科二月
  LODOP.ADD_PRINT_TEXT(567, 552, 27, 23, k2_coach_date_day); //教练科二日
  LODOP.ADD_PRINT_TEXT(679, 446, 37, 23, k3_coach_date_year); //教练科三年
  LODOP.ADD_PRINT_TEXT(679, 506, 27, 23, k3_coach_date_month); //教练科三月
  LODOP.ADD_PRINT_TEXT(679, 552, 27, 23, k3_coach_date_day); //教练科三日
  LODOP.ADD_PRINT_TEXT(452, 684, 37, 23, k1_school_date_year); //培训科一年
  LODOP.ADD_PRINT_TEXT(452, 745, 27, 23, k1_school_date_month); //培训科一月
  LODOP.ADD_PRINT_TEXT(452, 793, 27, 23, k1_school_date_day); //培训科一日
  LODOP.ADD_PRINT_TEXT(567, 684, 37, 23, k2_school_date_year); //培训科二年
  LODOP.ADD_PRINT_TEXT(567, 745, 27, 23, k2_school_date_month); //培训科二月
  LODOP.ADD_PRINT_TEXT(567, 793, 27, 23, k2_school_date_day); //培训科二日
  LODOP.ADD_PRINT_TEXT(679, 684, 37, 23, k3_school_date_year); //培训科三年
  LODOP.ADD_PRINT_TEXT(679, 745, 27, 23, k3_school_date_month); //培训科三月
  LODOP.ADD_PRINT_TEXT(679, 793, 27, 23, k3_school_date_day); //培训科三日
  LODOP.ADD_PRINT_TEXT(452, 916, 37, 23, k1_jggz_date_year); //道路科一年
  LODOP.ADD_PRINT_TEXT(452, 965, 27, 23, k1_jggz_date_month); //道路科一月
  LODOP.ADD_PRINT_TEXT(452, 1011, 27, 23, k1_jggz_date_day); //道路科一日
  LODOP.ADD_PRINT_TEXT(567, 916, 37, 23, k2_jggz_date_year); //道路科二年
  LODOP.ADD_PRINT_TEXT(567, 965, 27, 23, k2_jggz_date_month); //道路科二月
  LODOP.ADD_PRINT_TEXT(567, 1011, 27, 23, k2_jggz_date_day); //道路科二日
  LODOP.ADD_PRINT_TEXT(679, 916, 37, 23, k3_jggz_date_year); //道路科三年
  LODOP.ADD_PRINT_TEXT(679, 965, 27, 23, k3_jggz_date_month); //道路科三月
  LODOP.ADD_PRINT_TEXT(679, 1011, 27, 23, k3_jggz_date_day); //道路科三日
  const basicInfo = _get(data, 'stuStageReportStuInfoTaodaDto', {});
  _get(basicInfo, 'cartype_A1') && LODOP.ADD_PRINT_TEXT(258, 225, 22, 19, '√'); //A1
  _get(basicInfo, 'cartype_A2') && LODOP.ADD_PRINT_TEXT(258, 275, 22, 19, '√'); //A2
  _get(basicInfo, 'cartype_A3') && LODOP.ADD_PRINT_TEXT(258, 325, 22, 19, '√'); //A3
  _get(basicInfo, 'cartype_B1') && LODOP.ADD_PRINT_TEXT(258, 377, 22, 19, '√'); //B1
  _get(basicInfo, 'cartype_B2') && LODOP.ADD_PRINT_TEXT(258, 427, 22, 19, '√'); //B2
  _get(basicInfo, 'cartype_C1') && LODOP.ADD_PRINT_TEXT(258, 477, 22, 19, '√'); //C1
  _get(basicInfo, 'cartype_C2') && LODOP.ADD_PRINT_TEXT(258, 527, 22, 19, '√'); //C2
  _get(basicInfo, 'cartype_C3') && LODOP.ADD_PRINT_TEXT(258, 579, 22, 19, '√'); //C3
  _get(basicInfo, 'cartype_C4') && LODOP.ADD_PRINT_TEXT(258, 626, 22, 19, '√'); //C4
  _get(basicInfo, 'cartype_D') && LODOP.ADD_PRINT_TEXT(258, 671, 22, 19, '√'); //D
  _get(basicInfo, 'cartype_E') && LODOP.ADD_PRINT_TEXT(258, 715, 22, 19, '√'); //D
  _get(basicInfo, 'cartype_F') && LODOP.ADD_PRINT_TEXT(258, 756, 22, 19, '√'); //D
  _get(basicInfo, 'cartype_M') && LODOP.ADD_PRINT_TEXT(258, 799, 22, 19, '√'); //D
  _get(basicInfo, 'cartype_N') && LODOP.ADD_PRINT_TEXT(258, 841, 22, 19, '√'); //D
  _get(basicInfo, 'cartype_P') && LODOP.ADD_PRINT_TEXT(258, 883, 22, 19, '√'); //D

  if (isPrint) {
    LODOP.PRINT();
  } else {
    LODOP.PRINT_DESIGN();
  }
}

export function createTeachJournal(data: any, subject: any, isPrint = false, LODOP1?: any) {
  const win = window as any;
  let LODOP = LODOP1 ? LODOP1 : win.getLodop();
  if (!LODOP || !LODOP.VERSION) {
    return 'NO_SOFTWARE';
  }

  const teachjournalImg1 = getTeachJournalImg1();
  const teachjournalImg2 = getTeachJournalImg2();
  const teachjournalImg3 = getTeachJournalImg3();
  const teachjournalImg4 = getTeachJournalImg4();

  LODOP.PRINT_INITA(-4, -5, 1200, 1500, '');
  LODOP.SET_PRINT_MODE('PRINT_NOCOLLATE', 1);

  LODOP.SET_PRINT_STYLEA(0, 'HtmWaitMilSecs', 1000);
  LODOP.SET_SHOW_MODE('BKIMG_IN_PREVIEW', true); //设置预览包含背景图
  LODOP.SET_SHOW_MODE('BKIMG_WIDTH', '790px');
  LODOP.SET_SHOW_MODE('BKIMG_HEIGHT', '1123px');

  if (subject === 1) {
    LODOP.ADD_PRINT_SETUP_BKIMG(teachjournalImg1);
    printSubject1(data, LODOP);
  }
  if (subject === 2) {
    LODOP.ADD_PRINT_SETUP_BKIMG(teachjournalImg2);
    printSubject2(data, LODOP);
  }
  if (subject === 3) {
    LODOP.ADD_PRINT_SETUP_BKIMG(teachjournalImg3);
    printSubject3(data, LODOP);
  }
  if (subject === 4) {
    LODOP.ADD_PRINT_SETUP_BKIMG(teachjournalImg4);
    printSubject4(data, LODOP);
  }
  if (isPrint) {
    LODOP.PRINT();
    // return pid;
  } else {
    LODOP.PRINT_DESIGN();
    // return '';
  }
}

/*科一 */
export function printSubject1(data: any, LODOP: any) {
  const studentname = _get(data, 'stuClassrecordStageOneTaodaDto.xyxm');
  const studentcode = _get(data, 'stuClassrecordStageOneTaodaDto.xybh');
  const jpjgmc = _get(data, 'stuClassrecordStageOneTaodaDto.jpjgmc'); //  驾培机构名称
  const k1xl1yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl1yf'); //   科一训练1月份
  const k1xl1rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl1rq'); //   科一训练1日期
  const k1xl2yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl2yf'); //   科一训练2月份
  const k1xl2rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl2rq'); //   科一训练2日期
  const k1xl3yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl3yf'); //   科一训练3月份
  const k1xl3rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl3rq'); //   科一训练3日期
  const k1xl4rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl4rq'); //   科一训练4日期
  const k1xl4yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl4yf'); //   科一训练4月份
  const k1xl5yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl5yf'); //   科一训练5月份
  const k1xl5rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl5rq'); //   科一训练5日期
  const k1xl6yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl6yf'); //   科一训练6月份
  const k1xl6rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl6rq'); //   科一训练6日期
  const k1xl7yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl7yf'); //   科一训练7月份
  const k1xl7rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl7rq'); //   科一训练7日期
  const k1xl8yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl8yf'); //   科一训练8月份
  const k1xl8rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl8rq'); //   科一训练8日期
  const k1xl9yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl9yf'); //   科一训练9月份
  const k1xl9rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl9rq'); //   科一训练9日期
  const k1xl10yf = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl10yf'); //    科一训练10月份
  const k1xl10rq = _get(data, 'stuClassrecordStageOneTaodaDto.k1xl10rq'); //    科一训练10日期
  const k1jxxmxh1 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh1'); //  科一教学项目序号1
  const k1jxxmxh2 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh2'); //  科一教学项目序号2
  const k1jxxmxh3 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh3'); //  科一教学项目序号3
  const k1jxxmxh4 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh4'); //  科一教学项目序号4
  const k1jxxmxh5 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh5'); //  科一教学项目序号5
  const k1jxxmxh6 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh6'); //  科一教学项目序号6
  const k1jxxmxh7 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh7'); //  科一教学项目序号7
  const k1jxxmxh8 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh8'); //  科一教学项目序号8
  const k1jxxmxh9 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh9'); //  科一教学项目序号9
  const k1jxxmxh10 = _get(data, 'stuClassrecordStageOneTaodaDto.k1jxxmxh10'); //	科一教学项目序号10
  const k1xs1 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs1'); //  科一学时1
  const k1xs2 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs2'); //  科一学时2
  const k1xs3 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs3'); //  科一学时3
  const k1xs4 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs4'); //  科一学时4
  const k1xs5 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs5'); //  科一学时5
  const k1xs6 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs6'); //  科一学时6
  const k1xs7 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs7'); //  科一学时7
  const k1xs8 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs8'); //  科一学时8
  const k1xs9 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs9'); //  科一学时9
  const k1xs10 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xs10'); //  科一学时10
  const k1xyqz1 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz1'); //  科一学员签字1
  const k1xyqz2 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz2'); //  科一学员签字2
  const k1xyqz3 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz3'); //  科一学员签字3
  const k1xyqz4 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz4'); //  科一学员签字4
  const k1xyqz5 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz5'); //  科一学员签字5
  const k1xyqz6 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz6'); //  科一学员签字6
  const k1xyqz7 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz7'); //  科一学员签字7
  const k1xyqz8 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz8'); //  科一学员签字8
  const k1xyqz9 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz9'); //  科一学员签字9
  const k1xyqz10 = _get(data, 'stuClassrecordStageOneTaodaDto.k1xyqz10'); //科一学员签字10

  LODOP.ADD_PRINT_TEXT(166, 167, 194, 25, jpjgmc); //驾校机构名称
  LODOP.ADD_PRINT_TEXT(166, 451, 85, 20, studentname); //姓名
  LODOP.ADD_PRINT_TEXT(166, 615, 105, 21, studentcode); //学员编号
  LODOP.ADD_PRINT_TEXT(355, 173, 22, 20, k1xl1yf); //科一1月
  LODOP.ADD_PRINT_TEXT(355, 197, 22, 20, k1xl1rq); //科一1日
  LODOP.ADD_PRINT_TEXT(355, 232, 22, 20, k1xl2yf); //科一2月
  LODOP.ADD_PRINT_TEXT(355, 253, 22, 20, k1xl2rq); //科一2日
  LODOP.ADD_PRINT_TEXT(355, 287, 22, 20, k1xl3yf); //科一3月
  LODOP.ADD_PRINT_TEXT(355, 307, 22, 20, k1xl3rq); //科一3日
  LODOP.ADD_PRINT_TEXT(355, 338, 22, 20, k1xl4yf); //科一4月
  LODOP.ADD_PRINT_TEXT(355, 366, 22, 20, k1xl4rq); //科一4日
  LODOP.ADD_PRINT_TEXT(355, 399, 22, 20, k1xl5yf); //科一5月
  LODOP.ADD_PRINT_TEXT(355, 422, 22, 20, k1xl5rq); //科一5日
  LODOP.ADD_PRINT_TEXT(355, 451, 22, 20, k1xl6yf); //科一6月
  LODOP.ADD_PRINT_TEXT(355, 477, 22, 20, k1xl6rq); //科一6日
  LODOP.ADD_PRINT_TEXT(355, 510, 22, 20, k1xl7yf); //科一7月
  LODOP.ADD_PRINT_TEXT(355, 534, 22, 20, k1xl7rq); //科一7日
  LODOP.ADD_PRINT_TEXT(355, 561, 22, 20, k1xl8yf); //科一8月
  LODOP.ADD_PRINT_TEXT(355, 587, 22, 20, k1xl8rq); //科一8日
  LODOP.ADD_PRINT_TEXT(355, 618, 22, 20, k1xl9yf); //科一9月
  LODOP.ADD_PRINT_TEXT(355, 642, 22, 20, k1xl9rq); //科一9日
  LODOP.ADD_PRINT_TEXT(355, 673, 22, 20, k1xl10yf); //科一10月
  LODOP.ADD_PRINT_TEXT(355, 696, 22, 20, k1xl10rq); //科一10日
  LODOP.ADD_PRINT_TEXT(392, 170, 44, 30, k1jxxmxh1); //科一序号1
  LODOP.ADD_PRINT_TEXT(392, 227, 44, 30, k1jxxmxh2); //科一序号2
  LODOP.ADD_PRINT_TEXT(392, 281, 44, 30, k1jxxmxh3); //科一序号3
  LODOP.ADD_PRINT_TEXT(392, 337, 44, 30, k1jxxmxh4); //科一序号4
  LODOP.ADD_PRINT_TEXT(392, 395, 44, 30, k1jxxmxh5); //科一序号5
  LODOP.ADD_PRINT_TEXT(392, 448, 44, 30, k1jxxmxh6); //科一序号6
  LODOP.ADD_PRINT_TEXT(392, 504, 44, 30, k1jxxmxh7); //科一序号7
  LODOP.ADD_PRINT_TEXT(392, 559, 44, 30, k1jxxmxh8); //科一序号8
  LODOP.ADD_PRINT_TEXT(392, 617, 44, 30, k1jxxmxh9); //科一序号9
  LODOP.ADD_PRINT_TEXT(392, 671, 44, 30, k1jxxmxh10); //科一序号10
  LODOP.ADD_PRINT_TEXT(443, 170, 44, 30, k1xs1); //科一学时1
  LODOP.ADD_PRINT_TEXT(443, 227, 44, 30, k1xs2); //科一学时2
  LODOP.ADD_PRINT_TEXT(443, 281, 44, 30, k1xs3); //科一学时3
  LODOP.ADD_PRINT_TEXT(443, 337, 44, 30, k1xs4); //科一学时4
  LODOP.ADD_PRINT_TEXT(443, 394, 44, 30, k1xs5); //科一学时5
  LODOP.ADD_PRINT_TEXT(443, 448, 44, 30, k1xs6); //科一学时6
  LODOP.ADD_PRINT_TEXT(443, 504, 44, 30, k1xs7); //科一学时7
  LODOP.ADD_PRINT_TEXT(443, 560, 44, 30, k1xs8); //科一学时8
  LODOP.ADD_PRINT_TEXT(443, 617, 44, 30, k1xs9); //科一学时9
  LODOP.ADD_PRINT_TEXT(443, 671, 44, 30, k1xs10); //'科一学时10'
  LODOP.ADD_PRINT_TEXT(500, 166, 49, 30, k1xyqz1); //科一签字1
  LODOP.ADD_PRINT_TEXT(500, 222, 49, 30, k1xyqz2); //科一签字2
  LODOP.ADD_PRINT_TEXT(500, 278, 49, 30, k1xyqz3); //科一签字3
  LODOP.ADD_PRINT_TEXT(500, 334, 49, 30, k1xyqz4); //科一签字4
  LODOP.ADD_PRINT_TEXT(500, 389, 49, 30, k1xyqz5); //科一签字5
  LODOP.ADD_PRINT_TEXT(500, 444, 49, 30, k1xyqz6); //科一签字6
  LODOP.ADD_PRINT_TEXT(500, 500, 49, 30, k1xyqz7); //科一签字7
  LODOP.ADD_PRINT_TEXT(500, 557, 49, 30, k1xyqz8); //科一签字8
  LODOP.ADD_PRINT_TEXT(500, 613, 49, 30, k1xyqz9); //科一签字9
  LODOP.ADD_PRINT_TEXT(500, 667, 49, 30, k1xyqz10); //科一签字10
}

/*科二 */
export function printSubject2(data: any, LODOP: any) {
  const k2xl10rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl10rq'); //科二训练10日期
  const k2xl10yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl10yf'); //科二训练10月份
  const k2xl9rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl9rq'); //科二训练9日期
  const k2xl9yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl9yf'); //科二训练9月份
  const k2xl8rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl8rq'); //科二训练8日期
  const k2xl8yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl8yf'); //科二训练8月份
  const k2xl7rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl7rq'); //科二训练7日期
  const k2xl7yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl7yf'); //科二训练7月份
  const k2xl6rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl6rq'); //科二训练6日期
  const k2xl6yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl6yf'); //科二训练6月份
  const k2xl5rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl5rq'); //科二训练5日期
  const k2xl5yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl5yf'); //科二训练5月份
  const k2xl4rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl4rq'); //科二训练4日期
  const k2xl4yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl4yf'); //科二训练4月份
  const k2xl3rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl3rq'); //科二训练3日期
  const k2xl3yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl3yf'); //科二训练3月份
  const k2xl2rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl2rq'); //科二训练2日期
  const k2xl2yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl2yf'); //科二训练2月份
  const k2xl1rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl1rq'); //科二训练1日期
  const k2xl1yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl1yf'); //科二训练1月份
  const k2xl20rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl20rq'); //科二训练20日期
  const k2xl20yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl20yf'); //科二训练20月份
  const k2xl19rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl19rq'); //科二训练19日期
  const k2xl19yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl19yf'); //科二训练19月份
  const k2xl18rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl18rq'); //科二训练18日期
  const k2xl18yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl18yf'); //科二训练18月份
  const k2xl17rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl17rq'); //科二训练17日期
  const k2xl17yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl17yf'); //科二训练17月份
  const k2xl16rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl16rq'); //科二训练16日期
  const k2xl16yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl16yf'); //科二训练16月份
  const k2xl15rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl15rq'); //科二训练15日期
  const k2xl15yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl15yf'); //科二训练15月份
  const k2xl14rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl14rq'); //科二训练14日期
  const k2xl14yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl14yf'); //科二训练14月份
  const k2xl13rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl13rq'); //科二训练13日期
  const k2xl13yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl13yf'); //科二训练13月份
  const k2xl12rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl12rq'); //科二训练12日期
  const k2xl12yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl12yf'); //科二训练12月份
  const k2xl11rq = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl11rq'); //科二训练11日期
  const k2xl11yf = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xl11yf'); //科二训练11月份
  const k2jxxmxh1 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh1'); //  科二教学项目序号1
  const k2jxxmxh2 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh2'); //  科二教学项目序号2
  const k2jxxmxh3 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh3'); //  科二教学项目序号3
  const k2jxxmxh4 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh4'); //  科二教学项目序号4
  const k2jxxmxh5 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh5'); //  科二教学项目序号5
  const k2jxxmxh6 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh6'); //  科二教学项目序号6
  const k2jxxmxh7 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh7'); //  科二教学项目序号7
  const k2jxxmxh8 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh8'); //  科二教学项目序号8
  const k2jxxmxh9 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh9'); //  科二教学项目序号9
  const k2jxxmxh10 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh10'); //	科二教学项目序号10
  const k2jxxmxh11 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh11'); //  科二教学项目序号11
  const k2jxxmxh12 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh12'); //  科二教学项目序号12
  const k2jxxmxh13 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh13'); //  科二教学项目序号13
  const k2jxxmxh14 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh14'); //  科二教学项目序号14
  const k2jxxmxh15 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh15'); //  科二教学项目序号15
  const k2jxxmxh16 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh16'); //  科二教学项目序号16
  const k2jxxmxh17 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh17'); //  科二教学项目序号17
  const k2jxxmxh18 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh18'); //  科二教学项目序号18
  const k2jxxmxh19 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh19'); //  科二教学项目序号19
  const k2jxxmxh20 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2jxxmxh20'); //	科二教学项目序号20
  const k2xs1 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs1'); //科2学时1
  const k2xs2 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs2'); //科2学时2
  const k2xs3 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs3'); //科2学时3
  const k2xs4 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs4'); //科2学时4
  const k2xs5 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs5'); //科2学时5
  const k2xs6 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs6'); //科2学时6
  const k2xs7 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs7'); //科2学时7
  const k2xs8 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs8'); //科2学时8
  const k2xs9 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs9'); //科2学时9
  const k2xs10 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs10'); //科2学时10
  const k2xs11 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs11'); //科2学时11
  const k2xs12 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs12'); //科2学时12
  const k2xs13 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs13'); //科2学时13
  const k2xs14 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs14'); //科2学时14
  const k2xs15 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs15'); //科2学时15
  const k2xs16 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs16'); //科2学时16
  const k2xs17 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs17'); //科2学时17
  const k2xs18 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs18'); //科2学时18
  const k2xs19 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs19'); //科2学时19
  const k2xs20 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xs20'); //科2学时20
  const k2xyqz1 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz1'); //科2学员签字1
  const k2xyqz2 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz2'); //科2学员签字2
  const k2xyqz3 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz3'); //科2学员签字3
  const k2xyqz4 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz4'); //科2学员签字4
  const k2xyqz5 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz5'); //科2学员签字5
  const k2xyqz6 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz6'); //科2学员签字6
  const k2xyqz7 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz7'); //科2学员签字7
  const k2xyqz8 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz8'); //科2学员签字8
  const k2xyqz9 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz9'); //科2学员签字9
  const k2xyqz10 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz10'); //科2学员签字10
  const k2xyqz11 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz11'); //科2学员签字11
  const k2xyqz12 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz12'); //科2学员签字12
  const k2xyqz13 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz13'); //科2学员签字13
  const k2xyqz14 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz14'); //科2学员签字14
  const k2xyqz15 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz15'); //科2学员签字15
  const k2xyqz16 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz16'); //科2学员签字16
  const k2xyqz17 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz17'); //科2学员签字17
  const k2xyqz18 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz18'); //科2学员签字18
  const k2xyqz19 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz19'); //科2学员签字19
  const k2xyqz20 = _get(data, 'stuClassrecordStageTwoTaodaDto.k2xyqz20'); //科2学员签字20
  LODOP.ADD_PRINT_TEXT(177, 174, 22, 20, k2xl1yf); //1月
  LODOP.ADD_PRINT_TEXT(177, 204, 22, 20, k2xl1rq); //1日
  LODOP.ADD_PRINT_TEXT(177, 233, 22, 20, k2xl2yf); //2月
  LODOP.ADD_PRINT_TEXT(177, 260, 22, 20, k2xl2rq); //2日
  LODOP.ADD_PRINT_TEXT(177, 288, 22, 20, k2xl3yf); //3月
  LODOP.ADD_PRINT_TEXT(177, 314, 22, 20, k2xl3rq); //3日
  LODOP.ADD_PRINT_TEXT(177, 339, 22, 20, k2xl4yf); //4月
  LODOP.ADD_PRINT_TEXT(177, 373, 22, 20, k2xl4rq); //4日
  LODOP.ADD_PRINT_TEXT(177, 400, 22, 20, k2xl5yf); //5月
  LODOP.ADD_PRINT_TEXT(177, 429, 22, 20, k2xl5rq); //5日
  LODOP.ADD_PRINT_TEXT(177, 451, 22, 20, k2xl6yf); //6月
  LODOP.ADD_PRINT_TEXT(177, 484, 22, 20, k2xl6rq); //6日
  LODOP.ADD_PRINT_TEXT(177, 511, 22, 20, k2xl7yf); //7月
  LODOP.ADD_PRINT_TEXT(177, 541, 22, 20, k2xl7rq); //7日
  LODOP.ADD_PRINT_TEXT(177, 566, 22, 20, k2xl8yf); //8月
  LODOP.ADD_PRINT_TEXT(177, 594, 22, 20, k2xl8rq); //8日
  LODOP.ADD_PRINT_TEXT(177, 619, 22, 20, k2xl9yf); //9月
  LODOP.ADD_PRINT_TEXT(177, 649, 22, 20, k2xl9rq); //9日
  LODOP.ADD_PRINT_TEXT(177, 674, 22, 20, k2xl10yf); //10月;
  LODOP.ADD_PRINT_TEXT(177, 703, 22, 20, k2xl10rq); //10日
  LODOP.ADD_PRINT_TEXT(386, 177, 22, 20, k2xl11yf); //科二11月
  LODOP.ADD_PRINT_TEXT(386, 205, 22, 20, k2xl11rq); //科二11日
  LODOP.ADD_PRINT_TEXT(386, 234, 22, 20, k2xl12yf); //科二12月
  LODOP.ADD_PRINT_TEXT(386, 261, 22, 20, k2xl12rq); //科二12日
  LODOP.ADD_PRINT_TEXT(386, 289, 22, 20, k2xl13yf); //科二13月
  LODOP.ADD_PRINT_TEXT(386, 315, 22, 20, k2xl13rq); //科二13日
  LODOP.ADD_PRINT_TEXT(386, 340, 22, 20, k2xl14yf); //科二14月
  LODOP.ADD_PRINT_TEXT(386, 374, 22, 20, k2xl14rq); //科二14日
  LODOP.ADD_PRINT_TEXT(386, 401, 22, 20, k2xl15yf); //科二15月
  LODOP.ADD_PRINT_TEXT(386, 430, 22, 20, k2xl15rq); //科二15日
  LODOP.ADD_PRINT_TEXT(386, 453, 22, 20, k2xl16yf); //科二16月
  LODOP.ADD_PRINT_TEXT(386, 485, 22, 20, k2xl16rq); //科二16日
  LODOP.ADD_PRINT_TEXT(386, 512, 22, 20, k2xl17yf); //科二17月
  LODOP.ADD_PRINT_TEXT(386, 542, 22, 20, k2xl17rq); //科二17日
  LODOP.ADD_PRINT_TEXT(386, 563, 22, 20, k2xl18yf); //科二18月
  LODOP.ADD_PRINT_TEXT(386, 591, 22, 20, k2xl18rq); //科二18日
  LODOP.ADD_PRINT_TEXT(386, 616, 22, 20, k2xl19yf); //科二19月
  LODOP.ADD_PRINT_TEXT(386, 646, 22, 20, k2xl19rq); //科二19日
  LODOP.ADD_PRINT_TEXT(386, 671, 22, 20, k2xl20yf); //科二20月
  LODOP.ADD_PRINT_TEXT(386, 700, 22, 20, k2xl20rq); //科二20日
  LODOP.ADD_PRINT_TEXT(212, 190, 30, 20, k2jxxmxh1); //科二序号1
  LODOP.ADD_PRINT_TEXT(212, 235, 30, 20, k2jxxmxh2); //科二序号2
  LODOP.ADD_PRINT_TEXT(212, 289, 30, 20, k2jxxmxh3); //科二序号3
  LODOP.ADD_PRINT_TEXT(212, 345, 30, 20, k2jxxmxh4); //科二序号4
  LODOP.ADD_PRINT_TEXT(212, 403, 30, 20, k2jxxmxh5); //科二序号5
  LODOP.ADD_PRINT_TEXT(212, 456, 30, 20, k2jxxmxh6); //科二序号6
  LODOP.ADD_PRINT_TEXT(212, 512, 30, 20, k2jxxmxh7); //科二序号7
  LODOP.ADD_PRINT_TEXT(212, 567, 30, 20, k2jxxmxh8); //科二序号8
  LODOP.ADD_PRINT_TEXT(212, 625, 30, 20, k2jxxmxh9); //科二序号9
  LODOP.ADD_PRINT_TEXT(212, 679, 30, 20, k2jxxmxh10); //科二序号10
  LODOP.ADD_PRINT_TEXT(422, 190, 30, 20, k2jxxmxh11); //科二序号11
  LODOP.ADD_PRINT_TEXT(422, 235, 30, 20, k2jxxmxh12); //科二序号12
  LODOP.ADD_PRINT_TEXT(422, 289, 30, 20, k2jxxmxh13); //科二序号13
  LODOP.ADD_PRINT_TEXT(422, 345, 30, 20, k2jxxmxh14); //科二序号14
  LODOP.ADD_PRINT_TEXT(422, 403, 30, 20, k2jxxmxh15); //科二序号15
  LODOP.ADD_PRINT_TEXT(422, 456, 30, 20, k2jxxmxh16); //科二序号16
  LODOP.ADD_PRINT_TEXT(422, 512, 30, 20, k2jxxmxh17); //科二序号17
  LODOP.ADD_PRINT_TEXT(422, 567, 30, 20, k2jxxmxh18); //科二序号18
  LODOP.ADD_PRINT_TEXT(422, 625, 30, 20, k2jxxmxh19); //科二序号19
  LODOP.ADD_PRINT_TEXT(422, 679, 30, 20, k2jxxmxh20); //科二序号20
  LODOP.ADD_PRINT_TEXT(242, 190, 30, 20, k2xs1); //科二学时1
  LODOP.ADD_PRINT_TEXT(242, 235, 30, 20, k2xs2); //科二学时2
  LODOP.ADD_PRINT_TEXT(242, 289, 30, 20, k2xs3); //科二学时3
  LODOP.ADD_PRINT_TEXT(242, 345, 30, 20, k2xs4); //科二学时4
  LODOP.ADD_PRINT_TEXT(242, 403, 30, 20, k2xs5); //科二学时5
  LODOP.ADD_PRINT_TEXT(242, 456, 30, 20, k2xs6); //科二学时6
  LODOP.ADD_PRINT_TEXT(242, 512, 30, 20, k2xs7); //科二学时7
  LODOP.ADD_PRINT_TEXT(242, 567, 30, 20, k2xs8); //科二学时8
  LODOP.ADD_PRINT_TEXT(242, 625, 30, 20, k2xs9); //科二学时9
  LODOP.ADD_PRINT_TEXT(242, 679, 30, 20, k2xs10); //'科二学时10'
  LODOP.ADD_PRINT_TEXT(276, 177, 49, 24, k2xyqz1); //科二签字1
  LODOP.ADD_PRINT_TEXT(276, 233, 49, 24, k2xyqz2); //科二签字2
  LODOP.ADD_PRINT_TEXT(276, 289, 49, 24, k2xyqz3); //科二签字3
  LODOP.ADD_PRINT_TEXT(276, 345, 49, 24, k2xyqz4); //科二签字4
  LODOP.ADD_PRINT_TEXT(276, 400, 49, 24, k2xyqz5); //科二签字5
  LODOP.ADD_PRINT_TEXT(276, 455, 49, 24, k2xyqz6); //科二签字6
  LODOP.ADD_PRINT_TEXT(276, 511, 49, 24, k2xyqz7); //科二签字7
  LODOP.ADD_PRINT_TEXT(276, 568, 49, 24, k2xyqz8); //科二签字8
  LODOP.ADD_PRINT_TEXT(276, 624, 49, 24, k2xyqz9); //科二签字9
  LODOP.ADD_PRINT_TEXT(276, 678, 49, 24, k2xyqz10); //'科二签字10'
  LODOP.ADD_PRINT_TEXT(452, 190, 30, 24, k2xs11); //科二学时11
  LODOP.ADD_PRINT_TEXT(452, 235, 30, 24, k2xs12); //科二学时12
  LODOP.ADD_PRINT_TEXT(452, 289, 30, 24, k2xs13); //科二学时13
  LODOP.ADD_PRINT_TEXT(452, 345, 30, 24, k2xs14); //科二学时14
  LODOP.ADD_PRINT_TEXT(452, 403, 30, 24, k2xs15); //科二学时15
  LODOP.ADD_PRINT_TEXT(452, 456, 30, 24, k2xs16); //科二学时16
  LODOP.ADD_PRINT_TEXT(452, 512, 30, 24, k2xs17); //科二学时17
  LODOP.ADD_PRINT_TEXT(452, 567, 30, 24, k2xs18); //科二学时18
  LODOP.ADD_PRINT_TEXT(452, 625, 30, 24, k2xs19); //科二学时19
  LODOP.ADD_PRINT_TEXT(452, 679, 30, 24, k2xs20); //科二学时20
  LODOP.ADD_PRINT_TEXT(488, 177, 49, 24, k2xyqz11); //科二签字11
  LODOP.ADD_PRINT_TEXT(488, 233, 49, 24, k2xyqz12); //科二签字12
  LODOP.ADD_PRINT_TEXT(488, 289, 49, 24, k2xyqz13); //科二签字13
  LODOP.ADD_PRINT_TEXT(488, 345, 49, 24, k2xyqz14); //科二签字14
  LODOP.ADD_PRINT_TEXT(488, 400, 49, 24, k2xyqz15); //科二签字15
  LODOP.ADD_PRINT_TEXT(488, 455, 49, 24, k2xyqz16); //科二签字16
  LODOP.ADD_PRINT_TEXT(488, 511, 49, 24, k2xyqz17); //科二签字17
  LODOP.ADD_PRINT_TEXT(488, 568, 49, 24, k2xyqz18); //科二签字18
  LODOP.ADD_PRINT_TEXT(488, 624, 49, 24, k2xyqz19); //科二签字19
  LODOP.ADD_PRINT_TEXT(488, 678, 49, 24, k2xyqz20); //科二签字20
}

/*科三 */
export function printSubject3(data: any, LODOP: any) {
  const k3xl10rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl10rq'); //科三训练10日期
  const k3xl10yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl10yf'); //科三训练10月份
  const k3xl9rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl9rq'); //科三训练9日期
  const k3xl9yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl9yf'); //科三训练9月份
  const k3xl8rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl8rq'); //科三训练8日期
  const k3xl8yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl8yf'); //科三训练8月份
  const k3xl7rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl7rq'); //科三训练7日期
  const k3xl7yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl7yf'); //科三训练7月份
  const k3xl6rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl6rq'); //科三训练6日期
  const k3xl6yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl6yf'); //科三训练6月份
  const k3xl5rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl5rq'); //科三训练5日期
  const k3xl5yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl5yf'); //科三训练5月份
  const k3xl4rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl4rq'); //科三训练4日期
  const k3xl4yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl4yf'); //科三训练4月份
  const k3xl3rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl3rq'); //科三训练3日期
  const k3xl3yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl3yf'); //科三训练3月份
  const k3xl2rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl2rq'); //科三训练2日期
  const k3xl2yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl2yf'); //科三训练2月份
  const k3xl1rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl1rq'); //科三训练1日期
  const k3xl1yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl1yf'); //科三训练1月份
  const k3xl24rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl24rq'); //科三训练24日期
  const k3xl24yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl24yf'); //科三训练24月份
  const k3xl23rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl23rq'); //科三训练23日期
  const k3xl23yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl23yf'); //科三训练23月份
  const k3xl22rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl22rq'); //科三训练22日期
  const k3xl22yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl22yf'); //科三训练22月份
  const k3xl21rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl21rq'); //科三训练21日期
  const k3xl21yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl21yf'); //科三训练21月份
  const k3xl20rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl20rq'); //科三训练20日期
  const k3xl20yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl20yf'); //科三训练20月份
  const k3xl19rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl19rq'); //科三训练19日期
  const k3xl19yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl19yf'); //科三训练19月份
  const k3xl18rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl18rq'); //科三训练18日期
  const k3xl18yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl18yf'); //科三训练18月份
  const k3xl17rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl17rq'); //科三训练17日期
  const k3xl17yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl17yf'); //科三训练17月份
  const k3xl16rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl16rq'); //科三训练16日期
  const k3xl16yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl16yf'); //科三训练16月份
  const k3xl15rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl15rq'); //科三训练15日期
  const k3xl15yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl15yf'); //科三训练15月份
  const k3xl14rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl14rq'); //科三训练14日期
  const k3xl14yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl14yf'); //科三训练14月份
  const k3xl13rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl13rq'); //科三训练13日期
  const k3xl13yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl13yf'); //科三训练13月份
  const k3xl12rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl12rq'); //科三训练12日期
  const k3xl12yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl12yf'); //科三训练12月份
  const k3xl11rq = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl11rq'); //科三训练11日期
  const k3xl11yf = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xl11yf'); //科三训练11月份
  const k3jxxmxh1 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh1'); //  科三教学项目序号1
  const k3jxxmxh2 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh2'); //  科三教学项目序号2
  const k3jxxmxh3 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh3'); //  科三教学项目序号3
  const k3jxxmxh4 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh4'); //  科三教学项目序号4
  const k3jxxmxh5 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh5'); //  科三教学项目序号5
  const k3jxxmxh6 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh6'); //  科三教学项目序号6
  const k3jxxmxh7 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh7'); //  科三教学项目序号7
  const k3jxxmxh8 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh8'); //  科三教学项目序号8
  const k3jxxmxh9 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh9'); //  科三教学项目序号9
  const k3jxxmxh10 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh10'); //	科三教学项目序号10
  const k3jxxmxh11 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh11'); //  科三教学项目序号11
  const k3jxxmxh12 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh12'); //  科三教学项目序号12
  const k3jxxmxh13 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh13'); //  科三教学项目序号13
  const k3jxxmxh14 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh14'); //  科三教学项目序号14
  const k3jxxmxh15 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh15'); //  科三教学项目序号15
  const k3jxxmxh16 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh16'); //  科三教学项目序号16
  const k3jxxmxh17 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh17'); //  科三教学项目序号17
  const k3jxxmxh18 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh18'); //  科三教学项目序号18
  const k3jxxmxh19 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh19'); //  科三教学项目序号19
  const k3jxxmxh20 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh20'); //	科三教学项目序号20
  const k3jxxmxh21 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh21'); //  科三教学项目序号21
  const k3jxxmxh22 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh22'); //  科三教学项目序号22
  const k3jxxmxh23 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh23'); //  科三教学项目序号23
  const k3jxxmxh24 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3jxxmxh24'); //  科三教学项目序号24
  const k3xs1 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs1'); //科3学时1
  const k3xs2 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs2'); //科3学时2
  const k3xs3 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs3'); //科3学时3
  const k3xs4 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs4'); //科3学时4
  const k3xs5 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs5'); //科3学时5
  const k3xs6 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs6'); //科3学时6
  const k3xs7 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs7'); //科3学时7
  const k3xs8 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs8'); //科3学时8
  const k3xs9 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs9'); //科3学时9
  const k3xs10 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs10'); //科3学时10
  const k3xs11 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs11'); //科3学时11
  const k3xs12 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs12'); //科3学时12
  const k3xs13 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs13'); //科3学时13
  const k3xs14 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs14'); //科3学时14
  const k3xs15 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs15'); //科3学时15
  const k3xs16 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs16'); //科3学时16
  const k3xs17 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs17'); //科3学时17
  const k3xs18 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs18'); //科3学时18
  const k3xs19 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs19'); //科3学时19
  const k3xs20 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs20'); //科3学时20
  const k3xs21 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs21'); //科3学时21
  const k3xs22 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs22'); //科3学时22
  const k3xs23 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs23'); //科3学时23
  const k3xs24 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xs24'); //科3学时24
  const k3xyqz1 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz1'); //科3学员签字1
  const k3xyqz2 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz2'); //科3学员签字2
  const k3xyqz3 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz3'); //科3学员签字3
  const k3xyqz4 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz4'); //科3学员签字4
  const k3xyqz5 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz5'); //科3学员签字5
  const k3xyqz6 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz6'); //科3学员签字6
  const k3xyqz7 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz7'); //科3学员签字7
  const k3xyqz8 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz8'); //科3学员签字8
  const k3xyqz9 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz9'); //科3学员签字9
  const k3xyqz10 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz10'); //科3学员签字10
  const k3xyqz11 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz11'); //科3学员签字11
  const k3xyqz12 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz12'); //科3学员签字12
  const k3xyqz13 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz13'); //科3学员签字13
  const k3xyqz14 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz14'); //科3学员签字14
  const k3xyqz15 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz15'); //科3学员签字15
  const k3xyqz16 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz16'); //科3学员签字16
  const k3xyqz17 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz17'); //科3学员签字17
  const k3xyqz18 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz18'); //科3学员签字18
  const k3xyqz19 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz19'); //科3学员签字19
  const k3xyqz20 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz20'); //科3学员签字20
  const k3xyqz21 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz21'); //科3学员签字21
  const k3xyqz22 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz22'); //科3学员签字22
  const k3xyqz23 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz23'); //科3学员签字23
  const k3xyqz24 = _get(data, 'stuClassrecordStageThreeTaodaDto.k3xyqz24'); //科3学员签字24

  LODOP.ADD_PRINT_TEXT(204, 181, 21, 20, k3xl1yf); //科三1月
  LODOP.ADD_PRINT_TEXT(204, 208, 21, 20, k3xl1rq); //科三1日
  LODOP.ADD_PRINT_TEXT(204, 227, 21, 20, k3xl2yf); //科三2月
  LODOP.ADD_PRINT_TEXT(204, 253, 21, 20, k3xl2rq); //科三2日
  LODOP.ADD_PRINT_TEXT(204, 275, 21, 20, k3xl3yf); //科三3月
  LODOP.ADD_PRINT_TEXT(204, 297, 21, 20, k3xl3rq); //科三3日
  LODOP.ADD_PRINT_TEXT(204, 317, 21, 20, k3xl4yf); //科三4月
  LODOP.ADD_PRINT_TEXT(204, 343, 21, 20, k3xl4rq); //科三4日
  LODOP.ADD_PRINT_TEXT(204, 363, 21, 20, k3xl5yf); //科三5月
  LODOP.ADD_PRINT_TEXT(204, 388, 21, 20, k3xl5rq); //科三5日
  LODOP.ADD_PRINT_TEXT(204, 409, 21, 20, k3xl6yf); //科三6月
  LODOP.ADD_PRINT_TEXT(204, 434, 21, 20, k3xl6rq); //科三6日
  LODOP.ADD_PRINT_TEXT(204, 450, 21, 20, k3xl7yf); //科三7月
  LODOP.ADD_PRINT_TEXT(204, 477, 21, 20, k3xl7rq); //科三7日
  LODOP.ADD_PRINT_TEXT(204, 497, 21, 20, k3xl8yf); //科三8月
  LODOP.ADD_PRINT_TEXT(204, 523, 21, 20, k3xl8rq); //科三8日
  LODOP.ADD_PRINT_TEXT(204, 542, 21, 20, k3xl9yf); //科三9月
  LODOP.ADD_PRINT_TEXT(204, 570, 21, 20, k3xl9rq); //科三9日
  LODOP.ADD_PRINT_TEXT(204, 591, 21, 20, k3xl10yf); //科三10月
  LODOP.ADD_PRINT_TEXT(204, 613, 21, 20, k3xl10rq); //科三10日
  LODOP.ADD_PRINT_TEXT(204, 637, 21, 20, k3xl11yf); //科三11月
  LODOP.ADD_PRINT_TEXT(204, 659, 21, 20, k3xl11rq); //科三11日
  LODOP.ADD_PRINT_TEXT(204, 683, 21, 20, k3xl12yf); //科三12月
  LODOP.ADD_PRINT_TEXT(204, 705, 21, 20, k3xl12rq); //科三12日
  LODOP.ADD_PRINT_TEXT(405, 182, 22, 20, k3xl13yf); //科三13月
  LODOP.ADD_PRINT_TEXT(405, 207, 22, 20, k3xl13rq); //科三13日
  LODOP.ADD_PRINT_TEXT(405, 229, 22, 20, k3xl14yf); //科三14月
  LODOP.ADD_PRINT_TEXT(405, 255, 22, 20, k3xl14rq); //科三14日
  LODOP.ADD_PRINT_TEXT(405, 277, 22, 20, k3xl15yf); //科三15月
  LODOP.ADD_PRINT_TEXT(405, 299, 22, 20, k3xl15rq); //科三15日
  LODOP.ADD_PRINT_TEXT(405, 319, 22, 20, k3xl16yf); //科三16月
  LODOP.ADD_PRINT_TEXT(405, 345, 22, 20, k3xl16rq); //科三16日
  LODOP.ADD_PRINT_TEXT(405, 364, 22, 20, k3xl17yf); //科三17月
  LODOP.ADD_PRINT_TEXT(405, 390, 22, 20, k3xl17rq); //科三17日
  LODOP.ADD_PRINT_TEXT(405, 411, 22, 20, k3xl18yf); //科三18月
  LODOP.ADD_PRINT_TEXT(405, 435, 22, 20, k3xl18rq); //科三18日
  LODOP.ADD_PRINT_TEXT(405, 452, 22, 20, k3xl19yf); //科三19月
  LODOP.ADD_PRINT_TEXT(405, 479, 22, 20, k3xl19rq); //科三19日
  LODOP.ADD_PRINT_TEXT(405, 499, 22, 20, k3xl20yf); //科三20月
  LODOP.ADD_PRINT_TEXT(405, 525, 22, 20, k3xl20rq); //科三20日
  LODOP.ADD_PRINT_TEXT(405, 544, 22, 20, k3xl21yf); //科三21月
  LODOP.ADD_PRINT_TEXT(405, 572, 22, 20, k3xl21rq); //科三21日
  LODOP.ADD_PRINT_TEXT(405, 593, 22, 20, k3xl22yf); //科三22月
  LODOP.ADD_PRINT_TEXT(405, 615, 22, 20, k3xl22rq); //科三22日
  LODOP.ADD_PRINT_TEXT(405, 636, 22, 20, k3xl23yf); //科三23月
  LODOP.ADD_PRINT_TEXT(405, 682, 22, 20, k3xl24yf); //科三24月
  LODOP.ADD_PRINT_TEXT(405, 658, 22, 20, k3xl23rq); //科三23日
  LODOP.ADD_PRINT_TEXT(405, 705, 22, 20, k3xl24rq); //科三24日

  LODOP.ADD_PRINT_TEXT(240, 188, 34, 20, k3jxxmxh1); //科三序号1
  LODOP.ADD_PRINT_TEXT(240, 228, 34, 20, k3jxxmxh2); //科三序号2
  LODOP.ADD_PRINT_TEXT(240, 275, 34, 20, k3jxxmxh3); //科三序号3
  LODOP.ADD_PRINT_TEXT(240, 320, 34, 20, k3jxxmxh4); //科三序号4
  LODOP.ADD_PRINT_TEXT(240, 362, 34, 20, k3jxxmxh5); //科三序号5
  LODOP.ADD_PRINT_TEXT(240, 408, 34, 20, k3jxxmxh6); //科三序号6
  LODOP.ADD_PRINT_TEXT(240, 454, 34, 20, k3jxxmxh7); //科三序7号
  LODOP.ADD_PRINT_TEXT(240, 499, 34, 20, k3jxxmxh8); //科三序号8
  LODOP.ADD_PRINT_TEXT(240, 543, 34, 20, k3jxxmxh9); //科三序号9
  LODOP.ADD_PRINT_TEXT(240, 589, 34, 20, k3jxxmxh10); //科三序号10
  LODOP.ADD_PRINT_TEXT(240, 634, 34, 20, k3jxxmxh11); //科三序号11
  LODOP.ADD_PRINT_TEXT(240, 682, 34, 20, k3jxxmxh12); //科三序号12
  LODOP.ADD_PRINT_TEXT(437, 188, 34, 20, k3jxxmxh13); //科三序号13
  LODOP.ADD_PRINT_TEXT(437, 228, 34, 20, k3jxxmxh14); //科三序号14
  LODOP.ADD_PRINT_TEXT(437, 275, 34, 20, k3jxxmxh15); //科三序号15
  LODOP.ADD_PRINT_TEXT(437, 320, 34, 20, k3jxxmxh16); //科三序号16
  LODOP.ADD_PRINT_TEXT(437, 362, 34, 20, k3jxxmxh17); //科三序号17
  LODOP.ADD_PRINT_TEXT(437, 408, 34, 20, k3jxxmxh18); //科三序号18
  LODOP.ADD_PRINT_TEXT(437, 454, 34, 20, k3jxxmxh19); //科三序号19
  LODOP.ADD_PRINT_TEXT(437, 499, 34, 20, k3jxxmxh20); //科三序号20
  LODOP.ADD_PRINT_TEXT(437, 543, 34, 20, k3jxxmxh21); //科三序号21
  LODOP.ADD_PRINT_TEXT(437, 589, 34, 20, k3jxxmxh22); //科三序号22
  LODOP.ADD_PRINT_TEXT(437, 634, 34, 20, k3jxxmxh23); //科三序号23
  LODOP.ADD_PRINT_TEXT(437, 682, 34, 20, k3jxxmxh24); //科三序号24
  LODOP.ADD_PRINT_TEXT(268, 188, 34, 20, k3xs1); //科三学时1
  LODOP.ADD_PRINT_TEXT(268, 228, 34, 20, k3xs2); //科三学时2
  LODOP.ADD_PRINT_TEXT(268, 275, 34, 20, k3xs3); //科三学时3
  LODOP.ADD_PRINT_TEXT(268, 320, 34, 20, k3xs4); //科三学时4
  LODOP.ADD_PRINT_TEXT(268, 362, 34, 20, k3xs5); //科三学时5
  LODOP.ADD_PRINT_TEXT(268, 408, 34, 20, k3xs6); //科三学时6
  LODOP.ADD_PRINT_TEXT(268, 454, 34, 20, k3xs7); //科三学时7
  LODOP.ADD_PRINT_TEXT(268, 499, 34, 20, k3xs8); //科三学时8
  LODOP.ADD_PRINT_TEXT(268, 543, 34, 20, k3xs9); //科三学时9
  LODOP.ADD_PRINT_TEXT(268, 589, 34, 20, k3xs10); //科三学时10
  LODOP.ADD_PRINT_TEXT(268, 634, 34, 20, k3xs11); //科三学时11
  LODOP.ADD_PRINT_TEXT(268, 682, 34, 20, k3xs12); //科三学时12
  LODOP.ADD_PRINT_TEXT(471, 188, 34, 20, k3xs13); //科三学时13
  LODOP.ADD_PRINT_TEXT(471, 228, 34, 20, k3xs14); //科三学时14
  LODOP.ADD_PRINT_TEXT(471, 275, 34, 20, k3xs15); //科三学时15
  LODOP.ADD_PRINT_TEXT(471, 320, 34, 20, k3xs16); //科三学时16
  LODOP.ADD_PRINT_TEXT(471, 362, 34, 20, k3xs17); //科三学时17
  LODOP.ADD_PRINT_TEXT(471, 408, 34, 20, k3xs18); //科三学时18
  LODOP.ADD_PRINT_TEXT(471, 454, 34, 20, k3xs19); //科三学时19
  LODOP.ADD_PRINT_TEXT(471, 499, 34, 20, k3xs20); //科三学时20
  LODOP.ADD_PRINT_TEXT(471, 543, 34, 20, k3xs21); //科三学时21
  LODOP.ADD_PRINT_TEXT(471, 589, 34, 20, k3xs22); //科三学时22
  LODOP.ADD_PRINT_TEXT(471, 634, 34, 20, k3xs23); //科三学时23
  LODOP.ADD_PRINT_TEXT(471, 682, 34, 20, k3xs24); //科三学时24
  LODOP.ADD_PRINT_TEXT(298, 179, 54, 30, k3xyqz1); //科三签字1
  LODOP.ADD_PRINT_TEXT(298, 223, 54, 30, k3xyqz2); //科三签字2
  LODOP.ADD_PRINT_TEXT(298, 269, 54, 30, k3xyqz3); //科三签字3
  LODOP.ADD_PRINT_TEXT(298, 313, 54, 30, k3xyqz4); //科三签字4
  LODOP.ADD_PRINT_TEXT(298, 357, 54, 30, k3xyqz5); //科三签字5
  LODOP.ADD_PRINT_TEXT(298, 403, 54, 30, k3xyqz6); //科三签字6
  LODOP.ADD_PRINT_TEXT(298, 451, 54, 30, k3xyqz7); //科三签字7
  LODOP.ADD_PRINT_TEXT(298, 497, 54, 30, k3xyqz8); //科三签字8
  LODOP.ADD_PRINT_TEXT(298, 537, 54, 30, k3xyqz9); //科三签字9
  LODOP.ADD_PRINT_TEXT(298, 587, 54, 30, k3xyqz10); //科三签字10
  LODOP.ADD_PRINT_TEXT(298, 632, 54, 30, k3xyqz11); //科三签字11
  LODOP.ADD_PRINT_TEXT(298, 678, 54, 30, k3xyqz12); //科三签字12
  LODOP.ADD_PRINT_TEXT(502, 179, 54, 30, k3xyqz13); //科三签字13
  LODOP.ADD_PRINT_TEXT(502, 225, 54, 30, k3xyqz14); //科三签字14
  LODOP.ADD_PRINT_TEXT(502, 271, 54, 30, k3xyqz15); //科三签字15
  LODOP.ADD_PRINT_TEXT(502, 315, 54, 30, k3xyqz16); //科三签字16
  LODOP.ADD_PRINT_TEXT(502, 359, 54, 30, k3xyqz17); //科三签字17
  LODOP.ADD_PRINT_TEXT(502, 405, 54, 30, k3xyqz18); //科三签字18
  LODOP.ADD_PRINT_TEXT(502, 453, 54, 30, k3xyqz19); //科三签字19
  LODOP.ADD_PRINT_TEXT(502, 499, 54, 30, k3xyqz20); //科三签字20
  LODOP.ADD_PRINT_TEXT(502, 539, 54, 30, k3xyqz21); //科三签字21
  LODOP.ADD_PRINT_TEXT(502, 587, 54, 30, k3xyqz22); //科三签字22
  LODOP.ADD_PRINT_TEXT(502, 634, 54, 30, k3xyqz23); //科三签字23
  LODOP.ADD_PRINT_TEXT(502, 680, 54, 30, k3xyqz24); //科三签字24
}

/*科四 */
export function printSubject4(data: any, LODOP: any) {
  const k4xl1yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl1yf'); //   科4训练1月份
  const k4xl1rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl1rq'); //   科4训练1日期
  const k4xl2yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl2yf'); //   科4训练2月份
  const k4xl2rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl2rq'); //   科4训练2日期
  const k4xl3yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl3yf'); //   科4训练3月份
  const k4xl3rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl3rq'); //   科4训练3日期
  const k4xl4rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl4rq'); //   科4训练4日期
  const k4xl4yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl4yf'); //   科4训练4月份
  const k4xl5yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl5yf'); //   科4训练5月份
  const k4xl5rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl5rq'); //   科4训练5日期
  const k4xl6yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl6yf'); //   科4训练6月份
  const k4xl6rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl6rq'); //   科4训练6日期
  const k4xl7yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl7yf'); //   科4训练7月份
  const k4xl7rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl7rq'); //   科4训练7日期
  const k4xl8yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl8yf'); //   科4训练8月份
  const k4xl8rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl8rq'); //   科4训练8日期
  const k4xl9yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl9yf'); //   科4训练9月份
  const k4xl9rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl9rq'); //   科4训练9日期
  const k4xl10yf = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl10yf'); //    科4训练10月份
  const k4xl10rq = _get(data, 'stuClassrecordStageFourTaodaDto.k4xl10rq'); //    科4训练10日期
  const k4jxxmxh1 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh1'); //  科4教学项目序号1
  const k4jxxmxh2 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh2'); //  科4教学项目序号2
  const k4jxxmxh3 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh3'); //  科4教学项目序号3
  const k4jxxmxh4 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh4'); //  科4教学项目序号4
  const k4jxxmxh5 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh5'); //  科4教学项目序号5
  const k4jxxmxh6 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh6'); //  科4教学项目序号6
  const k4jxxmxh7 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh7'); //  科4教学项目序号7
  const k4jxxmxh8 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh8'); //  科4教学项目序号8
  const k4jxxmxh9 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh9'); //  科4教学项目序号9
  const k4jxxmxh10 = _get(data, 'stuClassrecordStageFourTaodaDto.k4jxxmxh10'); //	科4教学项目序号10
  const k4xs1 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs1'); //  科4学时1
  const k4xs2 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs2'); //  科4学时2
  const k4xs3 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs3'); //  科4学时3
  const k4xs4 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs4'); //  科4学时4
  const k4xs5 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs5'); //  科4学时5
  const k4xs6 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs6'); //  科4学时6
  const k4xs7 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs7'); //  科4学时7
  const k4xs8 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs8'); //  科4学时8
  const k4xs9 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs9'); //  科4学时9
  const k4xs10 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xs10'); //  科4学时10
  const k4xyqz1 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz1'); //  科4学员签字1
  const k4xyqz2 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz2'); //  科4学员签字2
  const k4xyqz3 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz3'); //  科4学员签字3
  const k4xyqz4 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz4'); //  科4学员签字4
  const k4xyqz5 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz5'); //  科4学员签字5
  const k4xyqz6 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz6'); //  科4学员签字6
  const k4xyqz7 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz7'); //  科4学员签字7
  const k4xyqz8 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz8'); //  科4学员签字8
  const k4xyqz9 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz9'); //  科4学员签字9
  const k4xyqz10 = _get(data, 'stuClassrecordStageFourTaodaDto.k4xyqz10'); //科4学员签字10

  LODOP.ADD_PRINT_TEXT(195, 173, 22, 20, k4xl1yf); //科四1月
  LODOP.ADD_PRINT_TEXT(195, 204, 22, 20, k4xl1rq); //科四1日
  LODOP.ADD_PRINT_TEXT(195, 227, 22, 20, k4xl2yf); //科四2月
  LODOP.ADD_PRINT_TEXT(195, 257, 22, 20, k4xl2rq); //科四2日
  LODOP.ADD_PRINT_TEXT(195, 284, 22, 20, k4xl3yf); //科四3月
  LODOP.ADD_PRINT_TEXT(195, 312, 22, 20, k4xl3rq); //科四3日
  LODOP.ADD_PRINT_TEXT(195, 338, 22, 20, k4xl4yf); //科四4月
  LODOP.ADD_PRINT_TEXT(195, 366, 22, 20, k4xl4rq); //科四4日
  LODOP.ADD_PRINT_TEXT(195, 394, 22, 20, k4xl5yf); //科四5月
  LODOP.ADD_PRINT_TEXT(195, 424, 22, 20, k4xl5rq); //科四5日
  LODOP.ADD_PRINT_TEXT(195, 450, 22, 20, k4xl6yf); //科四6月
  LODOP.ADD_PRINT_TEXT(195, 478, 22, 20, k4xl6rq); //科四6日
  LODOP.ADD_PRINT_TEXT(195, 503, 22, 20, k4xl7yf); //科四7月
  LODOP.ADD_PRINT_TEXT(195, 533, 22, 20, k4xl7rq); //科四7日
  LODOP.ADD_PRINT_TEXT(195, 558, 22, 20, k4xl8yf); //科四8月
  LODOP.ADD_PRINT_TEXT(195, 589, 22, 20, k4xl8rq); //科四8日
  LODOP.ADD_PRINT_TEXT(195, 614, 22, 20, k4xl9yf); //科四9月
  LODOP.ADD_PRINT_TEXT(195, 643, 22, 20, k4xl9rq); //科四9日
  LODOP.ADD_PRINT_TEXT(195, 669, 22, 20, k4xl10yf); //'科四10月'
  LODOP.ADD_PRINT_TEXT(195, 699, 22, 20, k4xl10rq); //'科四10日'
  LODOP.ADD_PRINT_TEXT(231, 183, 34, 20, k4jxxmxh1); //科四序号1
  LODOP.ADD_PRINT_TEXT(231, 239, 34, 20, k4jxxmxh2); //科四序号2
  LODOP.ADD_PRINT_TEXT(231, 294, 34, 20, k4jxxmxh3); //科四序号3
  LODOP.ADD_PRINT_TEXT(231, 348, 34, 20, k4jxxmxh4); //科四序号4
  LODOP.ADD_PRINT_TEXT(231, 406, 34, 20, k4jxxmxh5); //科四序号5
  LODOP.ADD_PRINT_TEXT(231, 459, 34, 20, k4jxxmxh6); //科四序号6
  LODOP.ADD_PRINT_TEXT(231, 515, 34, 20, k4jxxmxh7); //科四序号7
  LODOP.ADD_PRINT_TEXT(231, 568, 34, 20, k4jxxmxh8); //科四序号8
  LODOP.ADD_PRINT_TEXT(231, 627, 34, 20, k4jxxmxh9); //科四序号9
  LODOP.ADD_PRINT_TEXT(231, 684, 34, 20, k4jxxmxh10); //科四序号10
  LODOP.ADD_PRINT_TEXT(279, 183, 34, 20, k4xs1); //科四学时1
  LODOP.ADD_PRINT_TEXT(279, 239, 34, 20, k4xs2); //科四学时2
  LODOP.ADD_PRINT_TEXT(279, 294, 34, 20, k4xs3); //科四学时3
  LODOP.ADD_PRINT_TEXT(279, 348, 34, 20, k4xs4); //科四学时4
  LODOP.ADD_PRINT_TEXT(279, 406, 34, 20, k4xs5); //科四学时5
  LODOP.ADD_PRINT_TEXT(279, 459, 34, 20, k4xs6); //科四学时6
  LODOP.ADD_PRINT_TEXT(279, 515, 34, 20, k4xs7); //科四学时7
  LODOP.ADD_PRINT_TEXT(279, 568, 34, 20, k4xs8); //科四学时8
  LODOP.ADD_PRINT_TEXT(279, 627, 34, 20, k4xs9); //科四学时9
  LODOP.ADD_PRINT_TEXT(279, 684, 34, 20, k4xs10); //科四学时10
  LODOP.ADD_PRINT_TEXT(318, 175, 49, 25, k4xyqz1); //科四签字1
  LODOP.ADD_PRINT_TEXT(318, 233, 49, 25, k4xyqz2); //科四签字2
  LODOP.ADD_PRINT_TEXT(318, 287, 49, 25, k4xyqz3); //科四签字3
  LODOP.ADD_PRINT_TEXT(318, 340, 49, 25, k4xyqz4); //科四签字4
  LODOP.ADD_PRINT_TEXT(318, 396, 49, 25, k4xyqz5); //科四签字5
  LODOP.ADD_PRINT_TEXT(318, 446, 49, 25, k4xyqz6); //科四签字6
  LODOP.ADD_PRINT_TEXT(318, 503, 49, 25, k4xyqz7); //科四签字7
  LODOP.ADD_PRINT_TEXT(318, 557, 49, 25, k4xyqz8); //科四签字8
  LODOP.ADD_PRINT_TEXT(318, 616, 49, 25, k4xyqz9); //科四签字9
  LODOP.ADD_PRINT_TEXT(318, 669, 49, 25, k4xyqz10); //科四签字10
}

//打印列表，lodop自动分页
export function printData(data: any, businessTypeHash: any, studentTypeHash: any, subjectcodeHash: any) {
  let html: string = `<table border="1"><thead><th>驾校名称</th><th>姓名</th><th>证件号</th><th>联系电话</th><th>学车教练</th><th>培训车型</th><th>业务类系</th><th>学员类型</th><th>培训阶段</th><th>入学年份</th><th>期数</th><th>期数学号</th></thead>`;
  data.forEach(
    (item: any) =>
      (html += `<tr>
  <td>${_get(item, 'schoolname', '')}</td>
  <td>${_get(item, 'idcard', '')}</td>
  <td>${_get(item, 'phone', '')}</td>
  <td>${_get(item, 'coachname', '')}</td>
  <td>${_get(item, 'traintype', '')}</td>
  <td>${businessTypeHash[_get(item, 'busitype', '')]}</td>
  <td>${_get(item, 'appointDate', '')}</td>
  <td>${studentTypeHash[_get(item, 'studenttype', '')]}</td>
  <td>${subjectcodeHash[_get(item, 'learnStage', '')]}</td>
  <td>${_get(item, 'periodYear', '')}</td>
  <td>${_get(item, 'periodId', '')}</td>
  <td>${_get(item, 'periodNum', '')}</td>
  </tr>`),
  );
  html += `</table>`;
  html.replace(/(^\s+)|(\s+$)/g, '');
  const win = window as any;
  var LODOP = win.getLodop();
  if (!LODOP || !LODOP.VERSION) {
    return 'NO_SOFTWARE';
  }
  LODOP.PRINT_INIT('打印综合表格');
  var strStyle = '<style> table,td,th {border-width: 1px;border-style: solid;border-collapse: collapse}</style>';
  LODOP.ADD_PRINT_TABLE(50, '5%', '90%', 500, strStyle + html);
  // ADD_PRINT_TABLE(Top,Left,Width,Height,strHtml)
  LODOP.SET_PRINT_STYLEA(0, 'Vorient', 3);
  LODOP.ADD_PRINT_HTM(
    1,
    600,
    300,
    100,
    "总页号：<font color='#0000ff' format='ChineseNum'><span tdata='pageNO'>第##页</span>/<span tdata='pageCount'>共##页</span></font>",
  );
  // ADD_PRINT_HTML(Top,Left,Width,Height, strHtmlContent)
  LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1);
  LODOP.SET_PRINT_STYLEA(0, 'Horient', 1);
  LODOP.PREVIEW();
  return false;
}
