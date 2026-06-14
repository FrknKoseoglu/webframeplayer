import { customAlphabet } from 'nanoid';

// Use alphanumeric characters for short codes
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

export function generateShortCode(): string {
  return nanoid();
}
