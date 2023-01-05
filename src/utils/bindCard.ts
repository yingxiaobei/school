import { message } from 'antd';
import { getIdCardAll, _get } from 'utils';

export default async function bindCardCommon() {
  const result = await getIdCardAll(); //获取身份证所有信息

  if (_get(result, 'result') === false) {
    return 'update';
  }

  if (_get(result, 'return') !== '144') {
    message.info(_get(result, 'info', '未检测到身份证'));
    return false;
  }
  return result;
}
