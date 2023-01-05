import { useState } from 'react';
import { Modal, Row, Button, message } from 'antd';
import { useFetch, useSearch, useTablePagination, useForceUpdate, useVisible, useOptions } from 'hooks';
import { _applyGraduatesList, _addReview } from './_api';
import { _getStudentList } from 'api';
import { CustomTable, Search } from 'components';
import { _get, _handleIdCard } from 'utils';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import Details from '../studentInfo/StudentInfoDetail';

function Add(props: any) {
  const { onCancel, onOk } = props;
  const [search, _handleSearch] = useSearch();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [pagination, setPagination, tablePagination] = useTablePagination({ showQuickJumper: false });
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [sid, setSid] = useState('');

  const { isLoading, data } = useFetch({
    request: _applyGraduatesList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sid: _get(search, 'sid'),
      traintype: _get(search, 'traintype'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setSelectedRowKeys([_get(data, 'rows.0.id')]);
    },
  });

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'name',
      width: 80,
      render: (name: string, record: any) => {
        return (
          <span
            onClick={() => {
              _switchDetailsVisible();
              setSid(_get(record, 'sid'));
            }}
            className="pointer"
            style={{ color: PRIMARY_COLOR }}
          >
            {name}
          </span>
        );
      },
    },
    {
      title: '学员证件号',
      width: 120,
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '车型',
      width: 80,
      dataIndex: 'traintype',
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  // // 确定申请并上传监管
  // const { loading: sureUpLoading, run: sureUpRun } = useRequest(_addReview, {
  //   onSuccess: onOk,
  // });

  return (
    <>
      {detailsVisible && <Details onCancel={_switchDetailsVisible} sid={sid} />}

      <Modal
        visible
        title={'结业申请'}
        maskClosable={false}
        onCancel={onCancel}
        footer={
          <Row justify="end">
            <Button className="ml20" onClick={onCancel}>
              取消
            </Button>
            <Button
              type="primary"
              disabled={_get(data, 'rows', []).length < 1}
              className="ml20"
              onClick={async () => {
                let errCount = 0;
                for (let i = 0; i < selectedRowKeys.length; i++) {
                  const res = await _addReview({
                    applyPrestepId: selectedRowKeys[i],
                    graduateUpload: false,
                  });
                  if (_get(res, 'code') !== 200) {
                    errCount++;
                  }
                }
                if (errCount === 0) {
                  message.success('成功');
                } else {
                  message.error(`有${errCount}条记录失败`);
                }
                onOk();
              }}
            >
              确定
            </Button>
            {/* <Button
            type="primary"
            className="ml20"
            loading={sureUpLoading}
            disabled={_get(data, 'rows', []).length < 1}
            onClick={async () => {
              sureUpRun({ applyPrestepId: selectedRowKeys[0], graduateUpload: true });
            }}
          >
            确定申请并上传监管
            <Tooltip title="申请学员结业后，系统将自动上传结业证到监管平台">
              <QuestionCircleOutlined className = "questionIcon"/>
            </Tooltip>
          </Button> */}
          </Row>
        }
        width={650}
      >
        <Search
          loading={isLoading}
          filters={[
            {
              type: 'SimpleSelectOfStudent',
              field: 'sid',
            },
            {
              type: 'Select',
              field: 'traintype',
              options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('business_scope')],
            },
          ]}
          searchWidth="small"
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
          simpleStudentRequest={_getStudentList}
          extraParamsForCustomRequest={{ status: '01' }}
        />

        <CustomTable
          columns={columns}
          loading={isLoading}
          bordered
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          pagination={{ ...tablePagination, size: 'small' }}
          dataSource={_get(data, 'rows', [])}
          rowKey={(record: any) => _get(record, 'id')}
          scroll={{ y: 260 }}
          style={{ height: 320 }}
        />
      </Modal>
    </>
  );
}

export default Add;
