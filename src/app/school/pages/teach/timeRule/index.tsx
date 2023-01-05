// 时段规则设置

import { _get } from 'utils';
import { Switch } from 'antd';
import { _getTimeRule, _updateEnableFlag, _deleteTimeRule } from './_api';
import AddOrEdit from './AddOrEdit';
import { useTablePro, useHash, useOptions, useConfirm, useRequest } from 'hooks';
import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';

export default function TimeRule() {
  const [_showDeleteConfirm] = useConfirm();
  const traincodeOptions = useOptions('combo'); // 培训课程
  const traincodehash = useHash('combo'); // 培训课程

  const {
    tableProps,
    search,
    otherState,
    setOtherState,
    currentRecord,
    isAddOrEditVisible,
    currentId,
    isEdit,
    _refreshTable,
    _handleSearch,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({ request: _getTimeRule });

  const { loading: deleteLoading, run } = useRequest(_deleteTimeRule, {
    onSuccess: _refreshTable,
  });

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'rulename',
    },
    {
      title: '课程类型',
      dataIndex: 'traincode',
      render: (traincode: any) => traincodehash[traincode],
    },
    {
      //  0：未启用   1：已启用
      title: '启用状态',
      dataIndex: 'enableflag',
      render: (enableflag: string, record: any) => (
        <Switch
          checked={`${enableflag}` === '1'}
          onChange={async (checked) => {
            await _updateEnableFlag({ id: _get(record, 'rid'), enableflag: checked ? '1' : '0' });
            _refreshTable();
          }}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="teach/timeRule:btn3"
            loading={_get(currentRecord, 'rid') === _get(record, 'rid') && deleteLoading}
            onClick={() => {
              _showDeleteConfirm({
                handleOk: () => {
                  run({ id: _get(record, 'rid') });
                },
              });
            }}
            className="operation-button"
          >
            删除
          </AuthButton>

          <AuthButton
            authId="teach/timeRule:btn2"
            onClick={() => {
              _handleEdit(record, _get(record, 'rid', ''));
              setOtherState({ ...otherState, currentTrainCode: _get(record, 'traincode', '') });
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Select',
            field: 'traincode',
            options: [{ label: '课程类型(全部)', value: '' }, ...traincodeOptions],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <AuthButton
          authId="teach/timeRule:btn1"
          type="primary"
          onClick={() => {
            _handleAdd();
            setOtherState({ ...otherState, currentTrainCode: null });
          }}
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
          currentTrainCode={_get(otherState, 'currentTrainCode')}
          isEdit={isEdit}
          title={'时段规则设置'}
        />
      )}

      <CustomTable {...tableProps} columns={columns} rowKey="rid" />
    </>
  );
}
