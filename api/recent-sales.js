import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ ok: false, error: 'Missing Supabase environment variables.' });
  }

  const limit = Math.min(Number(req.query?.limit) || 10, 50);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('transactions')
    .select('transaction_code, created_at, total_amount, item_count, payment_method, customer_race, customer_age, customer_gender, status')
    .or('status.eq.active,status.is.null')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return res.status(500).json({ ok: false, error: error.message, details: error });
  }

  return res.status(200).json({ ok: true, sales: data || [] });
}
