/**
 * Performance optimization utilities
 * 
 * These utilities help reduce unnecessary re-renders and computations
 * in areas with frequent updates (like streak lists)
 */

import { useState, useEffect } from 'react';

/**
 * Memoize a function based on its arguments using WeakMap
 * Useful for callbacks that depend on single object arguments
 */
export const memoizeCallback = <T extends (...args: any[]) => any>(
  fn: T,
  compareFn?: (a: any[], b: any[]) => boolean
): T => {
  const cache = new WeakMap();

  return ((...args: any[]) => {
    const [arg] = args;
    
    // Only works for object-based cache keys
    if (arg === null || typeof arg !== 'object') {
      return fn(...args);
    }

    if (cache.has(arg)) {
      return cache.get(arg);
    }

    const result = fn(...args);
    cache.set(arg, result);
    return result;
  }) as T;
};

/**
 * Batch state updates to reduce re-renders
 * Useful when multiple state changes happen in quick succession
 */
export const createBatchedUpdater = <S>(setState: (updater: S | ((prev: S) => S)) => void) => {
  let pending: Partial<S> | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  return (updates: Partial<S>) => {
    pending = { ...pending, ...updates };

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (pending) {
        setState((prev) => ({ ...prev, ...pending }));
        pending = null;
      }
      timeoutId = null;
    }, 0);
  };
};

/**
 * Debounce hook for expensive operations
 */
export const debounceValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
