import { useState, useEffect } from 'react';
import { Modal, Select } from 'antd';
import { _getUserList, _getAuditUser, _updateAuditUser } from './_api';
import { useRequest } from 'hooks';
import { _get } from 'utils';
import { Loading } from 'components';
import { _getOrganizationTree } from '../organizationManage/_api.js';

const { Option } = Select;

export default function SetReviewer(props: any) {
  const { onCancel, onOk, initReviewId } = props;
  const [reviewList, setReviewList] = useState([]);
  const [reviewId, setReviewId] = useState(initReviewId);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolOrgId, setSchoolOrgId] = useState(null);

  const { loading: confirmLoading, run } = useRequest(_updateAuditUser, {
    onSuccess: onOk,
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const orgIdRes = await _getOrganizationTree();
      setSchoolOrgId(_get(orgIdRes, 'data.0.id'));
      const res = await _getUserList({ pageSize: 100, currentPage: 1, orgId: _get(orgIdRes, 'data.0.id') });
      setReviewList(_get(res, 'data.rows', []));
      setIsLoading(false);
    })();
  }, []);

  return (
    <Modal
      visible
      title={'审核员设置'}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        run({ id: reviewId });
      }}
    >
      {isLoading && <Loading />}
      {!isLoading && (
        <div className="mt20">
          默认审核员：
          <Select
            className="w200"
            showSearch
            filterOption={false}
            allowClear
            placeholder="请输入审核员"
            value={reviewId}
            onChange={(value: any) => {
              setReviewId(value);
            }}
            onSearch={(name: any) => {
              _getUserList({ name, pageSize: 100, currentPage: 1, orgId: schoolOrgId }).then((res: any) => {
                setReviewList(_get(res, 'data.rows', []));
              });
            }}
          >
            {reviewList.map((x: any, index: any) => {
              return (
                <Option key={index} value={x.id}>
                  {x.name}
                </Option>
              );
            })}
          </Select>
        </div>
      )}
    </Modal>
  );
}
