export default function handler(_req, res) {
  const ok = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  res.status(ok ? 200 : 500).json({ ok, url: !!process.env.NEXT_PUBLIC_SUPABASE_URL, key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) });
}
