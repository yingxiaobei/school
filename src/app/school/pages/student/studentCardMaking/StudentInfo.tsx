import { Auth, _get } from 'utils';
import { ItemCol, PopoverImg } from 'components';
import { Form, Row, Col } from 'antd';
import { useHash, useFetch } from 'hooks';
import { _getDetails } from '../studentInfo/_api';

export default function StudentInfo(props: any) {
  const { sid, customSchoolId = Auth.get('schoolId'), isTheory = false, practicalSchoolId } = props;
  const genderHash = useHash('gender_type'); // 性别
  const [form] = Form.useForm();
  // console.log(customSchoolId, isTheory, practicalSchoolId);
  const { data } = useFetch({
    query: {
      id: sid,
    },

    customHeader: isTheory
      ? {
          customSchoolId: practicalSchoolId,
        }
      : { customSchoolId },
    request: _getDetails,
  });
  return (
    <Form
      form={form}
      autoComplete="off"
      initialValues={{
        sex: _get(data, 'sex'),
        idcard: _get(data, 'idcard'),
        traintype: _get(data, 'traintype'),
        address: _get(data, 'address'),
        name: _get(data, 'name'),
        phone: _get(data, 'phone'),
      }}
    >
      <Row>
        <Col span={16}>
          <Row>
            <ItemCol label="学员姓名" name="name">
              {_get(data, 'name')}
            </ItemCol>
            <ItemCol label="性别" name="sex">
              {genderHash[_get(data, 'sex', 2)]}
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="证件号码" name="idcard">
              {_get(data, 'idcard')}
            </ItemCol>
            <ItemCol label="培训车型" name="traintype">
              {_get(data, 'traintype')}
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="联系电话" name="phone">
              {_get(data, 'phone')}
            </ItemCol>
            <ItemCol label="地址" name="address">
              {_get(data, 'address')}
            </ItemCol>
          </Row>
        </Col>
        <Col span={8}>
          <ItemCol label="照片">
            <PopoverImg src={_get(data, 'headImgVO.head_img_url_show', '')} />
          </ItemCol>
        </Col>
      </Row>
    </Form>
  );
}
