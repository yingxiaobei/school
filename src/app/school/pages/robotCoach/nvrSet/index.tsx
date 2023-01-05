import { useState } from 'react';
import { _get } from 'utils';
import { useConfirm, useRequest, useTablePro, useVisible } from 'hooks';
import { _getNvrSetupList, _getCarList, _deleteNvrItem } from './_api';
import AddOrEdit from './AddOrEdit';
import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';
import CarVideo from '../monitorManage/CarVideo';

export default function NvrSet() {
  const [optionCarData, setOptionCarData] = useState<any>([]); // 车牌号下拉数据
  const [_showDeleteConfirm] = useConfirm();
  const [videoVisible, setVideoVisible] = useVisible();
  const {
    tableProps,
    search,
    currentRecord,
    setCurrentRecord,
    isAddOrEditVisible,
    currentId,
    isEdit,
    _refreshTable,
    _handleSearch,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({ request: _getNvrSetupList });

  const { loading: deleteLoading, run } = useRequest(_deleteNvrItem, {
    onSuccess: _refreshTable,
  });

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'licnum',
    },
    {
      title: '硬盘录像机IP',
      dataIndex: 'nvr_ip',
    },
    {
      title: '磁盘录像机端口',
      dataIndex: 'nvr_port',
    },
    {
      title: '硬盘录像机通道',
      dataIndex: 'nvr_channel',
    },
    {
      title: '硬盘录像机账号',
      dataIndex: 'nvr_account',
    },
    {
      title: '硬盘录像机密码',
      dataIndex: 'nvr_pwd',
    },
    {
      title: 'IPC IP',
      dataIndex: 'ipc_ip',
    },
    {
      title: 'IPC 端口',
      dataIndex: 'ipc_port',
    },
    {
      title: 'IPC 账号',
      dataIndex: 'ipc_account',
    },
    {
      title: 'IPC 密码',
      dataIndex: 'ipc_pwd',
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="robotCoach/nvrSet:btn2"
            onClick={() => {
              _handleEdit(record, _get(record, 'id', ''));
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            编辑
          </AuthButton>
          <AuthButton
            authId="robotCoach/nvrSet:btn3"
            loading={_get(currentRecord, 'rid') === _get(record, 'rid') && deleteLoading}
            onClick={() => {
              _showDeleteConfirm({
                handleOk: () => {
                  run({ id: _get(record, 'id') });
                },
              });
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            删除
          </AuthButton>
          <AuthButton
            authId="robotCoach/nvrSet:btn4"
            loading={_get(currentRecord, 'rid') === _get(record, 'rid') && deleteLoading}
            onClick={() => {
              setCurrentRecord(record);
              setVideoVisible();
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            预览
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <div>
      {videoVisible && <CarVideo onCancel={setVideoVisible} isNvr={true} currentData={currentRecord} />}
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Select',
            field: 'licnum',
            options: [{ label: '车牌号(全部)', value: '' }, ...optionCarData],
            otherProps: {
              showSearch: true,
              filterOption: false,
              allowClear: true,
              onSearch: async (value: any) => {
                const res = await _getCarList({ licnum: value });
                const carData = _get(res, 'data', []).map((x: any) => {
                  return {
                    label: x.text,
                    value: x.text,
                  };
                });
                setOptionCarData(carData);
              },
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        showSearchButton={false}
      />
      <ButtonContainer loading={tableProps.loading} showSearchButton={true} refreshTable={_refreshTable}>
        <AuthButton
          onClick={() => {
            _handleAdd();
          }}
          authId="robotCoach/nvrSet:btn1"
          type="primary"
          className="mb20"
        >
          新增
        </AuthButton>
      </ButtonContainer>

      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={'NVR设置'}
        />
      )}
      <CustomTable columns={columns} rowKey="id" {...tableProps} />
    </div>
  );
}
