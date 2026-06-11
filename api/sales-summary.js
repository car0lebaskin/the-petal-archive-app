import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ ok: false, error: 'Missing Supabase environment variables.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('transactions')
    .select('transaction_code, created_at, total_amount, item_count, payment_method, status')
    .or('status.eq.active,status.is.null')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    return res.status(500).json({ ok: false, error: error.message, details: error });
  }

  const sales = data || [];
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
  const items = sales.reduce((sum, sale) => sum + Number(sale.item_count || 0), 0);
  const paymentCounts = sales.reduce((acc, sale) => {
    const key = sale.payment_method || 'UNKNOWN';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return res.status(200).json({
    ok: true,
    summary: {
      transactionCount: sales.length,
      totalRevenue: revenue,
      totalItems: items,
      averageOrderValue: sales.length ? revenue / sales.length : 0,
      paymentCounts,
      latestTransaction: sales[0] || null
    }
  });
}
