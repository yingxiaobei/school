import React, { useImperativeHandle, useState } from 'react';
import { Table } from 'antd';
import { _get } from 'utils';
import { useFetch, useForceUpdate, usePagination } from 'hooks';
import { AxiosResponse } from 'axios';
import { useEffect } from 'react';

type TProps = {
  columns: { title: string; dataIndex: string; render?: any; width?: any; fixed?: any; ellipsis?: any }[];
  request: (query?: any) => Promise<AxiosResponse<any> | undefined>;
  query?: object;
  requiredFields?: any;
  rowKey: string;
  setLoading?: any;
  showSerial?: boolean; //展示列表序号
  scroll?: any;
};

// FIXME: rename TablePro -> PageTable
const TablePro = React.forwardRef((props: TProps, ref) => {
  const {
    columns,
    query,
    request,
    requiredFields,
    rowKey,
    setLoading,
    showSerial = true,
    scroll = { x: 'max-content', y: 400 },
  } = props;
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination] = usePagination();
  const [rowId, setRowId] = useState(-1);
  const { data, isLoading = false } = useFetch({
    request,
    query: { ...query, page: pagination.current, limit: pagination.pageSize },
    depends: [pagination.current, pagination.pageSize, ignore],
    requiredFields,
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  useImperativeHandle(ref, () => ({
    refreshTable() {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  }));

  useEffect(() => {
    setLoading && setLoading(isLoading);
  }, [isLoading, setLoading]);

  const getColumnsList = () => {
    if (showSerial && columns[0]?.title !== '序号') {
      columns.unshift({
        title: '序号',
        width: 50,
        fixed: 'left',
        ellipsis: 'true',
        dataIndex: '',
        render: (_: any, record: any, index: number) =>
          index + 1 + (pagination.current - 1) * (pagination.pageSize || 10),
      });
    }
    return columns;
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

  return (
    <Table
      rowKey={rowKey}
      bordered
      onRow={clickRow}
      rowClassName={setRowClassName}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onShowSizeChange: (_: any, pageSize: number) => {
          setPagination({ ...pagination, current: 1, pageSize });
        },
        onChange: (page, pageSize) => {
          setPagination({ ...pagination, current: page, pageSize });
        },
      }}
      scroll={scroll}
      loading={isLoading}
      columns={getColumnsList()}
      dataSource={_get(data, 'rows', [])}
    />
  );
});

export default TablePro;
