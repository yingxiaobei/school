import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// http://192.168.192.132:3000/project/183/interface/api/25721
// 车辆视频监控播放地址
export async function _getCarVideo(query: {
  carId: string;
  cameraNum: number; // 摄像头序号   1-内置； 2-外置
  carSchoolId: any;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/carVideo`, 'GET', query);
}

//http://192.168.192.132:3000/project/183/interface/api/25805
// 车辆视频监控播放地址
export async function _stopCarVideo(query: {
  carId: string;
  cameraNum: number; // 摄像头序号   1-内置； 2-外置
  carSchoolId: any;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/carVideoStop`, 'GET', query);
}

//http://192.168.192.132:3000/project/183/interface/api/36639
// 监控视频回放列表
export async function _playBackList(query: {
  carId: string;
  carSchoolId: string;
  beginTime?: string;
  endTime?: string;
  currentPage: number;
  pageSize: any;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schTermVideo/monitorPlayBackList`, 'GET', { ...query });
}

//http://192.168.192.132:3000/project/183/interface/api/36614
// 播放视频
export async function _playVideo(query: { id: string }, schoolId: string) {
  return await request(`${NOT_CORE_PREFIX}/v1/schTermVideo/playVideo`, 'GET', query, {
    customHeader: { carSchoolId: schoolId },
  });
}
