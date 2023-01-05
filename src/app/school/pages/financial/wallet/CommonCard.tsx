import { Avatar, Tooltip } from 'antd';
import { getBankImg, getBg, getStatus, getStatusColor } from './utils';
import { _get } from 'utils';
import './index.scss';

interface IProps {
  title: string;
  children: any;
  openedStatus: any;
  isPingAnSecond?: boolean;
  bankName: string;
  isOpening?: boolean;
  item: any;
}

export default function CommonCard(props: IProps) {
  const { title, children, openedStatus, isPingAnSecond = false, bankName, isOpening = false, item } = props;
  /* 
  openedStatus:
    not_opened
    opened
  */
  const opened = openedStatus === 'opened';

  const statusText = _get(item, 'status') === 3 ? '失败' : '审核中';
  const status = getStatus(openedStatus, opened, isPingAnSecond, isOpening, statusText);
  const bgColor = getBg(openedStatus, opened, isPingAnSecond, isOpening);

  const titleBg = { background: `url(${bgColor})`, backgroundSize: '100% 100%' };
  const statusColor = isPingAnSecond
    ? getStatusColor(openedStatus)
    : opened
    ? '#fc6021'
    : isOpening
    ? 'green'
    : '#22BAAF';
  const right = statusColor === 'green' ? '-4px' : '0px';
  const statusStyle = { color: statusColor, right: right, bottom: '30px' };

  const isShow = status !== '';

  return (
    <div className="mt20 mr20 commonCard flex direction-col">
      <div className="head relative" style={titleBg}>
        <span className="title">
          <Avatar src={getBankImg(bankName)} size={40} className="mr20" />
          <Tooltip placement="top" title={title}>
            <span className="wallet-title-span">{title}</span>
          </Tooltip>
        </span>
        {isShow && <div className="triangle"></div>}
        <span className="status" style={statusStyle}>
          {status}
        </span>
      </div>
      <div className="content flex1 flex-box direction-col">{children}</div>
    </div>
  );
}
