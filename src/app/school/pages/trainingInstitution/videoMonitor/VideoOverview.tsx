import { Button, Row } from 'antd';
import { useEffect, useState } from 'react';
import { ExpandOutlined, CloseOutlined } from '@ant-design/icons';
import VideoDetail from './VideoDetail';
import { useVisible } from 'hooks';
import { _get } from 'utils';

declare const window: any;

export default function VideoOverview(props: any) {
  const { selectedUrlData = [], setCheckedKeys, checkedKeys, checkedNodes, setCheckedNodes } = props;
  const [videoDetailVisible, setVideoDetailVisible] = useVisible();
  const [width, setWidth] = useState('30%');
  const [videoIndex, setVideoIndex] = useState(0);
  const [count, setCount] = useState(Math.floor(Math.random() * 100));

  useEffect(() => {
    if (_get(selectedUrlData, 'length', 0) > 4) {
      return setWidth('30%');
    }
    if (_get(selectedUrlData, 'length', 0) >= 2) {
      return setWidth('45%');
    }
    setWidth('90%');
  }, [selectedUrlData]);

  useEffect(() => {
    selectedUrlData.forEach((element: any, index: any) => {
      const videoId = `video-${_get(element, 'carId', '')}-${_get(element, 'id', '')}-${count}`;
      var player = window.neplayer(
        videoId,
        {
          width: '100%',
        },
        function () {
          // 当播放器初始化完成时运行的回调函数
        },
      );
      if (_get(element, 'url', '')) {
        player.setDataSource({
          type: 'application/x-mpegURL',
          src: _get(element, 'url', ''),
        });
        player.play();
      } else {
        const video: any = document.getElementById(videoId);
        video.src = '';
      }
      setCount((c) => c + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUrlData]);

  const getHeight = () => {
    const length = _get(selectedUrlData, 'length', 0);
    if (length === 1) {
      return 600;
    }
    if (length === 2) {
      return 500;
    }
    if (length < 5) {
      return 360;
    }
    return 300;
  };

  return (
    <>
      <Row justify={'end'}>
        <Button
          onClick={() => {
            setWidth('45%');
          }}
        >
          四分屏
        </Button>
        <Button
          className="ml20"
          onClick={() => {
            setWidth('30%');
          }}
        >
          九分屏
        </Button>
      </Row>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
        {videoDetailVisible && (
          <VideoDetail
            selectedUrlData={selectedUrlData}
            onCancel={setVideoDetailVisible}
            videoIndex={videoIndex}
            setVideoIndex={setVideoIndex}
            count={count}
          />
        )}
        {/* <div > */}
        {selectedUrlData.map((item: any, index: any) => {
          return (
            <div
              className="flex mt10"
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                border: 'solid 1px #f0f0f0',
                height: getHeight(),
                width,
              }}
              key={index}
            >
              <CloseOutlined
                style={{ alignSelf: 'flex-end', margin: 5 }}
                onClick={() => {
                  setCheckedKeys(checkedKeys.filter((x: any) => x != item.key));
                  const checkedNode = checkedNodes.filter((x: any) => {
                    return !(x.pid === item.pid && x.id === item.id);
                  });
                  setCheckedNodes(checkedNode);
                }}
              />
              <video
                style={{ width: '100%', height: '100%' }}
                id={`video-${item.carId}-${item.id}-${count}`}
                className="video-js vjs-big-play-centered"
                // webkit-playsinline
                // playsinline
                x5-video-player-type="h5"
                x5-video-player-fullscreen="true"
                x5-video-orientation="landscape"
              ></video>
              <Row>
                <span>{`${item.carLicense}-${item.text}`}</span>
                <ExpandOutlined
                  style={{ marginTop: 5 }}
                  className="ml20"
                  onClick={() => {
                    setCount((c) => c + 1);
                    setVideoIndex(index);
                    setVideoDetailVisible();
                  }}
                />
              </Row>
            </div>
          );
        })}
      </div>
    </>
  );
}
