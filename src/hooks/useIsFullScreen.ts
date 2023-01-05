import { useEffect, useState } from 'react';

export function useIsFullScreen() {
  const [isScreenfull, setIsScreenFull] = useState(false);
  let isFullscreen = false;
  isFullscreen = document.fullscreenElement !== null;
  useEffect(() => {
    const handler = () => {
      if (!isFullscreen) {
        // 退出全屏时候解除监听，不然每次监听都会添加一次绑定
        document.removeEventListener('fullscreenchange', handler);

        setIsScreenFull(true);
      } else {
        setIsScreenFull(false);
      }
    };
    //通过监听全屏状态才能正确显示全屏和退出的图标
    document.addEventListener('fullscreenchange', handler);
  }, [isFullscreen]);
  return isScreenfull;
}
