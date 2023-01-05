// 车辆信息管理
import { useState, useRef, useContext, useMemo } from 'react';
import { _get, downloadFile, Auth } from 'utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { useVisible, useConfirm, useSearch, useHash, useOptions, useRequest, useFetch } from 'hooks';
import {
  _getCarList,
  _deleteCar,
  _updateStatus,
  _recordCar,
  _getResult,
  _export,
  _exportBefore,
  _getObdReview,
  _updateObdFlagByKey,
  _schCarChangeZLB,
} from './_api';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, TablePro, MoreOperation, ButtonContainer } from 'components';
import AddModelEdit from './AddModelEdit'; //新增机器人教练车辆绑定
import { DownloadOutlined } from '@ant-design/icons';
import { _getBaseInfo, _clearDeviceCache } from 'api';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import GlobalContext from 'globalContext';
import SyncCarInfo from './components/syncCarInfo';

function CarInfo() {
  const [addEditVisible, _switchAddEditVisible] = useVisible();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [devClearVisible, setDevClearVisible] = useVisible();
  const [modelVisible, _switchModelVisible] = useVisible(); //新增机器人教练车辆绑定编辑框
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [search, _handleSearch] = useSearch();
  const [startBtnLoading, setStartBtnLoading] = useState(false);
  const [stopBtnLoading, setStopBtnLoading] = useState(false);
  const [_showConfirm] = useConfirm();

  const tableRef: any = useRef();

  const platecolorHash = useHash('platecolor_type');
  const registeredExamFlagHash = useHash('registered_flag_type');
  const carStatus = useHash('car_status_type'); // 车辆状态
  const obdFlagTypHash = useHash('obd_flag_type'); // 是否有obd
  const obdStatusHash = useHash('obd_status'); // obd状态
  const obdAuditStatusHash = useHash('obd_audit_status'); // obd审核（插拔）状态

  const { $areaNum } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);

  // 12-16 同步省监管信息 镇江特定功能
  const [syncInfoVisible, setSyncInfoVisible] = useState(false);
  // const [updateDateVisible,setUpdateVisible] = useVisible();  // 更新记录不做

  const { loading: recordLoading, run: recordRun } = useRequest(_recordCar, {
    onSuccess: () => {
      tableRef.current.refreshTable();
    },
  });

  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteCar, {
    onSuccess: () => {
      tableRef.current.refreshTable();
    },
  });

  const { loading: resultLoading, run: resultRun } = useRequest(_getResult);

  // 浙里办
  const { loading: zlbLoading, run: zlbRun } = useRequest(_schCarChangeZLB, {
    onSuccess: () => {
      tableRef.current.refreshTable();
    },
  });

  const isHeNan = $areaNum === '01';

  // const isZhenJiang = useMemo(() => {
  //   return $areaNum === '05';
  // }, [$areaNum]);

  const columns = [
    {
      title: '车牌号码',
      width: 80,
      dataIndex: 'licnum',
    },
    {
      title: '车牌颜色',
      width: 80,
      dataIndex: 'platecolor',
      render: (platecolor: number): string => platecolorHash[platecolor],
    },
    {
      title: '车辆品牌',
      width: 80,
      dataIndex: 'brand',
    },
    {
      title: '车架号',
      width: 140,
      ellipsis: true,
      dataIndex: 'franum',
    },
    {
      title: '统一编码',
      width: 150,
      ellipsis: true,
      dataIndex: 'carnum',
    },
    {
      title: '备案状态',
      width: 100,
      dataIndex: 'registered_flag',
      render: (registered_flag: any, record: any) => {
        // TODO: 12-13 新增枚举 备案失败
        if (registered_flag === '3' || registered_flag === '5') {
          return (
            // TODO: 11-10 备案失败效果
            <Tooltip title={record['message']}>
              <span style={{ color: PRIMARY_COLOR }}>{registeredExamFlagHash[registered_flag]}</span>
            </Tooltip>
          );
        }
        return registeredExamFlagHash[registered_flag];
      },
    },
    {
      title: '车辆状态',
      width: 80,
      dataIndex: 'status',
      render: (status: any, record: any) => {
        if (status === '5') {
          //禁用
          return (
            <>
              {carStatus[status]}
              <Tooltip title={_get(record, 'forbidtrainmsg', '')}>
                <QuestionCircleOutlined className="questionIcon-30" />
              </Tooltip>
            </>
          );
        }
        return carStatus[status];
      },
    },
    {
      title: '是否有OBD',
      width: 80,
      dataIndex: 'obdflag',
      render: (obdflag: any): string => obdFlagTypHash[obdflag],
    },
    {
      title: 'OBD插拔审核',
      width: 80,
      dataIndex: 'obdauditstatus',
      render: (obdauditstatus: any): string => obdAuditStatusHash[obdauditstatus],
    },
    {
      title: 'OBD状态',
      width: 80,
      dataIndex: 'obdstatus',
      render: (obdstatus: any): string => obdStatusHash[obdstatus],
    },
    {
      title: '检测到期时间',
      width: 100,
      dataIndex: 'detectexpiredate',
    },
    {
      title: '过保时间',
      width: 100,
      dataIndex: 'overinsuranceDate',
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          {/*status 0:'注册' 1:"启用";2:"停用";3:"注销";5:"禁用"; */}
          <AuthButton
            authId="trainingInstitution/carInfo:btn2"
            onClick={() => _handleDetails(record)}
            className="operation-button"
          >
            详情
          </AuthButton>

          <AuthButton
            insertWhen={
              (_get(record, 'status', '') === '0' &&
                (_get(record, 'registered_flag') === '0' ||
                  _get(record, 'registered_flag') === '3' ||
                  _get(record, 'registered_flag') === '4' ||
                  _get(record, 'registered_flag') === '5')) ||
              _get(record, 'status', '') === '1' ||
              _get(record, 'status', '') === '2'
            } //注册（未备案、备案不同意启用、编辑后待重新备案、备案失败）、启用、停用显示，但注册（审核中）、注销、禁用不显示
            authId="trainingInstitution/carInfo:btn3"
            onClick={() => _handleEdit(record)}
            className="operation-button"
          >
            编辑
          </AuthButton>
          <MoreOperation>
            <AuthButton
              insertWhen={_get(record, 'status', '') === '2'} //停用状态才显示
              loading={_get(currentRecord, 'carid') === _get(record, 'carid') && startBtnLoading}
              authId="trainingInstitution/carInfo:btn4"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                setStartBtnLoading(true);
                _showConfirm({
                  handleOk: async () => {
                    const res = await _updateStatus(
                      {
                        carid: _get(record, 'carid', ''),
                        status: '1',
                      },
                      { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn4' },
                    );
                    if (_get(res, 'code') === 200) {
                      tableRef.current.refreshTable();
                    }
                  },
                  title: `请确认是否启用车辆${_get(record, 'licnum', '')}`,
                });
                setStartBtnLoading(false);
              }}
              isInline
            >
              启用
            </AuthButton>

            <AuthButton
              insertWhen={_get(record, 'status', '') === '1'} //启用状态才显示
              loading={_get(currentRecord, 'carid') === _get(record, 'carid') && stopBtnLoading}
              authId="trainingInstitution/carInfo:btn5"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                setStopBtnLoading(true);
                _showConfirm({
                  handleOk: async () => {
                    const res = await _updateStatus(
                      {
                        carid: _get(record, 'carid', ''),
                        status: '2',
                      },
                      { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn5' },
                    );
                    if (_get(res, 'code') === 200) {
                      tableRef.current.refreshTable();
                    }
                  },
                  title: `请确认是否停用车辆${_get(record, 'licnum', '')}`,
                });

                setStopBtnLoading(false);
              }}
              isInline
            >
              停用
            </AuthButton>

            {/*registered_flag 0:未备案 4:编辑后待重新备案 5:备案失败 */}

            <AuthButton
              insertWhen={
                (_get(record, 'registered_flag') === '0' ||
                  _get(record, 'registered_flag') === '4' ||
                  _get(record, 'registered_flag') === '5') &&
                _get(record, 'status', '') !== '3' &&
                _get(record, 'status', '') !== '5'
              } // 备案状态为未备案、编辑后待重新备案才显示(车辆状态不是注销、禁用时)
              loading={_get(currentRecord, 'carid') === _get(record, 'carid') && recordLoading}
              authId="trainingInstitution/carInfo:btn6"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                recordRun({ carid: _get(record, 'carid', '') });
              }}
              isInline
            >
              备案
            </AuthButton>
            <AuthButton
              insertWhen={
                (_get(record, 'status', '') === '0' &&
                  (_get(record, 'registered_flag') === '0' ||
                    _get(record, 'registered_flag') === '3' ||
                    _get(record, 'registered_flag') === '4')) ||
                _get(record, 'status', '') === '1' ||
                _get(record, 'status', '') === '2'
              } //注销：注册（未备案、备案不同意启用、编辑后待备案）、启用、停用显示，注册（审核中）、注销、禁用不显示
              loading={_get(currentRecord, 'carid') === _get(record, 'carid') && deleteLoading}
              authId="trainingInstitution/carInfo:btn7"
              onClick={() =>
                _showConfirm({
                  handleOk: async () => {
                    setCurrentRecord(record);
                    deleteRun({ id: _get(record, 'carid', '') });
                  },
                  title: '确定要注销这条数据吗？',
                })
              }
              className="operation-button"
              isInline
            >
              注销
            </AuthButton>
            <AuthButton
              insertWhen={_get(record, 'registered_flag', '') === '1' && _get(record, 'status', '') !== '5'}
              loading={_get(currentRecord, 'carid') === _get(record, 'carid') && resultLoading}
              authId="trainingInstitution/carInfo:btn8"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                resultRun({ carid: _get(record, 'carid', '') });
              }}
              isInline
            >
              获取审核结果
            </AuthButton>
            {/* status:5 禁用只展示详情 */}
            <AuthButton
              authId="trainingInstitution/carInfo:btn9"
              insertWhen={_get(record, 'status', '') !== '5'}
              className="operation-button"
              onClick={() => {
                setCurrentRecord(record);
                _switchModelVisible();
              }}
              isInline
            >
              {_get(record, 'car_model_id') ? '编辑' : '绑定'}车辆模型
            </AuthButton>

            <AuthButton
              authId="trainingInstitution/carInfo:btn11"
              insertWhen={_get(record, 'obdauditstatus', '') === '0' && _get(record, 'status', '') !== '5'} // OBD审核状态为“待审核”时，显示OBD审核按钮
              className="operation-button"
              onClick={async () => {
                const res = await _getObdReview({
                  carid: _get(record, 'carid', ''),
                  obdauditstatus: '1', // 开放说：写死传‘1’，审核
                  obdflag: _get(record, 'obdflag', ''),
                });
                if (_get(res, 'code') === 200) {
                  tableRef.current.refreshTable();
                }
              }}
              isInline
            >
              OBD审核
            </AuthButton>

            <AuthButton
              authId="trainingInstitution/carInfo:btn12"
              insertWhen={_get(record, 'obdflag', '') === '0' && _get(record, 'status', '') !== '5'} // 当是否有OBD为无时，更多里出现该按钮
              className="operation-button"
              onClick={async () => {
                _showConfirm({
                  handleOk: async () => {
                    const res = await _updateObdFlagByKey({
                      carid: _get(record, 'carid', ''),
                      obdflag: '1', // 写死1，状态由无变成有
                    });
                    if (_get(res, 'code') === 200) {
                      tableRef.current.refreshTable();
                    }
                  },
                  title: '请确认是否将改车辆OBD状态从无OBD调整为有OBD',
                });
              }}
              isInline
            >
              恢复OBD
            </AuthButton>

            <AuthButton
              authId="trainingInstitution/carInfo:btn17"
              insertWhen={_get(record, 'isZlbType') === '0' && _get(record, 'status', '') !== '5'}
              loading={_get(currentRecord, 'carid') === _get(record, 'carid') && zlbLoading}
              onClick={() => {
                setCurrentRecord(record);
                zlbRun({ id: _get(record, 'carid', '') });
              }}
              className="operation-button"
              isInline
            >
              浙里办模式
            </AuthButton>
            <AuthButton
              authId="trainingInstitution/carInfo:btn19"
              loading={devClearVisible}
              onClick={() => {
                setDevClearVisible();
                _clearDeviceCache({
                  clearType: '2',
                  licnum: _get(record, 'licnum'),
                })
                  .then((res: any) => {
                    if (res.code !== 200) {
                      setDevClearVisible();
                    } else {
                      tableRef.current.refreshTable();
                      setDevClearVisible();
                    }
                  })
                  .catch((res) => {
                    setDevClearVisible();
                  });
              }}
              className="operation-button"
              isInline
            >
              设备同步
            </AuthButton>
          </MoreOperation>
        </>
      ),
    },
  ];

  function _handleEdit(record: any) {
    _switchAddEditVisible();
    setCurrentRecord(record);
    setIsEdit(true);
  }

  function _handleDetails(record: any) {
    _switchDetailsVisible();
    setCurrentRecord(record);
  }

  function _handleAdd() {
    _switchAddEditVisible();
    setCurrentRecord(null);
    setIsEdit(false);
  }

  function _handleAddOrEditOk() {
    _switchAddEditVisible();
    tableRef.current.refreshTable();
  }

  //绑定车辆模型成功
  function _handleAddCarModelOk() {
    _switchModelVisible();
    tableRef.current.refreshTable();
  }

  // 同步省省监管信息
  function synchronizedInformation() {
    setSyncInfoVisible(true);
  }

  return (
    <div>
      {/* 优化动画交互 */}
      {/* 同步车辆信息 */}
      <SyncCarInfo
        visible={syncInfoVisible}
        switchVisible={setSyncInfoVisible}
        onSuccess={() => {
          tableRef.current.refreshTable();
        }}
      />

      {/* 新增/编辑 */}
      {addEditVisible && (
        <AddOrEdit
          onCancel={_switchAddEditVisible}
          onOk={_handleAddOrEditOk}
          currentRecord={currentRecord}
          isEdit={isEdit}
          title={isEdit ? '编辑车辆信息' : '新增车辆信息'}
          isHeNan={isHeNan}
        />
      )}

      {/* 详情 */}
      {detailsVisible && (
        <Details
          onCancel={() => {
            _switchDetailsVisible();
            tableRef.current.refreshTable();
          }}
          carid={_get(currentRecord, 'carid', '')}
          isHeNan={isHeNan}
        />
      )}
      {/* 绑定车辆 */}
      {modelVisible && (
        <AddModelEdit
          onCancel={_switchModelVisible}
          carid={_get(currentRecord, 'carid', '')}
          carType={_get(currentRecord, 'perdritype', '')}
          carModelId={_get(currentRecord, 'car_model_id', '')}
          onOk={_handleAddCarModelOk}
        />
      )}

      <Search
        loading={loading}
        filters={[
          { type: 'Input', field: 'licnum', placeholder: '车牌号码' },
          {
            type: 'Select',
            field: 'perdritype',
            options: [
              { label: '培训车型(全部)', value: '' },
              ...useOptions('business_scope', false, '-1', [], {
                forceUpdate: true,
              }),
            ],
          },
          {
            type: 'Select',
            field: 'registered_flag',
            options: [{ label: '备案状态(全部)', value: '' }, ...useOptions('registered_flag_type')],
          },
          {
            type: 'Select',
            field: 'status',
            options: [{ label: '车辆状态(全部)', value: '' }, ...useOptions('car_status_type')],
          },
          {
            type: 'Select',
            field: 'obdauditstatus',
            options: [{ label: 'OBD审核(全部)', value: '' }, ...useOptions('obd_audit_status')],
          },

          {
            type: 'Select',
            field: 'obdstatus',
            options: [{ label: 'OBD状态(全部)', value: '' }, ...useOptions('obd_status')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          tableRef.current.refreshTable();
        }}
        showSearchButton={false}
      />
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          tableRef.current.refreshTable();
        }}
        loading={loading}
      >
        <AuthButton authId="trainingInstitution/carInfo:btn1" type="primary" onClick={_handleAdd} className="mb20 mr20">
          新增
        </AuthButton>
        <AuthButton
          authId="trainingInstitution/carInfo:btn10"
          icon={<DownloadOutlined />}
          onClick={async () => {
            const query = {
              licnum: _get(search, 'licnum'),
              perdritype: _get(search, 'perdritype'),
              registered_flag: _get(search, 'registered_flag'),
              status: _get(search, 'status'),
            };

            const res = await _exportBefore(query);

            if (_get(res, 'code') === 200) {
              _export(query).then((res: any) => {
                downloadFile(res, '车辆信息', 'application/vnd.ms-excel', 'xlsx');
              });
            } else {
              message.error(_get(res, 'message'));
            }
          }}
          className="mb20 mr20"
        >
          导出
        </AuthButton>

        {/* 12-16 镇江同步监管 */}
        <AuthButton
          authId="trainingInstitution/carInfo:btn18"
          type="primary"
          onClick={synchronizedInformation}
          // insertWhen={isZhenJiang}
          // className="operation-button"
        >
          同步省监管信息
        </AuthButton>
      </ButtonContainer>

      <TablePro
        ref={tableRef}
        rowKey="carid"
        columns={columns}
        request={_getCarList}
        query={{
          licnum: _get(search, 'licnum'),
          perdritype: _get(search, 'perdritype'),
          registered_flag: _get(search, 'registered_flag'),
          status: _get(search, 'status'),
          obdauditstatus: _get(search, 'obdauditstatus'),
          obdstatus: _get(search, 'obdstatus'),
        }}
        scroll={{ y: document.body.clientHeight - 370 }}
        setLoading={setLoading}
      />
    </div>
  );
}

export default CarInfo;
