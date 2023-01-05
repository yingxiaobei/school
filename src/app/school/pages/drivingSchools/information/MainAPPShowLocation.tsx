import { memo } from 'react';
import { Switch, Typography } from 'antd';
import { useConfirm, useTablePro } from 'hooks';
import { ColumnsType } from 'antd/lib/table';
import { AuthButton, CustomTable } from 'components';
import { _get } from 'utils';
import {
  LocationForApp,
  _changeLocationStatusForAppById,
  _delLocationForAppById,
  _getSchoolLocationsForAPP,
} from './_api';
import LocationForAPPAddOrEdit from './LocationForAPPAddOrEdit';
const { Title } = Typography;

const locationTypeMap = {
  2: '科目二',
  3: '科目三',
};

function MainAPPShowLocation() {
  const {
    tableProps,
    isEdit,
    _refreshTable,
    isAddOrEditVisible,
    currentRecord,
    _handleAdd,
    _handleEdit,
    _switchIsAddOrEditVisible,
    _handleOk,
  } = useTablePro({
    request: _getSchoolLocationsForAPP,
  });

  const [_showConfirm] = useConfirm();

  const addLocationForAPP = () => {
    _handleAdd();
  };

  const editLocationForAPP = (record: LocationForApp, id: string) => {
    _handleEdit(record, id);
  };

  const delLocationForAPP = (id: string) => {
    _showConfirm({
      async handleOk() {
        try {
          await _delLocationForAppById({
            id,
          });
        } catch (error) {
          console.error(error);
        } finally {
          _refreshTable();
        }
      },
    });
  };

  const changeLocationStatusForAppById = async (id: string, status: boolean) => {
    try {
      await _changeLocationStatusForAppById({
        id,
        body: {
          isDisplay: Number(status),
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      _refreshTable();
    }
  };

  const columns: ColumnsType<LocationForApp> = [
    {
      title: '场地名称',
      dataIndex: 'name',
    },
    {
      title: '场地类型',
      dataIndex: 'type',
      render(text: string) {
        return locationTypeMap[text];
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
    },
    {
      title: '排序',
      dataIndex: 'sort',
    },
    {
      title: '线上展示',
      dataIndex: 'isDisplay',
      render(_, record) {
        return (
          <Switch
            checked={!!_get(record, 'isDisplay', 0)}
            onChange={(status) => {
              changeLocationStatusForAppById(_get(record, 'id', ''), status);
            }}
          />
        );
      },
    },
    {
      title: '操作',
      render(_, record) {
        return (
          <>
            <AuthButton
              onClick={() => editLocationForAPP(record, _get(record, 'id', ''))}
              className="operation-button"
              authId="drivingSchools/information:btn6"
            >
              编辑
            </AuthButton>
            <AuthButton
              onClick={() => delLocationForAPP(_get(record, 'id', ''))}
              className="operation-button"
              authId="drivingSchools/information:btn7"
            >
              删除
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={5}>APP上展示场地</Title>

      {isAddOrEditVisible && (
        <LocationForAPPAddOrEdit
          setVisible={_switchIsAddOrEditVisible}
          isEdit={isEdit}
          currentLocation={currentRecord}
          handleOk={_handleOk}
        />
      )}

      <AuthButton
        type="primary"
        authId="drivingSchools/information:btn5"
        onClick={addLocationForAPP}
        style={{ marginBottom: '1rem' }}
      >
        新增
      </AuthButton>
      <CustomTable columns={columns} {...tableProps} rowKey="id" />
    </div>
  );
}

export default memo(MainAPPShowLocation);
