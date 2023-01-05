import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { Table, Tooltip } from 'antd';
import { getTableMaxHeight, _get } from 'utils';
import ResizeableTitle from './ResizeableTitle';
import GlobalContext from 'globalContext';
import ReactDragListView from 'react-drag-listview';

type TProps = {
  columns: {
    title: string;
    dataIndex: string;
    render?: any;
    width?: string | number;
    fixed: 'left' | 'right';
    ellipsis?: boolean;
    onHeaderCell?: any;
  }[];
  loading: boolean;
  showSerial?: boolean; //展示列表序号
  [key: string]: any;
  sort?: boolean;
  pageType?: string;
  columnsList?: {
    //自定义增加的表头
    title: string;
    dataIndex: string;
    render?: any;
    width?: string | number;
    fixed: 'left' | 'right';
    ellipsis?: boolean;
    onHeaderCell?: any;
  }[];
};

const CustomTable = React.forwardRef((props: TProps, ref) => {
  const {
    columns = [],
    showSerial = true,
    loading,
    dataSource,
    sort = false,
    pageType = '',
    columnsList = [],
    ...restProps
  } = props;
  const [Columns, setColumns] = useState([]) as any;
  const { $columnsAll } = useContext(GlobalContext);
  const modelStatusRef = useRef(null);
  const tableRef: any = useRef(null);
  const [rowId, setRowId] = useState(-1);
  // useEffect(() => {
  //   // if (loading) {
  //   //   forceUpdate(); //避免表格查询后列头错位
  //   // }
  //   if (!loading && tableRef?.current?.querySelector('.ant-table-body')) {
  //     setTimeout(() => {
  //       const scrollLeft = tableRef?.current?.querySelector('.ant-table-body')?.scrollLeft;
  //       const scrollTop = tableRef?.current?.querySelector('.ant-table-body')?.scrollTop || 0;
  //       tableRef?.current?.querySelector('.ant-table-body')?.scrollTo(scrollLeft - 1, scrollTop);
  //       tableRef?.current?.querySelector('.ant-table-body')?.scrollTo(scrollLeft, scrollTop);
  //     }, 0);
  //   }
  // }, [loading, Columns]);
  const getColumnsList = (columns: any) => {
    let showColumn =
      $columnsAll[pageType] && $columnsAll[pageType]?.showList?.length > 0
        ? $columnsAll[pageType]?.showList.map((a: any) => {
            return { ...a, ...columns.filter((item: any) => item.dataIndex === a.dataIndex)[0] };
          })
        : columns;
    const list = showColumn.concat(...columnsList, ...showColumn.splice(-1, 1)).filter((x: any) => {
      return _get(x, 'hide', false) === false;
    });

    let fixedLeft: any = [];
    let fixedRight: any = [];
    let noFixed: any = [];
    list.forEach((element: any) => {
      if (element.fixed === 'left') {
        fixedLeft.push(element);
      } else if (element.fixed === 'right') {
        fixedRight.push(element);
      } else {
        noFixed.push(element);
      }
    });
    //把固定列分别放在左边或右边，防止自定义列顺序影响固定列顺序
    const listLast = [...fixedLeft, ...noFixed, ...fixedRight];
    const columnsMap: any = listLast
      .map((x: { title?: any; ellipsis?: any; dataIndex?: any; render?: any; fixed?: any }) => {
        let obj = {};
        if (_get(x, 'width')) {
          obj = {
            ...x,
            ellipsis:
              x.title == '操作'
                ? false
                : _get(x, 'ellipsis') !== undefined
                ? x.ellipsis
                : {
                    showTitle: false,
                  },
          };
        } else {
          obj = { ...x };
        }
        if (sort && x.title != '操作' && x.title != '序号') {
          const dataIndex = x.dataIndex;
          obj['sorter'] = (a: any, b: any) => {
            // console.log(a[dataIndex].toString().localeCompare(b[dataIndex].toString()), '111');
            if (!a[dataIndex]) {
              a[dataIndex] = '';
            }
            if (!b[dataIndex]) {
              b[dataIndex] = '';
            }
            if (typeof a[dataIndex] === 'number' || typeof b[dataIndex] === 'number') {
              return a[dataIndex] - b[dataIndex];
            } else {
              let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;
              if (!cReg.test(a[dataIndex]) || !cReg.test(b[dataIndex])) {
                return a[dataIndex].localeCompare(b[dataIndex]);
              } else {
                return a[dataIndex].localeCompare(b[dataIndex], 'zh');
              }
            }
          };
          obj['sortDirections'] = ['ascend', 'descend'];
        }
        return {
          ...obj,
          // @ts-ignore
          dataIndex: x.title == '操作' ? '_opt111_' : x.dataIndex,
          title:
            _get(x, 'fixed', false) || x.title == '操作' ? x.title : <span className="dragHandler">{x.title}</span>,
          render: x.render
            ? x.render
            : (msg: any) => (
                <Tooltip title={msg} placement="topLeft">
                  {msg}
                </Tooltip>
              ),
          onHeaderCell: (column: any) => ({
            width: column.width ? column.width : 80,
            onResize: handleResize(x.dataIndex),
          }),
          fixed: x.title == '操作' ? 'right' : x.fixed ? x.fixed : false,
        };
      })
      .filter((x: any) => {
        return x.checked !== false;
      });
    if (showSerial && columns[0]?.title !== '序号') {
      columnsMap.unshift({
        title: '序号',
        dataIndex: '_index111_',
        width: 40,
        ellipsis: true,
        fixed: 'left',
        render: (_: any, record: any, index: number) => {
          if (restProps.pagination === false) {
            return index + 1;
          }
          return index + 1 + (restProps?.pagination?.current - 1 || 0) * (restProps?.pagination?.pageSize || 10);
        },
      });
    }
    return columnsMap;
  };

  useEffect(() => {
    const columnsCopy = [...columns];
    const col = getColumnsList(columnsCopy);
    setColumns(col);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, pageType]);

  useEffect(() => {
    // 每次 更新 把值 复制给 modelStatusRef
    modelStatusRef.current = Columns;
  }, [Columns]); // 依赖的值 等modelStatus 改变了 才出发里面的值
  const handleResize = (dataIndex: any) => (e: any, { size }: any) => {
    //console.log(modelStatusRef.current)
    // console.log(size);
    const nextColumns = [...(_get(modelStatusRef, 'current', []) as any[])];
    const obj = nextColumns.find((f) => f.dataIndex === dataIndex) || {};
    obj.width = size.width;
    // nextColumns[index] = {
    //   ...nextColumns[index],
    //   width: size.width,
    // };
    setColumns(nextColumns);
    // console.log(Columns, nextColumns);
  };
  const components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  function itemRender(current: any, type: 'page' | 'prev' | 'next', originalElement: any) {
    if (type === 'prev') {
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      return <a>上一页</a>;
    }
    if (type === 'next') {
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      return <a>下一页</a>;
    }
    return originalElement;
  }
  const dragProps = {
    onDragEnd(fromIndex: any, toIndex: any) {
      if ($columnsAll[pageType]) return; //自定义列的不允许在此拖拽调换位置；
      const isCheck = _get(restProps, 'rowSelection') !== undefined;
      let fromIndexEnd = fromIndex;
      let toIndexEnd = toIndex;
      if (isCheck) {
        fromIndexEnd = fromIndexEnd - 1; //存在rowSelection的列表也占用一列，造成index错误
        toIndexEnd = toIndexEnd - 1;
      }
      const columns = [...Columns];
      if (_get(columns[toIndexEnd], 'fixed', false) !== false) {
        return; //固定列不允许被调换位置
      }
      const item = columns.splice(fromIndexEnd, 1)[0];
      columns.splice(toIndexEnd, 0, item);
      setColumns(columns);
    },
    nodeSelector: 'th',
    handleSelector: '.dragHandler',
    ignoreSelector: 'react-resizable-handle',
  };
  // 选中行
  const clickRow = (record: any, index: any) => {
    return {
      onClick: () => {
        setRowId(index);
      },
    };
  };
  const setRowClassName = (record: any, index: any) => {
    if (index === rowId) {
      return 'clickRowStyl';
    }
    return '';
  };
  const TableMemo = useMemo(
    () =>
      Columns?.length > 0 && (
        <Table
          scroll={{
            ...restProps.scroll,
            y: _get(restProps, 'scroll.y') ? _get(restProps, 'scroll.y') : getTableMaxHeight(),
          }}
          {...restProps}
          onRow={clickRow}
          rowClassName={setRowClassName}
          dataSource={dataSource}
          columns={Columns}
          components={components}
          loading={loading}
          pagination={
            restProps.pagination === false
              ? false
              : {
                  ...restProps.pagination,
                  showTotal: (total: number) => `共${total}条记录`,
                  itemRender: _get(restProps, 'pagination.size') === 'small' ? undefined : itemRender,
                }
          }
        />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(restProps), Columns, rowId],
  );

  return (
    <div ref={tableRef} className="tabletabletable">
      <ReactDragListView.DragColumn {...dragProps}>{TableMemo}</ReactDragListView.DragColumn>
    </div>
  );
});

export default CustomTable;
