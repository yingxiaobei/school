import { Spin } from 'antd';

type TProps = {
  tip?: string; // 提示文案
  loadingStyle?: object;
};

export default function Loading(props: TProps) {
  const { tip = '', loadingStyle = {} } = props;

  const baseStyle: React.CSSProperties = { textAlign: 'center', marginTop: '10rem' };
  const mergeStyle: React.CSSProperties = Object.assign(baseStyle, loadingStyle);

  return (
    <div style={mergeStyle}>
      <Spin size="large" tip={tip} />
    </div>
  );
}
