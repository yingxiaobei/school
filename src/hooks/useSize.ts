import { useWindowSize } from 'hooks';

export const useSize = (width: number = 0, height: number = 0): { width: number; height: number } => {
  const { screenWidth, screenHeight } = useWindowSize();
  let widthRatio = screenWidth / 1600;
  let heightRatio = screenHeight / 800;

  return { width: Math.ceil(widthRatio * width), height: Math.ceil(heightRatio * height) };
};
