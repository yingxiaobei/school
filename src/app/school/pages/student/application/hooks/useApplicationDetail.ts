import { useFetch } from 'hooks';
import { ApplicationDetail, _getApplicationDetail } from '../_api';

export const useApplicationDetail = (id: string | number | null) => {
  const { isLoading, isError, data }: { isLoading: boolean; isError: boolean; data: ApplicationDetail } = useFetch({
    request: _getApplicationDetail,
    requiredFields: ['id'],
    query: {
      id: id,
    },
  });
  return {
    isLoading,
    isError,
    data,
  } as const;
};
