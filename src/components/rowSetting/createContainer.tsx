import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from 'hooks';
import { _getColumInfo } from './api';
import { useForceUpdate } from 'hooks';
const EMPTY: unique symbol = Symbol();

export interface ContainerProviderProps<State = void> {
  initialState?: any;
  children: React.ReactNode;
}

export interface Container<Value, State = void> {
  Provider: React.ComponentType<ContainerProviderProps<State>>;
  useContainer: () => Value;
}

export function createContainer<Value, State = void>(
  useHook: (initialState?: State) => Value,
): Container<Value, State> {
  let Context = React.createContext<Value | typeof EMPTY>(EMPTY);
  function Provider(props: ContainerProviderProps<State>) {
    const [column, setColumn] = useState([]);
    const depence = props.initialState?.loadDependece?.some((item: any) => !Object.keys(item).length);
    const [ignore, forceUpdate] = useForceUpdate();
    const [uncheckColumn, setUncheckColumn] = useState([]);
    useFetch({
      request: _getColumInfo, //自定义参数配置二级监管平台类型（两位数字，第一位与“监管请求平台类型”保持一致 00：省监管 01：省监管-河南 02:广东 04:海口 05:镇江）
      depends: [depence, ignore],
      callback: (data: any) => {
        let showColumn = data.showList.map((a: any) => {
          return { ...a, ...props?.initialState?.columns.filter((item: any) => item.dataIndex === a.dataIndex)[0] };
        });
        let sortColumn = [];
        if (data.showList[data.showList.length - 1].dataIndex === 'operate') {
          sortColumn = [
            ...showColumn.slice(0, showColumn.length - 1),
            ...data.hideList.map((a: any) => {
              return {
                ...props?.initialState?.columns.filter((item: any) => item.dataIndex === a.dataIndex)[0],
                ...a,
              };
            }),
            showColumn[showColumn.length - 1],
          ];
        } else {
          sortColumn = [
            ...showColumn,
            ...data.hideList.map((a: any) => {
              return {
                ...props?.initialState?.columns.filter((item: any) => item.dataIndex === a.dataIndex)[0],
                ...a,
              };
            }),
          ];
        }

        setUncheckColumn(data.hideList || []);
        setColumn(sortColumn.length ? sortColumn : props?.initialState?.columns);
      },
    });

    let value = useHook({
      ...props.initialState,
      columns: column,
      uncheckColumn: uncheckColumn,
      update: { update: forceUpdate, ignore: ignore },
    });
    return <Context.Provider value={value}>{props.children}</Context.Provider>;
  }

  function useContainer(): Value {
    let value = React.useContext(Context);
    if (value === EMPTY) {
      throw new Error('Component must be wrapped with <Container.Provider>');
    }
    return value;
  }
  return { Provider, useContainer };
}

export function useContainer<Value, State = void>(container: Container<Value, State>): Value {
  return container.useContainer();
}

const useRefFunction = <T extends (...args: any) => any>(reFunction: T) => {
  const ref = useRef<any>(null);
  ref.current = reFunction;
  return useCallback((...rest: Parameters<T>): ReturnType<T> => {
    return ref.current?.(...(rest as any));
  }, []);
};

export { useRefFunction };
