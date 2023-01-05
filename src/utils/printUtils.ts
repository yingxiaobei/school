export function getPrintDeviceList() {
  const win = window as any;
  let LODOP = win.getLodop();
  if (!LODOP || !LODOP.VERSION) {
    return;
  }
  // 获取打印机个数
  let count = LODOP.GET_PRINTER_COUNT();
  let printValue = LODOP.GET_PRINTER_NAME(-1); //获取默认打印机

  const printList = Array(count)
    .fill(null)
    .map((...args) => {
      return {
        value: args[1], // args[1]为数组索引
        label: LODOP.GET_PRINTER_NAME(args[1]), // 获取打印机名称
      };
    });
  return { printValue, printList };
}

export function setDefaultPrintDevice(index: any) {
  const win = window as any;
  let LODOP = win.getLodop();
  if (!LODOP || !LODOP.VERSION) {
    return;
  }
  LODOP.SET_PRINTER_INDEX(index);
}
export function printPdf(strURL: any, type?: any, dispatch?: any, LODOP1?: any) {
  const win = window as any;
  let LODOP = LODOP1 ? LODOP1 : win.getLodop();

  if (!LODOP || !LODOP.VERSION) {
    return 'NO_SOFTWARE';
  }
  // dispatch({ type, payLoad: { status: 'printing' } });
  // console.log('printing');
  // return;
  LODOP.PRINT_INIT('打印');
  console.log(strURL);

  LODOP.SET_PRINT_PAGESIZE(3, 0, 60, 'A4');
  LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', demoDownloadPDF(strURL));

  LODOP.NEWPAGEA();
  LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 0, 0, '');
  // if (isPreview) {
  //   LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 0, 0, '预览查看.开始打印');
  //   return LODOP.PREVIEW();
  // }
  console.log(LODOP.CVERSION, 11);
  // return;
  // if (LODOP.CVERSION) {
  //   LODOP.On_Return_Remain = true;
  //   LODOP.On_Return = function (TaskID: any, Value: any) {
  //     // const statusOk = LODOP.GET_VALUE('PRINT_STATUS_OK', P_ID);
  //     console.log(TaskID, Value);
  //     if (Value) {
  //       dispatch({ type, payLoad: { status: 'printing' } });
  //       console.log('已发出实际打印命令！');
  //     } else {
  //       console.log('放弃打印！');
  //     }
  //   };
  //   LODOP.PREVIEW();
  //   return;
  // }
  const P_ID = LODOP.PRINT();
  // dispatch({ type, payLoad: { status: 'addPrint',pid:P_ID } });

  // const statusOk = LODOP.GET_VALUE('PRINT_STATUS_OK', P_ID);
  // const statusExist = LODOP.GET_VALUE('PRINT_STATUS_EXIST', P_ID);
  console.log(P_ID);
}

//批量打印
export function printingBatch(strURL: any, isPreview = false) {
  const win = window as any;
  let LODOP = win.getLodop();

  const strURLorContent = strURL;
  if (!LODOP || !LODOP.VERSION) {
    return 'NO_SOFTWARE';
  }

  LODOP.PRINT_INIT('打印');
  LODOP.SET_PRINT_PAGESIZE(3, 0, 60, 'A4');
  for (let j = 0; j < strURLorContent.length; j++) {
    creatPdfRage(strURLorContent[j]);
  }
  LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 0, 0, '');
  if (isPreview) {
    LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 0, 0, '预览查看.开始打印');
    return LODOP.PREVIEW();
  }

  LODOP.PRINTB();
}
function creatPdfRage(pdf: any) {
  const win = window as any;
  let LODOP = win.getLodop();
  LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', demoDownloadPDF(pdf));
  LODOP.NEWPAGEA();
}

function demoGetBASE64(dataArray: any) {
  var digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var strData = '';
  for (var i = 0, ii = dataArray.length; i < ii; i += 3) {
    if (isNaN(dataArray[i])) break;
    var b1 = dataArray[i] & 0xff,
      b2 = dataArray[i + 1] & 0xff,
      b3 = dataArray[i + 2] & 0xff;
    var d1 = b1 >> 2,
      d2 = ((b1 & 3) << 4) | (b2 >> 4);
    var d3 = i + 1 < ii ? ((b2 & 0xf) << 2) | (b3 >> 6) : 64;
    var d4 = i + 2 < ii ? b3 & 0x3f : 64;
    strData +=
      digits.substring(d1, d1 + 1) +
      digits.substring(d2, d2 + 1) +
      digits.substring(d3, d3 + 1) +
      digits.substring(d4, d4 + 1);
  }
  console.log(strData);
  return strData;
  // return '';
}

function demoDownloadPDF(url: any) {
  if (!/^https?:/i.test(url)) return;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false); //同步方式
  var arraybuffer = false;
  if (xhr.overrideMimeType)
    try {
      xhr.responseType = 'arraybuffer';
      arraybuffer = true;
    } catch (err) {
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
    }
  xhr.send(null);
  var data = xhr.response;
  var dataArray;
  if (typeof Uint8Array !== 'undefined') {
    if (arraybuffer) dataArray = new Uint8Array(data);
    else {
      dataArray = new Uint8Array(data.length);
      for (var i = 0; i < dataArray.length; i++) {
        dataArray[i] = data.charCodeAt(i);
      }
    }
  }
  return demoGetBASE64(dataArray);
}
