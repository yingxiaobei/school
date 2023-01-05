import { _get } from 'utils';
import { ItemCol, PopoverImg } from 'components';
import { Form, Row, Col } from 'antd';
import { useHash, useFetch } from 'hooks';
import { _getDetails } from '../coachInfo/_api';

interface IProps {
  cid: string;
}

export default function CoachInfo(props: IProps) {
  const { cid } = props;
  const genderHash = useHash('gender_type'); // 性别
  const [form] = Form.useForm();
  const { data } = useFetch({
    query: {
      id: cid,
    },
    request: _getDetails,
  });
  return (
    <Form
      form={form}
      autoComplete="off"
      initialValues={{
        idcard: _get(data, 'idcard'),
        coachname: _get(data, 'coachname'),
        sex: _get(data, 'sex'),
        teachpermitted: _get(data, 'teachpermitted'),
        mobile: _get(data, 'mobile'),
        address: _get(data, 'address'),
      }}
    >
      <Row>
        <Col span={16}>
          <Row>
            <ItemCol label="姓名" name="coachname">
              {_get(data, 'coachname')}
            </ItemCol>
            <ItemCol label="性别" name="sex">
              {genderHash[_get(data, 'sex', '')]}
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="身份证号" name="idcard">
              {_get(data, 'idcard')}
            </ItemCol>
            <ItemCol label="准驾车型" name="teachpermitted">
              {_get(data, 'teachpermitted')}
            </ItemCol>
          </Row>

          <Row>
            <ItemCol label="联系电话" name="mobile">
              {_get(data, 'mobile')}
            </ItemCol>
            <ItemCol label="地址" name="address">
              {_get(data, 'address')}
            </ItemCol>
          </Row>
        </Col>
        <Col span={8}>
          <ItemCol label="照片">
            <PopoverImg src={_get(data, 'coaCoachExtinfoEntity.headImgUrl', '')} />
          </ItemCol>
        </Col>
      </Row>
    </Form>
  );
}
