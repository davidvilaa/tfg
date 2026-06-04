import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

// @ts-ignore
import "@/app/globals.css";
// @ts-ignore
import "7.css/dist/7.css";
// @ts-ignore
import "flag-icons/css/flag-icons.min.css";

import Navbar from "@/components/navbar";
import { NotificationProvider } from "@/components/NotificationProvider";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrophyD",
  description: "The ultimate collaborative library for completionists",
};

const locales = ['en', 'es'];

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className="dark">
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NotificationProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </NotificationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}