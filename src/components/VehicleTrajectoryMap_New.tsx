/* eslint-disable react-hooks/exhaustive-deps */
// 车辆轨迹地图-高德地图2.0版本
import { useRef, useEffect, useState } from 'react';
import { Auth, _get } from 'utils';
import { useHash } from 'hooks';
import { useMap, APILoader } from '@uiw/react-amap';
import moment from 'moment';
import MarkerImg from 'statics/images/dir-marker.png';
import RedMarker from 'statics/images/poi-marker-red.png';
import PlayImg from 'statics/images/play.png';
import PauseImg from 'statics/images/pause.png';
import StopImg from 'statics/images/stop.png';
import CarImg from 'statics/images/car2.png';
import Loading from './Loading';
import MapLayerChange from './MapLayerChange';
import { GAODE_KEY } from 'constants/env';
import { Tooltip } from 'antd';

type TLocation = {
  lng: number;
  lat: number;
};
type GLocation = [number, number];
interface IProps {
  paths: any[]; // TODO:二维数组经纬度数据
  center?: [number, number];
  zoom?: number;
  mapType?: string;
  isMarker?: boolean; //是否显示起点终点标记
  trackInitData?: any[];
  carNumber?: string;
  setSelectedRowKeys?: any;
  selectedRowKeys?: any;
  selectedRows?: any;
}

const titleStyle = 'width:80px;display:inline-block;text-align:right;line-height:26px';
const font = 'font-size:12px';

export default function VehicleTrajectoryMap_New(props: IProps) {
  const {
    paths,
    center,
    mapType = 'Polygon',
    isMarker = false,
    trackInitData = [],
    carNumber = '',
    setSelectedRowKeys,
    selectedRowKeys,
    selectedRows,
  } = props;

  const divElm = useRef<HTMLDivElement>(null);
  const [pathsLngLat, setPath] = useState<any>();
  const { setContainer, map } = useMap({
    center,
    container: divElm.current,
    resizeEnable: true,
  });
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const subjectTypeHash = useHash('subject_type'); //

  const firstPath = _get(pathsLngLat, '0', []);
  const [carMarker, setCarMarker] = useState<any>();
  const [posMarker, setPosMarker] = useState<any>();
  const [lineArr, setLineArr] = useState([]);
  const [status, setStatus] = useState('stop');
  const [passedPolyline, setPassedPolyline] = useState<any>();
  // const [passedPath, setPassedPath] = useState<any>([]);

  useEffect(() => {
    if (paths && _get(paths, '0.0')) {
      const pathsLngLat = paths.map((x: any[]) => {
        // eslint-disable-next-line array-callback-return
        if (x.length === 0) return;
        return x.map((item: TLocation) => {
          return [item.lng, item.lat];
        });
      });
      const lineArr = _get(pathsLngLat, '0', []).map((item: any) => {
        return [item[0], item[1]];
      });
      setLineArr(lineArr);
      setPath(pathsLngLat);
    } else {
      setPath([]);
      setLineArr([]);
    }
  }, [paths]);

  let infoWindow: any;
  useEffect(() => {
    if (!window.AMap) return;
    if (!posMarker) {
      const endIcon = new window.AMap.Icon({
        size: new window.AMap.Size(25, 34),
        image: RedMarker,
        imageSize: new window.AMap.Size(20, 30),
        // imageOffset: new window.AMap.Pixel(-95, -3),
      });
      var marker: any = new window.AMap.Marker({
        icon: endIcon,
        // position: position,
        offset: new window.AMap.Pixel(-13, -25),
      });
      map && marker.setMap(map);
      setPosMarker(marker);
    }
    if (!_get(selectedRowKeys, '0')) return;

    var position = selectedRowKeys[0].split('-').slice(0, 2);

    infoWindow = new window.AMap.InfoWindow({
      anchor: 'top-left',
      content: getContent({ ..._get(selectedRows, 0, {}), address: '' }),
      size: { width: 400 },
      closeWhenClickMap: true,
    });

    posMarker?.setPosition(position);

    infoWindow.open(map, posMarker?.getPosition() || position);

    posMarker?.on('click', () => {
      infoWindow.open(map, posMarker?.getPosition() || position);
    });

    map && posMarker?.setMap(map);
  }, [_get(selectedRowKeys, '0'), map]);

  useEffect(() => {
    if (!passedPolyline || _get(firstPath, '0', []).length <= 0 || !carMarker) return;
    if (status === 'stop') {
      passedPolyline.setPath([]);
      carMarker.setPosition(_get(firstPath, '0', []));
    }
  }, [status, passedPolyline]);

  useEffect(() => {
    if (!map) return;
    setStatus('stop');
    // 如果有点位就生成一个多边形覆盖物
    if (pathsLngLat && _get(pathsLngLat, '0.0')) {
      map.clearMap();
      const startIcon = new window.AMap.Icon({
        // 图标尺寸
        size: new window.AMap.Size(25, 34),
        // 图标的取图地址
        image: MarkerImg,
        // 图标所用图片大小
        imageSize: new window.AMap.Size(135, 40),
        // 图标取图偏移量
        imageOffset: new window.AMap.Pixel(-9, -3),
      });
      // 创建一个 icon
      const endIcon = new window.AMap.Icon({
        size: new window.AMap.Size(25, 34),
        image: MarkerImg,
        imageSize: new window.AMap.Size(135, 40),
        imageOffset: new window.AMap.Pixel(-95, -3),
      });

      const markerStart = new window.AMap.Marker({
        icon: startIcon,
        position: _get(firstPath, '0', []),
        // offset: new AMap.Pixel(-13, -30)
      });
      const markerEnd = new window.AMap.Marker({
        icon: endIcon,
        position: _get(firstPath, `${firstPath.length - 1}`, []),
        offset: new window.AMap.Pixel(-13, -30),
      });
      const polygon = pathsLngLat.map((item: any) => {
        return new window.AMap.Polygon({
          path: item,
          strokeColor: '#F3302B',
          strokeWeight: 6,
          strokeOpacity: 0.2,
          fillOpacity: 0.4,
          fillColor: '#F3302B',
          zIndex: 50,
        });
      });
      const car = new window.AMap.Icon({
        size: new window.AMap.Size(54, 30),
        image: CarImg,
        imageSize: new window.AMap.Size(54, 30),
        // 图标取图偏移量
        // imageOffset: new window.AMap.Pixel(-9, -3),
      });
      var marker1 = new window.AMap.Marker({
        map: map,
        position: _get(firstPath, '0', []),
        icon: car,
        offset: new window.AMap.Pixel(-26, -13),
        autoRotation: true,
        angle: 90,
      });
      setCarMarker(marker1);

      // 绘制轨迹
      var polyline = new window.AMap.Polyline({
        map: map,
        path: lineArr,
        showDir: true,
        strokeColor: '#28F', //线颜色
        // strokeOpacity: 1,     //线透明度
        strokeWeight: 6, //线宽
        // strokeStyle: "solid"  //线样式
      });

      var passedPolyline = new window.AMap.Polyline({
        map: map,
        // path: lineArr,
        strokeColor: '#AF5', //线颜色
        // strokeOpacity: 1,     //线透明度
        strokeWeight: 6, //线宽
        // strokeStyle: "solid"  //线样式
      });
      setPassedPolyline(passedPolyline);
      marker1.on('moving', function (e: any) {
        const pos = e?.passedPath || [];
        // setPassedPath(pos);

        passedPolyline.setPath(e.passedPath);
        // console.log(e.passedPath);
        if (e.passedPath.length === lineArr.length) {
          setStatus('stop');
        }
      });

      // const polyline = pathsLngLat.map((item: any, index: any) => {
      //   return new window.AMap.Polyline({
      //     path: item,
      //     strokeColor: `${COLOR_ARR[index % 10]}`,
      //     strokeOpacity: 0.8,
      //     strokeWeight: 6,
      //     strokeStyle: 'solid',
      //     strokeDasharray: [10, 5],
      //     lineJoin: 'round',
      //     lineCap: 'round',
      //     zIndex: 50,
      //   });
      // });
      let overlayGroup = null;

      isMarker && transAddress(trackInitData, markerStart, markerEnd);
      if (mapType === 'Polyline') {
        if (isMarker) {
          overlayGroup = new window.AMap.OverlayGroup([polyline, markerEnd, markerStart]);
          map.add(overlayGroup);
        } else {
          overlayGroup = new window.AMap.OverlayGroup(polyline);
          map.add(overlayGroup);
        }
        map.setFitView([polyline], false, [60, 60, 60, 60]);
      }
      if (mapType === 'Polygon') {
        overlayGroup = new window.AMap.OverlayGroup(polygon);
        map.add(overlayGroup);
        map.setFitView([...polygon], false, [60, 60, 60, 60]);
      }
    } else {
      map.clearMap();
    }
  }, [map, pathsLngLat]);
  useEffect(() => {
    map?.plugin(['AMap.ToolBar'], function () {
      // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
      map.addControl(new window.AMap.ToolBar({ locate: false }));
    });
  }, [map]);
  const length = _get(paths, '0.length', 0);

  // 根据坐标得到地址描述
  function transAddress(data: any, markerStart: any, markerEnd: any) {
    const startData = _get(data, '0', {});
    const endData = _get(data, `${length - 1}`, {});
    const lat_start = _get(startData, 'lat');
    const lng_start = _get(startData, 'lng');
    const lat_end = _get(endData, 'lat');
    const lng_end = _get(endData, 'lng');
    var myGeo = new window.AMap.Geocoder({});

    myGeo.getAddress([lng_start, lat_start], function (status: any, result: any) {
      let address = '';
      if (status === 'complete' && result.regeocode) {
        address = result.regeocode.formattedAddress;
      }
      markerStart.on('click', () => {
        let infoWindow = new window.AMap.InfoWindow({
          anchor: 'top-left',
          content: getContent({ ...startData, address }),
          size: { width: 400 },
        });
        infoWindow.open(map, _get(firstPath, '0', []));
      });
    });
    myGeo.getAddress([lng_end, lat_end], function (status: any, result: any) {
      let address = '';
      if (status === 'complete' && result.regeocode) {
        address = result.regeocode.formattedAddress;
      }

      markerEnd.on('click', () => {
        let infoWindow = new window.AMap.InfoWindow({
          anchor: 'top-left',
          content: getContent({ ...endData, address }),
          size: { width: 400 },
        });
        infoWindow.open(map, _get(firstPath, `${firstPath.length - 1}`, []));
      });
    });
  }

  useEffect(() => {
    if (divElm.current && !map) {
      setContainer(divElm.current);
    }
  }, [divElm.current]);

  function getContent(data: any) {
    const examcode = _get(data, 'examcode', '');
    const traincode = _get(data, 'traincode', '');
    const time = _get(data, 'gpstime', '');
    const isTimeValid = moment(time, 'YYYY-MM-DD HH:mm:ss').isValid(); //20210420211350
    const timeFormat = time && isTimeValid ? moment(time, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : '';
    const subject = `${subjectcodeHash ? (examcode !== '0' ? subjectcodeHash[examcode] : '') : ''} ${
      subjectTypeHash ? (traincode !== '0' ? subjectTypeHash[traincode] : '') : ''
    }`;
    let content = `
    <div style='font-weight:bold;border-bottom: 1px solid #F3302B;margin-bottom: 5px;'>${carNumber}</div>
    <div style="${font}"><label style="${titleStyle}">部门：</label>${Auth.get('schoolName')}</div>
    <div style="${font}"><label style="${titleStyle}">培训科目：</label>${subject}</div>
    <div style="${font}"><label style="${titleStyle}">教练员：</label>${_get(data, 'coaname', '')}</div>
    <div style="${font}"><label style="${titleStyle}">学员：</label>${_get(data, 'stuname', '')}</div>
    <div style="${font}"><label style="${titleStyle}">经纬度：</label> ${_get(data, 'lon', '')},${_get(
      data,
      'lot',
      '',
    )} </div>
    <div style="${font}"><label style="${titleStyle}">速度：</label>${_get(data, 'gps_speed', '0')}公里/小时</div>
    <div style="${font}"><label style="${titleStyle}">时间：</label>${timeFormat}</div>
  `;
    const add = `<div style="${font}"><label style="${titleStyle}">地址：</label>${_get(data, 'address', '')}</div>`;
    content = _get(data, 'address', '') ? content + add : content;
    return content;
  }

  function play() {
    if (lineArr.length == 0) return;
    if (!carMarker) return;
    const arr = lineArr.map((item: any) => {
      return [item?.lng, item?.lat];
    });
    //@ts-ignore
    carMarker?.moveAlong(arr, 400);
    setStatus('playing');
  }
  function pause() {
    if (!carMarker) return;
    //@ts-ignore
    carMarker?.pauseMove();
    setStatus('pause');
  }
  function continuePlay() {
    if (!carMarker) return;
    //@ts-ignore
    carMarker?.resumeMove();

    setStatus('playing');
  }
  function stop() {
    if (!carMarker) return;
    //@ts-ignore
    carMarker?.stopMove();

    setStatus('stop');
  }

  return (
    <>
      <APILoader akay={GAODE_KEY} version="1.4.15" fallback={() => <Loading />} plugin="AMap.ToolBar,AMap.Geocoder">
        <div ref={divElm} style={{ height: '100%', position: 'relative' }}>
          {map && <MapLayerChange map={map} />}
          {lineArr.length > 0 && (
            <div style={{ position: 'absolute', right: 70, top: 10, zIndex: 99 }}>
              <span
                onClick={() => {
                  if (status === 'stop') {
                    play();
                  }
                  if (status === 'playing') {
                    pause();
                  }
                  if (status === 'pause') {
                    continuePlay();
                  }
                }}
              >
                <Tooltip title={status === 'stop' ? '开始' : status === 'playing' ? '暂停' : '继续'}>
                  {status === 'stop' ? (
                    <img src={PlayImg} alt="" width={30} height={30} />
                  ) : status === 'playing' ? (
                    <img src={PauseImg} alt="" width={30} height={30} />
                  ) : (
                    <img src={PlayImg} alt="" width={30} height={30} />
                  )}
                </Tooltip>
              </span>
              {status !== 'stop' && (
                <Tooltip title={'停止'}>
                  <img src={StopImg} alt="" width={30} height={30} className="ml20" onClick={() => stop()} />
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </APILoader>
    </>
  );
}
