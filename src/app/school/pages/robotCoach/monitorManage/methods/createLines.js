import { organizeData, placeMethods } from './index';
import { _get } from 'utils';

/* 创造json对象
 * example:
 *
 *
 */
export function createLines(placeInfoData) {
  const { placeLines, pointListAll } = placeMethods();
  const { pointsData, grassPoints, roadSignDatas, axisDatasPoint, rampPoints, rampWall, schoolName } = organizeData(
    placeInfoData,
  );
  console.log(pointsData);
  // eslint-disable-next-line array-callback-return
  const itemDatas = pointsData.map((item, index) => {
    // 侧方停车
    if (_get(item, 'locationType', '') === '20400') {
      const drawLines = [];
      const pointList = _get(item, 'points');
      drawLines.push(placeLines({ type: 2, index: -1, startPoint: pointList[0], endPoint: pointList[1] }));
      drawLines.push(placeLines({ type: 0, index: 0, startPoint: pointList[1], endPoint: pointList[2] }));
      drawLines.push(placeLines({ type: 0, index: 1, startPoint: pointList[2], endPoint: pointList[3] }));
      drawLines.push(placeLines({ type: 0, index: 2, startPoint: pointList[3], endPoint: pointList[4] }));
      drawLines.push(placeLines({ type: 0, index: 3, startPoint: pointList[4], endPoint: pointList[5] }));
      drawLines.push(placeLines({ type: 3, index: -1, startPoint: pointList[2], endPoint: pointList[5] }));
      drawLines.push(placeLines({ type: 0, index: 4, startPoint: pointList[5], endPoint: pointList[6] }));
      drawLines.push(placeLines({ type: 3, index: -1, startPoint: pointList[6], endPoint: pointList[7] }));
      drawLines.push(placeLines({ type: 0, index: 5, startPoint: pointList[7], endPoint: pointList[0] }));
      const point = {
        arCos: 0,
        x: (_get(pointList[2], 'x') + _get(pointList[4], 'x')) / 2,
        y: (_get(pointList[2], 'y') + _get(pointList[4], 'y')) / 2,
        z: (_get(pointList[2], 'z') + _get(pointList[4], 'z')) / 2,
      };
      const pointListAll = pointList.map((points, index) => {
        return {
          id: index,
          point: {
            x: _get(points, 'x', 0),
            y: _get(points, 'y', 0),
            z: _get(points, 'z', 0),
          },
        };
      });
      return {
        drawLines,
        fieldCode: index + 1,
        itemID: _get(item, 'locationType', ''),
        point,
        pointList: pointListAll,
      };
    }
    // 倒车入库
    if (_get(item, 'locationType', '') === '20100') {
      const drawLines = [];
      const pointList = _get(item, 'points');
      drawLines.push(placeLines({ type: 2, index: -1, startPoint: pointList[0], endPoint: pointList[1] }));
      drawLines.push(placeLines({ type: 0, index: 0, startPoint: pointList[1], endPoint: pointList[2] }));
      drawLines.push(placeLines({ type: 0, index: 1, startPoint: pointList[2], endPoint: pointList[3] }));
      drawLines.push(placeLines({ type: 0, index: 2, startPoint: pointList[3], endPoint: pointList[4] }));
      drawLines.push(placeLines({ type: 0, index: 3, startPoint: pointList[4], endPoint: pointList[5] }));
      drawLines.push(placeLines({ type: 3, index: -1, startPoint: pointList[2], endPoint: pointList[5] }));
      drawLines.push(placeLines({ type: 0, index: 4, startPoint: pointList[5], endPoint: pointList[6] }));
      drawLines.push(placeLines({ type: 3, index: -1, startPoint: pointList[6], endPoint: pointList[7] }));
      drawLines.push(placeLines({ type: 0, index: 5, startPoint: pointList[7], endPoint: pointList[0] }));
      const point = {
        arCos: 0,
        x: (_get(pointList[2], 'x') + _get(pointList[4], 'x')) / 2,
        y: (_get(pointList[2], 'y') + _get(pointList[4], 'y')) / 2,
        z: (_get(pointList[2], 'z') + _get(pointList[4], 'z')) / 2,
      };
      const pointListAll = pointList.map((points) => {
        return {
          id: index,
          point: {
            x: _get(points, 'x', 0),
            y: _get(points, 'y', 0),
            z: _get(points, 'z', 0),
          },
        };
      });
      return {
        drawLines,
        fieldCode: index + 1,
        itemID: _get(item, 'locationType', ''),
        point,
        pointList: pointListAll,
      };
    }
    // 直角转弯 28700（左直角） 或者 20700（右直角）
    if (_get(item, 'locationType', '') === '28700' || _get(item, 'locationType', '') === '20700') {
      const drawLines = [];
      const pointList = _get(item, 'points');
      drawLines.push(placeLines({ type: 2, index: -1, startPoint: pointList[6], endPoint: pointList[7] }));
      drawLines.push(placeLines({ type: 0, index: 0, startPoint: pointList[1], endPoint: pointList[2] }));
      drawLines.push(placeLines({ type: 0, index: 1, startPoint: pointList[2], endPoint: pointList[3] }));
      drawLines.push(placeLines({ type: 0, index: 2, startPoint: pointList[4], endPoint: pointList[5] }));
      drawLines.push(placeLines({ type: 0, index: 3, startPoint: pointList[0], endPoint: pointList[5] }));
      const point = {
        arCos: 0,
        x: (_get(pointList[2], 'x') + _get(pointList[5], 'x')) / 2,
        y: (_get(pointList[2], 'y') + _get(pointList[5], 'y')) / 2,
        z: (_get(pointList[2], 'z') + _get(pointList[5], 'z')) / 2,
      };
      const pointListAll = pointList.map((points) => {
        return {
          id: index,
          point: {
            x: _get(points, 'x', 0),
            y: _get(points, 'y', 0),
            z: _get(points, 'z', 0),
          },
        };
      });

      return {
        drawLines,
        fieldCode: index + 1,
        itemID: _get(item, 'locationType', ''),
        point,
        pointList: pointListAll,
      };
    }
    // 坡道停起
    if (_get(item, 'locationType', '') === '20300') {
      const drawLines = [];
      const pointList = _get(item, 'points');
      // 这个条线是云线需要算我还不会
      // drawLines.push(placeLines({ type: 2, index: -1, startPoint: pointList[12], endPoint: pointList[13] }));
      // 这个11号点也不存在也是算出来的
      pointList[11] = {
        x: _get(pointList[0], 'x') - _get(pointList[1], 'x') + _get(pointList[2], 'x'),
        y: _get(pointList[0], 'y') - _get(pointList[1], 'y') + _get(pointList[2], 'y'),
        z: _get(pointList[0], 'z') - _get(pointList[1], 'z') + _get(pointList[2], 'z'),
      };
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[0], endPoint: pointList[11] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[0], endPoint: pointList[1] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[1], endPoint: pointList[4] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[4], endPoint: pointList[5] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[5], endPoint: pointList[8] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[1], endPoint: pointList[2] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[4], endPoint: pointList[3] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[5], endPoint: pointList[6] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[8], endPoint: pointList[7] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[9], endPoint: pointList[8] }));
      drawLines.push(placeLines({ type: 0, index: -1, startPoint: pointList[9], endPoint: pointList[10] }));
      const point = {
        arCos: 0,
        x: (_get(pointList[0], 'x') + _get(pointList[7], 'x')) / 2,
        y: (_get(pointList[0], 'y') + _get(pointList[7], 'y')) / 2,
        z: (_get(pointList[0], 'z') + _get(pointList[7], 'z')) / 2,
      };
      const pointListAll = pointList.map((points) => {
        return {
          id: index,
          point: {
            x: _get(points, 'x', 0),
            y: _get(points, 'y', 0),
            z: _get(points, 'z', 0),
          },
        };
      });
      console.log('坡道停起', JSON.stringify(drawLines));
      return {
        drawLines,
        fieldCode: index + 1,
        itemID: _get(item, 'locationType', ''),
        point,
        pointList: pointListAll,
      };
    }
    // 曲线行驶
    if (_get(item, 'locationType', '') === '20600') {
      const drawLines = [];
      const pointList = _get(item, 'points');
      var leftMidPoint = 0;
      var rightMidPoint = 0;
      // eslint-disable-next-line array-callback-return
      _get(item, 'points', []).map((x, index, arr) => {
        if (Number(_get(arr, `${index}.index`, 0)) < 101) {
          if (Number(_get(arr, `${index + 1}.index`, 0)) === 101) {
            rightMidPoint = Math.floor((index + 1) / 2);
            console.log('右边的点完不能在组成线了', rightMidPoint);
            // eslint-disable-next-line array-callback-return
            return;
          }
          drawLines.push(placeLines({ type: 0, index: -1, startPoint: arr[index], endPoint: arr[index + 1] }));
        } else {
          if (Number(_get(arr, `${index + 1}.index`, 0)) === 0) {
            // 这里不算右边的中点
            leftMidPoint = 3 * rightMidPoint;
            console.log('左边的点完不能在组成线了', leftMidPoint);
            // eslint-disable-next-line array-callback-return
            return;
          }
          drawLines.push(placeLines({ type: 0, index: -1, startPoint: arr[index], endPoint: arr[index + 1] }));
        }
      });
      const point = {
        arCos: 0,
        x: (_get(pointList[leftMidPoint], 'x') + _get(pointList[rightMidPoint], 'x')) / 2,
        y: (_get(pointList[leftMidPoint], 'y') + _get(pointList[rightMidPoint], 'y')) / 2,
        z: (_get(pointList[leftMidPoint], 'z') + _get(pointList[rightMidPoint], 'z')) / 2,
      };
      const pointListAll = pointList.map((points) => {
        return {
          id: index,
          point: {
            x: _get(points, 'x', 0),
            y: _get(points, 'y', 0),
            z: _get(points, 'z', 0),
          },
        };
      });
      console.log('曲线行驶', JSON.stringify(drawLines));
      return {
        drawLines,
        fieldCode: index + 1,
        itemID: _get(item, 'locationType', ''),
        point,
        pointList: pointListAll,
      };
    }
  });
  console.log('data', {
    endX: _get(axisDatasPoint[0], '[1].x'),
    endY: _get(axisDatasPoint[0], '[1].y'),
    grassPoints,
    itemDatas,
    roadSignDatas,
    rampPoints,
    rampWall,
    wallDatas: axisDatasPoint[0],
    startX: _get(axisDatasPoint[0], '[3].x'),
    startY: _get(axisDatasPoint[0], '[3].y'),
  });
  return {
    schoolName,
    endX: _get(axisDatasPoint[0], '[1].x'),
    endY: _get(axisDatasPoint[0], '[1].y'),
    grassPoints,
    itemDatas,
    roadSignDatas,
    rampPoints,
    rampWall,
    wallDatas: axisDatasPoint[0],
    startX: _get(axisDatasPoint[0], '[3].x'),
    startY: _get(axisDatasPoint[0], '[3].y'),
  };
}
