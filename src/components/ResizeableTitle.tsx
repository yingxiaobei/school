import { useState } from 'react';
import { Resizable } from 'react-resizable';

export default function ResizeableTitle(props: any) {
  const { onResize, width, ...restProps } = props;
  const [offset, setOffset] = useState(0);
  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      // 宽度重新计算结果   ，表头应当加上偏移量，这样拖拽结束的时候能够计算结果；
      // 当然在停止事件再计算应当一样，我没试过（笑）
      width={width + offset}
      height={0}
      handle={
        <span
          className={'react-resizable-handle' + (offset == 0 ? ' ' : ' active')}
          style={{ transform: `translateX(${offset}px)` }}
          onClick={(e) => {
            // 取消冒泡，不取消貌似容易触发排序事件
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      }
      // 拖拽事件实时更新
      onResize={(e: any, { size }: any) => {
        // 这里只更新偏移量，数据列表其实并没有伸缩
        setOffset(size.width - width);
      }}
      // 拖拽结束更新
      onResizeStop={(...argu: any) => {
        // 拖拽结束以后偏移量归零
        setOffset(0);
        // 这里是props传进来的事件，在外部是列数据中的onHeaderCell方法提供的事件，请自行研究官方提供的案例
        onResize(...argu);
      }}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
}
export const tableComponent = {
  header: {
    cell: ResizeableTitle,
  },
};
