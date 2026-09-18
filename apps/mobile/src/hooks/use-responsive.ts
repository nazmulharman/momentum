import { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

export type ViewFormat = 'auto' | 'desktop' | 'mobile';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const [overrideFormat, setOverrideFormat] = useState<ViewFormat>('auto');

  const actualIsDesktop = width >= 768;
  const actualIsMobile = width < 768;

  let isDesktop = actualIsDesktop;
  let isMobile = actualIsMobile;

  if (overrideFormat === 'desktop') {
    isDesktop = true;
    isMobile = false;
  } else if (overrideFormat === 'mobile') {
    isDesktop = false;
    isMobile = true;
  }

  return {
    width,
    height,
    isDesktop,
    isMobile,
    actualIsDesktop,
    actualIsMobile,
    overrideFormat,
    setOverrideFormat,
  };
}
