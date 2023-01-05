import { _getRecordListLog } from './_api';
import { useTablePro, useHash, useOptions } from 'hooks';
import { CustomTable, Search, Title } from 'components';
import copy from 'copy-text-to-clipboard';
import { Button, message, Tooltip } from 'antd';
import moment from 'moment';
import { _get } from 'utils';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface IProps {
  entityId: string;
}

export default function VehicleTrajectory(props: IProps) {
  const { entityId } = props;

  // 第三方交互日志
  const {
    tableProps: tablePropsLog,
    _refreshTable: _refreshTableLog,
    search: searchLog,
    _handleSearch: _handleSearchLog,
  } = useTablePro({
    request: _getRecordListLog,
    initialSearch: {
      startLogTime: moment().subtract(7, 'day').format('YYYY-MM-DD'),
      endLogTime: moment().format('YYYY-MM-DD'),
    },
    extraParams: {
      entityId,
    },
  });

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
      width: 480,
      align: 'left',
      render: (requestContent: string) => copyWords(requestContent, 460),
    },
    {
      title: '返回结果',
      dataIndex: 'responseContent',
      width: 480,
      align: 'left',
      render: (responseContent: string) => copyWords(responseContent, 460),
    },
  ];

  return (
    <>
      <div className="fz18 bold mb16 mt20">
        银行/开户交互日志
        <Tooltip placement="bottom" title={'只展示最近一周签约或开户日志记录'}>
          <QuestionCircleOutlined className="fz14 ml10" />
        </Tooltip>
      </div>

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
              defaultValue: [moment().subtract(7, 'day'), moment()],
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
