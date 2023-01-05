import { useState } from 'react';
import { Button, Modal, Radio, Row } from 'antd';
import { useFetch } from 'hooks';
import { _getBaseInfo } from './_api';
import { Auth, _get } from 'utils';
import moment from 'moment';
import OpenClassTwoAccountForm from './OpenClassTwoAccountForm';
import { USER_CENTER_URL } from 'constants/env';

import { IF, Loading } from 'components';

interface IProps {
  onCancel: (params: boolean) => void;
  onOk: () => void;
  bankChannelId: string;
  setOpenAccountAgain(params: boolean): void;
  openAccountAgain: boolean;
}

export default function OpenClassTwoAccount(props: IProps) {
  const { onCancel, onOk, bankChannelId, setOpenAccountAgain, openAccountAgain } = props;
  const [openClassTwoAccountFormVisible, setOpenClassTwoAccountFormVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [componyName, setComponyName] = useState('');
  const [idCard, setIdcard] = useState('');

  // 驾校基本信息详情
  const { isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback: (data: any) => {
      setComponyName(_get(data, 'name', ''));
      setIdcard(_get(data, 'socialCredit', ''));
    },
  });

  return (
    <Modal visible title={'资料确认'} maskClosable={false} onCancel={() => onCancel(false)} footer={null} width={400}>
      <div>
        <IF
          condition={schoolDataLoading}
          then={<Loading />}
          else={
            <div className="wallet-openAccount-div">
              <Row>企业名称：{componyName}</Row>
              <Row>证件类型：社会信用代码</Row>
              <Row>证件号码：{idCard}</Row>
              <Row>有效期限：{moment().format('YYYY-MM-DD') + '-' + moment().add(5, 'year').format('YYYY-MM-DD')}</Row>
              <Radio
                className="whitespace-normal"
                onChange={(e) => {
                  e.target.checked ? setDisabled(false) : setDisabled(true);
                }}
              >
                已阅读并同意
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${USER_CENTER_URL}/h5/file/classTwoAccount?school=${componyName}`}
                >
                  《平安银行网上支付结算服务协议》
                </a>
              </Radio>
            </div>
          }
        />
      </div>
      <Row justify={'end'} className="mt10">
        <Button
          onClick={() => {
            onCancel(false);
            setOpenAccountAgain(false);
          }}
          className="mr20"
        >
          取消
        </Button>
        <Button
          type="primary"
          // loading={loading}
          disabled={disabled}
          onClick={() => {
            // run({ bankChannelId: bankChannel });
            setOpenClassTwoAccountFormVisible(true);
          }}
        >
          确认
        </Button>
      </Row>

      {openClassTwoAccountFormVisible && (
        <OpenClassTwoAccountForm
          _onCancel={onCancel}
          onCancel={setOpenClassTwoAccountFormVisible}
          onOk={onOk}
          bankChannelId={bankChannelId}
          setOpenAccountAgain={setOpenAccountAgain}
          openAccountAgain={openAccountAgain}
        />
      )}
    </Modal>
  );
}
