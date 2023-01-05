import { DRIVING_SHOW } from 'constants/env';
import { request } from 'services';

export type AdmissionsQuery = {
  phone: string; // 线索手机号
  referrer: string; // 推荐人
  startTime: string; // yyyy-MM-dd
  endTime: string;
  // otherPhone: string; // 推荐人手机号
  isExport: 0 | 1 | null;
};

// http://192.168.192.132:3000/project/291/interface/api/47550
export type Admissions = {
  id: string;
  phone: string;
  createDate: string;
  referrer?: string;
  referrerPhone?: string;
};

// 查询学员意向列表
export async function _getAdmissions(query: Partial<AdmissionsQuery>) {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/stu/queryList`, 'POST', query);
}

export async function _beforeExport(query: Partial<AdmissionsQuery>) {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/stu/beforeExport`, 'POST', query, {});
}

export async function _export(query: Partial<AdmissionsQuery>) {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/stu/export`, 'POST', query, {
    responseType: 'arraybuffer',
  });
}
