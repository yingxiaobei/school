import React, { ReactNode, useContext } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { _get } from 'utils';
import { DownOutlined } from '@ant-design/icons';
import GlobalContext from 'globalContext';

type IProps = {
  children: ReactNode;
  moreButtonName?: string;
  type?: 'button' | 'a' | undefined; //button:最外层是button，适合放在外层和查询新建按钮一行;a:最外层是a标签，适合放在操作列
};

export default function MoreOperation(props: IProps) {
  const { children, moreButtonName = '更 多', type = 'a' } = props;
  const { $elementAuthTable } = useContext(GlobalContext);
  let childrenAfterFilter: ReactNode[] = [];

  React.Children.forEach(children, (x: any) => {
    // 过滤掉 null
    if (x) {
      const authId = _get(x, 'props.authId');

      // 过滤掉不符合展示前提元素
      const insertWhen = _get(x, 'props.insertWhen', true);
      if (!insertWhen) {
        return;
      }

      // 过滤掉无权限元素
      if (authId && !$elementAuthTable[authId]) {
        return;
      }

      childrenAfterFilter.push(x);
    }
  });

  // // 如果 Button 数量小于1就直接返回
  if (childrenAfterFilter.length < 1) {
    return <>{childrenAfterFilter}</>;
  }

  const menu = (
    <Menu>
      {childrenAfterFilter.map((Ele, index) => (
        <Menu.Item key={index} className="operation-menu">
          {Ele}
        </Menu.Item>
      ))}
    </Menu>
  );

  // Button 数量大于4的时候添加更多按钮
  return (
    <>
      <Dropdown overlay={menu}>
        {type === 'button' ? (
          <Button className="ml20">
            {moreButtonName}
            <DownOutlined />
          </Button>
        ) : (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a className="ant-dropdown-link mr4 ml4 operation-dropdown" onClick={(e) => e.preventDefault()}>
            {moreButtonName}
            <DownOutlined />
          </a>
        )}
      </Dropdown>
    </>
  );
}
