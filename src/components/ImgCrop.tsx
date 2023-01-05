import { useRef, useContext, useCallback, useState } from 'react';
import { message, Modal, Row } from 'antd';
import { useControllableValue } from 'ahooks';
import { Cropper } from 'react-cropper';
import './index.css';
import 'cropperjs/dist/cropper.css';
import { _get } from 'utils';
import GlobalContext from 'globalContext';

interface IProps {
  children: any;
  isCrop: boolean;
  limitWidth?: styleProps;
  limitHeight?: styleProps;
}

interface styleProps {
  min: number;
  max: number;
}
export default function ImgCrop(props: IProps) {
  const defaultValue = {
    file: '',
    fileList: [],
    modalWidth: 0, //Modal的宽度,传百分比用字符串，传像素用数值
    visible: false, //Modal的显示控制
    imgUrl: '',
    width: 500,
    height: 400,
    execBeforUpload: {},
  };
  const { $maxImgSize } = useContext(GlobalContext);

  const { children, isCrop, limitWidth, limitHeight } = props;
  const [state, setState] = useControllableValue(props, { defaultValue }) as any;
  const { visible, imgUrl } = state;
  const cropperRef = useRef(null);
  const [cropPx, setCropPx] = useState({
    width: 0,
    height: 0,
  });

  //移动选中图片选择框时触发此动作
  const onCrop = () => {
    const imageElement: any = cropperRef?.current;
    const cropper = imageElement?.cropper;
    const width = _get(cropper, 'cropBoxData.width', 0);
    const height = _get(cropper, 'cropBoxData.height', 0);
    setCropPx({
      width: Number(Number(width).toFixed()) || 0,
      height: Number(Number(height).toFixed()) || 0,
    });
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

  const onReady = () => {
    const imageElement: any = cropperRef?.current;
    const cropper = imageElement?.cropper;
    if (Number(limitWidth?.min) && Number(limitHeight?.min)) {
      //每次裁剪 初始化裁剪框的宽高
      cropper.setData({
        width: Number(limitWidth?.min),
        height: Number(limitHeight?.min),
      });
    }
  };

  /**
   * Upload
   */
  const renderUpload = useCallback(() => {
    const upload = Array.isArray(children) ? children[0] : children;

    const { beforeUpload, accept, maxSize, fileTypes, getLimitSizeFromParam, ...restUploadProps } = upload.props;

    return {
      ...upload,
      props: {
        ...restUploadProps,
        accept: accept || 'image/*',
        beforeUpload: (file: any, fileList: any) =>
          new Promise((resolve, reject) => {
            const imgUrl = window.URL.createObjectURL(file);
            const res = beforeUpload(
              file,
              fileList,
              fileTypes,
              $maxImgSize !== 0 && getLimitSizeFromParam && !isNaN($maxImgSize) ? $maxImgSize / 1024 : maxSize,
            );
            if (!res) {
              return false;
            }
            if (file.size) {
              setState((x: any) => ({
                ...x,
                visible: true,
                imgUrl,
                file,
                fileList,
                execBeforUpload: { resolve, reject },
              }));
            }
          }),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, state, setState]);

  const modalToggle = () => {
    setState((x: any) => ({ ...x, visible: !x.visible }));
  };

  const onOk = () => {
    const { file } = state;
    const imageElement: any = cropperRef?.current;
    const cropper = imageElement?.cropper;

    if (Number(limitWidth?.max) && Number(limitWidth?.max) < cropPx.width) return message.error(`不符合尺寸要求`);
    if (Number(limitWidth?.min) && Number(limitWidth?.min) > cropPx.width) return message.error(`不符合尺寸要求`);

    if (Number(limitHeight?.min) && Number(limitHeight?.min) > cropPx.height) return message.error(`不符合尺寸要求`);
    if (Number(limitHeight?.max) && Number(limitHeight?.max) < cropPx.height) return message.error(`不符合尺寸要求`);
    cropper
      .getCroppedCanvas({
        width: cropPx.width,
        height: cropPx.height,
      })
      .toBlob(async (blob: any) => {
        // const file = new File([blob], filename, { uid: new Date().getTime() });
        // @ts-ignore
        const newFile = new File([blob], file.name, { type: file.type, uid: new Date().getTime() });
        setState((x: any) => ({ ...x, visible: false, file: newFile }));
        state.execBeforUpload.resolve(newFile);
      });
  };
  if (!isCrop) {
    return <div>{children}</div>;
  }

  return (
    <>
      <Modal
        title={'图片裁剪'}
        cancelText="取消"
        okText="确定"
        onCancel={modalToggle}
        visible={visible}
        onOk={onOk}
        maskClosable={false}
        width={900}
      >
        {
          <div className="flex-box  direction-col">
            <Row justify="end">
              当前尺寸: 宽{cropPx.width}px,高{cropPx.height}px
            </Row>
            <Row justify="end">
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
            </Row>

            <Cropper
              // style={{ height, width: '100%' }}
              src={imgUrl}
              ref={cropperRef}
              // Cropper.js options
              viewMode={1}
              minCropBoxHeight={limitHeight?.min}
              minCropBoxWidth={limitWidth?.min}
              data={limitWidth?.min && limitHeight?.min ? { width: limitWidth?.min, height: limitHeight?.min } : {}}
              autoCrop
              // dragMode="dragMode"
              zoomable={true}
              // initialAspectRatio={1}
              responsive={true}
              autoCropArea={1}
              preview=".cropper-preview"
              checkOrientation={false}
              guides={true}
              crop={onCrop}
              cropmove={onCropMove}
              cropend={onCropMove}
              ready={onReady}
            />
          </div>
        }
      </Modal>
      {renderUpload()}
    </>
  );
}
