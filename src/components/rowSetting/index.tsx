import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  SettingOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Button, TableColumnType } from 'antd';
import { Checkbox, Tree, Popover, ConfigProvider, Tooltip, Space } from 'antd';
import classNames from 'classnames';
import type { DataNode } from 'antd/lib/tree';
import { omit } from 'lodash';
import type { ColumnsState } from './container';
import Container from './container';
import omitUndefined, { genColumnKey } from './util';

import { useRefFunction } from './createContainer';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { _saveColumInfo } from './api';

type ColumnSettingProps<T = any> = {
  columns: TableColumnType<T>[];
  draggable?: boolean;
  checkable?: boolean;
  extra?: React.ReactNode;
  checkedReset?: boolean;
};

let leftLigth = 0;
let rightLigth = 0;

// 固定在左侧或者y右侧按钮
const ToolTipIcon: React.FC<{
  title: string;
  columnKey: string | number;
  show: boolean;
  fixed: 'left' | 'right' | undefined;
}> = ({ title, show, children, columnKey, fixed }) => {
  const { columnsMap, setColumnsMap } = Container.useContainer();
  if (!show) {
    return null;
  }
  return (
    <Tooltip title={title}>
      <span
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          const config = columnsMap[columnKey] || {};
          const disableIcon = typeof config.disable === 'boolean' ? config.disable : config.disable?.icon;
          if (disableIcon) return;

          const columnKeyMap = {
            ...columnsMap,
            [columnKey]: { ...config, fixed } as ColumnsState,
          };
          setColumnsMap(columnKeyMap);
        }}
      >
        {children}
      </span>
    </Tooltip>
  );
};

// 固定左侧右侧图标
const CheckboxListItem: React.FC<{
  columnKey: string | number;
  className?: string;
  title?: React.ReactNode;
  fixed?: boolean | 'left' | 'right';
  isLeaf?: boolean;
}> = ({ columnKey, isLeaf, title, className, fixed }) => {
  const dom = (
    <span className={`${className}-list-item-option`}>
      <ToolTipIcon columnKey={columnKey} fixed="left" title={'固定在列首'} show={fixed !== 'left'}>
        <VerticalAlignTopOutlined />
      </ToolTipIcon>
      <ToolTipIcon columnKey={columnKey} fixed={undefined} title={'不固定'} show={!!fixed}>
        <VerticalAlignMiddleOutlined />
      </ToolTipIcon>
      <ToolTipIcon columnKey={columnKey} fixed="right" title={'固定在列尾'} show={fixed !== 'right'}>
        <VerticalAlignBottomOutlined />
      </ToolTipIcon>
    </span>
  );
  return (
    <span className={`${className}-list-item`} key={columnKey}>
      <span className={`${className}-list-item-title`}>{title}</span>
      {/* {!isLeaf ? dom : null} */}
    </span>
  );
};

const CheckboxList: React.FC<{
  list: (any & { index?: number })[];
  className?: string;
  title: string;
  type: string;
  draggable: boolean;
  checkable: boolean;
  showTitle?: boolean;
}> = ({ list, draggable, checkable, className, showTitle = true, title: listTitle, type }) => {
  const { columnsMap, setColumnsMap, setSortKeyColumns, columns } = Container.useContainer();
  const show = list && list.length > 0;
  const [sortColumns, setSortColumns] = useState([]);
  // 处理每项数据
  const treeDataConfig = useMemo(() => {
    if (!show) return {};
    const checkedKeys: string[] = [];
    const loopData = (data: any[], parentConfig?: ColumnsState): DataNode[] => {
      return data.map(({ key, dataIndex, children, ...rest }) => {
        const columnKey = genColumnKey(key, dataIndex, rest.value);
        const config = columnsMap[columnKey || 'null'] || { show: true };

        if (config.show !== false && parentConfig?.show !== false && !children) {
          checkedKeys.push(columnKey);
        }
        const item: DataNode = {
          key: columnKey,
          ...omit(rest, ['className']),
          selectable: false,
          disabled: config.disable === true,
          disableCheckbox: rest.disableCheckbox,
          isLeaf: parentConfig ? true : undefined,
        };
        if (children) {
          item.children = loopData(children, config);
        }
        return item;
      });
    };
    return { list: loopData(list), keys: checkedKeys };
  }, [columnsMap, list, show, sortColumns]);

  /** 移动到指定的位置 */
  const move = useRefFunction((id: React.Key, targetId: React.Key, dropPosition: number) => {
    const newMap = { ...columnsMap };
    const newColumns: any = [...list];
    const findIndex = newColumns.findIndex((item: { dataIndex: React.Key }) => item.dataIndex === id);
    const targetIndex = newColumns.findIndex((item: { dataIndex: React.Key }) => item.dataIndex === targetId);
    const isDownWord = dropPosition > findIndex;
    if (findIndex < 0) {
      return;
    }
    const targetItem = newColumns[findIndex];

    newColumns.splice(findIndex, 1);
    if (dropPosition === 0) {
      newColumns.unshift(targetItem);
    } else {
      newColumns.splice(isDownWord ? targetIndex : targetIndex + 1, 0, targetItem);
    }
    // 重新生成排序数组
    newColumns.forEach((key: { dataIndex: string | number }, order: any) => {
      newMap[key.dataIndex] = { ...(newMap[key.dataIndex] || {}), order };
    });
    // 更新数组

    type === 'left'
      ? columns.splice(0, newColumns.length, ...newColumns)
      : type === 'right'
      ? columns.splice(columns.length - rightLigth, newColumns.length, ...newColumns)
      : columns.splice(leftLigth, newColumns.length, ...newColumns);
    setSortKeyColumns(columns);
    setColumnsMap(newMap);
    setSortColumns(newColumns);
  });

  /** 选中反选功能 */
  const onCheckTree = useRefFunction((e) => {
    const columnKey = e.node.key;
    const tempConfig = columnsMap[columnKey] || {};
    const newSetting = { ...tempConfig };

    if (e.checked) {
      delete newSetting.show;
    } else {
      newSetting.show = false;
    }
    const columnKeyMap = {
      ...columnsMap,
      [columnKey]: omitUndefined(newSetting) as ColumnsState,
    };

    // 如果没有值了，直接干掉他
    if (!omitUndefined(newSetting)) {
      delete columnKeyMap[columnKey];
    }
    setColumnsMap(columnKeyMap);
  });

  if (!show) {
    return null;
  }
  const listDom = (
    <Tree
      itemHeight={24}
      draggable={draggable && !!treeDataConfig.list?.length && treeDataConfig.list?.length > 1}
      checkable={checkable}
      onDrop={(info) => {
        const dropKey = info.node.key;
        const dragKey = info.dragNode.key;
        const { dropPosition, dropToGap } = info;
        const position = dropPosition === -1 || !dropToGap ? dropPosition + 1 : dropPosition;
        move(dragKey, dropKey, position);
      }}
      className="rowTree"
      showIcon={false}
      onCheck={(_, e) => onCheckTree(e)}
      checkedKeys={treeDataConfig.keys}
      showLine={false}
      titleRender={(_node) => {
        const node = { ..._node };
        return <CheckboxListItem className={className} {...node} columnKey={node.key} />;
      }}
      height={280}
      treeData={treeDataConfig.list}
    />
  );
  return (
    <>
      {showTitle && <span className={`${className}-list-title`}>{listTitle}</span>}
      {listDom}
    </>
  );
};

const GroupCheckboxList: React.FC<{
  localColumns: (any & { index?: number })[];
  className?: string;
  draggable: boolean;
  checkable: boolean;
}> = ({ localColumns, className, draggable, checkable }) => {
  const rightList: (any & { index?: number })[] = [];
  const leftList: (any & { index?: number })[] = [];
  const list: (any & { index?: number })[] = [];
  localColumns.forEach((item) => {
    /** 不在 setting 中展示的 */
    if (item.hideInSetting) {
      return;
    }
    const { fixed } = item;
    if (fixed === 'left') {
      leftList.push(item);
      leftLigth = leftList.length;
      return;
    }
    if (fixed === 'right') {
      rightList.push(item);
      rightLigth = rightList.length;
      return;
    }
    list.push(item);
  });
  const showRight = rightList && rightList.length > 0;
  const showLeft = leftList && leftList.length > 0;
  return (
    <div
      className={classNames(`${className}-list`, {
        [`${className}-list-group`]: showRight || showLeft,
      })}
    >
      <CheckboxList
        title={'固定在左侧'}
        list={leftList}
        draggable={draggable}
        checkable={checkable}
        className={className}
        type={'left'}
      />
      {/* 如果没有任何固定，不需要显示title */}
      <CheckboxList
        list={list}
        draggable={draggable}
        checkable={checkable}
        title={'不固定'}
        showTitle={showLeft || showRight}
        className={className}
        type={'center'}
      />
      <CheckboxList
        title={'固定在右侧'}
        list={rightList}
        draggable={draggable}
        checkable={checkable}
        type={'right'}
        className={className}
      />
    </div>
  );
};

// 列设置
function ColumnSetting<T>(props: ColumnSettingProps<T>) {
  const [visible, setVisible] = useState(false);

  const counter = Container.useContainer();
  const localColumns: TableColumnType<T> &
    {
      index?: number;
      fixed?: any;
      key?: any;
    }[] = props.columns;
  const { columnsMap, setColumnsMap, update } = counter;

  /**
   * 设置全部选中，或全部未选中
   *
   * @param show
   */
  const setAllSelectAction = useRefFunction((show: boolean = true) => {
    const columnKeyMap = {};
    const loopColumns = (columns: any) => {
      columns.forEach(({ key, fixed, index, children, dataIndex, disableCheckbox }: any) => {
        const columnKey = genColumnKey(key, dataIndex, index);
        if (columnKey && !disableCheckbox) {
          columnKeyMap[columnKey] = {
            show,
            fixed,
          };
        }
        if (children) {
          loopColumns(children);
        }
      });
    };
    loopColumns(localColumns);
    setColumnsMap(columnKeyMap);
  });

  /** 全选和反选 */
  const checkedAll = useRefFunction((e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setAllSelectAction();
    } else {
      setAllSelectAction(false);
    }
  });

  // 未选中的 key 列表
  const unCheckedKeys = Object.values(columnsMap).filter((value) => !value || value.show === false);

  // 是否已经选中
  const indeterminate = unCheckedKeys.length > 0 && unCheckedKeys.length !== localColumns.length;

  const handleSave = async (type: string) => {
    // 0:保存 1：重置
    const { table } = counter;
    const res = await _saveColumInfo(
      type === '0'
        ? table.map((item, index) => {
            return { dataIndex: item.dataIndex, orderNum: index, id: item.id };
          })
        : [],
    );
    setVisible(false);
    type === '1' && update();
  };
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const className = getPrefixCls('pro-table-column-setting');
  return (
    <Popover
      arrowPointAtCenter
      title={
        <div className={`${className}-title `}>
          <Checkbox
            indeterminate={indeterminate}
            checked={unCheckedKeys.length === 0 && unCheckedKeys.length !== localColumns.length}
            onChange={(e) => checkedAll(e)}
          >
            列展示
          </Checkbox>
          <br />
          <div className="mt10">
            <Button onClick={() => handleSave('0')} danger size={'small'} type={'primary'}>
              保存
            </Button>
            <Button onClick={() => handleSave('1')} danger size={'small'} className="ml20">
              重置
            </Button>
          </div>
        </div>
      }
      overlayClassName={`${className}-overlay`}
      trigger="click"
      placement="bottomRight"
      content={
        <GroupCheckboxList
          checkable={props.checkable ?? true}
          draggable={props.draggable ?? true}
          className={className}
          localColumns={localColumns}
        />
      }
      visible={visible}
      onVisibleChange={(visible) => setVisible(visible)}
      overlayStyle={{ width: '160px' }}
    >
      <div style={{ width: '74px', height: '36px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        列设置
      </div>
    </Popover>
  );
}

export default ColumnSetting;
