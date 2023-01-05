import { message } from 'antd';
import { _getCoachList, _getSearchText, _getStudentList } from 'api';
import { CustomTable, Search } from 'components';
import { useHash, useTablePro } from 'hooks';
import { useEffect, useState } from 'react';
import { _get } from 'utils';
import { _getEvaluateList } from './_api';

export default function EvaluateSearch() {
  const [studentData, setOptionStudentData] = useState<any>([]); // 教练下拉数据
  const [coachData, setOptionCoachData] = useState<any>([]); // 教练下拉数据
  const [schoolData, setSchoolData] = useState<any>([]); // 教练下拉数据
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  const evaluationQualityHash = useHash('evaluation_quality_type');
  const { search, _handleSearch, tableProps, _refreshTable } = useTablePro({
    request: _getEvaluateList,
  });

  const columns = [
    {
      title: '培训机构名称',
      dataIndex: 'schoolName',
    },
    {
      title: '评价人',
      dataIndex: 'studentName',
    },
    {
      title: '评价对象',
      dataIndex: 'coachName',
    },
    {
      title: '教学质量',
      dataIndex: 'teachQuality',
      render: (teachQuality: any) => evaluationQualityHash[teachQuality],
    },
    {
      title: '服务质量',
      dataIndex: 'serviceQuality',
      render: (teachQuality: any) => evaluationQualityHash[teachQuality],
    },
    {
      title: '评价时间',
      dataIndex: 'createTime',
    },
  ];

  useEffect(() => {
    if (!_get(search, 'schoolName', '')) {
      return setSelectedSchoolId('');
    }
    const selectedSchool = schoolData.filter((x: any) => {
      return x.label === _get(search, 'schoolName', '');
    });
    setSelectedSchoolId(_get(selectedSchool, '0.id', ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_get(search, 'schoolName', '')]);

  return (
    <>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Select',
            field: 'schoolName',
            options: [{ label: '培训机构名称(全部)', value: '' }, ...schoolData],
            otherProps: {
              showSearch: true,
              filterOption: false,
              allowClear: true,
              onSearch: async (value: string) => {
                const query = {
                  searchType: '2', // 搜索类别  1-车牌； 2-驾校名称
                  searchText: value, // 搜索关键字
                  schoolType: '3',
                };
                const res = await _getSearchText(query);
                const schoolData = _get(res, 'data.rows', []).map((x: any) => {
                  return {
                    label: x.text,
                    value: x.text,
                    id: x.id,
                  };
                });
                setSchoolData(schoolData);
              },
              onSelect: (val: any) => {
                if (!val) {
                  setOptionStudentData([]);
                  setOptionCoachData([]);
                }
              },
            },
          },
          {
            type: 'Select',
            field: 'sid',
            options: [{ label: '评价人(全部)', value: '' }, ...studentData],
            otherProps: {
              showSearch: true,
              filterOption: false,
              allowClear: true,
              onSearch: async (value: string) => {
                if (!_get(search, 'schoolName', '')) {
                  return message.error('请先选择培训机构');
                }
                const res = await _getStudentList({ name: value, stuschoolid: selectedSchoolId });
                const stuData = _get(res, 'data.rows', []).map((x: any) => {
                  return {
                    label: x.name,
                    value: x.sid,
                  };
                });
                setOptionStudentData(stuData);
              },
            },
          },
          {
            type: 'Select',
            field: 'cid',
            options: [{ label: '评价对象(全部)', value: '' }, ...coachData],
            otherProps: {
              showSearch: true,
              filterOption: false,
              allowClear: true,
              onSearch: async (value: string) => {
                if (!_get(search, 'schoolName', '')) {
                  return message.error('请先选择培训机构');
                }
                const res = await _getCoachList({ coachname: value }, { customSchoolId: selectedSchoolId });
                const carData = _get(res, 'data', []).map((x: any) => {
                  return {
                    label: x.coachname,
                    value: x.cid,
                  };
                });
                setOptionCoachData(carData);
              },
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (!_get(search, 'schoolName')) {
            return message.error('请先选择培训机构');
          }
          _refreshTable();
        }}
      />
      <CustomTable columns={columns} {...tableProps} rowKey="id" />
    </>
  );
}
