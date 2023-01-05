import moment from 'moment';

export function minuteDiff(date1: any, date2: any) {
  const hour1 = moment(date1).hours();
  const hour2 = moment(date2).hours();
  const minutes1 = moment(date1).minutes();
  const minutes2 = moment(date2).minutes();

  return hour1 * 60 + minutes1 - hour2 * 60 - minutes2;
}

export function printInfo(data: Array<any>, id: any) {
  let html: string = `<table><tr><th>姓名</th><th>证件号</th><th>教练</th><th>训练车号</th><th>考试车型</th><th>报名日期</th><th>考试科目</th><th>预约日期</th><th>证件号</th><th>考试日期</th><th>考试成绩</th><th>考试结果</th><th>考试场地</th><th>考试场次</th></tr>`;
  data.forEach(
    (item) =>
      (html += `<tr>
  <td>${item.idCard}</td>
  <td>${item.coaName}</td>
  <td>${item.trainCarCode}</td>
  <td>${item.testCarModel}</td>
  <td>${item.applyDateTime}</td>
  <td>${item.testSubject}</td>
  <td>${item.appointDate}</td>
  <td>${item.testDate}</td>
  <td>${item.testScores}</td>
  <td>${item.testResult}</td>
  <td>${item.testPlace}</td>
  <td>${item.testEtc}</td>
  </tr>`),
  );
  html += `</table>`;
  html.replace(/(^\s+)|(\s+$)/g, '');
  // debugger
  let printHtml = document?.getElementById(id)?.innerHTML || '';

  let wind: any = window.open(
    '',
    'newwindow',
    'height=300, width=700, top=100, left=100, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=n o, status=no',
  );

  wind.document.body.innerHTML = html;
  wind.print();
  return false;
}
