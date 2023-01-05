import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

//车学堂同步状态查询
//http://192.168.192.132:3000/project/193/interface/api/20849
export async function _getInfo(query: {
  page: number;
  limit: number;
  customSchoolId: string;
  sid?: string;
  sendflag?: string;
}) {
  return await request(
    `${CORE_PREFIX}/v1/student/syncStatus`,
    'GET',
    { page: query.page, limit: query.limit, sid: query.sid, sendflag: query.sendflag },
    {
      customHeader: { customSchoolId: query.customSchoolId },
    },
  );
}

//车学堂推送学员
//http://192.168.192.132:3000/project/193/interface/api/20856
export async function _sendSync(
  query: { id: string },
  customHeader?: {
    customSchoolId?: string;
    menuId?: string;
    detailAuthId?: string;
  },
) {
  return await request(`${CORE_PREFIX}/v1/student/sendSync`, 'POST', query, {
    withFeedback: true,
    customHeader,
  });
}
