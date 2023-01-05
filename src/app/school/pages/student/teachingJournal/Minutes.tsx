import { useState } from 'react';
import { message, Select, Table, Alert, Tooltip } from 'antd';
import { _get } from 'utils';
import { useFetch, useHash, useTablePagination, useVisible, useForceUpdate, useOptions, useSearch } from 'hooks';
import { _getMinutes, _setMinState, _getTrainningTimeMinPatch } from './_api';
import Reason from './Reason';
import { AuthButton, CustomTable, PopoverImg } from 'components';
import moment from 'moment';
import { QuestionCircleOutlined } from '@ant-design/icons';
const crstateColor = ['black', 'green', 'red'];

interface MinutesProps {
  currentRecord: any;
  isTrainingDetail?: boolean;
}

export default function Minutes({ currentRecord, isTrainingDetail = false }: MinutesProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [pagination, setPagination, tablePagination] = useTablePagination({
    initPageSizeOptions: [10, 20, 50, 100, 300], //增加每页
  });
  const [visible, _switchVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const [rowKeys, setRowKeys] = useState<any>([]);

  const [search, _handleSearch] = useSearch();
  // const [isLoading, setIsLoading] = useState(false);

  const isShow = ['0', '1', '2', '3', '4', '5'].includes(_get(currentRecord, 'checkstatus_jg'));

  const traincodeHash = useHash('subject_type'); // 签到状态
  const crstateMinutesHash = useHash('min_crstate_type'); // 是否有效
  const subjectcodeHash = useHash('trans_part_type'); // 培训阶段
  const reviewTypeHash = useHash('review_type'); // 培训阶段

  const options = [{ value: '', label: '是否有效(全部)' }, ...useOptions('min_crstate_type')];
  const renderColor = (text: string, record: any) => (
    <span style={record?.crstate === '2' ? { color: 'red' } : {}}>{text}</span>
  );
  const commonColumns = [
    {
      title: '培训时间',
      width: 150,
      dataIndex: 'dev_time',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '培训照片',
      dataIndex: 'photos',
      width: 70,
      render: (photos: any) => {
        return photos.map((x: any, index: number) => (
          <PopoverImg
            src={_get(x, 'url', '')}
            imgStyle={{ width: 60, height: 60, margin: '0 20px 20px 0' }}
            key={index}
          />
        ));
      },
    },
    {
      title: '照片数',
      dataIndex: 'photos',
      width: 80,
      render: (photos: any, record: any) => renderColor(photos.length, record),
    },
    {
      title: '培训阶段',
      dataIndex: 'subjectcode',
      width: 80,
      render: (crstate: any, record: any) => renderColor(subjectcodeHash[crstate], record),
    },
    {
      title: '培训类型',
      dataIndex: 'traincode',
      width: 80,
      render: (traincode: any, record: any) => renderColor(traincodeHash[traincode], record),
    },
    {
      title: (
        <>
          {'是否有效 '}
          <Tooltip
            placement="bottom"
            title={
              <>
                <div> 黑色：待评判</div>
                <div> 红色：无效</div>
                <div> 绿色：有效</div>
              </>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: 'crstate',
      width: 80,
      render: (crstate: any) => (
        <span style={{ color: crstateColor[Number(crstate)] }}>{crstateMinutesHash[crstate]}</span>
      ),
    },
    {
      title: '无效原因',
      width: 80,
      dataIndex: 'reason',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '发动机转速',
      width: 60,
      ellipsis: false,
      dataIndex: 'rpm',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '培训里程（公里）',
      width: 70,
      ellipsis: false,
      dataIndex: 'mileage',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '最高时速',
      width: 60,
      ellipsis: false,
      dataIndex: 'maxspeed',
      render: (text: string, record: any) => renderColor(text, record),
    },

    {
      title: '行驶速度',
      width: 60,
      ellipsis: false,
      dataIndex: 'speed',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: 'GPS速度',
      width: 60,
      ellipsis: false,
      dataIndex: 'gps_speed',
      render: (text: string, record: any) => renderColor(text, record),
    },

    {
      title: '经度',
      width: 80,
      dataIndex: 'longitude',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '纬度',
      width: 80,
      dataIndex: 'latitude',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '采集时间',
      width: 140,
      dataIndex: 'create_date',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '审核类型',
      width: 80,
      dataIndex: 'review_type',
      render: (review_type: any, record: any) => renderColor(reviewTypeHash[review_type], record),
    },
  ];

  const rowIndex = {
    title: '序号',
    width: 40,
    fixed: 'left',
    dataIndex: 'index',
    render: (_: any, record: any, index: number) => {
      let color = (index + 1) % 15 === 0 ? { color: '#F3302B' } : {}; //对应15的倍数的序号，显示颜色标红
      return <div style={color}>{index + 1}</div>;
    },
  };

  const columns = isTrainingDetail ? [rowIndex, ...commonColumns] : commonColumns;

  const { isLoading, data } = useFetch({
    request: _getMinutes,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      classid: _get(currentRecord, 'classid'),
      signstarttime: _get(currentRecord, 'signstarttime', ''),
      // 增加 有效/无效 筛选
      crstate: _get(search, 'crstate'),
    },
    depends: [ignore, pagination.current, pagination.pageSize, currentRecord],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      const rowKeysArr: any[] = [];
      for (let i = 0; i < _get(data, 'rows.length', 0); i++) {
        rowKeysArr.push(data.rows[i].trainid);
      }
      setRowKeys(rowKeysArr);
      setSelectedRowKeys([]);
    },
  });

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  async function _handleEffective() {
    const query = {
      classid: _get(currentRecord, 'classid'),
      crstate: '1',
      signstarttime: _get(currentRecord, 'signstarttime'),
      subjectcode: _get(currentRecord, 'subjectcode'),
      trainids: selectedRowKeys.join(','),
    };
    const res = await _setMinState(query, {
      menuId: 'trainingDetailReview',
      elementId: 'student/trainingDetailReview:btn4',
    });
    if (_get(res, 'code') === 200) {
      forceUpdate();
      setSelectedRowKeys([]);
    }
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setSelectedRowKeys([]);
  }

  return (
    <>
      {visible && (
        <Reason
          onCancel={_switchVisible}
          onOk={_handleOk}
          query={{
            classid: _get(currentRecord, 'classid'),
            crstate: '2',
            signstarttime: _get(currentRecord, 'signstarttime'),
            subjectcode: _get(currentRecord, 'subjectcode'),
            trainids: selectedRowKeys.join(','),
          }}
          invalidReasonWay={'section'}
        />
      )}
      {/* 分钟学时 */}
      {/* 和原型保持一致的 不需要按钮 */}
      <Select
        options={options}
        style={{ margin: '0 10px 16px 0', width: '176px' }}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        onChange={(value) => {
          _handleSearch('crstate', value);
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
        value={_get(search, 'crstate', '')}
      />
      {/* 待上传/已上传/已初审/已复审/上传失败/上传中  展示【设为有效】和【设为无效】
【电子教学日志上传中】状态，两个按钮都不展示 */}
      {isShow && (
        <>
          <AuthButton
            authId={isTrainingDetail ? 'student/trainingDetailReview:btn4' : 'student/teachingJournal:btn15'}
            disabled={selectedRowKeys.length === 0}
            type="primary"
            style={{ margin: '0 20px 20px 0' }}
            onClick={() => {
              _handleEffective();
            }}
          >
            分钟设为有效
          </AuthButton>
          <AuthButton
            authId={isTrainingDetail ? 'student/trainingDetailReview:btn5' : 'student/teachingJournal:btn16'}
            disabled={selectedRowKeys.length === 0}
            type="primary"
            style={{ margin: '0 20px 20px 0' }}
            onClick={() => {
              _switchVisible();
            }}
          >
            分钟设为无效
          </AuthButton>
        </>
      )}

      <AuthButton
        authId="student/teachingJournal:btnMinutes"
        type="primary"
        style={{ margin: '0 20px 20px 0' }}
        onClick={async () => {
          const res = await _getTrainningTimeMinPatch({
            classid: _get(currentRecord, 'classid', ''),
            year: moment(_get(currentRecord, 'signstarttime')).format('YYYY'),
          });
          if (_get(res, 'code', '') === 200) {
            message.success(_get(res, 'message', ''));
          } else {
            message.error(_get(res, 'message', ''));
          }
        }}
      >
        补传分钟学时
      </AuthButton>
      {isTrainingDetail && (
        <AuthButton
          authId="student/trainingDetailReview:btn6"
          disabled={selectedRowKeys.length === 0}
          type="primary"
          style={{ margin: '0 20px 20px 0' }}
          onClick={() => {
            let newSelect: any[] = [];
            rowKeys.forEach((item: any) => {
              if (!selectedRowKeys.includes(item)) {
                newSelect.push(item);
              }
            });
            setSelectedRowKeys(newSelect);
          }}
        >
          反选
        </AuthButton>
      )}
      <Alert
        message="学员学时最终以监管审核有效学时为准，会存在监管审核学时小于分钟有效学时的现象"
        type="warning"
        showIcon
        className="mb10"
      />
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        scroll={isTrainingDetail ? { x: 800, y: 500 } : { x: 1600, y: document.body.clientHeight - 300 }}
        rowSelection={
          isShow
            ? {
                type: 'checkbox',
                ...rowSelection,
                selections: [
                  Table.SELECTION_ALL, //全选
                  Table.SELECTION_INVERT, //反选
                ],
              }
            : undefined
        }
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'trainid')}
        pagination={tablePagination}
        showSerial={true}
      />
    </>
  );
}
