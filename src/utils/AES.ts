import { _get } from 'utils';
import CryptoJS from 'crypto-js';

export function AES_ENCRYPT(body: string) {
  const key = CryptoJS.enc.Utf8.parse('47CB81CE916B9D43');
  const iv = CryptoJS.enc.Utf8.parse('8AF9BEAAA4E8EAE1');
  const value = CryptoJS.enc.Utf8.parse(body);
  const encrypted: any = CryptoJS.AES.encrypt(value, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const encryptedVal = _get(encrypted, 'ciphertext', '').toString().toUpperCase();

  return encryptedVal;
}
