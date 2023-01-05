import { get } from 'lodash';
export function _get<TObject extends object, TKey extends keyof TObject>(
  object: TObject,
  path: TKey | [TKey],
): TObject[TKey];
export function _get<T extends object, P extends keyof T>(object: T, path: P): undefined | T[P];
// export function _get<T extends object, P extends keyof T, Default>(
//   object: T,
//   path: P,
//   defaultValue: Default,
// ): T[P] | Default;
export function _get<T extends object, P extends keyof T, TDefault>(
  object: T | null | undefined,
  path: P | [P],
  defaultValue: TDefault,
): Exclude<T[P], undefined> | TDefault;

export function _get<T extends object, P extends keyof T, Default>(
  object: T,
  path: P,
  defaultValue: Default,
): undefined | T[P] | Default;

export function _get(object: unknown, path: unknown): any;

export function _get<TObject extends object, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1], TDefault>(
  object: TObject | null | undefined,
  path: [TKey1, TKey2],
  defaultValue: TDefault,
): Exclude<TObject[TKey1][TKey2], undefined> | TDefault;

export function _get<Default>(object: unknown, path: unknown, defaultValue: Default): any | Default;

export function _get(object: any, path: any, defaultValue?: any) {
  const res = get(object, path, defaultValue);
  // eslint-disable-next-line eqeqeq
  return res == undefined ? defaultValue : res;
}
