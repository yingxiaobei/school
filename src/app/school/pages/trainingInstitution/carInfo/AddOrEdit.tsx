import { useState, useContext } from 'react';
import { pick, isEqual, isEmpty } from 'lodash';
import { Modal, Form, Input, Select, DatePicker, Row, message, InputNumber, Button } from 'antd';
import { _addCar, _editCar, _getCarInfo } from './_api';
import { useFetch, useOptions, useRequest } from 'hooks';
import { _getCustomParam } from 'api';
import moment from 'moment';
import { ItemCol, UploadPro, Loading, MultipleUpload, Title } from 'components';
import { RULES } from 'constants/rules';
import { formatTime, _get, Auth } from 'utils';
import { CheckCircleOutlined } from '@ant-design/icons';
import GlobalContext from 'globalContext';

export default function AddOrEdit(props: any) {
  const { onCancel, onOk, currentRecord, isEdit, title, isHeNan = false } = props;
  const { $areaNum } = useContext(GlobalContext);
  const [form] = Form.useForm();
  // 车辆照片
  const [imageUrl, setImageUrl] = useState();
  const [imgId, setImgId] = useState('');

  // 道路运输证
  const [roadImageUrl, setRoadImageUrl] = useState();
  const [RoadImgId, setRoadImgId] = useState('');

  // 其他资格证
  const [fileList, setFileList] = useState([]);
  const [uploadKey, setUploadKey] = useState('0');

  // 行驶证扫描件
  const [xszsmjUrl, setXszsmjUrl] = useState();
  const [xszsmj, setXszsmj] = useState('');

  // 技术条件证明扫描件
  const [jstjzmsmjUrl, setJstjzmsmjUrl] = useState();
  const [jstjzmsmj, setJstjzmsmj] = useState('');

  // 车型证明扫描件
  const [cxzmsmjUrl, setCxzmsmjUrl] = useState();
  const [cxzmsmj, setCxzmsmj] = useState('');

  // 购置证明扫描件
  const [gzzmsmjUrl, setGzzmsmjUrl] = useState();
  const [gzzmsmj, setGzzmsmj] = useState('');

  // 出厂合格证或登记证明扫描件
  const [cchgzhdjzmsmjUrl, setCchgzhdjzmsmjUrl] = useState();
  const [cchgzhdjzmsmj, setCchgzhdjzmsmj] = useState('');

  // 计时终端设备安装图
  const [jszdsbaztUrl, setJszdsbaztUrl] = useState();
  const [jszdsbazt, setJszdsbazt] = useState('');

  // 其他扫描件ID
  const [otherScannedCopiesUrl, setOtherScannedCopiesUrl] = useState('');
  const [otherScannedCopiesId, setOtherScannedCopiesId] = useState('');
  const { data: maxSize } = useFetch({
    request: _getCustomParam, // 0：国交 1：至正 2 ：福建
    query: { paramCode: 'file_limit_size', schoolId: Auth.get('schoolId') },
  });
  const { data, isLoading } = useFetch({
    query: {
      id: _get(currentRecord, 'carid'),
    },
    requiredFields: ['id'],
    request: _getCarInfo,
    callback: (data: any) => {
      setImageUrl(_get(data, 'car_img_url'));
      setRoadImageUrl(_get(data, 'road_license_img_url'));
      const other_license = _get(data, 'other_license', []).map((x: any) => {
        return {
          x: '',
          url: x.url,
        };
      });
      setFileList(other_license);
      setUploadKey('1');
      setXszsmjUrl(_get(data, 'xszsmjUrl'));
      setJstjzmsmjUrl(_get(data, 'jstjzmsmjUrl'));
      setCxzmsmjUrl(_get(data, 'cxzmsmjUrl'));
      setGzzmsmjUrl(_get(data, 'gzzmsmjUrl'));
      setCchgzhdjzmsmjUrl(_get(data, 'cchgzhdjzmsmjUrl'));
      setJszdsbaztUrl(_get(data, 'jszdsbaztUrl'));

      setOtherScannedCopiesUrl(_get(data, 'qtsmjUrl')); // 其他扫描件Id
    },
  });

  const carType = useOptions('business_scope', false, '-1', [], {
    forceUpdate: true,
  });
  const platecolorOption = useOptions('platecolor_type');
  const levelOption = useOptions('techlevel_type');
  const carCsysTypeOption = useOptions('car_csys_type'); // 车身颜色

  // 后续的在添加的时候都要加上默认值 因为不是必填的 比如燃料
  const fuelOption = useOptions('car_rl_type');
  const transmissionOption = useOptions('car_bzbsx_type');

  const commonOptions = [
    // { label: '请选择', value: '' },
    { label: '是', value: '1' },
    { label: '否', value: '2' },
  ];

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editCar : _addCar, {
    onSuccess: onOk,
  });

  const rowSpan = { labelCol: { span: 12 }, wrapperCol: { span: 12 } };
  const showWrapper = { labelCol: { span: 12 }, wrapperCol: { span: 6 } };
  const baseWrapper = { labelCol: { span: 12 }, wrapperCol: { span: 8 } };

  const IsRecord = $areaNum === '02'; // 广东

  const numberChecker = (value: any) => {
    if (value) {
      return value;
    } else {
      return isEdit ? (value === '' || value === 0 ? '0' : value) : value;
    }
  };

  return (
    <Modal
      visible
      width={900}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      footer={
        <>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            <div>
              {$areaNum === '04' && (
                <div style={{ color: '#f00', lineHeight: '36px', fontSize: 16, fontWeight: 'bold' }}>
                  运政数据变更后会导致备案失败，若需要调整请在运政平台修改
                </div>
              )}
            </div>
            <div>
              <Button key="back" onClick={onCancel}>
                取消
              </Button>
              <Button
                key="submit"
                className="ml20"
                loading={confirmLoading}
                type="primary"
                onClick={() => {
                  form.validateFields().then(async (values) => {
                    if (!imageUrl) {
                      message.error('请上传图片');
                      return;
                    }
                    if (IsRecord) {
                      if (!xszsmjUrl) {
                        message.error('请上传行驶证扫描件');
                        return;
                      }
                      if (!jstjzmsmjUrl) {
                        message.error('请上传技术条件证明扫描件');
                        return;
                      }
                      if (!cxzmsmjUrl) {
                        message.error('请上传车型证明扫描件');
                        return;
                      }

                      if (!gzzmsmjUrl) {
                        message.error('请上传购置证明扫描件');
                        return;
                      }

                      if (!cchgzhdjzmsmjUrl) {
                        message.error('请上传出厂合格证或登记证明扫描件');
                        return;
                      }

                      if (!jszdsbaztUrl) {
                        message.error('请上传计时终端设备安装图');
                        return;
                      }
                    }

                    const obj = isHeNan
                      ? {
                          scrapdate: formatTime(_get(values, 'scrapdate'), 'DATE'),
                          registerdate: formatTime(_get(values, 'registerdate'), 'DATE'),
                          verifydate: formatTime(_get(values, 'verifydate'), 'DATE'),
                          techlevel: _get(values, 'techlevel'),
                        }
                      : {};
                    const objBasic = isHeNan
                      ? { scrapdate: undefined, registerdate: undefined, verifydate: undefined, techlevel: undefined }
                      : {};

                    let basicQueryInit = {
                      //如下字段如果有改动，就传ischange=1,否则传0
                      perdritype: _get(values, 'perdritype'),
                      licnum: _get(values, 'licnum'),
                      manufacture: _get(values, 'manufacture'),
                      model: _get(values, 'model'),
                      engnum: _get(values, 'engnum'),
                      platecolor: _get(values, 'platecolor'),
                      brand: _get(values, 'brand'),
                      franum: _get(values, 'franum'),
                      buydate: _get(values, 'buydate') ? moment(_get(values, 'buydate')).format('YYYY-MM-DD') : '',
                      teachvehno: _get(values, 'teachvehno'),
                      ...obj,
                    };

                    const basicQuery = IsRecord
                      ? {
                          ...basicQueryInit,
                          csys: _get(values, 'csys'),
                          xszdjrq: moment(_get(values, 'xszdjrq')).format('YYYY-MM-DD'),
                          qzbfrq: moment(_get(values, 'qzbfrq')).format('YYYY-MM-DD'),
                          //  广东车辆备案补充字段
                          zws: _get(values, 'zws'), // 座位数
                          dws: _get(values, 'dws'), // 吨位数
                          rl: _get(values, 'rl') ? _get(values, 'rl') : '', // 燃料
                          cc: _get(values, 'cc') ? _get(values, 'cc') * 1 : '', // 车长（mm）
                          ck: _get(values, 'ck') ? _get(values, 'ck') * 1 : '', // 车宽（mm）
                          cg: _get(values, 'cg') ? _get(values, 'cg') * 1 : '', // 车高（mm）
                          bzbsx: _get(values, 'bzbsx'), // 标准变速箱
                          jsdj: _get(values, 'jsdj'), // 技术等级
                          jsdjyxq: _get(values, 'jsdjyxq')
                            ? moment(_get(values, 'jsdjyxq')).format('YYYY-MM-DD')
                            : void 0, // 技术等级有效期
                          dljsjxcl: _get(values, 'dljsjxcl', ''), // 是否道路驾驶教学车辆
                          pzfjstb: _get(values, 'pzfjstb', ''), // 是否配置副加速踏板
                          pzlhqtb: _get(values, 'pzlhqtb', ''), // 是否配置副离合器踏板
                          pzfzdtb: _get(values, 'pzfzdtb', ''), // 是否配置副制动踏板
                          pzmhq: _get(values, 'pzmhq', ''), // 是否配置灭火器
                          pzqtaqfhzz: _get(values, 'pzqtaqfhzz', ''), // 是否配置其他安全防护装置
                          jxclbs: _get(values, 'jxclbs', ''), // 是否有教学车辆标识
                          pzfhsj: _get(values, 'pzfhsj', ''), // 是否配置副后视镜
                          sddwgs: numberChecker(_get(values, 'sddwgs')), // 速度档位个数
                        }
                      : basicQueryInit;

                    const basicInit = {
                      perdritype: undefined,
                      licnum: undefined,
                      manufacture: undefined,
                      model: undefined,
                      engnum: undefined,
                      platecolor: undefined,
                      brand: undefined,
                      franum: undefined,
                      buydate: undefined,
                      teachvehno: undefined,

                      ...objBasic,
                    };

                    const basic = IsRecord
                      ? {
                          ...basicInit,
                          csys: undefined,
                          xszdjrq: undefined,
                          qzbfrq: undefined,

                          // 广东车辆备案补充字段
                          zws: undefined, // 座位数
                          dws: undefined, // 吨位数
                          rl: undefined, // 燃料
                          cc: undefined, // 车长（mm）
                          ck: undefined, // 车宽（mm）
                          cg: undefined, // 车高（mm）
                          bzbsx: undefined, // 标准变速箱
                          jsdj: undefined, // 技术等级
                          jsdjyxq: undefined, // 技术等级有效期
                          dljsjxcl: undefined, // 是否道路驾驶教学车辆
                          pzfjstb: undefined, // 是否配置副加速踏板
                          pzlhqtb: undefined, // 是否配置副离合器踏板
                          pzfzdtb: undefined, // 是否配置副制动踏板
                          pzmhq: undefined, // 是否配置灭火器
                          pzqtaqfhzz: undefined, // 是否配置其他安全防护装置
                          jxclbs: undefined, // 是否有教学车辆标识
                          pzfhsj: undefined, // 是否配置副后视镜
                          sddwgs: undefined, // 速度档位个数
                        }
                      : basicInit;
                    const basicFields = Object.keys(basicQuery);
                    const originData = pick(data, basicFields);
                    // 检查备案信息补充图片内容是否更改
                    const imgChange =
                      isEmpty(xszsmj) &&
                      isEmpty(jstjzmsmj) &&
                      isEmpty(cxzmsmj) &&
                      isEmpty(gzzmsmj) &&
                      isEmpty(cchgzhdjzmsmj) &&
                      isEmpty(jszdsbazt) &&
                      isEmpty(otherScannedCopiesId);
                    const isChange =
                      isEqual(basicQuery, { ...basic, ...originData }) && isEmpty(imgId) && imgChange ? '0' : '1';

                    const queryInit = {
                      ...basicQuery,
                      car_img_url: imageUrl,
                      car_img_oss_id: imgId,
                      road_license_img_url: roadImageUrl,
                      road_license_oss_id: RoadImgId,
                      other_license: fileList,
                    };
                    const query = IsRecord
                      ? {
                          ...queryInit,
                          xszsmj,
                          jstjzmsmj,
                          cxzmsmj,
                          gzzmsmj,
                          cchgzhdjzmsmj,
                          jszdsbazt,
                          qtsmj: otherScannedCopiesId,
                        }
                      : queryInit;
                    console.log(values);

                    run(isEdit ? { carid: _get(currentRecord, 'carid'), isChange, ...query } : query);
                  });
                }}
              >
                确定
              </Button>
            </div>
          </div>
        </>
      }
    >
      {isLoading && <Loading />}
      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 12 }}
          initialValues={{
            perdritype: _get(data, 'perdritype'),
            licnum: _get(data, 'licnum'),
            manufacture: _get(data, 'manufacture'),
            model: _get(data, 'model'),
            engnum: _get(data, 'engnum'),
            platecolor: _get(data, 'platecolor'),
            brand: _get(data, 'brand'),
            franum: _get(data, 'franum'),
            buydate: _get(data, 'buydate') ? moment(_get(data, 'buydate')) : '',
            teachvehno: _get(data, 'teachvehno'),
            scrapdate: _get(data, 'scrapdate') ? moment(_get(data, 'scrapdate')) : '',
            registerdate: _get(data, 'registerdate') ? moment(_get(data, 'registerdate')) : '',
            verifydate: _get(data, 'verifydate') ? moment(_get(data, 'verifydate')) : '',
            techlevel: _get(data, 'techlevel'),
            csys: _get(data, 'csys') || '2',
            xszdjrq: _get(data, 'xszdjrq') ? moment(_get(data, 'xszdjrq')) : '',
            qzbfrq: _get(data, 'qzbfrq') ? moment(_get(data, 'qzbfrq')) : '',
            // 广东监管 非必填字段
            zws: _get(data, 'zws'), // 座位数
            dws: _get(data, 'dws'), // 吨位数
            rl: _get(data, 'rl') ? _get(data, 'rl') : null, // 燃料
            cc: _get(data, 'cc'), // 车长（mm）
            ck: _get(data, 'ck'), // 车宽（mm）
            cg: _get(data, 'cg'), // 车高（mm）
            bzbsx: _get(data, 'bzbsx') ? _get(data, 'bzbsx') : null, // 标准变速箱
            jsdj: _get(data, 'jsdj'), // 技术等级
            jsdjyxq: _get(data, 'jsdjyxq') ? moment(_get(data, 'jsdjyxq')) : '', // 技术等级有效期
            dljsjxcl: _get(data, 'dljsjxcl') ? _get(data, 'dljsjxcl') : null, // 是否道路驾驶教学车辆
            pzfjstb: _get(data, 'pzfjstb') ? _get(data, 'pzfjstb') : null, // 是否配置副加速踏板
            pzlhqtb: _get(data, 'pzlhqtb') ? _get(data, 'pzlhqtb') : null, // 是否配置副离合器踏板
            pzfzdtb: _get(data, 'pzfzdtb') ? _get(data, 'pzfzdtb') : null, // 是否配置副制动踏板
            pzmhq: _get(data, 'pzmhq') ? _get(data, 'pzmhq') : null, // 是否配置灭火器
            pzqtaqfhzz: _get(data, 'pzqtaqfhzz') ? _get(data, 'pzqtaqfhzz') : null, // 是否配置其他安全防护装置
            jxclbs: _get(data, 'jxclbs') ? _get(data, 'jxclbs') : null, // 是否有教学车辆标识
            pzfhsj: _get(data, 'pzfhsj') ? _get(data, 'pzfhsj') : null, // 是否配置副后视镜
            sddwgs: _get(data, 'sddwgs'), // 速度档位个数
          }}
        >
          <Title>基本信息</Title>
          <Row>
            <ItemCol label="培训车型" name="perdritype" rules={[{ required: true }]}>
              <Select options={carType} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
            </ItemCol>
            <ItemCol label="教学车辆证号" name="teachvehno" rules={[{ whitespace: true }, RULES.TEACH_NUMBER]}>
              <Input />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="车牌号码" name="licnum" rules={[{ whitespace: true, required: true }, RULES.NUMBER_PLATE]}>
              <Input />
            </ItemCol>
            <ItemCol label="车牌颜色" name="platecolor" rules={[{ required: true }]}>
              <Select options={platecolorOption} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol
              label="生产厂家"
              name="manufacture"
              rules={[{ whitespace: true, required: true }, RULES.MANUFACTURER]}
            >
              <Input />
            </ItemCol>
            <ItemCol label="车辆品牌" name="brand" rules={[{ whitespace: true, required: true }, RULES.VEHICLE_BRAND]}>
              <Input />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="车辆型号" name="model" rules={[{ whitespace: true }, RULES.VEHICLE_MODEL]}>
              <Input />
            </ItemCol>
            <ItemCol
              label="车架号"
              name="franum"
              rules={[{ whitespace: true, required: IsRecord }, RULES.FRAME_NUMBER]}
            >
              <Input />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol
              label="发动机号"
              name="engnum"
              rules={[{ whitespace: true, required: IsRecord }, RULES.ENGIN_NUMBER]}
            >
              <Input />
            </ItemCol>
            {/**海口购买日期非必填 */}
            <ItemCol label="购买日期" name="buydate" rules={$areaNum === '04' ? [] : [{ required: true }]}>
              <DatePicker disabledDate={(current: any) => current.diff(moment(new Date(), 'days')) > 0} />
            </ItemCol>
          </Row>
          {isHeNan && (
            <Row>
              <ItemCol label="注册日期" name="registerdate" rules={[{ required: true }]}>
                <DatePicker disabledDate={(current: any) => current.diff(moment(new Date(), 'days')) > 0} />
              </ItemCol>
              <ItemCol label="报废日期" name="scrapdate" rules={[{ required: true }]}>
                <DatePicker />
              </ItemCol>
            </Row>
          )}
          {isHeNan && (
            <Row>
              <ItemCol label="审验日期" name="verifydate" rules={[{ required: true }]}>
                <DatePicker />
              </ItemCol>
              <ItemCol label="技术等级" name="techlevel" rules={[{ required: true }]}>
                <Select options={levelOption} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
              </ItemCol>
            </Row>
          )}
          <Row>
            <ItemCol label="车辆照片" required>
              <div className="flex">
                <div className="w100 mr20">
                  <UploadPro imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} getLimitSizeFromParam />
                </div>
                {_get(data, 'certImageupFlag') === '1' && (
                  <div className="pt80">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </ItemCol>
            <ItemCol label="道路运输证">
              <div className="flex">
                <div className="w100 mr20">
                  <UploadPro imageUrl={roadImageUrl} setImageUrl={setRoadImageUrl} setImgId={setRoadImgId} />
                </div>
                {_get(data, 'roadLicenseImageupFlag') === '1' && (
                  <div className="pt80">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="其他资格证">
              <div className="flex">
                <div className="mr20">
                  <MultipleUpload limit={2} fileList={fileList} setFileList={setFileList} key={uploadKey} />
                </div>
                {_get(data, 'otherLicenseImageupFlag') === '1' && (
                  <div className="pt80">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </ItemCol>
          </Row>

          {/* 广东监管设置备案增加新属性 */}
          {IsRecord && (
            <>
              <Title>备案信息补充</Title>
              <Row>
                <ItemCol {...baseWrapper} label="车身颜色" name="csys" rules={[{ required: true }]}>
                  <Select
                    className="full-width"
                    options={carCsysTypeOption}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  />
                </ItemCol>
                <ItemCol {...baseWrapper} label="行驶证登记日期" name="xszdjrq" rules={[{ required: true }]}>
                  <DatePicker disabledDate={(current: any) => current.diff(moment(new Date(), 'days')) > 0} />
                </ItemCol>
              </Row>
              <Row>
                <ItemCol {...baseWrapper} label="强制报废日期" name="qzbfrq" rules={[{ required: true }]}>
                  <DatePicker />
                </ItemCol>
                {/* 座位数 */}
                <ItemCol {...baseWrapper} label="座位数" name="zws" rules={[RULES.SEATING_CAPACITY]}>
                  <Input className="full-width" />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="吨位数" name="dws" rules={[RULES.WEIGHT]}>
                  <Input className="full-width" />
                </ItemCol>
                <ItemCol {...baseWrapper} label="燃料" name="rl">
                  <Select options={fuelOption} className="full-width" placeholder="请选择" allowClear />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="车长（mm）" name="cc" rules={[RULES.CAR_CAPTAIN]}>
                  <InputNumber min={0} className="full-width" stringMode precision={2} />
                </ItemCol>
                <ItemCol {...baseWrapper} label="车宽（mm）" name="ck" rules={[RULES.CAR_WIDTH]}>
                  <InputNumber min={0} className="full-width" stringMode precision={2} />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="车高（mm）" name="cg" rules={[RULES.CAR_HEIGHT]}>
                  <InputNumber min={0} className="full-width" stringMode precision={2} />
                </ItemCol>
                <ItemCol {...baseWrapper} label="标准变速箱" name="bzbsx">
                  <Select options={transmissionOption} className="full-width" placeholder="请选择" allowClear />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="技术等级" name="jsdj" rules={[RULES.TECHNICAL_GRADE]}>
                  <Input className="full-width" />
                </ItemCol>
                <ItemCol {...baseWrapper} label="技术等级有效期" name="jsdjyxq">
                  <DatePicker />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="是否道路驾驶教学车辆" name="dljsjxcl">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
                <ItemCol {...baseWrapper} label="是否配置副加速踏板" name="pzfjstb">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="是否配置副制离合器踏板" name="pzlhqtb">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
                <ItemCol {...baseWrapper} label="是否配置副制动踏板" name="pzfzdtb">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="是否有教学车辆标识" name="jxclbs">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
                <ItemCol {...baseWrapper} label="是否配置副后视镜" name="pzfhsj">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...baseWrapper} label="是否配置灭火器" name="pzmhq">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
                <ItemCol {...baseWrapper} label="是否配置其他安全防护装置" name="pzqtaqfhzz">
                  <Select className="full-width" options={commonOptions} placeholder="请选择" allowClear />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol
                  {...baseWrapper}
                  label="速度档位个数"
                  name="sddwgs"
                  rules={[
                    {
                      validator: RULES.SPEED_GEARS,
                    },
                  ]}
                >
                  <InputNumber min={0} className="full-width" />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol {...rowSpan} label="行驶证扫描件" required>
                  <UploadPro
                    imageUrl={xszsmjUrl}
                    setImageUrl={setXszsmjUrl}
                    setImgId={setXszsmj}
                    maxSize={Number(_get(maxSize, 'paramValue', '1024')) / 1024} //m为单位
                    limitApi={'/api/video-face/tmpFile/uploadValid'}
                  />
                </ItemCol>
                <ItemCol {...rowSpan} label="技术条件证明扫描件" required>
                  <UploadPro
                    imageUrl={jstjzmsmjUrl}
                    setImageUrl={setJstjzmsmjUrl}
                    setImgId={setJstjzmsmj}
                    maxSize={Number(_get(maxSize, 'paramValue', '1024')) / 1024}
                    limitApi={'/api/video-face/tmpFile/uploadValid'}
                  />
                </ItemCol>
              </Row>
              <Row>
                <ItemCol {...rowSpan} label="车型证明扫描件" required>
                  <UploadPro
                    imageUrl={cxzmsmjUrl}
                    setImageUrl={setCxzmsmjUrl}
                    setImgId={setCxzmsmj}
                    maxSize={Number(_get(maxSize, 'paramValue', '1024')) / 1024}
                    limitApi={'/api/video-face/tmpFile/uploadValid'}
                  />
                </ItemCol>
                <ItemCol {...rowSpan} label="购置证明扫描件" required>
                  <UploadPro
                    imageUrl={gzzmsmjUrl}
                    setImageUrl={setGzzmsmjUrl}
                    setImgId={setGzzmsmj}
                    maxSize={Number(_get(maxSize, 'paramValue', '1024')) / 1024}
                    limitApi={'/api/video-face/tmpFile/uploadValid'}
                  />
                </ItemCol>
              </Row>
              <Row>
                <ItemCol {...rowSpan} label="出厂合格证或登记证明扫描件" required>
                  <UploadPro
                    imageUrl={cchgzhdjzmsmjUrl}
                    setImageUrl={setCchgzhdjzmsmjUrl}
                    setImgId={setCchgzhdjzmsmj}
                    maxSize={Number(_get(maxSize, 'paramValue')) / 1024}
                    limitApi={'/api/video-face/tmpFile/uploadValid'}
                  />
                </ItemCol>
                <ItemCol {...rowSpan} label="计时终端设备安装图" required>
                  <UploadPro
                    imageUrl={jszdsbaztUrl}
                    setImageUrl={setJszdsbaztUrl}
                    setImgId={setJszdsbazt}
                    maxSize={Number(_get(maxSize, 'paramValue')) / 1024}
                    limitApi={'/api/video-face/tmpFile/uploadValid'}
                  />
                </ItemCol>
              </Row>
              <Row>
                <ItemCol {...rowSpan} label="其他扫描件ID">
                  <UploadPro
                    imageUrl={otherScannedCopiesUrl}
                    setImageUrl={setOtherScannedCopiesUrl}
                    setImgId={setOtherScannedCopiesId}
                    fileTypes={['image/jpeg', 'image/png', 'image/jpg']}
                    maxSize={Number(_get(maxSize, 'paramValue')) / 1024}
                    limitApi={'/api/video-face/tmpFile/uploadValid'}
                  />
                </ItemCol>
              </Row>
            </>
          )}
        </Form>
      )}
    </Modal>
  );
}
