import { Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AuthButton, CustomTable } from 'components';
import { useConfirm, useTablePro } from 'hooks';
import { useState } from 'react';
import { _get } from 'utils';
import { InsuranceDate, _deleteInsurance, _getInsuranceDetail, _getInsuranceList } from '../_api';
import AddOrEditInsurance from './AddOrEditInsurance';
import InlineInsuranceBtn from './InlineInsuranceBtn';

interface Props {
  carid: string;
}

function InsuranceRecords({ carid }: Props) {
  const [uploadFileLoading, setUploadFileLoading] = useState(false);
  const [_showDeleteConfirm] = useConfirm();
  const columns: ColumnsType<InsuranceDate> = [
    {
      title: '保险时间',
      dataIndex: 'insuranceDate',
    },
    {
      title: '过保时间',
      dataIndex: 'overinsuranceDate',
    },
    {
      title: '操作人',
      dataIndex: 'createuserid',
    },
    {
      title: '修改时间',
      dataIndex: 'updatetime',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render(_, record) {
        return (
          <div>
            {/* 保持和原型图一致 没有编辑按钮 */}
            {/* <AuthButton
              authId="trainingInstitution/carInfo:btn14"
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={async () => {
                _handleEdit(record);
              }}
            >
              编辑
            </AuthButton> */}

            <AuthButton
              authId="trainingInstitution/carInfo:btn15"
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={async () => {
                // TODO: 11-10 镇江 删除前 需要重复确认
                _handleDelete(_get(record, 'id'));
              }}
            >
              删除
            </AuthButton>

            {_get(record, 'insuranceFileUrl') ? (
              <AuthButton
                authId="trainingInstitution/carInfo:btn16"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={async () => {
                  const res = await _getInsuranceDetail({ id: _get(record, 'id') });
                  if (_get(res, 'code') === 200) {
                    // insuranceFileUrl
                    window.open(_get(res, ['data', 'insuranceFileUrl']));
                  }
                }}
              >
                查看附件
              </AuthButton>
            ) : (
              // TODO: 尽量还原原型
              <InlineInsuranceBtn
                carid={carid}
                currentRecord={record}
                cb={(loading: boolean) => setUploadFileLoading(loading)}
                forceUpdate={_refreshTable}
              />
            )}
          </div>
        );
      },
    },
  ];

  const {
    tableProps,
    isEdit,
    setIsEdit,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    currentRecord,
    setCurrentRecord,
    _refreshTable,
  } = useTablePro({
    request: _getInsuranceList,
    extraParams: {
      carid,
    },
    requiredFields: ['carid'],
  });

  const _handleEdit = (record: InsuranceDate) => {
    _switchIsAddOrEditVisible();
    setIsEdit(true);
    setCurrentRecord(record);
  };

  const _handleAdd = () => {
    _switchIsAddOrEditVisible();
    setIsEdit(false);
    setCurrentRecord(null);
  };

  const _handleDelete = (id: string) => {
    _showDeleteConfirm({
      handleOk: () => {
        _deleteInsurance(id).finally(() => {
          _refreshTable();
        });
      },
    });
  };

  const _handleOk = () => {
    _switchIsAddOrEditVisible();
    setIsEdit(false);
    setCurrentRecord(null);
    _refreshTable();
  };

  const _handleCancel = () => {
    _switchIsAddOrEditVisible();
    setIsEdit(false);
    setCurrentRecord(null);
  };

  return (
    <>
      {isAddOrEditVisible && (
        <AddOrEditInsurance
          currentRecord={currentRecord}
          onCancel={_handleCancel}
          onOk={_handleOk}
          isEdit={isEdit}
          title={isEdit ? '编辑保险记录' : '新增保险记录'}
          carid={carid}
        />
      )}
      {/* TODO: 11-10-镇江 */}
      <AuthButton
        authId="trainingInstitution/carInfo:btn13"
        type="primary"
        className="mb20"
        onClick={async () => {
          _handleAdd();
        }}
      >
        新增
      </AuthButton>
      <CustomTable
        columns={columns}
        {...tableProps}
        loading={tableProps.loading || uploadFileLoading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />
    </>
  );
}

export default InsuranceRecords;
