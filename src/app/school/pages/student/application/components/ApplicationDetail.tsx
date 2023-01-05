import { Form, Modal, Spin, Row } from 'antd';
import { useHash } from 'hooks';
import { memo } from 'react';
import { formatTime, _get } from 'utils';
import { useApplicationDetail } from '../hooks';
import AccountShow from './AccountShow';
import DetailImgShow from './DetailImgShow';
import styles from './index.module.css';
import { ItemCol } from 'components';
interface Props {
  currentId: string | number | null;
  onCancel: () => void;
}

function ApplicationDetail({ currentId, onCancel }: Props) {
  const { data, isLoading } = useApplicationDetail(currentId);
  const applyTypeHash = useHash('stu_apply_type');

  const renderDifferentByApplication = (applicationType: string) => {
    switch (applicationType) {
      case '1':
        return (
          <>
            <Row>
              <ItemCol span={12} label="第一部分报审日期">
                {formatTime(_get(data, ['stuReportRecordDetailVo', 'firstPartTime'], ''), 'DATE')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={12} label="第二部分报审日期">
                {formatTime(_get(data, ['stuReportRecordDetailVo', 'secondPartTime'], ''), 'DATE')}
              </ItemCol>
              <ItemCol span={12} label="里程（公里）">
                {_get(data, ['stuReportRecordDetailVo', 'secondPartMileage'], '')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={12} label="第三部分报审日期">
                {formatTime(_get(data, ['stuReportRecordDetailVo', 'thirdPartTime'], ''), 'DATE')}
              </ItemCol>
              <ItemCol span={12} label="里程（公里）">
                {_get(data, ['stuReportRecordDetailVo', 'thirdPartMileage'], '')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={12} label="第四部分报审日期">
                {formatTime(_get(data, ['stuReportRecordDetailVo', 'fourthPartTime'], ''), 'DATE')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={12} label="证明文件">
                <DetailImgShow urlList={_get(data, ['stuApplyFormTotalVO', 'applyFileUrls'], [])} />
              </ItemCol>
            </Row>
          </>
        );
      case '2':
        return (
          <>
            <ItemCol span={12} label={'学员原班级'}>
              {_get(data, ['stuPackageChangeApplyVo', 'oldPackName'], '')}{' '}
              {_get(data, ['stuPackageChangeApplyVo', 'oldBankChannelName'], '')}
            </ItemCol>
            <ItemCol span={12} label={'更换班级后班级'}>
              {_get(data, ['stuPackageChangeApplyVo', 'newPackName'], '')}
            </ItemCol>
            {/* TODO: 更换原因的样式 */}
            <ItemCol span={12} label={'更换原因'}>
              {_get(data, ['stuApplyFormTotalVO', 'applyMessage'])}
            </ItemCol>
          </>
        );
      case '3':
        return (
          <>
            <div className={styles['advanceSettlementNote']}>
              {'若学员在申请还未审核通过期间，产生新了的待结算的学时，提前结清金额也会同时变动。'}
            </div>
            <AccountShow content={_get(data, ['stuSettlementDetailVo'])} />
            <ItemCol span={12} label={'收款钱包'}>
              {_get(data, ['stuSettlementDetailVo', 'bankChannelName'], '')}
            </ItemCol>
            <ItemCol span={12} label={'证明文件'}>
              <DetailImgShow urlList={_get(data, ['stuApplyFormTotalVO', 'applyFileUrls'], [])} />
            </ItemCol>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal title={'申请详情'} footer={null} visible onCancel={onCancel} maskClosable={false}>
      <Spin spinning={isLoading}>
        <Form labelCol={{ span: 10 }}>
          <ItemCol span={12} label="学员姓名">
            {_get(data, ['stuApplyFormTotalVO', 'studentName'], '')}
          </ItemCol>
          <ItemCol span={12} label="申请类型">
            {applyTypeHash[_get(data, ['stuApplyFormTotalVO', 'applyType'], '')]}
          </ItemCol>
          {renderDifferentByApplication(_get(data, ['stuApplyFormTotalVO', 'applyType'], ''))}
        </Form>
      </Spin>
    </Modal>
  );
}

export default memo(ApplicationDetail);
