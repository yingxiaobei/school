import { useState } from 'react';
import { Modal, Row, Col } from 'antd';
import { _saveCoachCarList, _getCoachCarList, _selectedCoachCar } from '../_api';
import { useFetch, useForceUpdate, useHash, useTablePagination, useSearch, useRequest } from 'hooks';
import { _get } from 'utils';
import { Title, Search, CustomTable } from 'components';
import ChangeButtons from '../components/ChangeButtons';

export default function ConfigCoachCar(props: any) {
  const { onCancel, currentId, onOk } = props;
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [search, _handleSearch] = useSearch();

  const [selectedRowKeys, setSelectedRowKeys] = useState<any>(new Set());
  const [hadSelectedRowKeys, setHadSelectedRowKeys] = useState<any>([]);
  const [selectedAllKeys, setSelectedAllRowKeys] = useState<any>(new Set());
  const [hash, setHash] = useState<any>({});

  // FIXME:wy
  const { data, isLoading } = useFetch<any>({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      // franum: _get(search, 'franum'),
      licnum: _get(search, 'licnum'),
      carnum: _get(search, 'carnum'),
      sbnid: currentId,
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    request: _getCoachCarList,
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      _get(data, 'rows', []).forEach((x: any) => {
        Object.assign(hash, { [x.carid]: x });
      });
      setHash({ ...hash });
    },
  });

  // 已选教练车
  useFetch({
    request: _selectedCoachCar,
    query: {
      sbnid: currentId,
    },
    callback: (selectedCoachCar: any) => {
      const allKeys = selectedCoachCar.map((x: any) => x.carid);
      setSelectedAllRowKeys(allKeys);
      setSelectedRowKeys([...allKeys]);

      selectedCoachCar.forEach((x: any) => {
        Object.assign(hash, { [x.carid]: x });
      });
      setHash({ ...hash });
    },
  });

  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案状态
  const platecolorHash = useHash('platecolor_type'); // 车牌颜色

  const columns = [
    {
      title: '车牌号码',
      dataIndex: 'licnum',
    },
    {
      title: '车牌颜色',
      dataIndex: 'platecolor',
      render: (platecolor: string) => platecolorHash[platecolor],
    },
    {
      title: '车辆品牌',
      dataIndex: 'brand',
    },
    {
      title: '车架号',
      dataIndex: 'franum',
    },
    {
      title: '统一编码',
      dataIndex: 'carnum',
    },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      render: (registered_Flag: string) => registeredExamFlagHash[registered_Flag],
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
  const { loading: confirmLoading, run } = useRequest(_saveCoachCarList, {
    onSuccess: onOk,
  });

  return (
    <Modal
      width={1300}
      visible
      title={'配置教练车'}
      confirmLoading={confirmLoading}
      maskClosable={false}
      onCancel={onCancel}
      onOk={async () => {
        run({ carids: [...selectedAllKeys], sbnid: currentId });
      }}
    >
      <Row style={{ display: 'flex', justifyContent: 'space-around', width: 1400, overflow: 'auto' }}>
        <Col span={10}>
          <Title>待选教练车</Title>

          <Search
            loading={isLoading}
            filters={[
              { type: 'Input', field: 'licnum', placeholder: '请输入车牌号码' },
              // { type: 'Input', field: 'franum', placeholder: '请输入车驾号' },
              { type: 'Input', field: 'carnum', placeholder: '请输入统一编码' },
            ]}
            search={search}
            _handleSearch={_handleSearch}
            searchWidth="small"
            refreshTable={() => {
              forceUpdate();
              setPagination({ ...pagination, current: 1 });
            }}
          />

          <CustomTable
            // scroll={{ x: 800, y: 400 }}
            columns={columns}
            loading={isLoading}
            bordered
            dataSource={_get(data, 'rows', [])}
            rowKey={(record: any) => _get(record, 'carid')}
            pagination={tablePagination}
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
          />
        </Col>
        <Col span={4} style={{ paddingTop: 135 }}>
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
          <Title style={{ marginBottom: 56 }}>已选教练车</Title>
          <CustomTable
            columns={columns}
            loading={isLoading}
            bordered
            dataSource={selectedData}
            rowKey={(record: any) => _get(record, 'carid')}
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
