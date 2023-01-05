import React from 'react';
import { useHash, useOptions, useTablePro, useVisible, useConfirm } from 'hooks';
import { DownloadOutlined } from '@ant-design/icons';
import AddOrEdit from './AddOrEdit';
import { _getList, _deletePerson, _updatePerson, _exportExcel } from '../_api';
import ImportModal from './ImportModal';
import { _get, downloadFile } from 'utils';
import { AuthButton, Search, CustomTable } from 'components';

const Others = () => {
  const [visible, _switchVisible] = useVisible();
  const [importVisible, _switchImportVisible] = useVisible();
  const {
    tableProps,
    search,
    _refreshTable,
    _handleSearch,
    isEdit,
    currentRecord,
    setCurrentRecord,
    setIsEdit,
  } = useTablePro({
    request: _getList,
    extraParams: { personType: '1' }, //personType:人员类型 1：其他人员  2：学员
  });

  const personStatusHash = useHash('person_manage_type');
  const [_showConfirm] = useConfirm();

  const columns = [
    {
      title: '姓名',
      width: 100,
      dataIndex: 'personName',
    },
    {
      title: '创建时间',
      width: 120,
      dataIndex: 'createTime',
    },
    {
      title: '更新时间',
      width: 120,
      dataIndex: 'updateTime',
    },
    {
      title: '状态',
      width: 60,
      dataIndex: 'personStatus',
      render: (text: any) => personStatusHash[text],
    },
    {
      title: '备注',
      width: 80,
      dataIndex: 'remark',
    },
    {
      title: '操作',
      width: 180,
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        return (
          <>
            <AuthButton
              authId="smartPassage/personManage:btn1"
              onClick={() => {
                _switchVisible();
                setCurrentRecord(record);
                setIsEdit(true);
              }}
              className="operation-button"
            >
              编辑
            </AuthButton>
            <AuthButton
              authId="smartPassage/personManage:btn2"
              onClick={() => {
                _showConfirm({
                  handleOk: async () => {
                    const res: any = await _deletePerson({ id: record.id });
                    res.code === 200 && _refreshTable();
                  },
                });
              }}
              className="operation-button"
            >
              删除
            </AuthButton>

            <AuthButton
              authId="smartPassage/personManage:btn3"
              onClick={() => {
                _showConfirm({
                  title: '确定要修改这条数据状态吗？',
                  handleOk: async () => {
                    const res: any = await _updatePerson({
                      personType: 1,
                      personStatus: Number(!Number(record.personStatus)),
                      id: record.id,
                      personName: record.personName,
                    });
                    res.code === 200 && _refreshTable();
                  },
                });
              }}
              className="operation-button"
            >
              {personStatusHash[Number(!Number(record.personStatus))]}
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <div>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            _refreshTable();
          }}
          currentRecord={currentRecord as any}
          isEdit={isEdit}
          visible={visible}
          title={isEdit ? '编辑' : '新增'}
        />
      )}
      {importVisible && (
        <ImportModal
          onCancel={() => {
            _switchImportVisible();
            _refreshTable();
          }}
          visible={importVisible}
        />
      )}
      <Search
        loading={tableProps.loading}
        filters={[
          { type: 'Input', field: 'personName', placeholder: '姓名' },
          {
            type: 'Select',
            field: 'personStatus',
            options: [{ value: '', label: '状态(全部)' }, ...useOptions('person_manage_type')],
          }, //备案状态
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          _refreshTable();
        }}
      />

      <AuthButton
        authId="smartPassage/personManage:btn4"
        type="primary"
        onClick={() => {
          _switchVisible();
          setIsEdit(false);
          setCurrentRecord({});
        }}
        className="mb20 mr20"
      >
        新增
      </AuthButton>

      <AuthButton
        authId="coach/coachInfo:btn12"
        className="mb20 mr20"
        type="primary"
        icon={<DownloadOutlined />}
        onClick={() => {
          const query = {
            personName: _get(search, 'personName', ''),
            personStatus: _get(search, 'personStatus', ''),
          };
          _exportExcel(query).then((res) => {
            downloadFile(res, '其他人员名单', 'application/vnd.ms-excel', 'xlsx');
          });
        }}
      >
        导出
      </AuthButton>

      <AuthButton authId="coach/coachInfo:btn13" onClick={_switchImportVisible} className="mb20 mr20">
        导入
      </AuthButton>

      <CustomTable columns={columns} {...tableProps} rowKey="id" />
    </div>
  );
};

export default Others;
