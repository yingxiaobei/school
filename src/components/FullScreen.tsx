import { useIsFullScreen } from 'hooks';
import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { CSSProperties, ReactInstance } from 'react';
import { Tooltip } from 'antd';

type IProps = {
  instance: ReactInstance | null | undefined;
  style?: CSSProperties | undefined;
  iconSize?: number;
};

export default function FullScreen(props: IProps) {
  const { instance, style = {}, iconSize = 30 } = props;
  const _screenfull: any = screenfull;
  const isScreenfull = useIsFullScreen();

  return (
    <div
      style={{ ...style }}
      onClick={() => {
        if (_screenfull?.isFullscreen) {
          _screenfull?.exit();
        }
        _screenfull?.request(findDOMNode(instance));
      }}
    >
      <Tooltip title={isScreenfull ? '退出' : '全屏'}>
        {isScreenfull ? (
          <FullscreenExitOutlined style={{ fontSize: iconSize }} />
        ) : (
          <FullscreenOutlined style={{ fontSize: iconSize }} />
        )}
      </Tooltip>
    </div>
  );
}
