import { useTablePro, useHash, useOptions } from 'hooks';
import { CustomTable, Search, Title } from 'components';
import CopyWords from 'components/CopyWords';
import { AxiosResponse } from 'axios';

interface IProps<T> {
  entityId: string; // 业务主键
  api: (...args: any[]) => Promise<AxiosResponse<T>>;
}

export default function Log<T extends { rows: any[]; total: number }>({ entityId, api }: IProps<T>) {
  const { tableProps, _refreshTable, search, _handleSearch } = useTablePro({
    request: api,
    extraParams: {
      entityId,
    },
    dataSourceFormatter(data) {
      return data.map((entity, index) => ({ _id: index, ...entity }));
    },
  });

  const jgServiceNameTypeHash = useHash('jg_service_name_type');

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      render: (serviceName: string) => jgServiceNameTypeHash[serviceName],
      width: 160,
    },
    {
      title: '交互时间',
      dataIndex: 'logTime',
      width: 190,
      render: (requestContent: string) => <div>{requestContent}</div>,
    },
    {
      title: '请求路径',
      dataIndex: 'serviceUrl',
      width: 200,
      align: 'left',
      render: (serviceUrl: string) => CopyWords({ content: serviceUrl, width: 180 }),
    },
    {
      title: '请求报文',
      dataIndex: 'requestContent',
      width: 400,
      align: 'left',
      render: (requestContent: string) =>
        CopyWords({
          content: requestContent,
          width: 380,
        }),
    },
    {
      title: '返回报文',
      dataIndex: 'responseContent',
      width: 400,
      align: 'left',
      render: (responseContent: string) =>
        CopyWords({
          content: responseContent,
          width: 380,
        }),
    },
  ];

  return (
    <>
      <Title style={{ marginBottom: 10 }}>监管交互日志</Title>
      <Search
        filters={[
          {
            type: 'Select',
            field: 'serviceName',
            options: [{ value: '', label: '服务名称(全部)' }, ...useOptions('jg_service_name_type')],
          },
          {
            type: 'RangePicker',
            field: ['startLogTime', 'endLogTime'],
            placeholder: ['交互日期起', '交互日期止'],
            otherProps: {
              getPopupContainer: undefined,
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />
      <CustomTable {...tableProps} columns={columns} rowKey={'_id'} />
    </>
  );
}
