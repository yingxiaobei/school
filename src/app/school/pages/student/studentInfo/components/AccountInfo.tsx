import { Row, Alert } from 'antd';
import { _get } from 'utils';
import { useFetch, useHash } from 'hooks';
import { _getSchoolInfo } from '../_api';
import './style.scss';
import { IF, Loading } from 'components';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { colorChoose } from './DiffColorClasses';

export default function AccountInfo(props: {
  sid: string;
  isShowTip?: boolean;
  setActiveKey: (activeKey: string) => void;
}) {
  const stuBankaccountflagTypeHash = useHash('stu_bankaccountflag_type');
  const { sid, isShowTip, setActiveKey } = props;
  const { data, isLoading } = useFetch({
    request: _getSchoolInfo,
    query: { sid },
  });
  const color = data ? colorChoose(data) : 'black';
  console.log('color', color);
  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div className="accountInfo">
            {/* <div className="info fz16">
              <div>
                <span>开户行</span>
                <span>{data?.bankchannelname || '暂无信息'}</span>
              </div>

              <div>
                <span>账号</span>
                <span>{data?.acctNo || '暂无信息'}</span>
              </div>
              <div>
                <span>状态</span>
                <span>{stuBankaccountflagTypeHash[_get(data, 'bankaccountflag')] || '未开户'}</span>
              </div>
              <div>
                <span>状态更新时间</span>
                <span>{data?.openTime || '暂无信息'}</span>
              </div>
            </div> */}
            <div className="accountData">
              <div className="chargeMoney">
                <div className="chargeBorder" style={{ borderColor: color }}>
                  <p className="fz12">资金监管金额</p>
                  <p className="fz24 bold">
                    ￥ {data?.packageAmount ? Number(data?.packageAmount).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
              <div className="money">
                <div className="over">
                  <p>充值总额</p>
                  <p className="fz24 bold">
                    ￥ {data?.rechargeAmount ? Number(data?.rechargeAmount).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="under">
                  <div style={{ borderBottom: ' solid', borderBottomColor: color }}>
                    <p>已结算总额</p>
                    <p className="fz22 bold">
                      ￥ {data?.settledAmount ? Number(data?.settledAmount).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p>
                      已退款总额 &nbsp;
                      {data?.stuchargemode === '2' || data?.stuchargemode === '1' ? (
                        <span style={{ color: 'red' }}>(退到驾校)</span>
                      ) : null}
                    </p>
                    <p className="fz22 bold">￥ {data?.refundAmt ? Number(data?.refundAmt).toFixed(2) : '0.00'}</p>
                  </div>
                  <div style={{ display: 'flex', marginRight: 0 }}>
                    <div style={{ width: '50%' }}>
                      <p>当前余额</p>
                      <p className="fz22 bold">
                        ￥ {data?.currentBalance ? Number(data?.currentBalance).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div style={{ width: '50%', borderLeft: '#fff solid', opacity: '36%' }}>
                      <p>结算中金额</p>
                      <p className="fz22 bold">
                        ￥ {data?.inSettledAmount ? Number(data?.inSettledAmount).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isShowTip && (
              <Alert
                type="warning"
                showIcon
                description={
                  <span>
                    温馨提醒：当前页面展示学员最近一次签约或开户、更换班级之后的账户信息，完整的结算记录请到
                    <span
                      onClick={() => setActiveKey('5')}
                      style={{ color: PRIMARY_COLOR, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      详情-结算记录
                    </span>
                    页面中查询
                  </span>
                }
              />
            )}
          </div>
        }
      />
    </div>
  );
}
