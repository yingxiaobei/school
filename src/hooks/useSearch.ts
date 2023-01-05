import { useState } from 'react';

interface IUseSearch {
  (initialState?: object): [object, (name: string, value: any) => void];
}

export const useSearch: IUseSearch = (initialState = {}) => {
  const [search, setSearch] = useState(initialState as object);

  function _handleSearch(name: string, value: any) {
    setSearch((search: any) => ({ ...search, [name]: value }));
  }

  return [search, _handleSearch];
};
