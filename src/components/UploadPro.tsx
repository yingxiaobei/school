import { useContext, useState } from 'react';
import { Upload, message } from 'antd';
import { Auth, beforeUpload, _get, beforeMaxSizeUpload } from 'utils';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';
import GlobalContext from 'globalContext';
import ImgCrop from './ImgCrop';

interface IProps {
  imageUrl?: string;
  setImageUrl(imageUrl: any): void;
  callback?: Function;
  setImgId(imgId: any): void;
  disabled?: boolean;
  uploadTitle?: string;
  maxSize?: number;
  getLimitSizeFromParam?: boolean;
  isPress?: boolean;
  fileTypes?: string[];
  isCrop?: boolean;
  limitWidth?: styleProps;
  limitHeight?: styleProps;
  limitApi?: string;
}
interface styleProps {
  min: number;
  max: number;
}
export default function UploadPro(props: IProps) {
  const { $maxImgSize, $minImgSize } = useContext(GlobalContext);
  const {
    limitWidth,
    limitHeight,
    imageUrl,
    setImageUrl,
    callback = () => {},
    setImgId,
    disabled,
    uploadTitle = '点击上传',
    maxSize = 10,
    getLimitSizeFromParam = false,
    isPress = false,
    fileTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'],
    isCrop = false, //上传图片是否需要裁剪
    limitApi = '',
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  // const [imgState, setImgState] = useState({ width: 800, height: 401 }) as any;
  let action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';
  if (isPress) {
    action = USER_CENTER_URL + '/api/video-face/tmpFile/uploadImg';
  }
  if (limitApi) {
    action = USER_CENTER_URL + limitApi;
  }
  const isNumber = !isNaN($maxImgSize); //判断是否数字（自定义参数可能传字符串）

  function handleChange(info: any) {
    if (info.file.status === 'uploading') {
      setIsLoading(true);
    }

    if (info.file.status === 'done') {
      setIsLoading(false);
      const fileUrl = _get(info, 'file.response.data.url');
      setImageUrl(fileUrl);
      setImgId && setImgId(_get(info, 'file.response.data.id'));
      if (_get(info, 'file.response.code') !== 200) {
        message.error(_get(info, 'file.response.message'));
      }
      callback({ img: fileUrl, id: _get(info, 'file.response.data.id') });
    }

    if (info.file.status === 'error') {
      message.error('上传失败');
      setIsLoading(false);
    }
  }
  return (
    <ImgCrop isCrop={isCrop} limitWidth={limitWidth} limitHeight={limitHeight}>
      <Upload
        headers={{
          token: Auth.get('token') as string,
          Authorization: 'bearer' + Auth.get('token'),
          username: Auth.get('username') as string,
          schoolId: Auth.get('schoolId') as string,
        }}
        accept={'.jpg,.png,.bmp,.gif,.jpeg'}
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={action}
        beforeUpload={(file, fileList) =>
          limitApi // 学员照片 特有接口上传
            ? beforeMaxSizeUpload(
                file,
                fileList,
                fileTypes,
                getLimitSizeFromParam && isNumber ? $maxImgSize / 1024 : maxSize,
              )
            : beforeUpload(
                // 通用上传
                file,
                fileList,
                fileTypes,
                getLimitSizeFromParam && isNumber ? $maxImgSize / 1024 : maxSize,
                false,
                getLimitSizeFromParam && !isNaN($minImgSize) ? $minImgSize / 1024 : 0,
              )
        }
        onChange={handleChange}
        disabled={isLoading || disabled}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%' }} />
        ) : (
          <>
            {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div>{uploadTitle}</div>
          </>
        )}
      </Upload>
    </ImgCrop>
  );
}
