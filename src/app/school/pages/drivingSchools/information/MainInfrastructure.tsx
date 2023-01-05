import { memo, useState } from 'react';
import { Col, Row, Typography } from 'antd';
import { Auth } from 'utils';
import { QrCode } from 'components';
import { Infrastructure } from './_api';
import InfrastructureShow from './InfrastructureShow';

const { Title } = Typography;
interface Props {
  isInfrastructureOptions: Partial<Infrastructure>;
}

function MainInfrastructure({ isInfrastructureOptions }: Props) {
  const [codeUrl] = useState(() => {
    return `${window.origin}/h5/school/share?schoolId=${Auth.get('schoolId')}`;
  });

  return (
    <div>
      <Title level={5}>基础设施</Title>

      <Row justify="space-between" align="middle">
        <Col>
          <InfrastructureShow isInfrastructureOptions={isInfrastructureOptions} />
        </Col>
        <Col>
          <QrCode style={{ width: 100, height: 'auto' }} value={codeUrl} />
        </Col>
      </Row>
    </div>
  );
}

export default memo(MainInfrastructure);
