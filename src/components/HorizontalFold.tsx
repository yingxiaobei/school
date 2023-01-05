import img2 from 'statics/images/2.png';
import img4 from 'statics/images/4.png';

const defaultStyle = {
  background: '#f15d5d',
  position: 'absolute',
  zIndex: 999,
  right: 0,
  top: 150,
  height: 60,
  color: 'white',
};

//水平方向折叠展开
export function HorizontalFold(props: any) {
  const { leftOut, setLeftOut, style = {} } = props;
  return (
    <div
      style={{
        ...defaultStyle,
        ...style,
      }}
      className="flex-box pointer"
      onClick={() => {
        setLeftOut(!leftOut);
      }}
    >
      {leftOut ? <img src={img2} width={30} alt="" /> : <img src={img4} width={30} alt="" />}
    </div>
  );
}
