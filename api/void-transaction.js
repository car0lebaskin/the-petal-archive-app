import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ ok: false, error: 'Missing Supabase environment variables.' });
  }

  const { transactionCode, reason = 'Voided from app' } = req.body || {};

  if (!transactionCode) {
    return res.status(400).json({ ok: false, error: 'transactionCode is required.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('transactions')
    .update({
      status: 'voided',
      voided_at: new Date().toISOString(),
      void_reason: reason
    })
    .eq('transaction_code', transactionCode)
    .select('transaction_code, status, voided_at, void_reason')
    .single();

  if (error) {
    return res.status(500).json({ ok: false, error: error.message, details: error });
  }

  return res.status(200).json({ ok: true, transaction: data });
}
