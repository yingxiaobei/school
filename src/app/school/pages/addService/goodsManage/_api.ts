import { request } from 'services';
import { VIDEO_FACE } from 'constants/env';
import { Auth } from 'utils';

// 查询驾校可分销商品
// http://192.168.192.132:3000/project/178/interface/api/54558
export async function _getList() {
  return await request(`${VIDEO_FACE}/v1/theory/sku/getRetailSkuBySch`, 'GET', { schoolId: Auth.get('schoolId') });
}
