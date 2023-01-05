import { useState, useContext, useMemo } from 'react';
import { Form, Row } from 'antd';
import { useFetch, useHash, useVisible, useAuth } from 'hooks';
import { _getDetails, _getJGRequestPlatformType, _getTrainType, InputRule } from '../_api';
import { Auth, formatTime, _get } from 'utils';
import { Title, ItemCol, PopoverImg, AuthWrapper, Loading, IF } from 'components';
import ClassInfo from '../ClassInfo';
import CoachDetails from '../../../coach/coachInfo/Details';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import GlobalContext from 'globalContext';

interface StudentDetailProps {
  type: string;
  isTheory: boolean;
  practicalSchoolId?: string;
  sid: string;
  setShowSyncBtn: (isShow: boolean) => void;
  autoInput: InputRule[];
  hashStore: Record<string, { [key: string]: string }>;
  customSchoolId?: any;
}

export default function StudentDetails(props: StudentDetailProps) {
  const { isTheory = false, practicalSchoolId, sid, setShowSyncBtn, autoInput = [], hashStore = {}, type } = props;
  const customSchoolId = isTheory
    ? practicalSchoolId
    : props.customSchoolId
    ? props.customSchoolId
    : Auth.get('schoolId');

  const [form] = Form.useForm();
  const [visible, _switchVisible] = useVisible();
  const [detailsVisible, _setDetailsVisible] = useVisible();
  const [train_price_online, setTrain_price_online] = useState(0);

  const { $areaNum } = useContext(GlobalContext);

  const { data, isLoading } = useFetch({
    query: {
      id: sid,
    } as any,
    customHeader: { customSchoolId },
    request: _getDetails,
    callback: (data: any) => {
      setTrain_price_online(_get(data, 'train_price', 0));
      setShowSyncBtn(_get(data, 'registered_NationalFlag') !== '0');
    },
  });

  const IS_NOT: any = {
    '1': '是',
    '0': '否',
  };

  // 监管地址配置0：国交 1：至正
  const { data: jGRequestPlatformType, isLoading: jgLoading } = useFetch({
    request: _getJGRequestPlatformType,
    query: {},
    customHeader: {
      customSchoolId,
    },
  });

  // 学员卡状态
  const bind_card_typeHash = useHash('bind_card_type');

  // 开户状态
  const stuBankaccountflagTypeHash = useHash('stu_bankaccountflag_type');

  const isZlb = useAuth('student/studentInfo:btn34'); // 是否浙里办

  const genderHash = useHash('gender_type'); // 性别
  const cardTypeHash = useHash('gd_card_type'); // 身份证号

  const busitypeHash = useHash('businessType'); // 业务类型
  const recordStatusTypeHash = useHash('stu_record_status_type'); // 备案状态
  const registeredNationalFlagHash = useHash('registered_national_flag'); // 统一编码
  const nationalityTypeHash = useHash('nationality_type'); // 国籍
  const studentTypeHash = useHash('student_type'); // 学员类型
  const iscyzgTypeHash = useHash('iscyzg_type'); // 是否浙里办模式

  // 12-1 镇江学员报名是新增录入字段用于结业审核
  const educationHash = useHash('stu_education_type'); // 学历
  const nationalHash = useHash('stu_nationalReconciliation_type'); // 民族
  const healthStatusHash = useHash('stu_healthState_type'); // 健康状况

  // 12-8 镇江学员信息补充
  const driverLicenseValidityHash = useHash('stu_drivliceperiod_type'); // 驾照的有效期

  const studentSourceHash = useHash('stu_data_source');
  const [isShow, setIsShow] = useState(false);
  const { isLoading: trainTypeLoading } = useFetch<any>({
    request: _getTrainType,
    depends: [_get(data, 'traintype')],
    requiredFields: ['traintype'],
    query: {
      traintype: _get(data, 'traintype'),
    },
    callback(data) {
      // setIsShow(false);
      data.forEach((x: any) => {
        if (x.value === '11' || x.value === '12') {
          setIsShow(true);
        }
      });
    },
  });

  const autoInputItem = useMemo(() => {
    return autoInput && autoInput.length ? (
      autoInput
        .filter((item) => item.detailStatus === '1')
        .map((item) => {
          if (item.queryType === '2') {
            return (
              <ItemCol key={_get(item, 'id')} label={item.nameValue} span={8}>
                {_get(hashStore[`-1${item.codeType}`], _get(data, item.name, ''), '')}
              </ItemCol>
            );
          } else {
            return (
              <ItemCol key={_get(item, 'id')} label={item.nameValue} span={8}>
                {_get(data, item.name, '')}
              </ItemCol>
            );
          }
        })
    ) : (
      <></>
    );
  }, [autoInput, data, hashStore]);

  return (
    <>
      {visible && <ClassInfo onCancel={_switchVisible} sid={sid} customSchoolId={customSchoolId} />}

      <CoachDetails
        visible={detailsVisible}
        onCancel={_setDetailsVisible}
        currentId={_get(data, 'cid')}
        customSchoolId={customSchoolId}
      />
      <IF
        condition={isLoading || jgLoading || trainTypeLoading}
        then={<Loading />}
        else={
          <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
            <Title>备案信息</Title>

            <Row>
              {/* 已获取统一编码，显示具体编码信息，未获取显示未获取 ，‘0’表示‘未获取’*/}
              <ItemCol span={8} label="统一编码">
                {_get(data, 'registered_NationalFlag') !== '0'
                  ? _get(data, 'stunum', '')
                  : registeredNationalFlagHash[_get(data, 'registered_NationalFlag', '')]}
              </ItemCol>
              <ItemCol span={8} label="备案状态">
                {recordStatusTypeHash[_get(data, 'registered_Flag', '')]}
              </ItemCol>
              {/* 备案状态为备案失败的时候，才显示备案失败原因，其他状态不显示失败原因字段 ‘2’表示为‘备案失败’*/}
              {_get(data, 'registered_Flag') === '2' && (
                <ItemCol span={8} label="备案失败原因">
                  {_get(data, 'message', '')}
                </ItemCol>
              )}
              <ItemCol span={8} label="所属驾校">
                {_get(data, 'schoolname', '')}
              </ItemCol>
            </Row>

            <Title>基本信息</Title>

            <Row>
              <ItemCol span={8} label="姓名">
                {_get(data, 'name')}
              </ItemCol>

              <ItemCol span={8} label="性别">
                {genderHash[_get(data, 'sex', 0)]}
              </ItemCol>

              <ItemCol span={8} label="证件类型">
                {cardTypeHash[_get(data, 'cardtype', 1)]}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="证件号">
                {_get(data, 'idcard')}
              </ItemCol>
              <ItemCol span={8} label="出生日期">
                {formatTime(_get(data, 'birthday'), 'DATE')}
              </ItemCol>
              <ItemCol span={8} label="国籍">
                {nationalityTypeHash[_get(data, 'nationality', '')]}
              </ItemCol>
              <ItemCol span={8} label="联系电话">
                {_get(data, 'phone')}
              </ItemCol>

              <ItemCol span={8} label="地址">
                {_get(data, 'address')}
              </ItemCol>

              <ItemCol span={8} label="照片">
                <PopoverImg src={_get(data, 'headImgVO.head_img_url_show', '')} imgStyle={{ width: 60, height: 60 }} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="业务类型">
                {busitypeHash[_get(data, 'busitype', '')]}
              </ItemCol>
              <ItemCol span={8} label="培训车型">
                {_get(data, 'traintype')}
              </ItemCol>
              <ItemCol span={8} label="报名日期">
                {formatTime(_get(data, 'applydate'), 'DATE')}
              </ItemCol>
            </Row>
            {(String(_get(data, 'busitype', 9)) === '1' ||
              String(_get(data, 'busitype', 9)) === '11' ||
              String(_get(data, 'busitype', 9)) === '12') && ( //增领才 显示
              <Row>
                <ItemCol span={8} label="初领日期">
                  {formatTime(_get(data, 'fstdrilicdate'), 'DATE')}
                </ItemCol>
                <ItemCol span={8} label="驾驶证号">
                  {_get(data, 'drilicnum')}
                </ItemCol>
                <ItemCol span={8} label="原准驾车型">
                  {_get(data, 'perdritype')}
                </ItemCol>
              </Row>
            )}

            <Row>
              <ItemCol span={8} label="学员类型">
                {studentTypeHash[_get(data, 'studenttype')]}
              </ItemCol>
              {(_get(data, 'stutransareatype', '') === '1' ||
                _get(data, 'stutransareatype', '') === '2' ||
                _get(data, 'stutransareatype', '') === '3') && (
                <ItemCol span={16} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="转出驾校省市">
                  {_get(data, 'outProvinceName', '') + _get(data, 'outCityName', '')}
                </ItemCol>
              )}
            </Row>
            {/*
        <Row>
          <ItemCol span={8} label="是否外地转入">
            {IS_NOT[_get(data, 'isotherprovince', '')]}
          </ItemCol>
          <ItemCol span={16} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="转出驾校省市">
            {_get(data, 'outProvinceName', '') + _get(data, 'outCityName', '')}
          </ItemCol>
        </Row> */}
            <Row>
              {_get(data, 'idauthclosed') === '1' && (
                <AuthWrapper authId="student/studentInfo:btn16">
                  <ItemCol span={8} label="免签截至日期">
                    {_get(data, 'idauthcloseddeadline')}
                  </ItemCol>
                </AuthWrapper>
              )}

              {/*业务类型为货运运营初领或货运运营增领，且配置监管地址为国交时才显示该项 jGRequestPlatformType:0 国交  businessType：11：初领 12：增领*/}
              {jGRequestPlatformType === '0' &&
                (_get(data, 'busitype', '') === '11' || _get(data, 'busitype', '') === '12') && (
                  <ItemCol span={8} label="驾驶证图片">
                    <PopoverImg
                      src={_get(data, 'drilicenceImgVO.drilicenceurl_show')}
                      imgStyle={{ width: 60, height: 60 }}
                    />
                  </ItemCol>
                )}
            </Row>
            <Row>
              <ItemCol span={8} label="年龄">
                {_get(data, 'age')}
              </ItemCol>
              <ItemCol span={8} label="入学天数">
                {_get(data, 'enterdays')}
              </ItemCol>
              <ItemCol span={8} label="学号">
                {_get(data, 'studentnum')}
              </ItemCol>
            </Row>
            {/* TODO: 展示信息不全 */}
            {$areaNum === '05' && isShow && (
              <>
                <Title>备案信息补充</Title>
                <Row>
                  <ItemCol span={8} label="安驾证明">
                    <PopoverImg
                      src={_get(data, 'drivercertificateImgVO.drivercertificate_show')}
                      imgStyle={{ width: 60, height: 60 }}
                    />
                  </ItemCol>
                  <ItemCol span={8} label="居住证明">
                    <PopoverImg
                      src={_get(data, 'livingproofImgVO.livingproof_show')}
                      imgStyle={{ width: 60, height: 60 }}
                    />
                  </ItemCol>
                  <ItemCol span={8} label="承诺书">
                    <PopoverImg
                      src={_get(data, 'lettercommitmentImgVO.lettercommitment_show')}
                      imgStyle={{ width: 60, height: 60 }}
                    />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol span={8} label="身份证正面">
                    <PopoverImg
                      src={_get(data, 'faceidcardImgVO.faceidcard_show')}
                      imgStyle={{ width: 60, height: 60 }}
                    />
                  </ItemCol>
                  <ItemCol span={8} label="原从业资格证">
                    <PopoverImg
                      src={_get(data, 'originalcertificateImgVO.originalcertificate_show')}
                      imgStyle={{ width: 60, height: 60 }}
                    />
                  </ItemCol>
                </Row>

                {/* TODO 12 - 1 */}
                <Row>
                  <ItemCol span={8} label="民族">
                    {nationalHash[_get(data, 'nationalReconciliation')]}
                  </ItemCol>
                  <ItemCol span={8} label="住址邮件编码">
                    {_get(data, 'postcode')}
                  </ItemCol>
                  <ItemCol span={8} label="专业技术">
                    {_get(data, 'technicalPost')}
                  </ItemCol>
                </Row>

                <Row>
                  <ItemCol span={8} label="学历">
                    {educationHash[_get(data, 'education')]}
                  </ItemCol>
                  <ItemCol span={8} label="健康状态">
                    {healthStatusHash[_get(data, 'healthState')]}
                  </ItemCol>
                  <ItemCol span={8} label="电子信箱">
                    {_get(data, 'email')}
                  </ItemCol>
                </Row>

                {/* 12-8 */}
                <Row>
                  <ItemCol span={8} label="驾照有效期始">
                    {_get(data, 'drivlicestartdate')}
                  </ItemCol>
                  <ItemCol span={8} label="驾照的有效期">
                    {driverLicenseValidityHash[_get(data, 'drivliceperiod')]}
                  </ItemCol>
                </Row>
              </>
            )}

            <Title>培训信息</Title>
            <Row>
              <ItemCol span={8} label="是否已绑卡">
                {bind_card_typeHash[_get(data, 'cardstu', '0')]}
              </ItemCol>
              <ItemCol
                span={8}
                label="学员班级"
                onClick={_switchVisible}
                style={{ color: PRIMARY_COLOR, cursor: 'pointer' }}
              >
                {_get(data, 'package_name')}
              </ItemCol>

              {_get(data, 'bankchannelname') && !!_get(data, 'train_price_online') && (
                <ItemCol span={8} label="银行账户">
                  {_get(data, 'bankchannelname')}
                </ItemCol>
              )}

              {_get(data, 'coachName', '') && (
                <ItemCol
                  span={8}
                  label="学车教练"
                  onClick={_setDetailsVisible}
                  style={{ color: PRIMARY_COLOR, cursor: 'pointer' }}
                >
                  {_get(data, 'coachName')}
                </ItemCol>
              )}
            </Row>

            <Title>其他信息</Title>
            <Row>{type === 'studentInfo' ? autoInputItem : undefined}</Row>
            <Row>
              <ItemCol span={8} label="是否本地">
                {IS_NOT[_get(data, 'islocal', '')]}
              </ItemCol>
              {_get(data, 'islocal') === '0' && (
                <>
                  <ItemCol span={8} label="居住证号">
                    {_get(data, 'livecardnumber')}
                  </ItemCol>
                  <ItemCol span={8} label="居住地址">
                    {_get(data, 'liveaddress')}
                  </ItemCol>
                </>
              )}
            </Row>

            <Row>
              <ItemCol span={8} label="开户状态">
                {stuBankaccountflagTypeHash[_get(data, 'bankaccountflag')]}
              </ItemCol>
              <ItemCol span={8} label="备注">
                {_get(data, 'note')}
              </ItemCol>
              {isZlb && (
                <ItemCol span={8} label="是否浙里办模式">
                  {iscyzgTypeHash[_get(data, 'isZlbType', '')]}
                </ItemCol>
              )}
            </Row>
            <Row>
              <ItemCol span={8} label="学员来源">
                {studentSourceHash[_get(data, 'data_source', '')]}
              </ItemCol>
            </Row>
          </Form>
        }
      />
    </>
  );
}
