import { useState } from 'react';
import { Modal, TreeSelect } from 'antd';
import { useFetch } from 'hooks';
import { _get } from 'utils';
import { _addConfigSchool, _configSchool } from '../_api';

const { SHOW_CHILD } = TreeSelect;

function AddSimulateTeach(props: any) {
  const { onCancel, title, onOk, sbnid } = props;
  const [selectedSchool, setSelectedSchool] = useState([]);

  const { data = [] } = useFetch({
    request: _configSchool,
    query: {
      traincode: '1',
      sbnid,
    },
    callback: (data: any) => {
      let schools: any = [];
      data.map((areaItem: any) => {
        _get(areaItem, 'children', []).map((schoolItem: any) => {
          if (schoolItem.isSelected === '1') {
            schools.push(schoolItem.id);
          }
        });
      });
      setSelectedSchool(schools);
    },
  });

  const treeData = data.map((areaItem: any) => {
    return {
      title: _get(areaItem, 'area', ''),
      value: _get(areaItem, 'area', ''),
      key: _get(areaItem, 'area', ''),
      children: _get(areaItem, 'children', []).map((schoolItem: any) => {
        return {
          title: _get(schoolItem, 'name', ''),
          value: _get(schoolItem, 'id', ''),
          key: _get(schoolItem, 'id', ''),
        };
      }),
    };
  });

  const tProps = {
    treeData,
    value: selectedSchool,
    onChange: onChange,
    treeCheckable: true,
    showCheckedStrategy: SHOW_CHILD,
    placeholder: '选择驾校',
    style: {
      width: '100%',
    },
  };

  function onChange(value: any) {
    setSelectedSchool(value);
  }

  return (
    <Modal
      visible
      width={900}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={async () => {
        const resData: any = [];
        const hash: any = {};
        data.forEach((x: any) => x.children && resData.push(...x.children));
        resData.forEach((x: any) => {
          hash[x.id] = x;
        });
        const selectedSchoolData = selectedSchool.map((x: any) => hash[x]);
        const associatedCompanyDtos = selectedSchoolData.map((x: any) => {
          return {
            id: x.id,
            area: x.area,
            name: x.name,
            shortName: x.name,
          };
        });

        const res = await _addConfigSchool({
          traincode: '1',
          sbnid,
          associatedCompanyDtos,
        });
        if (_get(res, 'code') === 200) {
          onOk();
        }
      }}
    >
      <TreeSelect {...tProps} defaultValue={selectedSchool} />
    </Modal>
  );
}

export default AddSimulateTeach;
