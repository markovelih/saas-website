/** @type {import("next").NextConfig} */
const nextConfig = {
  // Explicit local hostname for phone testing; no extra origins are trusted by default.
  allowedDevOrigins: process.env.KORYX_DEV_HOST ? [process.env.KORYX_DEV_HOST] : [],
  devIndicators:false,
  outputFileTracingIncludes: { '/*': ['./lib/billing/fonts/*.ttf'], '/api/projects/*/preview': ['./node_modules/@sparticuz/chromium/bin/**'], '/api/website-preview': ['./node_modules/@sparticuz/chromium/bin/**'] },
  serverExternalPackages: ['@sparticuz/chromium','puppeteer-core','sharp'],
  images: { unoptimized: true },
  async rewrites(){return {beforeFiles:[
    {source:'/invoice-:number([A-Za-z0-9-]+)',destination:'/documents/invoice-:number'},
    {source:'/receipt-:number([A-Za-z0-9-]+)',destination:'/documents/receipt-:number'},
  ]}},
  async headers(){return [{source:'/sw.js',headers:[{key:'Cache-Control',value:'no-store, max-age=0'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self'"}]}]},
  // Only public Supabase connection values belong here. The service role key
  // remains a server environment variable and must never be mapped into env.
  env: {
    ...(process.env.KORYX_SUPABASE_URL && {
      NEXT_PUBLIC_SUPABASE_URL: process.env.KORYX_SUPABASE_URL,
    }),
    ...(process.env.KORYX_SUPABASE_ANON_KEY && {
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.KORYX_SUPABASE_ANON_KEY,
    }),
  },
};
export default nextConfig;
