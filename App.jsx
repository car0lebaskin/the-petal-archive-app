import React, { useState } from 'react';
import { 
  Plus, BarChart3, Settings, ChevronRight, MapPin, 
  Calendar, Users, CheckCircle2, Package, TrendingUp, Clock, History, LogOut, ShoppingBag, Trash2, LineChart, Layers, FileText, Database, Download, RefreshCw, ChevronDown, Wallet, ExternalLink
} from 'lucide-react';

const PetalArchiveOS = () => {
  // --- CORE STATE ---
  const [view, setView] = useState('input'); 
  const [step, setStep] = useState(0); 
  const [basket, setBasket] = useState([]);
  const [activePriceCat, setActivePriceCat] = useState(null);
  
  const [session, setSession] = useState({ 
    eventName: '', organiser: '', location: '', otherLocation: '', 
    date: new Date().toISOString().split('T')[0],
    boothFee: '', otherExpenses: 0
  });
  
  const [currentItem, setCurrentItem] = useState({
    category: '', series: '', style: '', metal: '', chain: '', otherChain: '', shape: '', otherShape: '', base: '', otherBase: '', colourLetter: '', otherColour: '', price: ''
  });

  const [customer, setCustomer] = useState({ race: 'C', age: '20s', gender: 'F', payment: 'TnG' });
  const [showSuccess, setShowSuccess] = useState(false);

  // --- HELPERS ---
  const toCaps = (val) => val ? val.toUpperCase() : '';
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-3 block">{children}</label>;
  const GridButton = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all ${active ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm active:bg-gray-50'}`}>{label}</button>
  );
  const StatBar = ({ label, percentage, color = "bg-[#B5935E]" }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] font-black uppercase text-gray-400"><span>{label}</span><span>{percentage}%</span></div>
      <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${percentage}%` }} /></div>
    </div>
  );

  // --- DATA ---
  const priceList = [
    { category: 'Necklaces', items: [{ name: 'Plain (STG/STU)', price: 'RM 114' }, { name: 'CZ / Alphabet', price: 'RM 124' }, { name: 'Pebble/Locket', price: 'RM 134' }] },
    { category: 'Bracelets', items: [{ name: 'Standard', price: 'RM 99' }, { name: 'Alphabet / CZ', price: 'RM 109' }, { name: 'Bangle', price: 'RM 119' }] }
  ];

  const todayRev = 1420; 
  const netProfit = todayRev - (Number(session.boothFee) || 0) - (Number(session.otherExpenses) || 0);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in">
        <div className="w-24 h-24 bg-[#1B3022] rounded-full flex items-center justify-center mb-6 shadow-2xl"><CheckCircle2 size={48} className="text-[#B5935E]" /></div>
        <h2 className="text-3xl font-serif italic text-[#1B3022]">Logged to Archive</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-5 max-w-md mx-auto overflow-x-hidden pb-32">
      
      {/* 0. STARTUP: KILLED BOOTH FEE */}
      {step === 0 && (
        <div className="pt-10 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-serif italic text-[#1B3022]">The Petal Archive</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-2">Sales Tracker</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-5">
            <div><Label>Event Name</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-50 uppercase text-xs font-bold" placeholder="E.G. 163 MALL MAY" value={session.eventName} onChange={e => setSession({...session, eventName: toCaps(e.target.value)})} /></div>
            <div><Label>Organiser</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-50 uppercase text-xs font-bold" placeholder="E.G. CURATE" value={session.organiser} onChange={e => setSession({...session, organiser: toCaps(e.target.value)})} /></div>
            <div>
              <Label>Location</Label>
              <div className="grid grid-cols-2 gap-2">
                {['163 Mall', 'Waterfront', 'Intermark', 'BSC', 'The Campus', 'Publika', 'Others'].map(loc => (<GridButton key={loc} label={loc} active={session.location === loc} onClick={() => setSession({...session, location: loc})} />))}
              </div>
              {session.location === 'Others' && <input className="w-full mt-2 p-3 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-50 text-xs font-bold uppercase" placeholder="SPECIFY LOCATION..." value={session.otherLocation} onChange={e => setSession({...session, otherLocation: toCaps(e.target.value)})} />}
            </div>
            <div><Label>Date</Label><input type="date" className="w-full p-4 bg-[#FDFBF7] rounded-2xl outline-none ring-1 ring-gray-50 text-[10px] font-bold" value={session.date} onChange={e => setSession({...session, date: e.target.value})} /></div>
            <button onClick={() => setStep(1)} disabled={!session.location || !session.eventName} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-green-900/20">Open Tracker</button>
          </div>
        </div>
      )}

      {/* 1. INPUT VIEW */}
      {step > 0 && view === 'input' && (
        <div className="space-y-6 animate-in slide-in-from-right">
          <div className="flex justify-between items-center bg-[#1B3022] p-4 rounded-2xl shadow-lg sticky top-0 z-10 border border-white/10">
             <div className="flex items-center gap-3 text-white"><ShoppingBag size={20} className="text-[#B5935E]" /><div><p className="text-[9px] font-black uppercase text-[#B5935E]">{basket.length} Items</p><p className="text-[10px] opacity-50 uppercase tracking-tighter">{session.eventName}</p></div></div>
             {basket.length > 0 && <button onClick={() => setStep(3)} className="bg-[#B5935E] text-[#1B3022] px-4 py-2 rounded-xl text-[10px] font-black uppercase">Checkout</button>}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <section><Label>1. Category</Label><div className="grid grid-cols-4 gap-2">{['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'].map(c => (<GridButton key={c} label={c} active={currentItem.category === c} onClick={() => setCurrentItem({...currentItem, category: c})} />))}</div></section>
              <section><Label>2. Chain</Label>
                <div className="grid grid-cols-4 gap-2">{['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (<GridButton key={ch} label={ch} active={currentItem.chain === ch} onClick={() => setCurrentItem({...currentItem, chain: ch})} />))}</div>
                {currentItem.chain === 'Others' && <input className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-[10px] font-black uppercase text-[#B5935E]" placeholder="SPECIFY CHAIN..." value={currentItem.otherChain} onChange={e => setCurrentItem({...currentItem, otherChain: toCaps(e.target.value)})} />}
              </section>
              <div className="grid grid-cols-2 gap-4">
                <section><Label>Series</Label><div className="grid grid-cols-1 gap-2">{['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (<GridButton key={s} label={s} active={currentItem.series === s} onClick={() => setCurrentItem({...currentItem, series: s})} />))}</div></section>
                <section><Label>Style</Label><div className="grid grid-cols-1 gap-2">{['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'Slider', 'None'].map(st => (<GridButton key={st} label={st} active={currentItem.style === st} onClick={() => setCurrentItem({...currentItem, style: st})} />))}</div></section>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black shadow-lg">NEXT: DETAILS</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <section><Label>Metal</Label><div className="grid grid-cols-4 gap-2">{['STU', 'STG', 'STR', 'Brass'].map(m => (<GridButton key={m} label={m} active={currentItem.metal === m} onClick={() => setCurrentItem({...currentItem, metal: m})} />))}</div></section>
              <section><Label>Shape</Label><div className="grid grid-cols-3 gap-2">{['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (<GridButton key={sh} label={sh} active={currentItem.shape === sh} onClick={() => setCurrentItem({...currentItem, shape: sh})} />))}</div>
                {currentItem.shape === 'Others' && <input className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-[10px] font-black uppercase" placeholder="SPECIFY SHAPE..." value={currentItem.otherShape} onChange={e => setCurrentItem({...currentItem, otherShape: toCaps(e.target.value)})} />}
              </section>
              <section><Label>Base</Label><div className="grid grid-cols-3 gap-2">{['MOP', 'Black', 'White', 'Clear', 'Others'].map(b => (<GridButton key={b} label={b} active={currentItem.base === b} onClick={() => setCurrentItem({...currentItem, base: b})} />))}</div>
                {currentItem.base === 'Others' && <input className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-[10px] font-black uppercase" placeholder="SPECIFY BASE..." value={currentItem.otherBase} onChange={e => setCurrentItem({...currentItem, otherBase: toCaps(e.target.value)})} />}
              </section>
              <section><Label>Colour/Letter</Label><div className="grid grid-cols-3 gap-2">{['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'].map(col => (<GridButton key={col} label={col} active={currentItem.colourLetter === col} onClick={() => setCurrentItem({...currentItem, colourLetter: col})} />))}</div>
                {currentItem.colourLetter === 'Others' && <input className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-[10px] font-black uppercase" placeholder="SPECIFY COLOUR/LETTER..." value={currentItem.otherColour} onChange={e => setCurrentItem({...currentItem, otherColour: toCaps(e.target.value)})} />}
              </section>
              <section><Label>Price (RM)</Label><input type="number" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none text-3xl font-serif text-[#1B3022]" placeholder="0" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} /></section>
              <div className="flex gap-4 pt-4"><button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button><button onClick={() => {setBasket([...basket, {...currentItem, id: Date.now()}]); setStep(1); setCurrentItem({category: '', series: '', style: '', metal: '', chain: '', otherChain: '', shape: '', otherShape: '', base: '', otherBase: '', colourLetter: '', otherColour: '', price: ''})}} disabled={!currentItem.price} className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black text-sm shadow-xl">ADD TO BASKET</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                <Label>Checkout Total</Label>
                <div className="text-7xl font-serif text-[#1B3022] mb-6 tracking-tighter">RM {basket.reduce((acc, item) => acc + Number(item.price || 0), 0)}</div>
                <div className="grid grid-cols-4 gap-2">{['TnG', 'Grab', 'Cash', 'Card'].map(p => (<button key={p} onClick={() => setCustomer({...customer, payment: p})} className={`py-3 text-[10px] font-black rounded-xl border ${customer.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50 text-gray-300'}`}>{p}</button>))}</div>
              </div>
              <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
                  <Label>Customer Profile</Label>
                  <div className="grid grid-cols-2 gap-3">{['F', 'M'].map(g => (<button key={g} onClick={() => setCustomer({...customer, gender: g})} className={`py-4 rounded-2xl border text-[11px] font-black ${customer.gender === g ? 'bg-[#1B3022] text-white' : 'bg-[#FDFBF7] text-gray-400'}`}>{g === 'F' ? 'FEMALE' : 'MALE'}</button>))}</div>
                  <div className="flex gap-2">{['C', 'M', 'I', 'O'].map(r => (<button key={r} onClick={() => setCustomer({...customer, race: r})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-400'}`}>{r}</button>))}</div>
                  <div className="flex gap-1">{['10s', '20s', '30s', '40s', '50s+'].map(a => (<button key={a} onClick={() => setCustomer({...customer, age: a})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${customer.age === a ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-400'}`}>{a}</button>))}</div>
              </section>
              <button onClick={() => { setShowSuccess(true); setBasket([]); setStep(1); setTimeout(() => setShowSuccess(false), 1200); }} className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl uppercase tracking-widest">LOG {basket.length} ITEMS</button>
            </div>
          )}
        </div>
      )}

      {/* 2. DASHBOARD: SESSION FOCUS */}
      {view === 'dashboard' && step > 0 && (
        <div className="space-y-6 pb-20 animate-in fade-in">
          <header className="text-center py-6"><h2 className="text-3xl font-serif italic">Session Dashboard</h2></header>
          <div className="bg-[#1B3022] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <TrendingUp className="absolute right-[-10px] top-[-10px] opacity-10" size={100} />
            <div className="flex justify-between items-end">
              <div><p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Revenue Today</p><h3 className="text-3xl font-serif italic">RM {todayRev}</h3></div>
              <div className="text-right border-l border-white/10 pl-6">
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-[#B5935E]">Net Profit</p>
                <h3 className="text-2xl font-serif italic text-[#B5935E]">RM {netProfit}</h3>
              </div>
            </div>
          </div>
          <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
             <Label>Audience Breakdown (Today)</Label>
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2"><StatBar label="Female" percentage={92} /><StatBar label="Male" percentage={8} color="bg-[#1B3022]" /></div>
                <div className="space-y-2"><StatBar label="Chinese" percentage={80} /><StatBar label="Malay" percentage={15} /></div>
             </div>
          </section>
        </div>
      )}

      {/* 3. HISTORY: BI INTEL & DEMOGRAPHICS */}
      {view === 'history' && step > 0 && (
        <div className="space-y-6 pb-20">
          <header className="text-center py-6"><h2 className="text-3xl font-serif italic text-[#1B3022]">Business BI</h2></header>
          <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <div>
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <Label>Lifetime Customer Base</Label>
                <Users size={16} className="text-[#B5935E]" />
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4"><StatBar label="Chinese" percentage={78} /><StatBar label="Malay" percentage={15} /><StatBar label="Other" percentage={7} /></div>
                <div className="space-y-4"><StatBar label="20s" percentage={60} color="bg-[#1B3022]" /><StatBar label="30s" percentage={30} color="bg-[#1B3022]" /><StatBar label="40s+" percentage={10} color="bg-[#1B3022]" /></div>
              </div>
            </div>

            <div className="pt-4">
              <Label>Spending Power by Bracket</Label>
              <div className="space-y-3">
                 {[
                   { group: 'Age: 30s-40s', avg: 'RM 145/pc', label: 'PREMIUM SEGMENT' },
                   { group: 'Age: 10s-20s', avg: 'RM 105/pc', label: 'VOLUME SEGMENT' }
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl border border-gray-50">
                      <div><p className="text-[10px] font-black text-[#1B3022] uppercase tracking-tighter">{stat.group}</p><p className="text-[7px] font-bold text-[#B5935E] tracking-widest">{stat.label}</p></div>
                      <div className="text-right font-serif italic text-[#1B3022]">{stat.avg}</div>
                   </div>
                 ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 4. SETTINGS: COMMAND CENTER */}
      {view === 'settings' && step > 0 && (
        <div className="space-y-6 pb-20">
          <header className="text-center py-6"><h2 className="text-3xl font-serif italic">Command Center</h2></header>
          <section className="grid grid-cols-2 gap-3">
             <button className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-2 shadow-sm"><Database className="text-[#B5935E]" size={24} /><span className="text-[9px] font-black uppercase tracking-widest">Master Sheet</span></button>
             <button className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-2 shadow-sm"><FileText className="text-[#B5935E]" size={24} /><span className="text-[9px] font-black uppercase tracking-widest">Internal Ref</span></button>
          </section>

          {/* Integrated Price Guide */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#1B3022] p-6 flex justify-between items-center text-white font-black text-[10px] uppercase tracking-widest">Bespoke Price Directory</div>
            <div className="p-4 space-y-2">
              {priceList.map((cat, idx) => (
                <div key={idx} className="border-b border-gray-50 last:border-0">
                  <button onClick={() => setActivePriceCat(activePriceCat === idx ? null : idx)} className="w-full py-4 flex justify-between items-center"><span className="text-[11px] font-black uppercase text-[#1B3022] tracking-wider">{cat.category}</span><ChevronDown size={16} className={`text-[#B5935E] transition-transform ${activePriceCat === idx ? 'rotate-180' : ''}`} /></button>
                  {activePriceCat === idx && (<div className="pb-4 space-y-3">{cat.items.map((it, i) => (<div key={i} className="flex justify-between items-center bg-[#FDFBF7] p-3 rounded-xl border border-gray-100"><span className="text-[10px] font-bold text-gray-400 uppercase">{it.name}</span><span className="text-xs font-serif italic text-[#1B3022]">{it.price}</span></div>))}</div>)}
                </div>
              ))}
            </div>
          </section>

          {/* Expense Logger */}
          <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
             <Label>Expense Logger</Label>
             <div className="space-y-4">
                <div className="flex gap-2">
                   <input type="number" className="flex-1 p-3 bg-[#FDFBF7] rounded-xl outline-none text-xs font-bold" placeholder="ADD BOOTH FEE / MISC..." />
                   <button className="p-3 bg-[#1B3022] text-white rounded-xl"><Plus size={18}/></button>
                </div>
             </div>
          </section>

          <button onClick={() => setStep(0)} className="w-full bg-red-50 text-red-400 py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100">
            <LogOut size={16}/> End Session
          </button>
        </div>
      )}

      {/* NAVIGATION BAR */}
      {step > 0 && (
        <nav className="fixed bottom-8 left-6 right-6 bg-[#1B3022] rounded-[2.5rem] p-2 flex justify-around items-center z-50 shadow-2xl border border-white/5">
          <button onClick={() => setView('input')} className={`p-4 rounded-2xl transition-all ${view === 'input' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500'}`}><Plus size={22} /></button>
          <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500'}`}><BarChart3 size={22} /></button>
          <button onClick={() => setView('history')} className={`p-4 rounded-2xl transition-all ${view === 'history' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500'}`}><History size={22} /></button>
          <button onClick={() => setView('settings')} className={`p-4 rounded-2xl transition-all ${view === 'settings' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500'}`}><Settings size={22} /></button>
        </nav>
      )}
    </div>
  );
};

export default PetalArchiveOS;
