import { isPlainObject } from 'lodash-es';

export function applyOptionUpdates(
  target: any,
  source: any,
  basePath: string = '',
  collector?: (path: string, newVal: any, oldVal: any) => void,
) {
  Object.keys(source).forEach((key) => {
    const fullPath = basePath ? `${basePath}.${key}` : key;
    const updateValue = source[key];
    const oldValue = target[key];

    if (updateValue === undefined) {
      delete target[key];
      collector?.(fullPath, undefined, oldValue);
    } else if (isPlainObject(updateValue)) {
      if (!isPlainObject(target[key])) {
        target[key] = {};
      }
      applyOptionUpdates(target[key], updateValue, fullPath, collector);
    } else {
      target[key] = updateValue;
      if (updateValue !== oldValue) {
        collector?.(fullPath, updateValue, oldValue);
      }
    }
  });
}
