import { Spin } from 'antd';
import { useFetch } from 'hooks';
import { useState } from 'react';
import { _SyncCar } from '../../_api';

interface Props {
  onSuccess: () => void;
}

function SyncInfoContent({ onSuccess }: Props) {
  const [syncInfoCount, setSyncInfoCount] = useState(0);

  const { isLoading } = useFetch({
    request: _SyncCar,
    callback(data) {
      setSyncInfoCount(data);
      onSuccess();
    },
  });

  return <Spin spinning={isLoading}>{`已同步${syncInfoCount}条车辆信息`}</Spin>;
}

export default SyncInfoContent;
