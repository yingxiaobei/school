import { CaretDownOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { useOptions } from 'hooks';
import React, { memo, useEffect } from 'react';
import { useState } from 'react';
import { _get } from 'utils';

interface Props {
  data: any;
  robotOptions?: any[];
  selectProject?: (itemType: string) => void;
}

function SingleDropDown({ data, selectProject, robotOptions }: Props) {
  const filterList = _get(data, 'singleTermVo', []).map((item: any) => item.itemType);
  const [currentProject, setCurrentProject] = useState('');

  const res = (robotOptions || []).filter((robot) => {
    return filterList.includes(robot.value);
  });

  useEffect(() => {
    if (res.length) {
      // console.log(res[0].value, res[0].label);
      selectProject && selectProject(res[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menu = (
    <Menu
      onClick={({ item, key, keyPath, domEvent }) => {
        const current = res.find((robot) => {
          return robot.value === key;
        });

        if (current) {
          setCurrentProject(current.label);
          selectProject && selectProject(current.value);
        } else {
          setCurrentProject(robotOptions?.find((robot) => robot.value === key)['label']);
          selectProject && selectProject('');
        }
      }}
    >
      {(robotOptions || [])
        .filter((item) => item.value !== '20000')
        .map((item) => {
          return (
            <Menu.Item key={item.value}>
              <div>{item.label}</div>
            </Menu.Item>
          );
        })}
    </Menu>
  );

  return (
    <div style={{ width: 'auto', position: 'absolute', right: 20, top: 120 }}>
      <Dropdown overlay={menu}>
        <div style={{ color: '#34D160', fontSize: 16, cursor: 'pointer' }} onClick={(e) => e.preventDefault()}>
          {currentProject || _get(res, '0.label')} <CaretDownOutlined />
        </div>
      </Dropdown>
    </div>
  );
}

export default SingleDropDown;
