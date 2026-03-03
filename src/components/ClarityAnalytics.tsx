'use client';

import { useEffect } from 'react';
import { clarity } from 'clarity-js';

// Microsoft Clarity 세션 녹화 및 히트맵 분석
export default function ClarityAnalytics() {
  useEffect(() => {
    clarity.start({
      projectId: 'vpwimuvcah',
      upload: 'https://m.clarity.ms/collect',
      track: true,
      content: true,
    });

    return () => {
      clarity.stop();
    };
  }, []);

  return null;
}
