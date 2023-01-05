import { Col, Row } from 'antd';
import { memo } from 'react';
import HeaderLeft from './HeaderLeft';
import HeaderMiddle from './HeaderMiddle';
import HeaderRight from './HeaderRight';
import type { BaseInfo } from './_api';

interface Props {
  baseInfo: BaseInfo;
  changStatusCallback: () => void;
  updateBaseInfoCallback: () => void;
}

function Header({ baseInfo, changStatusCallback, updateBaseInfoCallback }: Props) {
  return (
    <Row align={'bottom'} justify="space-between" gutter={[56, 0]}>
      <Col>
        <HeaderLeft baseInfo={baseInfo} />
      </Col>

      <Col flex="1">
        <HeaderMiddle changStatusCallback={changStatusCallback} baseInfo={baseInfo} />
      </Col>

      <Col>
        <HeaderRight baseInfo={baseInfo} updateBaseInfoCallback={updateBaseInfoCallback} />
      </Col>
    </Row>
  );
}

export default memo(Header);
