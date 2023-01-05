import { useState } from 'react';

interface IUsePagination<T extends IPagination> {
  (pagination?: T): [T, (params: T) => void];
}

export const usePagination: IUsePagination<IPagination> = (initialState = { pageSize: 10, total: 0, current: 1 }) => {
  const [pagination, setPagination] = useState(initialState);

  return [pagination, setPagination];
};
