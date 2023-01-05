import { Tabs, Drawer, Button, message } from 'antd';
import { _getBaseInfo, _getImg } from 'api';
import { _get } from 'utils';
import SchoolImg from './SchoolImg';
import BasicInfo from './BasicInfo';
import SchoolBriefIntro from './SchoolBriefIntro';
import { useFetch, useRequest } from 'hooks';
import { _getDesc, _setDesc } from './_api';
import { useState } from 'react';

const { TabPane } = Tabs;

export default function Details(props: any) {
  const { onCancel, currentRecord, isEdit = false, onOk } = props;
  const [schoolBriefValue, setSchoolBriefValue] = useState('');

  const { run, loading } = useRequest(_setDesc, {
    onSuccess: onOk,
  });

  useFetch({
    request: _getDesc,
    query: { companyId: _get(currentRecord, 'id', '') },
    callback: (data: any) => {
      setSchoolBriefValue(data);
    },
  });

  return (
    <>
      <Drawer
        visible
        destroyOnClose
        width={1300}
        title={'驾校详情'}
        onClose={onCancel}
        footer={
          isEdit ? (
            <>
              <Button onClick={onCancel} className="mr20">
                取消
              </Button>
              <Button
                loading={loading}
                type="primary"
                onClick={() => {
                  if (schoolBriefValue.length > 300) {
                    return message.error('驾校简介内容需在300字符以内');
                  }
                  run({
                    companyId: _get(currentRecord, 'id', ''),
                    desc: schoolBriefValue,
                  });
                }}
              >
                确定
              </Button>
            </>
          ) : null
        }
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="备案信息" key="1">
            <BasicInfo currentRecord={currentRecord} />
          </TabPane>
          <TabPane tab="驾校简介" key="2">
            <SchoolBriefIntro
              currentId={_get(currentRecord, 'id', '')}
              isEdit={isEdit}
              schoolBriefValue={schoolBriefValue}
              setSchoolBriefValue={setSchoolBriefValue}
            />
          </TabPane>
          <TabPane tab="校园风貌" key="3">
            <SchoolImg currentId={_get(currentRecord, 'id', '')} isEdit={isEdit} />
          </TabPane>
        </Tabs>
      </Drawer>
    </>
  );
}
