import { v4 } from 'uuid';

export function generateIdForDataSource(dataSource: any[]) {
  return dataSource.map((x: any) => ({ ...x, id: v4() }));
}
