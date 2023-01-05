import { useState } from 'react';
import { Modal, message, Button, Row } from 'antd';
import { _bindCard } from './_api';
import { Loading } from 'components';
import { Auth, _get } from 'utils';
import StudentInfo from '../studentCardMaking/StudentInfo';
import bindCardCommon from 'utils/bindCard';

export default function BindIdCard(props: any) {
  const {
    onCancel,
    onOk,
    currentRecord,
    idCardId,
    certNum,
    loading,
    setNoSoftWareVisible,
    customSchoolId = Auth.get('schoolId'),
    isTheory = false,
    practicalSchoolId,
  } = props;
  let physicId = idCardId; //物理卡号
  let certId = certNum; //身份证号
  const [btnLoading, setBtnLoading] = useState(false);
  console.log(physicId, certId, 'student0');
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
    console.log(physicId, certId, 'student1');
    if (_get(currentRecord, 'idcard', '') !== certId) {
      setBtnLoading(false);
      return message.error('身份证信息不一致');
    }

    const query = {
      sid: _get(currentRecord, 'sid'),
      certCardNum: physicId,
      userid: Auth.get('userId'),
      certNum: certId,
    };
    const res = await _bindCard(query);
    if (_get(res, 'code') === 200) {
      onOk();
    }
    setBtnLoading(false);
  }

  return (
    <Modal
      getContainer={false}
      visible
      width={800}
      maskClosable={false}
      onCancel={onCancel}
      footer={null}
      title="绑定二代身份证"
    >
      <div style={{ background: '#fef4e4', color: '#E6A23C' }}>绑定身份证前请将身份证放置于远方读卡器读卡区</div>
      {loading && <Loading tip={'正在读卡'} />}
      {!loading && (
        <StudentInfo
          sid={_get(currentRecord, 'sid')}
          customSchoolId={Auth.get('schoolId')}
          isTheory={isTheory}
          practicalSchoolId={practicalSchoolId}
        />
      )}
      <Row justify={'end'}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" className="ml20" onClick={bindIdCard} loading={btnLoading} disabled={loading}>
          绑定二代证
        </Button>
      </Row>
    </Modal>
  );
}
