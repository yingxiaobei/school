import { useRef, useState } from 'react';
import { Button, Drawer, message, Modal, Row } from 'antd';
import { DrawVehicleTrajectoryMap } from 'components';
import { findDOMNode } from 'react-dom';
import screenfull from 'screenfull';
import { ExpandAltOutlined } from '@ant-design/icons';

export default function DrawModal(props: any) {
  const { setDrawPaths, onCancel, isSupport300Point, center, drawPaths, isEditArea, setIsEditArea } = props;
  const [drawMap, setDrawMap] = useState(drawPaths);
  const [screenText, setScreenText] = useState('全屏');
  const drawerRef = useRef(null);
  let screen = screenfull as any;
  const [width, setWidth] = useState(1300);
  const [isFullScreen, setIsFullScreen] = useState(false);
  console.log(drawPaths);
  return (
    <Drawer
      visible
      width={width}
      onClose={onCancel}
      title={
        <div className="flex">
          <span>绘制电子围栏</span>
          <span className="flex1"></span>
          <span
            key={String(isFullScreen)}
            style={{ margin: 'auto' }}
            onClick={() => {
              setIsFullScreen(!isFullScreen);
              setWidth(isFullScreen ? 1300 : document.body.clientWidth);
            }}
          >
            {<ExpandAltOutlined />}
          </span>
        </div>
      }
      footer={
        <Row justify="end">
          <Button onClick={onCancel}>取消</Button>
          <Button
            className="ml20"
            type="primary"
            onClick={() => {
              if (drawMap.length > 0) {
                if (drawMap.length < 3) {
                  message.error('至少绘制3个点');
                  return;
                }

                if (drawMap.length > 30 && !isSupport300Point) {
                  message.error('点位超过30');
                  return;
                }
                if (drawMap.length > 300 && isSupport300Point) {
                  message.error('点位超过300');
                  return;
                }
                setDrawPaths(drawMap);
                onCancel();
              } else {
                message.error('请绘制电子围栏');
              }
            }}
          >
            确定
          </Button>
        </Row>
      }
    >
      <div ref={drawerRef}>
        <DrawVehicleTrajectoryMap
          isSupport300Point={isSupport300Point}
          setDrawPaths={setDrawMap}
          drawMap={drawMap}
          center={center}
          isEditArea={isEditArea}
          setIsEditArea={setIsEditArea}
          onOk={(paths: any) => {
            console.log(paths);
            if (paths) {
              setDrawPaths(paths);
              onCancel();
            } else {
              message.error('请绘制电子围栏');
            }
          }}
        />
      </div>
    </Drawer>
  );
}
