import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const inter = Inter({
  variable: '--font-pretendard',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Banjak — AI 영상 생성 플랫폼',
  description: '프롬프트 한 줄로 만드는 AI 영상. 화이트보드 애니메이션을 1분 안에.',
  keywords: ['AI 영상', '화이트보드', '영상 생성', 'Banjak', '반짝'],
  openGraph: {
    title: 'Banjak — AI 영상 생성 플랫폼',
    description: '프롬프트 한 줄로 만드는 AI 영상',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
