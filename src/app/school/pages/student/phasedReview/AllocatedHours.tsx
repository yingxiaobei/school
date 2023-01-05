import { useState } from 'react';
import { Modal, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AuthButton, CustomTable, Search } from 'components';
import { FiltersType } from 'components/Search';
import { useAuth, useConfirm, useHash, useOptions, useTablePro } from 'hooks';
import {
  AllocatedHour,
  _allocateHours,
  _delAllocatedHours,
  _getAllocatedHoursFile,
  _reGenerateAllocatedHours,
  _uploadRecord,
} from './_api';
import { _get, _handleIdCard } from 'utils';
import { _getCoachList, _getStudentList } from 'api';
import styles from './index.module.css';
import InlineUpload from './InlineUpload';
import { PRIMARY_COLOR } from 'constants/styleVariables';

interface Props {
  onCancel: () => void;
  onOk: () => void;
}

function AllocatedHours({ onCancel, onOk }: Props) {
  const subjectHash = useHash('SchoolSubjectApply');
  const [_showConfirm] = useConfirm();
  const { search, _handleSearch, tableProps, _refreshTable } = useTablePro({
    request: _allocateHours,
  });
  const [uploading, setUploading] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const isShowUploadBtn = useAuth('student/phasedReview:btn18');

  // 删除配比学时
  async function handleDelAllocatedHours(id: string) {
    try {
      const response = await _delAllocatedHours(id);
      const code = _get(response, 'code');
      if (code === 200) {
        _refreshTable();
      }
    } catch (error) {
      console.error(error);
    }
  }
  // 上传学时证明
  async function handleUploadRecord({ id, fileUrl }: { id: string; fileUrl: string }) {
    try {
      const response = await _uploadRecord({ id, fileUrl });
      const code = _get(response, 'code');
      if (code === 200) {
        message.success('上传成功');
        _refreshTable();
      } else {
        const errMessage = _get(response, 'message');
        message.error(errMessage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }
  // 重新生成配比学时
  async function handleReGenerateAllocatedHours(id: string) {
    try {
      const response = await _reGenerateAllocatedHours(id);
      const code = _get(response, 'code');
      if (code === 200) {
        message.success('重新生成成功，请次日再到教学日志页面查看');
        _refreshTable();
      } else {
        const errMessage = _get(response, 'message');
        message.error(errMessage);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getAllocatedHoursFile(id: string) {
    try {
      const response = await _getAllocatedHoursFile(id);
      const code = _get(response, 'code');
      if (code === 200) {
        const data = _get(response, 'data');
        if (data) {
          window.open(data);
        }
      } else {
        const errMessage = _get(response, 'message');
        message.error(errMessage);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const columns: ColumnsType<AllocatedHour> = [
    {
      title: '报审类型',
      dataIndex: 'subjectCode',
      render: (subjectCode) => subjectHash[subjectCode],
      width: 100,
    },
    {
      title: '学号',
      dataIndex: 'studentNum',
      width: 160,
    },
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      width: 100,
    },
    {
      title: '证件号码',
      dataIndex: 'idCard',
      width: 180,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '学驾车型',
      dataIndex: 'trainType',
      width: 100,
    },
    {
      title: '教练姓名',
      dataIndex: 'coachName',
      width: 100,
    },
    {
      title: '学时证明文件',
      width: 100,
      render: (_, record) => (
        <>
          {_get(record, 'fileUrl', '') ? (
            <div
              onClick={() => {
                getAllocatedHoursFile(_get(record, 'id'));
              }}
              style={{
                color: PRIMARY_COLOR,
                cursor: 'pointer',
              }}
            >
              查看
            </div>
          ) : null}
        </>
      ),
    },
    {
      title: '操作',
      width: 260,
      render: (_, record) => (
        <>
          <AuthButton
            authId="student/phasedReview:btn17"
            insertWhen={_get(record, 'status') === 0}
            className="operation-button"
            onClick={() => {
              _showConfirm({
                title: '确认删除配比学时',
                handleOk() {
                  handleDelAllocatedHours(_get(record, 'id'));
                },
              });
            }}
          >
            删除配比学时
          </AuthButton>
          {isShowUploadBtn && _get(record, 'status') === 0 && (
            <span
              onClick={() => {
                setCurrentKey(_get(record, 'id'));
              }}
            >
              <InlineUpload
                typeRule={{
                  rule: ['image/jpeg', 'image/png'],
                  message: '仅支持jpg/jpeg/png格式的文件',
                  size: 10,
                }}
                callback={({ id: imgId }) => {
                  const fileUrl = imgId;
                  const id = _get(record, 'id');
                  handleUploadRecord({ id, fileUrl });
                }}
                uploading={uploading}
                setUploading={setUploading}
                currentKey={currentKey}
                uploadKey={_get(record, 'id')}
              />
            </span>
          )}

          <AuthButton
            authId="student/phasedReview:btn19"
            insertWhen={_get(record, 'status') === 1}
            className="operation-button"
            onClick={() => {
              // 新增 status == 2 状态为 生成中 不展示任何按钮
              handleReGenerateAllocatedHours(_get(record, 'id'));
            }}
          >
            重新生成配比学时
          </AuthButton>
        </>
      ),
    },
  ];

  const filters: FiltersType = [
    {
      type: 'SimpleSelectOfStudent',
      field: 'sid',
    },
    {
      type: 'SimpleSelectOfCoach',
      field: 'cid',
    },
    {
      type: 'Select',
      field: 'subjectCode',
      options: [{ value: '', label: '报审类型(全部)' }, ...useOptions('SchoolSubjectApply')],
      placeholder: '请选择报审类型',
    },
  ];

  return (
    <Modal
      footer={null}
      width={1000}
      bodyStyle={{ minHeight: 400 }} // 解决弹出日期选择框的时候或有抖动和位置的偏移
      title={'配比学时管理'}
      visible={true}
      maskClosable={false}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Search
        refreshTable={() => {
          _refreshTable();
        }}
        simpleStudentRequest={_getStudentList}
        simpleCoachRequest={_getCoachList}
        searchWidth={'small'}
        search={search}
        _handleSearch={_handleSearch}
        filters={filters}
      />
      <div className={styles['allocated-hours-table-wrapper']}>
        <CustomTable columns={columns} {...tableProps} rowKey="id" />
      </div>
    </Modal>
  );
}

export default AllocatedHours;
