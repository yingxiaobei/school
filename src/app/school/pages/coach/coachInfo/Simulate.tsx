import React, { useState } from 'react';
import { Modal, Select, message } from 'antd';
import { _getCoachList, _saveCoach, _getSimulateCoachDetail } from './_api';
import { useFetch } from 'hooks';
import { _get } from 'utils';
import _ from 'lodash';

interface IProps {
  onCancel(): void;
}

export default function Simulate(props: IProps) {
  const { onCancel } = props;
  const [cid, setCid] = useState('');
  const [confirmLoading, setconfirmLoading] = useState(false);
  const [coachOptionData, setCoachOptionData] = useState([]) as any;

  const { data: cidData } = useFetch({
    request: _getSimulateCoachDetail,
    callback: async (cidData: any) => {
      console.log(cidData);
      setCid(_get(cidData, 'cid'));
      setCoachOptionData([
        { label: `${_get(cidData, 'coachname')}[${_get(cidData, 'idcard')}]`, value: _get(cidData, 'cid') },
      ]);

      const res = await _getCoachList();

      const coachOptionData = _get(res, 'data.rows', []).map((item: { coachname: string; cid: string }) => {
        return {
          label: item.coachname,
          value: item.cid,
        };
      });
      setCoachOptionData(coachOptionData);
    },
  });

  return (
    <div>
      <Modal
        visible
        title={'模拟器教练员'}
        maskClosable={false}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        onOk={async () => {
          setconfirmLoading(true);
          const res = await _saveCoach(cid);
          setconfirmLoading(false);
          if (_get(res, 'code') === 200) {
            onCancel();
          } else {
            message.error(_get(res, 'message', ''));
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          模拟器默认教练员：
          <Select
            style={{ width: 300 }}
            options={coachOptionData}
            value={cid}
            onChange={(value: string) => {
              setCid(value);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
