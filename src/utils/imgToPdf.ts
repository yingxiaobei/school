import { jsPDF } from 'jspdf';

export function imgToPdf(imageData: any) {
  // 三个参数，第一个方向，第二个单位，第三个尺寸格式
  const doc = new jsPDF('landscape', 'pt', [805, 415]);
  // 将图片转化为dataUrl
  doc.addImage(imageData, 'PNG', 0, 0, 805, 415);
  return doc.output('datauristring');
}
