import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCcw, Trash2 } from 'lucide-react';

const safeNumber = value => Number(value) || 0;
const money = value => Math.round(safeNumber(value)).toLocaleString();

const formatTime = timestamp => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function RecentSalesPanel({ onChanged }) {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRecentSales = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/recent-sales?limit=10');
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not load recent sales.');
      }

      setSales(result.sales || []);
    } catch (error) {
      setMessage(error.message || 'Could not load recent sales.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const voidSale = async transactionCode => {
    if (!transactionCode || isLoading) return;
    if (!window.confirm(`Void sale ${transactionCode}? This will not delete it, only mark it as voided.`)) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/void-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionCode, reason: 'Voided from recent sales panel' })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not void sale.');
      }

      setMessage(`Sale ${transactionCode} voided.`);
      await fetchRecentSales();
      if (onChanged) onChanged();
    } catch (error) {
      setMessage(error.message || 'Could not void sale.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-1">Recent Sales</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Latest active transactions</p>
        </div>
        <button
          type="button"
          onClick={fetchRecentSales}
          disabled={isLoading}
          className="w-10 h-10 rounded-2xl bg-[#E8EEE9] text-[#1B3022] flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={15} /> : <RefreshCcw size={15} />}
        </button>
      </div>

      {message && <p className="text-[10px] font-bold text-[#B5935E] mb-4">{message}</p>}

      <div className="space-y-3">
        {sales.length ? sales.map(sale => (
          <div key={sale.transaction_code} className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#1B3022] truncate">{sale.transaction_code}</p>
              <p className="text-[9px] font-bold uppercase text-gray-400 mt-1">{formatTime(sale.created_at)}</p>
              <p className="text-[9px] font-bold uppercase text-gray-400">{sale.item_count || 0} item(s) · {sale.payment_method || 'No payment'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-serif italic text-[#B5935E]">RM {money(sale.total_amount)}</p>
              <button
                type="button"
                onClick={() => voidSale(sale.transaction_code)}
                disabled={isLoading}
                className="mt-2 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-red-400 disabled:opacity-40"
              >
                <Trash2 size={11} /> Void
              </button>
            </div>
          </div>
        )) : (
          <p className="text-[10px] font-bold text-gray-300 uppercase">No recent sales yet.</p>
        )}
      </div>
    </section>
  );
}
