import { Tooltip } from 'antd';
import {
  FONT_COLOR_BLACK,
  FONT_COLOR_GRAY,
  FONT_COLOR_GREEN,
  FONT_COLOR_ORANGE,
  FONT_COLOR_RED,
} from 'constants/styleVariables';

type StuInfo = { stuchargemode: string; bankaccountflag: string; ispay: string; package_name: string };

interface Props {
  studentInfo: StuInfo;
}

const commonOverflowTextStyle: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export function colorChoose({
  stuchargemode,
  bankaccountflag,
  ispay,
}: {
  stuchargemode: string;
  bankaccountflag: string;
  ispay: string;
}) {
  if (stuchargemode === '0') return FONT_COLOR_BLACK;
  // 线下班级
  if (bankaccountflag === '0') return FONT_COLOR_RED;
  // 线上班
  if (bankaccountflag === '1' && ispay === '0') return FONT_COLOR_ORANGE;
  // 已开户 未充值
  if (bankaccountflag === '1' && ispay === '1') return FONT_COLOR_GREEN;
  // 已开户 已充值
  if (bankaccountflag === '2' || bankaccountflag === '3') return FONT_COLOR_GRAY;
  //开户中或者销户中
  return 'black';
  // 默认
}

function DiffColorClasses({ studentInfo }: Props) {
  const { package_name } = studentInfo;

  return (
    <Tooltip title={package_name}>
      <div style={{ color: colorChoose(studentInfo), ...commonOverflowTextStyle }}>{package_name}</div>
    </Tooltip>
  );
}

export default DiffColorClasses;
