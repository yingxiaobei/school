import { _getRecordList, _getRecordListLog } from './_api';
import { useTablePro, useHash, useOptions } from 'hooks';
import { CustomTable, Search, Title } from 'components';
import copy from 'copy-text-to-clipboard';
import { Button, message, Tooltip } from 'antd';

interface IProps {
  entityId: string;
}

export default function VehicleTrajectory(props: IProps) {
  const { entityId } = props;

  const { tableProps, _refreshTable, search, _handleSearch } = useTablePro({
    request: _getRecordList,
    extraParams: {
      entityId,
    },
  });

  // 第三方交互日志
  const {
    tableProps: tablePropsLog,
    _refreshTable: _refreshTableLog,
    search: searchLog,
    _handleSearch: _handleSearchLog,
  } = useTablePro({
    request: _getRecordListLog,
    extraParams: {
      entityId,
    },
  });

  const jgServiceNameTypeHash = useHash('jg_service_name_type'); // 监管交互日志服务名称
  const logServiceNameTypeHash = useHash('log_service_name_type'); // 第三方交互日志服务名称

  const copyWords = (content: string, width: number) => {
    return (
      <Tooltip
        placement="topLeft"
        title={() => {
          return (
            <>
              <div style={{ textAlign: 'right' }} className="mb10 mt10">
                <Button
                  type="primary"
                  onClick={() => {
                    message.success('复制成功');
                    copy(content);
                  }}
                >
                  复制
                </Button>
              </div>
              {content}
            </>
          );
        }}
      >
        <div
          style={{
            width,
            textOverflow: '-o-ellipsis-lastline',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {content}
        </div>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      render: (serviceName: string) => jgServiceNameTypeHash[serviceName],
      width: 100,
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
      render: (serviceUrl: string) => copyWords(serviceUrl, 180),
    },
    {
      title: '请求报文',
      dataIndex: 'requestContent',
      width: 400,
      align: 'left',
      render: (requestContent: string) => copyWords(requestContent, 380),
    },
    {
      title: '返回报文',
      dataIndex: 'responseContent',
      width: 400,
      align: 'left',
      render: (responseContent: string) => copyWords(responseContent, 380),
    },
  ];

  const columnsLog = [
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      render: (serviceName: string) => logServiceNameTypeHash[serviceName],
      width: 100,
    },
    {
      title: '交互时间',
      dataIndex: 'logTime',
      width: 190,
      render: (requestContent: string) => <div>{requestContent}</div>,
    },
    {
      title: '请求报文',
      dataIndex: 'requestContent',
      width: 400,
      align: 'left',
      render: (requestContent: string) => copyWords(requestContent, 380),
    },
    {
      title: '返回结果',
      dataIndex: 'responseContent',
      width: 400,
      align: 'left',
      render: (responseContent: string) => copyWords(responseContent, 380),
    },
  ];

  return (
    <>
      <Title>监管交互日志</Title>
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
      <CustomTable {...tableProps} columns={columns} rowKey={entityId} />
      <Title>第三方交互日志</Title>
      <Search
        filters={[
          {
            type: 'Select',
            field: 'serviceName',
            options: [{ value: '', label: '服务名称(全部)' }, ...useOptions('log_service_name_type')],
          },
          {
            type: 'RangePicker',
            field: ['startLogTime', 'endLogTime'],
            placeholder: ['交互日期起', '交互日期止'],
            otherProps: {
              getPopupContainer: undefined,
              allowClear: false,
            },
          },
        ]}
        search={searchLog}
        _handleSearch={_handleSearchLog}
        refreshTable={_refreshTableLog}
      />
      <CustomTable {...tablePropsLog} columns={columnsLog} rowKey={entityId} />
    </>
  );
}
