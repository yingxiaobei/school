import { memo } from 'react';
import { Tooltip } from 'antd';
import { _get } from 'utils';
import ImageShow from './ImageShow';
import { BaseInfo } from './_api';

interface Props {
  baseInfo: BaseInfo;
}

function HeaderLeft({ baseInfo }: Props) {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <ImageShow src={_get(baseInfo, 'bannerImgUrl', 'error')}></ImageShow>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.6rem' }}>
          <div style={{ flex: '3', alignItems: 'center', display: 'flex' }}>{_get(baseInfo, 'name', '')}</div>
          <div
            style={{
              maxWidth: '252px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span>地址：</span>
            <Tooltip title={_get(baseInfo, 'address', '')} placement="topLeft">
              {_get(baseInfo, 'address', '')}
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(HeaderLeft);
