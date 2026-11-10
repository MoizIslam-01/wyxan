import { BadRequestException } from '@nestjs/common';
import { normalizeAddress, validateAddress } from './address.js';

describe('address helpers', () => {
  it('normalizes casing, whitespace, and a trailing dot', () => {
    expect(normalizeAddress('  TidePool.ZZ. ')).toBe('tidepool.zz');
  });

  it('accepts a domain-shaped small-web address', () => {
    expect(validateAddress('notes-by-mira.zz')).toBe('notes-by-mira.zz');
  });

  it.each([
    'https://tidepool.zz',
    'tidepool',
    'bad address.zz',
    '/tidepool.zz',
  ])('rejects %s', (address) =>
    expect(() => validateAddress(address)).toThrow(BadRequestException),
  );
});
