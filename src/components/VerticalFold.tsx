import img1 from 'statics/images/1.png';
import img3 from 'statics/images/3.png';

const defaultStyle = {
  background: '#f15d5d',
  position: 'absolute',
  zIndex: 999,
  right: '50%',
  top: -25,
  width: 60,
  color: 'white',
  height: 20,
};
//垂直方向折叠展开
export function VerticalFold(props: any) {
  const { bottomOut, setBottomOut, style = {} } = props;
  return (
    <div
      style={{
        ...defaultStyle,
        ...style,
      }}
      className="flex-box  pointer"
      onClick={() => {
        setBottomOut(!bottomOut);
      }}
    >
      {bottomOut ? (
        // <VerticalAlignBottomOutlined style={{ fontSize: 18 }} />
        <img src={img1} height={30} alt="" />
      ) : (
        <img src={img3} height={30} alt="" />
      )}
    </div>
  );
}
