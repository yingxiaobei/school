import { Row, Input } from 'antd';
import { _getDetails, _addBranchMechanism, _updateBranchMechanism } from './_api';
import { ItemCol, FormModal, Title } from 'components';
import { RULES } from 'constants/rules';

export default function AddOrEdit(props: any) {
  const queryFields = ['branchname', 'contact', 'phone', 'address'];

  return (
    <FormModal
      {...props}
      fetchDetailData={_getDetails}
      addRequest={_addBranchMechanism}
      queryFields={queryFields}
      idField="bid"
      updateRequest={_updateBranchMechanism}
    >
      <Title>基本信息</Title>

      <Row>
        <ItemCol
          label="分支机构名称"
          name="branchname"
          rules={[{ whitespace: true, required: true }, RULES.BRANCH_NAME]}
        >
          <Input />
        </ItemCol>
      </Row>

      <Title>联系方式</Title>

      <Row>
        <ItemCol label="联系人" name="contact" rules={[RULES.BRANCH_CONCAT]}>
          <Input />
        </ItemCol>
        <ItemCol
          label="联系电话"
          name="phone"
          rules={[{ whitespace: true, required: true }, RULES.TEL_TELEPHONE_MOBILE]}
        >
          <Input />
        </ItemCol>
      </Row>

      <Row>
        <ItemCol
          label="分支机构地址"
          name="address"
          rules={[{ whitespace: true, required: true }, RULES.BRANCH_ADDRESS]}
        >
          <Input />
        </ItemCol>
      </Row>
    </FormModal>
  );
}
