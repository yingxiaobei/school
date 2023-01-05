// 营业网点信息管理
import { useState } from 'react';
import { message } from 'antd';
import { useFetch, useTablePagination, useSearch, useVisible, useConfirm, useForceUpdate, useRequest } from 'hooks';
import { _getBusinessOutlet, _deleteBusinessOutlet, _getTeachInfo } from './_api';
import AddOrEdit from './AddOrEdit';
import ConfigSchool from './config/ConfigSchool';
import ConfigClassroom from './config/ConfigClassRoom';
import ConfigCoach from './config/ConfigCoach';
import ConfigCoachCar from './config/ConfigCoachCar';
import { AuthButton, Search, MoreOperation, CustomTable, ButtonContainer } from 'components';
import Detail from './details/Detail';
import { Auth, _get, _handlePhone } from 'utils';

function BusinessOutlet() {
  const [search, _handleSearch] = useSearch();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible(); // 编辑
  const [schoolVisible, _switchSchoolVisible] = useVisible(); // 驾校
  const [classVisible, _switchClassVisible] = useVisible(); // 教室
  const [coachPersonVisible, _switchCoachPersonVisible] = useVisible(); // 教练员
  const [coachCarVisible, _switchCoachCarVisible] = useVisible(); // 教练车
  const [detailVisible, _switchDetailVisible] = useVisible(); // 详情
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getBusinessOutlet,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      branchname: _get(search, 'branchname'),
      shortname: _get(search, 'shortname'),
      contact: _get(search, 'contact'),
      phone: _get(search, 'phone'),
      address: _get(search, 'address'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });
  const { loading: deleteLoading, run } = useRequest(_deleteBusinessOutlet, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 教学信息接口
  const { data: teachData } = useFetch({
    request: _getTeachInfo,
    query: {
      id: Auth.get('schoolId'),
    },
  });

  const columns = [
    {
      title: '网点名称',
      width: 140,
      dataIndex: 'branchname',
    },
    {
      title: '网点简称',
      width: 140,
      dataIndex: 'shortname',
    },
    {
      title: '网点地址',
      width: 140,
      dataIndex: 'address',
    },
    {
      title: '联系人',
      width: 100,
      dataIndex: 'contact',
    },
    {
      title: '联系电话',
      width: 100,
      dataIndex: 'phone',
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '教室',
      width: 60,
      dataIndex: 'scnum',
    },
    {
      title: '教练员',
      width: 60,
      dataIndex: 'saconum',
    },
    {
      title: '教练车',
      width: 60,
      dataIndex: 'sacnum',
    },
    {
      title: '驾校',
      width: 100,
      dataIndex: 'sasnum',
    },
    {
      title: '操作',
      width: 160,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="trainingInstitution/businessOutlet:btn2"
            onClick={() => {
              _switchDetailVisible();
              setCurrentId(_get(record, 'sbnid'));
              setCurrentRecord(record);
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          <AuthButton
            authId="trainingInstitution/businessOutlet:btn3"
            onClick={() => {
              _switchVisible();
              setCurrentId(_get(record, 'sbnid'));
              setIsEdit(true);
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>
          <MoreOperation>
            <AuthButton
              authId="trainingInstitution/businessOutlet:btn4"
              className="operation-button"
              onClick={() => {
                //实操 && !模拟 &&!理论 提示没有权限
                if (
                  _get(teachData, 'practice', false) && //实操
                  !_get(teachData, 'simulation', false) && //模拟
                  !_get(teachData, 'internetTheory', false) && //网络理论
                  !_get(teachData, 'classroomTheory', false) //课堂理论
                ) {
                  message.error('当前驾校没有配置理论驾校或模拟驾校的权限，如有问题，请联系系统管理人员');
                  return;
                }
                _switchSchoolVisible();
                setCurrentId(_get(record, 'sbnid'));
              }}
              isInline
            >
              配置驾校
            </AuthButton>
            {(_get(teachData, 'classroomTheory') || _get(teachData, 'simulation')) && (
              <AuthButton
                authId="trainingInstitution/businessOutlet:btn5"
                className="operation-button"
                onClick={() => {
                  _switchClassVisible();
                  setCurrentId(_get(record, 'sbnid'));
                }}
                isInline
              >
                配置教室
              </AuthButton>
            )}
            <AuthButton
              authId="trainingInstitution/businessOutlet:btn6"
              className="operation-button"
              onClick={() => {
                _switchCoachPersonVisible();
                setCurrentId(_get(record, 'sbnid'));
              }}
              isInline
            >
              配置教练员
            </AuthButton>
            <AuthButton
              authId="trainingInstitution/businessOutlet:btn7"
              className="operation-button"
              onClick={() => {
                _switchCoachCarVisible();
                setCurrentId(_get(record, 'sbnid'));
              }}
              isInline
            >
              配置教练车
            </AuthButton>
            <AuthButton
              loading={_get(currentRecord, 'sbnid') === _get(record, 'sbnid') && deleteLoading}
              authId="trainingInstitution/businessOutlet:btn8"
              onClick={() =>
                _showDeleteConfirm({
                  handleOk: async () => {
                    setCurrentRecord(record);
                    run({ id: _get(record, 'sbnid') });
                  },
                })
              }
              className="operation-button"
              isInline
            >
              删除
            </AuthButton>
          </MoreOperation>
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
      {/* 详情 */}
      {detailVisible && (
        <Detail
          onCancel={() => {
            _switchDetailVisible();
            forceUpdate();
          }}
          title="营业网点详情"
          currentId={currentId}
          currentRecord={currentRecord}
        />
      )}

      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑营业网点信息' : '新增营业网点信息'}
        />
      )}

      {/* 配置驾校 */}
      {schoolVisible && (
        <ConfigSchool
          onCancel={_switchSchoolVisible}
          onOk={() => {
            _switchSchoolVisible();
            forceUpdate();
          }}
          currentId={currentId}
          title="配置驾校"
          classroomTheory={_get(teachData, 'classroomTheory')} // 理论教学
          simulation={_get(teachData, 'simulation')} // 是否模拟教学点
        />
      )}

      {/* 配置教室 */}
      {classVisible && (
        <ConfigClassroom
          onCancel={() => {
            _switchClassVisible();
            forceUpdate();
          }}
          currentId={currentId}
        />
      )}

      {/* 配置教练员 */}
      {coachPersonVisible && (
        <ConfigCoach
          onCancel={_switchCoachPersonVisible}
          currentId={currentId}
          onOk={() => {
            _switchCoachPersonVisible();
            forceUpdate();
          }}
        />
      )}

      {/* 配置教练车 */}
      {coachCarVisible && (
        <ConfigCoachCar
          onCancel={_switchCoachCarVisible}
          currentId={currentId}
          onOk={() => {
            _switchCoachCarVisible();
            forceUpdate();
          }}
        />
      )}

      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'branchname', placeholder: '网点名称' },
          { type: 'Input', field: 'shortname', placeholder: '简称' },
          { type: 'Input', field: 'contact', placeholder: '联系人' },
          { type: 'Input', field: 'phone', placeholder: '联系电话' },
          { type: 'Input', field: 'address', placeholder: '地址' },
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
        <AuthButton
          authId="trainingInstitution/businessOutlet:btn1"
          type="primary"
          onClick={_handleAdd}
          className="mb20"
        >
          新增
        </AuthButton>
      </ButtonContainer>

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'sbnid')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default BusinessOutlet;
