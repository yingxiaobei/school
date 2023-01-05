//车辆监控
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { _get } from 'utils';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import MapLayerChange from 'components/MapLayerChange';
import CarImg from 'statics/images/car2.png';

export default function CarMap(props: any) {
  const { mapData, carHash, address = {}, selectedRowKeys, checkedCarId = '' } = props;

  const mapRef = useRef(null);
  const [map, setMap] = useState() as any;

  useEffect(() => {
    if (!window.AMap) return;
    const map1 = new window.AMap.Map(mapRef.current, {
      zoom: 14,
    });
    setMap(map1);
  }, [mapRef.current, window.AMap]);
  const key = _get(selectedRowKeys, 0, '');
  useEffect(() => {
    if (selectedRowKeys.length <= 0 || !map) {
      return;
    }
    const data = mapData.filter((x: any) => {
      return x.carid === key;
    });
    if (!_get(data, `0.lon`, '') || !_get(data, `0.lat`, '')) return;
    //点击下方列表，地图上对应展示信息窗
    const lon = _get(data, `0.lon`, '');
    const lat = _get(data, `0.lat`, '');
    map.setCenter([lon, lat]);
    let infoWindow = new window.AMap.InfoWindow({
      anchor: 'top-left',
      size: { width: 400 },
      content: getInfoContent(_get(data, `0`, {})),
      closeWhenClickMap: true,
    });
    infoWindow.open(map, [lon, lat]);
  }, [key]);

  useEffect(() => {
    if (!map || !checkedCarId) return;
    const data = mapData.filter((x: any) => {
      return x.carid === checkedCarId;
    });
    if (!_get(data, `0.lon`, '') || !_get(data, `0.lat`, '')) return;
    const lon = _get(data, `0.lon`, '');
    const lat = _get(data, `0.lat`, '');
    map.setCenter([lon, lat]);
  }, [checkedCarId, mapData.length]);

  useEffect(() => {
    if (map) {
      if (mapData.length <= 0) {
        map.clearMap();
        return;
      }
      map.clearMap();
      // eslint-disable-next-line array-callback-return
      mapData.map((item: any) => {
        const text = new window.AMap.Text({
          position: new window.AMap.LngLat(_get(item, 'lon', ''), _get(item, 'lat', '')),
          anchor: 'bottom-center',
          text: carHash[_get(item, 'carid', '')],
          style: { 'border-color': PRIMARY_COLOR, color: PRIMARY_COLOR, fontWeight: 'bold' },
        });
        const car = new window.AMap.Icon({
          // 图标尺寸
          size: new window.AMap.Size(54, 30),
          // 图标的取图地址
          image: CarImg,
          // 图标所用图片大小
          imageSize: new window.AMap.Size(54, 30),
          // 图标取图偏移量
          // imageOffset: new window.AMap.Pixel(-9, -3),
        });
        var marker1 = new window.AMap.Marker({
          // map: map,
          position: [_get(item, 'lon', ''), _get(item, 'lat', '')],
          icon: car,
          offset: new window.AMap.Pixel(-26, 0),
          // autoRotation: true,
          // angle: 90,
        });
        text.on('click', () => {
          let infoWindow = new window.AMap.InfoWindow({
            anchor: 'top-left',
            size: { width: 400 },
            content: getInfoContent(item),
            closeWhenClickMap: true,
          });

          infoWindow.open(map, new window.AMap.LngLat(_get(item, 'lon', ''), _get(item, 'lat', '')));
        });
        map.add([text, marker1]);

        // map.setFitView();
        setMap(map);
      });
    }
  }, [mapData.length || JSON.parse(JSON.stringify(mapData))]);

  function getInfoContent(item: any = {}) {
    return `
    <div style="font-size:12px;"><h4 class='bold'>${carHash[_get(item, 'carid', '')]}</h4>
    <div><label style="${titleStyle}">培训科目：</label>${_get(item, 'examname', '')}</div>
    <div><label style="${titleStyle}">教练员：</label>${_get(item, 'coaname', '')}</div>
    <div><label style="${titleStyle}">学员：</label>${_get(item, 'stuname', '')}</div>
    <div><label style="${titleStyle}">经纬度：</label> ${_get(item, 'lon', '')},${_get(item, 'lat', '')} </div>
    <div><label style="${titleStyle}">速度：</label>${_get(item, 'gps_speed', '')}</div>
    <div><label style="${titleStyle}">时间：</label>${_get(item, 'gpstime', '')}</div>
    <div><label style="${titleStyle}">地址：</label>${_get(address, _get(item, 'carid', ''), '')}</div></div>
`; //使用默认信息窗体框样式，显示信息内容
  }

  const titleStyle = 'width:80px;display:inline-block;text-align:right;line-height:26px';
  useEffect(() => {
    map?.plugin(['AMap.ToolBar'], function () {
      // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
      map.addControl(new window.AMap.ToolBar({ locate: false }));
    });
  }, [map]);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {map && <MapLayerChange map={map} />}
      <div ref={mapRef} style={{ height: '100%' }}></div>
    </div>
  );
}
