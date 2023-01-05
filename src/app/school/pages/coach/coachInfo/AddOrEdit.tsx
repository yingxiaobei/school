import { useState, useContext } from 'react';
import GlobalContext from 'globalContext';
import { Modal, Form, Row, Input, Select, message, DatePicker, Button, Space } from 'antd';
import { useFetch, useOptions, useRequest, useVisible } from 'hooks';
import { _getDetails, _addInfo, _updateInfo, _getCarList } from './_api';
import { pick, isEqual, isEmpty } from 'lodash';
import moment from 'moment';
import { Loading, ItemCol, UploadPro, Title, MultipleUpload, Signature, UploadFile } from 'components';
import { RULES } from 'constants/rules';
import { formatTime, readIdCardData, _get, _moment } from 'utils';
import { isForceUpdatePlugin } from 'utils';
import Util from 'utils/Util';
import { UpdatePlugin } from 'components';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useMultipleChoice } from './hooks/useMultipleChoice';
import UploadFileCustomized from 'components/UploadFileCustomized ';

const styles: any = {};
styles.float = 'right';

interface IProps {
  onCancel(): void;
  onOk(): void;
  currentId?: string | null;
  isEdit: boolean;
  title: string;
  isHeNan?: boolean;
  isSupportMultipleChoice?: boolean;
}

const { RangePicker } = DatePicker;

export default function AddOrEdit(props: IProps) {
  const { onCancel, currentId, isEdit, title, onOk, isHeNan = false, isSupportMultipleChoice = false } = props;
  const [form] = Form.useForm();
  const [carOptionData, setCarOptionData] = useState<any>([]);
  const [carid, setCarid] = useState('');

  const { $areaNum, $isForceUpdatePlugin } = useContext(GlobalContext);

  // 教练照片
  const [imageUrl, setImageUrl] = useState();
  const [imgId, setImgId] = useState('');

  // 教练签字
  const [signImgUrl, setSignImgUrl] = useState('');
  const [signImgId, setSignImgId] = useState('');
  const [signVisible, setSignVisible] = useVisible();

  // 机动车驾驶证 正面
  const [driverLicenseImgUrl, setDriverLicenseImgUrl] = useState();
  const [driverLicenseOssId, setDriverLicenseOssId] = useState('');

  // 教练身份证正面
  const [idcardImgUrl, setIdcardImgUrl] = useState();
  const [idcardImgOssId, setIdcardImgOssId] = useState('');

  // 职业资格等级证
  const [careerLicenseImgUrl, setCareerLicenseImgUrl] = useState();
  const [careerLicenseOssId, setCareerLicenseOssId] = useState('');

  // 学历证明
  const [xlzmUrl, setXlzmUrl] = useState();
  const [xlzm, setXlzm] = useState('');

  // 机动车驾驶人安全驾驶记录
  const [jdcjsraqjsjlUrl, setJdcjsraqjsjlUrl] = useState();
  const [jdcjsraqjsjl, setJdcjsraqjsjl] = useState('');

  // 其他资格证
  const [fileList, setFileList] = useState([]);
  const [readCardLoading, setReadCardLoading] = useState(false);

  // 聘用合同
  const [pyhtUrl, setPyhtUrl] = useState();
  const [pyht, setPyht] = useState('');

  // 广东备案新增（非必填）属性 原单位解聘证明ID
  const [dismissalCertificateUrl, setDismissalCertificateUrl] = useState('');
  const [dismissalCertificateId, setDismissalCertificateId] = useState('');

  const [uploadKey, setUploadKey] = useState('0');

  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateInfo : _addInfo, {
    onSuccess: onOk,
  });
  const [timeRange, setTimeRange] = useState<any>([]);
  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: _getDetails,
    callback: (data) => {
      setImageUrl(_get(data, 'coaCoachExtinfoEntity.headImgUrl'));
      setPyhtUrl(_get(data, 'coaCoachExtinfoEntity.pyhtUrl'));
      //  广东监管（解聘证明id）
      setDismissalCertificateUrl(_get(data, 'coaCoachExtinfoEntity.ydwjpzmUrl'));
      setSignImgUrl(_get(data, 'coaCoachExtinfoEntity.signNoteImgUrl'));
      setDriverLicenseImgUrl(_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl'));
      setIdcardImgUrl(_get(data, 'coaCoachExtinfoEntity.idcardImgUrl'));
      setCareerLicenseImgUrl(_get(data, 'coaCoachExtinfoEntity.careerLicenseImgUrl'));
      setFileList(_get(data, 'coaCoachExtinfoEntity.other_license', []));
      setXlzmUrl(_get(data, 'coaCoachExtinfoEntity.xlzmUrl'));
      setJdcjsraqjsjlUrl(_get(data, 'coaCoachExtinfoEntity.jdcjsraqjsjlUrl'));

      setCarid(_get(data, 'carid'));
      setCarOptionData([{ label: _get(data, 'licnum'), value: _get(data, 'carid') }]);
      setUploadKey('1');
      setTimeRange([_moment(_get(data, 'employstartdate', '')), _moment(_get(data, 'employenddate', ''))]);
    },
  });

  const genderOptions = useOptions('gender_type'); // 性别
  const businessScopeOptions = useOptions('trans_car_type'); //经营车型
  const coachTypeOptions = useOptions('coach_type'); // 教练员类型
  const isNotOptions = useOptions('yes_no_type'); // 带教模拟

  const occupationLevelTypeOptions = useOptions('occupation_level_type'); // 职业资格等级

  // 广东后台监管备案非必填选项
  const educationLevelOptions = useOptions('coa_whcd_type'); // 教练员文化程度
  const paraReligiousCategoryOptions = useOptions('coa_zjlx_type'); // 教练员准教类别

  const loading = isLoading || readCardLoading;

  const isRecord = $areaNum === '02'; // 广东

  return (
    <>
      {signVisible && (
        <Signature
          onCancel={setSignVisible}
          onOk={(imgRes) => {
            setSignImgId(_get(imgRes, 'data.id', ''));
            setSignImgUrl(_get(imgRes, 'data.url', ''));
            setSignVisible();
          }}
        />
      )}
      <Modal
        visible
        width={1100}
        title={title}
        maskClosable={false}
        confirmLoading={confirmLoading}
        onCancel={onCancel}
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
                      if ((isHeNan || isRecord) && (!_get(timeRange, '0') || !_get(timeRange, '1'))) {
                        return message.error('聘用日期不能为空');
                      }
                      if (_get(values, 'idcard') !== _get(values, 'idcardVerify')) {
                        message.error('身份证号和号码证号必须相同');
                        return false;
                      }

                      let sex = _get(values, 'idcard')[16] % 2 === 0 ? '2' : '1';
                      if (sex !== String(_get(values, 'sex'))) {
                        message.error('性别与身份证号不符');
                        return false;
                      }
                      if (!isEdit && !imgId) {
                        message.error('请上传照片');
                        return false;
                      }

                      const dateCompare = moment(_get(values, 'leavedate')).isBefore(_get(values, 'hiredate'));

                      if (_get(values, 'leavedate') && dateCompare) {
                        message.error('离职日期大于入职日期');
                        return false;
                      }

                      if (isRecord) {
                        if (!driverLicenseImgUrl) {
                          message.error('请上传机动车驾驶证文件');
                          return false;
                        }

                        if (!idcardImgUrl) {
                          message.error('请上传教练员身份证');
                          return false;
                        }

                        if (!pyhtUrl) {
                          message.error('请上传聘用合同文件');
                          return false;
                        }
                      }

                      const basicQuery = {
                        coachname: _get(values, 'coachname'),
                        sex: _get(values, 'sex'),
                        idcard: _get(values, 'idcard'),
                        mobile: _get(values, 'mobile'),
                        address: _get(values, 'address'),
                        drilicence: _get(values, 'drilicence'),
                        fstdrilicdate: formatTime(_get(values, 'fstdrilicdate'), 'DATE'),
                        dripermitted: isSupportMultipleChoice
                          ? Util.changeArrayToString(_get(values, 'dripermitted'))
                          : _get(values, 'dripermitted'),
                        occupationno: _get(values, 'occupationno'),
                        occupationlevel: _get(values, 'occupationlevel'),
                        teachpermitted: isSupportMultipleChoice
                          ? Util.changeArrayToString(_get(values, 'teachpermitted'))
                          : _get(values, 'teachpermitted'),
                        hiredate: formatTime(_get(values, 'hiredate'), 'DATE'),
                        leavedate: formatTime(_get(values, 'leavedate'), 'DATE'),
                        coachtype: _get(values, 'coachtype'),
                        issimulate: _get(values, 'issimulate'),
                        employstartdate: formatTime(_get(timeRange, '0', ''), 'DATE'),
                        employenddate: formatTime(_get(timeRange, '1', ''), 'DATE'),
                        carid,
                        // 广东监管备案非必填选项
                        jg: _get(values, 'jg'), // 籍贯
                        mz: _get(values, 'mz'), // 民族
                        whcd: _get(values, 'whcd'), // 文化程度
                        zc: _get(values, 'zc'), // 职称
                        lxdzyb: _get(values, 'lxdzyb'), // 联系地址邮编
                        jtdz: _get(values, 'jtdz'), // 家庭地址
                        jtdzyb: _get(values, 'jtdzyb'), // 家庭地址邮编
                        zjlx: _get(values, 'zjlx'), // 准教类型
                        plcpaperDept: _get(values, 'plcpaperDept'), //发证机关
                      };

                      const basicFields = Object.keys(basicQuery);
                      const originData = pick(data, basicFields);
                      const isChange =
                        isEqual(basicQuery, originData) && isEmpty(imgId) && isEmpty(signImgId) ? '0' : '1';

                      const query = {
                        ...basicQuery,
                        headImgUrl: imageUrl,
                        head_img_oss_id: imgId,
                        sign_img_oss_id: signImgId,
                        driver_license_oss_id: driverLicenseOssId,
                        career_license_oss_id: careerLicenseOssId,
                        idcard_img_oss_id: idcardImgOssId,
                        driverLicenseImgUrl: driverLicenseImgUrl,
                        xlzm,
                        xlzmUrl,
                        jdcjsraqjsjl,
                        jdcjsraqjsjlUrl,
                        memo: _get(values, 'memo'),
                        iscoach: 1,
                        other_license: fileList,
                        pyht,
                        ydwjpzm: dismissalCertificateId, // 原单位解聘证明ossId
                      };

                      run(isEdit ? { ...query, cid: currentId, isChange } : query);
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
        {
          <Button
            style={styles}
            loading={readCardLoading}
            onClick={async () => {
              setReadCardLoading(true);
              if ($isForceUpdatePlugin) {
                setReadCardLoading(false);
                return setUpdatePluginVisible();
              }
              const readCardResult = await readIdCardData(form, 'coachname', (data: any, imgData: any) => {
                _get(imgData, 'url') && setImageUrl(_get(imgData, 'url'));
                _get(imgData, 'id') && setImgId(_get(imgData, 'id'));
                setReadCardLoading(false);
              });
              if (isEmpty(readCardResult)) {
                setReadCardLoading(false);
                return setUpdatePluginVisible();
              }
            }}
          >
            读身份证信息
          </Button>
        }
        {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法进行读取身份证信息" />}
        {loading && <Loading />}

        {!loading && (
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              coachname: _get(data, 'coachname'),
              sex: _get(data, 'sex'),
              idcard: _get(data, 'idcard'),
              idcardVerify: _get(data, 'idcard'),
              mobile: _get(data, 'mobile'),
              address: _get(data, 'address'),
              drilicence: _get(data, 'drilicence'),
              fstdrilicdate: _moment(_get(data, 'fstdrilicdate')),
              dripermitted: isSupportMultipleChoice
                ? Util.changeStringToArray(_get(data, 'dripermitted'))
                : _get(data, 'dripermitted'),
              occupationno: _get(data, 'occupationno'),
              occupationlevel: _get(data, 'occupationlevel'),
              teachpermitted: isSupportMultipleChoice
                ? Util.changeStringToArray(_get(data, 'teachpermitted'))
                : _get(data, 'teachpermitted'),
              hiredate: _moment(_get(data, 'hiredate')),
              leavedate: _moment(_get(data, 'leavedate')),
              coachtype: _get(data, 'coachtype'),
              memo: _get(data, 'memo'),
              issimulate: _get(data, 'issimulate'),
              // 广东监管备案 非必填字段
              jg: _get(data, 'jg'), // 籍贯
              mz: _get(data, 'mz'), // 民族
              whcd: _get(data, 'whcd'), // 文化程度
              zc: _get(data, 'zc'), // 职称
              lxdzyb: _get(data, 'lxdzyb'), // 联系地址邮编
              jtdz: _get(data, 'jtdz'), // 家庭地址
              jtdzyb: _get(data, 'jtdzyb'), // 家庭地址邮编
              zjlx: _get(data, 'zjlx'), // 准教类型
              plcpaperDept: _get(data, 'plcpaperDept'), // 发证机关
            }}
          >
            <Title>基本信息</Title>

            <Row>
              <ItemCol label="姓名" name="coachname" rules={[{ whitespace: true, required: true }, RULES.COACH_NAME]}>
                <Input />
              </ItemCol>
              <ItemCol label="性别" name="sex" rules={[{ required: true, message: '请选择性别' }]}>
                <Select options={genderOptions} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol
                label="身份证号"
                name="idcard"
                rules={[{ whitespace: true, required: true, message: '请输入身份证号' }, RULES.ID_CARD]}
              >
                <Input
                  onChange={(e: any) => {
                    if (e.target.value.length === 18) {
                      let value = e.target.value;
                      let sex = value[16] % 2 === 0 ? '2' : '1';
                      form.setFieldsValue({ sex: sex });
                    }
                  }}
                />
              </ItemCol>
              <ItemCol
                label="号码确认"
                name="idcardVerify"
                rules={[{ whitespace: true, required: true, message: '请输入号码确认' }, RULES.ID_CARD]}
              >
                <Input />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol
                label="联系电话"
                name="mobile"
                rules={[{ whitespace: true, required: true, message: '请填写教练真实手机号' }, RULES.TEL_11_COACH]}
              >
                <Input />
              </ItemCol>
              <ItemCol label="地址" name="address" rules={[RULES.HOME_ADDRESS]}>
                <Input />
              </ItemCol>
            </Row>

            {isRecord && (
              <>
                <Row>
                  <ItemCol label="籍贯" name="jg" rules={[RULES.ORIGIN]}>
                    <Input />
                  </ItemCol>
                  <ItemCol label="民族" name="mz" rules={[RULES.ETHNICITY]}>
                    <Input />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol label="文化程度" name="whcd">
                    <Select options={educationLevelOptions} allowClear />
                  </ItemCol>
                  <ItemCol label="职称" name="zc" rules={[RULES.TITLE]}>
                    <Input />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol label="联系地址邮编" name="lxdzyb" rules={[RULES.POSTAL_CODE]}>
                    <Input />
                  </ItemCol>
                  <ItemCol label="家庭地址" name="jtdz" rules={[RULES.HOME_ADDRESS]}>
                    <Input />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol label="家庭地址邮编" name="jtdzyb" rules={[RULES.POSTAL_CODE]}>
                    <Input />
                  </ItemCol>
                  <ItemCol label="准教类型" name="zjlx">
                    <Select options={paraReligiousCategoryOptions} allowClear />
                  </ItemCol>
                </Row>
              </>
            )}

            <Row>
              <ItemCol
                label="驾驶证号"
                name="drilicence"
                rules={[{ whitespace: true, required: true }, RULES.DRIVER_LICENSE]}
              >
                <Input />
              </ItemCol>
              <ItemCol label="初领日期" name="fstdrilicdate" rules={[{ required: true, message: '请选择初领日期' }]}>
                <DatePicker
                  disabledDate={(current: any): any => {
                    return current.diff(moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'days')) > 0;
                  }}
                />
              </ItemCol>
            </Row>

            <Row>
              {/* 准驾车型 多选/单选 */}
              <ItemCol label="准驾车型" name="dripermitted" rules={[{ required: true, message: '请选择准驾车型' }]}>
                <Select options={businessScopeOptions} mode={isSupportMultipleChoice ? 'multiple' : void 0} />
              </ItemCol>
              <ItemCol label="职业资格证/服务证号" name="occupationno" rules={[RULES.PROFESSIONAL_CERT_COACH]}>
                <Input />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="职业资格等级" name="occupationlevel">
                <Select options={occupationLevelTypeOptions} />
              </ItemCol>
              {/* 准教车型 多选/单选*/}
              <ItemCol label="准教车型" name="teachpermitted" rules={[{ required: true, message: '请选择准教车型' }]}>
                <Select options={businessScopeOptions} mode={isSupportMultipleChoice ? 'multiple' : void 0} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="驾驶证发证机关" name="plcpaperDept">
                <Input placeholder="请输入驾驶证发证机关" />
              </ItemCol>
              <ItemCol label="入职日期" name="hiredate" rules={[{ required: true, message: '请选择入职日期' }]}>
                <DatePicker />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="离职日期" name="leavedate">
                <DatePicker />
              </ItemCol>
              <ItemCol label="教练员类型" name="coachtype" rules={[{ required: true }]}>
                <Select options={coachTypeOptions} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="照片" required>
                <UploadPro imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} getLimitSizeFromParam />
              </ItemCol>
              <ItemCol label="带教模拟" name="issimulate">
                <Select options={isNotOptions} />
              </ItemCol>
              <ItemCol label="教练车车牌号">
                <Select
                  options={carOptionData}
                  allowClear={true}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  onChange={(value: any) => {
                    setCarid(value);
                  }}
                  showSearch
                  value={carid}
                  filterOption={false}
                  onClear={() => {
                    const query = { licnum: '' };
                    _getCarList(query).then((res: any) => {
                      setCarOptionData(
                        _get(res, 'data', []).map((item: any) => {
                          return {
                            label: item.text,
                            value: item.value,
                          };
                        }),
                      );
                    });
                  }}
                  onSearch={(value) => {
                    const query = { licnum: value };
                    _getCarList(query).then((res: any) => {
                      setCarOptionData(
                        _get(res, 'data', []).map((item: any) => {
                          return {
                            label: item.text,
                            value: item.value,
                          };
                        }),
                      );
                    });
                  }}
                />
              </ItemCol>
              {(isHeNan || isRecord) && (
                <ItemCol label="聘用日期" required>
                  <RangePicker
                    placeholder={['聘用开始时间', '聘用到期时间']}
                    value={timeRange}
                    allowClear={false}
                    onChange={(dates: any) => {
                      setTimeRange(dates);
                    }}
                  />
                </ItemCol>
              )}
            </Row>

            <Title>其他信息</Title>

            <Row>
              <ItemCol label="备注" name="memo" rules={[RULES.MEMO]}>
                <Input />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol label="机动车驾驶证" required={isRecord}>
                <div className="flex">
                  <div className=" mr20">
                    <UploadFile
                      imageUrl={driverLicenseImgUrl}
                      setImageUrl={setDriverLicenseImgUrl}
                      setImgId={setDriverLicenseOssId}
                      title={'驾驶证'}
                    />
                  </div>
                  {_get(data, 'coaCoachExtinfoEntity.driverLicenseImageupFlag') === '1' &&
                    driverLicenseImgUrl === _get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl') && (
                      <div>
                        <CheckCircleOutlined className="green" />
                      </div>
                    )}
                </div>
              </ItemCol>

              <ItemCol label="教练员身份证" required={isRecord}>
                <UploadFile
                  imageUrl={idcardImgUrl}
                  setImageUrl={setIdcardImgUrl}
                  setImgId={setIdcardImgOssId}
                  title={'身份证'}
                />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol label="教练签字">
                <UploadPro
                  imageUrl={signImgUrl}
                  setImageUrl={setSignImgUrl}
                  setImgId={setSignImgId}
                  getLimitSizeFromParam //上传图片最大尺寸从自定义参数取
                  isPress
                  maxSize={2} //若自定义参数不合法，取maxSize
                />
                <span style={{ cursor: 'pointer' }} className="primary-color" onClick={setSignVisible}>
                  在线签字
                </span>
              </ItemCol>

              <ItemCol label="职业资格等级证">
                <div className="flex">
                  <div className="w100 mr20">
                    <UploadPro
                      imageUrl={careerLicenseImgUrl}
                      setImageUrl={setCareerLicenseImgUrl}
                      setImgId={setCareerLicenseOssId}
                    />
                  </div>
                  {_get(data, 'coaCoachExtinfoEntity.careerLicenseImageupFlag') === '1' &&
                    _get(data, 'coaCoachExtinfoEntity.careerLicenseImgUrl') === careerLicenseImgUrl && (
                      <div className="pt80">
                        <CheckCircleOutlined className="green" />
                      </div>
                    )}
                </div>
              </ItemCol>
              {isRecord && (
                <ItemCol label="聘用合同">
                  <UploadFile imageUrl={pyhtUrl} setImageUrl={setPyhtUrl} setImgId={setPyht} title={'聘用合同'} />
                </ItemCol>
              )}
            </Row>
            <ItemCol label="其它资格证" span={24} labelCol={{ span: 4 }}>
              <div className="flex">
                <div className="mr20">
                  <MultipleUpload limit={10} fileList={fileList} setFileList={setFileList} key={uploadKey} />
                </div>
                {_get(data, 'coaCoachExtinfoEntity.otherLicenseImageupFlag') === '1' &&
                  isEqual(fileList, _get(data, 'coaCoachExtinfoEntity.other_license')) && (
                    <div className="pt80">
                      <CheckCircleOutlined className="green" />
                    </div>
                  )}
              </div>
            </ItemCol>
            {isRecord && (
              <Row>
                <ItemCol
                  label={
                    <>
                      {'原单位解聘'}
                      <br />
                      {'证明ID'}
                    </>
                  }
                >
                  <UploadFileCustomized
                    imageUrl={dismissalCertificateUrl}
                    setImageUrl={setDismissalCertificateUrl}
                    setImgId={setDismissalCertificateId}
                    title={'原单位解聘证明ID'}
                    typeRule={{
                      rule: ['image/jpeg', 'image/png'],
                      message: '仅支持jpg/jpeg/png格式的文件',
                      size: 10,
                    }}
                  />
                </ItemCol>
              </Row>
            )}
            {isRecord && (
              <Row>
                <ItemCol span={12} label="学历证明">
                  <UploadFile
                    imageUrl={xlzmUrl}
                    setImageUrl={setXlzmUrl}
                    setImgId={setXlzm}
                    title={'学历证明'}
                    maxSize={1}
                    fileType={['application/pdf']}
                    messageTip={'请上传pdf类型文件'}
                  />
                  <div style={{ color: '#f00', marginTop: 10 }}>仅支持上传pdf文件，且不能超过1M</div>
                </ItemCol>
                <ItemCol span={12} label={'机动车驾驶人安全驾驶记录'}>
                  <UploadFile
                    imageUrl={jdcjsraqjsjlUrl}
                    setImageUrl={setJdcjsraqjsjlUrl}
                    setImgId={setJdcjsraqjsjl}
                    title={'机动车驾驶人安全驾驶记录'}
                    maxSize={1}
                    fileType={['application/pdf']}
                    messageTip={'请上传pdf类型文件'}
                  />
                  <div style={{ color: '#f00', marginTop: 10 }}>仅支持上传pdf文件，且不能超过1M</div>
                </ItemCol>
              </Row>
            )}
          </Form>
        )}
      </Modal>
    </>
  );
}
