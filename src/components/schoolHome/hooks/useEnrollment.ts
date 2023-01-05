import { useFetch } from 'hooks';
import { isNil } from 'lodash';
import { EnrollmentData } from '../schoolHomeType';
import { _getNumberOfEnrollment } from '../_api';

function useEnrollment(): [EnrollmentData, boolean] {
  const { data, isLoading } = useFetch({
    request: _getNumberOfEnrollment,
  });

  return [(isNil(data) ? {} : data) as EnrollmentData, isLoading];
}

export default useEnrollment;
