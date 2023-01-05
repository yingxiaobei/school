import { createContainer } from './createContainer';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import useMergedState from 'rc-util/lib/hooks/useMergedState';

import type { TableColumnType } from 'antd';
import { genColumnKey } from './util';

export type ColumnsState = {
  show?: boolean;
  fixed?: 'right' | 'left' | undefined;
  order?: number;
  disable?:
    | boolean
    | {
        checkbox: boolean;
        icon: boolean;
      };
};

export type UseContainerProps<T = any> = {
  columns?: TableColumnType<T>[];
  columnsState?: any['columnsState'];
  uncheckColumn?: TableColumnType<T>[];
  update?: any;
};

function useContainer(props: UseContainerProps = {}) {
  /** 自己 props 的引用 */
  const propsRef = useRef<any>();
  // 用于排序的数组
  const [tableColumns, setTableColumns] = useState<Array<any>>(props.columns || []);
  const [sortKeyColumns, setSortKeyColumns] = useState<Array<any>>(props.columns || []);

  useEffect(() => {
    setTableColumns(props.columns || [{}]);
  }, [props.columns]);
  /** 默认全选中 */
  const defaultColumnKeyMap = useMemo(() => {
    const columnKeyMap = {};
    props.columns?.forEach(({ key, fixed }, index) => {
      const columnKey = genColumnKey(key, index);
      if (columnKey) {
        columnKeyMap[columnKey] = {
          show: true,
          fixed,
        };
      }
    });
    return columnKeyMap;
  }, [props.columns]);

  const [columnsMap, setColumnsMap] = useMergedState<Record<string, ColumnsState>>(
    () => {
      const { persistenceType, persistenceKey } = props.columnsState || {};

      if (persistenceKey && persistenceType && typeof window !== 'undefined') {
        /** 从持久化中读取数据 */
        const storage = window[persistenceType];
        try {
          // @ts-ignore
          const storageValue = storage?.getItem(persistenceKey);
          if (storageValue) {
            return JSON.parse(storageValue);
          }
        } catch (error) {
          console.warn(error);
        }
      }
      return props.columnsState?.value || props.columnsState?.defaultValue || defaultColumnKeyMap;
    },
    {
      value: props.columnsState?.value,
      onChange: props.columnsState?.onChange,
    },
  );

  /** 清空一下当前的 key */
  const clearPersistenceStorage = useCallback(() => {
    const { persistenceType, persistenceKey } = props.columnsState || {};
    if (!persistenceKey || !persistenceType || typeof window === 'undefined') return;

    /** 给持久化中设置数据 */
    const storage = window[persistenceType];
    try {
      // @ts-ignore
      storage?.removeItem(persistenceKey);
    } catch (error) {
      console.error(error);
    }
  }, [props.columnsState]);
  useEffect(() => {
    if (!props.columnsState?.persistenceKey || !props.columnsState?.persistenceType) {
      return;
    }
    if (typeof window === 'undefined') return;
    /** 给持久化中设置数据 */
    const { persistenceType, persistenceKey } = props.columnsState;
    const storage = window[persistenceType];
    try {
      // @ts-ignore
      storage?.setItem(persistenceKey, JSON.stringify(columnsMap));
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.columnsState?.persistenceKey, columnsMap, props.columnsState?.persistenceType]);

  useMemo(() => {
    const loopFilter = (column: any) => {
      const columnKeyMap = {};
      column?.forEach(({ key, fixed, index, children, dataIndex }: any) => {
        const columnKey = genColumnKey(key, dataIndex, index);
        if (columnKey) {
          columnKeyMap[columnKey] = {
            show: false,
          };
        }
      });
      return columnKeyMap;
    };
    setColumnsMap(loopFilter(props.uncheckColumn));
  }, [props.uncheckColumn?.length, props.update.ignore]);

  useMemo(() => {
    const loopFilter = (column: any) => {
      return column.filter((item: any) => {
        // 删掉不应该显示的
        if (Object.keys(columnsMap).includes(item.dataIndex)) {
          const config = columnsMap[item.dataIndex];
          if (config && (config.show ?? true)) {
            item.fixed = Object.keys(config).includes('fixed') ? config.fixed : item.fixed;
            return true;
          }
        } else {
          return true;
        }
      });
    };
    setSortKeyColumns(loopFilter(tableColumns));
  }, [columnsMap, tableColumns, props.update.ignore]);
  const renderValue = {
    sortKeyColumns,
    setSortKeyColumns,
    propsRef,
    columnsMap,
    setColumnsMap,
    tableColumns: props.columns,
    columns: tableColumns,
    table: sortKeyColumns,
    clearPersistenceStorage,
    update: props.update.update,
  };

  return renderValue;
}

const Container = createContainer<ReturnType<typeof useContainer>, UseContainerProps>(useContainer);

export type ContainerType = typeof useContainer;

export { useContainer };

export default Container;
