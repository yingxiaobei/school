import { Form, Row } from 'antd';
import { useFetch, useHash, useVisible } from 'hooks';
import { _getDetails, _getJGRequestPlatformType } from '../_api';
import { Auth, formatTime, _get } from 'utils';
import { Title, ItemCol, PopoverImg, AuthWrapper } from 'components';
import ClassInfo from '../../studentInfo/ClassInfo';
import CoachDetails from '../../../coach/coachInfo/Details';
import { PRIMARY_COLOR } from 'constants/styleVariables';

interface HistoryProps {
  sid: string;
  customSchoolId?: string;
}

// NOTE:后端接口的部分字段修改了 不能直接使用studentInfo组件
export default function HistoricalStudentDetail({ sid, customSchoolId = Auth.get('schoolId') || '' }: HistoryProps) {
  const [form] = Form.useForm();
  const [visible, _switchVisible] = useVisible();
  const [detailsVisible, _setDetailsVisible] = useVisible();

  const { data } = useFetch({
    query: {
      id: sid,
    },
    customHeader: { customSchoolId },
    request: _getDetails,
  });

  const IS_NOT: any = {
    '1': '是',
    '0': '否',
  };

  // 监管地址配置0：国交 1：至正
  const { data: jGRequestPlatformType } = useFetch({
    request: _getJGRequestPlatformType,
  });

  // 学员卡状态
  const bind_card_typeHash = useHash('bind_card_type');

  const genderHash = useHash('gender_type'); // 性别
  const cardTypeHash = useHash('gd_card_type'); // 身份证号
  const busitypeHash = useHash('businessType'); // 业务类型
  const recordStatusTypeHash = useHash('stu_record_status_type'); // 备案状态
  const registeredNationalFlagHash = useHash('registered_national_flag'); // 统一编码
  const nationalityTypeHash = useHash('nationality_type'); // 国籍
  const studentTypeHash = useHash('student_type'); // 学员类型

  return (
    <>
      {visible && <ClassInfo onCancel={_switchVisible} sid={sid} customSchoolId={customSchoolId} />}

      <CoachDetails
        visible={detailsVisible}
        onCancel={_setDetailsVisible}
        currentId={_get(data, 'cid')}
        customSchoolId={customSchoolId || ''}
      />

      <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
        <Title>备案信息</Title>

        <Row>
          {/* 已获取统一编码，显示具体编码信息，未获取显示未获取 ，‘0’表示‘未获取’*/}
          <ItemCol span={8} label="统一编码">
            {_get(data, 'registeredNationalflag') !== '0'
              ? _get(data, 'stunum', '')
              : registeredNationalFlagHash[_get(data, 'registeredNationalflag', '')]}
          </ItemCol>
          <ItemCol span={8} label="备案状态">
            {recordStatusTypeHash[_get(data, 'registeredFlag', '')]}
          </ItemCol>
          {/* 备案状态为备案失败的时候，才显示备案失败原因，其他状态不显示失败原因字段 ‘2’表示为‘备案失败’*/}
          {_get(data, 'registeredFlag') === '2' && (
            <ItemCol span={8} label="备案失败原因">
              {_get(data, 'message', '')}
            </ItemCol>
          )}
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
        </Row>

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
            {_get(data, 'packageName')}
          </ItemCol>
          <ItemCol span={8} label="银行账户">
            {_get(data, 'bankchannelname')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol
            span={8}
            label="学车教练"
            onClick={_setDetailsVisible}
            style={{ color: PRIMARY_COLOR, cursor: 'pointer' }}
          >
            {_get(data, 'coachName')}
          </ItemCol>
        </Row>

        <Title>其他信息</Title>
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
          <ItemCol span={8} label="备注">
            {_get(data, 'note')}
          </ItemCol>
        </Row>
      </Form>
    </>
  );
}
