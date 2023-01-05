import { memo } from 'react';
import { Typography } from 'antd';
import { _get } from 'utils';
import { BaseInfo } from './_api';
const { Title } = Typography;
interface Props {
  baseInfo: BaseInfo;
}

function Footer({ baseInfo }: Props) {
  return (
    <div>
      <Title level={5}>驾校简介</Title>
      <div
        style={{
          border: '1px solid #ccc',
          minHeight: '10rem',
          marginBottom: '2rem',
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
        dangerouslySetInnerHTML={{ __html: _get(baseInfo, 'description', '') }}
      ></div>
    </div>
  );
}

export default memo(Footer);
