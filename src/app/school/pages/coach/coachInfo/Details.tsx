import { useContext } from 'react';
import { Drawer, Tabs } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _coaPageListKeyInfoChange, _getDetails } from './_api';
import { Auth, _get, formatTime } from 'utils';
import moment from 'moment';
import { Detail } from 'components';
import { IF, Loading } from 'components';
import Util from 'utils/Util';
import ContinuingEdu from './ContinuingEdu';
import GlobalContext from 'globalContext';
import Log from 'components/Log';
import ChangeRecord from 'components/ChangeRecord';
import { _getRecordListNew } from 'app/school/pages/student/teachingJournal/_api';

const { TabPane } = Tabs;
interface IProps {
  onCancel(): void;
  currentId: string | null;
  customSchoolId?: string;
  visible: boolean;
  isHeNan?: boolean;
  isSupportMultipleChoice?: boolean;
}

export default function Details(props: IProps) {
  const {
    onCancel,
    currentId,
    customSchoolId = Auth.get('schoolId'),
    visible,
    isHeNan = false,
    isSupportMultipleChoice,
  } = props;
  const { $areaNum } = useContext(GlobalContext);
  const { data, isLoading } = useFetch({
    query: { id: currentId },
    customHeader: { customSchoolId },
    request: _getDetails,
    forceCancel: !visible,
    depends: [visible],
  });

  const trans_car_typeHash = useHash('trans_car_type'); // 车辆类型

  const genderHash = useHash('gender_type'); // 性别
  const coachtypeHash = useHash('coach_type'); // 教练类型
  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const isNotHash = useHash('yes_no_type'); // 带教模拟
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记
  const bind_card_typeHash = useHash('bind_card_type'); // 学员卡状态
  const occupation_levelHash = useHash('occupation_level_type'); // 职业资格等级
  const educationLevelHash = useHash('coa_whcd_type'); // 教练员文化程度
  const paraReligiousCategoryHash = useHash('coa_zjlx_type'); // 教练员准教类别

  const isRecord = $areaNum === '02'; // 广东

  const changeHashText = (
    arr: string[],
    hash: {
      [key: string]: string;
    },
  ) => {
    return arr.map((item) => hash[item]);
  };

  const detailData: DETAIL.IData = [
    {
      title: '备案信息',
      rows: [
        { label: '统一编码', value: _get(data, 'coachnum', '') },
        { label: '备案状态', value: registeredExamFlagHash[_get(data, 'coaCoachExtinfoEntity.registeredFlag', '')] },
        {
          label: '原因',
          value: _get(data, 'coaCoachExtinfoEntity.message', ''),
          insertWhen:
            _get(data, 'coaCoachExtinfoEntity.registeredFlag', 0) === '3' ||
            _get(data, 'coaCoachExtinfoEntity.registeredFlag', 0) === '5',
        },
      ],
    },
    {
      title: '基本信息',
      rows: [
        { label: '姓名', value: _get(data, 'coachname', '') },
        { label: '性别', value: genderHash[_get(data, 'sex', 0)] },
        {
          label: '身份证号',
          value: _get(data, 'idcard', ''),
        },
        { label: '联系电话', value: _get(data, 'mobile', '') },
        { label: '地址', value: _get(data, 'address', '') },
        {
          label: '照片',
          value: _get(data, 'coaCoachExtinfoEntity.headImgUrl', ''),
          type: 'PopoverImg',
        },
        { label: '籍贯', value: _get(data, 'jg', ''), insertWhen: isRecord },
        { label: '民族', value: _get(data, 'mz', ''), insertWhen: isRecord },
        { label: '文化程度', value: educationLevelHash[_get(data, 'whcd', '')], insertWhen: isRecord },
        { label: '职称', value: _get(data, 'zc', ''), insertWhen: isRecord },
        { label: '联系地址邮编', value: _get(data, 'lxdzyb', ''), insertWhen: isRecord },
        { label: '家庭地址', value: _get(data, 'jtdz', ''), insertWhen: isRecord },
        { label: '家庭地址邮编', value: _get(data, 'jtdzyb', ''), insertWhen: isRecord },
        { label: '准教类型', value: paraReligiousCategoryHash[_get(data, 'zjlx', '')], insertWhen: isRecord },
      ],
    },
    {
      title: '其他信息',
      rows: [
        { label: '驾驶证号', value: _get(data, 'drilicence', '') },
        { label: '初领日期', value: formatTime(_get(data, 'fstdrilicdate'), 'DATE') },
        {
          label: '准驾车型',
          value: isSupportMultipleChoice
            ? changeHashText(Util.changeStringToArray(_get(data, 'dripermitted', '')), trans_car_typeHash)
            : trans_car_typeHash[_get(data, 'dripermitted', '')],
          type: isSupportMultipleChoice ? 'multiple' : 'span',
        },
        { label: '职业资格证/服务证号', value: _get(data, 'occupationno', '') },
        { label: '职业资格等级', value: occupation_levelHash[_get(data, 'occupationlevel')] },
        {
          label: '准教车型',
          value: isSupportMultipleChoice
            ? changeHashText(Util.changeStringToArray(_get(data, 'teachpermitted', '')), trans_car_typeHash)
            : trans_car_typeHash[_get(data, 'teachpermitted', '')],
          type: isSupportMultipleChoice ? 'multiple' : 'span',
        },
        { label: '驾驶证发证机关', value: _get(data, 'plcpaperDept') },

        { label: '供职状态', value: employStatusHash[_get(data, 'employstatus', '00')] },
        { label: '入职日期', value: formatTime(_get(data, 'hiredate'), 'DATE') },
        {
          label: '离职日期',
          value: formatTime(_get(data, 'leavedate'), 'DATE'),
        },
        {
          label: '教练员类型',
          value: coachtypeHash[_get(data, 'coachtype', '')],
        },
        { label: '是否已绑卡', value: bind_card_typeHash[_get(data, 'cardstu', '')] },
        {
          label: '备注',
          value: _get(data, 'memo', ''),
        },
        { label: '带教模拟', value: isNotHash[_get(data, 'issimulate', '')] },
        { label: '教练车车牌号', value: _get(data, 'licnum', '') },
        {
          label: '免签截止日期',
          value: _get(data, 'coaCoachExtinfoEntity.idauthcloseddeadline', ''),
          insertWhen: _get(data, 'coaCoachExtinfoEntity.idauthclosed', '') === '1',
        },
        { label: '教练员签字', value: _get(data, 'coaCoachExtinfoEntity.signNoteImgUrl', ''), type: 'PopoverImg' },
        {
          valueLabel: '驾驶证',
          label: '机动车驾驶证',
          value: {
            list: [_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl', '')],
            showIcon: _get(data, 'coaCoachExtinfoEntity.driverLicenseImageupFlag') === '1',
          },
          type: 'UploadFileListWithRightIcon',
        },
        {
          label: '职业资格等级证',
          value: {
            src: _get(data, 'coaCoachExtinfoEntity.careerLicenseImgUrl', ''),
            showIcon: _get(data, 'coaCoachExtinfoEntity.careerLicenseImageupFlag') === '1',
          },
          type: 'PopoverImgWithRightIcon',
        },
        {
          label: '教练员身份证',
          valueLabel: '身份证',
          value: {
            list: [_get(data, 'coaCoachExtinfoEntity.idcardImgUrl', '')],
            showIcon: false,
          },
          type: 'UploadFileListWithRightIcon',
        },
        {
          label: '其他资格证',
          span: 24,
          value: {
            list: _get(data, 'coaCoachExtinfoEntity.other_license', []),
            showIcon: _get(data, 'coaCoachExtinfoEntity.otherLicenseImageupFlag') === '1',
          },
          type: 'PopoverImgListWithRightIcon',
        },

        { label: '聘用开始时间', value: _get(data, 'employstartdate', ''), insertWhen: isHeNan },
        { label: '聘用到期时间', value: _get(data, 'employenddate', ''), insertWhen: isHeNan },
        {
          label: '聘用合同',
          value: { src: _get(data, 'coaCoachExtinfoEntity.pyhtUrl', '') },
          type: 'UploadFile',
          insertWhen: isRecord,
        },
        {
          label: '原单位解聘证明ID',
          value: { src: _get(data, 'coaCoachExtinfoEntity.ydwjpzmUrl', '') },
          type: 'UploadFile',
          insertWhen: isRecord,
        },
        {
          label: '学历证明',
          value: { src: _get(data, 'coaCoachExtinfoEntity.xlzmUrl', '') },
          type: 'UploadFile',
          insertWhen: isRecord,
        },
        {
          label: '机动车驾驶人安全驾驶记录',
          value: { src: _get(data, 'coaCoachExtinfoEntity.jdcjsraqjsjlUrl', '') },
          type: 'UploadFile',
          insertWhen: isRecord,
        },
      ],
    },
  ];

  return (
    <Drawer visible={visible} destroyOnClose width={1300} title={'详情'} onClose={onCancel} footer={null}>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <Tabs defaultActiveKey="coachInfoDetail">
            <TabPane tab="教练信息详情" key="coachInfoDetail">
              <Detail data={detailData} />
            </TabPane>
            <TabPane tab="继续教育" key="continueEducation">
              <ContinuingEdu currentId={currentId} />
            </TabPane>
            <TabPane tab="变更记录" key="changeRecord">
              <ChangeRecord id={currentId} paramsKey={'coaid'} api={_coaPageListKeyInfoChange} />
            </TabPane>
            <TabPane tab="交互日志" key="log">
              <Log<{ rows: LogRes[]; total: number }> entityId={currentId as string} api={_getRecordListNew} />
            </TabPane>
          </Tabs>
        }
      />
    </Drawer>
  );
}
