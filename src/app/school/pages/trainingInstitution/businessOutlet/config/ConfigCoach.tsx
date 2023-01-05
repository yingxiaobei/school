import { useState } from 'react';
import { Modal, Row, Col, Select } from 'antd';
import { _getCoachList, _saveCoachList, _getSchoolList, _selectedCoach } from '../_api';
import { useFetch, useForceUpdate, useHash, useTablePagination, useSearch, useRequest } from 'hooks';
import { _get } from 'utils';
import { Title, Search, CustomTable } from 'components';
import { Auth } from 'utils';
import ChangeButtons from '../components/ChangeButtons';

const { Option } = Select;

export default function ConfigCoach(props: any) {
  const { onCancel, currentId, onOk } = props;
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [search, _handleSearch] = useSearch();
  const [schoolId, setSchoolId] = useState<any>(Auth.get('schoolId'));

  const [selectedRowKeys, setSelectedRowKeys] = useState<any>(new Set());
  const [hadSelectedRowKeys, setHadSelectedRowKeys] = useState<any>();
  const [selectedAllKeys, setSelectedAllRowKeys] = useState<any>(new Set());
  const [hash, setHash] = useState<any>({});

  // 已选教练
  const { isLoading: isLoadingSecleted } = useFetch({
    request: _selectedCoach,
    query: {
      sbnid: currentId,
    },
    callback: (selectedCoach: any) => {
      const allKeys = selectedCoach.map((x: any) => x.cid);
      setSelectedAllRowKeys([...allKeys]);
      setSelectedRowKeys([...allKeys]);
      selectedCoach.forEach((x: any) => {
        Object.assign(hash, { [x.cid]: x });
      });
      setHash({ ...hash });
    },
  });

  // FIXME:wy
  const { data, isLoading } = useFetch<any>({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      schoolid: schoolId,
      sbnid: currentId,
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      coachnum: _get(search, 'coachnum'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    request: _getCoachList,
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      _get(data, 'rows', []).forEach((x: any) => {
        Object.assign(hash, { [x.cid]: x });
      });
      setHash({ ...hash });
    },
  });

  // 驾校列表
  const { data: schoolList = [] } = useFetch({
    request: _getSchoolList,
  });

  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案状态

  const coachtypeHash = useHash('coach_type'); // 教练员类型
  const employStatusHash = useHash('coa_master_status'); // 供职状态

  const columns = [
    {
      title: '姓名',
      dataIndex: 'coachname',
    },
    {
      title: '身份证号',
      dataIndex: 'idcard',
    },
    {
      title: '准教车型',
      dataIndex: 'teachpermitted',
    },
    {
      title: '教练员类型',
      dataIndex: 'coachtype',
      render: (coachtype: string) => coachtypeHash[coachtype],
    },
    {
      title: '供职状态',
      dataIndex: 'employstatus',
      render: (employstatus: string) => employStatusHash[employstatus],
    },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      render: (registered_Flag: string) => registeredExamFlagHash[registered_Flag],
    },
    {
      title: '统一编码',
      dataIndex: 'coachnum',
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

  const { loading: confirmLoading, run } = useRequest(_saveCoachList, {
    onSuccess: onOk,
  });

  return (
    <Modal
      width={1300}
      visible
      title={'配置教练员'}
      confirmLoading={confirmLoading}
      maskClosable={false}
      onCancel={onCancel}
      onOk={async () => {
        const coaCoachDtos = selectedData.map((x: any) => {
          return { cid: _get(x, 'cid'), coachname: _get(x, 'coachname'), bookschoolid: _get(x, 'bookschoolid') };
        });
        run({ coaCoachDtos, sbnid: currentId });
      }}
    >
      <Row style={{ display: 'flex', justifyContent: 'space-around', width: 1800, overflow: 'auto' }}>
        <Col span={10}>
          <Title>待选教练员</Title>

          <Select
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            style={{ width: 180, margin: '0 20px 20px 0' }}
            value={schoolId}
            onChange={(value: string) => {
              setSchoolId(value);
            }}
          >
            {schoolList.map((x: any) => {
              return (
                <Option key={x.schoolId} value={x.schoolId}>
                  {x.schoolName}
                </Option>
              );
            })}
          </Select>

          <Search
            loading={isLoading || isLoadingSecleted}
            filters={[
              { type: 'Input', field: 'coachname', placeholder: '请输入姓名' },
              { type: 'Input', field: 'idcard', placeholder: '请输入身份证号' },
              { type: 'Input', field: 'coachnum', placeholder: '请输入统一编码' },
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
            loading={isLoading || isLoadingSecleted}
            bordered
            dataSource={_get(data, 'rows', [])}
            rowKey={(record: any) => _get(record, 'cid')}
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
          <Title style={{ marginBottom: 56 }}>已选教练员</Title>
          <CustomTable
            columns={columns}
            loading={isLoading}
            bordered
            dataSource={selectedData}
            rowKey={(record: any) => _get(record, 'cid')}
            rowSelection={{
              type: 'checkbox',
              ...hadRowSelection,
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
}
