import { useConfirm, useForceUpdate, useRequest, useTablePro, useVisible } from 'hooks';
import { _deleteTopic, _getList, _getTemplatesList, _deleteTemplate, _exportTemplate, _importTemplate } from './_api';
import { useState } from 'react';
import { _get } from 'utils';
import { AuthButton, CustomTable, ImportFile, Search } from 'components';
import AddOrEditTopic from './AddOrEditTopic';
import AddOrEditTemplate from './AddOrEditTemplate';
import TreeOrg from './TreeOrg';
import { downloadFile } from 'utils';
import { PORTAL_PREFIX } from 'constants/env';

export default function TemplateManage() {
  const [_showDeleteConfirm] = useConfirm();

  // const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [ignore, forceUpdate] = useForceUpdate();
  const [addOrgVisible, _setAddOrgVisible] = useVisible();
  const [isOrgEdit, setIsOrgEdit] = useState(false);
  const [fileVisible, _switchFileVisible] = useVisible();

  const [treeData, setTreeData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const {
    tableProps,
    search,
    _refreshTable,
    currentRecord,
    setCurrentRecord,
    _handleSearch,
    _handleAdd,
    isEdit,
    setIsEdit,
    _handleEdit,
    currentId,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    _handleOk,
  } = useTablePro({
    request: _getList,
  });
  const {
    tableProps: tplTableProps,
    search: tplSearch,
    _refreshTable: _tplRefreshTable,
    currentRecord: tplCurrentRecord,
    setCurrentRecord: setTplCurrentRecord,
    _handleSearch: _handleTplSearch,
    _handleAdd: _handleTplAdd,
    isEdit: isTplEdit,
    setIsEdit: setIsTplEdit,
    _handleEdit: _handelTplEdit,

    currentId: tplCurrentId,
    isAddOrEditVisible: isTplAddOrEditVisible,
    _switchIsAddOrEditVisible: _switchTplAddOrEditVisible,
    _handleOk: _handleTplOk,
  } = useTablePro({
    request: _getTemplatesList,
  });
  const { loading: deleteLoading, run } = useRequest(_deleteTopic, {
    onSuccess: _refreshTable,
  });
  const { loading: deleteTplLoading, run: deleteTplRun } = useRequest(_deleteTemplate, {
    onSuccess: _tplRefreshTable,
  });
  const columns = [
    { title: '????????????', dataIndex: 'name', ellipsis: true },
    { title: '????????????', dataIndex: 'superName' },
    { title: '????????????', dataIndex: 'createTime' },
    { title: '????????????', dataIndex: 'updateTime' },
    {
      title: '??????',
      dataIndex: '??????',
      render(_: void, record: any) {
        return (
          <>
            <AuthButton
              authId="publicServicePlatform/templateManage:btn2"
              onClick={() => {
                _handleEdit(record, _get(record, 'id', ''));
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              ??????
            </AuthButton>
            <AuthButton
              authId="publicServicePlatform/templateManage:btn3"
              insertWhen={_get(record, 'id.length', 0) > 2}
              loading={_get(currentRecord, 'id') === _get(record, 'id') && deleteLoading}
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
              ??????
            </AuthButton>
          </>
        );
      },
    },
  ];
  const tplColumns = [
    { title: '????????????', dataIndex: 'name', ellipsis: true },
    {
      title: '????????????',
      dataIndex: 'cityName',
      render(cityName: any, record: any) {
        if (!cityName) {
          return '';
        }
        return _get(record, 'provinceName', '') + cityName;
      },
    },
    { title: '????????????', dataIndex: 'createTime' },
    { title: '????????????', dataIndex: 'updateTime' },
    {
      title: '??????',
      dataIndex: '??????',
      render(_: void, record: any) {
        return (
          <>
            <AuthButton
              authId="publicServicePlatform/templateManage:btn4"
              onClick={() => _handelTplEdit(record, _get(record, 'id', ''))}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              ??????
            </AuthButton>

            <AuthButton
              authId="publicServicePlatform/templateManage:btn5"
              loading={_get(currentRecord, 'id') === _get(record, 'id') && exportLoading}
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                setTplCurrentRecord(record);
                setExportLoading(true);
                _exportTemplate({}).then((res: any) => {
                  downloadFile(res, '?????????????????????', 'application/zip', 'zip');
                  setExportLoading(false);
                  _refreshTable();
                });
              }}
            >
              ????????????
            </AuthButton>

            <AuthButton
              authId="publicServicePlatform/templateManage:btn8"
              loading={_get(currentRecord, 'id') === _get(record, 'id') && deleteTplLoading}
              onClick={() => {
                _showDeleteConfirm({
                  handleOk: () => {
                    deleteTplRun({ id: _get(record, 'id') });
                  },
                });
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              ??????
            </AuthButton>
          </>
        );
      },
    },
  ];
  return (
    <div className="flex">
      <TreeOrg
        showOperationBar
        onSelect={(selected: any) => {
          _get(selected, '0') && setSelectedId(_get(selected, '0'));
        }}
        treeData={treeData}
        currentRecord={currentRecord}
        setCurrentRecord={setCurrentRecord}
        setSelectedId={setSelectedId}
        setTreeData={setTreeData}
        setIsEdit={setIsEdit}
        _switchVisible={_switchIsAddOrEditVisible}
        ignore={ignore}
        forceUpdate={forceUpdate}
        tableForceUpdate={_refreshTable}
      />
      <div className="flex1">
        <AddOrEditTopic
          key={Math.random()} //FIXME:????????????????????????Drawer
          currentRecord={currentRecord}
          title={isEdit ? '????????????' : '????????????'}
          isEdit={isEdit}
          visible={isAddOrEditVisible}
          onCancel={() => {
            _switchIsAddOrEditVisible();
            setCurrentRecord({});
          }}
          onOk={() => {
            _handleOk();
            forceUpdate();
          }}
          currentId={currentId}
          selectedId={selectedId}
        />
        <div>
          <div className="bold fz18 mb20">????????????</div>
          <AuthButton
            authId="publicServicePlatform/templateManage:btn1"
            type="primary"
            className="mb10"
            onClick={() => {
              setIsEdit(false);
              setSelectedId(null);
              _switchIsAddOrEditVisible();
            }}
          >
            ????????????
          </AuthButton>
          <CustomTable {...tableProps} columns={columns} rowKey="id" />
        </div>
        <div>
          <AddOrEditTemplate
            key={isTplEdit ? tplCurrentId : Math.random()}
            currentRecord={tplCurrentRecord}
            title={isTplEdit ? '????????????' : '????????????'}
            isEdit={isTplEdit}
            visible={isTplAddOrEditVisible}
            onCancel={_switchTplAddOrEditVisible}
            onOk={_handleTplOk}
            currentId={tplCurrentId}
          />
          <div className="bold fz18 mb20">??????????????????</div>
          <Search
            loading={tplTableProps.loading}
            filters={[
              {
                type: 'Input',
                field: 'name',
              },
            ]}
            search={tplSearch}
            _handleSearch={_handleTplSearch}
            refreshTable={_tplRefreshTable}
          />
          <AuthButton
            authId="publicServicePlatform/templateManage:btn6"
            type="primary"
            className="mb10 mt10"
            onClick={() => {
              _handleTplAdd();
            }}
          >
            ????????????
          </AuthButton>
          <AuthButton
            authId="publicServicePlatform/templateManage:btn7"
            type="primary"
            className="mb10 mt10 ml20"
            onClick={_switchFileVisible}
          >
            ????????????
          </AuthButton>
          {fileVisible && (
            <ImportFile
              onCancel={_switchFileVisible}
              fileUrl={`/${PORTAL_PREFIX}/v1/portalTemplate/importTemplate`}
              accept=".zip"
              callback={() => {
                _switchFileVisible();
                _refreshTable();
                _tplRefreshTable();
                forceUpdate();
              }}
            />
          )}
          <CustomTable {...tplTableProps} columns={tplColumns} rowKey="id" />
        </div>
      </div>
    </div>
  );
}
