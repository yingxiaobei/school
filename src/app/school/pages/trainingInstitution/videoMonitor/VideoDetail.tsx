import { Button, message, Modal, Row } from 'antd';
import { useEffect } from 'react';
import { _get } from 'utils/_get';

declare const window: any;

interface IProps {
  selectedUrlData: any;
  onCancel(): void;
  videoIndex: number;
  setVideoIndex(param: any): void;
  count: any;
}

export default function VideoDetail(props: IProps) {
  const { selectedUrlData, onCancel, videoIndex, setVideoIndex, count } = props;
  useEffect(() => {
    var player = window.neplayer(
      `videoDetail${count}`,
      {
        width: '100%', // Sets the display height of the video player in pixels.
      },
      function () {
        // 当播放器初始化完成时运行的回调函数
        if (_get(selectedUrlData, `${videoIndex}.url`, '')) {
          player.setDataSource({
            type: 'application/x-mpegURL',
            src: _get(selectedUrlData, `${videoIndex}.url`, ''),
          });
          player.play();
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoIndex]);

  const handleNext = (type = 'previous') => {
    if (type === 'next') {
      if (videoIndex + 1 >= _get(selectedUrlData, 'length', 0)) {
        return message.error('当前已是最后一个');
      }
      return setVideoIndex((curIndex: any) => curIndex + 1);
    }
    if (videoIndex - 1 < 0) {
      return message.error('当前已是第一个');
    }
    return setVideoIndex((curIndex: any) => curIndex - 1);
  };

  return (
    <Modal
      title={`${_get(selectedUrlData, `${videoIndex}.carLicense`, '')}-${_get(
        selectedUrlData,
        `${videoIndex}.text`,
        '',
      )}`}
      visible
      onCancel={onCancel}
      width={1000}
      maskClosable={false}
      footer={null}
    >
      <div className="flex-box" style={{ flexDirection: 'column', height: 500, overflow: 'auto' }}>
        <video
          style={{ width: '100%', height: '100%' }}
          id={`videoDetail${count}`}
          className="video-js vjs-big-play-centered"
          // webkit-playsinline
          // playsinline
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          x5-video-orientation="landscape"
        ></video>
        <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {`${_get(selectedUrlData, `${videoIndex}.carLicense`, '')}-${_get(
              selectedUrlData,
              `${videoIndex}.text`,
              '',
            )}`}
          </span>
        </Row>
      </div>

      <Row justify="center" className="mt10">
        <Button
          onClick={() => {
            handleNext('previous');
          }}
        >
          上一个
        </Button>
        <Button
          className="ml20"
          onClick={() => {
            handleNext('next');
          }}
        >
          下一个
        </Button>
      </Row>
    </Modal>
  );
}
