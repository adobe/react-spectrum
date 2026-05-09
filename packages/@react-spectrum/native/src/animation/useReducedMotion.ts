import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

export function useReducedMotion() {
  let [isReducedMotionEnabled, setReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (isMounted) {
        setReducedMotionEnabled(value);
      }
    });

    let subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotionEnabled
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return isReducedMotionEnabled;
}
