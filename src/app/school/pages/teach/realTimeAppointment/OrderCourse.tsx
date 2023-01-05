// 帮学员预约

import { useState } from 'react';
import { _get } from 'utils';
import { Modal, Row, Button, Tooltip, Col } from 'antd';
import moment from 'moment';
import { SearchStudent } from 'components';
import { _scheduleOrder } from './_api';
import { useHash, useRequest } from 'hooks';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function OrderCourse(props: any) {
  const {
    currentRecord,
    _handleReset,
    selectedDate,
    selectedCourseList,
    _switchOrderCourseVisible,
    selectedOrderCourse,
    subject,
  } = props;
  const commonStyle = { display: 'inline-block', minWidth: 80 };
  const [sid, setSid] = useState('');
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const [type, setType] = useState('');

  const { loading, run } = useRequest(_scheduleOrder, {
    onSuccess: () => {
      _handleReset();
      _switchOrderCourseVisible();
    },
  });

  async function _handleOk(ifFree: string) {
    setType(ifFree === '0' ? 'unFree' : 'free');
    run({
      sid,
      cid: _get(currentRecord, 'cid'),
      traincode: '1', // 实操
      skuIds: selectedOrderCourse,
      ifFree,
    });
  }

  return (
    <Modal visible onCancel={_switchOrderCourseVisible} footer={false} width={650}>
      <Row>
        <span style={commonStyle}>预约日期:</span>
        <span>{moment(selectedDate).format('YYYY-MM-DD')}</span>
      </Row>
      <Row className="mt10">
        <Col span={10} className="mr10">
          <span style={commonStyle}>教练:</span>
          <span>{_get(currentRecord, 'coachname')}</span>
        </Col>
        <Col span={10}>
          <span style={commonStyle}>准教车型:</span>
          <span>{_get(currentRecord, 'teachpermitted')}</span>
        </Col>
      </Row>
      <Row className="mt10">
        <Col span={12}>
          <span style={commonStyle}>身份证号:</span>
          <span>{_get(currentRecord, 'idcard')}</span>
        </Col>
      </Row>
      <Row
        style={{
          flexWrap: 'wrap',
          width: 600,
        }}
        className="mb20 flex text-center"
      >
        {selectedCourseList.map((x: any, index: number) => (
          <div
            key={index}
            style={{
              margin: 10,
              width: 130,
              height: 90,
              borderRadius: 8,
              background: '#63c3a4',
              position: 'relative',
            }}
            className="flex-box direction-col"
          >
            <div>
              {moment().hour(x.beginhour).minute(x.beginmin).format('HH:mm') +
                '-' +
                moment().hour(x.endhour).minute(x.endmin).format('HH:mm')}
            </div>
            <div>
              {Number(_get(x, 'classnum')) - Number(_get(x, 'applyNum'))}/{_get(x, 'classnum')}人
            </div>
            <div>{subjectcodeHash[x.subject] + ' ' + x.traintype}</div>
            {subject === '1' && <div>{x.price + '元'}</div>}
          </div>
        ))}
      </Row>
      <Row style={{ marginTop: 10, display: 'flex', alignItems: 'center' }}>
        <span style={commonStyle}>学员:</span>
        <SearchStudent value={sid} setValue={setSid} otherProps={{ registered_Flag: '1', status: '01' }} />
        <Tooltip title="只有学驾中和已备案的学员才能预约">
          <QuestionCircleOutlined className="questionIcon" />
        </Tooltip>
      </Row>
      <Row style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <Button className="mr20" type="primary" onClick={_switchOrderCourseVisible}>
          关闭
        </Button>
        <Button
          className="mr20"
          type="primary"
          loading={type === 'unFree' && loading}
          onClick={() => _handleOk('0')}
          disabled={!sid}
        >
          立即预约
        </Button>
        <Button type="primary" loading={type === 'free' && loading} onClick={() => _handleOk('1')} disabled={!sid}>
          免单预约
        </Button>
      </Row>
    </Modal>
  );
}
