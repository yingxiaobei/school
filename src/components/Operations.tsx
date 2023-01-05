// FIXME: REMOVE

import { useState } from 'react';
import { Modal } from 'antd';
import { _get } from 'utils';
import { useConfirm } from 'hooks';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { AuthButton } from 'components';

const { confirm } = Modal;

interface IOperations {
  operations?: any[];
  _handleEdit(record: object): void;
  refreshTable(): void;
  _handleDetail(record: object): void;
  record: object;
}

export default function Operations(props: IOperations) {
  const { operations = [], _handleEdit, refreshTable, record, _handleDetail } = props;
  const [_showDeleteConfirm] = useConfirm();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [changeSchoolLoading, setChangeSchoolLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  return (
    <div className="text-center">
      {/* eslint-disable-next-line array-callback-return */}
      {operations.map((x: any, index: number) => {
        const { type, _func, title, idField, authId } = x;

        if (type === 'EDIT') {
          return (
            <AuthButton className="operation-button" key={index} authId={authId} onClick={() => _handleEdit(record)}>
              {title || '编辑'}
            </AuthButton>
          );
        }

        if (type === 'DELETE') {
          return (
            <AuthButton
              key={index}
              loading={deleteLoading}
              authId={authId}
              onClick={() =>
                _showDeleteConfirm({
                  handleOk: async () => {
                    setDeleteLoading(true);
                    const res = await _func({ id: _get(record, idField) });
                    if (_get(res, 'code') === 200) {
                      refreshTable();
                    }
                    setDeleteLoading(false);
                  },
                })
              }
              className="operation-button"
            >
              {title || '删除'}
            </AuthButton>
          );
        }

        if (type === 'DETAIL') {
          return (
            <AuthButton authId={authId} key={index} onClick={() => _handleDetail(record)} className="operation-button">
              详情
            </AuthButton>
          );
        }

        if (type === 'CHANGE_SCHOOL') {
          return (
            <AuthButton
              loading={changeSchoolLoading}
              authId={authId}
              key={index}
              className="operation-button"
              onClick={() => {
                confirm({
                  title: `请确认${_get(record, 'name')}要转校？`,
                  icon: <ExclamationCircleOutlined />,
                  content: '',
                  okText: '确定',
                  okType: 'danger',
                  cancelText: '取消',
                  async onOk() {
                    setChangeSchoolLoading(true);
                    const res = await _func({
                      sid: _get(record, 'sid'),
                      schoolid: _get(record, 'schoolid'),
                    });
                    if (_get(res, 'code') === 200) {
                      refreshTable();
                    }
                    setChangeSchoolLoading(false);
                  },
                });
              }}
            >
              转校
            </AuthButton>
          );
        }
        if (type === 'REGISTER') {
          return (
            <AuthButton
              loading={registerLoading}
              authId={authId}
              key={index}
              onClick={async () => {
                setRegisterLoading(true);
                const res = await _func({ id: _get(record, idField) });
                if (_get(res, 'code') === 200) {
                  refreshTable();
                }
                setRegisterLoading(false);
              }}
              className="operation-button"
            >
              {title || '备案'}
            </AuthButton>
          );
        }
      })}
    </div>
  );
}
