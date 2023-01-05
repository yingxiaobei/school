import { useState } from 'react';
import { Button, Row, Col, Tooltip, Alert } from 'antd';
import { _getSchoolPageList, _selectedSchoolPageList, _saveSchool } from '../_api';
import { useFetch, useForceUpdate, useHash, useTablePagination, useSearch, useRequest } from 'hooks';
import { _get, _handlePhone } from 'utils';
import { Title, Search, CustomTable } from 'components';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ChangeButtons from '../components/ChangeButtons';

export default function ConfigCoach(props: any) {
  const { currentId, onCancel, onOk } = props;
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [search, _handleSearch] = useSearch();

  const [selectedRowKeys, setSelectedRowKeys] = useState<any>(new Set());
  const [hadSelectedRowKeys, setHadSelectedRowKeys] = useState<any>([]);
  const [selectedAllKeys, setSelectedAllRowKeys] = useState<any>(new Set());
  const [hash, setHash] = useState<any>({});

  const { data, isLoading } = useFetch({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sbnid: currentId,
      name: _get(search, 'name'),
      shortName: _get(search, 'shortName'),
      leaderPhone: _get(search, 'leaderPhone'),
      traincode: '3', //1-实操，2-课堂理论教学，3-模拟教学，4-远程教学
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    request: _getSchoolPageList,
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      _get(data, 'rows', []).forEach((x: any) => {
        Object.assign(hash, { [x.id]: x });
      });
      setHash({ ...hash });
    },
  });

  // 已选驾校
  useFetch({
    request: _selectedSchoolPageList,
    query: {
      sbnid: currentId,
      traincode: '3', //2：课堂理论  3：模拟
    },
    callback: (selectedCoach: any) => {
      const allKeys = selectedCoach.map((x: any) => x.id);
      setSelectedAllRowKeys(allKeys);
      setSelectedRowKeys([...allKeys]);
      selectedCoach.forEach((x: any) => {
        Object.assign(hash, { [x.id]: x });
      });
      setHash({ ...hash });
    },
  });

  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案状态
  const authStatusHash = useHash('common_status_type'); // 授权状态
  const companyBusiStatusHash = useHash('company_busi_status'); // 营业状态

  const columns = [
    {
      title: '驾校全称',
      dataIndex: 'name',
    },
    {
      title: '驾校简称',
      dataIndex: 'shortName',
    },
    {
      title: '备案状态',
      dataIndex: 'status',
      render: (status: string) => registeredExamFlagHash[status],
    },
    {
      title: '行政区划',
      dataIndex: 'area',
    },
    {
      title: '联系电话',
      dataIndex: 'leaderPhone',
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '营业状态',
      dataIndex: 'busiStatus',
      render: (busiStatus: string) => companyBusiStatusHash[busiStatus],
    },
    {
      title: '经营范围',
      dataIndex: 'busiScope',
    },

    {
      title: '授权状态',
      dataIndex: 'authStatus',
      render: (authStatus: string) => authStatusHash[authStatus],
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys: [...selectedRowKeys],
  };

  const hadRowSelection = {
    onChange: (hadSelectedRowKeys: any) => {
      setHadSelectedRowKeys(hadSelectedRowKeys);
    },
  };

  const selectedData = [...selectedAllKeys].map((key: any) => hash[key]);

  const { loading: confirmLoading, run } = useRequest(_saveSchool, {
    onSuccess: onOk,
  });

  return (
    <>
      <div style={{ width: 1300, overflow: 'auto' }}>
        <Row style={{ display: 'flex', width: 1800 }}>
          <Col span={10}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                height: 50,
              }}
            >
              待选驾校
              {data && _get(data, 'rows.length', 0) === 0 && (
                <Tooltip color={'#333'} placement="right" title="若查询不到数据，请联系系统管理员">
                  <QuestionCircleOutlined className="questionIcon" />
                </Tooltip>
              )}
            </div>

            <Search
              loading={isLoading}
              filters={[
                { type: 'Input', field: 'name', placeholder: '请输入驾校全称' },
                { type: 'Input', field: 'shortName', placeholder: '请输入简称' },
                { type: 'Input', field: 'leaderPhone', placeholder: '请输入联系电话' },
              ]}
              searchWidth="small"
              search={search}
              _handleSearch={_handleSearch}
              refreshTable={() => {
                forceUpdate();
                setPagination({ ...pagination, current: 1 });
              }}
            />

            <CustomTable
              columns={columns}
              loading={isLoading}
              bordered
              dataSource={_get(data, 'rows', [])}
              rowKey={(record: any) => _get(record, 'id')}
              pagination={tablePagination}
              rowSelection={{
                type: 'checkbox',
                ...rowSelection,
              }}
            />
          </Col>
          <Col span={2} style={{ paddingTop: 135 }}>
            <ChangeButtons
              handleAdd={() => {
                setSelectedAllRowKeys(new Set([...selectedAllKeys, ...selectedRowKeys]));
              }}
              handleDelete={() => {
                setSelectedAllRowKeys(new Set([...selectedAllKeys].filter((x) => !hadSelectedRowKeys.includes(x))));
                setSelectedRowKeys(new Set([...selectedAllKeys].filter((x) => !hadSelectedRowKeys.includes(x))));
                forceUpdate();
              }}
            />
          </Col>
          <Col span={10}>
            <Title>已选驾校</Title>
            <Alert
              style={{ marginBottom: 16, width: 328 }}
              message="删除已选驾校，将影响学员明日预约该驾校学习"
              type="error"
            />
            <CustomTable
              columns={columns}
              loading={isLoading}
              bordered
              dataSource={selectedData}
              rowKey={(record: any) => _get(record, 'id')}
              rowSelection={{
                type: 'checkbox',
                ...hadRowSelection,
              }}
            />
          </Col>
        </Row>
      </div>
      <Row justify="end">
        <Button onClick={onCancel} className="mr20">
          取消
        </Button>
        <Button
          loading={confirmLoading}
          type="primary"
          onClick={async () => {
            const associatedCompanyDtos = selectedData.map((x: any) => {
              return {
                id: _get(x, 'id'),
                area: _get(x, 'area'),
                name: _get(x, 'name'),
                shortName: _get(x, 'shortName'),
              };
            });
            run({ associatedCompanyDtos, sbnid: currentId, traincode: '3' });
          }}
        >
          确定
        </Button>
      </Row>
    </>
  );
}
