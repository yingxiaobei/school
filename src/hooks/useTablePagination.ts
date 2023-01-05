import { useState, useMemo } from 'react';

interface TPagination {
  pageSize?: number;
  total?: number;
  current?: number;
  isSimplePagination?: boolean;
  showQuickJumper?: boolean;
  initPageSizeOptions?: any;
}

// FIXME: TS-允许不传参数
export function useTablePagination({
  pageSize = 10,
  total = 0,
  current = 1,
  isSimplePagination = false,
  showQuickJumper = true,
  initPageSizeOptions = [10, 20, 50, 100],
}: TPagination): [Required<Omit<TPagination, 'isSimplePagination' | 'showQuickJumper'>>, (arg: any) => void, any] {
  const [pagination, setPagination] = useState({
    pageSize,
    total,
    current,
    initPageSizeOptions,
  });

  const tablePagination = useMemo(
    () => ({
      showSizeChanger: !isSimplePagination,
      showQuickJumper: showQuickJumper ? !isSimplePagination : showQuickJumper,
      showTotal: !isSimplePagination ? (total: number) => `共 ${total} 条` : null,
      ...pagination,
      onShowSizeChange: (_: any, pageSize: number) => {
        setPagination({ ...pagination, current: 1, pageSize });
      },
      onChange: (page: number) => {
        setPagination((pagination) => ({ ...pagination, current: page }));
      },
      pageSizeOptions: initPageSizeOptions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSimplePagination, pagination],
  );
  return [pagination, setPagination, tablePagination];
}
