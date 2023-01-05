import { useEffect, useState } from 'react';
import { Row, Col, message } from 'antd';
import { _getClassRecordList, _playVideo } from './_api';
import { useTablePro, useHash } from 'hooks';
import { _get } from 'utils';
import { ReloadOutlined } from '@ant-design/icons';
import { CustomTable } from 'components';

export default function VehicleTrajectory(props: any) {
  const { currentRecord } = props;
  const [videoUrl, setVideoUrl] = useState('');
  const videoUploadStatusHash = useHash('video_upload_status');
  const videoAlarmTypeHash = useHash('video_alarm_type');

  const [selectedRows, setSelectedRows] = useState<any>([{ id: '', carSchoolId: '' }]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>('');

  const { tableProps, _refreshTable } = useTablePro({
    request: _getClassRecordList,
    initPageSize: 100,
    extraParams: {
      classid: _get(currentRecord, 'classid'),
      signstarttime: _get(currentRecord, 'signstarttime'),
    },
    cb: (data) => {
      setSelectedRows([_get(data, 'rows.0', [])]);
      setSelectedRowKeys([_get(data, 'rows.0.id', '')]);
    },
  });

  useEffect(() => {
    async function getVideo() {
      const res = await _playVideo({
        id: selectedRows[0].id,
        carSchoolId: selectedRows[0].db,
      });
      setVideoUrl(_get(res, 'data', ''));
      if (_get(res, 'code') !== 200) {
        message.error(_get(res, 'message', ''));
      }
    }
    if (selectedRows[0].id) {
      getVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, selectedRows);

  const columns = [
    { dataIndex: 'fileType', title: '视频类型', render: (fileType: any) => videoAlarmTypeHash[fileType] },
    { dataIndex: 'beginTime', title: '拍摄时间' },
    {
      dataIndex: 'status',
      title: '状态',
      width: 100,
      render: (status: any) => videoUploadStatusHash[status],
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    selectedRowKeys,
  };

  return (
    <>
      <Row gutter={20}>
        <Col span={12}>
          <video width="600" height="380" controls key={videoUrl}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        </Col>
        <Col span={12}>
          <ReloadOutlined
            style={{ fontSize: 24, marginBottom: 10 }}
            onClick={() => {
              _refreshTable();
            }}
          />
          <CustomTable
            scroll={{ y: 320 }}
            {...tableProps}
            columns={columns}
            rowKey="id"
            rowSelection={{
              type: 'radio',
              ...rowSelection,
            }}
          />
        </Col>
      </Row>
    </>
  );
}
