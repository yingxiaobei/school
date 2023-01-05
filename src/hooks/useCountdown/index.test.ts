import { renderHook } from '@testing-library/react-hooks';
import { useCountdown } from 'hooks';

const setUp = (defaultValue: number = 60) => renderHook(() => useCountdown(defaultValue));

describe('useCountdown', () => {
  it('should be defined', () => {
    expect(useCountdown).toBeDefined();
  });

  it('count should equal 60', () => {
    const { result } = setUp();
    expect(result.current.count).toEqual(60);
    expect(result.current.isFirstCounting).toBeTruthy();
    expect(result.current.setIsCounting).toBeDefined();
    expect(result.current.isCounting).toBeFalsy();
  });

  it('count should equal 40', () => {
    const { result } = setUp(40);
    expect(result.current.count).toEqual(40);
  });
});
