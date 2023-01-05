import { decimalSum } from '..';

describe('decimalSum', () => {
  it('should be defined', () => {
    expect(decimalSum).toBeDefined();
  });

  it('1.00 should equal 1', () => {
    const sum = decimalSum(1.0);
    expect(sum).toEqual(1);
  });

  it('1.001 should equal 0', () => {
    const sum = decimalSum(1.001, 0);
    expect(sum).toEqual(1.001);
  });

  it('1 + 2 should equal 3', () => {
    const sum = decimalSum(1, 2);
    expect(sum).toEqual(3);
  });

  it('1.0 + 2.0 should equal 3', () => {
    const sum = decimalSum(1.0, 2.0);
    expect(sum).toEqual(3);
  });

  it('0.1 + 0.2 should equal 0.3', () => {
    const sum = decimalSum(0.1, 0.2);
    expect(sum).toEqual(0.3);
  });

  it('0.001 + 1.001 should equal 1.002', () => {
    const sum = decimalSum(0.001, 1.001);
    expect(sum).toEqual(1.002);
  });

  it('0.1111 + 1.001 should equal 1.1121', () => {
    const sum = decimalSum(0.1111, 1.001);
    expect(sum).toEqual(1.1121);
  });

  it('0.001 + 1.123 + 1.12 should equal 2.244', () => {
    const sum = decimalSum(0.001, 1.123, 1.12);
    expect(sum).toEqual(2.244);
  });
});
