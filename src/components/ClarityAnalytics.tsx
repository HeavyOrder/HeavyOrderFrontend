'use client';

import { useEffect } from 'react';

// Microsoft Clarity 세션 녹화 및 히트맵 분석
export default function ClarityAnalytics() {
  useEffect(() => {
    import('clarity-js').then(({ clarity }) => {
      clarity.start({
        projectId: 'vpwimuvcah',
        upload: 'https://m.clarity.ms/collect',
        track: true,
        content: true,
      });
    });
  }, []);

  return null;
}
