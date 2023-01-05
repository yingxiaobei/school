import { Col, Row, Switch } from 'antd';
import { memo, useState } from 'react';
import HeaderIconShow from './HeaderIconShow';
import { ReactComponent as LocationSVG } from 'statics/images/information/location.svg';
import { ReactComponent as CarSVG } from 'statics/images/information/car.svg';
import { ReactComponent as PersonSVG } from 'statics/images/information/person.svg';
import { BaseInfo, _changeIsDisplayMine, _changeIsPlayShare, _getSchoolDetail } from './_api';
import { _get } from 'utils';
interface Props {
  baseInfo: BaseInfo;
  changStatusCallback: () => void;
}

function HeaderMiddle({ baseInfo, changStatusCallback }: Props) {
  const [shareLoading, setShareLoading] = useState(false);
  const [mineDisplayLoading, setMineDisplayLoading] = useState(false);

  const changeShareStatus = async (isShare: boolean) => {
    try {
      setShareLoading(true);
      await _changeIsPlayShare({
        isShare: Number(isShare),
      });
    } catch (error) {
      console.error(error);
    } finally {
      changStatusCallback();
      setShareLoading(false);
    }
  };
  const changeMineDisplayStatus = async (isMineDisplay: boolean) => {
    try {
      setMineDisplayLoading(true);
      await _changeIsDisplayMine({
        isMineDisplay: Number(isMineDisplay),
      });
    } catch (error) {
      console.error(error);
    } finally {
      changStatusCallback();
      setMineDisplayLoading(false);
    }
  };

  const isNullable = (value: unknown) => {
    return value == null;
  };

  return (
    <Row>
      <Col span={12}>
        <Row>
          <Col span={8}>
            <HeaderIconShow
              options={{
                title: '占地面积',
                content: isNullable(_get(baseInfo, 'totalCoachArea')) ? '' : _get(baseInfo, 'totalCoachArea') + '㎡',
              }}
              svgcomponent={LocationSVG}
            />
          </Col>
          <Col span={8}>
            <HeaderIconShow
              options={{
                title: '车辆',
                content: isNullable(_get(baseInfo, 'totalCoachCar')) ? '' : _get(baseInfo, 'totalCoachCar') + '辆',
              }}
              svgcomponent={CarSVG}
            />
          </Col>
          <Col span={8}>
            <HeaderIconShow
              options={{
                title: '教练',
                content: isNullable(_get(baseInfo, 'totalCoachCnt')) ? '' : _get(baseInfo, 'totalCoachCnt') + '人',
              }}
              svgcomponent={PersonSVG}
            />
          </Col>
        </Row>
      </Col>

      <Col span={12}>
        <Row align="bottom" gutter={[68, 0]} style={{ height: '100%' }} justify="center">
          <Col style={{ display: 'flex', marginBottom: '6px' }}>
            <div style={{ marginRight: '0.4rem' }}>驾校分享入口</div>
            <Switch loading={shareLoading} checked={!!_get(baseInfo, 'isShare', 0)} onChange={changeShareStatus} />
          </Col>
          <Col style={{ display: 'flex' }}>
            <div style={{ marginRight: '0.4rem', marginBottom: '6px' }}>我的驾校入口</div>
            <Switch
              loading={mineDisplayLoading}
              checked={!!_get(baseInfo, 'isMineDisplay', 0)}
              onChange={changeMineDisplayStatus}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default memo(HeaderMiddle);
