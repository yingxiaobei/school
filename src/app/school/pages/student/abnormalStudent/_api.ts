import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

export async function _getList(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuExceptionInfo/pageList`, 'GET', query);
}
