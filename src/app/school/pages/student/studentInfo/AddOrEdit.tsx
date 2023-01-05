import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import {
  Modal,
  Drawer,
  Form,
  Row,
  Input,
  Select,
  message,
  DatePicker,
  Button,
  Alert,
  Tooltip,
  Col,
  Radio,
  Space,
  Empty,
  RadioChangeEvent,
} from 'antd';
import { useFetch, useOptions, useRequest, useVisible, useHash, useGoto, useForceUpdate } from 'hooks';
import {
  _getDetails,
  _addStudent,
  _updateStudent,
  _getCoachList,
  _getClassList,
  _getReviewDetails,
  _updateByKeyForExam,
  getCardMoney,
  _getTrainType,
  _getTrainCar,
  _addSchStudentAcceptinfo,
  _getListAssociated,
  _getPreSignUpDetail,
  _getPreSignUpTrainCar,
  _getPreSignUpTrainCarBySchool,
  _checkStudent,
  _updateSchStudentAcceptinfo,
  _confirmStudent,
  _getJGRequestPlatformType,
  _getAllCardMoney,
  _querySchoolAccount,
  _checkEditStuInfoNeedDeductCard,
  InputRule,
} from './_api';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { formatTime, Auth, handleStuIdCardDiff, handleReadStuIdCardNormal, _moment } from 'utils';
import { Loading, UploadPro, Title, ItemCol } from 'components';
import { RULES } from 'constants/rules';
import { _getCode, _getCustomParam } from 'api';
import Reason from '../forecastReview/Reason';
import { readStuIdCardData } from 'utils';
import Photograph from './Photograph';
import { _get } from 'utils';
import { UpdatePlugin } from 'components';
import CheckFail from './CheckFail';
import Address from './Address';
import editStyles from './index.module.scss';
import GlobalContext from 'globalContext';
import rebateIcon from 'statics/images/rebateIcon.png';
import type { SubAccount, SchoolsBySignUp, ClassList, Coach, SchoolAccount } from './_api';
import { Rule } from 'antd/lib/form';
import { useIsCheckDeductPointCard, useSetDefaultWalletForOnlineClass } from './hooks';
import { PRIMARY_COLOR } from 'constants/styleVariables';
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

interface StudentInfoProp {
  onOk: () => void;
  onCancel: () => void;
  currentRecord: Record<string, any>;
  isEdit: boolean;
  title?: string;
  isReview?: boolean;
  keyInfos?: string[];
  regInfos?: string[];
  studenttype?: string;
  stutransareatype?: string;
  isPreSignUp?: boolean;
  isChecked?: boolean;
  isTheoryCenter?: boolean;
  isConfirmation?: boolean;
  isStudents?: boolean;
  isShowRobot?: boolean;
  courseList?: unknown[];
  autoInput?: InputRule[];
  optionStore?: Record<string, IOption[]>;
}

export default function AddOrEdit(props: StudentInfoProp) {
  const {
    onOk,
    onCancel,
    currentRecord,
    isEdit,
    title,
    isReview,
    keyInfos = [],
    regInfos = [],
    studenttype = '0',
    stutransareatype = '0',
    isPreSignUp = false, // 是否预报名受理
    isChecked = false, // 是否预报名审核
    isTheoryCenter = false, // 是否理科中心
    isConfirmation = false, // 是否转正
    isStudents = false, // 是否学员注册
    isShowRobot = false,
    courseList = [],
    autoInput = [],
    optionStore = [],
    // store 存着的就是 key => options
  } = props;

  const [form] = Form.useForm();

  const [imageUrl, setImageUrl] = useState();
  const [head_img_oss_id, setImgId] = useState('');
  const [driveUrl, setDriveUrl] = useState(''); // 驾驶证图片url
  const [drilicenceossid, setDrilicenceossid] = useState(''); // 驾驶证图片id
  const [isShow, setIsShow] = useState(false); // 是否展示备案信息
  const [ignore, forceUpdate] = useForceUpdate();

  // 安驾证明
  const [drivercertificateossid, setDrivercertificate] = useState('');
  const [drivercertificate_show, setDrivercertificate_show] = useState('');

  // 居住证明
  const [livingproofossid, setLivingproof] = useState('');
  const [livingproof_show, setLivingproof_show] = useState('');

  // 承诺书
  const [lettercommitmentossid, setLettercommitment] = useState('');
  const [lettercommitment_show, setlettercommitment_show] = useState('');

  // 身份证正面
  const [faceidcardossid, setFaceidcard] = useState('');
  const [faceidcard_show, setFaceidcard_show] = useState('');

  // 原从业资格证
  const [originalcertificateossid, setOriginalcertificate] = useState('');
  const [originalcertificate_show, setOriginalcertificate_show] = useState('');

  const [jump_fromarea, setJump_fromarea] = useState('');
  const [package_name, setPackage_name] = useState('');
  const [businessType, setBusinessType] = useState(_get(currentRecord, 'busitype', ''));
  const [cardtype, setCardtype] = useState('1');
  const [drilicnum, setDrilicnum] = useState('');
  const [traintype, setTraintype] = useState();
  const [package_id, setPackage_id] = useState('');
  const [islocal, setIsLocal] = useState('1');
  const [nations, setNations] = useState<{ label: string; value: string }[]>([]);
  const [coachList, setCoachList] = useState<Coach[]>([]);
  const [nationality, setNationality] = useState('156');
  const [train_price_online, setTrain_price_online] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const ID_CARD_RULES = {
    validator: RULES.ID_CARD_NUM_VALID,
  };
  const [idCardRules, setIdCardRules] = useState(ID_CARD_RULES) as any;
  const [bankchannelid, setBankchannelid] = useState(''); // 开户银行ID
  const [bankaccount, setBankaccount] = useState(''); // 开户银行账号
  const [reviewVisible, setReviewVisible] = useVisible();
  const isAfterFirstRecord = isEdit && _get(currentRecord, 'unregisteredFlag', '') === '1'; //编辑 监管已备案的情况 （unregisteredFlag 表示第一次备案成功后 字段会变成 1；）
  const [readCardLoading, setReadCardLoading] = useState(false);
  const [photographVisible, setPhotographVisible] = useVisible();
  const [driverPhotographVisible, setDriverPhotographVisible] = useVisible();
  // 镇江
  const [drivercertificateVisible, setDrivercertificateVisible] = useVisible();
  const [livingproofVisible, setLivingproofVisible] = useVisible();
  const [lettercommitmentVisible, setLettercommitmentVisible] = useVisible();
  const [faceidcardVisible, setFaceidcardVisible] = useVisible();
  const [originalcertificateVisible, setOriginalcertificateVisible] = useVisible();

  const [stuType, setStuType] = useState<string>(isEdit ? _get(currentRecord, 'studenttype', '') : studenttype);
  const [busitypeOptions, setBusitypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [checkVisible, setCheckVisible] = useVisible();
  const [iccardcode, setIccardcode] = useState(''); // 身份证物理卡号
  const [rechargeVisible, setRechargeVisible] = useVisible();
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');

  const isShowClassCoach = !isPreSignUp || !isTheoryCenter; //非预报名页面（学员档案页面）或预报名页面同时驾校不是理科中心
  const isShowOriginalDriverInfo = businessType === '1' || businessType === '11' || businessType === '12'; //是否显示原驾驶证号、初领日期、原准驾车型
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const { _push } = useGoto();
  const DETAIL_API = isReview ? _getReviewDetails : isPreSignUp ? _getPreSignUpDetail : _getDetails;

  const [isOpenRobot, setIsOpenRobot] = useState('0'); // 是否开启
  const [robotPlanId, setRobotPlanId] = useState('');
  const [coachName, setCoachName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankVisible, setBankVisible] = useVisible();
  const { $areaNum, $isForceUpdatePlugin } = useContext(GlobalContext);
  const [isShowReadIdCard, setShowReadIdCard] = useState(false); //是否显示读二代证
  const [isRequired, setIsRequired] = useState(false); // 控制备案信息是否必填
  const [classList, setClassList] = useState<ClassList>({} as ClassList);
  const [effectiveClass, setEffectiveClass] = useState<ClassList['rows']>([]);
  const [isChangeClassByEdit, setIsChangeClassByEdit] = useState(false); // 控制车型与业务类型变化时 班级是否联动
  const [isChangeCarTypeOrBusiType, setIsChangeCarTypeOrBusiType] = useState(0); // 监听（车型或者业务）切换事件
  const [isChangeClass, setIsChangeClass] = useState(0);

  const [isOtherProvince, setIsOtherProvince] = useState('0'); // (预报名受理)是否转入
  const [isDisabledEditTransferInto, setIsDisabledEditTransferInto] = useState(false);
  const [applySchoolid, setApplySchoolid] = useState('');
  const isCheckDeductPointCard = useIsCheckDeductPointCard(); // 校验学员注册 是否扣除点卡

  const [reduceCardLoading, setReduceCardLoading] = useState(false);

  const { data, isLoading } = useFetch({
    query: {
      id: _get(currentRecord, 'sid'),
    },
    requiredFields: ['id'],
    request: DETAIL_API,
    callback: (data) => {
      if (isReview) {
        //意向学员
        setImageUrl(_get(data, 'head_img_url'));
      } else {
        setImageUrl(_get(data, 'headImgVO.head_img_url_show'));
      }
      setJump_fromarea(_get(data, 'jump_fromarea', ''));

      setPackage_name(_get(data, 'package_name', ''));
      setCardtype(_get(data, 'cardtype', ''));

      // 编辑 + 身份证类型 + 原驾驶证号空+业务类型（增领/货运初领/货运增领）
      if (
        isEdit &&
        _get(data, 'cardtype', '') === '1' &&
        _get(data, 'drilicnum', '') === '' &&
        (_get(data, 'busitype', '') === '1' ||
          _get(data, 'busitype', '') === '11' ||
          _get(data, 'busitype', '') === '12')
      ) {
        setDrilicnum(_get(data, 'idcard', ''));
      } else {
        setDrilicnum(_get(data, 'drilicnum', ''));
      }

      setTraintype(_get(data, 'traintype', ''));
      setPackage_id(_get(data, 'package_id', ''));
      setIsLocal(_get(data, 'islocal', ''));
      // 预报名 是否 转入
      if (isPreSignUp) {
        // _get(data, 'isotherprovince', '0') === "" 需要转为 为默认值 "0"
        setIsOtherProvince(Number(_get(data, 'isotherprovince', '0')) + '');
      }
      setNationality(_get(data, 'nationality', '156'));
      setBankName(_get(data, 'bankchannelname', ''));
      setTrain_price_online(_get(data, 'train_price_online', 0));
      setBankchannelid(_get(data, 'bankchannelid', ''));
      setBankaccount(_get(data, 'bankaccount', ''));
      setCoachName(_get(data, 'coachname'));
      if (isShowRobot) {
        setIsOpenRobot(_get(data, 'isOpenRobotCoach', '0'));
        if (_get(data, 'isOpenRobotCoach', '0') === '1') {
          setRobotPlanId(_get(data, 'teachplanId'));
        }
      }

      if (_get(data, 'cardtype', '') === '1') {
        //若学员是身份证号：1、出生日期、性别 不允许修改；2、从身份证号，提取 出生日期、性别。
        setDisabled(true);
        setIdCardRules(ID_CARD_RULES); //身份证号 根据身份证号校验

        let idcardVal = _get(data, 'idcard', '');
        if (!_get(data, 'birthday', '') && idcardVal.length === 18) {
          //如果没有birthday字段，出生日期 从身份证号取
          let birthday = `${idcardVal.substring(6, 10)}-${idcardVal.substring(10, 12)}-${idcardVal.substring(12, 14)}`;
          form.setFieldsValue({ birthday: moment(birthday) });
        }
      } else {
        setIdCardRules(RULES.OTHER_CARDTYPE); //其他证件类型正则校验：40 字符
        setDisabled(false);
      }
      // setApplySchoolid(_get(data, 'applyerschoolid', ''));
      setDriveUrl(_get(data, 'drilicenceImgVO.drilicenceurl_show'));
      setDrivercertificate_show(_get(data, 'drivercertificateImgVO.drivercertificate_show'));
      setLivingproof_show(_get(data, 'livingproofImgVO.livingproof_show'));
      setlettercommitment_show(_get(data, 'lettercommitmentImgVO.lettercommitment_show'));
      setFaceidcard_show(_get(data, 'faceidcardImgVO.faceidcard_show'));
      setOriginalcertificate_show(_get(data, 'originalcertificateImgVO.originalcertificate_show'));
      forceUpdate();
    },
  });

  // 预报名 相关页面 根据是否扣过点卡 允许编辑“是否转入”选项
  useEffect(() => {
    const isDisabledEditTransferInto = _get(data, 'isbindecardno', '0') === '1';
    setIsDisabledEditTransferInto(isDisabledEditTransferInto);
  }, [data]);

  const { data: schoolData = {} as SchoolsBySignUp }: { data: SchoolsBySignUp } = useFetch({
    request: _getListAssociated,
  });

  // 监管地址配置0：国交 1：至正
  const { data: jGRequestPlatformType }: { data: '0' | '1' } = useFetch({
    request: _getJGRequestPlatformType,
  });

  /**
   * 读二代证显示条件（下述满足其一）
   * 1、新增
   * 2、如果证件类型允许修改 =====》按钮常驻
   * 3、如果证件类型不允许修改 并且 证件类型=身份证  ====》显示按钮
   *
   */
  useEffect(() => {
    if (isEdit) {
      if (keyInfos.includes('cardtype')) {
        if (cardtype === '1') {
          //证件类型：身份证
          setShowReadIdCard(true);
        } else {
          setShowReadIdCard(false);
        }
      } else {
        setShowReadIdCard(true);
      }
    } else {
      setShowReadIdCard(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardtype, isEdit]);

  // 教练列表
  useFetch({
    request: _getCoachList,
    query: {
      registered_Flag: '2',
      employstatus: '01',
    },
    callback: (coachList) => {
      setCoachList(coachList);
    },
  });

  // 银行驾校账户
  const {
    run: walletRequest,
    loading: load,
    data: openAccountData,
  }: { run: (query?: any, header?: any) => void; loading: boolean; data: SchoolAccount[] | null } = useRequest(
    _querySchoolAccount,
    {
      onSuccess: () => {
        setBankVisible();
        // setBankName(_get(data, 'bankchannelname', ''));
        // setBankchannelid(_get(data, 'bankchannelid', ''));
      },
      onFail: () => {
        setBankName(_get(data, 'bankchannelname', ''));
        setBankchannelid(_get(data, 'bankchannelid', ''));
      },
    },
  );
  // 班级数据
  useFetch({
    request: _getClassList,
    depends: [traintype, stuType, businessType],
    query: {
      page: 1,
      limit: 100,
      traintype,
      studenttype: stuType,
    },
    callback(classList: ClassList) {
      // 编辑状态下
      if (!isChangeClassByEdit || !isEdit) {
        setClassList(classList);
      }
      if (isAfterFirstRecord && traintype) {
        setIsChangeClassByEdit(true);
      }
    },
  });

  // 培训车型数据
  const { data: trainCarData = [] } = useFetch({
    request: _getTrainCar,
    query: {
      schId: Auth.get('schoolId'),
    },
  });

  //学员预报名培训车型（根据驾校id与区域配置取交集）-实操驾校调用
  let { data: preSignUpTrainCarBySchool = [] } = useFetch({
    request: _getPreSignUpTrainCarBySchool,
    query: {
      schId: Auth.get('schoolId'),
    },
    forceCancel: isTheoryCenter,
    failCallback: () => {
      preSignUpTrainCarBySchool = [];
    },
  });
  //学员预报名培训车型（区域配置的车型）-理科中心调用
  const { data: preSignUpTrainCar = [] } = useFetch({
    request: _getPreSignUpTrainCar,
    forceCancel: !isTheoryCenter,
  });
  /**
   * 实操驾校
	     预报名受理-新增-培训车型下拉框数据 改用接口_getPreSignUpTrainCarBySchool查驾校经营范围与区域配置的交集
   *理科中心驾校
	     预报名受理-新增-培训车型下拉框接口_getPreSignUpTrainCar：查【区域配置】-【学员报名受理控制】-报名申请方式为【理科驾校】的车型

   */
  const businessScopeOptions = ((isPreSignUp
    ? isTheoryCenter
      ? preSignUpTrainCar
      : preSignUpTrainCarBySchool
    : trainCarData) as {
    text: string;
    value: string;
  }[]).map((carType) => {
    return {
      label: carType.text,
      value: carType.value,
    };
  });

  // _getTrainType => 获取车型 ✖ | 通过车型获取相关的业务类型 ✔
  useFetch({
    request: _getTrainType,
    depends: [traintype, ignore],
    requiredFields: ['traintype'],
    query: {
      traintype,
    },
    callback: (busiTypes: { text: string; value: string }[]) => {
      setIsShow(false);
      setBusitypeOptions(
        busiTypes.map((busiType) => {
          if (busiType.value === '11' || busiType.value === '12') {
            setIsShow(true);
          }
          return {
            label: busiType.text,
            value: busiType.value,
          };
        }),
      );
      // form.setFieldsValue({ busitype: '0' }); // 选择培训车型后，业务类型默认是初领
    },
  });

  useFetch({
    request: _getCode,
    query: { codeType: 'nationality_type', parentCodeKey: '-1' },
    callback: (nations: { text: string; value: string }[]) => {
      setNations((nations || []).map((nation) => ({ value: nation.value, label: nation.text })));
    },
  });

  useEffect(() => {
    // '2'为有效班级
    setEffectiveClass(_get(classList, 'rows', []).filter((classItem) => classItem.status_cd === '2'));
  }, [classList]);

  /**
   * 对于当某些地区（如广东）的班级数只有一个
   * 对于考虑到业务和车型（间接影响到有限班级展示）都会影响到班级input
   *
   * 要考虑到到 一种极端情况 就是原来原来新增的时候 班级选项有两项
   * 但如果之后因为某些原因 关闭了所选择的班级 导致在编辑的时候 只有一项了 会触发（班级只有一项时）的回填
   * 用户修改部分数据后 后端会提示 “备案后的班级 无法修改” 但是用户在页面 是无法感知的 是有问题的
   *
   * TODO：公共代码 抽离
   */
  useEffect(() => {
    if (isEdit) {
      if (isAfterFirstRecord) {
        return;
      }
      // 排除详情中的班级和下拉框的班级无法一致的情况
      if (!isChangeCarTypeOrBusiType) {
        return;
      }

      if (effectiveClass.length === 1) {
        setPackage_name(_get(effectiveClass, [0, 'packlabel'], ''));
        setPackage_id(_get(effectiveClass, [0, 'packid'], ''));
        // setIsChangeClass((count) => count + 1);
        setTrain_price_online(_get(effectiveClass, [0, 'train_price_online'], 0));
      } else {
        //解决业务类型从班级只有一项切换到多项未清空的问题
        setPackage_name('');
        setPackage_id('');
        setTrain_price_online(0);
      }
    } else {
      if (effectiveClass.length === 1) {
        setPackage_name(_get(effectiveClass, [0, 'packlabel'], ''));
        setPackage_id(_get(effectiveClass, [0, 'packid'], ''));
        setTrain_price_online(_get(effectiveClass, [0, 'train_price_online'], 0));
      } else {
        setPackage_name('');
        setPackage_id('');
        setTrain_price_online(0);
      }
    }
  }, [effectiveClass, isEdit, isAfterFirstRecord, isChangeCarTypeOrBusiType]);

  // TODO: 观察是否会影响 学员档案的正常操作（后续删除 effect）
  // useEffect(() => {
  //   // 班级名字为空的时候 不能名字变化的时候
  //   // 需学员在线缴费文案置空
  //   if (!package_name) {
  //     setTrain_price_online(0);
  //   }
  //   // 切换班级会清空银行账户的数据
  //   setBankName('');
  //   setBankchannelid('');
  //   setBankaccount('');
  // }, [package_name]);

  const setDefaultWalletCallback = useCallback(
    ({ bankName, bankaccount, bankchannelid }: { bankName: string; bankchannelid: string; bankaccount: string }) => {
      setBankName(bankName);
      setBankchannelid(bankchannelid);
      setBankaccount(bankaccount);
    },
    [],
  );

  const [checkIsDefaultWalletLoading] = useSetDefaultWalletForOnlineClass({
    package_id,
    cid: form.getFieldValue('cid'),
    train_price_online,
    isEdit,
    isChangeClass,
    // isChangeCarTypeOrBusiType,
    setDefaultWalletCallback,
  });

  // 查询所有的余额点卡
  const {
    data: allCardMoney,
    res: result,
  }: {
    data: { subAccounts: SubAccount[] };
    res: { code: number; data: { subAccounts: SubAccount[] }; message: string };
  } = useFetch({
    request: _getAllCardMoney,
    query: {
      accountType: '00',
    },
  });

  let excludePointCardType = useMemo(() => ['00', '05', '06', '07'], []);

  if ($areaNum === '05') {
    // 05镇江
    excludePointCardType[4] = 'A1'; // A1代表剩余注册名额
  }

  const subAccounts = useMemo(
    () =>
      _get(allCardMoney, 'subAccounts', []).filter((card) =>
        excludePointCardType.includes(_get(card, 'subAccountType')),
      ),
    [allCardMoney, excludePointCardType],
  );

  useEffect(() => {
    if (result && _get(result, 'code') !== 200 && !isChecked && !isPreSignUp) {
      // isChecked预报名受理 // isPreSignUp预报名审核
      message.warn(_get(result, 'message', ''));
    }
  }, [result]);

  const carTypeOptions = useOptions('trans_car_type'); // 车辆类型
  const genderOptions = useOptions('gender_type'); // 性别
  const cardTypeOptions = useOptions('card_type'); // 证件类型
  const cardTypeOptionsGD = useOptions('gd_card_type');
  const nationalityTypeOptions = useOptions('nationality_type'); // 国籍
  const studentFieldLabelMapping = useHash('studentFieldLabelMapping', true); // 学员字段、label
  const busiTypeOptionsTransfer = useOptions('busi_type'); // 业务类型

  // 12-1 镇江学员报名是新增录入字段用于结业审核
  const educationOptions = useOptions('stu_education_type'); // 学历
  const nationalOptions = useOptions('stu_nationalReconciliation_type'); // 民族
  const healthStatusOptions = useOptions('stu_healthState_type'); // 健康状况

  // 12-8 镇江学员补充
  const driverLicenseValidityOptions = useOptions('stu_drivliceperiod_type'); //驾照的有效期

  function getSaveApi() {
    if (!isEdit) {
      if (isPreSignUp) {
        //预报名 - 新增
        return _addSchStudentAcceptinfo;
      }
      return _addStudent; //学员档案 - 新增
    }
    if (isReview) {
      // 意向学员审核
      return _updateByKeyForExam;
    }
    if (isChecked) {
      // 预受理 - 审核
      return _checkStudent;
    }
    if (isConfirmation) {
      //预报名 - 转正
      return _confirmStudent;
    }
    if (isPreSignUp) {
      // 预报名 - 编辑
      return _updateSchStudentAcceptinfo;
    }
    return _updateStudent; //学员档案 - 编辑
  }

  const { loading: confirmLoading, run } = useRequest(getSaveApi(), {
    onSuccess: onOk,
    onFail: (res, code) => {
      if (code === 9155) {
        //此时学员新增成功，只是备案失败，需要关闭弹窗
        onOk();
      }
    },
  });

  const photoDisable = isEdit && keyInfos.includes('head_img_oss_id');
  const photoCls = photoDisable ? '' : 'color-primary';
  const loading = isLoading || readCardLoading;
  const isClassCanSelect = !isChecked; //学员班级是否可选：预报名审核页面展示，不可编辑选择

  function getChangedValueOfFields(values: object) {
    let strArr: string[] = [];
    let str = '';
    const fieldsNoMngByFormArr = [
      //无法被form管理的字段
      'cardtype',
      'nationality',
      'drilicnum',
      'traintype',
      'package_id',
      'package_name',
      // 'jump_fromarea',
      'train_price_online',
      'head_img_oss_id',
      'bankaccount',
      'bankchannelid',
      'drilicenceossid',
    ];
    const dateArr = ['birthday', 'fstdrilicdate', 'applydate']; //日期相关的字段

    regInfos.forEach((item) => {
      if (fieldsNoMngByFormArr.includes(item)) {
        // eslint-disable-next-line no-eval
        if (eval(item) !== _get(data, item, '')) {
          strArr.push(studentFieldLabelMapping[item]);
        }
      } else {
        if (dateArr.includes(item)) {
          if (
            item !== 'applydate' && // 前端没有报名日期配置（后端自动生成），无需判断
            _get(values, item) !== undefined &&
            formatTime(_get(values, item, ''), 'DATE') !== formatTime(_get(data, item, ''), 'DATE')
          ) {
            strArr.push(studentFieldLabelMapping[item]);
          }
        } else if (_get(values, item) !== undefined && _get(values, item, '') !== _get(data, item, '')) {
          strArr.push(studentFieldLabelMapping[item]);
        }
      }
    });

    str = strArr.join(',');

    return str;
  }

  function getChangedValueOfFieldsForNotRecord(values: object) {
    let strArr: string[] = [];
    //无法被form管理的字段
    const fieldsNoMngByFormArr = ['traintype'];
    const threeElements = ['traintype', 'idcard', 'busitype'];

    threeElements.forEach((item) => {
      if (fieldsNoMngByFormArr.includes(item)) {
        // eslint-disable-next-line no-eval
        if (eval(item) !== _get(data, item, '')) {
          strArr.push(studentFieldLabelMapping[item]);
        }
      } else {
        if (_get(values, item) !== undefined && _get(values, item, '') !== _get(data, item, '')) {
          strArr.push(studentFieldLabelMapping[item]);
        }
      }
    });

    return strArr.join(',');
  }

  const isTrans =
    (_get(data, 'stutransareatype', '') === '1' ||
      _get(data, 'stutransareatype', '') === '2' ||
      _get(data, 'stutransareatype', '') === '3' ||
      stutransareatype === '1' ||
      stutransareatype === '2' ||
      stutransareatype === '3') &&
    !isPreSignUp &&
    !isReview;

  const [transCode, setTransCode] = useState('0');

  useEffect(() => {
    if (isTrans && isEdit && data) {
      // 转入且编辑
      setTransCode(_get(data, 'stutransareatype'));
    } else if (isTrans && !isEdit) {
      // 转入且新增
      setTransCode(stutransareatype);
    }
  }, [isTrans, data, isEdit, stutransareatype]);

  const isZero = (subAccountType: '00' | '05' | '06' | '07') => {
    return (
      Number(
        _get(
          subAccounts.find((account) => _get(account, 'subAccountType') === subAccountType) as SubAccount,
          'accountBalance',
        ),
      ) === 0
    );
  };

  const showRechargeModal = (accountName: string, accountType: string) => {
    setAccountName(accountName);
    setAccountType(accountType);
    setRechargeVisible();
  };

  // 学员为广东，且业务类型为增领时，驾驶证图片为必填，图片只能为.jpg,.png,.jpeg

  const showDriverLicenseRequire =
    $areaNum === '02' && (businessType === '11' || businessType === '12' || businessType === '1');
  /*
    上传驾驶证图片显示条件：
    条件一 镇江：从业学员（根据业务类型联动busitype为11和12）报名备案新增信息录入
    条件二 业务类型为货运运营初领或货运运营增领，且配置监管地址为国交时才显示该项
    jGRequestPlatformType:0 国交  businessType：11：初领 12：增领
  */
  const showDriverLicense =
    (jGRequestPlatformType === '0' && (businessType === '11' || businessType === '12')) ||
    ($areaNum === '05' && isShow) ||
    showDriverLicenseRequire;
  const requestData = () => {
    if (
      isCheckDeductPointCard &&
      !isEdit &&
      !isPreSignUp &&
      subAccounts.some((account) => _get(account, 'subAccountType') === '00')
    ) {
      if (isZero('00')) {
        showRechargeModal('通用点卡', '00');
        return;
      }
    }

    form.validateFields().then(async (values) => {
      // 通用点卡和另外三类点卡是互斥的
      // 只有新增页面的时候回去检查
      if (!isEdit && !isPreSignUp && isCheckDeductPointCard) {
        // 老式驾校只有通用标准的点卡
        if (subAccounts.some((account: any) => _get(account, 'subAccountType') === '00')) {
          if (isZero('00')) {
            showRechargeModal('通用点卡', '00');
            return;
          }
        } else {
          // 新式的区分
          let traintype = form.getFieldValue('traintype');
          let busitype = form.getFieldValue('busitype');
          /*
            （1）若车型为A2、B2，业务类型为初领、增领、其他，则显示大车点卡
            （2）若车型为A2、B2，业务类型为货运初领，货运增领，则显示从业点卡
            （3）若车型为非A2、B2，则显示标准点卡
          */
          if (traintype === 'A2' || traintype === 'B2') {
            // subAccountType === '06'大车点卡
            if (busitype === '0' || busitype === '1' || busitype === '9') {
              if (isZero('06')) {
                showRechargeModal('大车点卡', '06');
                return;
              }
            } else if (busitype === '11' || busitype === '12') {
              // subAccountType === '07'从业点卡
              if (isZero('07')) {
                showRechargeModal('从业点卡', '07');
                return;
              }
            }
          } else {
            // 标准点卡 并且要去判断标准点卡的余额是否不足 subAccountType === '05' 标准点卡
            if (isZero('05')) {
              showRechargeModal('标准点卡', '05');
              return;
            }
          }
        }
      }

      if (!cardtype) {
        message.error('证件类型不能为空');
        return;
      }
      let idcardVal = _get(values, 'idcard');
      if (idcardVal !== _get(values, 'idcardVerify')) {
        message.error('证件号不一致');
        return;
      }
      if (cardtype === '1') {
        //证件类型：身份证
        let sex = Number(idcardVal.substring(16, 17)) % 2 === 0 ? '2' : '1';
        if (sex !== _get(values, 'sex')) {
          message.error('性别与身份证号不符');
          return false;
        }
        let birthday = `${idcardVal.substring(6, 10)}-${idcardVal.substring(10, 12)}-${idcardVal.substring(12, 14)}`;
        if (birthday !== moment(_get(values, 'birthday')).format('YYYY-MM-DD')) {
          message.error('出生日期与身份证号不符');
          return false;
        }
      }

      if (!imageUrl) {
        message.error('照片不能为空');
        return;
      }

      if (isShowOriginalDriverInfo && !drilicnum) {
        message.error('请输入原驾驶证号');
        return;
      }
      if (isShowClassCoach && isClassCanSelect && !package_id) {
        message.error('请选择班级');
        return;
      }
      if (isShowClassCoach && train_price_online && !bankchannelid) {
        message.error('请选择收款钱包');
        return;
      }

      if (isTrans && !jump_fromarea) {
        message.error('请选择转出驾校省市');
        return;
      }

      if (isPreSignUp && Number(isOtherProvince) !== 0 && !jump_fromarea) {
        message.error('请选择转出驾校省市');
        return;
      }

      //   {满足显示上传驾驶证图片的条件，同时不是镇江（镇江仅显示非必填）}
      if (showDriverLicense && $areaNum !== '05' && !drilicenceossid && !driveUrl) {
        message.error('请上传驾驶证图片');
        return;
      }
      if (!islocal) {
        message.error('请选择是否本地');
        return;
      }

      // 理科中心驾校
      // 预报名受理点确定时，校验车型与报名驾校是否匹配
      if (isPreSignUp && !isEdit && isTheoryCenter) {
        const res = await _getPreSignUpTrainCarBySchool({ schId: applySchoolid });
        const carData = _get(res, 'data', []);
        const carList = carData.map((x: any) => x.text);
        if (!carList.includes(traintype)) {
          message.error('当前报名实操驾校经营范围车型不包括所选培训车型，请重新选择');
          return;
        }
      }
      let query: { [key: string]: unknown } = {
        name: _get(values, 'name'),
        sex: _get(values, 'sex'),
        cardtype,
        idcard: _get(values, 'idcard'),
        nationality,
        phone: _get(values, 'phone'),
        address: _get(values, 'address'),
        head_img_oss_id,
        drilicenceossid: showDriverLicense ? drilicenceossid : '',
        busitype: _get(values, 'busitype'),
        drilicnum,
        fstdrilicdate: formatTime(_get(values, 'fstdrilicdate'), 'DATE'),
        perdritype:
          $areaNum === '04' && _get(values, 'perdritype')
            ? _get(values, 'perdritype').join(',')
            : _get(values, 'perdritype', ''),
        traintype,
        // applydate: formatTime(_get(values, 'applydate'), 'DATE'),
        // isotherprovince: _get(values, 'isotherprovince'),
        fileType: 'studentregister',
        package_id,
        package_name,
        cid: _get(values, 'cid') ? _get(values, 'cid') : '',
        jump_fromarea,
        islocal,
        livecardnumber: _get(values, 'livecardnumber'),
        liveaddress: _get(values, 'liveaddress'),
        note: _get(values, 'note'),
        birthday: formatTime(_get(values, 'birthday'), 'DATE'),
        studenttype: !isPreSignUp
          ? isEdit
            ? _get(currentRecord, 'studenttype', '')
            : studenttype
          : stuType !== '1'
          ? '0'
          : '1',
        stutransareatype: isEdit ? _get(currentRecord, 'stutransareatype', '') : stutransareatype,
        bankchannelid,
        bankaccount,
        teachplanId: isOpenRobot === '1' ? robotPlanId : '',
        isOpenRobotCoach: isOpenRobot,
      };

      autoInput
        .filter((item: any) => item.updateStatus === '1')
        .forEach((item: any) => {
          query[item.name] = _get(values, item.name, '');
        });
      // 镇江
      if ($areaNum === '05' && isShow) {
        query = {
          ...query,
          drivercertificateossid,
          livingproofossid,
          lettercommitmentossid,
          faceidcardossid,
          originalcertificateossid,
          // 12-1:
          education: _get(values, 'education'),
          nationalReconciliation: _get(values, 'nationalReconciliation'),
          postcode: _get(values, 'postcode'),
          healthState: _get(values, 'healthState'),
          technicalPost: _get(values, 'technicalPost'),
          email: _get(values, 'email'),

          // 12-8:
          drivlicestartdate: formatTime(_get(values, 'drivlicestartdate'), 'DATE'),
          drivliceperiod: _get(values, 'drivliceperiod'),
        };
      }
      const reviewQuery = { ...query, sid: _get(currentRecord, 'sid'), checkstatus: '2' }; //意向学员审核通过：checkstatus 0：待处理 ，  1：审核不通过 ，2：审核通过

      // 涉及 预报名相关 新增转入和转出省份的字段
      const isTransInfo = {
        isotherprovince: isPreSignUp ? isOtherProvince : '',
        jump_fromarea: isPreSignUp && isOtherProvince === '1' ? jump_fromarea : '',
      };

      const isCheckedQuery = {
        ...query,
        sid: _get(currentRecord, 'sid'),
        applyerschoolid: _get(values, 'applyerschoolid'),
        checkstatus: '2',
        coachname: coachName,
        cid: _get(data, 'cid', ''), // 预报名审核中 cid 有值传值 没值传“”

        ...isTransInfo,
      }; //预报名审核  2：审核通过

      const isConfirmationQuery = {
        ...query,
        applyerschoolid: _get(values, 'applyerschoolid'),
        sid: _get(currentRecord, 'sid'),

        ...isTransInfo,
      }; // 预报名转正

      const isPreSignUpQuery = {
        ...query,
        applyerschoolid: _get(values, 'applyerschoolid'),
        coachname: coachName,
        ...isTransInfo,
      }; //预报名受理 (新增 | 编辑)

      const studentQuery = { ...query, sid: _get(currentRecord, 'sid') };

      function getQuery() {
        if (!isEdit) {
          if (isPreSignUp) {
            // 预报名受理
            return {
              ...isPreSignUpQuery,
              iccardcode, //预报名受理-新增 传参身份证物理卡号iccardcode（编辑不传）
              package_id: isTheoryCenter ? '' : package_id, //理科中心 预报名受理 新增，不传班级
              package_name: isTheoryCenter ? '' : package_name,
            };
          }
          return { ...query, iccardcode }; //学员档案  //学员档案-新增 传参身份证物理卡号iccardcode（编辑不传）
        }
        if (isReview) {
          // 意向学员审核通过
          return reviewQuery;
        }
        if (isChecked) {
          // 预报名审核
          return { ...isCheckedQuery, iccardcode: _get(data, 'iccardcode', '') }; //审核时把详情返回的物理卡号带上（重新读到的物理卡号不覆盖）
        }
        if (isConfirmation) {
          // 预报名 - 转正
          return { ...isConfirmationQuery, iccardcode: _get(data, 'iccardcode', '') };
        }
        if (isPreSignUp) {
          // 预报名受理
          return {
            ...isPreSignUpQuery,
            sid: _get(currentRecord, 'sid'),
            iccardcode: _get(data, 'iccardcode', ''),
          };
        }
        return studentQuery; //学员档案
      }

      const beforeIsReduceCard = async (
        sid: string,
        studentType: string,
        trainType: string,
        idcard: string,
        busiType: string,
      ): Promise<{ isNeedReduceCard: boolean; isContinue: boolean }> => {
        setReduceCardLoading(true);
        const res = await _checkEditStuInfoNeedDeductCard({
          sid,
          studentType,
          trainType,
          busiType,
          idcard,
        });
        setReduceCardLoading(false);
        const code = _get(res, 'code');
        if (code === 200) {
          const data = _get(res, 'data')!;
          return {
            isNeedReduceCard: data,
            isContinue: true,
          };
        } else {
          const msg = _get(res, 'message')!;
          message.error(msg);
          return {
            isNeedReduceCard: false,
            isContinue: false,
          };
        }
      };

      // 备案
      const editedInfo = getChangedValueOfFields(values);
      // 非备案
      const editedInfoForNotRecord = getChangedValueOfFieldsForNotRecord(values);

      function raw(editedInfo: string, isNeedReduceCard: boolean, isRegistered: boolean) {
        return (
          <>
            你修改了{editedInfo}信息，保存后，{isRegistered ? '备案状态会变为未备案，需重新备案，' : ''}
            {isNeedReduceCard ? (
              <>
                <span style={{ color: PRIMARY_COLOR }}>
                  {isRegistered ? '并再次消耗一张点卡' : '需要再次消耗一张点卡'}
                </span>
                {'，'}
              </>
            ) : (
              ''
            )}
            确认仍要继续吗？
          </>
        );
      }

      // 编辑 状态下，如果当前状态为已备案,获取影响备案状态的字段并比较是否修改
      // 根据列表状态registered_Flag显示
      if (isEdit && _get(currentRecord, 'registered_Flag', '') === '1' && editedInfo) {
        // 证件号 业务类型 培训车型
        const editedContent = editedInfo.split(',');
        const threeElements = ['证件号', '业务类型', '培训车型'];
        const result = editedContent.filter((edited) => threeElements.includes(edited));

        if (result.length) {
          const { traintype, idcard, busitype } = values;
          const { studenttype, sid } = data;
          const res = await beforeIsReduceCard(sid, studenttype, traintype, idcard, busitype);
          const isContinue = _get(res, 'isContinue');
          if (!isContinue) return;
          const isNeedReduceCard = _get(res, 'isNeedReduceCard');
          const content = raw(editedInfo, isNeedReduceCard, true);

          return confirm({
            title: '信息提示',
            content,
            onOk() {
              run(getQuery());
            },
            okText: '确认',
            cancelText: '取消',
          });
        }

        // 修改
        return confirm({
          title: '信息提示',
          content: raw(editedInfo, false, true),
          onOk() {
            run(getQuery());
          },
          okText: '确认',
          cancelText: '取消',
        });
      }

      // 对于非备案的字段
      if (isEdit && editedInfoForNotRecord && _get(currentRecord, 'registered_Flag', '') !== '1') {
        const editedContent = editedInfoForNotRecord.split(',');
        const threeElements = ['证件号', '业务类型', '培训车型'];
        // idcard busitype traintype
        const result = editedContent.filter((edited) => threeElements.includes(edited));
        if (result.length) {
          const { traintype, idcard, busitype } = values;
          const { studenttype, sid } = data;
          const res = await beforeIsReduceCard(sid, studenttype, traintype, idcard, busitype);
          const isContinue = _get(res, 'isContinue');
          if (!isContinue) return;
          const isNeedReduceCard = _get(res, 'isNeedReduceCard');
          if (isNeedReduceCard) {
            return confirm({
              title: '信息提示',
              content: raw(result.join(','), true, false),
              onOk() {
                run(getQuery());
              },
              okText: '确认',
              cancelText: '取消',
            });
          }
        }
      }

      if (isPreSignUp) {
        //预报名审核 - 新增 点击确定需要弹出提醒
        const schoolId = _get(values, 'applyerschoolid');
        const selectSchool = _get(schoolData, 'rows', []).filter((item) => {
          return String(item.value) === String(schoolId);
        });
        return confirm({
          title: `请确认是否为该学员报名${_get(selectSchool, '0.text', '')}？报名后，驾校不可更改。`,
          onOk() {
            run(getQuery());
          },
          okText: '确认',
          cancelText: '取消',
        });
      }
      run(getQuery());
    });
  };

  // 教练远程搜索时关键字标红
  const lightKeyWords = (name: string, lightArr: number[]) => {
    let nameArr = name.split('');
    const newName = nameArr.map((item, index) => {
      if (lightArr.includes(index)) {
        return <span style={{ color: 'red' }}>{item}</span>;
      } else {
        return item;
      }
    });
    return newName;
  };

  // v1.63 业务类型非 【货运运营初领】和【货运运营增领】时，备案信息补充中的所有选项都变为非必需项
  useEffect(() => {
    setIsRequired(businessType === '12' || businessType === '11');
  }, [businessType]);

  const { data: maxScreen } = useFetch({
    request: _getCustomParam, // 裁剪最大尺寸
    query: { paramCode: 'stu_image_max_screen', schoolId: Auth.get('schoolId') },
  });
  const { data: minScreen } = useFetch({
    request: _getCustomParam, // 裁剪最小尺寸
    query: { paramCode: 'stu_image_min_screen', schoolId: Auth.get('schoolId') },
  });
  const { data: driveLicenceSize } = useFetch({
    request: _getCustomParam, // 驾驶证图片最大值
    query: { paramCode: 'driving_licence_size_limit', schoolId: Auth.get('schoolId') },
  });
  //自输入信息控制
  const autoInputItem = useMemo(() => {
    return autoInput && autoInput.length ? (
      autoInput
        // TODO: 可能还需要修改 1. queryType === '手动输入' 2. === '下拉输入' （怎么去做兼容）
        .filter((item) => item.updateStatus === '1')
        .map((item) => {
          if (item.queryType === '2') {
            return (
              <ItemCol
                required={item.requiredStatus === '1'}
                span={8}
                label={item.nameValue}
                name={item.name}
                rules={[{ required: item.requiredStatus === '1' }]}
              >
                <Select
                  style={{ width: '80%' }}
                  options={optionStore[`-1${item.codeType}`]}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                />
              </ItemCol>
            );
          } else {
            return (
              <ItemCol
                key={_get(item, 'id')}
                required={item.requiredStatus === '1'}
                label={item.nameValue}
                span={8}
                name={item.name}
                rules={[
                  { required: item.requiredStatus === '1' },
                  { max: item.strlen, message: `有效长度为${item.strlen}` },
                ]}
              >
                <Input />
              </ItemCol>
            );
          }
        })
    ) : (
      <></>
    );
  }, [autoInput, optionStore]);

  const init = {};
  autoInput
    .filter((item: any) => item.updateStatus === '1')
    .forEach((item: any) => {
      init[item.name] = _get(data, item.name, '');
    });

  const CARD_ARR: any = (
    <Row justify="start" key="account">
      {subAccounts.map((cardMoney) => {
        return (
          <Col key={cardMoney.subAccountType} style={{ marginRight: '12px' }}>
            <Alert
              message={
                cardMoney.subAccountType === 'A1'
                  ? cardMoney.accountBalance == '-1' //如果驾校剩余名额剩余-1，展示错误信息
                    ? `${cardMoney.subAccountName} : ${cardMoney.msg}`
                    : `${cardMoney.subAccountName} ${cardMoney.accountBalance}`
                  : `${cardMoney.subAccountName} ${cardMoney.accountBalance}`
              }
              type="warning"
              showIcon
            />
          </Col>
        );
      })}
    </Row>
  );

  return (
    <>
      {/* 选择银行 */}
      <Modal
        title="选择收款钱包"
        visible={bankVisible}
        onOk={setBankVisible}
        onCancel={() => {
          // setBankName(_get(data, 'bankchannelname', ''));
          setBankVisible();
          // setBankchannelid(_get(data, 'bankchannelid', ''));
        }}
      >
        {openAccountData?.length ? (
          <Radio.Group
            value={bankchannelid}
            onChange={(value: RadioChangeEvent) => {
              const openAccountDataInfo = openAccountData.filter(
                (x) => x.bankChannelId === _get(value, ['target', 'value'], ''),
              );
              setBankchannelid(value.target.value);
              setBankaccount(_get(openAccountDataInfo, [0, 'bankChannelId'], ''));
              setBankName(_get(openAccountDataInfo, [0, 'acctBankName'], ''));
            }}
          >
            <Space direction="vertical">
              {openAccountData.map((item, index) => (
                <Radio value={item?.bankChannelId} key={index} disabled={item?.status == 0}>
                  {item?.acctBankName}（账号：
                  {item?.status == 0 || _get(item, 'acctNo', '').length == 0
                    ? '/'
                    : _get(item, 'acctNo', '').length < 6
                    ? _get(item, 'acctNo')
                    : _get(item, 'acctNo', '').substr(0, 3) +
                      '***' +
                      _get(item, 'acctNo', '').substr(_get(item, 'acctNo', '').length - 3)}
                  ）{item?.status == 0 ? <a href="./financial/wallet">前往开户</a> : null}
                  {item?.rakeBack === '0' ? null : (
                    <img alt="" src={rebateIcon} title="本渠道支持注册返佣，详询服务工程师。" />
                  )}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        ) : (
          <Empty />
        )}
      </Modal>
      {
        // 检查点卡余额是否充裕
        rechargeVisible && (
          <Modal
            // getContainer={false}
            visible={rechargeVisible}
            onCancel={setRechargeVisible}
            onOk={setRechargeVisible}
            closable={false}
          >
            <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
              <div>{accountName}余额不足， 若已开通点卡在线购买，</div>
              请点击此处
              <div
                className={editStyles.recharge}
                onClick={() => {
                  _push(`financial/wellcomeWallet`, { accountType });
                  setRechargeVisible();
                }}
              >
                充值
              </div>
            </div>
          </Modal>
        )
      }
      {/* 审核取消原因 */}
      {reviewVisible && (
        <Reason
          currentId={_get(currentRecord, 'sid')}
          onReasonCancel={setReviewVisible}
          onOk={() => {
            setReviewVisible();
            onOk();
          }}
        />
      )}
      {checkVisible && ( //预报名审核
        <CheckFail
          currentId={_get(currentRecord, 'sid')}
          onCancel={setCheckVisible}
          onOk={() => {
            setCheckVisible();
            onOk();
          }}
        />
      )}
      {photographVisible && (
        <Photograph
          onCancel={setPhotographVisible}
          getImgData={(imgData: any) => {
            setImageUrl(_get(imgData, 'url'));
            setImgId(_get(imgData, 'id'));
          }}
          limitWidth={{
            min: _get(minScreen, 'paramValue', ';').split(';')[0],
            max: _get(maxScreen, 'paramValue', ';').split(';')[0],
          }}
          limitHeight={{
            min: _get(minScreen, 'paramValue', ';').split(';')[1],
            max: _get(maxScreen, 'paramValue', ';').split(';')[1],
          }}
          onOk={setPhotographVisible}
          type="photo"
        />
      )}
      {driverPhotographVisible && (
        <Photograph
          onCancel={setDriverPhotographVisible}
          getImgData={(imgData: any) => {
            setDriveUrl(_get(imgData, 'url'));
            setDrilicenceossid(_get(imgData, 'id'));
          }}
          maxSize={Number(_get(driveLicenceSize, 'paramValue', 0))}
          onOk={setDriverPhotographVisible}
          type="fileImg" /**XQ100017为适配高拍仪 ，驾驶证图片拍照使用较大弹窗 */
        />
      )}
      {/* 镇江 */}
      {drivercertificateVisible && (
        <Photograph
          onCancel={setDrivercertificateVisible}
          getImgData={(imgData: any) => {
            setDrivercertificate_show(_get(imgData, 'url'));
            setDrivercertificate(_get(imgData, 'id'));
          }}
          onOk={setDrivercertificateVisible}
          type="fileImg"
        />
      )}
      {livingproofVisible && (
        <Photograph
          onCancel={setLivingproofVisible}
          getImgData={(imgData: any) => {
            setLivingproof_show(_get(imgData, 'url'));
            setLivingproof(_get(imgData, 'id'));
          }}
          onOk={setLivingproofVisible}
          type="fileImg"
        />
      )}
      {lettercommitmentVisible && (
        <Photograph
          onCancel={setLettercommitmentVisible}
          getImgData={(imgData: any) => {
            setlettercommitment_show(_get(imgData, 'url'));
            setLettercommitment(_get(imgData, 'id'));
          }}
          onOk={setLettercommitmentVisible}
          type="fileImg"
        />
      )}
      {faceidcardVisible && (
        <Photograph
          onCancel={setFaceidcardVisible}
          getImgData={(imgData: any) => {
            setFaceidcard_show(_get(imgData, 'url'));
            setFaceidcard(_get(imgData, 'id'));
          }}
          onOk={setFaceidcardVisible}
          type="fileImg"
        />
      )}
      {originalcertificateVisible && (
        <Photograph
          onCancel={setOriginalcertificateVisible}
          getImgData={(imgData: any) => {
            setOriginalcertificate_show(_get(imgData, 'url'));
            setOriginalcertificate(_get(imgData, 'id'));
          }}
          onOk={setOriginalcertificateVisible}
          type="fileImg"
        />
      )}

      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法进行读取身份证信息" />}

      <Drawer
        visible
        destroyOnClose
        getContainer={false}
        maskClosable={isEdit}
        width={1100}
        title={title}
        onClose={onCancel}
        footer={
          <>
            <div style={{ textAlign: 'right' }}>
              {isReview || isChecked //意向学员 || 预报名审核
                ? [
                    <div key={1}>{isChecked && CARD_ARR}</div>, // 预报名审核页面展示点卡信息
                    <Button key="close" className="ml20" onClick={onCancel}>
                      关闭
                    </Button>,
                    <Button
                      key="reviewFail"
                      type="primary"
                      className="ml20"
                      onClick={isReview ? setReviewVisible : setCheckVisible}
                    >
                      审核失败
                    </Button>,
                    <Button
                      loading={confirmLoading}
                      key="reviewSuccess"
                      type="primary"
                      className="ml20"
                      onClick={requestData}
                    >
                      {isReview ? '审核并注册' : '审核通过'}
                    </Button>,
                  ]
                : [
                    <div key={1}>{(!isEdit || (isEdit && isPreSignUp)) && CARD_ARR}</div>, // 其他页面：学员档案编辑保持不展示点卡信息，预报名受理页面展示点卡信息
                    <div key={2} style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
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
                          loading={confirmLoading || reduceCardLoading}
                          type="primary"
                          onClick={requestData}
                        >
                          确定
                        </Button>
                      </div>
                    </div>,
                  ]}
            </div>
          </>
        }
      >
        {isShowReadIdCard && (
          <Button
            loading={readCardLoading}
            style={{ float: 'right' }}
            onClick={async () => {
              setReadCardLoading(true);
              if ($isForceUpdatePlugin) {
                setReadCardLoading(false);
                return setUpdatePluginVisible();
              }
              const stuName = _get(data, 'name', '');
              const isNameDisable = keyInfos.includes('name');
              const isIdCardDisable = keyInfos.includes('idcard');
              const isImgDisable = keyInfos.includes('head_img_oss_id');
              const isAddressDisable = keyInfos.includes('address');
              const readCardResult = await readStuIdCardData();

              setReadCardLoading(false);
              if (isEmpty(readCardResult)) {
                return setUpdatePluginVisible();
              } else {
                const result = _get(readCardResult, 'result');
                const _name = _get(result, 'data.name', ''); //读身份证读取的姓名
                const _idcard = _get(result, 'data.idNo', ''); //读二代证读取的姓名
                const stuIdCard = _get(data, 'idcard', '');
                if (_get(result, 'return') !== '144') {
                  return;
                }
                setIccardcode(_get(result, 'cardNo')); // 身份证物理卡号
                setCardtype('1');
                let birthday = `${_idcard.substring(6, 10)}-${_idcard.substring(10, 12)}-${_idcard.substring(12, 14)}`;
                const confirmNameTitle = `读取二代身份证姓名（${_name}）与学员姓名不一致，请确认是否修改`;
                const confirmIdTitle = `读取二代身份证号（${_idcard}）与学员证件号不一致，请确认是否修改`;
                const nameTitle = `读取二代身份证姓名（${_name}）与学员姓名不一致，不能修改`;
                const idTitle = `读取二代身份证号（${_idcard}）与学员证件号不一致，不能修改`;

                //新增时读取二代证(无需判断字段是否允许修改)
                if (!isEdit) {
                  handleReadStuIdCardNormal({ form, result, birthday, setImageUrl, setImgId });
                  return;
                }
                //编辑时读取二代证(需判断字段是否允许修改)
                if (stuName != _name) {
                  if (isNameDisable) {
                    message.error(`${nameTitle}`);
                    return;
                  } else {
                    confirm({
                      title: '信息提示',
                      content: `${confirmNameTitle}`,
                      onOk() {
                        form.setFieldsValue({ name: _name });
                        if (stuIdCard != _idcard) {
                          if (isIdCardDisable) {
                            message.error(`${idTitle}`);
                            return;
                          } else {
                            confirm({
                              title: '信息提示',
                              content: `${confirmIdTitle}`,
                              onOk: async () => {
                                handleStuIdCardDiff({
                                  result,
                                  form,
                                  birthday,
                                  isImgDisable,
                                  setImageUrl,
                                  setImgId,
                                });
                              },
                              okText: '确认',
                              cancelText: '取消',
                            });
                          }
                        } else {
                          handleStuIdCardDiff({
                            result,
                            form,
                            birthday,
                            isImgDisable,
                            setImageUrl,
                            setImgId,
                          });
                        }
                      },
                      okText: '确认',
                      cancelText: '取消',
                    });
                  }
                } else {
                  if (stuIdCard != _idcard) {
                    if (isIdCardDisable) {
                      message.error(`${idTitle}`);
                      return;
                    } else {
                      confirm({
                        title: '信息提示',
                        content: `${confirmIdTitle}`,
                        onOk: async () => {
                          handleStuIdCardDiff({
                            result,
                            form,
                            birthday,
                            isImgDisable,
                            setImageUrl,
                            setImgId,
                          });
                        },
                        okText: '确认',
                        cancelText: '取消',
                      });
                    }
                  } else {
                    handleStuIdCardDiff({
                      result,
                      form,
                      birthday,
                      isImgDisable,
                      setImageUrl,
                      setImgId,
                    });
                  }
                }
              }
            }}
          >
            读二代证
          </Button>
        )}
        {loading && <Loading />}

        {!loading && (
          <>
            <Form
              form={form}
              autoComplete="off"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              initialValues={{
                ...{
                  name: _get(data, 'name'),
                  sex: _get(data, 'sex'),
                  cardtype,
                  idcard: _get(data, 'idcard'),
                  idcardVerify: _get(data, 'idcard'),
                  nationality: _get(data, 'nationality', '156'),
                  phone: _get(data, 'phone'),
                  address: _get(data, 'address'),
                  busitype: _get(data, 'busitype'),
                  fstdrilicdate: _get(data, 'fstdrilicdate') ? moment(_get(data, 'fstdrilicdate')) : '',
                  perdritype:
                    $areaNum === '04'
                      ? _get(data, 'perdritype')
                        ? _get(data, 'perdritype').split(',')
                        : []
                      : _get(data, 'perdritype'),
                  traintype: _get(data, 'traintype'),
                  // applydate: moment(_get(data, 'applydate')),
                  // isotherprovince: _get(data, 'isotherprovince'),
                  package_id,
                  cid: _get(data, 'cid'),
                  islocal,
                  livecardnumber: _get(data, 'livecardnumber'),
                  liveaddress: _get(data, 'liveaddress'),
                  note: _get(data, 'note'),
                  birthday: _moment(_get(data, 'birthday')),
                  drilicnum,
                  applyerschoolid: _get(data, 'applyerschoolid', ''),

                  // 12-1 镇江备案信息回填
                  education: _get(data, 'education', ''),
                  nationalReconciliation: _get(data, 'nationalReconciliation', ''),
                  postcode: _get(data, 'postcode', ''),
                  healthState: _get(data, 'healthState', ''),
                  technicalPost: _get(data, 'technicalPost', ''),
                  email: _get(data, 'email', ''),
                  // 12-8 镇江备案信息补充 驾校有效起始 驾校有效期
                  drivlicestartdate: _get(data, 'drivlicestartdate') ? moment(_get(data, 'drivlicestartdate')) : '',
                  drivliceperiod: _get(data, 'drivliceperiod', ''),
                },
                ...init,
              }}
            >
              <Title>基本信息</Title>

              <Row>
                <ItemCol
                  span={8}
                  label="姓名"
                  name="name"
                  rules={[{ whitespace: true, required: true }, RULES.STUDENT_NAME]}
                >
                  <Input disabled={isEdit && keyInfos.includes('name')} />
                </ItemCol>

                <ItemCol
                  span={8}
                  label="联系电话"
                  name="phone"
                  extra="请填写学员的真实手机号"
                  rules={[{ whitespace: true, required: true }, RULES.TEL_11]}
                >
                  <Input disabled={isEdit && keyInfos.includes('phone')} />
                </ItemCol>
                <ItemCol required span={8} label="证件类型">
                  <Select
                    options={$areaNum === '02' && isStudents ? cardTypeOptionsGD : cardTypeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('cardtype')}
                    onChange={(value: string) => {
                      setCardtype(value);
                      if (value === '1') {
                        //若学员是身份证号：1、出生日期、性别 不允许修改；2、从身份证号，提取 出生日期、性别。
                        setDisabled(true);
                        setIdCardRules(ID_CARD_RULES); //身份证号 根据身份证号校验
                        let idcardVal = form.getFieldValue('idcard');
                        if (!isEmpty(idcardVal) && isShowOriginalDriverInfo) {
                          setDrilicnum(idcardVal);
                        }
                      } else {
                        setIdCardRules(RULES.OTHER_CARDTYPE); //除身份证号  只校验证件号长度
                        setDisabled(false);
                      }
                      form.validateFields(['idcard']);
                    }}
                    value={cardtype}
                  />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol
                  name="idcard"
                  span={8}
                  label="证件号"
                  rules={[{ whitespace: true, required: true }, idCardRules]}
                >
                  <Input
                    disabled={isEdit && keyInfos.includes('idcard')}
                    onChange={(e: any) => {
                      // setIdCard(e.target.value);
                      cardtype === '1' && isShowOriginalDriverInfo && setDrilicnum(e.target.value); //业务类型是增领并且证件类型是身份证，默认帮用户填上身份证号
                      if (e.target.value.length === 18) {
                        if (cardtype === '1') {
                          //身份证类型，禁用出生日期和性别
                          setDisabled(true);
                        } else {
                          setDisabled(false);
                        }
                        let value = e.target.value;
                        let birthday = `${value.substring(6, 10)}-${value.substring(10, 12)}-${value.substring(
                          12,
                          14,
                        )}`;
                        let sex = value[16] % 2 === 0 ? '2' : '1';
                        form.setFieldsValue({ sex: sex });
                        form.setFieldsValue({ birthday: moment(birthday).isValid() ? moment(birthday) : moment() });

                        // 保持统一 证件号变化的时候 同步校验 出生日期
                        form.validateFields(['birthday']).catch((err) => {
                          console.error(err);
                        });
                      }
                    }}
                  />
                </ItemCol>

                <ItemCol span={8} label="证件号确认" name="idcardVerify" rules={[{ whitespace: true, required: true }]}>
                  <Input disabled={isEdit && keyInfos.includes('idcard')} />
                </ItemCol>
                <ItemCol
                  span={8}
                  label="出生日期"
                  name="birthday"
                  rules={
                    [
                      { required: true },
                      {
                        validator: (rule, value, callback) => {
                          const isAudit = moment().diff(moment(value), 'year') >= 18;
                          if (!isAudit) {
                            callback('年龄不满18周岁，不能注册');
                          }

                          callback();
                        },
                      },
                    ] as Rule[]
                  }
                >
                  <DatePicker
                    picker="date"
                    allowClear={false}
                    disabled={disabled || (isEdit && keyInfos.includes('birthday'))}
                    disabledDate={(current) => {
                      return current.diff(moment(new Date(), 'days')) > 0;
                    }}
                  />
                </ItemCol>
                <ItemCol span={8} required label="性别" name="sex" rules={[{ required: true }]}>
                  <Select
                    options={genderOptions}
                    disabled={disabled || (isEdit && keyInfos.includes('sex'))}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  />
                </ItemCol>
                <ItemCol span={8} label="国籍" name="nationality" rules={[{ required: true }]}>
                  <Select
                    options={nations}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('nationality')}
                    onChange={(value: string) => {
                      setNationality(value);
                    }}
                    showSearch
                    filterOption={false}
                    onSearch={(value) => {
                      setNations(
                        nationalityTypeOptions.filter((item) => {
                          return item.label.includes(value);
                        }),
                      );
                    }}
                  />
                </ItemCol>
                <ItemCol name="traintype" span={8} label="培训车型" rules={[{ required: true }]}>
                  <Select
                    options={businessScopeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={(isEdit && keyInfos.includes('traintype')) || isAfterFirstRecord}
                    value={traintype}
                    onChange={(value: any) => {
                      setIsChangeCarTypeOrBusiType((x) => x + 1);
                      form.setFieldsValue({ busitype: '0' }); // 选择培训车型后，业务类型默认是初领

                      // setStuType(isEdit ? _get(currentRecord, 'studenttype', '') : studenttype);
                      // 如果是转入学员，查询班级的studenttype参数统一传‘1’
                      // 如果是非转入学员：studenttype参数传‘0’
                      const currentStudentType = !isPreSignUp
                        ? isEdit
                          ? _get(currentRecord, 'studenttype', '')
                          : studenttype
                        : stuType;

                      if (currentStudentType !== '1') {
                        setStuType('0');
                      } else {
                        setStuType('1');
                      }
                      setTraintype(value);
                      if (isClassCanSelect && !isAfterFirstRecord) {
                        setPackage_id('');
                        setPackage_name('');
                      }
                      setTrain_price_online(0);
                    }}
                  />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol
                  span={16}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="地址"
                  name="address"
                  rules={[{ whitespace: true, required: true }, RULES.ADDRESS]}
                >
                  <Input style={{ width: '102%' }} disabled={isEdit && keyInfos.includes('address')} />
                </ItemCol>

                <ItemCol span={8} label="业务类型" name="busitype" rules={[{ whitespace: true, required: true }]}>
                  <Select
                    options={studenttype === '0' ? busitypeOptions : busiTypeOptionsTransfer}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('busitype')}
                    onChange={(value) => {
                      setIsChangeCarTypeOrBusiType((x) => x + 1);
                      setBusinessType(value);
                      if (isClassCanSelect && !isAfterFirstRecord) {
                        setPackage_id('');
                        setPackage_name('');
                      }

                      // 如果是转入学员，查询班级的studenttype参数统一传‘1’
                      // 如果是非转入学员：
                      // 1、如果业务类型11 、12（货运运营初领、货运运营增领）studenttype参数传‘2’
                      // 2、如果非业务类型11、12（货运运营初领、货运运营增领），studenttype参数传‘0’
                      const currentStudentType = !isPreSignUp
                        ? isEdit
                          ? _get(currentRecord, 'studenttype', '')
                          : studenttype
                        : stuType;

                      if (cardtype === '1' && (value === '1' || value === '11' || value === '12')) {
                        //业务类型是增领并且证件类型是身份证，默认帮用户填上身份证号
                        setDrilicnum(form.getFieldValue('idcard'));
                      } else {
                        setDrilicnum('');
                      }

                      if (currentStudentType !== '1') {
                        if (value === '11' || value === '12') {
                          setStuType('2');
                        } else {
                          setStuType('0');
                        }
                      } else {
                        setStuType('1');
                      }
                    }}
                  />
                </ItemCol>
                {isShowOriginalDriverInfo && (
                  <>
                    <ItemCol required span={8} label="原驾驶证号" rules={[RULES.DRIVER_LICENSE]}>
                      <Input
                        disabled={isEdit && keyInfos.includes('drilicnum')}
                        value={drilicnum}
                        onChange={(e: any) => {
                          if (cardtype !== '1' || isEmpty(form.getFieldValue('idcard'))) {
                            setDrilicnum(e.target.value);
                          }
                        }}
                      />
                    </ItemCol>
                    <ItemCol span={8} label="初领日期" name="fstdrilicdate" rules={[{ required: true }]}>
                      <DatePicker
                        disabled={isEdit && keyInfos.includes('fstdrilicdate')}
                        disabledDate={(current) => {
                          return current.diff(moment(new Date(), 'days')) > 0;
                        }}
                      />
                    </ItemCol>
                    <ItemCol span={8} label="原准驾车型" name="perdritype" rules={[{ required: true }]}>
                      <Select
                        mode={$areaNum === '04' ? 'multiple' : undefined}
                        options={carTypeOptions}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                        disabled={isEdit && keyInfos.includes('perdritype')}
                      />
                    </ItemCol>
                  </>
                )}
              </Row>
              {/* _get(data, 'stutransareatype', '') 是详情接口数据返回，供给编辑页面打开使用，stutransareatype：转入按钮页面进入*/}
              {/* stutransareatype= 1：省外转入 2：省内异地转入 3：本市的时候，展示转出驾校省市，其他情况不展示*/}
              {/*isPreSignUp:预报名受理 isReview:意向学员*/}
              {isTrans && (
                <Row>
                  <ItemCol required span={16} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="转出驾校省市">
                    <Address
                      isEdit={isEdit}
                      cityCode={jump_fromarea}
                      stutransareatype={transCode}
                      setCityCode={setJump_fromarea}
                    />
                  </ItemCol>
                </Row>
              )}
              {/* 预报名 和 预审核 转正 审核 （是否可编辑）  */}
              {isPreSignUp && (
                <Row>
                  <ItemCol required span={8} label="是否转入">
                    <Select
                      disabled={isDisabledEditTransferInto}
                      value={isOtherProvince}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        if (value === '1') {
                          setStuType(value);
                        } else {
                          // 非转入的情况 要考虑到 目前的 业务类型是否是 11 12
                          if (businessType === '12' || businessType === '11') {
                            setStuType('2');
                          } else {
                            setStuType('0');
                          }
                        }
                        setIsOtherProvince(value);
                      }}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    >
                      <Option key={'0'} value={'0'}>
                        否
                      </Option>
                      <Option key={'1'} value={'1'}>
                        是
                      </Option>
                    </Select>
                  </ItemCol>
                  {isOtherProvince === '1' ? (
                    <ItemCol required span={16} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="转出驾校省市">
                      <Address cityCode={jump_fromarea} setCityCode={setJump_fromarea} />
                    </ItemCol>
                  ) : null}
                </Row>
              )}

              <Row>
                <ItemCol required span={8} label="照片">
                  <UploadPro
                    getLimitSizeFromParam //上传图片最大尺寸从自定义参数取
                    maxSize={2}
                    disabled={photoDisable}
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    setImgId={setImgId}
                    isPress
                    isCrop
                    limitWidth={{
                      min: _get(minScreen, 'paramValue', ';').split(';')[0],
                      max: _get(maxScreen, 'paramValue', ';').split(';')[0],
                    }}
                    limitHeight={{
                      min: _get(minScreen, 'paramValue', ';').split(';')[1],
                      max: _get(maxScreen, 'paramValue', ';').split(';')[1],
                    }}
                  />
                  <Button
                    className={photoCls}
                    style={{ border: 0 }}
                    disabled={photoDisable}
                    onClick={() => {
                      setPhotographVisible();
                    }}
                  >
                    拍照
                  </Button>
                </ItemCol>
                {/*
                  条件一镇江：从业学员（根据业务类型联动busitype为11和12）报名备案新增信息录入
                  条件二业务类型为货运运营初领或货运运营增领，且配置监管地址为国交时才显示该项
                  jGRequestPlatformType:0 国交  businessType：11：初领 12：增领
                  镇江从业显示驾驶证图片并且是非必填
                */}
                {showDriverLicense && (
                  <ItemCol required={$areaNum !== '05'} span={8} label="驾驶证图片">
                    <UploadPro
                      maxSize={Number(_get(driveLicenceSize, 'paramValue', 0)) / 1024}
                      imageUrl={driveUrl}
                      setImageUrl={setDriveUrl}
                      setImgId={setDrilicenceossid}
                      fileTypes={
                        showDriverLicenseRequire
                          ? ['image/jpeg', 'image/png', 'image/jpeg']
                          : ['image/jpeg', 'image/png', 'image/bmp', 'image/gif']
                      }
                    />
                    <span className="color-primary pointer" onClick={setDriverPhotographVisible}>
                      拍照
                    </span>
                  </ItemCol>
                )}
              </Row>
              {/* 镇江：从业学员（根据业务类型联动busitype为11和12）报名备案新增信息录入 */}
              {$areaNum === '05' && isShow && (
                <>
                  <Title>备案信息补充</Title>
                  <Row>
                    <ItemCol span={8} label="安驾证明">
                      <UploadPro
                        imageUrl={drivercertificate_show}
                        setImageUrl={setDrivercertificate_show}
                        setImgId={setDrivercertificate}
                      />
                      <span className="color-primary pointer" onClick={setDrivercertificateVisible}>
                        拍照
                      </span>
                    </ItemCol>

                    <ItemCol span={8} label="居住证明">
                      <UploadPro
                        imageUrl={livingproof_show}
                        setImageUrl={setLivingproof_show}
                        setImgId={setLivingproof}
                      />
                      <span className="color-primary pointer" onClick={setLivingproofVisible}>
                        拍照
                      </span>
                    </ItemCol>

                    <ItemCol span={8} label="承诺书">
                      <UploadPro
                        imageUrl={lettercommitment_show}
                        setImageUrl={setlettercommitment_show}
                        setImgId={setLettercommitment}
                      />
                      <span className="color-primary pointer" onClick={setLettercommitmentVisible}>
                        拍照
                      </span>
                    </ItemCol>
                  </Row>
                  <Row>
                    <ItemCol span={8} label="身份证正面">
                      <UploadPro imageUrl={faceidcard_show} setImageUrl={setFaceidcard_show} setImgId={setFaceidcard} />
                      <span className="color-primary pointer" onClick={setFaceidcardVisible}>
                        拍照
                      </span>
                    </ItemCol>

                    <ItemCol span={8} label="原从业资格证">
                      <UploadPro
                        imageUrl={originalcertificate_show}
                        setImageUrl={setOriginalcertificate_show}
                        setImgId={setOriginalcertificate}
                      />
                      <span className="color-primary pointer" onClick={setOriginalcertificateVisible}>
                        拍照
                      </span>
                    </ItemCol>
                  </Row>
                  {/* 12-1 镇江学员报名是新增录入字段用于结业审核 */}
                  <Row>
                    <ItemCol span={8} label="民族" name={'nationalReconciliation'}>
                      <Select
                        style={{ width: '80%' }}
                        options={nationalOptions}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      />
                    </ItemCol>

                    <ItemCol span={8} label="住址邮件编码" name={'postcode'}>
                      <Input />
                    </ItemCol>
                    <ItemCol span={8} label="专业技术" name={'technicalPost'}>
                      <Input />
                    </ItemCol>
                  </Row>

                  <Row>
                    <ItemCol span={8} label="学历" name={'education'}>
                      <Select
                        style={{ width: '80%' }}
                        options={educationOptions}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      />
                    </ItemCol>
                    <ItemCol span={8} label="健康状态" name={'healthState'}>
                      <Select
                        style={{ width: '80%' }}
                        options={healthStatusOptions}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      />
                    </ItemCol>
                    <ItemCol span={8} label="电子信箱" name={'email'}>
                      <Input />
                    </ItemCol>
                  </Row>

                  {/* 12-8  */}
                  <Row>
                    <ItemCol span={8} label="驾照有效期始" name="drivlicestartdate" rules={[{ required: isRequired }]}>
                      <DatePicker style={{ width: '80%' }} />
                    </ItemCol>
                    <ItemCol span={8} label="驾照的有效期" name="drivliceperiod" rules={[{ required: isRequired }]}>
                      <Select
                        style={{ width: '80%' }}
                        options={driverLicenseValidityOptions}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      />
                    </ItemCol>
                  </Row>
                </>
              )}

              <Title>培训信息</Title>

              <Row>
                {isPreSignUp && ( //编辑禁用报名驾校
                  <ItemCol span={8} label="报名驾校" name="applyerschoolid" rules={[{ required: true }]}>
                    <Select
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      disabled={isEdit}
                      filterOption={false}
                      onChange={(val) => {
                        setApplySchoolid(val);
                      }}
                    >
                      {_get(schoolData, 'rows', []).map((item) => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.text}
                          </Option>
                        );
                      })}
                    </Select>
                  </ItemCol>
                )}
                {isShowClassCoach && (
                  <>
                    {isChecked && ( //预报名审核页面展示，不可编辑
                      <ItemCol span={8} label="学车教练">
                        <Input disabled={true} value={coachName} />
                      </ItemCol>
                    )}
                    {!isChecked && (
                      <ItemCol span={8} label="学车教练" name="cid">
                        <Select
                          getPopupContainer={(triggerNode) => triggerNode.parentElement}
                          disabled={isEdit && (keyInfos.includes('cid') || isChecked)}
                          // value={value}
                          allowClear
                          onClear={() => {
                            setCoachName('');
                            const query = { coachname: '' };
                            _getCoachList(query).then((res) => {
                              setCoachList(_get(res as { data: Coach[] }, 'data', []));
                            });
                          }}
                          showSearch
                          filterOption={false}
                          onSearch={(value) => {
                            const query = { coachname: value };
                            _getCoachList(query).then((res) => {
                              setCoachList(_get(res as { data: Coach[] }, 'data', []));
                            });
                          }}
                          onSelect={(a: any, b: any) => {
                            setCoachName(b?.dataCoachName);
                          }}
                        >
                          {coachList.map((coach) => {
                            return (
                              <Option key={coach.cid} value={coach.cid} dataCoachName={coach.coachname}>
                                <Tooltip
                                  color={'#fff'}
                                  overlayInnerStyle={{ color: '#000', border: '1px solid #999', fontSize: 12 }}
                                  title={_get(coach, 'coachname', '')}
                                >
                                  {lightKeyWords(
                                    _get(coach, 'coachname', ''),
                                    _get(coach, 'hitIndexes', [] as number[]),
                                  )}
                                </Tooltip>
                              </Option>
                            );
                          })}
                        </Select>
                      </ItemCol>
                    )}
                    {!isClassCanSelect && ( //预报名审核页面展示，不可编辑
                      <ItemCol span={8} label="学员班级">
                        <Input disabled={true} value={_get(data, 'package_name')} />
                      </ItemCol>
                    )}
                    {isClassCanSelect && (
                      <ItemCol required span={8} label="学员班级" rules={[{ required: true }]}>
                        <Select
                          getPopupContainer={(triggerNode) => triggerNode.parentElement}
                          disabled={isEdit && (keyInfos.includes('package_id') || isChecked)}
                          value={package_name}
                          showSearch
                          optionFilterProp={'children'}
                          onChange={(value: any) => {
                            if (value === package_id) {
                              return; // hack 由于学员班级的value 不是 package_Id 导致 onChange事件点击同一个班级是会一直触发
                            }
                            const effectiveClassData: any = effectiveClass.filter((x: any) => x.packid === value);

                            setPackage_name(_get(effectiveClassData, '0.packlabel', ''));
                            setPackage_id(_get(effectiveClassData, '0.packid', ''));
                            setTrain_price_online(_get(effectiveClassData, '0.train_price_online', ''));
                            setIsChangeClass((count) => count + 1);
                          }}
                        >
                          {effectiveClass.map((item: any) => {
                            return (
                              <Option key={item.packid} value={item.packid}>
                                {item.packlabel}
                              </Option>
                            );
                          })}
                        </Select>
                        {!!train_price_online && <div className="mt10">需学员在线缴费{train_price_online}</div>}
                      </ItemCol>
                    )}
                    {!!train_price_online && ( //存在bankchannelid时显示，用于编辑时回显
                      <ItemCol required span={8} label="收款钱包" rules={[{ required: true }]}>
                        {bankName ? bankName : ''}
                        <Button
                          onClick={() => {
                            walletRequest({ package_id: package_id, cid: form.getFieldValue('cid') });
                          }}
                          loading={load || checkIsDefaultWalletLoading}
                        >
                          选择收款钱包
                        </Button>
                      </ItemCol>
                    )}
                  </>
                )}
              </Row>
              {!isPreSignUp && isShowRobot ? (
                <>
                  <Title>机器人教练</Title>
                  <Row>
                    <ItemCol required span={8} label="是否开启">
                      <Select
                        value={isOpenRobot}
                        onChange={(value) => {
                          setIsOpenRobot(value);
                        }}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      >
                        <Option key={'0'} value={'0'}>
                          否
                        </Option>
                        <Option key={'1'} value={'1'}>
                          是
                        </Option>
                      </Select>
                    </ItemCol>
                    {isOpenRobot === '1' ? (
                      <ItemCol required span={8} label="选择教案">
                        <Select
                          value={robotPlanId}
                          onChange={(value) => {
                            setRobotPlanId(value);
                          }}
                          options={courseList.map((course: any) => {
                            return {
                              label: course?.courseName,
                              value: course?.id,
                            };
                          })}
                          getPopupContainer={(triggerNode) => triggerNode.parentElement}
                        />
                      </ItemCol>
                    ) : null}
                  </Row>
                </>
              ) : null}

              <Title>其他信息</Title>
              <Row>{autoInputItem}</Row>
              <Row>
                <ItemCol required span={8} label="是否本地">
                  <Select
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('islocal')}
                    onChange={(value) => {
                      setIsLocal(value);
                    }}
                    value={islocal}
                  >
                    <Option key={'0'} value={'0'}>
                      否
                    </Option>
                    <Option key={'1'} value={'1'}>
                      是
                    </Option>
                  </Select>
                </ItemCol>
                {String(islocal) === '0' && ( //不是本地，才显示该字段
                  <>
                    <ItemCol span={8} label="居住证号" name="livecardnumber" rules={[RULES.RESIDENCE_PERMIT_NO]}>
                      <Input disabled={isEdit && keyInfos.includes('livecardnumber')} />
                    </ItemCol>

                    <ItemCol span={8} label="居住地址" name="liveaddress" rules={[RULES.RESIDENCE_PERMIT_ADDRESS]}>
                      <Input disabled={isEdit && keyInfos.includes('liveaddress')} />
                    </ItemCol>
                  </>
                )}
              </Row>
              <Row>
                <ItemCol
                  span={16}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="备注"
                  name="note"
                  rules={[RULES.MEMO]}
                >
                  <TextArea
                    style={{ width: '102%', maxWidth: '102%' }}
                    disabled={isEdit && keyInfos.includes('note')}
                  />
                </ItemCol>
              </Row>
            </Form>
          </>
        )}
      </Drawer>
    </>
  );
}
