import QRCode from 'qrcode.react';

export default function QrCode(props) {
  const { value, ...restProps } = props;
  return <QRCode value={value} {...restProps} />;
}
