// 编辑课程
import { useState } from 'react';
import { omit } from 'lodash';
import { Modal, Input, Select, TimePicker, Button, Radio, message } from 'antd';
import moment from 'moment';
import { useOptions, useRequest, useFetch, useConfirm } from 'hooks';
import { _updateScheduleByKey, _deleteSchedule, _getScheduleCategory } from './_api';
import { getCourseStatus, EXPIRED, FILLED, CAN_APPOINTMENT, _get, insertWhen } from 'utils';
import { RULES } from 'constants/rules';
import { CustomTable } from 'components';

const { RangePicker } = TimePicker;
const inputStyle = { width: 180 };
const smallInputStyle = { width: 70 };

export default function EditCourseTable(props: any) {
  const { _switchEditCourseVisible, selectedDate } = props;

  const teachpermitted = _get(props, 'children.props.coachInfo.teachpermitted', '');

  const [courseList, setCourseList] = useState(
    props.courseList.map((x: any) => ({
      ...x,
      disabled: _isDisable(x),
      id: Math.random().toString(16).slice(8),
      timeDuration: [moment().hour(x.beginhour).minute(x.beginmin), moment().hour(x.endhour).minute(x.endmin)],
    })) || [],
  );
  const [_showDeleteConfirm] = useConfirm();
  const carTypeOptions = useOptions('business_scope', false, '-1', [], {
    query: { coaTeachType: teachpermitted },
    forceUpdate: true,
  }); // 经营车型
  const { loading: confirmLoading, run } = useRequest(_updateScheduleByKey, { onSuccess: _switchEditCourseVisible });

  const { data = [] } = useFetch({
    request: _getScheduleCategory,
    query: { traincode: '1' }, // 实操
  });
  const subjectcodeOptions = data.map((x: any) => ({ value: x.productCode, label: x.title }));

  function _isDisable(x: any) {
    // 已过期
    if (`${_get(x, 'applyStatus')}` === '3') return true;

    // 未发布|发布但无人预约
    if (`${_get(x, 'applyStatus')}` === '0' || _get(x, 'applyNum') === _get(x, 'classnum')) return false;

    return true;
  }

  const columns = [
    {
      title: '时段',
      dataIndex: 'timeDuration',
      render: (timeDuration: any, record: any, index: number) => (
        <RangePicker
          disabled
          // disabled={record.disabled}
          style={inputStyle}
          value={timeDuration}
          format={'HH:mm'}
          allowClear={false}
          onChange={(dates) => {
            _handleChange(record, index, dates, 'timeDuration');
          }}
        />
      ),
    },
    {
      title: '科目',
      dataIndex: 'subject',
      render: (subject: any, record: any, index: number) => (
        <Select
          options={subjectcodeOptions}
          getPopupContainer={(triggerNode) => triggerNode.parentElement}
          disabled={record.disabled}
          style={inputStyle}
          value={subject}
          onChange={(value) => _handleChange(record, index, value, 'subject')}
        />
      ),
    },
    {
      title: '车型',
      dataIndex: 'traintype',
      render: (traintype: any, record: any, index: number) => (
        <Select
          options={carTypeOptions}
          getPopupContainer={(triggerNode) => triggerNode.parentElement}
          disabled={record.disabled}
          style={smallInputStyle}
          value={traintype}
          onChange={(value) => _handleChange(record, index, value, 'traintype')}
        />
      ),
    },
    // 不要价格了
    ...insertWhen(!Boolean(teachpermitted), [
      {
        title: '价格',
        dataIndex: 'price',
        render: (price: any, record: any, index: number) => (
          <Input
            disabled={record.disabled}
            style={smallInputStyle}
            value={price}
            onChange={(e) => _handleChange(record, index, e.target.value, 'price')}
          />
        ),
      },
    ]),

    {
      title: '可约人数',
      dataIndex: 'classnum',
      render: (classnum: any, record: any, index: number) => (
        <Input
          disabled={record.disabled}
          style={smallInputStyle}
          value={classnum}
          onChange={(e) => {
            if (e.target.value && !RULES.PERSON.pattern.test(e.target.value)) {
              message.error(RULES.PERSON.message);
              return;
            }
            _handleChange(record, index, e.target.value, 'classnum');
            _handleChange(record, index, e.target.value, 'applyNum');
          }}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'saleable',
      render: (saleable: any, record: any, index: number) => {
        const status = getCourseStatus(_get(record, 'applyStatus'));
        if (status === EXPIRED) {
          return '已过期';
        }
        if (status === FILLED) {
          return '已约满';
        }
        if (status === CAN_APPOINTMENT && _get(record, 'applyNum') !== _get(record, 'classnum')) {
          return '可约';
        }

        return (
          <Radio.Group
            onChange={(e) => _handleChange(record, index, e.target.value, 'saleable')}
            value={String(saleable)}
          >
            <Radio value={'1'}>发布</Radio>
            <Radio value={'0'}>未发布</Radio>
          </Radio.Group>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: any, index: any) => (
        <>
          <Button
            style={{ marginRight: 12 }}
            type="primary"
            ghost
            size="small"
            disabled={record.disabled}
            onClick={() => {
              _showDeleteConfirm({
                handleOk: () => {
                  _deleteSchedule([record.skuId]);
                  courseList.splice(index, 1);
                  setCourseList([...courseList]);
                },
              });
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  function _handleChange(record: any, index: number, value: any, field: string) {
    if ((field === 'price' || field === 'classnum') && Number.isNaN(Number(value))) return;
    courseList[index][field] = value;
    setCourseList([...courseList]);
  }

  const weekHash = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <Modal
      maskClosable={false}
      confirmLoading={confirmLoading}
      onOk={() => {
        let flag;
        // eslint-disable-next-line array-callback-return
        courseList.some((x: any) => {
          const subjectData = data.filter((item: any) => item.productCode === x.subject);
          const minProPrice = _get(subjectData, '0.minProPrice');
          const maxProPrice = _get(subjectData, '0.maxProPrice');
          const subjectTitle = _get(subjectData, '0.title');
          if (_get(x, 'price') > maxProPrice && !Boolean(teachpermitted)) {
            message.error(`${subjectTitle}价格不能大于${maxProPrice}`);
            flag = true;
            // eslint-disable-next-line array-callback-return
            return;
          }
          if (_get(x, 'price') < minProPrice && !Boolean(teachpermitted)) {
            message.error(`${subjectTitle}价格不能小于${minProPrice}`);
            flag = true;
            // eslint-disable-next-line array-callback-return
            return;
          }
        });
        if (!flag) {
          run({ list: courseList.map((x: any) => omit(x, ['disabled', 'timeDuration', 'id'])) });
        }
      }}
      width={1200}
      visible
      title="调整教学课程"
      onCancel={_switchEditCourseVisible}
    >
      {props.children}
      <div style={{ marginBottom: 20, fontWeight: 'bold' }}>
        {selectedDate + ' ' + weekHash[moment(selectedDate).day()]}
      </div>
      <CustomTable columns={columns} dataSource={courseList} rowKey="id" pagination={false} />
    </Modal>
  );
}
