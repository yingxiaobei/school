import { Col, Row } from 'antd';
import CustomIcon from 'components/CustomIcon';
import React, { memo } from 'react';
import styles from './index.module.css';

interface Props {
  svgcomponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  options: {
    title: '占地面积' | '车辆' | '教练';
    content?: string | number;
  };
}

function HeaderIconShow({ svgcomponent, options }: Props) {
  return (
    <Row align="middle" justify="center" style={{ minWidth: 106 }}>
      <CustomIcon className={styles['infrastructureShow']} style={{ marginRight: '6px' }} svgcomponent={svgcomponent} />
      <Col style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div>{options?.content || <p />}</div>
        <div>{options?.content ? options?.title : ''}</div>
      </Col>
    </Row>
  );
}

export default memo(HeaderIconShow);
