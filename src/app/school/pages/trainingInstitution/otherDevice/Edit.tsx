import { Modal, Form, Row, Input } from 'antd';
import { useFetch, useRequest } from 'hooks';
import { _getOtherDeviceInfo, _addInstitutionAssets, _updateInstitutionAssets } from './_api';
import { _get } from 'utils';
import { Loading, ItemCol } from 'components';
import { RULES } from 'constants/rules';

export default function Edit(props: any) {
  const { onCancel, onOk } = props;
  const [form] = Form.useForm();

  const { data: basicData, isLoading } = useFetch({
    query: {
      page: 1,
      limit: 10,
    },
    request: _getOtherDeviceInfo,
  });

  const basicInfoData = _get(basicData, 'rows.0', []);
  const dataBasic = _get(basicData, 'rows', []);
  const { loading: confirmLoading, run } = useRequest(
    _get(dataBasic, 'length', 0) > 0 ? _updateInstitutionAssets : _addInstitutionAssets,
    {
      onSuccess: onOk,
    },
  );

  return (
    <Modal
      visible
      width={900}
      title={'编辑其他设施设备'}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            // id: Auth._get('schoolId'),
            schoolarea: _get(values, 'schoolarea'),
            thclassroomarea: _get(values, 'thclassroomarea'),
            multimediadev: _get(values, 'multimediadev'),
            multimediasoft: _get(values, 'multimediasoft'),
            jtmcb: _get(values, 'jtmcb'),
            carsimulator: _get(values, 'carsimulator'),
            otherdev: _get(values, 'otherdev'),
            placearea: _get(values, 'placearea'),
            km2placearea: _get(values, 'km2placearea'),
            km3road: _get(values, 'km3road'),
            carparkplacearea: _get(values, 'carparkplacearea'),
            dcrknum: _get(values, 'dcrknum'),
            dcywnum: _get(values, 'dcywnum'),
            cftcnum: _get(values, 'cftcnum'),
            pdddtcnum: _get(values, 'pdddtcnum'),
            zjzwnum: _get(values, 'zjzwnum'),
            qxxsnum: _get(values, 'qxxsnum'),
            tglxzanum: _get(values, 'tglxzanum'),
            tgdbqnum: _get(values, 'tgdbqnum'),
            tgxkmnum: _get(values, 'tgxkmnum'),
            qflxslnum: _get(values, 'qflxslnum'),
            zldtnum: _get(values, 'zldtnum'),
            mngsglnum: _get(values, 'mngsglnum'),
            mnlxjzwnum: _get(values, 'mnlxjzwnum'),
            mnsdnum: _get(values, 'mnsdnum'),
            mnywtshlsnum: _get(values, 'mnywtshlsnum'),
            tkztnum: _get(values, 'tkztnum'),
            tkhtnum: _get(values, 'tkhtnum'),
            computernum: _get(values, 'computernum'),
            teachpicnum: _get(values, 'teachpicnum'),
            modelnum: _get(values, 'modelnum'),
            medicalnum: _get(values, 'medicalnum'),
          };
          run(_get(dataBasic, 'length', 0) > 0 ? { ...query, bosid: _get(basicInfoData, 'bosid') } : query);
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 16 }}
          wrapperCol={{ span: 8 }}
          initialValues={{
            schoolarea: _get(basicInfoData, 'schoolarea'),
            thclassroomarea: _get(basicInfoData, 'thclassroomarea'),
            multimediadev: _get(basicInfoData, 'multimediadev'),
            multimediasoft: _get(basicInfoData, 'multimediasoft'),
            jtmcb: _get(basicInfoData, 'jtmcb'),
            carsimulator: _get(basicInfoData, 'carsimulator'),
            otherdev: _get(basicInfoData, 'otherdev'),
            placearea: _get(basicInfoData, 'placearea'),
            km2placearea: _get(basicInfoData, 'km2placearea'),
            km3road: _get(basicInfoData, 'km3road'),
            carparkplacearea: _get(basicInfoData, 'carparkplacearea'),
            dcrknum: _get(basicInfoData, 'dcrknum'),
            dcywnum: _get(basicInfoData, 'dcywnum'),
            cftcnum: _get(basicInfoData, 'cftcnum'),
            pdddtcnum: _get(basicInfoData, 'pdddtcnum'),
            zjzwnum: _get(basicInfoData, 'zjzwnum'),
            qxxsnum: _get(basicInfoData, 'qxxsnum'),
            tglxzanum: _get(basicInfoData, 'tglxzanum'),
            tgdbqnum: _get(basicInfoData, 'tgdbqnum'),
            tgxkmnum: _get(basicInfoData, 'tgxkmnum'),
            qflxslnum: _get(basicInfoData, 'qflxslnum'),
            zldtnum: _get(basicInfoData, 'zldtnum'),
            mngsglnum: _get(basicInfoData, 'mngsglnum'),
            mnlxjzwnum: _get(basicInfoData, 'mnlxjzwnum'),
            mnsdnum: _get(basicInfoData, 'mnsdnum'),
            mnywtshlsnum: _get(basicInfoData, 'mnywtshlsnum'),
            tkztnum: _get(basicInfoData, 'tkztnum'),
            tkhtnum: _get(basicInfoData, 'tkhtnum'),
            computernum: _get(basicInfoData, 'computernum'),
            teachpicnum: _get(basicInfoData, 'teachpicnum'),
            modelnum: _get(basicInfoData, 'modelnum'),
            medicalnum: _get(basicInfoData, 'medicalnum'),
          }}
        >
          <Row>
            <ItemCol span={8} label="教室总面积" name="schoolarea" rules={[RULES.AREA_SIZE]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="理论教室面积" name="thclassroomarea" rules={[RULES.AREA_SIZE]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="多媒体教学设备总数" name="multimediadev" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="多媒体理论教学软件总数" name="multimediasoft" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="教学磁板总数" name="jtmcb" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="汽车驾驶模拟器总数" name="carsimulator" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="其他教具和设备总数" name="otherdev" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="教练场总面积" name="placearea" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="场地驾驶教练场" name="km2placearea" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="实际道路驾驶教练路线" name="km3road" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="停车场面积" name="carparkplacearea" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="倒车入库数" name="dcrknum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="倒车移位数" name="dcywnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="侧方停车数" name="cftcnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="坡道定点停车和起步数" name="pdddtcnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="直角转弯数" name="zjzwnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="曲线行驶数" name="qxxsnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="通过连续障碍数" name="tglxzanum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="通过单边桥数" name="tgdbqnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="通过限宽门数" name="tgxkmnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="起伏路行驶数" name="qflxslnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="窄路掉头数" name="zldtnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="模拟高速公路数" name="mngsglnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="模拟连续急弯山区路数" name="mnlxjzwnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="模拟隧道数" name="mnsdnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="模拟雨（雾）天湿滑路数" name="mnywtshlsnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="停靠站台数" name="tkztnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="停靠货台数" name="tkhtnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="计算机数" name="computernum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="教学挂图数" name="teachpicnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={8} label="模型教具数" name="modelnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
            <ItemCol span={8} label="医学救护用具数" name="medicalnum" rules={[RULES.TOTAL_NUM]}>
              <Input style={{ width: 100 }} />
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
