'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/context';

// 클라이언트 컴포넌트 프로바이더 래퍼 (서버 컴포넌트인 layout.tsx에서 사용)
export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
