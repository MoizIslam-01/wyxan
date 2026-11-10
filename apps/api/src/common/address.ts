import { BadRequestException } from '@nestjs/common';

const ADDRESS_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function normalizeAddress(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

export function isValidAddress(value: string): boolean {
  return ADDRESS_PATTERN.test(normalizeAddress(value));
}

export function validateAddress(value: string): string {
  const address = normalizeAddress(value);
  if (!isValidAddress(address)) {
    throw new BadRequestException(
      'Address must look like tidepool.zz and cannot include a protocol, path, or spaces',
    );
  }
  return address;
}
