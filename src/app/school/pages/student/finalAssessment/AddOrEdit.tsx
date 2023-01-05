import { useState } from 'react';
import { Drawer, Tabs } from 'antd';
import AddFinalAssessment from './AddFinalAssessment';
import AddWorkFinalAssessment from './AddWorkFinalAssessment';
import { _get, Auth } from 'utils';
import { _getCustomParam } from 'api';
import { useFetch } from 'hooks';

const { TabPane } = Tabs;

interface AddOrEditProps {
  onCancel: () => void;
  title: string;
  onOk: () => void;
  currentId?: string;
  isEdit: boolean;
  currentRecord: any;
  isVisibleWorkTab: boolean;
}

export default function AddOrEdit({
  onCancel,
  title,
  onOk,
  currentId,
  isEdit,
  currentRecord,
  isVisibleWorkTab,
}: AddOrEditProps) {
  const [paramValue, setParamValue] = useState('0');

  // 自定义数据
  const { data } = useFetch({
    request: _getCustomParam,
    query: { paramCode: 'source_assessment_scores', schoolId: Auth.get('schoolId') },
    callback: (data) => {
      setParamValue(_get(data, 'paramValue', '0'));
      // setParamValue('0');
    },
  });

  return (
    <Drawer destroyOnClose visible width={800} title={title} footer={null} onClose={onCancel}>
      <Tabs defaultActiveKey="1" style={{ height: 700 }}>
        {_get(currentRecord, 'subjectcode', '') !== '5' && ( // subjectcode:5 从业资格
          <TabPane tab="结业考核" key="1">
            <AddFinalAssessment
              onCancel={onCancel}
              onOk={onOk}
              currentId={currentId}
              isEdit={isEdit}
              paramValue={paramValue}
            />
          </TabPane>
        )}

        {/* {(!isEdit || _get(currentRecord, 'subjectcode') === '5') && isVisibleWorkTab && ( */}
        <TabPane tab="从业培训结业考核" key="2">
          <AddWorkFinalAssessment
            onCancel={onCancel}
            onOk={onOk}
            currentId={currentId}
            isEdit={isEdit}
            currentRecord={currentRecord}
            paramValue={paramValue}
          />
        </TabPane>
        {/* )} */}
      </Tabs>
    </Drawer>
  );
}
