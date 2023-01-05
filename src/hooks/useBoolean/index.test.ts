import { renderHook, act } from '@testing-library/react-hooks';
import { useBoolean } from 'hooks';

const setUp = (defaultValue: boolean = false) => renderHook(() => useBoolean(defaultValue));

describe('useBoolean', () => {
  it('should be defined', () => {
    expect(useBoolean).toBeDefined();
  });

  it('test on methods', () => {
    const { result } = setUp();
    expect(result.current[0]).toBeFalsy();

    act(() => {
      result.current[1]._setTruthy();
    });
    expect(result.current[0]).toBeTruthy();

    act(() => {
      result.current[1]._setFalsy();
    });
    expect(result.current[0]).toBeFalsy();

    act(() => {
      result.current[1]._switch();
    });
    expect(result.current[0]).toBeTruthy();

    act(() => {
      result.current[1]._switch();
    });
    expect(result.current[0]).toBeFalsy();
  });

  it('test on optional', () => {
    const hook = setUp(true);
    expect(hook.result.current[0]).toBeTruthy();
  });
});
