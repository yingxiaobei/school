import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 查询学员支付订单信息
// http://192.168.192.132:3000/project/193/interface/api/16145
export async function _getInfo(query: {
  page: number;
  limit: number;
  sid: string;
  paystatus: string; //支付状态   0：待支付 1、支付中，2、已支付，3、已取消，4，已完成
  returnordercode?: string; //从支付中心返回订单号
  payordercode?: string; //支付单编号
  sname?: string; //学员姓名
  stuidnum?: string; //学员身份证号
  payaccouttype?: string; //支付账号类型  1、 钱包支付、2支付宝支付，3 免支付, 4 线下支付   5:  维尔云付款-平安银行
  ordertype?: string; //订单类型  1:冻结支付  2：到账支付  3：线下支付
  datebegin?: string; //时间起 yyyy-MM-dd
  dateend?: string; //时间止 yyyy-MM-dd
  bustype?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/pageList`, 'GET', query);
}

//学员支付订单详情
//http://192.168.192.132:3000/project/193/interface/api/16159
export async function _getDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/selectByKey`, 'GET', query);
}

//获取商品信息
//http://192.168.192.132:3000/project/193/interface/api/20254
export async function _querySkuBy(query: { orderitemids: string }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/querySkuBy`, 'GET', query);
}

//获取改价商品信息
//http://192.168.192.132:3000/project/193/interface/api/20541
export async function _getChangeDetail(query: { orderid: string; order_code: string; sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/queryChangeDetail`, 'GET', query);
}

//修改价格
//http://192.168.192.132:3000/project/193/interface/api/20548
export async function _ChangePrice(query: {
  orderid: string; //订单主键
  payprice: any; //修改后的价格
  sid: string; //学员表主键
  order_code?: string; //订单代码   从订单中心获取主键
  list?: any; //明细列表
}) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/updatePrice`, 'PUT', query, {
    customHeader: { menuId: 'financial/studentOrder', elementId: 'financial/studentOrder:btn2' },
  });
}
