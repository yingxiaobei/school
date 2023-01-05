import React from 'react';
interface ITitle {
  style?: React.CSSProperties; // 自定义样式
  children: JSX.Element | string;
}

export default function Title(props: ITitle) {
  const { style = {} } = props;

  return <div style={{ fontSize: 18, fontWeight: 'bold', padding: '5px 0px', ...style }}>{props.children}</div>;
}
