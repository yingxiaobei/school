import { isEmpty } from 'lodash';
import { Input, Select, Row, TimePicker, Divider, Button, message } from 'antd';
import { useOptions } from 'hooks';
import { ItemCol, Title } from 'components';
import moment from 'moment';
import { RULES } from 'constants/rules';
import { minuteDiff, _get } from 'utils';

const { RangePicker } = TimePicker;
const inputStyle = { width: 180 };

export default function BasicInfo(props: any) {
  const {
    runGenerateTimeRule,
    timeRange,
    setTimeRange,
    form,
    traincode,
    setTraincode,
    subjectcodeOptions,
    setWeekList,
    setWorkList,
    weekList,
    workList,
  } = props;

  const carTypeOptions = useOptions('business_scope', false, '-1', [], {
    forceUpdate: true,
  });
  const traincodeOptions = useOptions('combo');

  function _handleGenerateTimeRule() {
    form.validateFields().then((values: any) => {
      let subjectVal = subjectcodeOptions.find((item: any) => item.value === _get(values, 'subject', ''));
      const query = {
        rulename: _get(values, 'rulename', ''),
        traincode: _get(values, 'traincode', ''),
        classperiod: _get(values, 'classperiod', ''),
        dclassnum: _get(values, 'dclassnum', ''),
        traintype: _get(values, 'traintype', ''),
        workdprice: _get(values, 'workdprice', '0'),
        weekdprice: _get(values, 'weekdprice', '0'),
        subject: _get(subjectVal, 'subject', ''),
        productid: _get(subjectVal, 'value', ''),
        beginhour: moment(timeRange[0]).format('HH'),
        beginmin: moment(timeRange[0]).format('mm'),
        endhour: moment(timeRange[1]).format('HH'),
        endmin: moment(timeRange[1]).format('mm'),
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
      if (Number(_get(values, 'classperiod', 0)) > minuteDiff(timeRange[1], timeRange[0])) {
        return message.error('课程时长不能超过时间范围');
      }
      runGenerateTimeRule(query);
    });
  }

  return (
    <>
      <Title>基本信息</Title>
      <Row>
        <ItemCol
          span={8}
          label="规则名称"
          name="rulename"
          rules={[{ whitespace: true, required: true }, RULES.RULE_NAME]}
        >
          <Input style={inputStyle} />
        </ItemCol>
        <ItemCol span={8} label="课程类型" name="traincode" rules={[{ required: true }]}>
          <Select
            options={traincodeOptions}
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            style={inputStyle}
            onDropdownVisibleChange={(open) => {
              if (open && (!isEmpty(weekList) || !isEmpty(workList))) {
                message.info('修改课程类型将清空时段设置内容');
              }
            }}
            onChange={(value) => {
              setTraincode(value);
              if (!isEmpty(weekList) || !isEmpty(workList)) {
                setWeekList([]);
                setWorkList([]);
                message.info('时段设置内容已清空，点击生成时段可生成新的时段设置内容');
              }
            }}
          />
        </ItemCol>

        <ItemCol span={8} label="默认科目" name="subject">
          <Select
            options={subjectcodeOptions}
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            style={inputStyle}
          />
        </ItemCol>
      </Row>
      <Row>
        <ItemCol
          span={8}
          label="课程时长"
          name="classperiod"
          rules={[{ whitespace: true, required: true }, RULES.TIME_LINE]}
        >
          <Input style={inputStyle} />
        </ItemCol>
        <ItemCol
          span={8}
          label="默认可约人数"
          name="dclassnum"
          rules={[{ whitespace: true, required: true }, RULES.PERSON]}
        >
          <Input style={inputStyle} />
        </ItemCol>
        <ItemCol span={8} label="时间范围">
          <RangePicker
            style={inputStyle}
            defaultValue={timeRange}
            format={'HH:mm'}
            allowClear={false}
            onChange={(dates: any) => {
              setTimeRange(dates);
            }}
          />
        </ItemCol>
      </Row>
      <Row>
        {/* 不用此类 */}
        {traincode !== '1' && (
          <>
            <ItemCol
              span={8}
              label="工作日默认价格"
              name="workdprice"
              rules={[{ whitespace: true, required: true }, RULES.RULE_PRICE]}
            >
              <Input style={inputStyle} />
            </ItemCol>
            <ItemCol
              span={8}
              label="休息日默认价格"
              name="weekdprice"
              rules={[{ whitespace: true, required: true }, RULES.RULE_PRICE]}
            >
              <Input style={inputStyle} />
            </ItemCol>
          </>
        )}
        {traincode === '1' && (
          <ItemCol span={8} label="默认车型" name="traintype" rules={[{ required: true }]}>
            <Select
              options={carTypeOptions}
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
              style={inputStyle}
            />
          </ItemCol>
        )}
      </Row>
      <Row>
        <ItemCol label="" span={8} wrapperCol={{ offset: 8 }}>
          <Button type="primary" onClick={_handleGenerateTimeRule}>
            生成时段
          </Button>
        </ItemCol>
      </Row>
      <Divider />
    </>
  );
}
