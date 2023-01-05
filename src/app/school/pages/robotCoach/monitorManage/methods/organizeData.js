/**
 * 将地图信息进行整理
 * 坐标信息转换成已毫米为长度的相对坐标点
 * example：
 * input [object] ->:placeInfoData(地址坐标点信息)：
 * output：object ->{points:{x: y: z:},locationType,locationType} 点坐标 ：points  locationType：科目类别编号 locationName：科目名称
 **/
import { CGpsCoordinate, CCartesianCoordinate } from '../utils/XCar20Alg_v1';
import { _get } from 'utils';

export function organizeData(placeInfoData) {
  // 初始化两个点
  const schoolName = _get(placeInfoData, 'locationName', '');
  let gps_origin = new CGpsCoordinate(
    _get(placeInfoData, 'modelInfo.basic.originPointY', 0),
    _get(placeInfoData, 'modelInfo.basic.originPointX', 0),
    0,
  ); // 原点GPS
  let xyz_origin = new CCartesianCoordinate(0, 0, 0); // 原点GPS 对应的XYZ值为0,0,0
  // 形成场地数据
  const pointsData = _get(placeInfoData, 'locations', []).map((item, index, arr) => {
    // 侧方停车
    const points = _get(item, 'modelInfo.body', []).map((item, index, arr) => {
      // 开始点的GPS坐标
      let gpsStartPoint = new CGpsCoordinate(item.yAxis, item.xAxis, item.zAxis); // 要计算的GPS
      let xyzStartPoint = new CCartesianCoordinate(0, 0, 0);
      // 计算出xyz2的值就是X,Y,Z值
      CCartesianCoordinate.ComputeCartesianByGPS(gps_origin, gpsStartPoint, xyz_origin, xyzStartPoint); // 开始点
      return {
        x: _get(xyzStartPoint, 'x', 0) * 1000,
        y: _get(xyzStartPoint, 'y', 0) * 1000,
        z: _get(item, 'zAxis', 0) * 1000,
        index: _get(item, 'index'),
      };
    });
    return { points, locationType: _get(item, 'locationType', ''), locationName: _get(item, 'locationName', '') };
  });
  // 获取形成模型数据（场地、草地、地标线、坡道场地）
  const grassPoints = []; // 草地
  const axisDatasPoint = []; // 场地
  const roadSignDatas = []; // 地标线
  const rampPoints = []; // 坡道场地
  const rampWall = []; // 矮墙

  // eslint-disable-next-line array-callback-return
  _get(placeInfoData, 'modelInfo.model', []).map((x, index, arr) => {
    // 矮墙
    if (_get(x, 'type', '') === 'rampWall') {
      const rampWallPointList = _get(x, 'body', '').map((item, index, arr) => {
        // 开始点的GPS坐标
        let gpsStartPoint = new CGpsCoordinate(item.yAxis, item.xAxis, item.zAxis); // 要计算的GPS
        let xyzStartPoint = new CCartesianCoordinate(0, 0, 0);
        // 计算出xyz2的值就是X,Y,Z值
        CCartesianCoordinate.ComputeCartesianByGPS(gps_origin, gpsStartPoint, xyz_origin, xyzStartPoint); // 开始点
        return {
          x: _get(xyzStartPoint, 'x', 0) * 1000,
          y: _get(xyzStartPoint, 'y', 0) * 1000,
          z: _get(item, 'zAxis', 0) * 1000,
        };
      });
      rampWall.push(rampWallPointList);
    }
    // 草地
    if (_get(x, 'type', '') === 'grass') {
      const grassPointList = _get(x, 'body', '').map((item, index, arr) => {
        // 开始点的GPS坐标
        let gpsStartPoint = new CGpsCoordinate(item.yAxis, item.xAxis, item.zAxis); // 要计算的GPS
        let xyzStartPoint = new CCartesianCoordinate(0, 0, 0);
        // 计算出xyz2的值就是X,Y,Z值
        CCartesianCoordinate.ComputeCartesianByGPS(gps_origin, gpsStartPoint, xyz_origin, xyzStartPoint); // 开始点
        return {
          x: _get(xyzStartPoint, 'x', 0) * 1000,
          y: _get(xyzStartPoint, 'y', 0) * 1000,
          z: _get(item, 'zAxis', 0) * 1000,
        };
      });
      grassPoints.push(grassPointList);
    }
    //  场地
    if (_get(x, 'type', '') === 'place') {
      // 整理大场地的线
      const axisDatas = _get(x, 'body', []).map((item, index, arr) => {
        // 开始点的GPS坐标
        let gpsStartPoint = new CGpsCoordinate(_get(item, 'yAxis', 0), _get(item, 'xAxis', 0), _get(item, 'zAxis', 0)); // 要计算的GPS
        let xyzStartPoint = new CCartesianCoordinate(0, 0, 0);
        CCartesianCoordinate.ComputeCartesianByGPS(gps_origin, gpsStartPoint, xyz_origin, xyzStartPoint); // 开始点
        return {
          x: _get(xyzStartPoint, 'x', 0) * 1000,
          y: _get(xyzStartPoint, 'y', 0) * 1000,
          z: _get(xyzStartPoint, 'z', 0) * 1000,
          index: index + 1,
        };
      });
      axisDatasPoint.push(axisDatas);
    }
    // 地标线
    if (_get(x, 'type', '') === 'arrow') {
      // 获取单个地标线的位置点
      const arrowPoints = _get(x, 'body', '');
      // 开始点的GPS坐标
      let gpsStartPoint = new CGpsCoordinate(
        _get(arrowPoints[0], 'yAxis', 0),
        _get(arrowPoints[0], 'xAxis', 0),
        _get(arrowPoints[0], 'zAxis', 0),
      ); // 要计算的GPS
      let xyzStartPoint = new CCartesianCoordinate(0, 0, 0);
      // 结束点的GPS相对位置
      let gpsEndPoint = new CGpsCoordinate(
        _get(arrowPoints[1], 'yAxis', 0),
        _get(arrowPoints[1], 'xAxis', 0),
        _get(arrowPoints[1], 'zAxis', 0),
      ); // 要计算的GPS
      let xyzEndPoint = new CCartesianCoordinate(0, 0, 0);
      // 计算出xyz2的值就是X,Y,Z值
      CCartesianCoordinate.ComputeCartesianByGPS(gps_origin, gpsStartPoint, xyz_origin, xyzStartPoint); // 开始点
      CCartesianCoordinate.ComputeCartesianByGPS(gps_origin, gpsEndPoint, xyz_origin, xyzEndPoint); // 结束点
      const arrowDatas = {
        end: {
          x: _get(xyzEndPoint, 'x', 0) * 1000,
          y: _get(xyzEndPoint, 'y', 0) * 1000,
          z: _get(xyzEndPoint, 'z', 0) * 1000,
        },
        start: {
          x: _get(xyzStartPoint, 'x', 0) * 1000,
          y: _get(xyzStartPoint, 'y', 0) * 1000,
          z: _get(xyzStartPoint, 'z', 0) * 1000,
        },
        type: _get(x, 'subtype', ''),
      };
      roadSignDatas.push(arrowDatas);
    }
    if (_get(x, 'type', '') === 'ramp') {
      const rampPointList = _get(x, 'body', '').map((item, index, arr) => {
        // 开始点的GPS坐标
        let gpsStartPoint = new CGpsCoordinate(item.yAxis, item.xAxis, item.zAxis); // 要计算的GPS
        let xyzStartPoint = new CCartesianCoordinate(0, 0, 0);
        // 计算出xyz2的值就是X,Y,Z值
        CCartesianCoordinate.ComputeCartesianByGPS(gps_origin, gpsStartPoint, xyz_origin, xyzStartPoint); // 开始点
        return {
          x: _get(xyzStartPoint, 'x', 0) * 1000,
          y: _get(xyzStartPoint, 'y', 0) * 1000,
          z: _get(item, 'zAxis', 0) * 1000,
        };
      });
      rampPoints.push(rampPointList);
    }
  });
  return { pointsData, roadSignDatas, axisDatasPoint, grassPoints, rampPoints, rampWall, schoolName };
}
