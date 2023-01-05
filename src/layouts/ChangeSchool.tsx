import { useState, useContext } from 'react';
import { isEmpty } from 'lodash';
import { message, Modal, Button } from 'antd';
import { _getSchoolList, _changeSchool } from './_api';
import { _getUserInfo } from '../_api';
import { useFetch, useSearch, useHash, useTablePagination, useForceUpdate } from 'hooks';
import { Search } from 'components';
import { Auth, handleLogout, _get, getIdCardInfo } from 'utils';
import GlobalContext from 'globalContext';
import { CustomTable, ButtonContainer } from 'components';
import { connect } from 'react-redux';
import * as actions from 'store/actions';
import { _getVersion } from '../api';
import { ColumnsType } from 'antd/lib/table';
import { Dispatch } from 'redux';

const ChangeSchool = ({
  setStoreData,
  title,
  onOk,
  onCancel,
}: {
  setStoreData: any;
  title: any;
  onOk: any;
  onCancel: any;
}) => {
  const { $setAllRouterWithName } = useContext(GlobalContext);
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [changeLoading, setChangeLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const companyBusiStatusHash = useHash('company_busi_status'); // 营业状态
  const [idLoading, setIdLoading] = useState(false);
  const [idCard, setIdCard] = useState('');

  const { data = [], isLoading } = useFetch({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      name: _get(search, 'name'),
      idcard: _get(search, 'idcard'),
      coaIdcard: _get(search, 'coaIdcard'),
      plateNum: _get(search, 'plateNum'),
      studentPhone: _get(search, 'studentPhone'),
      coaPhone: _get(search, 'coaPhone'),
    },
    request: _getSchoolList,
    depends: [pagination.current, pagination.pageSize, ignore, idCard],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const columns: ColumnsType<any> = [
    {
      title: '驾校名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '经营状态',
      dataIndex: 'busiStatus',
      render: (busiStatus) => companyBusiStatusHash[busiStatus],
      width: 100,
    },
    {
      title: '经营车型',
      dataIndex: 'busiScope',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      render: (_, record) => {
        return (
          <Button
            loading={_get(currentRecord, 'id') === _get(record, 'id') && changeLoading}
            onClick={async () => {
              setCurrentRecord(record);
              if (_get(record, 'busiStatus', '') === '0') {
                //营业中
                setChangeLoading(true);
                const res = await _changeSchool({ id: _get(record, 'id', '') });
                if (_get(res, 'code') === 200) {
                  const info = await _getUserInfo();

                  if (_get(info, 'code') === 200) {
                    let data = _get(info, 'data', {});
                    // 如果菜单列表为空，则强制用户登出
                    if (isEmpty(_get(data, 'menus'))) {
                      handleLogout();
                    }
                    const rolesIds = _get(data, 'companyRoles', [])
                      .map((x: { id: any }) => x.id)
                      .join(',');
                    Auth.set('schoolId', _get(data, 'companyId'));
                    Auth.set('companyId', _get(data, 'companyId'));
                    Auth.set('rolesIds', rolesIds);
                    Auth.set('schoolName', _get(data, 'companyName'));
                    $setAllRouterWithName([]);
                    setStoreData('SET_CURTAB', []);

                    onOk();
                  }
                }
                setChangeLoading(false);
              } else {
                message.info('只有营业中的驾校才可进行切换');
              }
            }}
            type="primary"
            ghost
            size="small"
            className="operation-button"
          >
            切换驾校
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      width={800}
      maskClosable={false}
      title={title}
      visible
      onOk={() => {
        onOk();
      }}
      footer={null}
      onCancel={onCancel}
    >
      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'name', placeholder: '请输入驾校简称' },
          { type: 'Input', field: 'plateNum', placeholder: '请输入车牌号' },
          {
            type: 'ComboSelect',
            field: 'card',
            options: [
              {
                label: '学员身份证号',
                value: 'idcard',
                placeholder: '请输入学员身份证号',
              },
              {
                label: '教练身份证号',
                value: 'coaIdcard',
                placeholder: '请输入教练身份证号',
              },
            ],
          },
          {
            type: 'ComboSelect',
            field: 'phone',
            options: [
              {
                label: '学员手机号',
                value: 'studentPhone',
                placeholder: '请输入学员手机号',
              },
              {
                label: '教练手机号',
                value: 'coaPhone',
                placeholder: '请输入教练手机号',
              },
            ],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        showSearchButton={false}
        refreshTable={forceUpdate}
        searchWidth={'small'}
        hack={idCard}
      />
      <ButtonContainer
        loading={isLoading}
        showSearchButton={true}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      >
        <Button
          type="primary"
          loading={idLoading}
          className="mb10"
          onClick={async () => {
            setIdLoading(true);

            const result = await getIdCardInfo();
            if (!_get(result, 'idNo', '')) {
              setIdLoading(false);
              message.info(_get(result, 'info', '未检测到身份证'));
              return;
            }
            let id = _get(result, 'idNo', '').trim();

            _handleSearch('idcard', id);
            _handleSearch('coaIdcard', undefined);
            setIdCard(id + Math.random());
            setIdLoading(false);
          }}
        >
          读学员二代证
        </Button>
      </ButtonContainer>

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey="id"
        scroll={{ y: undefined }}
        pagination={tablePagination}
      />
    </Modal>
  );
};
export default connect((state) => state, actions)(ChangeSchool);
