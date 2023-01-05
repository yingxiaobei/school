// XCar20Angl_v1.js
// 算法

var pCenter = {};
var pRotateAfter = {};

// 算法版本
const VER = '1.0.0.1  update: 2020.12';

const EARTH_RADIUS = 6378137.0; // 地球半径
const CARSTOP_DISTANCE = 0.03; // 车辆每秒钟只移动0.05米，可以认为它是在停车状态，需要配置的参数
const CARSTOP_SPEEDUPPERLIMIT = 0.08; // 速度，单位为米/秒，每秒钟只移动0.08米，可以认为它是在停车状态，军车晃动大

// 向量左右侧
const VECTORRIGHTSIDE = 1;
const VECTORLEFTSIDE = -1;

// 车模数据结构
class CarModel {
  //
  constructor() {
    this.CarType = 0.5; // 车辆类型
    this.PreAntenaHeight = 0.5; // 前天线距离地面的高度，单位为米
    this.PostAntenaHeight = 0.5; // 后天线距离地面的高度，单位为米
    this.TwoAntenasDistance = 0.5; // 两天线之间的距离，单位为米

    this.WheelWidth = 0.5; // 车轮压线区域在地面上的投影的宽度，即轮胎宽度，单位为米
    this.WheelLength = 0.5; // 车轮压线区域在地面上的投影的长度，单位为米

    this.WheelSpialeLength = 0.5; // 车轮转轴长度
    // eslint-disable-next-line no-array-constructor
    this.CarBodyRelativePoint = new Array(); // 车身gps点

    this.HeadIndex = 0;
    this.TailIndex = 0;
    this.LeftFrontWheelIndex = 0;
    this.RightFrontWheelIndex = 0;
    this.LeftRearWheelIndex = 0;
    this.RightRearWheelIndex = 0;

    this.WheelBase = 1; //轴距
    this.RearWheelsDistance = 1; //后轮距
    this.MaxWheelAngle = 180.0; //方向盘最大角度
    this.AngleWheelRatio = 12.0; //方向盘与轮子角度系数

    this.CarBodyRelativePoint.push(1);
    this.CarBodyRelativePoint.push(2);
    this.CarBodyRelativePoint.push(3);
  }

  // 车身Gps点数
  CarBodyPointCount() {
    return this.CarBodyRelativePoint.length;
  }
}

// map 转json字符串
function map2json_str(map) {
  var str = '{';
  var i = 1;
  map.forEach(function (item, key, mapObj) {
    if (mapObj.size == i) {
      str += '"' + key + '":"' + item + '"';
    } else {
      str += '"' + key + '":"' + item + '",';
    }
    i++;
  });
  str += '}';
  return str;
}

// json字符串 转 map
function json_str2map(jsonStr) {
  let jsonObj = JSON.parse(jsonStr);
  let strMap = new Map();
  for (let k of Object.keys(jsonObj)) {
    strMap.set(k, jsonObj[k]);
  }
  return strMap;
}

// 笛卡尔坐标
class CCartesianCoordinate {
  constructor(x, y, z) {
    if (x != undefined) {
      this.x = x;
      this.y = y;
      this.z = z;
    } else {
      this.x = 0.0;
      this.y = 0.0;
      this.z = 0.0;
    }
  }

  // 计算笛卡尔坐标距离
  static Distance(one, two) {
    if (one == undefined || two == undefined) {
      console.error('one two 未传入数据!');
      return 0.0;
    }

    let LevelDistance = Math.sqrt((one.x - two.x) * (one.x - two.x) + (one.y - two.y) * (one.y - two.y));
    return LevelDistance;
  }

  // 笛卡尔坐标旋转
  // Before 为旋转前坐标
  // After  为旋转后坐标
  // angle 为角度，方向为          顺时针         旋转角度，单位为度（°）
  static Rotate(Before, After, angle) {
    let cos_b = Math.cos(((360.0 - angle) * Math.PI) / 180.0);
    let sin_b = Math.sin(((360.0 - angle) * Math.PI) / 180.0);

    After.x = Before.x * cos_b - Before.y * sin_b;
    After.y = Before.x * sin_b + Before.y * cos_b;
    return;
  }

  // 计算笛卡尔坐标
  static ComputeCartesianByGPS(gpsPointRef, gpsPointComputed, ctsPointRef, ctsPointComputed) {
    let distance;
    let angle;
    let radian;
    let dx, dy;

    angle = CGpsCoordinate.ComputeAngle(gpsPointComputed, gpsPointRef);
    distance = CGpsCoordinate.Distance(gpsPointRef, gpsPointComputed);

    if (angle < 90.0) {
      radian = (angle / 180.0) * Math.PI;
      dx = distance * Math.sin(radian);
      dy = distance * Math.cos(radian);
    } else if (angle < 180.0) {
      radian = ((angle - 90.0) / 180.0) * Math.PI;
      dx = distance * Math.cos(radian);
      dy = -1 * distance * Math.sin(radian);
    } else if (angle < 270.0) {
      radian = ((angle - 180.0) / 180.0) * Math.PI;
      dx = -distance * Math.sin(radian);
      dy = -distance * Math.cos(radian);
    } else {
      radian = ((angle - 270.0) / 180.0) * Math.PI;
      dx = -distance * Math.cos(radian);
      dy = distance * Math.sin(radian);
    }

    ctsPointComputed.x = ctsPointRef.x + dx;
    ctsPointComputed.y = ctsPointRef.y + dy;
    return;
  }

  //计算由A、O、B、三个点构成的 ∠AOB 的弧度值；方向为沿着A到B,小于180的那个角, 顺时针方向为正
  /*
   *    A ---------->  B
   *     \            /
   *      \          /
   *       \        /
   *        \ ∠AOB/
   *         \    /
   *          \  /
   *           \/
   *            O
   *
   *
   */
  static RadianKM2(PointA, PointB, PointO) {
    let a;
    let b;
    let c;

    a = CCartesianCoordinate.Distance(PointB, PointO);
    b = CCartesianCoordinate.Distance(PointA, PointO);
    c = CCartesianCoordinate.Distance(PointA, PointB);

    let d = (a * a + b * b - c * c) / (2 * a * b);
    if (d > 0.9999999) {
      d = 0.9999999;
    } else if (d < -0.9999999) {
      d = -0.9999999;
    }
    let radian = Math.acos(d); //计算夹角

    //判断角度正负值、如果O在向量AB右侧，则为弧度值为正，否则为负
    let x, y, x0, y0, x1, y1;
    x0 = PointA.x;
    y0 = PointA.y;

    x1 = PointB.x;
    y1 = PointB.y;

    x = PointO.x;
    y = PointO.y;

    let val = (y - y0) * (x1 - x0) - (x - x0) * (y1 - y0);

    if (val < 0) {
      //右侧
      return radian;
    } else {
      //左侧
      return -radian;
    }
  }

  /*
    计算由 PointA, PointO, PointB三点连线组成的∠AOB的角度。单位为度，顺时针角度，值为0~360度。A点绕O点顺时针旋转到B点经过的角度
    */
  static ClockwiseAngle(PointA, PointO, PointB) {
    let angleA, angleB;
    angleA = CCartesianCoordinate.ComputeAngleByTwoPoints(PointO, PointA);
    angleB = CCartesianCoordinate.ComputeAngleByTwoPoints(PointO, PointB);

    let result = angleB - angleA;

    if (result < 0.0) {
      result = result + 360.0;
    } else if (result > 360.0) {
      result -= 360.0;
    }
    return result;
  }

  /*
        向量箭头pPointHead，向量箭尾pPointTail，向量与y轴正向的夹角，顺时针方向为正
    */
  static ComputeAngleByTwoPoints(PointTail, PointHead) {
    let RelativePoint = new CCartesianCoordinate();
    RelativePoint.x = PointHead.x - PointTail.x;
    RelativePoint.y = PointHead.y - PointTail.y;

    let angle = (Math.atan2(RelativePoint.y, RelativePoint.x) * 180.0) / Math.PI;

    if (angle > 0.0) {
      angle = 360.0 - (angle - 90);
      if (angle > 360.0) {
        angle -= 360.0;
      }
    } else {
      angle = 90 - angle;
    }
    return angle;
  }

  // 点与向量的位置关系
  static ComputePointAtVectorSide(VectorStart, VectorStop, ctsPoint) {
    let x, y, x0, y0, x1, y1;
    x0 = VectorStart.x;
    y0 = VectorStart.y;

    x1 = VectorStop.x;
    y1 = VectorStop.y;

    x = ctsPoint.x;
    y = ctsPoint.y;

    let val = (y - y0) * (x1 - x0) - (x - x0) * (y1 - y0);

    if (val < 0) {
      //右侧
      return VECTORRIGHTSIDE;
    } else {
      //左侧
      return VECTORLEFTSIDE;
    }
  }

  /*
    计算点pRotateBefore绕着pCenter旋转RotateRadian弧度后，得到的点pRotateAfter，RotateRadian为弧度，顺时针为正
    */
  static PointRotateAroundAnotherPointByRadian(RotateBefore, Center, RotateAfter, RotateRadian) {
    let ctsNewRotateBefore = new CCartesianCoordinate();
    ctsNewRotateBefore.x = RotateBefore.x - pCenter.x;
    ctsNewRotateBefore.y = RotateBefore.y - pCenter.y;

    // 旋转公式
    // x*cos(b) + y*sin(b)
    // y*cos(b) - x*sin(b)

    let sin_b = Math.sin(RotateRadian);
    let cos_b = Math.cos(RotateRadian);

    pRotateAfter.x = ctsNewRotateBefore.x * cos_b + ctsNewRotateBefore.y * sin_b;
    pRotateAfter.y = ctsNewRotateBefore.y * cos_b - ctsNewRotateBefore.x * sin_b;

    // 转换为原坐标
    pRotateAfter.x += pCenter.x;
    pRotateAfter.y += pCenter.y;
    return;
  }
}

// Gps坐标系
class CGpsCoordinate {
  constructor(m_dLatitude, m_dLongitude, m_dHeight) {
    if (m_dLatitude != undefined) {
      this.m_dLatitude = m_dLatitude; // 纬度
      this.m_dLongitude = m_dLongitude; // 经度
      this.m_dHeight = m_dHeight; // 高度
    } else {
      this.m_dLatitude = 0.0; // 纬度
      this.m_dLongitude = 0.0; // 经度
      this.m_dHeight2 = 0.0; // 高度
    }
  }

  // 计算两点GPS坐标的连线与正北方向的夹角的角度值（单位为°），顺时针方向 pre ----------> post
  static ComputeAngle(PrePoint, PostPoint) {
    let x = (PrePoint.m_dLongitude - PostPoint.m_dLongitude) * Math.cos((PostPoint.m_dLatitude * Math.PI) / 180.0);
    let y = PrePoint.m_dLatitude - PostPoint.m_dLatitude;
    if (y == 0.0) {
      if (x == 0.0) {
        return 0.0;
      } else if (x > 0.0) {
        return 90.0;
      } else {
        return 270.0;
      }
    }

    let radian = Math.atan(x / y);
    let angle = 0.0;
    if (x > 0.0) {
      if (y > 0.0) {
        angle = (radian * 180.0) / Math.PI;
      } else {
        angle = 180.0 + (radian * 180.0) / Math.PI;
      }
    } else {
      if (y > 0.0) {
        angle = 360.0 + (radian * 180.0) / Math.PI;
      } else {
        angle = 180.0 + (radian * 180.0) / Math.PI;
      }
    }
    return angle;
  }

  // 根据GPS 计算距离
  static Distance(PointOne, PointTwo) {
    let a1 = PointOne.m_dLatitude;
    let a2 = PointTwo.m_dLatitude;
    let b1 = PointOne.m_dLongitude;
    let b2 = PointTwo.m_dLongitude;
    let x, y;
    let dfDistance = 0.0;
    if (a1 < 0.0 || a2 < 0.0 || b1 < 0.0 || b2 < 0.0) {
      return 0.0;
    }
    x = ((a1 - a2) * EARTH_RADIUS * Math.PI) / 180.0;
    y = (Math.cos((a1 * Math.PI) / 180.0) * (b1 - b2) * EARTH_RADIUS * Math.PI) / 180.0;
    dfDistance = Math.sqrt(x * x + y * y);
    // 最小移动距离5cm
    let Distance = dfDistance > CARSTOP_DISTANCE ? dfDistance : 0.0;
    return Distance;
  }

  // GPS转到笛卡尔坐标
  static ComputeGPSByCartesian(ctsPointRef, ctsPointComputed, gpsPointRef, gpsPointComputed) {
    let dx, dy;

    dx = ctsPointComputed.x - ctsPointRef.x;
    dy = ctsPointComputed.y - ctsPointRef.y;

    let dlat, dlog;

    dlat = (dy * 360.0) / (2 * Math.PI * EARTH_RADIUS);
    dlog = (dx * 360.0) / (2 * Math.PI * EARTH_RADIUS * Math.cos((gpsPointRef.m_dLatitude * Math.PI) / 180.0));

    gpsPointComputed.m_dLongitude = gpsPointRef.m_dLongitude + dlog;
    gpsPointComputed.m_dLatitude = gpsPointRef.m_dLatitude + dlat;

    gpsPointComputed.m_dHeight = gpsPointRef.m_dHeight;
    return;
  }
}
// 导出函数与接口
export {
  CGpsCoordinate, //  GPS 坐标类
  CCartesianCoordinate, // 笛卡尔坐标类
  CarModel, // 车模
  VER, // 软件版本
  EARTH_RADIUS, // 地球半径
  VECTORRIGHTSIDE,
  VECTORLEFTSIDE,
};
