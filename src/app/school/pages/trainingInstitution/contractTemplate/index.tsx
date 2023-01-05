// 合同模板配置
import { useState } from 'react';
import { previewPdf, _get } from 'utils';
import { useFetch, useTablePagination, useVisible, useConfirm, useForceUpdate, useRequest } from 'hooks';
import { _getContractTemplateList, _getContractContent, _deleteInfo } from './_api';
import AddOrEdit from './AddOrEdit';
import { AuthButton, CustomTable } from 'components';

function ContractTemplate() {
  const [currentId, setCurrentId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();
  const [currentRecord, setCurrentRecord] = useState(null);

  const { isLoading, data } = useFetch({
    request: _getContractTemplateList,
    depends: [ignore, pagination.current, pagination.pageSize],
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
    },
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteInfo, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const columns = [
    {
      title: '车型类型',
      dataIndex: 'cartype',
    },
    {
      title: '备注',
      dataIndex: 'memo',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="trainingInstitution/contractTemplate:btn2"
            onClick={() => {
              _getContractContent({ id: _get(record, 'tempid') }).then((res) => {
                previewPdf([res]);
              });
            }}
            className="operation-button"
          >
            预览
          </AuthButton>
          <AuthButton
            authId="trainingInstitution/contractTemplate:btn3"
            onClick={() => {
              _switchVisible();
              setCurrentId(_get(record, 'tempid'));
              setIsEdit(true);
            }}
            className="operation-button"
          >
            模板配置
          </AuthButton>
          <AuthButton
            loading={_get(currentRecord, 'tempid') === _get(record, 'tempid') && deleteLoading}
            authId="trainingInstitution/contractTemplate:btn4"
            onClick={() =>
              _showDeleteConfirm({
                handleOk: async () => {
                  setCurrentRecord(record);
                  deleteRun({ id: _get(record, 'tempid') });
                },
              })
            }
            className="operation-button"
          >
            删除
          </AuthButton>
        </div>
      ),
    },
  ];

  function _handleAdd() {
    setCurrentId(null);
    _switchVisible();
    setIsEdit(false);
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <div>
      <AuthButton
        authId="trainingInstitution/contractTemplate:btn1"
        type="primary"
        onClick={_handleAdd}
        className="mb20"
      >
        新增
      </AuthButton>

      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '模板配置' : '新增合同模板'}
        />
      )}
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'tempid')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default ContractTemplate;
