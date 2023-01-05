//高德地图|卫星图层切换组件
import { Radio } from 'antd';

const mapLayers = ['地图', '卫星'];

interface MapInputProps {
  map: any;
  style?: object;
}

export default function MapLayerChange(props: MapInputProps) {
  const { map, style = {} } = props;

  const changeMapLayer = (res: any) => {
    const {
      target: { value = '' },
    } = res;
    console.log(value, map);
    if (value === '卫星') {
      map?.setLayers([new window.AMap.TileLayer.Satellite(), new window.AMap.TileLayer.RoadNet()]);
    }
    if (value === '地图') {
      map?.setLayers([new window.AMap.TileLayer()]);
    }
  };

  return (
    <Radio.Group
      style={{ position: 'absolute', left: 70, top: 10, zIndex: 99, ...style }}
      options={mapLayers}
      onChange={changeMapLayer}
      defaultValue={'地图'}
      optionType="button"
      buttonStyle="solid"
      size="small"
    />
  );
}
