import { useState, useContext } from 'react';
import { Form, Row, Col, Input, Select, Button, message, DatePicker, Drawer, Alert } from 'antd';
import { useFetch, useOptions, useVisible, useRequest } from 'hooks';
import { _getDetails, _addTeachingArea, _updateTeachingArea } from './_api';
import { _getCustomParam } from 'api';
import { Loading, Title, VehicleTrajectoryMap, ItemCol, UploadFile } from 'components';
import { RULES } from 'constants/rules';
import DrawModal from './DrawModal';
import { GPS, _get, Auth, formatTime } from 'utils';
import MapInput from './MapInput';
import moment from 'moment';
import GlobalContext from 'globalContext';

const { RangePicker } = DatePicker;

export default function AddOrEdit(props: any) {
  const { onCancel, currentId, isEdit, title, onOk, currentRecord } = props;
  const isRegister = _get(currentRecord, 'registered_flag') == 2; //是否备案同意启用
  const isDisableEdit = isEdit && isRegister; //编辑并且备案同意启用才禁用
  const [form] = Form.useForm();
  const [visible, _switchVisible] = useVisible();
  const [drawPaths, setDrawPaths] = useState([]);
  const [center, setCenter] = useState(undefined);
  const [address, setAddress] = useState('');
  const [timeRange, setTimeRange] = useState<any>([]);
  const [jlcsyzmhcqzmUrl, setJlcsyzmhcqzmUrl] = useState();
  const [jlcsyzmhcqzm, setJlcsyzmhcqzm] = useState('');
  const { $areaNum } = useContext(GlobalContext);
  const [originData, setOriginData] = useState({
    polygon_gpstype_wgs84: '',
    polygon_maptype_bd09: '',
  });
  const [isEditArea, setIsEditArea] = useState(false);

  // 教练场地技术条件说明文件
  const [jlcjstjsmwjUrl, setjlcjstjsmwjUrl] = useState();
  const [jlcjstjsmwj, setJlcjstjsmwj] = useState('');

  const { data: drawPathsData = {} } = useFetch({
    request: _getCustomParam, // 是否支持200个教学区域和单个围栏300个坐标点（0：否，1：是），默认0
    query: { paramCode: 'is_support_200_region_300_point', schoolId: Auth.get('schoolId') },
  });
  const isSupport300Point = _get(drawPathsData, 'paramValue', '0') === '1';
  console.log(drawPaths, center);
  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: _getDetails,
    callback: (data: any) => {
      setOriginData({
        polygon_gpstype_wgs84: _get(data, 'polygon_gpstype_wgs84'),
        polygon_maptype_bd09: _get(data, 'polygon_maptype_bd09'),
      });
      // 将GPS位置转换成BD位置
      const drawPaths = _get(data, 'polygon_gpstype_wgs84')
        .split(';')
        .filter((x: any) => {
          return x && x.indexOf(',') !== -1; //去除空元素
        })
        .map((x: any) => {
          // WGS-84 to GCJ-02
          const WCJ = GPS.gcj_encrypt(Number(x.split(',')[1]), Number(x.split(',')[0]));
          const { lat: gcjLat, lon: gcjLon } = WCJ;
          return { lat: gcjLat, lng: gcjLon };
          // GCJ-02 to BD-09
          const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
          return { lng: WGS.lon, lat: WGS.lat };
        });
      setDrawPaths(drawPaths);
      // setCenter(_get(drawPaths, '0'));
      setAddress(_get(data, 'address'));
      setTimeRange([
        _get(data, 'jlcdzlqssj') ? moment(_get(data, 'jlcdzlqssj')) : '',
        _get(data, 'jlcdzljssj') ? moment(_get(data, 'jlcdzljssj')) : '',
      ]);
      setJlcsyzmhcqzmUrl(_get(data, 'jlcsyzmhcqzmUrl', ''));
      setjlcjstjsmwjUrl(_get(data, 'jlcjstjsmwjUrl', ''));
    },
  });

  const teachTypeOptions = useOptions('teach_type'); // 教学区域类型
  const businessScopeOptions = useOptions('business_scope', false, '-1', [], {
    forceUpdate: true,
  }); // 经营车型
  const regionJlcdlyTypeOptions = useOptions('region_jlcdly_type'); // 教练场地来源
  const regionCdlxTypeOptions = useOptions('region_cdlx_type'); // 场地类型
  const regionLhwlhjTypeOptions = useOptions('region_lhwlhj_type'); // 良好网络环境

  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateTeachingArea : _addTeachingArea, {
    onSuccess: onOk,
  });

  const isRecord = $areaNum === '02'; // 广东

  const rowSpan = { labelCol: { span: 12 }, wrapperCol: { span: 12 } };

  const numberChecker = (value: any) => {
    if (value) {
      return value;
    } else {
      return isEdit ? (value === '' || value === 0 ? '0' : value) : value;
    }
  };

  return (
    <>
      <Drawer
        visible
        // confirmLoading={confirmLoading}
        width={1100}
        bodyStyle={{ maxHeight: 800 }}
        title={
          isDisableEdit ? (
            <div className="flex">
              <span style={{ alignSelf: 'center' }}>{title}</span>
              <Alert
                type="warning"
                showIcon
                className="ml20"
                message={'与设备训练相关的字段不允许修改，若要修改，请新增场地重新备案并发版。'}
              />
            </div>
          ) : (
            title
          )
        }
        maskClosable={false}
        onClose={onCancel}
        footer={
          <Row justify="end">
            <Button onClick={onCancel}>取消</Button>
            <Button
              className="ml20"
              loading={confirmLoading}
              type="primary"
              onClick={() => {
                form.validateFields().then(async (values) => {
                  if (drawPaths.length === 0) {
                    message.error('电子围栏不能为空');
                    return;
                  }

                  if (isRecord) {
                    if (!_get(timeRange, '0') || !_get(timeRange, '1')) {
                      return message.error('教练场地使用时间不能为空');
                    }
                    if (!jlcsyzmhcqzmUrl) {
                      message.error('请上传教练场地使用证明或产权证明文件');
                      return;
                    }
                    if (!jlcjstjsmwjUrl) {
                      message.error('请上传教练场地技术条件说明文件');
                      return;
                    }
                  }

                  if (drawPaths.length > 30 && !isSupport300Point) {
                    message.error('电子围栏坐标点超过30');
                    return;
                  }
                  if (drawPaths.length > 300 && isSupport300Point) {
                    message.error('电子围栏坐标点超过300');
                    return;
                  }

                  if (!RULES.TEACH_AREA_ADDRESS.pattern.test(address.trim())) {
                    message.error('地址需在40字符以内');
                    return;
                  }

                  const baseQuery = {
                    name: _get(values, 'name'), // 区域名称
                    curvehnum: _get(values, 'curvehnum'), //  已投放车辆数
                    area: _get(values, 'area'), // 面积
                    type: _get(values, 'type'), // 类型
                    vehicletype: _get(values, 'vehicletype').join(), // 培训车型
                    totalvehnum: _get(values, 'totalvehnum'), // 可容纳车辆数
                    address, // 地址
                    polygon_gpstype_wgs84:
                      isEditArea || !isEdit
                        ? drawPaths
                            .map((x: any) => {
                              // BD-09 to GCJ-02
                              // const GCJ = GPS.bd_decrypt(x.lat, x.lng);
                              // const { lat: gcjLat, lon: gcjLon } = GCJ;
                              // GCJ-02 to WGS-84
                              const WGS = GPS.gcj_decrypt(x.lat, x.lng);
                              const { lat, lon: lng } = WGS;
                              return `${Number(lng)},${Number(lat)}`;
                            })
                            .join(';')
                        : originData.polygon_gpstype_wgs84,
                    polygon_maptype_bd09:
                      isEditArea || !isEdit
                        ? drawPaths.map((x: any) => `${Number(x.lng)},${Number(x.lat)}`).join(';')
                        : originData.polygon_maptype_bd09,
                  };

                  const query = isRecord
                    ? {
                        ...baseQuery,
                        jlcsyzmhcqzm, // 教练场地使用证明或产权证明文件
                        jlcjstjsmwj, // 教练场地技术条件说明文件
                        jlcdly: _get(values, 'jlcdly'), // 教练场地来源
                        cdlx: _get(values, 'cdlx'), // 场地类型
                        jlcdzlqssj: formatTime(_get(timeRange, '0', ''), 'DATE'), // 教练场地使用时间起
                        jlcdzljssj: formatTime(_get(timeRange, '1', ''), 'DATE'), // 教练场地使用时间止
                        xlcdmj: _get(values, 'xlcdmj'), // 训练场地面积（平方米）
                        cdjsjlcmj: _get(values, 'cdjsjlcmj'), // 场地驾驶教练场总面积（平方米）
                        xldlcd: _get(values, 'xldlcd'), // 训练道路长度（米）
                        jsjlcdxxcdkd: _get(values, 'jsjlcdxxcdkd'), // 驾驶教练场单项行车道宽度（米）
                        lhwlhj: _get(values, 'lhwlhj'), // 良好网络环境（是否具备）
                        // 广东监管备案非必填选项
                        yzbm: _get(values, 'yzbm'), // 邮政编码
                        jsjlcdmj: _get(values, 'jsjlcdmj'), // 驾驶教练场面积（平方米）
                        lxzhs: numberChecker(_get(values, 'lxzhs')), // 连续障碍数
                        dbqs: numberChecker(_get(values, 'dbqs')), // 单边桥数
                        zjzws: numberChecker(_get(values, 'zjzws')), // 直角转弯数
                        cftcs: numberChecker(_get(values, 'cftcs')), // 侧方停车数
                        splddtcs: numberChecker(_get(values, 'splddtcs')), // 上坡路定点停车数
                        pdqbtcs: numberChecker(_get(values, 'pdqbtcs')), // 坡道起步停车数
                        xkms: numberChecker(_get(values, 'xkms')), // 限宽门数
                        bmjjds: numberChecker(_get(values, 'bmjjds')), // 百米加减档数
                      }
                    : baseQuery;

                  run(isEdit ? { ...query, rid: currentId } : query);
                });
              }}
            >
              确定
            </Button>
          </Row>
        }
      >
        {isLoading && <Loading />}

        {!isLoading && (
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{
              name: _get(data, 'name'),
              curvehnum: _get(data, 'curvehnum'),
              area: _get(data, 'area'),
              type: _get(data, 'type'),
              vehicletype: _get(data, 'vehicletype') ? _get(data, 'vehicletype', '').split(',') : [],
              totalvehnum: _get(data, 'totalvehnum'),
              address: _get(data, 'address'),
              jlcdly: _get(data, 'jlcdly'),
              cdlx: _get(data, 'cdlx'),
              xlcdmj: _get(data, 'xlcdmj'),
              cdjsjlcmj: _get(data, 'cdjsjlcmj'),
              xldlcd: _get(data, 'xldlcd'),
              jsjlcdxxcdkd: _get(data, 'jsjlcdxxcdkd'),
              lhwlhj: _get(data, 'lhwlhj'),
              // 广东备案非必填选项
              yzbm: _get(data, 'yzbm'), // 邮政编码
              jsjlcdmj: _get(data, 'jsjlcdmj'), // 驾驶教练场面积（平方米）
              lxzhs: _get(data, 'lxzhs'), // 连续障碍数
              dbqs: _get(data, 'dbqs'), // 单边桥数
              zjzws: _get(data, 'zjzws'), // 直角转弯数
              cftcs: _get(data, 'cftcs'), // 侧方停车数
              splddtcs: _get(data, 'splddtcs'), // 上坡路定点停车数
              pdqbtcs: _get(data, 'pdqbtcs'), // 坡道起步停车数
              xkms: _get(data, 'xkms'), // 限宽门数
              bmjjds: _get(data, 'bmjjds'), // 百米加减档数
            }}
          >
            <Title>基本信息</Title>

            <Row>
              <Col span={12}>
                <Form.Item
                  label="区域名称"
                  name="name"
                  rules={[{ whitespace: true, required: true }, RULES.TEACH_AREA_NAME]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="已投放车辆数"
                  name="curvehnum"
                  rules={[
                    {
                      validator: RULES.TEACH_AREA_CAR_NUM,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="面积"
                  name="area"
                  rules={[
                    { whitespace: true, required: true },
                    {
                      validator: RULES.TEACH_AREA_AREA,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="类型" name="type" rules={[{ required: true }]}>
                  <Select
                    options={teachTypeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isDisableEdit}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="培训车型" name="vehicletype" rules={[{ required: true }]}>
                  <Select
                    options={businessScopeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    mode="multiple"
                    disabled={isDisableEdit}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="可容纳车辆数"
                  name="totalvehnum"
                  rules={[
                    {
                      validator: RULES.TEACH_AREA_CAR_NUM,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item required labelCol={{ span: 3 }} label="地址">
                  <MapInput
                    callback={(point: any) => {
                      // 清空路径 覆盖物
                      setDrawPaths([]);
                      setCenter(point);
                    }}
                    value={address}
                    setValue={setAddress}
                    disabled={isDisableEdit}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ height: 500 }}>
              <Col span={3} style={{ textAlign: 'right' }}>
                电子围栏:
              </Col>
              <Col span={18}>
                <VehicleTrajectoryMap paths={[drawPaths]} center={center} key={drawPaths.toString() + center} />
              </Col>
              <Col span={3}>
                {!isDisableEdit && (
                  <Button className="ml20" onClick={_switchVisible}>
                    编辑
                  </Button>
                )}
              </Col>
            </Row>

            {isRecord && (
              <>
                <Title>备案信息补充</Title>
                <Row>
                  <ItemCol {...rowSpan} label="教练场地使用证明或产权证明文件" required>
                    <UploadFile
                      imageUrl={jlcsyzmhcqzmUrl}
                      setImageUrl={setJlcsyzmhcqzmUrl}
                      setImgId={setJlcsyzmhcqzm}
                      title="教练场地使用证明或产权证明文件"
                    />
                  </ItemCol>
                  <ItemCol {...rowSpan} label="教练场地技术条件说明文件" required>
                    <UploadFile
                      imageUrl={jlcjstjsmwjUrl}
                      setImageUrl={setjlcjstjsmwjUrl}
                      setImgId={setJlcjstjsmwj}
                      title="教练场地技术条件说明文件"
                    />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol {...rowSpan} label="教练场地来源" name="jlcdly" rules={[{ required: true }]}>
                    <Select
                      style={{ width: 180 }}
                      options={regionJlcdlyTypeOptions}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    />
                  </ItemCol>
                  <ItemCol {...rowSpan} label="场地类型" name="cdlx" rules={[{ required: true }]}>
                    <Select
                      style={{ width: 180 }}
                      options={regionCdlxTypeOptions}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol {...rowSpan} label="教练场地使用时间起止" required>
                    <RangePicker
                      placeholder={['使用时间起', '使用时间止']}
                      value={timeRange}
                      allowClear={false}
                      onChange={(dates: any) => {
                        setTimeRange(dates);
                      }}
                    />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    {...rowSpan}
                    label="训练场地面积（平方米）"
                    name="xlcdmj"
                    rules={[
                      { required: true },
                      {
                        validator: RULES.TEACH_AREA_AREA,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                  <ItemCol
                    {...rowSpan}
                    label="场地驾驶教练场总面积（平方米）"
                    name="cdjsjlcmj"
                    rules={[
                      { required: true },
                      {
                        validator: RULES.TEACH_AREA_AREA,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    {...rowSpan}
                    label="训练道路长度（米）"
                    name="xldlcd"
                    rules={[
                      { required: true },
                      {
                        validator: RULES.TEACH_AREA_AREA,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                  <ItemCol
                    {...rowSpan}
                    label="驾驶教练场单项行车道宽度（米）"
                    name="jsjlcdxxcdkd"
                    rules={[
                      { required: true },
                      {
                        validator: RULES.TEACH_AREA_AREA,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol {...rowSpan} label="良好网络环境（是否具备）" name="lhwlhj" rules={[{ required: true }]}>
                    <Select
                      style={{ width: 180 }}
                      options={regionLhwlhjTypeOptions}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    />
                  </ItemCol>
                  <ItemCol {...rowSpan} label="邮政编码" name="yzbm" rules={[RULES.POSTAL_CODE]}>
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    {...rowSpan}
                    label="驾驶教练场面积（平方米）"
                    name="jsjlcdmj"
                    rules={[
                      {
                        validator: RULES.TEACH_AREA_AREA,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                  <ItemCol
                    {...rowSpan}
                    label="连续障碍数"
                    name="lxzhs"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    {...rowSpan}
                    label="单边桥数"
                    name="dbqs"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                  <ItemCol
                    {...rowSpan}
                    label="直角转弯数"
                    name="zjzws"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    {...rowSpan}
                    label="侧方停车数"
                    name="cftcs"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                  <ItemCol
                    {...rowSpan}
                    label="上坡路定点停车数"
                    name="splddtcs"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    {...rowSpan}
                    label="坡道起步停车数"
                    name="pdqbtcs"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                  <ItemCol
                    {...rowSpan}
                    label="限宽门数"
                    name="xkms"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    {...rowSpan}
                    label="百米加减档数"
                    name="bmjjds"
                    rules={[
                      {
                        validator: RULES.NUMBER_COUNT,
                      },
                    ]}
                  >
                    <Input style={{ width: 180 }} />
                  </ItemCol>
                </Row>
              </>
            )}
          </Form>
        )}
      </Drawer>

      {visible && (
        <DrawModal
          drawPaths={drawPaths}
          isSupport300Point={isSupport300Point}
          setDrawPaths={setDrawPaths}
          center={center}
          onCancel={_switchVisible}
          isEditArea={isEditArea}
          setIsEditArea={setIsEditArea}
        />
      )}
    </>
  );
}
