import React, { useState } from 'react';
import { 
  Leaf, Plus, BarChart3, Settings, Save, ChevronRight, 
  MapPin, Calendar, TrendingUp, Package, Users, Wallet, CheckCircle2 
} from 'lucide-react';

const PetalArchiveOS = () => {
  // --- APP STATE ---
  const [view, setView] = useState('input'); 
  const [step, setStep] = useState(0); 
  const [location, setLocation] = useState("TRX Market, KL");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [sale, setSale] = useState({
    category: '', style: '', metal: 'STG', base: 'P',
    flower: '', payment: 'TnG', price: '',
    customer: { race: 'C', age: '20s' }
  });

  // --- BRAND COLORS ---
  const theme = {
    green: "#1B3022",
    cream: "#FDFBF7",
    gold: "#B5935E",
  };

  // --- LOGIC ---
  const handleFinalLog = () => {
    setIsSaving(true);
    // Simulate API Call to Google Sheets
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStep(1);
        setSale({...sale, flower: '', price: ''});
      }, 1500);
    }, 800);
  };

  // --- SUB-VIEWS ---

  const Nav = () => (
    <nav className="fixed bottom-6 left-4 right-4 bg-[#1B3022] rounded-3xl p-2 flex justify-around items-center shadow-2xl z-50 border border-white/10">
      <button onClick={() => setView('input')} className={`p-4 rounded-2xl transition-all ${view === 'input' ? 'bg-[#B5935E] text-white' : 'text-gray-500'}`}>
        <Plus size={24} />
      </button>
      <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-[#B5935E] text-white' : 'text-gray-500'}`}>
        <BarChart3 size={24} />
      </button>
      <button onClick={() => setStep(0)} className="p-4 text-gray-500"><Settings size={24} /></button>
    </nav>
  );

  const StepIndicator = () => (
    <div className="flex justify-center gap-2 mb-6">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#1B3022]' : 'bg-gray-200'}`} />
      ))}
    </div>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-[#1B3022] rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <CheckCircle2 size={48} className="text-[#B5935E]" />
        </div>
        <h2 className="text-3xl font-serif italic text-[#1B3022]">Archive Updated</h2>
        <p className="text-[#B5935E] uppercase tracking-widest text-[10px] mt-2 font-bold">Sale logged to Google Sheets</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-5 max-w-md mx-auto overflow-x-hidden">
      
      {/* 0. LOCATION SETUP */}
      {step === 0 && (
        <div className="pt-12 space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <h1 className="text-4xl font-serif italic mb-1">The Petal Archive</h1>
            <div className="h-[1px] w-12 bg-[#B5935E] mx-auto mb-2" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B5935E] font-bold">Boutique Sales OS</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-[#B5935E]" size={18} />
                <input 
                  className="w-full pl-12 p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-100"
                  value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue Name"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 text-[#B5935E]" size={18} />
                <input 
                  type="date" className="w-full pl-12 p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-100"
                  value={date} onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold text-lg shadow-lg">Start Session</button>
          </div>
        </div>
      )}

      {/* 1. SALES INPUT FLOW */}
      {step > 0 && view === 'input' && (
        <div className="pb-24 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 text-[#B5935E] font-bold text-[10px] uppercase tracking-wider">
               <MapPin size={14} /> {location}
             </div>
             <span className="text-[10px] font-bold text-gray-300">{date}</span>
          </div>

          <StepIndicator />

          {step === 1 && (
            <div className="space-y-6">
              <section>
                <label className="text-[10px] font-black text-[#B5935E] uppercase mb-3 block">Jewelry Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Necklace', 'Bracelet', 'Ring', 'Earrings', 'Coaster', 'Charm'].map(c => (
                    <button key={c} onClick={() => setSale({...sale, category: c})} className={`py-4 rounded-2xl border text-sm transition-all ${sale.category === c ? 'bg-[#1B3022] text-white border-[#1B3022]' : 'bg-white text-[#1B3022] border-gray-100'}`}>{c}</button>
                  ))}
                </div>
              </section>
              <section>
                <label className="text-[10px] font-black text-[#B5935E] uppercase mb-3 block">Series / Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Plain', 'CZ', 'Alphabet', 'Insect', 'Tree', 'Baby'].map(s => (
                    <button key={s} onClick={() => setSale({...sale, style: s})} className={`py-3 rounded-xl border text-[11px] font-bold uppercase transition-all ${sale.style === s ? 'bg-[#B5935E] text-white border-[#B5935E]' : 'bg-white text-gray-400 border-gray-100'}`}>{s}</button>
                  ))}
                </div>
              </section>
              <button onClick={() => setStep(2)} disabled={!sale.category} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold mt-4 shadow-lg disabled:opacity-20">Next Details</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <section>
                  <label className="text-[10px] font-black text-[#B5935E] uppercase mb-2 block">Metal</label>
                  <div className="space-y-2">
                    {['STG', 'STU', 'Rose Gold'].map(m => (
                      <button key={m} onClick={() => setSale({...sale, metal: m})} className={`w-full py-3 rounded-xl border text-xs font-bold ${sale.metal === m ? 'bg-[#1B3022] text-white' : 'bg-white text-gray-400'}`}>{m}</button>
                    ))}
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-black text-[#B5935E] uppercase mb-2 block">Base</label>
                  <div className="space-y-2">
                    {['MOP (P)', 'Black (B)', 'White (W)', 'Clear (C)'].map(b => (
                      <button key={b} onClick={() => setSale({...sale, base: b})} className={`w-full py-3 rounded-xl border text-xs font-bold ${sale.base === b ? 'bg-[#1B3022] text-white' : 'bg-white text-gray-400'}`}>{b}</button>
                    ))}
                  </div>
                </section>
              </div>
              <section>
                <label className="text-[10px] font-black text-[#B5935E] uppercase mb-2 block">Flower / Design Details</label>
                <input className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none" placeholder="e.g. Blue Hydrangea" value={sale.flower} onChange={e => setSale({...sale, flower: e.target.value})} />
              </section>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold">Back</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-[#1B3022] text-white py-4 rounded-2xl font-bold shadow-lg">Payment</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                <span className="text-[10px] font-bold text-[#B5935E] uppercase tracking-widest block mb-4">Total Amount (RM)</span>
                <input type="number" className="w-full text-6xl font-serif text-[#1B3022] text-center outline-none bg-transparent" placeholder="0" value={sale.price} onChange={e => setSale({...sale, price: e.target.value})} />
                <div className="flex gap-2 mt-8">
                  {['TnG', 'Grab', 'Cash', 'Card'].map(p => (
                    <button key={p} onClick={() => setSale({...sale, payment: p})} className={`flex-1 py-2 text-[10px] font-black rounded-lg border ${sale.payment === p ? 'bg-[#1B3022] text-white border-[#1B3022]' : 'bg-gray-50 text-gray-300 border-transparent'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <section className="space-y-4">
                <label className="text-[10px] font-black text-[#B5935E] uppercase block tracking-widest text-center">Customer Profile</label>
                <div className="flex gap-2">
                  {['C', 'M', 'I', 'Expat'].map(r => (
                    <button key={r} onClick={() => setSale({...sale, customer: {...sale.customer, race: r}})} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold ${sale.customer.race === r ? 'bg-[#B5935E] text-white border-[#B5935E]' : 'bg-white text-gray-300'}`}>{r}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {['20s', '30s', '40s', '50+'].map(a => (
                    <button key={a} onClick={() => setSale({...sale, customer: {...sale.customer, age: a}})} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold ${sale.customer.age === a ? 'bg-[#B5935E] text-white border-[#B5935E]' : 'bg-white text-gray-300'}`}>{a}</button>
                  ))}
                </div>
              </section>
              <button onClick={handleFinalLog} className="w-full bg-[#1B3022] text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-green-900/40">
                {isSaving ? "Saving..." : "LOG SALE"}
              </button>
            </div>
          )}
          <Nav />
        </div>
      )}

      {/* 2. DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <div className="pb-24 animate-in fade-in duration-500">
          <header className="text-center py-8">
            <h2 className="text-3xl font-serif italic text-[#1B3022]">Archive Insights</h2>
            <p className="text-[10px] text-[#B5935E] font-bold uppercase tracking-widest mt-2">Live Session Data</p>
          </header>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1B3022] p-5 rounded-3xl text-white shadow-xl flex flex-col justify-between h-32">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Today's Revenue</span>
              <h3 className="text-2xl font-serif italic">RM 1,420</h3>
              <div className="flex items-center gap-1 text-[10px] text-[#B5935E] font-bold">
                <TrendingUp size={12} /> +12% VS LAST EVENT
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 flex flex-col justify-between h-32 shadow-sm">
              <span className="text-[10px] font-bold text-[#B5935E] uppercase tracking-wider">Items Sold</span>
              <h3 className="text-2xl font-serif italic text-[#1B3022]">14 Pieces</h3>
              <span className="text-[10px] text-gray-300 font-bold uppercase">Average RM 101/ea</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
             <section>
               <h4 className="text-[10px] font-black text-[#B5935E] uppercase mb-4 flex items-center gap-2"><Package size={14} /> Hot Sellers</h4>
               <div className="space-y-3">
                 {[
                   { name: 'Necklace (CZ)', count: 6, color: 'bg-[#B5935E]' },
                   { name: 'Alphabet Series', count: 4, color: 'bg-[#1B3022]' },
                   { name: 'Bracelet (Plain)', count: 3, color: 'bg-gray-200' }
                 ].map((item, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{item.name}</span>
                        <span>{item.count}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${(item.count/6)*100}%` }} />
                      </div>
                   </div>
                 ))}
               </div>
             </section>

             <section>
               <h4 className="text-[10px] font-black text-[#B5935E] uppercase mb-4 flex items-center gap-2"><Users size={14} /> Top Customer</h4>
               <div className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl border border-gray-50">
                  <div className="text-center flex-1 border-r">
                    <p className="text-lg font-serif">C</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Race</p>
                  </div>
                  <div className="text-center flex-1 border-r">
                    <p className="text-lg font-serif">20-35</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Age Group</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-serif">TnG</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Payment</p>
                  </div>
               </div>
             </section>
          </div>
          <Nav />
        </div>
      )}
    </div>
  );
};

export default PetalArchiveOS;
