import { Work_Sans } from 'next/font/google';

import './globals.css';
import '@liveblocks/react-ui/styles.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import Room from './Room';
import { Suspense } from 'react';

export const metadata = {
  title: 'Figma Clone',
  description:
    'A minimalist Figma clone using fabric.js and Liveblocks for realtime collaboration',
};

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['400', '600', '700'],
});

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className={`${workSans.className} bg-primary-grey-200`}>
      <Suspense>
        <Room>
          <TooltipProvider>{children}</TooltipProvider>
        </Room>
      </Suspense>
    </body>
  </html>
);

export default RootLayout;
