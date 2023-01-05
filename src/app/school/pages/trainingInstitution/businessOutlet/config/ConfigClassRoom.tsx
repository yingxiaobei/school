import { useState } from 'react';
import { Modal, Button } from 'antd';
import { _getClassList, _deleteClassRoom } from '../_api';
import { useFetch, useVisible, useForceUpdate, useConfirm, useHash, useRequest } from 'hooks';
import { _get } from 'utils';
import AddOrEditClassRoom from './AddOrEditClassRoom';
import { CustomTable } from 'components';

export default function ConfigClassRoom(props: any) {
  const { onCancel, currentId } = props;
  const [visible, _switchVisible] = useVisible();
  const [isEdit, setIsEdit] = useState(false);
  const [_showDeleteConfirm] = useConfirm();
  const [ignore, forceUpdate] = useForceUpdate();
  const [currentRecord, setCurrentRecord] = useState({});

  // FIXME:wy
  const { data = [] } = useFetch<any>({
    query: {
      sbnid: currentId,
    },
    depends: [ignore],
    request: _getClassList,
  });

  const tableData = data.map((item: any, index: number) => {
    return { ...item, index: index + 1 };
  });

  const { loading: deleteLoading, run } = useRequest(_deleteClassRoom, {
    onSuccess: () => {
      forceUpdate();
    },
  });
  const traincodeClassHash = useHash('traincode_type'); // 培训类型

  const columns = [
    {
      title: '教室号',
      dataIndex: 'classroom',
    },
    {
      title: '座位数',
      dataIndex: 'seatnum',
    },
    {
      title: '可培训类型',
      dataIndex: 'traincode',
      render: (traincode: any) =>
        traincode
          .split(',')
          .map((x: any) => traincodeClassHash[x])
          .join(),
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <Button
            onClick={() => {
              _switchVisible();
              setCurrentRecord(record);
              setIsEdit(true);
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            编辑
          </Button>
          <Button
            loading={_get(currentRecord, 'classid') === _get(record, 'classid') && deleteLoading}
            onClick={() =>
              _showDeleteConfirm({
                handleOk: async () => {
                  setCurrentRecord(record);
                  run({ classid: _get(record, 'classid'), sbnid: currentId });
                },
              })
            }
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal visible title={'配置教室'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Button
        type="primary"
        onClick={() => {
          _switchVisible();
          setCurrentRecord({});
          setIsEdit(false);
        }}
        className="mb20"
      >
        新增
      </Button>

      {visible && (
        <AddOrEditClassRoom
          currentRecord={currentRecord}
          sbnid={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑教室' : '新增教室'}
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            forceUpdate();
          }}
        />
      )}

      <CustomTable
        columns={columns}
        bordered
        dataSource={tableData}
        rowKey={(record: any) => _get(record, 'classid')}
      />
    </Modal>
  );
}
