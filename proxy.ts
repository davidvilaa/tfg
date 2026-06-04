import createMiddleware from 'next-intl/middleware';

const nextIntlProxy = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

export const proxy = nextIntlProxy;
export default nextIntlProxy;

export const config = {
  matcher: ['/', '/(es|en)/:path*', '/((?!api|_next|_vercel|models|.*\\..*).*)']
};