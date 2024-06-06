import type { Metadata, Viewport } from "next";
import { fonts } from '@/app/fonts'
import Providers from '@/app/providers'
import Layout from '@/lib/layout'

export const metadata: Metadata = {
  title: "GO-Log4Shell Web Console",
  description: "",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={fonts.rubik.variable}>
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
