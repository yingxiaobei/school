import { useState } from 'react';
import LeftPlate from './LeftPlate';
import RightPlate from './RightPlate';
import { Button } from 'antd';
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import { useVisible } from 'hooks';

export default function ExamResultManage() {
  const [query, setQuery] = useState({});

  const [visible, setVisible] = useVisible();
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div
        style={{
          width: '250px',
          borderRight: ' 1px solid #909090',
          paddingRight: '6px',
          display: !visible ? 'block' : 'none',
        }}
      >
        <LeftPlate onCallBack={(query) => setQuery(query)} />
      </div>
      <Button style={{ top: '32vh', border: 'none' }} onClick={setVisible} className="mr20">
        {visible ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
      </Button>
      <div style={{ width: !visible ? 'calc(100% - 300px)' : '100%', minWidth: 'calc(100% - 300px)' }}>
        <RightPlate query={query} />
      </div>
    </div>
  );
}
