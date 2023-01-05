import { request } from 'services/mock';

export async function _getList(query: any) {
  return await request('mocks', 'GET', query);
}

export async function _addMock(query: any) {
  return await request('mocks', 'POST', query);
}

export async function _updateMock(query: any) {
  const { id, ...rest } = query;
  return await request(`mocks/${id}`, 'PUT', rest);
}

export async function _getMockDetail(query: any) {
  const { id } = query;
  return await request(`mocks/${id}`, 'GET');
}

export async function _deleteMock(query: any) {
  const { id } = query;
  return await request(`mocks/${id}`, 'DELETE');
}
