// 模拟器
import { _get, Auth } from 'utils';
import { useVisible, useConfirm, useOptions, useRequest, useTablePro } from 'hooks';
import { _getList, _opt } from './_api';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, MoreOperation, ButtonContainer, CustomTable } from 'components';
import Bind from './Bind';
import Address from './Address';
import { useState } from 'react';

function CarInfo() {
  const [bindVisible, _switchBindVisible] = useVisible();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [addressVisible, setAddressVisible] = useVisible();
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [change, setChange] = useState(false);
  const [_showConfirm] = useConfirm();
  const [schoolAddress, setSchoolAddress] = useState('');

  // 备案
  const { loading: recordLoading, run: recordRun } = useRequest(_opt, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  // 解除绑定
  const { loading: unBindLoading, run: unBindRun } = useRequest(_opt, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  // 监管删除
  const { loading: deleteLoading, run: deleteRun } = useRequest(_opt, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  // 注销
  const { loading: cancelLoading, run: cancelRun } = useRequest(_opt, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  const {
    tableProps,
    isEdit,
    _refreshTable,
    isAddOrEditVisible,
    search,
    _handleSearch,
    _handleAdd,
    _handleEdit,
    _handleOk,
    currentId,
    setCurrentId,
    currentRecord,
    setCurrentRecord,
    _switchIsAddOrEditVisible,
  } = useTablePro({
    request: _getList,
  });

  const columns: any = [
    {
      title: '模拟器名称',
      dataIndex: 'simulatorname',
      width: 200,
    },
    {
      title: '模拟器编号',
      dataIndex: 'simulatornum',
      width: 100,
    },
    {
      title: '培训车型',
      dataIndex: 'perdritype',
      width: 100,
    },
    {
      title: '绑定车牌号',
      dataIndex: 'licnum',
      width: 100,
    },
    {
      title: '模拟器备案状态',
      dataIndex: 'recordStatusValue',
      width: 120,
    },
    {
      title: '车辆状态',
      dataIndex: 'carStatusValue',
      width: 100,
    },
    {
      title: '模拟器绑定状态',
      dataIndex: 'bindStatusValue',
      width: 160,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      width: 160,
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="carManage/simulator:btn1"
            onClick={() => {
              setCurrentId(record?.id);
              _switchDetailsVisible();
            }}
            className="operation-button"
          >
            详情
          </AuthButton>

          <AuthButton
            insertWhen={_get(record, 'useStatus', '') !== '5'}
            authId="carManage/simulator:btn2"
            onClick={() => _handleEdit(record, record?.id)}
            className="operation-button"
          >
            编辑
          </AuthButton>
          <MoreOperation>
            {/* recordStatus备案：未备案：0；已备案：1  解除备案：3*/}
            {/* bindStatus绑定：未绑定：0；已绑定：1；绑定失败：2 */}
            {/* carStatus车辆状态：注销：3  注销状态下只展示详情 */}

            {/* 未备案 */}
            <AuthButton
              insertWhen={
                (_get(record, 'recordStatus', '') === '0' || _get(record, 'recordStatus', '') === '3') &&
                _get(record, 'useStatus', '') !== '5'
              }
              loading={currentId === _get(record, 'id') && recordLoading}
              authId="carManage/simulator:btn3"
              className="operation-button"
              onClick={() => {
                setCurrentId(_get(record, 'id', ''));
                recordRun({ id: _get(record, 'id', ''), operateType: '1' });
              }}
            >
              备案
            </AuthButton>
            {/* 已备案未绑定 */}
            <AuthButton
              insertWhen={
                _get(record, 'recordStatus', '') === '1' &&
                _get(record, 'bindStatus', '') === '0' &&
                _get(record, 'useStatus', '') !== '5'
              }
              authId="carManage/simulator:btn4"
              className="operation-button"
              onClick={() => {
                setCurrentId(record?.id);
                _switchBindVisible();
              }}
            >
              绑定
            </AuthButton>
            {/* 已备案已绑定 */}
            <AuthButton
              insertWhen={
                _get(record, 'recordStatus', '') === '1' &&
                _get(record, 'bindStatus', '') === '1' &&
                _get(record, 'useStatus', '') !== '5'
              }
              authId="carManage/simulator:btn5"
              loading={currentId === _get(record, 'id') && unBindLoading}
              onClick={() => {
                _showConfirm({
                  handleOk: async () => {
                    setCurrentId(_get(record, 'id', ''));
                    unBindRun({ id: _get(record, 'id', ''), operateType: '4' });
                  },
                  title: '确认解除绑定?',
                });
              }}
              className="operation-button"
            >
              解除绑定
            </AuthButton>
            {/* 已备案未绑定 */}
            <AuthButton
              authId="carManage/simulator:btn6"
              insertWhen={
                _get(record, 'recordStatus', '') === '1' &&
                _get(record, 'bindStatus', '') === '0' &&
                _get(record, 'useStatus', '') !== '5'
              }
              onClick={() =>
                _showConfirm({
                  handleOk: async () => {
                    deleteRun({ id: _get(record, 'id', ''), operateType: '3' });
                  },
                  title: '将该模拟器从监管平台彻底删除，删除后不可恢复确定需要删除?',
                })
              }
              className="operation-button"
            >
              监管删除
            </AuthButton>
            <AuthButton
              insertWhen={
                (_get(record, 'recordStatus', '') === '0' || _get(record, 'recordStatus', '') === '3') &&
                _get(record, 'useStatus', '') !== '5'
              }
              authId="carManage/simulator:btn7"
              loading={currentId === _get(record, 'id') && cancelLoading}
              onClick={() => {
                _showConfirm({
                  handleOk: async () => {
                    setCurrentId(_get(record, 'id', ''));
                    cancelRun({ id: _get(record, 'id', ''), operateType: '5' });
                  },
                  title: '确认注销?',
                });
              }}
              className="operation-button"
            >
              注销
            </AuthButton>
          </MoreOperation>
        </>
      ),
    },
  ];

  return (
    <div>
      {/* 新增/编辑 */}
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          isEdit={isEdit}
          title={isEdit ? '编辑模拟器' : '新增模拟器'}
          currentId={currentId}
          currentRecord={currentRecord}
          setVisible={setAddressVisible}
          setLng={setLng}
          lng={lng}
          lat={lat}
          setLat={setLat}
          change={change}
          setChange={setChange}
          longitude={longitude}
          setLongitude={setLongitude}
          latitude={latitude}
          setLatitude={setLatitude}
          setSchoolAddress={setSchoolAddress}
          schoolAddress={schoolAddress}
        />
      )}

      {/* 详情 */}
      {detailsVisible && (
        <Details
          onCancel={_switchDetailsVisible}
          currentId={currentId}
          setLng={setLng}
          lng={lng}
          lat={lat}
          setLat={setLat}
        />
      )}

      {bindVisible && (
        <Bind
          currentId={currentId}
          onCancel={_switchBindVisible}
          onOk={() => {
            _switchBindVisible();
            _refreshTable();
          }}
        />
      )}
      {addressVisible && (
        <Address
          setVisible={setAddressVisible}
          lng={lng}
          lat={lat}
          setLng={setLng}
          setLat={setLat}
          setChange={setChange}
          change={change}
          longitude={longitude}
          setLongitude={setLongitude}
          latitude={latitude}
          setLatitude={setLatitude}
          setSchoolAddress={setSchoolAddress}
          schoolAddress={schoolAddress}
        />
      )}
      <Search
        loading={tableProps.loading}
        filters={[
          { type: 'Input', field: 'simulatornum', placeholder: '模拟器编号' },
          {
            type: 'Select',
            field: 'carType',
            options: [
              { value: '', label: '培训车型(全部)' },
              ...useOptions('business_scope', false, '-1', [], {
                query: { customHeader: { customSchoolId: Auth.get('schoolId') } },
                depends: [Auth.get('schoolId') as string],
                forceUpdate: true,
              }),
            ],
          },
          {
            type: 'Select',
            field: 'recordStatus',
            options: [{ label: '模拟器备案状态(全部)', value: '' }, ...useOptions('simulator_record_status')],
          },
          {
            type: 'Select',
            field: 'carStatus',
            options: [{ label: '车辆状态(全部)', value: '' }, ...useOptions('car_status_type')],
          },
          {
            type: 'Select',
            field: 'bindStatus',
            options: [{ label: '模拟器绑定状态(全部)', value: '' }, ...useOptions('simulator_bind_status')],
          },
          { type: 'Input', field: 'brand', placeholder: '品牌' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <AuthButton authId="carManage/simulator:btn8" type="primary" onClick={_handleAdd} className="mb20 mr20">
          新增
        </AuthButton>
      </ButtonContainer>

      <CustomTable {...tableProps} columns={columns} rowKey="id" />
    </div>
  );
}

export default CarInfo;
