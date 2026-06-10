import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      ok: false,
      configured: false,
      error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in Vercel environment variables.'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [transactionsResult, itemsResult, latestResult] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true }),
    supabase.from('transaction_items').select('id', { count: 'exact', head: true }),
    supabase.from('transactions').select('transaction_code, created_at, total_amount, item_count').order('created_at', { ascending: false }).limit(1)
  ]);

  const error = transactionsResult.error || itemsResult.error || latestResult.error;

  if (error) {
    return res.status(500).json({
      ok: false,
      configured: true,
      error: error.message,
      details: error
    });
  }

  return res.status(200).json({
    ok: true,
    configured: true,
    transactionCount: transactionsResult.count ?? 0,
    transactionItemCount: itemsResult.count ?? 0,
    latestTransaction: latestResult.data?.[0] || null
  });
}
