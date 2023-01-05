import { useState } from 'react';
import { Modal, Button, Alert } from 'antd';
import { _getVersionList, _deleteVersion } from './_api';
import { useFetch, useHash, useRequest } from 'hooks';
import { _get } from 'utils';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { CustomTable } from 'components';

const { confirm } = Modal;

export default function VersionRecord(props: any) {
  const {
    currentRecord,
    onCancel,
    _switchReleaseVisible,
    _switchDetailVisible,
    setCarFid,
    setIsCarDetail,
    ignore,
    forceUpdate,
  } = props;
  const [currentRec, setCurrentRec] = useState(null);
  const { isLoading, data } = useFetch({
    request: _getVersionList,
    query: {
      carid: _get(currentRecord, 'carid'),
      type: _get(currentRecord, 'type', '1'),
    },
    depends: [ignore],
  });

  const tableData = _get(data, 'versionRecode', []).map((item: any, index: number) => {
    return { ...item, index: index + 1 };
  });

  const enableflagHash = useHash('enableflag_type');

  const { loading: deleteLoading, run } = useRequest(_deleteVersion, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const columns = [
    {
      title: '当前围栏版本',
      dataIndex: 'version',
      width: 70,
    },
    {
      title: '发版时间',
      dataIndex: 'createtime',
      width: 70,
    },
    {
      title: '操作人',
      dataIndex: 'createoptor',
      width: 70,
    },
    {
      title: '状态',
      width: 70,
      dataIndex: 'enableflag',
      render: (enableflag: string) => enableflagHash[enableflag],
    },
    {
      title: '操作',
      width: 70,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <Button
            className="operation-button"
            type="primary"
            ghost
            size="small"
            onClick={() => {
              _switchDetailVisible();
              setCarFid(_get(record, 'fid'));
              setIsCarDetail(false);
            }}
          >
            详情
          </Button>
          {_get(record, 'enableflag') === '1' && (
            <Button
              loading={_get(currentRec, 'fid') === _get(record, 'fid') && deleteLoading}
              onClick={() => {
                confirm({
                  title: `请确认是否要注销？`,
                  icon: <ExclamationCircleOutlined />,
                  content: '',
                  okText: '确定',
                  okType: 'danger',
                  cancelText: '取消',
                  async onOk() {
                    setCurrentRec(record);
                    run({ fid: _get(record, 'fid') });
                  },
                });
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              注销
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal visible width={800} title={'版本记录'} maskClosable={false} onCancel={onCancel} footer={null}>
      <div className="mb20">{_get(data, 'title')}</div>

      <Button type="primary" onClick={_switchReleaseVisible} className="mb20">
        发布新版本
      </Button>

      {_get(currentRecord, 'type') === '1' && (
        <Alert message="当车辆未添加特定围栏版本，默认使用驾校通用围栏" type="warning" className="mb20" />
      )}

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={tableData}
        rowKey={(record: any) => _get(record, 'fid')}
        pagination={false}
      />
    </Modal>
  );
}
