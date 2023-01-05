import { useState } from 'react';
import { Modal, Form, Row, Input, Select, message, DatePicker, Space } from 'antd';
import { useFetch, useOptions, useRequest, useVisible } from 'hooks';
import { _getDetails, _addInfo, _updateInfo } from './_api';
import { pick, isEqual, isEmpty } from 'lodash';
import { CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Loading, ItemCol, UploadPro, Title, Signature, MultipleUpload, UploadFile } from 'components';
import { RULES } from 'constants/rules';
import { _getCustomParam } from 'api';
import { _get, Auth, _moment } from 'utils';

export default function AddOrEdit(props: any) {
  const { onCancel, currentId, isEdit, title, onOk } = props;
  const [form] = Form.useForm();
  // 教练照片
  const [imageUrl, setImageUrl] = useState();
  const [imgId, setImgId] = useState('');
  const [uploadKey, setUploadKey] = useState('0');
  // 教练签字
  const [signImgUrl, setSignImgUrl] = useState('');
  const [signImgId, setSignImgId] = useState('');
  const [signVisible, setSignVisible] = useVisible();
  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: _getDetails,
    callback: (data) => {
      setImageUrl(_get(data, 'coaCoachExtinfoEntity.headImgUrl'));
      setSignImgUrl(_get(data, 'coaCoachExtinfoEntity.signNoteImgUrl'));

      setDriverLicenseImgUrl(_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl'));
      setIdcardImgUrl(_get(data, 'coaCoachExtinfoEntity.idcardImgUrl'));
      setSecurityLicense(_get(data, 'coaCoachExtinfoEntity.security_license', []));
      setPracticeLicense(_get(data, 'coaCoachExtinfoEntity.practice_license', []));
      setUploadKey('1');
    },
  });

  const genderOptions = useOptions('gender_type');
  const businessScopeOptions = useOptions('trans_car_type');
  const occupationLevelTypeOptions = useOptions('occupation_level_type'); // 职业资格等级

  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateInfo : _addInfo, {
    onSuccess: onOk,
  });

  const { data: paramData } = useFetch({
    request: _getCustomParam, //"是否开启资质上传(0-不开启，1-开启)"
    query: { paramCode: 'is_allow_exam_license_up', schoolId: Auth.get('schoolId') },
  });

  const { data: roleData } = useFetch({
    request: _getCustomParam, // 0：国交 1：至正 2 ：福建
    query: { paramCode: 'jg_request_platform_type', schoolId: Auth.get('schoolId') },
  });

  const authHash = ['0', '2'].includes(_get(roleData, 'paramValue')) && _get(paramData, 'paramValue', '0') === '1';

  // 机动车驾驶证 正面
  const [driverLicenseImgUrl, setDriverLicenseImgUrl] = useState();
  const [driverLicenseOssId, setDriverLicenseOssId] = useState('');

  // 教练身份证正面
  const [idcardImgUrl, setIdcardImgUrl] = useState();
  const [idcardImgOssId, setIdcardImgOssId] = useState('');

  //从业资格证（最多2张）
  const [practiceLicense, setPracticeLicense] = useState([]);
  //安全资格证（最多2张）
  const [securityLicense, setSecurityLicense] = useState([]);

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
        width={900}
        title={title}
        maskClosable={false}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        onOk={() => {
          form.validateFields().then(async (values) => {
            if (_get(values, 'idcard') !== _get(values, 'idcardVerify')) {
              message.error('身份证号和号码确认必须相同');
              return false;
            }
            let sex = _get(values, 'idcard')[16] % 2 === 0 ? '2' : '1';
            if (sex !== _get(values, 'sex')) {
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

            const basicQuery = {
              coachname: _get(values, 'coachname'),
              sex: _get(values, 'sex'),
              idcard: _get(values, 'idcard'),
              mobile: _get(values, 'mobile'),
              address: _get(values, 'address'),
              drilicence: _get(values, 'drilicence'),
              fstdrilicdate: moment(_get(values, 'fstdrilicdate')).format('YYYY-MM-DD'),
              dripermitted: _get(values, 'dripermitted'),
              occupationno: _get(values, 'occupationno'),
              occupationlevel: _get(values, 'occupationlevel'),
              teachpermitted: _get(values, 'teachpermitted'),
              hiredate: moment(_get(values, 'hiredate')).format('YYYY-MM-DD'),
              leavedate: _get(values, 'leavedate') ? moment(_get(values, 'leavedate')).format('YYYY-MM-DD') : '',

              idcardImgUrl: idcardImgUrl,
              idcard_img_oss_id: idcardImgOssId,
              driverLicenseImgUrl: driverLicenseImgUrl,
              driver_license_oss_id: driverLicenseOssId,
              practice_license: practiceLicense,
              security_license: securityLicense,
            };

            const basicFields = Object.keys(basicQuery);
            const originData = pick(data, basicFields);
            const isChange = isEqual(basicQuery, originData) && isEmpty(imgId) && isEmpty(signImgId) ? '0' : '1';

            const query = {
              ...basicQuery,
              headImgUrl: imageUrl,
              head_img_oss_id: imgId,
              sign_img_oss_id: signImgId,
              isexaminer: '1',
            };

            run(isEdit ? { ...query, cid: currentId, isChange } : query);
          });
        }}
      >
        {isLoading && <Loading />}

        {!isLoading && (
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
              fstdrilicdate: _moment(_get(data, 'fstdrilicdate', '')),
              dripermitted: _get(data, 'dripermitted'),
              occupationno: _get(data, 'occupationno'),
              occupationlevel: _get(data, 'occupationlevel'),
              teachpermitted: _get(data, 'teachpermitted'),
              hiredate: _moment(_get(data, 'hiredate', '')),
              leavedate: _moment(_get(data, 'leavedate', '')),
              headImgUrl: _get(data, 'headImgUrl'),
            }}
          >
            <Title>基本信息</Title>

            <Row>
              <ItemCol label="姓名" name="coachname" rules={[{ whitespace: true, required: true }, RULES.COACH_NAME]}>
                <Input />
              </ItemCol>
              <ItemCol label="性别" name="sex" rules={[{ required: true, message: '请选择性别' }]}>
                <Select options={genderOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="身份证号" name="idcard" rules={[{ whitespace: true, required: true }, RULES.ID_CARD]}>
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
                rules={[{ whitespace: true, required: true }, RULES.ID_CARD]}
              >
                <Input />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="联系电话" name="mobile" rules={[{ whitespace: true, required: true }, RULES.TEL_11]}>
                <Input />
              </ItemCol>
              <ItemCol label="地址" name="address" rules={[RULES.ADDRESS]}>
                <Input />
              </ItemCol>
            </Row>

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
                    return current.diff(moment(new Date(), 'days')) > 0;
                  }}
                />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="准驾车型" name="dripermitted" rules={[{ required: true }]}>
                <Select options={businessScopeOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
              </ItemCol>
              <ItemCol label="职业资格证" name="occupationno" rules={[RULES.PROFESSIONAL_CERT_COACH]}>
                <Input />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="职业资格等级" name="occupationlevel">
                <Select
                  options={occupationLevelTypeOptions}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                />
              </ItemCol>
              <ItemCol label="准教车型" name="teachpermitted" rules={[{ required: true, message: '请选择准教车型' }]}>
                <Select options={businessScopeOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="入职日期" name="hiredate" rules={[{ required: true }]}>
                <DatePicker />
              </ItemCol>
              <ItemCol label="离职日期" name="leavedate">
                <DatePicker />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="照片" required>
                <UploadPro imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} getLimitSizeFromParam />
              </ItemCol>
            </Row>

            <Row>
              <Title>其他信息</Title>
            </Row>

            <Row>
              <ItemCol label="考核员签字">
                <UploadPro
                  getLimitSizeFromParam //上传图片最大尺寸从自定义参数取
                  isPress
                  imageUrl={signImgUrl}
                  setImageUrl={setSignImgUrl}
                  setImgId={setSignImgId}
                />
                <span style={{ cursor: 'pointer' }} className="primary-color" onClick={setSignVisible}>
                  在线签字
                </span>
              </ItemCol>
            </Row>

            {authHash ? (
              <>
                <Title>备案信息补充</Title>
                <Row>
                  <ItemCol label="机动车驾驶证">
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
                  <ItemCol label="身份证">
                    <div className="flex">
                      <div className=" mr20">
                        <UploadFile
                          imageUrl={idcardImgUrl}
                          setImageUrl={setIdcardImgUrl}
                          setImgId={setIdcardImgOssId}
                          title={'身份证'}
                        />
                      </div>
                      {_get(data, 'coaCoachExtinfoEntity.idcardImageupFlag') === '1' &&
                        idcardImgUrl === _get(data, 'coaCoachExtinfoEntity.idcardImgUrl') && (
                          <div>
                            <CheckCircleOutlined className="green" />
                          </div>
                        )}
                    </div>
                  </ItemCol>
                  <ItemCol label="考核员从业资格证">
                    <div className="flex">
                      <div className=" mr20">
                        <MultipleUpload
                          limit={2}
                          fileList={practiceLicense}
                          setFileList={setPracticeLicense}
                          key={uploadKey}
                        />
                      </div>
                      {_get(data, 'coaCoachExtinfoEntity.practiceLicenseImageupFlag') === '1' &&
                        isEqual(practiceLicense, _get(data, 'coaCoachExtinfoEntity.practice_license')) && (
                          <div>
                            <CheckCircleOutlined className="green" />
                          </div>
                        )}
                    </div>
                  </ItemCol>
                  <ItemCol label="考核员安全资格证">
                    <div className="flex">
                      <div className=" mr20">
                        <MultipleUpload
                          limit={2}
                          fileList={securityLicense}
                          setFileList={setSecurityLicense}
                          key={uploadKey}
                        />
                      </div>
                      {_get(data, 'coaCoachExtinfoEntity.securityLicenseImageupFlag') === '1' &&
                        isEqual(securityLicense, _get(data, 'coaCoachExtinfoEntity.security_license')) && (
                          <div>
                            <CheckCircleOutlined className="green" />
                          </div>
                        )}
                    </div>
                  </ItemCol>
                </Row>
              </>
            ) : undefined}
          </Form>
        )}
      </Modal>
    </>
  );
}
