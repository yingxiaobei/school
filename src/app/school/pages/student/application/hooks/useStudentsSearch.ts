import { _getStudentList } from 'api';
import { useState } from 'react';
import { _get } from 'utils';
import { debounce } from 'lodash';

export const useStudentsSearch = () => {
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState<{ value: any; label: string }[]>([]);

  const handleStudentSearchMemo = async (value: string) => {
    try {
      setStudentSearchLoading(true);
      const trimValue = value.trim();
      if (_get(trimValue, 'length', 0) < 2) return;
      const isIdCard = /\d/.test(trimValue);
      const query = isIdCard ? { idcard: trimValue } : { name: trimValue };
      const data = await _getStudentList(query, {}, true);
      const code = _get(data, 'code');
      if (code === 200) {
        const rawOptions: any[] = _get(data, 'data.rows', []);
        const studentOptions = rawOptions.map((student) => {
          const isWithdrawal = _get(student, 'status') === '02'; // 对于退学学员的状态单独标出
          return {
            value: _get(student, 'sid', ''),
            label: `${isWithdrawal ? '（退学）' : ''}${_get(student, 'name', '')} ${_get(student, 'idcard', '')}`,
          };
        });
        setStudentOptions(studentOptions);
      }
    } catch (error) {
      const errorMessage = _get(error, 'message', '');
      console.log(errorMessage);
    } finally {
      setStudentSearchLoading(false);
    }
  };

  const simpleFetchDebounce = debounce(handleStudentSearchMemo, 600);

  return {
    handleStudentSearchMemo: simpleFetchDebounce,
    studentOptions,
    studentSearchLoading,
    setStudentOptions,
  };
};
