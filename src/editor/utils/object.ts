import { cloneDeep, get, isEqual, isPlainObject } from 'lodash-es';

export interface ApplyOptionUpdatesOptions {
  /** Whether to notify parent paths of changes (bubbling) */
  bubbleUp?: boolean;
  /** Callback triggered whenever a property value changes */
  collector?: (path: string, newVal: any, oldVal: any) => void;
}

/**
 * Recursively applies properties from 'source' to 'target' and collects changes.
 *
 * @param target - The object to be updated
 * @param source - The source object containing partial updates
 * @param basePath - Current path prefix for nested properties
 * @param options - Configuration options
 */
export function applyOptionUpdates(
  target: any,
  source: any,
  basePath: string = '',
  options?: ApplyOptionUpdatesOptions,
): void {
  const { bubbleUp = false, collector } = options ?? {};
  // Set to store unique parent paths that need notification
  const parentPathsToNotify = new Set<string>();

  applyOptionUpdatesInternal(
    target,
    source,
    basePath,
    collector,
    bubbleUp,
    parentPathsToNotify,
  );

  // Bubbling notification: from the deepest parent path to the shallowest
  if (bubbleUp && collector && parentPathsToNotify.size > 0) {
    // Sort by path depth in descending order (deepest first)
    const sortedPaths = Array.from(parentPathsToNotify).sort((a, b) => {
      const depthA = a === '' ? 0 : a.split('.').length;
      const depthB = b === '' ? 0 : b.split('.').length;
      return depthB - depthA;
    });
    for (const parentPath of sortedPaths) {
      const newVal = parentPath ? get(target, parentPath) : target;
      // For parent paths, we provide the cloned new value.
      // oldVal is passed as undefined as tracking branch node state is complex.
      collector(parentPath, cloneDeep(newVal), undefined);
    }
  }
}

function applyOptionUpdatesInternal(
  target: any,
  source: any,
  basePath: string,
  collector: ((path: string, newVal: any, oldVal: any) => void) | undefined,
  bubbleUp: boolean,
  parentPathsToNotify: Set<string>,
): void {
  Object.keys(source).forEach((key) => {
    const fullPath = basePath ? `${basePath}.${key}` : key;
    const updateValue = source[key];
    const oldValue = target[key];

    if (updateValue === undefined) {
      delete target[key];
      collector?.(fullPath, undefined, oldValue);
      if (bubbleUp) collectParentPaths(basePath, parentPathsToNotify);
    } else if (isPlainObject(updateValue)) {
      if (!isPlainObject(target[key])) {
        target[key] = {};
      }
      applyOptionUpdatesInternal(
        target[key],
        updateValue,
        fullPath,
        collector,
        bubbleUp,
        parentPathsToNotify,
      );
    } else {
      target[key] = updateValue;
      if (!isEqual(updateValue, oldValue)) {
        collector?.(fullPath, updateValue, oldValue);
        if (bubbleUp) collectParentPaths(basePath, parentPathsToNotify);
      }
    }
  });
}

/**
 * Collects all parent paths of a given path and adds them to the provided set.
 */
function collectParentPaths(path: string, set: Set<string>): void {
  if (!path) {
    set.add(''); // Root path
    return;
  }

  const parts = path.split('.');
  for (let i = parts.length; i >= 0; i--) {
    set.add(parts.slice(0, i).join('.'));
  }
}
