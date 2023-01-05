import { Auth } from 'utils';
import { formatQueryParams } from 'utils/formatQueryParams';
import { USER_CENTER_URL } from 'constants/env';

export async function postRequestTemp(path: string, query: object = {}) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (Auth.isAuthenticated()) {
    Object.assign(headers, { token: Auth.get('token') });
  }

  const options = {
    method: 'POST',
    headers,
  };

  return fetch(USER_CENTER_URL + path + formatQueryParams(query), options)
    .then(parseJSON)
    .catch((error) => {});
}

function parseJSON(response: any) {
  return response.json();
}
