import { useState } from 'react';
import { Modal, Row, Button } from 'antd';
import { _getVersionDetail } from './_api';
import { useFetch, useTablePagination, useHash, useVisible } from 'hooks';
import { CustomTable, ItemCol } from 'components';
import TeachAreaDetail from '../teachingArea/Details';
import { generateIdForDataSource, _get } from 'utils';

export default function FenceDetail(props: any) {
  const { onCancel, currentRecord, carFid, isCarDetail } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [detailVisible, setDetailVisible] = useVisible();
  const [currentId, setCurrentId] = useState(null);

  // 根据主键查询电子围栏版本信息
  const { isLoading, data } = useFetch({
    request: _getVersionDetail,
    query: {
      fid: isCarDetail ? _get(currentRecord, 'fid') : carFid,
      page: pagination.current,
      limit: pagination.pageSize,
    },
    depends: [pagination.current, pagination.pageSize],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'schRegionList.total', 0) });
    },
  });

  const teachTypeHash = useHash('teach_type');

  const columns = [
    {
      title: '场地名称',
      dataIndex: 'name',
      width: 90,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 70,
      render: (type: any) => teachTypeHash[type],
    },
    {
      title: '培训车型',
      width: 70,
      dataIndex: 'vehicletype',
    },
    {
      title: '操作',
      width: 70,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <Button
          className="operation-button"
          type="primary"
          ghost
          size="small"
          onClick={() => {
            setDetailVisible();
            setCurrentId(_get(record, 'rid'));
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  const enableflagHash = useHash('enableflag_type');

  return (
    <>
      {detailVisible && <TeachAreaDetail onCancel={setDetailVisible} currentId={currentId} />}

      <Modal
        visible
        width={1100}
        title={'围栏信息'}
        maskClosable={false}
        onCancel={onCancel}
        footer={null}
        className="detailModal"
      >
        <Row>
          <ItemCol span={8} label="对象">
            {_get(data, 'title', '')}
          </ItemCol>
          <ItemCol span={8} label="版本号">
            {_get(data, 'version', '')}
          </ItemCol>
          <ItemCol span={8} label="发版时间">
            {_get(data, 'createtime', '')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={8} label="操作人">
            {_get(data, 'createoptor', '')}
          </ItemCol>
          <ItemCol span={8} label="状态">
            {enableflagHash[_get(data, 'enableflag', '')]}
          </ItemCol>
        </Row>
        <CustomTable
          columns={columns}
          loading={isLoading}
          bordered
          dataSource={generateIdForDataSource(_get(data, 'schRegionList.rows', []))}
          rowKey="id"
          pagination={tablePagination}
          scroll={{ y: 280 }}
        />
      </Modal>
    </>
  );
}
