import { message, Upload } from 'antd';

export function beforeUpload(
  file,
  fileList,
  fileTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'],
  maxSize = 10, //单位：M
  isMul = false,
  minSize = 0,
) {
  const isValidFileType = fileTypes.includes(file.type);
  if (!isValidFileType) {
    message.error('上传文件格式不对!');
    return isMul ? Upload.LIST_IGNORE : false;
  }
  const size = file.size / 1024 / 1024;
  if (maxSize && minSize > maxSize) {
    message.error(`配置错误，请联系管理人员调整`);
    return isMul ? Upload.LIST_IGNORE : false;
  }
  if (size < minSize) {
    message.error(`文件要求不小于${minSize * 1024}kb`);
    return isMul ? Upload.LIST_IGNORE : false;
  }
  if (!!maxSize && size > maxSize) {
    message.error(maxSize === 10 ? `图片必须小于${maxSize}M` : `文件要求不大于${maxSize * 1024}kb`);
    return isMul ? Upload.LIST_IGNORE : false;
  }
  return true;
}
