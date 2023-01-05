// 其他设备设施管理

import { _getOtherDeviceInfo } from './_api';
import Edit from './Edit';
import { Row } from 'antd';
import { useFetch, useVisible, useForceUpdate } from 'hooks';
import { AuthButton, ItemCol } from 'components';
import { _get } from 'utils';

function OtherDevice() {
  const [visible, _switchVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  // 基本信息详情
  const { data: basicData } = useFetch({
    query: {
      page: 1,
      limit: 10,
    },
    request: _getOtherDeviceInfo,
    depends: [ignore],
  });

  const basicInfoData = _get(basicData, 'rows.0', []);

  return (
    <>
      {visible && (
        <Edit
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            forceUpdate();
          }}
        />
      )}
      <div style={{ height: document.body.clientHeight - 200 }}>
        <AuthButton
          authId="trainingInstitution/otherDevice:btn1"
          type="primary"
          style={{ margin: '0 20px 20px 0' }}
          onClick={_switchVisible}
        >
          编辑
        </AuthButton>

        <Row>
          <ItemCol span={8} label="教室总面积">
            {_get(basicInfoData, 'schoolarea')}
          </ItemCol>
          <ItemCol span={8} label="理论教室面积">
            {_get(basicInfoData, 'thclassroomarea')}
          </ItemCol>
          <ItemCol span={8} label="多媒体教学设备总数">
            {_get(basicInfoData, 'multimediadev')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="多媒体理论教学软件总数">
            {_get(basicInfoData, 'multimediasoft')}
          </ItemCol>
          <ItemCol span={8} label="教学磁板总数">
            {_get(basicInfoData, 'jtmcb')}
          </ItemCol>
          <ItemCol span={8} label="汽车驾驶模拟器总数">
            {_get(basicInfoData, 'carsimulator')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="其他教具和设备总数">
            {_get(basicInfoData, 'otherdev')}
          </ItemCol>
          <ItemCol span={8} label="教练场总面积">
            {_get(basicInfoData, 'placearea')}
          </ItemCol>
          <ItemCol span={8} label="场地驾驶教练场">
            {_get(basicInfoData, 'km2placearea')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="实际道路驾驶教练路线">
            {_get(basicInfoData, 'km3road')}
          </ItemCol>
          <ItemCol span={8} label="停车场面积">
            {_get(basicInfoData, 'carparkplacearea')}
          </ItemCol>
          <ItemCol span={8} label="倒车入库数">
            {_get(basicInfoData, 'dcrknum')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="倒车移位数">
            {_get(basicInfoData, 'dcywnum')}
          </ItemCol>
          <ItemCol span={8} label="侧方停车数">
            {_get(basicInfoData, 'cftcnum')}
          </ItemCol>
          <ItemCol span={8} label="坡道定点停车和起步数">
            {_get(basicInfoData, 'pdddtcnum')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="直角转弯数">
            {_get(basicInfoData, 'zjzwnum')}
          </ItemCol>
          <ItemCol span={8} label="曲线行驶数">
            {_get(basicInfoData, 'qxxsnum')}
          </ItemCol>
          <ItemCol span={8} label="通过连续障碍数">
            {_get(basicInfoData, 'tglxzanum')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="通过单边桥数">
            {_get(basicInfoData, 'tgdbqnum')}
          </ItemCol>
          <ItemCol span={8} label="通过限宽门数">
            {_get(basicInfoData, 'tgxkmnum')}
          </ItemCol>
          <ItemCol span={8} label="起伏路行驶数">
            {_get(basicInfoData, 'qflxslnum')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="窄路掉头数">
            {_get(basicInfoData, 'zldtnum')}
          </ItemCol>
          <ItemCol span={8} label="模拟高速公路数">
            {_get(basicInfoData, 'mngsglnum')}
          </ItemCol>
          <ItemCol span={8} label="模拟连续急弯山区路数">
            {_get(basicInfoData, 'mnlxjzwnum')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="模拟隧道数">
            {_get(basicInfoData, 'mnsdnum')}
          </ItemCol>
          <ItemCol span={8} label="模拟雨（雾）天湿滑路数">
            {_get(basicInfoData, 'mnywtshlsnum')}
          </ItemCol>
          <ItemCol span={8} label="停靠站台数">
            {_get(basicInfoData, 'tkztnum')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="停靠货台数">
            {_get(basicInfoData, 'tkhtnum')}
          </ItemCol>
          <ItemCol span={8} label="计算机数">
            {_get(basicInfoData, 'computernum')}
          </ItemCol>
          <ItemCol span={8} label="教学挂图数">
            {_get(basicInfoData, 'teachpicnum')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="模型教具数">
            {_get(basicInfoData, 'modelnum')}
          </ItemCol>
          <ItemCol span={8} label="医学救护用具数">
            {_get(basicInfoData, 'medicalnum')}
          </ItemCol>
        </Row>
      </div>
    </>
  );
}

export default OtherDevice;
