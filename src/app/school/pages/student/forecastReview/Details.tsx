import { Drawer } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getDetails } from './_api';
import { _getPreSignUpDetail } from '../studentInfo/_api';
import { _get } from 'utils';
import moment from 'moment';
import { Loading, Detail } from 'components';

export default function Details(props: any) {
  const { onCancel, currentId, isPreSignUpDetails = false, isChecked = false } = props;

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    request: isPreSignUpDetails ? _getPreSignUpDetail : _getDetails,
  });

  const nationalityTypeHash = useHash('nationality_type'); // 国籍
  const genderHash = useHash('gender_type'); // 性别
  const cardTypeHash = useHash('gd_card_type'); // 证件类型
  const busitypeHash = useHash('businessType'); // 业务类型
  const checkstatusSign = useHash('checkstatus_sign'); // 审核状态

  const detailData: DETAIL.IData = [
    {
      title: '基本信息',
      rows: [
        { span: 12, label: '姓名', value: _get(data, 'name', '') },
        { span: 12, label: '性别', value: genderHash[_get(data, 'sex', 0)] },
        { span: 12, label: '证件类型', value: cardTypeHash[_get(data, 'cardtype', 0)] },
        { span: 12, label: '证件号', value: _get(data, 'idcard') },
        { span: 12, label: '国籍', value: nationalityTypeHash[_get(data, 'nationality', '')] },
        { span: 12, label: '联系电话', value: _get(data, 'phone') },
        { span: 24, label: '地址', value: _get(data, 'address') },
        { span: 12, label: '业务类型', value: busitypeHash[_get(data, 'busitype', '')] },
        { span: 12, label: '培训车型', value: _get(data, 'traintype'), insertWhen: !isPreSignUpDetails },
        { span: 12, label: '学车教练', value: _get(data, 'coachname', '') },
        {
          span: 12,
          label: '是否转入',
          value: Number(_get(data, 'isotherprovince', 0)) === 0 ? '否' : '是',
          insertWhen: isPreSignUpDetails,
        },
        {
          span: 12,
          label: '转出驾校省市',
          value: _get(data, 'outProvinceName', '') + _get(data, 'outCityName', ''),
          insertWhen: isPreSignUpDetails && _get(data, 'isotherprovince') === '1',
        },
        {
          span: 12,
          label: '头像照片',
          type: 'PopoverImg',
          value: _get(data, 'head_img_url', ''),
          insertWhen: !isPreSignUpDetails,
        },
        {
          span: 12,
          label: '证件照',
          type: 'PopoverImg',
          value: _get(data, 'idcardimg', ''),
          insertWhen: isPreSignUpDetails,
        },
        {
          span: 24,
          label: '照片',
          type: 'PopoverImg',
          value: _get(data, 'headImgVO.head_img_url_show', ''),
          insertWhen: isPreSignUpDetails,
        },
      ],
    },
    {
      title: '其他信息',
      rows: [
        { span: 12, label: '申请日期', value: moment(_get(data, 'regtime')).format('YYYY-MM-DD') },
        { span: 12, label: '审核日期', value: moment(_get(data, 'checktime')).format('YYYY-MM-DD') },
        { span: 12, label: '审核人', value: _get(data, 'checkusername') },
        { span: 12, label: '审核状态', value: checkstatusSign[_get(data, 'checkstatus', 0)] },
        { span: 24, label: '原因', value: isPreSignUpDetails ? _get(data, 'checkmemo') : _get(data, 'memo') },
      ],
    },
  ];

  return (
    <Drawer
      visible
      destroyOnClose
      width={800}
      title={isPreSignUpDetails ? (isChecked ? '预报名审核详情' : '预报名受理详情') : '意向学员详情'}
      onClose={onCancel}
      footer={null}
    >
      {isLoading && <Loading />}
      {!isLoading && <Detail data={detailData} />}
    </Drawer>
  );
}
