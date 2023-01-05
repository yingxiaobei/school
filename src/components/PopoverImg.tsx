import { Popover } from 'antd';

interface IProps {
  src: string;
  alt?: string;
  popoverStyle?: object;
  imgStyle?: object;
  imgClassName?: string;
}

export default function PopoverImg(props: IProps) {
  const { src, alt = '', popoverStyle = {}, imgClassName = '', imgStyle = {} } = props;

  return (
    <Popover content={<img src={src} alt={alt} style={{ width: 500, ...popoverStyle }} />}>
      {src && <img src={src} alt="" className={imgClassName} style={{ width: 100, height: 100, ...imgStyle }} />}
    </Popover>
  );
}
