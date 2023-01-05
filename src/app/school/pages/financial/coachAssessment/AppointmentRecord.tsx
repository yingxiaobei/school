import { useForceUpdate, useTablePagination } from 'hooks';
import React, { memo, useEffect } from 'react';
import OrderRecordTable from '../../teach/orderRecord/OrderRecordTable';

interface Props {
  cid: string | number | null;
  beginDate: any;
  endDate: any;
}

function AppointmentRecord({ cid, beginDate, endDate }: Props) {
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, update] = useForceUpdate();

  return (
    <OrderRecordTable
      query={{
        page: pagination.current,
        limit: pagination.pageSize,
        cid,
        beginDate,
        endDate,
        // order_code: _get(data, 'ordercode', ''),
        // sid: _get(data, 'sid', ''),
      }}
      ignore={ignore}
      pagination={pagination}
      setPagination={setPagination}
      tablePagination={tablePagination}
    />
  );
}

export default memo(AppointmentRecord);
