/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState } from 'react';
import { isEmpty, pickBy, identity } from 'lodash';
import { Alert, Button, message, Row, Radio } from 'antd';
import MapLayerChange from './MapLayerChange';

// 地理位置
type TLocation = {
  lng: number;
  lat: number;
};

type TProps = {
  setDrawPaths: Function;
  center?: TLocation;
  onOk?: any;
  isSupport300Point?: Boolean;
  drawMap: any;
  isEditArea: any;
  setIsEditArea: any;
};

export default function DrawVehicleTrajectoryMap(props: TProps) {
  const {
    isSupport300Point = false, //是否需要支持最少300个点 true：300个点 false:30个点
    setDrawPaths,
    center,
    drawMap = [],
    isEditArea,
    setIsEditArea,
  } = props;

  const path = drawMap.map((item: any) => {
    return Object.values({
      lng: item.lng,
      lat: item.lat,
    });
  });

  const AMap: any = useRef(null);
  const mouseTool: any = useRef(null);
  const polyEditor: any = useRef(null);
  const polygon: any = useRef(null); // 多边形覆盖物
  const container = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [map, setMap] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const mapConfig: any = {
    zoom: 16,
    enableScrollWheelZoom: true,
    autoLocalCity: isEmpty(center),
    enableMapClick: false,
    widget: ['GeolocationControl', 'NavigationControl'],
  };

  if (center) {
    Object.assign(mapConfig, { center });
  }

  function drawPolygon() {
    setIsDrawing(true);
    mouseTool.current = new window.AMap.MouseTool(AMap.current);
    mouseTool.current.polygon({
      strokeColor: '#F3302B',
      strokeWeight: 6,
      strokeOpacity: 0.2,
      fillOpacity: 0.4,
      fillColor: '#F3302B',
      zIndex: 50,
    });
    // 绘画完成后的回调
    mouseTool.current.on('draw', (type: any) => {
      var map_m = type.obj.getPath();
      console.log('AAA', map_m);
      setDrawPaths(map_m);
      mouseTool.current.close();
      console.log(type);
      polyEdit(type.obj);
    });
  }

  function polyEdit(polygon: any) {
    polyEditor.current = new window.AMap.PolyEditor(AMap.current, polygon);
    polygon.on('mouseover', () => {
      setInMap(true);
    });
    polygon.on('mouseout', () => {
      setInMap(false);
    });
    function setPaths(paths: any) {
      return paths.map((item: any) => {
        return {
          lng: item.lng,
          lat: item.lat,
        };
      });
    }
    polyEditor.current.on('addnode', (event: any) => {
      console.log(event.target.getPath(), '增加了一个节点');

      setDrawPaths(setPaths([...event.target.getPath()]));
    });
    polyEditor.current.on('removenode', (event: any) => {
      console.log(event.target.getPath(), '减少一个节点');
      setDrawPaths(setPaths([...event.target.getPath()]));
    });
    polyEditor.current.on('adjust', (event: any) => {
      console.log(event.target.getPath(), '移动了一个线');
      setDrawPaths(setPaths([...event.target.getPath()]));
    });
    polyEditor.current.on('move', (event: any) => {
      console.log(event.target.getPath(), '移动了覆盖物');
      setDrawPaths(setPaths([...event.target.getPath()]));
    });
  }
  useEffect(() => {
    AMap.current = new window.AMap.Map(
      container.current,
      pickBy(
        {
          layers: window.AMap.TileLayer(),
          zoom: 14,
        },
        identity,
      ),
    );
    if (center) {
      AMap.current.setCenter(
        Object.values({
          lng: center.lng,
          lat: center.lat,
        }),
        true,
      );
    }
    AMap.current.plugin(['AMap.ToolBar'], function () {
      // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
      AMap.current.addControl(new window.AMap.ToolBar({ locate: false }));
    });
    // 如果有点位就生成一个多边形覆盖物
    if (path.length > 0) {
      polygon.current = new window.AMap.Polygon({
        path: path,
        strokeColor: '#F3302B',
        strokeWeight: 6,
        strokeOpacity: 0.2,
        fillOpacity: 0.4,
        fillColor: '#F3302B',
        zIndex: 50,
      });
      console.log(polygon.current);
      AMap.current.add([polygon.current]);
      AMap.current.setFitView([polygon.current]);
      polyEdit(polygon.current);
    }
    setMap(AMap.current);
  }, []);

  const [inMap, setInMap] = useState(false);

  // const [polyEditor, setPolyEditor] = useState(null) as any;

  useEffect(() => {
    if (drawMap.length > 30 && !isSupport300Point) {
      message.error('点位超过30');
      return;
    }
    if (drawMap.length > 300 && isSupport300Point) {
      message.error('点位超过300');
      return;
    }
  }, [drawMap.length]);

  return (
    <div style={{ width: '100%', height: '750px', position: 'relative' }}>
      <Row>
        <Alert
          message={
            <div>
              <span style={{ color: '#faad14' }}>
                {isSupport300Point
                  ? '只支持绘制一个电子围栏，每个电子围栏不能超过300个坐标点'
                  : '只支持绘制一个电子围栏，每个电子围栏不能超过30个坐标点'}
              </span>
            </div>
          }
          type="warning"
          style={{ width: 500 }}
          className="mb20  text-center"
        />
        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>当前绘制点数：{path.length}</div>
      </Row>
      {inMap && (
        <Alert
          type="warning"
          style={{ position: 'absolute', top: '30%', left: '45%', zIndex: 99 }}
          className="text-center"
          message={
            <div>
              <div>点击右上角【编辑】按钮后可操作</div>
              <div>修改点位：左键拖动空心点</div>
              <div>删除点位：左键单击空心点</div>
              <div>增加点位：左键拖动空心（浅色）点</div>
            </div>
          }
        ></Alert>
      )}
      <Button
        style={{ position: 'absolute', right: 80, top: 70, zIndex: 99 }}
        disabled={isEdit || isEmpty(drawMap)}
        onClick={() => {
          setIsEditArea(true);
          setIsEdit(true);
          polyEditor.current && polyEditor.current.open();
        }}
      >
        编辑
      </Button>
      <Button
        style={{ position: 'absolute', right: 10, top: 70, zIndex: 99 }}
        disabled={!isEdit || isEmpty(drawMap)}
        onClick={() => {
          setIsEdit(false);
          polyEditor.current && polyEditor.current.close();
        }}
      >
        完成
      </Button>

      <Button
        style={{ position: 'absolute', right: 150, top: 70, zIndex: 99 }}
        disabled={isEmpty(drawMap)}
        onClick={() => {
          setIsEditArea(true);
          setInMap(false);
          // map?.clearOverlays();
          setDrawPaths([]);
          setIsEdit(false);
          setIsDrawing(false);
          polyEditor.current && polyEditor.current.close();
          polyEditor.current = null;
          mouseTool.current && mouseTool.current.close(true);
          mouseTool.current = null;
          AMap.current.remove([polygon.current]);
          polygon.current = null;
        }}
      >
        清空
      </Button>

      <Button
        style={{ position: 'absolute', right: 220, top: 70, zIndex: 99 }}
        disabled={!isEmpty(drawMap) || isDrawing}
        onClick={() => {
          setIsEditArea(true);
          drawPolygon();
        }}
      >
        绘制
      </Button>

      <div ref={container} style={{ height: '100%' }}>
        {map && <MapLayerChange map={AMap.current} />}
      </div>
    </div>
  );
}
