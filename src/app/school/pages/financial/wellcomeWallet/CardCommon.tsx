import { Button, Row, Select } from 'antd';
import { useState, useContext } from 'react';
import { Auth, formatTime, get30DaysAgoNotCrossYear, _get } from 'utils';
import BALANCE from 'statics/images/iconBalance.png';
import { useVisible } from 'hooks';
import RechargeRecord from './RechargeRecord';
import Recharge from './Recharge';
import { PayType } from './PayType';
import Preview from './Preview';
import OfflinePayed from './OfflinePayed';
import RechargeRecordDetail from './RechargeRecordDetail';
import { ConsumeRecord } from './ConsumeRecord';
import { _queryApplicationRecharge } from './_api';
import moment from 'moment';
import QrCodeModal from './QrCodeModal';
import CardReturn from './CardReturn';
import { AuthButton } from 'components';
import GlobalContext from 'globalContext';
const { Option } = Select;

export function CardCommon(props: any) {
  const { data, subAccountType, accountBalance, updatePage } = props;
  const price = Number(accountBalance).toFixed(2);
  const priceArr = price.split('.');
  const [rechargeVisible, setRechargeVisible] = useVisible();
  const [rechargeRecordVisible, setRechargeRecordVisible] = useVisible();
  const [consumRecordVisible, setConsumRecordVisible] = useVisible();
  const [payTypeVisible, setPayTypeVisible] = useVisible();
  const [rechargeValues, setRechargeValues] = useState();
  const [offlinePayedVisible, setOfflinePayedVisible] = useVisible();
  const [cardReturnVisible, setCardReturnVisible] = useVisible();
  const [previewVisible, setPreviewVisible] = useVisible();
  const [richtextContent, setRichTextContent] = useState();
  const [offlinePayData, setOfflinePayData] = useState({});
  const [rechargeNumber, setRechargeNumber] = useState('');
  const [detailVisible, _switchDetailsVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState({});
  const [qrCodeVisible, setQrCodeVisible] = useVisible();
  const { $elementAuthTable } = useContext(GlobalContext);
  const [src, setSrc] = useState();
  const getDetailRecord = async (rechargeNumber: string) => {
    const startTime = get30DaysAgoNotCrossYear();
    const res = await _queryApplicationRecharge({
      page: 1,
      limit: 1,
      rechargeNumber,
      subAccountType,
      startTime: formatTime(startTime, 'DATE'),
      endTime: formatTime(moment(), 'DATE'),
    });
    return _get(res, 'data.rechargeApplyInfos.0', {});
  };
  const [selectValue, setSelectValue] = useState('');
  return (
    <div className="flex-box mt20 direction-col cardDiv">
      {qrCodeVisible && (
        <QrCodeModal
          src={src}
          currentRecord={currentRecord}
          setQrCodeVisible={setQrCodeVisible}
          _switchDetailsVisible={_switchDetailsVisible}
          getDetailRecord={getDetailRecord}
        />
      )}
      {rechargeVisible && (
        <Recharge
          onCancel={() => {
            setRechargeVisible();
            updatePage();
            setSelectValue('');
          }}
          data={data}
          setPayTypeVisible={setPayTypeVisible}
          setRechargeValues={setRechargeValues}
        />
      )}
      {detailVisible && (
        <RechargeRecordDetail
          currentRecord={currentRecord}
          onCancel={() => {
            _switchDetailsVisible();
            updatePage();
          }}
          onOk={() => {
            _switchDetailsVisible();
          }}
        />
      )}
      {rechargeRecordVisible && (
        <RechargeRecord
          subAccountType={subAccountType}
          onCancel={() => {
            setRechargeRecordVisible();
            updatePage();
            setSelectValue('');
          }}
        />
      )}
      <CardReturn
        visible={cardReturnVisible}
        onCancel={() => {
          setCardReturnVisible();
          setSelectValue('');
        }}
        accountInfo={{
          type: _get(data, 'subAccountName'),
          account: _get(data, 'accountName'),
          subAccountType: _get(data, 'subAccountType'),
        }}
      />
      {payTypeVisible && (
        <PayType
          onCancel={() => {
            setPayTypeVisible();
            updatePage();
          }}
          rechargeValues={rechargeValues}
          subAccountType={subAccountType}
          onOk={async (data: any, rechargeNumber: string, type: string) => {
            if (type === '1') {
              setSrc(_get(data, 'data.qrCode'));
              const record = await getDetailRecord(rechargeNumber);
              setCurrentRecord(record);
              setQrCodeVisible();
              setPayTypeVisible();
              return;
            }
            setRichTextContent(_get(data, 'data.execData'));
            var myWindow = window.open('', '', 'width=1000,height=800');
            const str = _get(data, 'data.execData');
            const str1 = str.replace('<form', '<form accept-charset="utf-8" '); //解决传参中文编码出错

            myWindow?.document.write(str1);
            setPayTypeVisible();
            updatePage();
            // setPreviewVisible();
            var loop = setInterval(async function () {
              if (myWindow?.closed) {
                clearInterval(loop);
                console.log('closed');
                const record = await getDetailRecord(rechargeNumber);
                setCurrentRecord(record);
                _switchDetailsVisible();
              }
            }, 1000);
          }}
          setOfflinePayData={setOfflinePayData}
          setRechargeNumber={setRechargeNumber}
          setOfflinePayedVisible={setOfflinePayedVisible}
        />
      )}

      {previewVisible && <Preview richtextContent={richtextContent} onCancel={setPreviewVisible} />}
      {offlinePayedVisible && (
        <OfflinePayed
          subAccountType={subAccountType}
          offlinePayData={offlinePayData}
          onCancel={() => {
            setOfflinePayedVisible();
            updatePage();
          }}
          rechargeNumber={rechargeNumber}
          onOk={async () => {
            setOfflinePayedVisible();
            const record = await getDetailRecord(rechargeNumber);
            setCurrentRecord(record);
            _switchDetailsVisible();
          }}
          rechargeValues={rechargeValues}
        />
      )}

      {consumRecordVisible && <ConsumeRecord onCancel={setConsumRecordVisible} subAccountType={subAccountType} />}

      <Select
        style={{ position: 'absolute', right: '20%', top: '20vh' }}
        onChange={(value: string) => {
          if (value === 'rechargeRecord') {
            setRechargeRecordVisible();
            return;
          }
          if (value === 'consumRecord') {
            setConsumRecordVisible();
            return;
          }
          if (value === 'cardReturn') {
            setCardReturnVisible();
            return;
          }
        }}
        value={selectValue}
      >
        <Option value="">查看历史记录</Option>
        {$elementAuthTable['financial/wellcomeWallet:btn2'] ? <Option value="rechargeRecord">充值记录</Option> : null}
        {$elementAuthTable['financial/wellcomeWallet:btn3'] ? <Option value="consumRecord">消费记录</Option> : null}
        {!$elementAuthTable['financial/wellcomeWallet:btn4'] || _get(data, 'cardReturnDisable') ? null : (
          <Option value="cardReturn">退卡记录</Option>
        )}
      </Select>

      <Row className="mt20 mb20 bold flex color-primary fz50 baseline">
        <img src={BALANCE} className="mr20" alt="" />
        <span>{_get(priceArr, '0', 0)}.</span>
        <span>{_get(priceArr, '1', 0)}</span>
      </Row>
      <Row className="mt20 mb20 fz18 color-666666">剩余可用</Row>
      <div className="flex align-center mt60">
        <AuthButton
          authId="financial/wellcomeWallet:btn1"
          type="primary"
          className="mb20 mt20 mr20 width-100"
          onClick={setRechargeVisible}
          insertWhen={_get(data, 'isdirectly') == '1'} //isdirectly 是否自营：0否，1是
        >
          充值
        </AuthButton>
      </div>
    </div>
  );
}
