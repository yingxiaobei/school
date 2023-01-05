import React, { useContext, useState } from 'react';
import { Loading, Title, VehicleTrajectoryMap } from 'components';
import { Col, Form, Row, Tooltip } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getDetails } from '../_api';
import { _get, GPS } from 'utils';
import GlobalContext from 'globalContext';

interface AreaInfoProps {
  currentId?: string | null;
}

export default function AreaInfo({ currentId }: AreaInfoProps) {
  const [drawPaths, setDrawPaths] = useState<{ lng: string; lat: string }[]>([]);
  const [form] = Form.useForm();
  const { $areaNum } = useContext(GlobalContext);

  const regionJlcdlyTypeHash = useHash('region_jlcdly_type'); // 教练场地来源
  const regionCdlxTypeHash = useHash('region_cdlx_type'); // 场地类型
  const regionLhwlhjTypeHash = useHash('region_lhwlhj_type'); // 良好网络环境

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
    callback: (data: any) => {
      // 将GPS位置转换成BD位置
      const drawPaths = _get(data, 'polygon_gpstype_wgs84')
        .split(';')
        .filter((x: string) => {
          return x && x.indexOf(',') !== -1; //去除空元素
        })
        .map((x: string) => {
          // WGS-84 to GCJ-02
          const WCJ = GPS.gcj_encrypt(Number(x.split(',')[1]), Number(x.split(',')[0]));
          const { lat: gcjLat, lon: gcjLon } = WCJ;

          // GCJ-02 to BD-09
          // const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
          return { lng: gcjLon, lat: gcjLat };
        });

      setDrawPaths(drawPaths);
    },
  });
  const registeredExamFlagHash = useHash('region_registered_type');
  const teachTypeHash = useHash('teach_type');

  const schRegionStateTypeHash = useHash('sch_region_state_type');
  const isRecord = $areaNum === '02'; // 广东

  const COL_ROW = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Form form={form}>
      <Title>监管信息</Title>

      <Row>
        <Col span={8}>
          <Form.Item label="审批状态">{registeredExamFlagHash[_get(data, 'registered_flag', '')]}</Form.Item>
        </Col>
        {/* TODO: 12-13 新增枚举 备案失败 */}
        {(_get(data, 'registered_flag', '') === '3' || _get(data, 'registered_flag', '') === '5') && (
          <Col span={8}>
            <Form.Item label="原因">{_get(data, 'reason')}</Form.Item>
          </Col>
        )}
      </Row>

      <Title>基本信息</Title>

      <Row>
        <Col span={8}>
          <Form.Item label="区域名称">
            <Tooltip title={_get(data, 'name')} placement="topLeft">
              <div className="textEllipsis pointer" style={{ width: 200 }}>
                {_get(data, 'name')}
              </div>
            </Tooltip>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="教学区域状态">{schRegionStateTypeHash[_get(data, 'state', '')]}</Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="面积">{_get(data, 'area')}</Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="培训车型">{_get(data, 'vehicletype')}</Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="可容纳车辆数">{_get(data, 'totalvehnum')}</Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="类型">{teachTypeHash[_get(data, 'type', '')]}</Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="地址">{_get(data, 'address')}</Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="已投放车辆数">{_get(data, 'curvehnum')}</Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="电子围栏"></Form.Item>
        </Col>
      </Row>
      <div style={{ width: 1000, height: 550 }} className="ml20">
        <VehicleTrajectoryMap paths={[drawPaths]} key={Math.random()} />
      </div>

      {isRecord && (
        <>
          <Title>备案信息补充</Title>
          <Row>
            <Col span={12}>
              <Form.Item label="教练场地使用证明或产权证明文件" {...COL_ROW}>
                <div
                  onClick={() => {
                    window.open(_get(data, 'jlcsyzmhcqzmUrl'));
                  }}
                  style={{ color: '#f00' }}
                >
                  教练场地使用证明或产权证明文件
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="教练场地技术条件说明文件" {...COL_ROW}>
                <div
                  onClick={() => {
                    window.open(_get(data, 'jlcjstjsmwjUrl'));
                  }}
                  style={{ color: '#f00' }}
                >
                  教练场地技术条件说明文件
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="教练场地来源" {...COL_ROW}>
                {regionJlcdlyTypeHash[_get(data, 'jlcdly', '')]}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="场地类型" {...COL_ROW}>
                {regionCdlxTypeHash[_get(data, 'cdlx', '')]}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="教练场地使用时间起" {...COL_ROW}>
                {_get(data, 'jlcdzlqssj', '') + _get(data, 'jlcdzljssj') ? '~' : '' + _get(data, 'jlcdzljssj', '')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="训练场地面积（平方米）" {...COL_ROW}>
                {_get(data, 'xlcdmj')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="场地驾驶教练场总面积（平方米）" {...COL_ROW}>
                {_get(data, 'cdjsjlcmj')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="训练道路长度（米）" {...COL_ROW}>
                {_get(data, 'xldlcd')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="驾驶教练场单项行车道宽度（米）" {...COL_ROW}>
                {_get(data, 'jsjlcdxxcdkd')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="良好网络环境（是否具备）" {...COL_ROW}>
                {regionLhwlhjTypeHash[_get(data, 'lhwlhj', '')]}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="邮政编码" {...COL_ROW}>
                {_get(data, 'yzbm')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="驾驶教练场面积（平方米）" {...COL_ROW}>
                {_get(data, 'jsjlcdmj')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="连续障碍数" {...COL_ROW}>
                {_get(data, 'lxzhs')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="单边桥数" {...COL_ROW}>
                {_get(data, 'dbqs')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="直角转弯数" {...COL_ROW}>
                {_get(data, 'zjzws')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="侧方停车数" {...COL_ROW}>
                {_get(data, 'cftcs')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="上坡路定点停车数" {...COL_ROW}>
                {_get(data, 'splddtcs')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="坡道起步停车数" {...COL_ROW}>
                {_get(data, 'pdqbtcs')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="限宽门数" {...COL_ROW}>
                {_get(data, 'xkms')}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item label="百米加减档数" {...COL_ROW}>
                {_get(data, 'bmjjds')}
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </Form>
  );
}
