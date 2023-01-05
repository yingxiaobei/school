import { DownOutlined, ToolOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Popover, Row } from 'antd';
import { ItemCol } from 'components';
import { useState, useEffect } from 'react';

import SEARCH from 'statics/images/search.png';
import { _get } from 'utils';

interface IProps {
  id?: keyof any;
  showSearchButton?: boolean;
  refreshTable: any;
  loading: boolean;
  children: React.ReactNode;
  searchRef?: any;
  renderTable?: any;
  setColumn?: any;
  column?: any;
  showCustomColumn?: boolean;
  showOpenBtn?: boolean;
  update?: any[];
  openToggle?: boolean; //false:搜索框默认折叠 ，true：搜索框默认展开
}

//把查询按钮和新增等按钮放到一行的容器
export default function ButtonContainer(props: IProps) {
  const {
    showSearchButton = false,
    refreshTable,
    loading = false,
    searchRef,
    renderTable,
    setColumn,
    column = [],
    showCustomColumn = false,
    showOpenBtn = false,
    update = [],
    openToggle = false,
  } = props;
  const [open, setOpen] = useState(openToggle);
  function handelShowColumn(checkedValues: any) {
    let res = column;
    res.forEach((item: any) => {
      item.checked = checkedValues.includes(item.value);
    });
    setColumn([...res]);
  }

  const pupupContent = (
    <div>
      <Checkbox.Group
        defaultValue={Array.from({ length: column.length }, (v, k) => k)}
        style={{ width: '100%' }}
        onChange={handelShowColumn}
      >
        {column.map((item: any, index: any) => (
          <Row key={index} style={{ marginBottom: '5px' }}>
            <Col span={24}>
              <Checkbox disabled={_get(item, 'title') === '序号'} value={index}>
                {item.title}
              </Checkbox>
            </Col>
          </Row>
        ))}
      </Checkbox.Group>
    </div>
  );

  function setSearchShow(openstatus = openToggle) {
    const searchCom = searchRef.current;
    const children = searchCom.children;
    let num = 0;
    // setOpen(!open);
    [...children].forEach((x, index) => {
      num = num + Number(x.className.split('ant-col ant-col-')[1]);
      if (num > 24) {
        //展开收起超过一行的内容
        children.item(index).style.display = openstatus ? '' : 'none';
        // searchCom.style.cssText = open
        //   ? 'height: unset; overflow: unset; marginBottom: unset'
        //   : 'height: 50px; overflow: hidden; marginBottom: 14px ';
      }
    });
  }

  useEffect(() => {
    if (showOpenBtn) {
      setSearchShow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...update]);

  return (
    <div id="operator" className="flex">
      {
        props.children //其他操作按钮，例如新增
      }

      <div className="flex1"></div>

      {column.length > 0 && showCustomColumn && (
        <Popover placement="bottom" content={pupupContent} trigger="click">
          <Button className="mr10" danger icon={<ToolOutlined />}>
            自定义列
          </Button>
        </Popover>
      )}
      {showOpenBtn && searchRef && (
        <Button
          icon={!open ? <DownOutlined /> : <UpOutlined />}
          className="mr10"
          danger
          onClick={() => {
            setOpen(!open);
            setSearchShow(!open);
          }}
        >
          {open ? '收起' : '展开'}
        </Button>
      )}

      {showSearchButton && (
        <Button
          loading={loading}
          icon={<img alt={''} src={SEARCH} className="img-icon-s mr4 mb4" />}
          className="mb20"
          type="primary"
          onClick={refreshTable}
          style={{ marginLeft: 'auto' }} //查询按钮，靠右显示
        >
          查询
        </Button>
      )}
    </div>
  );
}
