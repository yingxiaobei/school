import { Button, message, Modal, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { _uploadImg } from 'api';
import { base64ConvertFile, getUserMedia } from 'utils';
import { useRequest } from 'hooks';
import { Cropper } from 'react-cropper';
import './Demo.css';
import 'cropperjs/dist/cropper.css';
import { _get } from 'utils';
import { IF, Loading } from 'components';

interface IProps {
  onCancel(): void;
  getImgData(param: any): void;
  onOk(): void;
  limitWidth?: styleProps;
  limitHeight?: styleProps;
  type: 'photo' | 'fileImg'; //photo:学员照片专用，像素小；fileImg:拍文件专用，像素大
  maxSize?: number;
}

interface styleProps {
  min: number;
  max: number;
}

export default function Photograph(props: IProps) {
  const { onCancel, getImgData, onOk, limitWidth, limitHeight, maxSize = 0, type = 'photo' } = props;

  const width = type === 'photo' ? 460 : 1200;
  const height = type === 'photo' ? 460 : 900;
  const modalWidth = type === 'photo' ? 520 : 1250;
  const width2 = type === 'photo' ? 470 : 1230;
  const height2 = type === 'photo' ? 470 : 650;

  const videoRef: any = useRef();
  const canvasRef: any = useRef();
  const [imgData, setImgData] = useState('');
  const [cropper, setCropper] = useState<any>();
  const [cropPx, setCropPx] = useState({
    width: 0,
    height: 0,
  }) as any;
  const [loading, setLoading] = useState(false);
  const [cropData, setCropData] = useState('');
  const [videoList, setVideoList] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [callVideoSuccess, setCallVideoSuccess] = useState(false);

  const stopFn = () => {
    const video = document.getElementById('video') as HTMLVideoElement;
    video?.pause();
    // @ts-ignore
    if (typeof window.streamMedia === 'object') {
      // @ts-ignore
      window.streamMedia.getTracks().forEach((track) => track.stop());
      // @ts-ignore
      window.streamMedia = '';
      // vRef.srcObject = null;
    }
  };
  useEffect(() => {
    const video = document.getElementById('video') as HTMLVideoElement;
    if (video && callVideoSuccess) {
      video.srcObject = window.streamMedia;
      video.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    //重拍
    if (!imgData && window.streamMedia) {
      const video = document.getElementById('video') as HTMLVideoElement;
      if (!video) {
        return;
      }
      video.srcObject = window.streamMedia;
      video.onloadedmetadata = function (e) {
        video.play();
      };
    }
  }, [imgData]);

  useEffect(() => {
    const video = document.getElementById('video') as HTMLVideoElement;
    setLoading(true);
    if (!video) {
      return;
    }
    getUserMedia(
      {
        video: {
          height: height,
          width: width,
          deviceId: _get(videoList, `${currentVideoIndex}.id`, ''),
        },
      },
      success,
      error,
    );
    function success(stream: any) {
      video.srcObject = stream;
      // @ts-ignore
      window.streamMedia = stream;
      video.onloadedmetadata = function (e) {
        video.play();
      };
      setCallVideoSuccess(true);

      setLoading(false);
    }

    function error(e: any) {
      message.error('请确认摄像头已启用');
      setLoading(false);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoIndex]);

  useEffect(() => {
    // setLoading(true);
    let videoArr: any = [];
    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        devices.forEach(function (device) {
          if (device.kind == 'videoinput') {
            videoArr.push({
              label: device.label,
              id: device.deviceId,
            });
          }
        });
        setVideoList(videoArr);
      })
      .catch(function (err) {
        console.log(err);
      });
  }, [callVideoSuccess]);
  useEffect(() => {
    return () => {
      stopFn();
    };
  }, []);
  const { loading: saveLoading, run } = useRequest(_uploadImg, {
    onSuccess: (data) => {
      getImgData(data);
      onOk();
    },
  });
  const cropperRef = useRef<HTMLImageElement>(null);
  const onCrop = (e: any) => {
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;
    const width = cropper?.cropBoxData?.width || 0;
    const height = cropper?.cropBoxData?.height || 0;
    console.log(cropper?.cropBoxData?.width, cropper?.cropBoxData?.height);
    setCropPx({
      width: width.toFixed(),
      height: height.toFixed(),
    });
  };
  const getCropData = () => {
    if (typeof cropper !== 'undefined') {
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };

  const onCropMove = () => {
    const imageElement: any = cropperRef?.current;
    const cropper = imageElement?.cropper;
    const width = _get(cropper, 'cropBoxData.width', 0); //裁剪框实际宽度
    const height = _get(cropper, 'cropBoxData.height', 0); //裁剪框实际高度
    let realWidth = 0; // 根据宽度最大值，最小值限制处理的宽度
    let realHeight = 0;

    Number(limitWidth?.max) && Number(limitWidth?.max) < width //限制裁剪框宽度小于最大值
      ? (realWidth = Number(Number(limitWidth?.max).toFixed()))
      : (realWidth = width);
    Number(limitWidth?.min) && Number(limitWidth?.min) > width //限制裁剪框宽度大于最小值
      ? (realWidth = Number(Number(limitWidth?.min).toFixed()))
      : (realWidth = width);

    Number(limitHeight?.min) && Number(limitHeight?.min) > height //限制裁剪框高度小于最大值
      ? (realHeight = Number(Number(limitHeight?.min).toFixed()))
      : (realHeight = height);
    Number(limitHeight?.max) && Number(limitHeight?.max) < height //限制裁剪框高度大于最小值
      ? (realHeight = Number(Number(limitHeight?.max).toFixed()))
      : (realHeight = height);
    cropper.setCropBoxData({
      // 处理的宽高数据生效
      width: realWidth,
      height: realHeight,
    });
  };

  return (
    <Modal
      // getContainer={false} //放开会导致被其他弹窗覆盖
      visible
      title={'拍照'}
      maskClosable={false}
      onCancel={() => {
        stopFn();
        onCancel();
      }}
      width={modalWidth}
      className={'photoModal'}
      footer={
        <div>
          <Button
            key="back"
            onClick={() => {
              stopFn();
              onCancel();
            }}
          >
            取消
          </Button>
          <Button
            loading={saveLoading}
            key="submit"
            id="save"
            type="primary"
            onClick={async () => {
              if (!imgData) {
                return message.error('请先拍照');
              }
              const imageElement: any = cropperRef?.current;
              const cropper: any = imageElement?.cropper;
              if (Number(limitWidth?.max) && Number(limitWidth?.max) < cropPx.width)
                return message.error(`不符合尺寸要求`);
              if (Number(limitWidth?.min) && Number(limitWidth?.min) > cropPx.width)
                return message.error(`不符合尺寸要求`);

              if (Number(limitHeight?.min) && Number(limitHeight?.min) > cropPx.height)
                return message.error(`不符合尺寸要求`);
              if (Number(limitHeight?.max) && Number(limitHeight?.max) < cropPx.height)
                return message.error(`不符合尺寸要求`);
              const cropperData = cropper.getCroppedCanvas().toDataURL();
              const file = base64ConvertFile(cropperData);
              if (!!maxSize && file.size / 1024 > maxSize)
                return message.error(
                  `驾驶证图片大小超过${maxSize}kb，不支持拍照上传，请更换摄像头后重拍或直接上传图片`,
                );
              console.log(maxSize, file.size / 1024);
              let formData = new FormData();
              formData.append('file', file);
              run(formData);
            }}
          >
            保存
          </Button>
        </div>
      }
    >
      <IF
        condition={loading}
        then={
          <div style={{ height: height2, overflow: 'auto' }}>
            <Loading />
          </div>
        }
        else={
          <div className="flex-box direction-col">
            <div style={{ height: height2, overflow: 'auto', width: width2 }}>
              {!imgData && (
                <video
                  id="video"
                  ref={videoRef}
                  height={height}
                  width={width}
                  style={{ objectFit: 'cover' }}
                  muted
                  loop
                  autoPlay
                ></video>
              )}

              <canvas id="canvas" ref={canvasRef} height={height} width={width} style={{ display: 'none' }}></canvas>
              {imgData && (
                <div className="flex direction-col">
                  <div style={{ height: height2, width }}>
                    <Cropper
                      src={imgData}
                      // style={{ height: 350, width: width }}
                      zoomTo={0.5}
                      // initialAspectRatio={1}
                      preview=".img-preview"
                      viewMode={1}
                      minCropBoxHeight={limitHeight?.min}
                      minCropBoxWidth={limitWidth?.min}
                      background={false}
                      responsive={true}
                      autoCropArea={1}
                      checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                      onInitialized={(instance) => {
                        setCropper(instance);
                      }}
                      guides={true}
                      crop={onCrop}
                      cropmove={onCropMove}
                      cropend={onCropMove}
                      ref={cropperRef}
                    />
                  </div>
                </div>
              )}
            </div>

            <Row style={{ position: 'relative', padding: 5 }}>
              {!imgData && (
                <Button
                  id="okBtn"
                  type="primary"
                  style={{ marginLeft: 10, marginRight: 10 }}
                  onClick={() => {
                    if (!callVideoSuccess) {
                      return message.error('请确认摄像头是否启用');
                    }
                    const video = document.getElementById('video') as HTMLVideoElement;
                    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
                    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
                    context.drawImage(video, 0, 0, width, height);
                    var base64imgData = canvas.toDataURL();
                    setImgData(base64imgData);
                  }}
                >
                  拍照
                </Button>
              )}
              {imgData && (
                <Button
                  className="ml10 mr20"
                  type="primary"
                  onClick={() => {
                    if (!callVideoSuccess) {
                      return message.error('请确认摄像头是否启用');
                    }
                    setImgData('');
                  }}
                >
                  重拍
                </Button>
              )}
              {videoList.length > 1 && !imgData && (
                <Button
                  className="ml10 mr20"
                  type="primary"
                  onClick={() => {
                    stopFn();
                    const len = videoList.length;
                    // setLoading(true);
                    setCurrentVideoIndex(currentVideoIndex + 1 >= len ? 0 : currentVideoIndex + 1);
                  }}
                >
                  切换摄像头
                </Button>
              )}
              <div /* style={{ position: 'absolute', right: 0 }} */>
                <div>
                  当前尺寸: 宽{cropPx.width}px,高{cropPx.height}px
                </div>
                <div>
                  {Number(limitWidth?.max) && Number(limitHeight?.max) ? (
                    <>
                      最大尺寸：{limitWidth?.max}*{limitHeight?.max}，
                    </>
                  ) : undefined}
                  {Number(limitHeight?.min) && Number(limitWidth?.min) ? (
                    <>
                      最小尺寸：{limitWidth?.min}*{limitHeight?.min}
                    </>
                  ) : undefined}
                </div>
              </div>
            </Row>
          </div>
        }
      />
    </Modal>
  );
}
