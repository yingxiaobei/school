import { Space } from 'antd';
import { PopoverImg } from 'components';
import { memo } from 'react';
import { _get } from 'utils';

interface Props {
  urlList: string[];
}

function DetailImgShow({ urlList }: Props) {
  if (!urlList.length) return null;

  return (
    <Space wrap>
      {urlList.map((url, index) => (
        <PopoverImg src={url} key={index} />
      ))}
    </Space>
  );
}

export default memo(DetailImgShow);
