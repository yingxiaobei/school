// 安全员信息管理
import { useState } from 'react';
import { message, Tooltip } from 'antd';
import { _get, downloadFile, _handleIdCard } from 'utils';
import {
  useFetch,
  useTablePagination,
  useSearch,
  useVisible,
  useConfirm,
  useForceUpdate,
  useOptions,
  useHash,
  useRequest,
} from 'hooks';
import { _getInfo, _record, _logoutPerson, _changeStatus, _export, _exportBefore } from './_api';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, MoreOperation, CustomTable, ButtonContainer } from 'components';
import NoCardSoftWare from '../../student/studentInfo/NoCardSoftWare';
import { _getCoachExamineResult } from 'api';
import { DownloadOutlined } from '@ant-design/icons';
import { PRIMARY_COLOR } from 'constants/styleVariables';

function SecurityOfficerInfo() {
  const [search, _handleSearch] = useSearch();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showConfirm] = useConfirm();
  const [noSoftWareVisible, setNoSoftWareVisible] = useVisible();

  const { loading: deleteLoading, run: deleteRun } = useRequest(_logoutPerson, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { loading: registerLoading, run: registerRun } = useRequest(_record, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 停教
  const { loading: stopTeachLoading, run: stopTeachRun } = useRequest(_changeStatus, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 在教
  const { loading: startTeachLoading, run: startTeachRun } = useRequest(_changeStatus, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      type: '3',
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      registeredSafeFlag: _get(search, 'registeredSafeFlag'),
      employstatusAqy: _get(search, 'employstatusAqy'),
      teachpermitted: _get(search, 'teachpermitted'),
      mobile: _get(search, 'mobile'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记

  const { loading: resultLoading, run: resultRun } = useRequest(_getCoachExamineResult);

  const columns = [
    {
      title: '姓名',
      width: 80,
      dataIndex: 'coachname',
    },
    {
      title: '身份证号',
      width: 150,
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '供职状态',
      width: 80,
      dataIndex: 'employstatusAqy',
      render: (employstatusAqy: any) => employStatusHash[employstatusAqy],
    },
    {
      title: '备案状态',
      width: 80,
      dataIndex: 'registered_safeFlag',
      render: (registeredSafeFlag: any, record: any) => {
        // TODO: 12-13 新增枚举 备案失败
        if (registeredSafeFlag === '3' || registeredSafeFlag === '5') {
          return (
            // TODO: 11-10 备案失败效果
            <Tooltip title={record['messageSafe']}>
              <span style={{ color: PRIMARY_COLOR }}>{registeredExamFlagHash[registeredSafeFlag]}</span>
            </Tooltip>
          );
        }
        return registeredExamFlagHash[registeredSafeFlag];
      },
    },
    {
      title: '统一编码',
      width: 80,
      dataIndex: 'secunum',
    },
    {
      title: '操作',
      width: 180,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        // "00":'注册','01':'在教','02':'停教','05':'注销',
        <>
          <AuthButton
            authId="coach/securityOfficerInfo:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentId(_get(record, 'cid'));
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          <AuthButton
            insertWhen={_get(record, 'employstatusAqy') !== '05' && _get(record, 'registered_safeFlag') !== '1'}
            authId="coach/securityOfficerInfo:btn2"
            onClick={() => {
              _switchVisible();
              setCurrentId(_get(record, 'cid'));
              setIsEdit(true);
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>
          <MoreOperation>
            <AuthButton
              insertWhen={_get(record, 'employstatusAqy') !== '05' && _get(record, 'registered_safeFlag') !== '1'}
              loading={_get(currentRecord, 'cid') === _get(record, 'cid') && deleteLoading}
              authId="coach/securityOfficerInfo:btn3"
              onClick={() =>
                _showConfirm({
                  title: '注销后，将不可操作该信息，如已备案，将删除已有备案信息，是否继续注销',
                  handleOk: async () => {
                    setCurrentRecord(record);
                    deleteRun({ cid: _get(record, 'cid'), type: '3' });
                  },
                })
              }
              className="operation-button"
              isInline
            >
              注销
            </AuthButton>
            {/* 0: 未备案 4：编辑待重新备案 5：备案失败 */}
            <AuthButton
              insertWhen={
                (_get(record, 'registered_safeFlag') === '0' ||
                  _get(record, 'registered_safeFlag') === '4' ||
                  _get(record, 'registered_safeFlag') === '5') &&
                _get(record, 'employstatusAqy') !== '05'
              }
              loading={_get(currentRecord, 'cid') === _get(record, 'cid') && registerLoading}
              authId="coach/securityOfficerInfo:btn4"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                registerRun({ id: _get(record, 'cid'), type: '3' });
              }}
              isInline
            >
              备案
            </AuthButton>
            <AuthButton
              insertWhen={_get(record, 'employstatusAqy') === '02'} // "00":'注册','01':'在教','02':'停教','05':'注销'
              authId="coach/assesserInfo:btn7"
              loading={_get(currentRecord, 'cid') === _get(record, 'cid') && startTeachLoading}
              className="operation-button"
              onClick={() => {
                // '02':'停教'
                if (_get(record, 'employstatusAqy') === '02') {
                  setCurrentRecord(record);
                  startTeachRun(
                    { cid: _get(record, 'cid'), status: '01', type: '3' },
                    { menuId: 'coachInfo', elementId: 'coach/securityOfficerInfo:btn7' },
                  );
                }
              }}
              isInline
            >
              在教
            </AuthButton>

            <AuthButton
              insertWhen={_get(record, 'employstatusAqy') === '01'}
              loading={_get(currentRecord, 'cid') === _get(record, 'cid') && stopTeachLoading}
              authId="coach/securityOfficerInfo:btn8"
              className="operation-button"
              onClick={() => {
                setCurrentRecord(record);
                stopTeachRun(
                  { cid: _get(record, 'cid'), status: '02', type: '3' },
                  { menuId: 'coachInfo', elementId: 'coach/securityOfficerInfo:btn8' },
                );
              }}
              isInline
            >
              停教
            </AuthButton>
            <AuthButton
              insertWhen={_get(record, 'registered_Flag', '') === '1'} //备案审核中才显示
              loading={_get(currentRecord, 'cid') === _get(record, 'cid') && resultLoading}
              authId="coach/securityOfficerInfo:btn9"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                resultRun({ id: _get(record, 'cid', ''), type: 3 }); //人员类型1:教练员2：考核员3：安全员
              }}
              isInline
            >
              获取审核结果
            </AuthButton>
          </MoreOperation>
        </>
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
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑安全员' : '新增安全员'}
        />
      )}

      {detailsVisible && <Details onCancel={_switchDetailsVisible} currentId={currentId} />}
      {noSoftWareVisible && <NoCardSoftWare onCancel={setNoSoftWareVisible} />}

      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'coachname', placeholder: '安全员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'registeredSafeFlag',
            options: [{ label: '备案状态(全部)', value: '' }, ...useOptions('registered_flag_type')],
          }, //备案状态
          {
            type: 'Select',
            field: 'employstatusAqy',
            options: [{ value: '', label: '供职状态(全部)' }, ...useOptions('coa_master_status')],
          },
          {
            type: 'Select',
            field: 'teachpermitted',
            options: [{ value: '', label: '准教车型(全部)' }, ...useOptions('trans_car_type')],
          },
          { type: 'Input', field: 'mobile', placeholder: '联系方式' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        showSearchButton={false}
      />
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        loading={isLoading}
      >
        <AuthButton authId="coach/securityOfficerInfo:btn6" type="primary" onClick={_handleAdd} className="mb20 mr20">
          新增
        </AuthButton>

        <AuthButton
          authId="coach/securityOfficerInfo:btn10"
          icon={<DownloadOutlined />}
          onClick={async () => {
            const query = {
              type: '3',
              coachname: _get(search, 'coachname'),
              idcard: _get(search, 'idcard'),
              registeredSafeFlag: _get(search, 'registeredSafeFlag'),
              employstatusAqy: _get(search, 'employstatusAqy'),
              teachpermitted: _get(search, 'teachpermitted'),
              mobile: _get(search, 'mobile'),
            };

            const res = await _exportBefore(query);

            if (_get(res, 'code') === 200) {
              _export(query).then((res: any) => {
                downloadFile(res, '安全员名单', 'application/vnd.ms-excel', 'xlsx');
              });
            } else {
              message.error(_get(res, 'message'));
            }
          }}
          className="mb20"
        >
          导出
        </AuthButton>
      </ButtonContainer>

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'cid')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default SecurityOfficerInfo;
