// 帮学员预约

import { useState } from 'react';
import { Modal, Row, Button, Tooltip, Select } from 'antd';
import moment from 'moment';
import { SearchStudent } from 'components';
import { _scheduleOrder } from './_api';
import { _getSchoolCombo } from 'api';
import { Auth, _get } from 'utils';
import { useHash, useFetch, useRequest } from 'hooks';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function OrderCourse(props: any) {
  const {
    subject,
    currentRecord,
    _handleReset,
    selectedDate,
    selectedCourseList,
    _switchOrderCourseVisible,
    selectedOrderCourse,
    traincode,
    classRoom,
  } = props;

  const [sid, setSid] = useState('');
  const [schoolList, setSchoolList] = useState<any>([]);
  const [stuschoolid, setSchoolid] = useState(String(Auth.get('schoolId')));
  const commonStyle = { display: 'inline-block', marginRight: 10, minWidth: 100 };
  const [type, setType] = useState('');

  const { loading, run } = useRequest(_scheduleOrder, {
    onSuccess: () => {
      _handleReset();
      _switchOrderCourseVisible();
    },
  });

  // 立即预约 0 免单预约 1
  async function _handleOk(ifFree: string) {
    setType(ifFree === '0' ? 'unFree' : 'free');
    run({
      sid,
      traincode,
      skuIds: selectedOrderCourse,
      ifFree,
      classroomId: _get(classRoom, 'classid', ''),
      branchId: _get(currentRecord, 'sbnid'),
      orderMode: '2', // 约课类型 1-学员自主预约,2-驾校约课, 3- 直接安排
      stuschoolid: stuschoolid,
    });
  }

  const subjectHash = useHash('subject'); // 科目

  useFetch({
    request: _getSchoolCombo,
    query: {
      traincode,
      sbnid: _get(currentRecord, 'sbnid'),
    },
    callback: (data: any) => {
      const schoolData = data.map((item: any) => {
        return { label: item.text, value: item.value };
      });
      setSchoolList(schoolData);
      setSchoolid(String(Auth.get('schoolId')));
    },
  });

  return (
    <Modal visible onCancel={_switchOrderCourseVisible} footer={false} width={650}>
      <Row>
        <span style={commonStyle}>预约日期:</span>
        <span>{moment(selectedDate).format('YYYY-MM-DD')}</span>
      </Row>
      <Row style={{ display: 'flex', marginTop: 10 }}>
        <div className="mr20">
          <span style={commonStyle}>营业网点简称:</span>
          <span>{_get(currentRecord, 'shortname')}</span>
        </div>
        <div className="mr20">
          <span style={{ display: 'inline-block', marginRight: 10 }}>教室:</span>
          <span>{_get(classRoom, 'classroom')}</span>
        </div>
      </Row>
      <Row
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: 600,
          textAlign: 'center',
          marginBottom: 20,
        }}
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
          >
            <div>{x.timePeriod}</div>
            <div>
              <div>
                {moment().hour(x.beginhour).minute(x.beginmin).format('HH:mm') +
                  '-' +
                  moment().hour(x.endhour).minute(x.endmin).format('HH:mm')}
              </div>
              <div>
                {Number(_get(x, 'classnum')) - Number(_get(x, 'applyNum'))}/{_get(x, 'classnum')}人
              </div>
              <div>{subjectHash[_get(x, 'subject')] + _get(x, 'traintype')}</div>
              {subject === '1' && <div>{_get(x, 'price')}元</div>}
            </div>
          </div>
        ))}
      </Row>
      {_get(schoolList, 'length', 0) !== 0 && (
        <Row style={{ marginTop: 10, display: 'flex', alignItems: 'center' }}>
          <span style={commonStyle}>培训机构:</span>
          <Select
            options={schoolList}
            defaultValue={_get(schoolList, '0.value')}
            style={{ width: 340 }}
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            value={stuschoolid}
            onChange={(value: any) => {
              setSchoolid(value);
            }}
          />
        </Row>
      )}
      <Row style={{ marginTop: 10, display: 'flex', alignItems: 'center' }}>
        <span style={commonStyle}>学员:</span>
        <SearchStudent value={sid} setValue={setSid} stuschoolid={stuschoolid} />
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
