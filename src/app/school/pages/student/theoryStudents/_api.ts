import { CORE_PREFIX, DATA_EXCHANGE_PREFIX } from 'constants/env';
import { request } from 'services';

interface TheoryStudent {
  applydatebegin?: string;
  applydateend?: EndOfStreamError;
  db?: string;
  idcard?: string;
  learnStage?: string;
  limit: number;
  name?: string;
  page: number;
  periodId?: string;
  periodNum?: string;
  periodYear?: string;
  schoolid?: string;
}

// 分页展示信息列表
// http://192.168.192.132:3000/project/193/interface/api/37349
export function _getPageList(query: TheoryStudent, customHeader: unknown) {
  return request(`${CORE_PREFIX}/v1/stuStudentSummary/pageList`, 'GET', query, { customHeader });
}

// 查询理论中心下的实操驾校
// http://192.168.192.132:3000/project/193/interface/api/37344
export function _getSchoolNameList(query: any, customHeader: unknown) {
  return request(`${CORE_PREFIX}/v1/stuStudentSummary/listAssociated`, 'GET', query, { customHeader });
}

// 导出理科中心汇总学员Excel前查询
// http://192.168.192.132:3000/project/193/interface/api/37679
export function _exportExcelBefore(query: any, customHeader: unknown) {
  return request(`${CORE_PREFIX}/v1/stuStudentSummary/exportStudentBefore`, 'GET', query, { customHeader });
}

// 导出学员Excel
// http://192.168.192.132:3000/project/193/interface/api/37674
export function _exportExcel(query: any, customHeader: unknown) {
  return request(`${CORE_PREFIX}/v1/stuStudentSummary/export`, 'GET', query, {
    responseType: 'arraybuffer',
    customHeader,
  });
}

// 导出学员Excel
// http://192.168.192.132:3000/project/193/interface/api/48066
export function _checkStatus(query: any) {
  return request(`${CORE_PREFIX}/v1/stuStudentSummary/checkStudent`, 'POST', {
    sids: query.sids,
    schoolId: query.schoolId,
  });
}
