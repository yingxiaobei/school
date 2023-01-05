import { _getCustomParam } from 'api';
import { useFetch } from 'hooks';
import { Auth, _get } from 'utils';

export const useClassStart = () => {
  const { data: paramData } = useFetch({
    request: _getCustomParam, //自定义参数配置二级监管平台类型（两位数字，第一位与“监管请求平台类型”保持一致 00：省监管 01：省监管-河南）
    query: { paramCode: 'stu_class_audit_dept ', schoolId: Auth.get('schoolId') },
  });

  const isClassesStart = _get(paramData, 'paramValue', '') !== '0';

  return isClassesStart;
};
