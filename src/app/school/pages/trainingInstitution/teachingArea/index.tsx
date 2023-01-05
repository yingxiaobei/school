// 教学区域管理
import { useRef, useState } from 'react';
import { Switch, Modal, message, Tooltip } from 'antd';
import { getTableMaxHeightRef, _get } from 'utils';
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
import {
  _getTeachingArea,
  _deleteTeachingArea,
  _updateState,
  _record,
  _getReviewResult,
  _updatePlacetype,
  _export,
  _exportBefore,
} from './_api';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, MoreOperation, CustomTable, ButtonContainer } from 'components';
import AddModelEdit from './AddModelEdit';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadFile } from 'utils';
import { PRIMARY_COLOR } from 'constants/styleVariables';

const { confirm } = Modal;

function TeachingArea() {
  const [search, _handleSearch] = useSearch();
  const [currentId, setCurrentId] = useState(null);
  const [robotPlaceId, setRobotPlaceId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [modelVisible, _switchModelVisible] = useVisible(); //新加的模型编辑框
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showConfirm] = useConfirm();
  const [currentRecord, setCurrentRecord] = useState(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getTeachingArea,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      name: _get(search, 'name'),
      registered_flag: _get(search, 'registered_flag'),
      placetype: _get(search, 'placetype'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const registeredExamFlagHash = useHash('region_registered_type'); // 备案状态
  const teachTypeHash = useHash('teach_type'); // 类型

  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteTeachingArea, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { loading: recordLoading, run: recordRun } = useRequest(_record, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // const { loading: dismissLoading, run: dismissRun } = useRequest(_dismissRecord, {
  //   onSuccess: () => {
  //     setPagination({ ...pagination, current: 1 });
  //     forceUpdate();
  //   },
  // });

  const { loading: getResLoading, run: getResRun } = useRequest(_getReviewResult, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 启用
  const { loading: startBtnLoading, run: startRun } = useRequest(_updateState, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 停用
  const { loading: endBtnLoading, run: endRun } = useRequest(_updateState, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const schRegionStateTypeHash = useHash('sch_region_state_type');

  const columns = [
    {
      title: '场地名称',
      width: 80,
      dataIndex: 'name',
    },
    {
      title: '类型',
      width: 80,
      dataIndex: 'type',
      render: (type: any) => teachTypeHash[type],
    },
    {
      title: '培训车型',
      width: 80,
      dataIndex: 'vehicletype',
    },
    {
      title: '备案状态',
      width: 80,
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
      title: '教学区域状态',
      width: 80,
      dataIndex: 'state',
      render: (state: any) => schRegionStateTypeHash[state],
    },
    {
      // 1: 使用 0: 禁用；
      title: '训练状态',
      dataIndex: 'placetype',
      width: 80,
      render: (placetype: string, record: any) => (
        <Switch
          checked={placetype === '1'}
          onChange={async (checked) => {
            if (_get(record, 'state', '') === '3') {
              message.error('教学区域尚未备案同意启用，不允许训练');
              return;
            }
            confirm({
              title: '信息提示',
              content: checked
                ? '开启训练，发布围栏版本后，将导致该区域下，车辆允许教学，是否继续？'
                : '禁止训练，发布围栏版本后，将导致该区域下，车辆禁止教学，是否继续？',
              async onOk() {
                const res = await _updatePlacetype({ rid: _get(record, 'rid'), placetype: checked ? '1' : '0' });
                if (_get(res, 'code') === 200) {
                  forceUpdate();
                }
              },
              onCancel() {
                return;
              },
              okText: '是',
              cancelText: '否',
            });
          }}
        />
      ),
    },
    {
      title: '操作',
      width: 150,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          {/* 0:"停用",1:"启用",2:"注销",3:"注册", */}
          <AuthButton
            authId="trainingInstitution/teachingArea:btn2"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentId(_get(record, 'rid'));
            }}
            className="operation-button"
          >
            详情
          </AuthButton>

          <AuthButton
            //未备案0, 同意启用2，不同意启用3，备案失败5,编辑后待重新备案4 显示
            insertWhen={['0', '2', '3', '5', '4'].includes(String(_get(record, 'registered_flag', '')))}
            authId="trainingInstitution/teachingArea:btn3"
            onClick={() => {
              _switchVisible();
              setCurrentId(_get(record, 'rid'));
              setCurrentRecord(record);
              setIsEdit(true);
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>

          <MoreOperation>
            <AuthButton
              insertWhen={
                ((_get(record, 'state') === '3' &&
                  (_get(record, 'registered_flag') === '0' || _get(record, 'registered_flag') === '3')) ||
                  _get(record, 'state') === '1' ||
                  _get(record, 'state') === '0') &&
                _get(record, 'registered_flag') !== '1'
              } //注册（未备案和备案不同意启用）、启用、停用显示
              loading={_get(currentRecord, 'rid') === _get(record, 'rid') && deleteLoading}
              authId="trainingInstitution/teachingArea:btn4"
              onClick={() =>
                _showConfirm({
                  handleOk: async () => {
                    setCurrentRecord(record);
                    deleteRun({ id: _get(record, 'rid') });
                  },
                  title: '注销后，信息无法恢复，如信息已备案，将删除已有备案信息，是否继续注销？',
                })
              }
              className="operation-button"
              isInline
            >
              注销
            </AuthButton>

            <AuthButton
              insertWhen={_get(record, 'state', '') === '0' && _get(record, 'registered_flag') !== '1'} //停用状态才显示
              loading={_get(currentRecord, 'rid') === _get(record, 'rid') && startBtnLoading}
              authId="trainingInstitution/carInfo:btn4"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                _showConfirm({
                  handleOk: async () => {
                    startRun({
                      rid: _get(record, 'rid', ''),
                      state: '1', //1:启用
                    });
                  },
                  title: '确认停用该教学区域? ',
                });
              }}
              isInline
            >
              启用
            </AuthButton>

            <AuthButton
              insertWhen={_get(record, 'state', '') === '1' && _get(record, 'registered_flag') !== '1'} //启用状态才显示
              loading={_get(currentRecord, 'rid') === _get(record, 'rid') && endBtnLoading}
              authId="trainingInstitution/carInfo:btn4"
              className="operation-button"
              onClick={async () => {
                setCurrentRecord(record);
                _showConfirm({
                  handleOk: async () => {
                    endRun({
                      rid: _get(record, 'rid', ''),
                      state: '0', // 0:"停用"
                    });
                  },
                  title: '停用后，该教学区域不能使用，确认停用吗？',
                });
              }}
              isInline
            >
              停用
            </AuthButton>
            <AuthButton
              insertWhen={
                _get(record, 'registered_flag', '') === '0' ||
                _get(record, 'registered_flag', '') === '4' ||
                _get(record, 'registered_flag', '') === '5'
              } //未备案/编辑待重新备案/备案失败才能 显示编辑、 备案按钮，才可操作
              loading={_get(currentRecord, 'rid') === _get(record, 'rid') && recordLoading}
              authId="trainingInstitution/teachingArea:btn5"
              className="operation-button"
              onClick={() => {
                setCurrentRecord(record);
                recordRun({ id: _get(record, 'rid') });
              }}
              isInline
            >
              备案
            </AuthButton>
            <AuthButton
              insertWhen={_get(record, 'registered_flag', '') === '1'} //备案审核中，才显示获取审核结果信息
              loading={_get(currentRecord, 'rid') === _get(record, 'rid') && getResLoading}
              authId="trainingInstitution/teachingArea:btn7"
              className="operation-button"
              onClick={() => {
                setCurrentRecord(record);
                getResRun({ id: _get(record, 'rid') });
              }}
              isInline
            >
              获取备案结果
            </AuthButton>
            <AuthButton
              authId="trainingInstitution/teachingArea:btn8"
              className="operation-button"
              onClick={() => {
                _switchModelVisible();
                setCurrentId(_get(record, 'rid'));
                setRobotPlaceId(_get(record, 'robotPlaceId'));
              }}
              isInline
            >
              {_get(record, 'robotPlaceId') ? '编辑' : '绑定'}场地模型
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

  //绑定地形完成
  function _handlePlaceOK() {
    _switchModelVisible();
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
          title={isEdit ? '编辑教学区域' : '新增教学区域'}
          currentRecord={currentRecord}
        />
      )}

      {detailsVisible && <Details onCancel={_switchDetailsVisible} currentId={currentId} />}

      {/* 绑定场地 */}
      {modelVisible && (
        <AddModelEdit
          onCancel={_switchModelVisible}
          currentId={currentId}
          robotPlaceId={robotPlaceId}
          onOk={_handlePlaceOK}
        />
      )}

      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'name', placeholder: '场地名称' },
          {
            type: 'Select',
            field: 'registered_flag',
            options: [{ value: '', label: '备案状态(全部)' }, ...useOptions('region_registered_type')],
          },
          {
            type: 'Select',
            field: 'placetype',
            options: [{ value: '', label: '训练状态(全部)' }, ...useOptions('place_type')],
          },
        ]}
        search={search}
        ref={searchRef}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        showSearchButton={false}
      />
      <ButtonContainer
        searchRef={searchRef}
        showSearchButton={true}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        loading={isLoading}
      >
        <AuthButton
          authId="trainingInstitution/teachingArea:btn1"
          type="primary"
          onClick={_handleAdd}
          className="mb20 mr20"
        >
          新增
        </AuthButton>
        <AuthButton
          authId="trainingInstitution/teachingArea:btn9"
          icon={<DownloadOutlined />}
          onClick={async () => {
            const query = {
              name: _get(search, 'name'),
              registered_flag: _get(search, 'registered_flag'),
              placetype: _get(search, 'placetype'),
            };

            const res = await _exportBefore(query);

            if (_get(res, 'code') === 200) {
              _export(query).then((res: any) => {
                downloadFile(res, '教学区域', 'application/vnd.ms-excel', 'xlsx');
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
        rowKey={(record: any) => _get(record, 'rid')}
        pagination={tablePagination}
        scroll={{ y: getTableMaxHeightRef(searchRef) }}
      />
    </div>
  );
}

export default TeachingArea;
