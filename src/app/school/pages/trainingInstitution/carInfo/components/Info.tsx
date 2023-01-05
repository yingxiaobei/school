import { useContext } from 'react';
import { Form, Row, Col } from 'antd';
import moment from 'moment';
import { useFetch, useHash, useAuth } from 'hooks';
import { _getCarInfo } from '../_api';
import { Loading, Title, PopoverImg } from 'components';
import { CheckCircleOutlined } from '@ant-design/icons';
import { _get, formatTime } from 'utils';
import GlobalContext from 'globalContext';

export default function Info(props: any) {
  const { isHeNan = false } = props;
  const [form] = Form.useForm();
  const { data, isLoading } = useFetch({
    query: {
      id: props.carid,
    },
    request: _getCarInfo,
  });
  const { $areaNum } = useContext(GlobalContext);

  const IsRecord = $areaNum === '02'; // 广东

  const baseWrapper = { labelCol: { span: 12 }, wrapperCol: { span: 8 } };

  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案
  const platecolorHash = useHash('platecolor_type'); // 车辆颜色
  const carStatus = useHash('car_status_type'); // 车辆状态
  const transCarTypeHash = useHash('trans_car_type'); // 培训车型
  const levelHash = useHash('techlevel_type');
  const obdAuditStatusHash = useHash('obd_audit_status'); // obd审核（插拔）状态
  const carCsysTypeHash = useHash('car_csys_type');
  // 后续的在添加的时候都要加上默认值 因为不是必填的 比如燃料
  const fuelHash = useHash('car_rl_type');
  const transmissionHash = useHash('car_bzbsx_type');
  const iscyzgTypeHash = useHash('iscyzg_type'); // 是否浙里办模式

  const commonHash = {
    1: '是',
    2: '否',
  };

  const isZlb = useAuth('trainingInstitution/carInfo:btn17');

  if (isLoading) {
    return <Loading />;
  }

  const imgShow = (url: string) => {
    if (url) {
      return <img style={{ width: 100, height: 100 }} src={url} alt="" />;
    }
  };

  return (
    <div>
      <Form form={form} {...baseWrapper} autoComplete="off">
        <Title style={{ paddingLeft: '22px' }}>监管信息</Title>

        <Row>
          <Col span={12}>
            <Form.Item label="统一编码">{_get(data, 'carnum')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="备案状态">{registeredExamFlagHash[_get(data, 'registered_flag', 0)]}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="设备编码">{_get(data, 'poscode')}</Form.Item>
          </Col>
          {/* TODO: 12-13 新增枚举 备案失败 */}
          {(_get(data, 'registered_flag', 0) === '3' || _get(data, 'registered_flag', 0) === '5') && (
            <Col span={12}>
              <Form.Item label="原因">{_get(data, 'message', '')}</Form.Item>
            </Col>
          )}
        </Row>

        <Row>
          <Title style={{ paddingLeft: '22px' }}>基本信息</Title>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="培训车型"> {transCarTypeHash[_get(data, 'perdritype', '')]}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车辆状态">{carStatus[_get(data, 'status', '')]}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="车牌号码">{_get(data, 'licnum')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车牌颜色">{platecolorHash[_get(data, 'platecolor')]}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="生产厂家">{_get(data, 'manufacture')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车辆品牌">{_get(data, 'brand')}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="车辆型号">{_get(data, 'model')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车架号">{_get(data, 'franum')}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="发动机号">{_get(data, 'engnum')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="购买日期">{formatTime(_get(data, 'buydate'), 'DATE')}</Form.Item>
          </Col>
        </Row>
        {isHeNan && (
          <Row>
            <Col span={12}>
              <Form.Item label="注册日期">{formatTime(_get(data, 'registerdate'), 'DATE')}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="报废日期">{formatTime(_get(data, 'scrapdate'), 'DATE')}</Form.Item>
            </Col>
          </Row>
        )}
        {isHeNan && (
          <Row>
            <Col span={12}>
              <Form.Item label="审验日期">{formatTime(_get(data, 'verifydate'), 'DATE')}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="技术等级">{levelHash[_get(data, 'techlevel')]}</Form.Item>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={12}>
            <Form.Item label="OBD审核状态">{obdAuditStatusHash[_get(data, 'obdauditstatus', '')]}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="教学车辆证号">{_get(data, 'teachvehno')}</Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="车辆照片">
              <div className="flex">
                <div className="w60 mr20">
                  <PopoverImg src={_get(data, 'car_img_url', '')} imgStyle={{ width: 60, height: 60 }} />
                </div>
                {_get(data, 'certImageupFlag') === '1' && (
                  <div className="pt40">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="道路运输证">
              <div className="flex">
                <div className="w60 mr20">
                  <PopoverImg src={_get(data, 'road_license_img_url', '')} imgStyle={{ width: 60, height: 60 }} />
                </div>
                {_get(data, 'roadLicenseImageupFlag') === '1' && (
                  <div className="pt40">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          {isZlb && (
            <Col span={12}>
              <Form.Item label="是否浙里办模式">{iscyzgTypeHash[_get(data, 'isZlbType', '')]}</Form.Item>
            </Col>
          )}
          {$areaNum === '04' && ( // 海口
            <Col span={12}>
              <Form.Item label="车辆技术等级有效期截止时间">{_get(data, 'jsdjyxq', '')}</Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item label="其他资格证">
              <div className="flex">
                <div className="mr10">
                  {_get(data, 'other_license', []).map((x: any, index: number) => {
                    return (
                      <PopoverImg
                        key={index}
                        src={_get(x, 'url', '')}
                        imgStyle={{ width: 60, height: 60, marginRight: 10 }}
                      />
                    );
                  })}
                </div>
                {_get(data, 'otherLicenseImageupFlag') === '1' && (
                  <div className="pt40">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="新增时间">{_get(data, 'create_date')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="更新时间">{_get(data, 'update_date')}</Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="操作人">{_get(data, 'operator')}</Form.Item>
          </Col>
        </Row>

        {IsRecord && (
          <>
            <Title style={{ paddingLeft: '22px' }}>备案信息补充</Title>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="车身颜色">
                  {carCsysTypeHash[_get(data, 'csys', '')]}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="行驶证登记日期">
                  {formatTime(_get(data, 'xszdjrq'), 'DATE')}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="强制报废日期">
                  {formatTime(_get(data, 'qzbfrq'), 'DATE')}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="座位数">
                  {_get(data, 'zws')}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="吨位数">
                  {_get(data, 'dws')}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="燃料">
                  {fuelHash[_get(data, 'rl')]}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="车长（mm）">
                  {_get(data, 'cc')}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="车宽（mm）">
                  {_get(data, 'ck')}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="车高（mm）">
                  {_get(data, 'cg')}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="标准变速箱">
                  {transmissionHash[_get(data, 'bzbsx')]}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="技术等级">
                  {_get(data, 'jsdj')}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="技术等级有效期">
                  {_get(data, 'jsdjyxq') ? moment(_get(data, 'jsdjyxq')).format('YYYY-MM-DD') : ''}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否道路驾驶教学车辆">
                  {commonHash[_get(data, 'dljsjxcl')]}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否配置副加速踏板">
                  {commonHash[_get(data, 'pzfjstb')]}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否配置副制离合器踏板">
                  {commonHash[_get(data, 'pzlhqtb')]}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否配置副制动踏板">
                  {commonHash[_get(data, 'pzfzdtb')]}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否有教学车辆标识">
                  {commonHash[_get(data, 'jxclbs')]}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否配置副后视镜">
                  {commonHash[_get(data, 'pzfhsj')]}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否配置灭火器">
                  {commonHash[_get(data, 'pzmhq')]}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="是否配置其他安全防护装置">
                  {commonHash[_get(data, 'pzqtaqfhzz')]}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="速度档位个数">
                  {_get(data, 'sddwgs')}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="行驶证扫描件">
                  {imgShow(_get(data, 'xszsmjUrl', ''))}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="技术条件证明扫描件">
                  {imgShow(_get(data, 'jstjzmsmjUrl', ''))}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="车型证明扫描件">
                  {imgShow(_get(data, 'cxzmsmjUrl', ''))}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="购置证明扫描件">
                  {imgShow(_get(data, 'gzzmsmjUrl', ''))}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="出厂合格证或登记证明扫描件">
                  {imgShow(_get(data, 'cchgzhdjzmsmjUrl', ''))}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="计时终端设备安装图">
                  {imgShow(_get(data, 'jszdsbaztUrl', ''))}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item {...baseWrapper} label="其他扫描件ID">
                  {imgShow(_get(data, 'qtsmjUrl', ''))}
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </div>
  );
}
