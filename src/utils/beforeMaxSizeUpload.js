import { message } from 'antd';

export function beforeMaxSizeUpload(
  file,
  fileList,
  fileTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'],
  maxSize = 10, //单位：M
) {
  const isValidFileType = fileTypes.includes(file.type);
  const isValidSize = parseInt(file.size / 1024) <= parseInt(maxSize * 1024);
  if (!isValidFileType) {
    message.error('上传文件格式不对!');
    return false;
  }
  if (!isValidSize) {
    let errorSize = maxSize;
    if (errorSize < 1) {
      errorSize = errorSize * 1024;
      message.error(`图片必须小于等于${errorSize}kb!`);
      return false;
    }

    errorSize = Math.round(maxSize * 100) / 100; //最多两位小数点
    message.error(`图片必须小于等于${errorSize}M!`);
    return false;
  }

  return true;
}
