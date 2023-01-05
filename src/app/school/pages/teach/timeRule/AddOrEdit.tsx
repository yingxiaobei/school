/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { pick } from 'lodash';
import { Spin, Divider, Modal, Form, Input, Select, TimePicker, Button, message } from 'antd';
import { useFetch, useOptions, useRequest } from 'hooks';
import { _generateTimeRule, _addTimeRule, _getTimeRuleDetails, _updateTimeRule, _getScheduleCategory } from './_api';
import { CustomTable, Loading, Title } from 'components';
import moment from 'moment';
import BasicInfo from './components/BasicInfo';
import { _isValidTimeDuration, _isValidSubject } from 'utils/timeRule';
import { minuteDiff, _get, insertWhen } from 'utils';
import { RULES } from 'constants/rules';

const { RangePicker } = TimePicker;
const inputStyle = { width: 180 };

export default function AddOrEdit(props: any) {
  const { onCancel, onOk, currentId, isEdit, title, currentTrainCode } = props;
  const [traincode, setTraincode] = useState(null);
  const [weekList, setWeekList] = useState<any>([]);
  const [workList, setWorkList] = useState<any>([]);
  const [form] = Form.useForm();
  const [timeRange, setTimeRange] = useState<any>([]);
  const [subject, setSubject] = useState('');

  const { loading: spinning, run: runGenerateTimeRule } = useRequest(_generateTimeRule, {
    onSuccess: (data: any) => {
      setWeekList(
        _get(data, 'weekList', []).map((x: any) => ({
          ...x,
          id: Math.random().toString(16),
          type: 'weekList',
          timeDuration: [moment().hour(x.beginhour).minute(x.beginmin), moment().hour(x.endhour).minute(x.endmin)],
        })),
      );
      setWorkList(
        _get(data, 'workList', []).map((x: any) => ({
          ...x,
          id: Math.random().toString(16),
          type: 'workList',
          timeDuration: [moment().hour(x.beginhour).minute(x.beginmin), moment().hour(x.endhour).minute(x.endmin)],
        })),
      );
    },
  });

  // 根据id获取班级详情
  const { data: currentRecord, isLoading } = useFetch({
    request: _getTimeRuleDetails,
    query: { id: currentId },
    depends: ['id'],
    requiredFields: ['id'],
    callback: (data: any) => {
      if (isEdit) {
        setWeekList(
          _get(data, 'weekList', []).map((x: any) => ({
            ...x,
            id: Math.random().toString(16),
            type: 'weekList',
            timeDuration: [moment().hour(x.beginhour).minute(x.beginmin), moment().hour(x.endhour).minute(x.endmin)],
          })),
        );
        setWorkList(
          _get(data, 'workList', []).map((x: any) => ({
            ...x,
            id: Math.random().toString(16),
            type: 'workList',
            timeDuration: [moment().hour(x.beginhour).minute(x.beginmin), moment().hour(x.endhour).minute(x.endmin)],
          })),
        );
      }
    },
  });

  const carTypeOptions = useOptions('business_scope', false, '-1', [], {
    forceUpdate: true,
  }); // 经营车型
  const traincodeOptions = useOptions('combo');
  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateTimeRule : _addTimeRule, { onSuccess: onOk });

  const { data = [] } = useFetch({
    request: _getScheduleCategory,
    query: { traincode: String(traincode) },
    depends: [traincode],
    requiredFields: ['traincode'],
    callback: (data) => {
      form.setFieldsValue({ subject: _get(data, '0.productId', '') });
    },
  });
  const subjectcodeOptions = data.map((x: any) => ({
    value: x.productId,
    label: x.title,
    subject: x.productCode,
    maxPrice: x.maxProPrice,
    minPrice: x.minProPrice,
  }));

  useEffect(() => {
    if (isEdit) {
      //编辑时从列表中获取当前的traincode,从而查询到对应的subject
      setTraincode(currentTrainCode);
    } else {
      !traincode && setTraincode(_get(traincodeOptions, '0.value'));
    }
    !subject && setSubject(_get(subjectcodeOptions, '0.value'));
  }, [traincodeOptions]);

  function _handleChange(record: any, index: number, value: any, field: string) {
    if ((field === 'price' || field === 'classnum') && Number.isNaN(Number(value))) return;

    if (record.type === 'workList') {
      workList[index][field] = value;
      setWorkList([...workList]);
    } else {
      weekList[index][field] = value;
      setWeekList([...weekList]);
    }
  }

  const carTypeColumns =
    traincode === '1'
      ? [
          {
            title: '车型',
            dataIndex: 'traintype',
            render: (traintype: any, record: any, index: number) => (
              <Select
                options={carTypeOptions}
                // getPopupContainer={(triggerNode) => triggerNode.parentElement}
                style={inputStyle}
                value={traintype}
                onChange={(value) => _handleChange(record, index, value, 'traintype')}
              />
            ),
          },
        ]
      : [];

  const columns = [
    {
      title: '时段',
      dataIndex: 'timeDuration',
      render: (timeDuration: any, record: any, index: number) => (
        <RangePicker
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
      dataIndex: 'productid',
      render: (productid: any, record: any, index: number) => (
        <Select
          options={subjectcodeOptions}
          // getPopupContainer={(triggerNode) => triggerNode.parentElement}
          style={inputStyle}
          value={productid}
          onChange={(value) => {
            _handleChange(
              record,
              index,
              _get(
                data.find((x: any) => x.productId === value),
                'productCode',
              ),
              'subject',
            );

            _handleChange(record, index, value, 'productid');
          }}
        />
      ),
    },
    ...carTypeColumns,
    ...insertWhen(String(traincode) !== '1', [
      {
        title: '价格',
        dataIndex: 'price',
        render: (price: any, record: any, index: number) => (
          <Input
            style={inputStyle}
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
          style={inputStyle}
          value={classnum}
          onChange={(e) => _handleChange(record, index, e.target.value, 'classnum')}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: any, index: any) => (
        <Button
          type="primary"
          ghost
          onClick={() => {
            if (record.type === 'workList') {
              workList.splice(index, 1);
              setWorkList([...workList]);
            } else {
              weekList.splice(index, 1);
              setWeekList([...weekList]);
            }
          }}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Modal
      visible
      width={1100}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        const fields = [
          'beginhour',
          'beginmin',
          'classnum',
          'daytype',
          'endhour',
          'endmin',
          'price',
          'seqno',
          'subject',
          'productid',
          'traintype',
        ];

        form.validateFields().then(async (values) => {
          const query = {
            rulename: _get(values, 'rulename') || _get(currentRecord, 'rulename'),
            traincode: _get(values, 'traincode') || _get(currentRecord, 'traincode'),
            classperiod: _get(values, 'classperiod') || _get(currentRecord, 'classperiod'),
            dclassnum: _get(values, 'dclassnum') || _get(currentRecord, 'dclassnum'),
            traintype: _get(values, 'traintype') || _get(currentRecord, 'traintype'),
            workdprice: _get(values, 'workdprice') || _get(currentRecord, 'workdprice', '0'),
            weekdprice: _get(values, 'weekdprice') || _get(currentRecord, 'weekdprice', '0'),
            beginhour: moment(timeRange[0]).format('HH') || _get(currentRecord, 'beginhour'),
            beginmin: moment(timeRange[0]).format('mm') || _get(currentRecord, 'beginmin'),
            endhour: moment(timeRange[1]).format('HH') || _get(currentRecord, 'endhour'),
            endmin: moment(timeRange[1]).format('mm') || _get(currentRecord, 'endmin'),

            weekList: weekList.map((x: any, index: number) => {
              x.beginhour = moment(_get(x, 'timeDuration.0')).format('HH');
              x.beginmin = moment(_get(x, 'timeDuration.0')).format('mm');
              x.endhour = moment(_get(x, 'timeDuration.1')).format('HH');
              x.endmin = moment(_get(x, 'timeDuration.1')).format('mm');
              x.seqno = index;
              x.daytype = '2'; // 休息日
              return pick(x, fields);
            }),

            workList: workList.map((x: any, index: number) => {
              x.beginhour = moment(_get(x, 'timeDuration.0')).format('HH');
              x.beginmin = moment(_get(x, 'timeDuration.0')).format('mm');
              x.endhour = moment(_get(x, 'timeDuration.1')).format('HH');
              x.endmin = moment(_get(x, 'timeDuration.1')).format('mm');
              x.seqno = index;
              x.daytype = '1'; // 工作日
              return pick(x, fields);
            }),
          };
          if (_get(values, 'subject', '')) {
            let subjectVal = subjectcodeOptions.find((item: any) => item.value === _get(values, 'subject', ''));
            let maxPrice = _get(subjectVal, 'maxPrice', 0);
            let minPrice = _get(subjectVal, 'minPrice', 0);
            if (
              _get(values, 'workdprice', 0) % 1 !== 0 ||
              _get(values, 'workdprice') < minPrice ||
              _get(values, 'workdprice') > maxPrice
            ) {
              return message.error('工作日默认价格需为整数，并且在价格区间' + minPrice + '-' + maxPrice);
            }
            if (
              _get(values, 'weekdprice', 0) % 1 !== 0 ||
              _get(values, 'weekdprice') < minPrice ||
              _get(values, 'weekdprice') > maxPrice
            ) {
              return message.error('休息日默认价格需为整数，并且在价格区间' + minPrice + '-' + maxPrice);
            }
          }
          console.log(1111);
          if (Number(_get(values, 'classperiod', 0)) > minuteDiff(timeRange[1], timeRange[0])) {
            return message.error('课程时长不能超过时间范围');
          }

          const RULE_LIST = [...workList, ...weekList];
          if (RULE_LIST.some((x: any) => _get(x, 'timeDuration.length', 0) < 2)) {
            message.error('时段不能为空');
            return;
          }
          if (
            RULE_LIST.some(
              (x: any) =>
                _get(x, 'timeDuration.0', '').format('HH:mm') === _get(x, 'timeDuration.1', '').format('HH:mm'),
            )
          ) {
            message.error('时段的结束时间需大于开始时间');
            return;
          }

          if (RULE_LIST.some((x: any) => !_get(x, 'price')) && String(traincode) !== '1') {
            message.error('价格不能为空');
            return;
          }

          if (RULE_LIST.some((x: any) => !_get(x, 'classnum'))) {
            message.error('人数不能为空');
            return;
          }
          if (traincode === '1' && RULE_LIST.some((x: any) => !_get(x, 'traintype'))) {
            message.error('车型不能为空');
            return;
          }

          const unreasonablePriceArr = RULE_LIST.filter((x: any) => {
            let val = subjectcodeOptions.find((item: any) => item.value === _get(x, 'productid'));
            return (
              _get(x, 'price', 0) % 1 !== 0 || //价格需为整数
              _get(x, 'price', 0) > _get(val, 'maxPrice', 0) || //价格需在价格区间
              _get(x, 'price', 0) < _get(val, 'minPrice', 0)
            );
          });
          if (_get(unreasonablePriceArr, 'length', 0) > 0 && String(traincode) !== '1') {
            const arr = unreasonablePriceArr.map((i: any) => {
              let val = subjectcodeOptions.find((item: any) => item.value === _get(i, 'productid'));
              return {
                ...i,
                minPrice: _get(val, 'minPrice', ''),
                maxPrice: _get(val, 'maxPrice', ''),
              };
            });
            let messageArr = [];
            for (let i = 0; i < arr.length; i++) {
              let time =
                _get(arr[i], 'beginhour', '') +
                ':' +
                _get(arr[i], 'beginmin', '') +
                '-' +
                _get(arr[i], 'endhour', '') +
                ':' +
                _get(arr[i], 'endmin', '');
              let type = _get(arr[i], 'daytype', '') === '1' ? '工作日' : '休息日';
              let str =
                type +
                '时段' +
                time +
                '的价格需为整数，并且在价格区间' +
                _get(arr[i], 'minPrice', '') +
                '-' +
                _get(arr[i], 'maxPrice', '');
              messageArr.push(str);
            }
            message.error({
              content: messageArr.join(';'),
              style: {
                width: '80%',
              },
            });
            return;
          }

          if (RULE_LIST.some((x: any) => !RULES.PRICE_NUMBER.pattern.test(_get(x, 'price', 0)))) {
            message.error(RULES.PRICE_NUMBER.message);
            return;
          }

          if (RULE_LIST.some((x: any) => !RULES.PERSON.pattern.test(_get(x, 'classnum', 0)))) {
            message.error(RULES.PERSON.message);
            return;
          }

          if (!_isValidTimeDuration(workList)) {
            message.error('工作日时段存在交叉情况，请修改');
            return;
          }

          if (!_isValidTimeDuration(weekList)) {
            message.error('休息日时段存在交叉情况，请修改');
            return;
          }

          if (!_isValidSubject(workList)) {
            message.error('工作日科目不能为空');
            return;
          }

          if (!_isValidSubject(weekList)) {
            message.error('休息日科目不能为空');
            return;
          }

          run(isEdit ? { ...query, rid: _get(currentRecord, 'rid', '') } : query);
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && _get(traincodeOptions, 'length', 0) > 0 && (
        <Spin spinning={spinning}>
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              rulename: _get(currentRecord, 'rulename'),
              traincode: _get(currentRecord, 'traincode') || _get(traincodeOptions, '0.value'),
              subject: _get(currentRecord, 'subject') || _get(subjectcodeOptions, '0.value'),
              classperiod: _get(currentRecord, 'classperiod'),
              dclassnum: _get(currentRecord, 'dclassnum'),
              traintype: _get(currentRecord, 'traintype'),
              workdprice: _get(currentRecord, 'workdprice'),
              weekdprice: _get(currentRecord, 'weekdprice'),
            }}
          >
            {!isEdit && (
              <BasicInfo
                subject={subject}
                setSubject={setSubject}
                subjectcodeOptions={subjectcodeOptions}
                traincode={traincode}
                setTraincode={setTraincode}
                runGenerateTimeRule={runGenerateTimeRule}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                form={form}
                setWeekList={setWeekList}
                setWorkList={setWorkList}
                weekList={weekList}
                workList={workList}
              />
            )}

            <Title>时段设置</Title>

            <Title style={{ fontSize: 16 }}>工作日(周一到周五)</Title>
            <Button
              type="primary"
              className="mb20"
              onClick={() => {
                workList.push({
                  id: Math.random().toString(16),
                  type: 'workList',
                  beginhour: null,
                  subject: _get(
                    data.find((x: any) => x.productId === form.getFieldValue('subject')),
                    'productCode',
                    '',
                  ),
                  productid: form.getFieldValue('subject'),
                  traintype: null,
                  price: null,
                  classnum: null,
                  timeDuration: [],
                });
                setWorkList([...workList]);
              }}
            >
              添加工作日时段
            </Button>
            <CustomTable columns={columns} dataSource={workList} rowKey="id" pagination={false} />

            <Divider />
            <Title style={{ fontSize: 16 }}>休息日(周六到周日)</Title>
            <Button
              type="primary"
              className="mb20"
              onClick={() => {
                weekList.push({
                  id: Math.random().toString(16),
                  type: 'weekList',
                  beginhour: null,
                  subject: _get(
                    data.find((x: any) => x.productId === form.getFieldValue('subject')),
                    'productCode',
                    '',
                  ),
                  productid: form.getFieldValue('subject'),
                  maxPrice: _get(
                    data.find((x: any) => x.productId === form.getFieldValue('subject')),
                    'maxPrice',
                    '',
                  ),
                  minPrice: _get(
                    data.find((x: any) => x.productId === form.getFieldValue('subject')),
                    'minPrice',
                    '',
                  ),
                  traintype: null,
                  price: null,
                  classnum: null,
                  timeDuration: [],
                });
                setWeekList([...weekList]);
              }}
            >
              添加休息日时段
            </Button>
            <CustomTable columns={columns} dataSource={weekList} rowKey="id" pagination={false} />
          </Form>
        </Spin>
      )}
    </Modal>
  );
}
