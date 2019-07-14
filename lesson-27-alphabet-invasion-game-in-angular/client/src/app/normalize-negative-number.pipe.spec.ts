import { NormalizeNegativeNumberPipe } from './normalize-negative-number.pipe';

describe('NormalizeNegativeNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new NormalizeNegativeNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
