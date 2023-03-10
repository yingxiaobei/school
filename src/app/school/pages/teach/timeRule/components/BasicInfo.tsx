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
          return message.error('?????????????????????????????????????????????????????????' + minPrice + '-' + maxPrice);
        }
        if (
          _get(values, 'weekdprice', 0) % 1 !== 0 ||
          _get(values, 'weekdprice') < minPrice ||
          _get(values, 'weekdprice') > maxPrice
        ) {
          return message.error('?????????????????????????????????????????????????????????' + minPrice + '-' + maxPrice);
        }
      }
      if (Number(_get(values, 'classperiod', 0)) > minuteDiff(timeRange[1], timeRange[0])) {
        return message.error('????????????????????????????????????');
      }
      runGenerateTimeRule(query);
    });
  }

  return (
    <>
      <Title>????????????</Title>
      <Row>
        <ItemCol
          span={8}
          label="????????????"
          name="rulename"
          rules={[{ whitespace: true, required: true }, RULES.RULE_NAME]}
        >
          <Input style={inputStyle} />
        </ItemCol>
        <ItemCol span={8} label="????????????" name="traincode" rules={[{ required: true }]}>
          <Select
            options={traincodeOptions}
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            style={inputStyle}
            onDropdownVisibleChange={(open) => {
              if (open && (!isEmpty(weekList) || !isEmpty(workList))) {
                message.info('?????????????????????????????????????????????');
              }
            }}
            onChange={(value) => {
              setTraincode(value);
              if (!isEmpty(weekList) || !isEmpty(workList)) {
                setWeekList([]);
                setWorkList([]);
                message.info('?????????????????????????????????????????????????????????????????????????????????');
              }
            }}
          />
        </ItemCol>

        <ItemCol span={8} label="????????????" name="subject">
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
          label="????????????"
          name="classperiod"
          rules={[{ whitespace: true, required: true }, RULES.TIME_LINE]}
        >
          <Input style={inputStyle} />
        </ItemCol>
        <ItemCol
          span={8}
          label="??????????????????"
          name="dclassnum"
          rules={[{ whitespace: true, required: true }, RULES.PERSON]}
        >
          <Input style={inputStyle} />
        </ItemCol>
        <ItemCol span={8} label="????????????">
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
        {/* ???????????? */}
        {traincode !== '1' && (
          <>
            <ItemCol
              span={8}
              label="?????????????????????"
              name="workdprice"
              rules={[{ whitespace: true, required: true }, RULES.RULE_PRICE]}
            >
              <Input style={inputStyle} />
            </ItemCol>
            <ItemCol
              span={8}
              label="?????????????????????"
              name="weekdprice"
              rules={[{ whitespace: true, required: true }, RULES.RULE_PRICE]}
            >
              <Input style={inputStyle} />
            </ItemCol>
          </>
        )}
        {traincode === '1' && (
          <ItemCol span={8} label="????????????" name="traintype" rules={[{ required: true }]}>
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
            ????????????
          </Button>
        </ItemCol>
      </Row>
      <Divider />
    </>
  );
}
