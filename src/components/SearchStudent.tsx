/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Input, Select } from 'antd';
import { _getStudentList } from 'api';
import { Auth, _get } from 'utils';
import { debounce } from 'lodash';

type TProps = {
  value: any;
  setValue: Function;
  otherProps?: any;
  stuschoolid?: string;
};

type SimpleRequestKey = 'name' | 'coachname' | 'idcard';

export default function SearchStudent(props: TProps) {
  const { value, setValue, otherProps = {}, stuschoolid = Auth.get('schoolId') } = props;
  const [optionData, setOptionData] = useState<any>([]);

  useEffect(() => {
    setOptionData([]);
    setValue(undefined);
  }, [stuschoolid]);

  function handleIdCardOrName(isIdCard: boolean, trimValue: string) {
    let query;
    if (isIdCard) {
      const queryKey: SimpleRequestKey = 'idcard';
      query = { [queryKey]: trimValue };
    } else {
      const queryKey: SimpleRequestKey = 'name';
      query = { [queryKey]: trimValue };
    }
    return query;
  }

  function simpleFetchOptions(value: string, stuschoolid: any) {
    const trimValue = value.trim();
    if (_get(trimValue, 'length', 0) < 2) return;
    const isIdCard = /\d/.test(trimValue);
    const query = handleIdCardOrName(isIdCard, trimValue);
    _getStudentList({ ...query, ...otherProps, stuschoolid: stuschoolid }, {}, true).then((res) => {
      setOptionData(
        _get(res, 'data.rows', []).map((x: any) => {
          const isWithdrawal = _get(x, 'status') === '02'; // 对于退学学员的状态单独标出
          return { value: _get(x, 'sid', ''), label: `${isWithdrawal ? '（退学）' : ''}${x.name} ${x.idcard}` };
        }),
      );
    });
  }

  const simpleFetchOptionsDebounce = debounce(simpleFetchOptions, 600);

  return (
    <Input.Group compact style={{ width: 340, display: 'inline-block', marginRight: 20 }}>
      <Select
        placeholder={'学员姓名/证件号码'}
        value={value}
        onSearch={(value) => {
          simpleFetchOptionsDebounce(value, stuschoolid);
        }}
        showSearch
        filterOption={false}
        style={{ width: '100%' }}
        onChange={(value) => {
          setValue(value);
        }}
        options={optionData}
      />
    </Input.Group>
  );
}
