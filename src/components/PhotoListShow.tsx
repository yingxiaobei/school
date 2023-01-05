import React, { CSSProperties } from 'react';
import { Divider, Image, Popover, Space } from 'antd';
import alt from 'statics/alt.png';

type TeachLog = {
  title: typeof titleList[number];
  url: string;
  equtime?: string;
  color?: string;
  uploadstatus: string;
};
type CreditHourAuditLog = {
  title: typeof titleList[number];
  url?: string;
  takeTime?: string;
  exceptionCodes?: string;
};

interface PhotoListShowProps {
  isSelected: boolean;
  selectRender: () => React.ReactNode;
  list: TeachLog[] | Record<number, CreditHourAuditLog>;
  otherList: (TeachLog | CreditHourAuditLog)[];
  render: (item: TeachLog | CreditHourAuditLog) => React.ReactNode;
}

const itemStyle: CSSProperties = { width: '160px', height: '200px', margin: 'auto 20px' };
const titleStyle: CSSProperties = {
  fontWeight: 'bolder',
  borderLeft: ' 2px solid #666',
  paddingLeft: '8px',
  marginBottom: '4px',
};

export const titleList: ['学员证件照', '学员模板照', '学员签到照', '学员签退照', '教练证件照', '教练模板照'] = [
  '学员证件照',
  '学员模板照',
  '学员签到照',
  '学员签退照',
  '教练证件照',
  '教练模板照',
];

function PhotoListShow({ list, otherList, render, isSelected, selectRender }: PhotoListShowProps) {
  return (
    <Image.PreviewGroup>
      <Space wrap>
        {titleList.map((title, index) => {
          const item = list[index];
          return item ? (
            <div style={itemStyle} key={index}>
              <div style={titleStyle}>{title}</div>
              {item && item.url ? (
                <Popover content={<img src={item.url} alt={alt} style={{ width: 500 }} />}>
                  <Image src={item.url} alt="照片" style={{ width: 150, height: 150 }} />
                </Popover>
              ) : (
                <img src={alt} alt="" style={{ width: 150, height: 150 }} />
              )}
              {render(item)}
            </div>
          ) : (
            <div style={itemStyle} key={index}>
              <div style={titleStyle}>{title}</div>
              <img src={alt} alt="" style={{ width: 150, height: 150 }} />
            </div>
          );
        })}
      </Space>

      <Divider />
      <p style={{ ...titleStyle, marginLeft: '20px' }}>
        随机照片
        {isSelected && selectRender()}
      </p>
      <Space wrap size={[8, 16]}>
        {otherList.map((item, index) => {
          return (
            <div style={itemStyle} key={index}>
              {item && item.url ? (
                <Popover content={<img src={item.url} alt={alt} style={{ width: 500 }} />}>
                  <Image src={item.url} alt="照片" style={{ width: 150, height: 150 }} />
                </Popover>
              ) : (
                <img src={alt} alt="" style={{ width: 150, height: 150 }} />
              )}
              {render(item)}
            </div>
          );
        })}
      </Space>
    </Image.PreviewGroup>
  );
}

export default PhotoListShow;
