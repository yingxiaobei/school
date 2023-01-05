import React, { useState } from 'react';
import { Drawer, Button } from 'antd';
import { useTablePro, useHash, useFetch } from 'hooks';
import { _get } from 'utils';
import { _getExamResultList, _getListExamMark } from '../_api';
import './style.scss';
import { CustomTable } from 'components';

interface IProps {
  sid: string;
}

const LicenseInstrument = (props: IProps) => {
  const { sid } = props;
  const [examList, setExamList] = useState([]);
  const { tableProps, isAddOrEditVisible, _switchIsAddOrEditVisible, setCurrentRecord, currentRecord } = useTablePro({
    request: _getExamResultList,
    extraParams: {
      stuId: sid,
      limit: 10,
      page: 1,
    },
  });

  const examStatusHash = useHash('stu_exam_is_qualified_type'); // 供职状态
  const projectHash = useHash('robot_exam_mark_item_type'); // 项目名称
  const markHash = useHash('robot_exam_mark_type'); // 扣分名称

  const columns: any = [
    {
      title: '时间',
      dataIndex: 'timeDesc',
    },
    {
      title: '结果',
      dataIndex: 'isQualified',
      render: (text: any) => examStatusHash[text],
    },
    {
      title: '分数',
      dataIndex: 'score',
    },
    {
      title: '详情',
      dataIndex: 'stu_idcard',
      render: (_: void, record: any) => (
        <Button
          onClick={() => {
            _switchIsAddOrEditVisible();
            setCurrentRecord(record);
          }}
          className="operation-button"
        >
          查看
        </Button>
      ),
    },
  ];

  const columnDetail: any = [
    {
      title: '时间',
      dataIndex: 'markTime',
    },
    {
      title: '扣分项',
      dataIndex: 'itemName',
      render: (text: string) => projectHash[text],
    },
    {
      title: '扣分内容',
      dataIndex: 'markName',
      render: (text: string) => markHash[text],
    },
    {
      title: '扣分值',
      dataIndex: 'markPoint',
    },
  ];

  useFetch({
    request: _getListExamMark,
    query: { examId: currentRecord?.id },
    depends: [currentRecord?.id],
    // requiredFields: [currentRecord?.id],
    callback: async (data: any) => {
      setExamList(data);
    },
  });

  return (
    <>
      <CustomTable {...tableProps} columns={columns} rowKey="id" />
      <Drawer
        getContainer={false}
        placement="right"
        width={600}
        onClose={_switchIsAddOrEditVisible}
        visible={isAddOrEditVisible}
      >
        <div className="sealContent">
          {_get(currentRecord, 'score', 100)}分
          <div
            className={
              examStatusHash[_get(currentRecord, 'isQualified', '1')] === '合格'
                ? 'sealResultSuccess'
                : 'sealResultFail'
            }
          >
            {examStatusHash[_get(currentRecord, 'isQualified', '1')]}
          </div>
        </div>
        <p style={{ textAlign: 'center' }}> {_get(currentRecord, 'timeDesc', '1')}</p>
        <h3>扣分明细</h3>
        <CustomTable dataSource={examList} columns={columnDetail} rowKey="id" />
      </Drawer>
    </>
  );
};

export default LicenseInstrument;
