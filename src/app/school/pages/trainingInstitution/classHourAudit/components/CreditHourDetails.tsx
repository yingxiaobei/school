import React from 'react';
import { Col, Row } from 'antd';
import { _get } from 'utils';
import { useHash } from 'hooks';

interface CreditHourDetailsProps {
  data: any;
}

function CreditHourDetails({ data }: CreditHourDetailsProps) {
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const crstateHash = useHash('crstate_type'); // 是否有效
  const checkstatusJxHash = useHash('review_status_type'); // 审核状态
  const reviewTypeHash = useHash('classrecord_review_type'); // 审核类型

  return (
    <div className="mb20">
      <Row className="bold">异常照片比例：{_get(data, 'exceptionRatio', '')}</Row>
      <Row>
        <Col span={6}>学时编号：{_get(data, 'recnum', '')}</Col>
        <Col span={6}>教练姓名：{_get(data, 'coachName', '')}</Col>
        <Col span={6}>车牌号：{_get(data, 'licnum', '')}</Col>
        <Col span={6}>培训部分：{subjectcodeHash[_get(data, 'subject', '')]}</Col>
      </Row>
      <Row>
        <Col span={6}>课程方式：{traincodeHash[_get(data, 'traincode', '')]}</Col>
        <Col span={6}>是否有效：{crstateHash[_get(data, 'crstate', '')]}</Col>
        <Col span={6}>审核类型：{reviewTypeHash[_get(data, 'reviewType', '')]}</Col>
        <Col span={6}>有效学时：{_get(data, 'validTime', '')}</Col>
      </Row>
      <Row>
        <Col span={6}>有效里程：{_get(data, 'validMileage', '')}</Col>
        <Col span={6}>审核状态：{checkstatusJxHash[_get(data, 'reviewStatus', '')]}</Col>
        <Col span={6}>审核意见：{_get(data, 'reviewOpinion', '')}</Col>
        <Col span={6}>驾校终审意见：{_get(data, 'jxFinalOpinion', '')}</Col>
      </Row>
    </div>
  );
}

export default CreditHourDetails;
