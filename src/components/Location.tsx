import { useState, useEffect, useRef } from 'react';
import { _get } from 'utils';
import { Modal } from 'antd';
import { pickBy, identity } from 'lodash';
import MapLayerChange from './MapLayerChange';
import RedMarker from 'statics/images/poi-marker-red.png';

interface ILocation {
  onOk(): void;
  onCancel(): void;
  setLatitude(latitude: string): void;
  setLongitude(longitude: string): void;
  longitude?: string;
  latitude?: string;
}

export default function Location(props: ILocation) {
  const { onOk, onCancel, setLatitude, setLongitude, longitude, latitude } = props;
  const [point, setPoint] = useState('');
  const AMap = useRef(null) as any;
  const Marker = useRef(null) as any;
  const [map, setMap] = useState(null);
  useEffect(() => {
    AMap.current = new window.AMap.Map(
      'container2',
      pickBy(
        {
          layers: window.AMap.TileLayer(),
          center: longitude ? [longitude, latitude] : null,
          zoom: 14,
        },
        identity,
      ),
    );
    if (longitude && latitude) {
      addMarker([longitude, latitude]);
    }

    AMap.current.on('click', (e: any) => {
      console.log(e);
      setPoint(_get(e, 'lnglat'));
      if (Marker.current) {
        AMap.current.remove(Marker.current);
      }
      addMarker([e.lnglat.getLng(), e.lnglat.getLat()]);
    });
    setMap(AMap.current); //勿删，否则卫星地图切换有问题
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function addMarker(point: [string, string]) {
    Marker.current = new window.AMap.Marker({
      position: point,
      icon: new window.AMap.Icon({
        image: RedMarker,
        imageSize: new window.AMap.Size(20, 30),
      }),
    });
    AMap.current.add(Marker.current);
  }

  function _handleOk() {
    if (point) {
      setLongitude(_get(point, 'lng', longitude).toFixed(6));
      setLatitude(_get(point, 'lat', latitude).toFixed(6));
    }
    onOk();
  }

  // 地图初始中心点位置
  // const initPoint: object =
  //   longitude && latitude ? { center: { lng: longitude, lat: latitude } } : { autoLocalCity: true };

  return (
    <Modal visible zIndex={1001} maskClosable={false} onCancel={onCancel} onOk={_handleOk}>
      <div id="container2" style={{ width: '100%', height: '400px', position: 'relative' }}>
        {map && <MapLayerChange map={AMap.current} style={{ left: 30 }} />}
      </div>
    </Modal>
  );
}
