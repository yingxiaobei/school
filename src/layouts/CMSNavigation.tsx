import { Layout, Divider, Dropdown, Menu } from 'antd';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';
import { _get } from 'utils';

const { Sider, Content } = Layout;

function CMSNavigation(props: any) {
  const { menus } = props;

  const reg = new RegExp('^' + PUBLIC_URL + '|/detail', 'g');
  const currentPath = _get(props, 'location.pathname').replace(reg, '');

  return (
    <Sider className="site-layout-background" width={200}>
      <Menu theme="dark" mode="inline" selectedKeys={[currentPath]}>
        {menus.map((x: any) => {
          if (_get(x, 'path', '') === '') {
            //侧栏导航的栏目标题:不可点击跳转
            return (
              <Menu.Item key={Math.random()} disabled>
                <span style={{ color: 'rgb(231 233 237)' }}>{x.title}</span>
              </Menu.Item>
            );
          }
          return (
            <Menu.Item key={x.path.replace(/^\//, '')}>
              <Link to={`${PUBLIC_URL}${x.path.replace(/^\//, '')}`}>
                <span>{x.title}</span>
              </Link>
            </Menu.Item>
          );
        })}
      </Menu>
    </Sider>
  );
}

export default withRouter(CMSNavigation);
