import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

export const config = {
  matcher: ['/', '/(es|en)/:path*', '/((?!api|_next|_vercel|models|.*\\..*).*)']
};