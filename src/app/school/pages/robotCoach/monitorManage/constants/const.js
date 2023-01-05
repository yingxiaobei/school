import * as THREE from 'three';

export const BASE_H = 0; // 采集地图坐标的基准（最低）高度 75
export const margin = 0.05;
export const ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
export const DISABLE_DEACTIVATION = 4;

export const TRAINLAND_MARGIN = 0; //场地向外拓展距离 150 200 330
export const BASE_H2 = 73.1; // 地标线高度
export const BASE_H3 = 72; // 坡道栏杆高度
export const FORBIDLINE_HEIGHT = 0;
export const FLOWER_FENCE_H = 0;
export const TRAINROAD_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x000000,
  flatShading: true,
  transparent: true,
  opacity: 0.5,
});

export const FORBIDLINE_SOLID_MATERAIL = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  // lineWidth: 20//无效
});
export const FORBIDLINE_CLOUD_MATERAIL = new THREE.LineDashedMaterial({
  side: THREE.DoubleSide,
  // lineWidth: 20,//无效
  color: 0x00ff00, //线段的颜色 绿色
  dashSize: 1, //短划线的大小
  // gapSize: 3,//短划线之间的距离
  scale: 1.0, // 比例越大，虚线越密；反之，虚线越疏
});
export const FORBIDLINE_DOTTED_MATERAIL = new THREE.LineDashedMaterial({
  side: THREE.DoubleSide,
  // lineWidth: 20,//无效
  color: 0xffffff, //线段的颜色
  dashSize: 1, //短划线的大小
  // gapSize: 3,//短划线之间的距离
  scale: 1.0, // 比例越大，虚线越密；反之，虚线越疏
});
export const FORBIDLINE_ERROR_MATERAIL = new THREE.MeshBasicMaterial({
  color: 0xff0000, //红色
  side: THREE.DoubleSide,
  // lineWidth: 20//无效
});

// 临时微调
export const OFFSET_X = -67;
export const OFFSET_Z = 32;
