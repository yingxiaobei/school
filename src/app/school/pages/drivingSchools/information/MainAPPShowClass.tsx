import { memo } from 'react';
import { Switch, Typography } from 'antd';
import { useConfirm, useTablePro } from 'hooks';
import { ColumnsType } from 'antd/lib/table';
import { AuthButton, CustomTable } from 'components';
import ClassesForAPPAddOrEdit from './ClassesForAPPAddOrEdit';
import {
  ClassesForAPP,
  _changeSchoolClassStatusForAppById,
  _delSchoolClassForAppById,
  _getSchoolClassesForAPP,
} from './_api';
import { _get } from 'utils';

const { Title } = Typography;

function MainAPPShowClass() {
  const {
    tableProps,
    isEdit,
    _refreshTable,
    isAddOrEditVisible,
    currentRecord,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({
    request: _getSchoolClassesForAPP,
  });

  const [_showConfirm] = useConfirm();

  const addClassForAPP = () => {
    _handleAdd();
  };

  const editClassForAPP = (record: ClassesForAPP, id: string) => {
    _handleEdit(record, id);
  };

  const delClassForAPP = (id: string) => {
    _showConfirm({
      async handleOk() {
        try {
          await _delSchoolClassForAppById({
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

  const changeSchoolClassStatusForAppById = async (id: string, status: boolean) => {
    try {
      await _changeSchoolClassStatusForAppById({
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

  const columns: ColumnsType<ClassesForAPP> = [
    {
      title: '班级名称',
      dataIndex: 'name',
    },
    {
      title: '车型',
      dataIndex: 'carType',
    },
    {
      title: 'APP展示培训费',
      dataIndex: 'trainFee',
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
              changeSchoolClassStatusForAppById(_get(record, 'id', ''), status);
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
              onClick={() => editClassForAPP(record, _get(record, 'id', ''))}
              className="operation-button"
              authId="drivingSchools/information:btn3"
            >
              编辑
            </AuthButton>
            <AuthButton
              onClick={() => delClassForAPP(_get(record, 'id', ''))}
              className="operation-button"
              authId="drivingSchools/information:btn4"
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
      <Title level={5}>APP上展示班级</Title>
      {isAddOrEditVisible && (
        <ClassesForAPPAddOrEdit
          handleOk={_handleOk}
          setVisible={_switchIsAddOrEditVisible}
          isEdit={isEdit}
          currentClass={currentRecord}
        />
      )}
      <AuthButton
        type="primary"
        authId="drivingSchools/information:btn2"
        onClick={addClassForAPP}
        style={{ marginBottom: '1rem' }}
      >
        新增
      </AuthButton>
      <CustomTable columns={columns} {...tableProps} rowKey={'id'} />
    </div>
  );
}

export default memo(MainAPPShowClass);
