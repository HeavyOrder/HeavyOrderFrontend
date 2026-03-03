import type { Metadata } from 'next';
import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { Header, Footer } from '@/components/layout';
import Providers from '@/components/Providers';
import ClarityAnalytics from '@/components/ClarityAnalytics';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'HeavyOrder - 중장비 부품 발주 플랫폼',
  description: '수리점, 공급사, 장비기사를 연결하는 중장비 부품 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <GoogleAnalytics gaId="G-MJ2BKC0RFK" />
        <ClarityAnalytics />
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
