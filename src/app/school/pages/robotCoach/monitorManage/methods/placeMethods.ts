import { _get } from 'utils';

// 画线方法 返回一个起始点和终点 type为线的属性 ，index还没被用到

interface startPoint {
  x: number;
  y: number;
  z: number;
  index: number;
}
interface params {
  type: number;
  index: number;
  startPoint: {
    x: number;
    y: number;
    z: number;
    index: number;
  };
  endPoint: {
    x: number;
    y: number;
    z: number;
    index: number;
  };
}
export function placeMethods() {
  function placeLines(props: params) {
    const { type, index, startPoint, endPoint } = props;
    return {
      endX: _get(endPoint, 'x', 0),
      endY: _get(endPoint, 'y', 0),
      endZ: _get(endPoint, 'z', 0),
      index,
      startX: _get(startPoint, 'x', 0),
      startY: _get(startPoint, 'y', 0),
      startZ: _get(startPoint, 'z', 0),
      type,
    };
  }
  function outPointList(props: startPoint) {
    const { x, y, z } = props;
    return {
      arCos: 0.0,
      x: x,
      y: y,
      z: z,
    };
  }
  function pointListAll(props: startPoint) {
    const { x = 0, y = 0, z = 0, index = 0 } = props;
    return {
      id: index,
      point: {
        x: x,
        y: y,
        z: z,
      },
    };
  }
  return {
    placeLines,
    outPointList,
    pointListAll,
  };
}
