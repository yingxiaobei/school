import { useState } from 'react';
import { Modal, message, Row, Button } from 'antd';
import { _bindCard } from './_api';
import { _get } from 'utils';
import { Loading } from 'components';
import CoachInfo from '../coachCard/CoachInfo';
import bindCardCommon from 'utils/bindCard';

interface IProps {
  onCancel(): void;
  onOk(): void;
  currentId?: string | null;
  currentRecord: object | null;
  idCardId: any;
  certNum?: string;
  loading: boolean;
  setNoSoftWareVisible(): void;
  type: string;
}

export default function BindIdCard(props: IProps) {
  const { onCancel, onOk, currentId, currentRecord, idCardId, certNum, loading, setNoSoftWareVisible, type } = props;
  let physicId = idCardId; //物理卡号
  let certId = certNum; //身份证号
  const [btnLoading, setBtnLoading] = useState(false);

  console.log(physicId, certId, 'coach0');
  async function bindIdCard() {
    setBtnLoading(true);
    if (!physicId || !certId) {
      const result = await bindCardCommon();
      setBtnLoading(false);
      if (result === 'update') {
        return setNoSoftWareVisible(); //弹出需下载软件提示窗
      }
      physicId = _get(result, 'cardNo', '');
      certId = _get(result, 'data.idNo', '');
    }
    console.log(physicId, certId, 'coach1');
    if (String(_get(currentRecord, 'idcard', '')) !== String(certId)) {
      setBtnLoading(false);
      return message.error('身份证信息不一致');
    }

    const query: { cid: string; type: string; certCardNum: string } = {
      cid: currentId as string,
      type: type,
      certCardNum: physicId,
    };

    let customHeader = {};
    if (type === '1') customHeader = { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn5' }; //教练员
    if (type === '2') customHeader = { menuId: 'assesserInfo', elementId: 'coach/assesserInfo:btn5' }; //考核员
    if (type === '3') customHeader = { menuId: 'securityOfficerInfo', elementId: 'coach/securityOfficerInfo:btn5' }; //安全员

    const res = await _bindCard(query, customHeader);
    if (_get(res, 'code') === 200) {
      onOk();
    }
    setBtnLoading(false);
  }

  return (
    <Modal
      visible
      width={800}
      maskClosable={false}
      getContainer={false}
      title="绑定二代身份证"
      footer={null}
      onCancel={onCancel}
    >
      <div style={{ background: '#fef4e4', color: '#E6A23C' }}>绑定身份证前请将身份证放置于远方读卡器读卡区</div>
      {loading && <Loading tip={'正在读卡'} />}
      {!loading && <CoachInfo cid={currentId as string} />}
      <Row justify={'end'}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" className="ml20" onClick={bindIdCard} loading={btnLoading} disabled={loading}>
          绑定二代证
        </Button>
      </Row>
    </Modal>
  );
}
