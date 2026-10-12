/** @type {import("next").NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
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
