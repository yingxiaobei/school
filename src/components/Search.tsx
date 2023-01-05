import React, { useEffect, useState } from 'react';
import { Button, Cascader, Col, DatePicker, Input, message, Row, Select, TimePicker } from 'antd';
import { _get } from 'utils';
import moment from 'moment';
import { debounce } from 'lodash';

const { RangePicker } = DatePicker;
const { RangePicker: TimeRangePicker } = TimePicker;

type ElementType =
  | 'Input'
  | 'Select'
  | 'MultipleSelect'
  | 'RangePicker'
  | 'CustomSelect'
  | 'TimeRangePicker'
  | 'CustomSelectOfCoach'
  | 'RangePickerDisable'
  | 'DatePicker'
  | 'DatePickerJ'
  | 'RangePickerSelect'
  | 'ComboSelect'
  | 'Cascader'
  | 'SimpleSelectOfStudent'
  | 'SimpleSelectOfCoach';

interface PowerOption extends IOption {
  placeholder?: string;
}

type OptionsType = PowerOption[];
export type FiltersType = {
  type: ElementType;
  field: string | string[];
  options?: OptionsType;
  placeholder?: string | string[];
  rangeDay?: number;
  crossYear?: boolean;
  rangeAllowClear?: boolean; // 是否允许清除日期
  otherProps?: any;
  show?: boolean;
  onChangeCallback?(field?: any, value?: any): void;
}[];
type SearchWidthType = 'large' | 'small';
type SimpleRequestKey = 'name' | 'coachname' | 'idcard';
type TProps = {
  search: object;
  _handleSearch(name: string, value: any): void;
  filters: FiltersType;
  refreshTable?(): void;
  extraParamsForCustomRequest?: object;
  studentOptionData?: IOption[];
  loading?: boolean;
  showSearchButton?: boolean;
  searchWidth?: SearchWidthType;
  /**@description 不要用这个属性 这个属性仅仅是为了解决 切换驾校时 回填的交互问题 */
  hack?: unknown;
  /**
   * @description (学员)姓名 + 身份证 合并
   * @since 1.0.68.0
   */
  simpleStudentRequest?: (...args: any[]) => Promise<any>;
  /**
   * @description (教练员)姓名 + 身份证 合并
   * @since 1.0.68.0
   */
  simpleCoachRequest?: (...args: any[]) => Promise<any>;
  /**
   * @deprecated
   * @description 请移步使用 {@link simpleCoachRequest} 属性
   */
  customCoachRequest?: any;
  /**
   * @deprecated
   * @description 请移步使用 {@link simpleStudentRequest} 属性
   */
  customRequest?: any;
};

const Search = React.forwardRef((props: TProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  const {
    search,
    _handleSearch,
    filters,
    refreshTable,
    customRequest,
    customCoachRequest,
    extraParamsForCustomRequest = {},
    studentOptionData = [],
    loading = false,
    showSearchButton = true,
    searchWidth = 'large', //列表中使用默认large，弹窗中使用可以传‘small’
    hack,
    simpleStudentRequest,
    simpleCoachRequest,
  } = props;
  const [optionData, setOptionData] = useState<any>(studentOptionData);
  const [optionCoachData, setOptionCoachData] = useState<any>([]);
  const [customType, setCustomType] = useState('');
  const [coachCustomType, setCoachCustomType] = useState('');
  const [dateArr, setDateArr] = useState<any>();
  const [hackValue, setHackValue] = useState<any>();
  const [dateValue, setDateValue] = useState<any>();
  const [hasLoading, setHasLoading] = useState<any>(false);
  const [dateType, setDateType] = useState('');

  const [simpleStudentOptions, setSimpleStudentOptions] = useState<IOption[]>(studentOptionData);
  const [simpleCoachOptions, setSimpleCoachOptions] = useState<IOption[]>([]);

  const span1 = searchWidth === 'large' ? 4 : 6; //普通输入框等宽度较小的组件使用
  const span2 = searchWidth === 'large' ? 8 : 12; //时间选择器等较宽的组件使用

  const [comboMap, setComboMap] = useState<{ [key: string]: unknown }>({});

  useEffect(() => {
    filters.forEach(({ options = [], type, field }) => {
      if (type === 'ComboSelect') {
        setComboMap((combMap) => ({ ...combMap, [field as string]: options['0'] }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 目前仅为身份证和教练证件号开放(切换驾校)
    if (hack) {
      if (_get(comboMap, ['card', 'value']) === 'coaIdcard') {
        _handleSearch('card', 'idcard');
        setComboMap({
          ...comboMap,
          card: {
            label: '学员身份证号',
            placeholder: '请输入学员身份证号',
            value: 'idcard',
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hack]);

  useEffect(() => {
    if (hasLoading && !loading) {
      setHasLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function fetchOptions(value: any, customType: any, field: any, type: any, otherProps?: any) {
    const query = { [customType]: value.trim(), ...extraParamsForCustomRequest };
    // 搜索条件小于2位时不发起请求
    if (_get(value.trim(), 'length', 0) < 2) {
      return;
    }

    // 身份证号小于5位时不发起请求
    if (customType === 'idcard' && _get(value.trim(), 'length', 0) < 5) {
      return;
    }
    if (type === 'CustomSelect') {
      customRequest(query, otherProps).then((res: any) => {
        setOptionData(
          _get(res, 'data.rows', []).map((x: any) => ({ value: _get(x, 'sid', ''), label: `${x.name} ${x.idcard}` })),
        );
      });
    }
    if (type === 'CustomSelectOfCoach') {
      customCoachRequest(query).then((res: any) => {
        setOptionCoachData(
          _get(res, 'data', []).map((x: any) => ({ value: _get(x, 'cid', ''), label: `${x.coachname}` })),
        );
      });
    }
  }

  function handleIdCardOrName(
    type: 'SimpleSelectOfStudent' | 'SimpleSelectOfCoach',
    isIdCard: boolean,
    trimValue: string,
  ) {
    let query;
    if (isIdCard) {
      // if (_get(trimValue, 'length', 0) < 5) return; // 身份证号小于5位时不发起请求(替换成防抖了)
      const queryKey: SimpleRequestKey = 'idcard';
      query = { [queryKey]: trimValue, ...extraParamsForCustomRequest };
    } else {
      const queryKey: SimpleRequestKey = type === 'SimpleSelectOfStudent' ? 'name' : 'coachname';
      query = { [queryKey]: trimValue, ...extraParamsForCustomRequest };
    }
    return query;
  }

  //shopSchoolId 我推销的 学员名字/证件号搜索 学员需指定驾校、同时选中的是身份证号
  function simpleFetchOptions(value: string, type: 'SimpleSelectOfStudent' | 'SimpleSelectOfCoach', otherProps?: any) {
    const trimValue = value.trim();
    if (_get(trimValue, 'length', 0) < 2) return;
    const isIdCard = /\d/.test(trimValue);
    if (type === 'SimpleSelectOfStudent') {
      const query = handleIdCardOrName(type, isIdCard, trimValue);
      if (Object.keys(otherProps).includes('shopSchoolId') && !otherProps.shopSchoolId) {
        message.error('请先选择所属驾校');
        return;
      }
      if (Object.keys(otherProps).includes('shopSchoolId')) {
        otherProps.customSchoolId = otherProps.shopSchoolId;
      }
      simpleStudentRequest?.(query, otherProps, true).then((res) => {
        setSimpleStudentOptions(
          _get(res, 'data.rows', []).map((x: any) => {
            const isWithdrawal = _get(x, 'status') === '02'; // 对于退学学员的状态单独标出
            return {
              value: Object.keys(otherProps).includes('shopSchoolId') ? _get(x, 'idcard', '') : _get(x, 'sid', ''),
              label: `${isWithdrawal ? '（退学）' : ''}${x.name} ${x.idcard}`,
            };
          }),
        );
      });
    } else {
      const query = handleIdCardOrName(type, isIdCard, trimValue);
      simpleCoachRequest?.(query).then((res) => {
        setSimpleCoachOptions(
          _get(res, 'data', []).map((x: any) => ({ value: _get(x, 'cid', ''), label: `${x.coachname}` })),
        );
      });
    }
  }

  const simpleFetchOptionsDebounce = debounce(simpleFetchOptions, 600);

  return (
    <Row id="searchCol" className="searchColCls" gutter={[10, 0]} ref={ref}>
      {filters.map((x, index) => {
        const {
          type,
          options = [],
          placeholder,
          rangeDay,
          crossYear = false,
          rangeAllowClear = true,
          field,
          otherProps = {},
          show = true,
          onChangeCallback = () => {},
        } = x;

        if (!show) return null;

        function handleChange(field: any, value: any) {
          onChangeCallback(field, value);
          _handleSearch(field, value);
        }

        if (type === 'SimpleSelectOfStudent' || type === 'SimpleSelectOfCoach') {
          return (
            <Col span={span1} key={index}>
              <Select
                value={_get(search, field, undefined)}
                placeholder={
                  type === 'SimpleSelectOfStudent'
                    ? '学员姓名/证件号码'
                    : placeholder
                    ? `${placeholder}姓名/证件号码`
                    : '教练姓名/证件号码'
                }
                onSearch={(value) => {
                  simpleFetchOptionsDebounce(value, type, otherProps);
                }}
                onClear={() => {
                  simpleFetchOptionsDebounce('', type, otherProps);
                }}
                showSearch
                filterOption={false}
                style={{ margin: '0 10px 16px 0' }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode.parentNode}
                allowClear={true}
                onChange={(value) => {
                  handleChange(field, value);
                }}
                options={type === 'SimpleSelectOfStudent' ? simpleStudentOptions : simpleCoachOptions}
              />
            </Col>
          );
        }

        if (type === 'Input') {
          return (
            <Col span={span1} key={index}>
              <Input
                {...otherProps}
                value={_get(search, field, '')}
                placeholder={placeholder}
                onChange={(e) => {
                  handleChange(field, e.target.value);
                }}
                className="mr10 mb16 " //  添加宽度：在modal中，Input的宽度不受全局宽度配置限制，因此需要单独设置
              />
            </Col>
          );
        }

        if (type === 'DatePicker') {
          return (
            <Col span={span2} key={index}>
              <DatePicker
                {...otherProps}
                value={_get(search, field) ? moment(_get(search, field, undefined)) : ''}
                placeholder={placeholder}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                onChange={(date: any) => {
                  if (date) {
                    handleChange(field, date.format('YYYY-MM-DD'));
                  } else {
                    handleChange(field, null);
                  }
                }}
                className="mr10 mb16 " //  添加宽度：在modal中，Input的宽度不受全局宽度配置限制，因此需要单独设置
              />
            </Col>
          );
        }

        if (type === 'DatePickerJ') {
          return (
            <Col span={span2} key={index}>
              <DatePicker
                {...otherProps}
                picker={_get(otherProps, 'picker', 'date')}
                value={_get(search, field) ? moment(_get(search, field, undefined)) : ''}
                placeholder={placeholder}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                onChange={(date: any, dataString) => {
                  if (date) {
                    handleChange(field, dataString);
                  } else {
                    handleChange(field, null);
                  }
                }}
                className="mr10 mb16 " //  添加宽度：在modal中，Input的宽度不受全局宽度配置限制，因此需要单独设置
              />
            </Col>
          );
        }

        if (type === 'ComboSelect') {
          return (
            <Col span={span2} key={index}>
              <Input.Group
                compact={true}
                style={{
                  margin: '0 10px 16px 0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginRight: 20,
                  minWidth: 200,
                }}
              >
                <Select
                  defaultValue={_get(options, [0, 'value'])}
                  value={_get(search, [field as string]) || _get(options, [0, 'value'])}
                  options={options}
                  style={{ width: '50%', display: 'inline-block' }}
                  onChange={(value, option) => {
                    handleChange(field, value);
                    const preKey = _get(comboMap, [field as string, 'value']);
                    // 满足当读二代身份证
                    const preText = _get(search, value) || _get(search, preKey);
                    handleChange(preKey, undefined);
                    handleChange(value, preText);
                    setComboMap({ ...comboMap, [field as string]: option });
                  }}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode.parentNode}
                ></Select>
                <Input
                  style={{ width: '50%', display: 'inline-block' }}
                  value={_get(search, _get(comboMap, [field as string, 'value']))}
                  placeholder={_get(comboMap, [field as string, 'placeholder'])}
                  onChange={(e) => {
                    handleChange(_get(comboMap, [field as string, 'value']), e.target.value);
                  }}
                  className="mr10" //  添加宽度：在modal中，Input的宽度不受全局宽度配置限制，因此需要单独设置
                />
              </Input.Group>
            </Col>
          );
        }

        if (type === 'CustomSelect') {
          return (
            <Col span={span2} key={index}>
              <Input.Group
                compact
                style={{ margin: '0 10px 16px 0', display: 'inline-block', marginRight: 20, minWidth: 200 }}
              >
                <Select
                  defaultValue={_get(options, '0.value')}
                  style={{ width: '50%' }}
                  onChange={(value) => {
                    setCustomType(value);
                    handleChange(field, undefined);
                  }}
                  options={options}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode.parentNode}
                />

                <Select
                  value={_get(search, field, undefined)}
                  placeholder={customType === 'idcard' ? '请输入全部证件号' : '请输入姓名'}
                  onSearch={(value) => {
                    fetchOptions(value, customType || _get(x, 'options.0.value'), field, type, otherProps);
                  }}
                  onClear={() => {
                    fetchOptions('', customType || _get(x, 'options.0.value'), field, type, otherProps);
                  }}
                  showSearch
                  filterOption={false}
                  style={{ width: '50%' }}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode.parentNode}
                  allowClear={true}
                  onChange={(value) => {
                    handleChange(field, value);
                  }}
                  options={optionData}
                />
              </Input.Group>
            </Col>
          );
        }

        if (type === 'CustomSelectOfCoach') {
          return (
            <Col span={span2} key={index}>
              <Input.Group
                compact
                style={{ margin: '0 10px 16px 0', display: 'inline-block', marginRight: 20, minWidth: 200 }}
              >
                <Select
                  defaultValue={_get(options, '0.value')}
                  style={{ width: '50%' }}
                  onChange={(value) => {
                    setCoachCustomType(value);
                    handleChange(field, undefined);
                  }}
                  options={options}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode.parentNode}
                />

                <Select
                  value={_get(search, field, undefined)}
                  placeholder={coachCustomType === 'idcard' ? '请输入全部证件号' : '请输入姓名'}
                  onSearch={(value) => {
                    fetchOptions(value, coachCustomType || _get(x, 'options.0.value'), field, type);
                  }}
                  onClear={() => {
                    fetchOptions('', coachCustomType || _get(x, 'options.0.value'), field, type);
                  }}
                  showSearch
                  getPopupContainer={(triggerNode) => triggerNode.parentNode.parentNode}
                  filterOption={false}
                  // style={{ width: 240 }}
                  style={{ width: '50%' }}
                  allowClear={true}
                  onChange={(value) => {
                    handleChange(field, value);
                  }}
                  options={optionCoachData}
                />
              </Input.Group>
            </Col>
          );
        }

        if (type === 'Select') {
          return (
            <Col span={span1} key={index}>
              <Select
                {...otherProps}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                onChange={(value) => handleChange(field, value)}
                value={_get(search, field, '')}
                style={{ margin: '0 10px 16px 0' }} // 添加宽度：在modal中，Select的宽度不受全局宽度配置限制，因此需要单独设置
                options={options}
              />
            </Col>
          );
        }

        if (type === 'MultipleSelect') {
          return (
            <Col span={span1} key={index}>
              <Select
                {...otherProps}
                mode="multiple"
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                onChange={(value: any) => {
                  if (value.length === options.length - 1) {
                    if (!value.includes('')) {
                      handleChange(field, '');
                      return;
                    }
                  }
                  if (value.length > 1 && value.includes('')) {
                    if (value[0] !== '') {
                      handleChange(field, '');
                    } else {
                      handleChange(field, value.filter((i: string) => i !== '').join(','));
                    }
                    return;
                  }
                  handleChange(field, value.join(','));
                }}
                value={
                  Array.isArray(_get(search, field, '')) ? _get(search, field, []) : _get(search, field, '').split(',')
                }
                style={{ margin: '0 10px 16px 0', minWidth: 220 }} // 添加宽度：在modal中，Select的宽度不受全局宽度配置限制，因此需要单独设置
                options={options}
              />
            </Col>
          );
        }

        if (type === 'RangePicker') {
          return (
            <Col span={span2} key={index}>
              <RangePicker
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                {...otherProps}
                placeholder={placeholder}
                onChange={(dates: any) => {
                  if (dates) {
                    handleChange(field[0], _get(dates, '0').format('YYYY-MM-DD'));
                    handleChange(field[1], _get(dates, '1').format('YYYY-MM-DD'));
                  } else {
                    handleChange(field[0], '');
                    handleChange(field[1], '');
                  }
                }}
                className="mr10 mb16"
                style={{ height: 36 }}
              />
            </Col>
          );
        }

        if (type === 'RangePickerDisable') {
          return (
            <Col span={span2} key={index}>
              <RangePicker
                {...otherProps}
                placeholder={placeholder}
                value={hackValue || dateValue || [_get(search, `${field[0]}`), _get(search, `${field[1]}`)]}
                style={{ margin: '0 10px 16px 0' }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                allowClear={rangeAllowClear}
                onCalendarChange={(date: any) => {
                  setDateArr(date);

                  if (_get(date, '0') && _get(date, '1')) {
                    // 限制选择日期不能跨年
                    if (crossYear) {
                      if (_get(date, '0').year() === _get(date, '1').year()) {
                        setDateValue(date);
                        handleChange(field[0], _get(date, '0').format('YYYY-MM-DD'));
                        handleChange(field[1], _get(date, '1').format('YYYY-MM-DD'));
                      } else {
                        message.error('选择日期不能跨年');
                      }
                    } else {
                      setDateValue(date);
                      handleChange(field[0], _get(date, '0').format('YYYY-MM-DD'));
                      handleChange(field[1], _get(date, '1').format('YYYY-MM-DD'));
                    }
                  }
                }}
                disabledDate={(current: any) => {
                  if (rangeDay) {
                    if (!dateArr || dateArr.length === 0) {
                      return false;
                    }
                    const tooLate = dateArr[0] && current.diff(dateArr[0], 'days') > rangeDay;
                    const tooEarly = dateArr[1] && dateArr[1].diff(current, 'days') > rangeDay;
                    return tooEarly || tooLate;
                  }
                }}
                onOpenChange={(open: any) => {
                  if (open) {
                    setHackValue([]);
                    setDateArr([]);
                    if (rangeAllowClear) {
                      setDateValue([]);
                      handleChange(field[0], '');
                      handleChange(field[1], '');
                    }
                  } else {
                    setHackValue(undefined);
                  }
                }}
              />
            </Col>
          );
        }

        if (type === 'TimeRangePicker') {
          return (
            <Col span={_get(otherProps, 'format', '') === 'HH' ? span1 : span2} key={index}>
              <TimeRangePicker
                {...otherProps}
                key={index}
                placeholder={placeholder}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                onChange={(dates: any) => {
                  if (dates) {
                    handleChange(field[0], _get(dates, '0').format(otherProps.format));
                    handleChange(field[1], _get(dates, '1').format(otherProps.format));
                  } else {
                    handleChange(field[0], '');
                    handleChange(field[1], '');
                  }
                }}
                style={{ margin: '0 10px 16px 0' }}
              />
            </Col>
          );
        }

        if (type === 'RangePickerSelect') {
          return (
            <Col key={index} span={span2}>
              <Row gutter={[10, 0]}>
                <Col span={8}>
                  <Select
                    defaultValue={_get(options, '0.value')}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    onChange={(value) => {
                      setDateType(value);
                      // console.log(
                      //   'first',
                      //   _get(search, (dateType || field).split(',')[1], undefined),
                      //   _get(search, (dateType || field).split(',')[0], undefined),
                      //   search,
                      // );
                    }}
                    style={{ margin: '0 10px 16px 0' }} // 添加宽度：在modal中，Select的宽度不受全局宽度配置限制，因此需要单独设置
                    options={options}
                  />
                </Col>
                <Col span={16}>
                  <RangePicker
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    {...otherProps}
                    placeholder={placeholder}
                    onChange={(dates: any) => {
                      if (dates) {
                        handleChange(
                          ((dateType || field) as string).split(',')[0],
                          _get(dates, '0').format('YYYY-MM-DD'),
                        );
                        handleChange(
                          ((dateType || field) as string).split(',')[1],
                          _get(dates, '1').format('YYYY-MM-DD'),
                        );
                      } else {
                        handleChange(((dateType || field) as string).split(',')[0], '');
                        handleChange(((dateType || field) as string).split(',')[1], '');
                      }
                    }}
                    value={
                      _get(search, ((dateType || field) as string).split(',')[0], null)
                        ? [
                            moment(_get(search, ((dateType || field) as string).split(',')[0], undefined)),
                            moment(_get(search, ((dateType || field) as string).split(',')[1], null)),
                          ]
                        : []
                    }
                    className="mr10 mb16"
                    style={{ height: 36 }}
                  />
                </Col>
              </Row>
            </Col>
          );
        }

        if (type === 'Cascader') {
          //订单类型级联搜索项，两层，只能搜索子级value
          return (
            <Col key={index} span={span1}>
              <Cascader
                {...otherProps}
                onChange={(value: any, it: any) => {
                  let data = value
                    .map((item: any, index: any) => {
                      if (item.length === 1) {
                        return it[index][0].children.map((e: any) => e.value).join(',');
                      } else {
                        return item[1];
                      }
                    })
                    .join(',');

                  handleChange(field, data);
                }}
                options={options}
              ></Cascader>
            </Col>
          );
        }
        return null;
      })}

      {showSearchButton && (
        <Col span={span1}>
          <Button
            type="primary"
            onClick={() => {
              setHasLoading(true);
              refreshTable?.();
            }}
            loading={hasLoading && loading}
            className="mb20 ml10"
          >
            查询
          </Button>
        </Col>
      )}
    </Row>
  );
});

export default Search;

// {
//   type: 'RangePickerSelect', //日期选择合成
//   field: 'begin,end', //默认选择的日期类型value值
//   options: [
//     { label: '创建日期', value: 'begin,end' },
//     { label: '结算时间', value: 'settlementOverBegin,settlementOverEnd' },
//     { label: '入账时间', value: 'schoolSubAccountTimeBegin,schoolSubAccountTimeEnd' },
//   ],
//   placeholder: ['日期起', '日期止'],
//   otherProps: {
//     defaultValue: [moment().subtract(30, 'day'), moment()], //默认选择的日期
//   },
// },
