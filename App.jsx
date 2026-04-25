import React, { useState } from 'react';
import { 
  Plus, BarChart3, Settings, ChevronRight, MapPin, 
  Calendar, Users, CheckCircle2, Package, TrendingUp, Clock, History, LogOut, ShoppingBag, Trash2, LineChart, Wallet, Layers
} from 'lucide-react';

const PetalArchiveOS = () => {
  const [view, setView] = useState('input'); 
  const [step, setStep] = useState(0); 
  const [basket, setBasket] = useState([]);
  
  // Setup state now includes "Event Name" to lump days together
  const [session, setSession] = useState({ 
    eventName: '', // e.g. "Curate x TRX April"
    organiser: '', 
    location: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  
  const [currentItem, setCurrentItem] = useState({
    category: '', series: '', style: '', metal: '', chain: '', otherChain: '', shape: '', otherShape: '', base: '', otherBase: '', colourLetter: '', otherColour: '', price: ''
  });

  const [customer, setCustomer] = useState({ race: 'C', age: '20-35', gender: 'F', payment: 'TnG' });
  const [showSuccess, setShowSuccess] = useState(false);

  // --- HELPERS ---
  const toCaps = (val) => val.toUpperCase();
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-3 block">{children}</label>;
  const StatBar = ({ label, percentage, color = "bg-[#B5935E]" }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] font-black uppercase text-gray-400"><span>{label}</span><span>{percentage}%</span></div>
      <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${percentage}%` }} /></div>
    </div>
  );

  const GridButton = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all ${active ? 'bg-[#1B3022] text-white border-[#1B3022]' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm'}`}>{label}</button>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in">
        <div className="w-20 h-20 bg-[#1B3022] rounded-full flex items-center justify-center mb-4 shadow-xl"><CheckCircle2 size={40} className="text-[#B5935E]" /></div>
        <h2 className="text-2xl font-serif italic text-[#1B3022]">Logged</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-5 max-w-md mx-auto overflow-x-hidden pb-32">
      
      {/* 0. STARTUP: EVENT GROUPING SETUP */}
      {step === 0 && (
        <div className="pt-10 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-serif italic text-[#1B3022]">The Petal Archive</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-2">Sales Tracker</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-5">
            <div><Label>Event Name (Lump Weekend)</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-100 uppercase text-xs font-bold" placeholder="E.G. TRX APRIL WEEKEND" value={session.eventName} onChange={e => setSession({...session, eventName: toCaps(e.target.value)})} /></div>
            <div><Label>Organiser</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-100 uppercase text-xs font-bold" placeholder="E.G. CURATE" value={session.organiser} onChange={e => setSession({...session, organiser: toCaps(e.target.value)})} /></div>
            <div><Label>Location</Label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['163 Mall', 'Waterfront', 'Intermark', 'BSC', 'The Campus', 'Publika'].map(loc => (<GridButton key={loc} label={loc} active={session.location === loc} onClick={() => setSession({...session, location: loc})} />))}
              </div>
            </div>
            <div><Label>Date</Label><input type="date" className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none ring-1 ring-gray-100" value={session.date} onChange={e => setSession({...session, date: e.target.value})} /></div>
            <button onClick={() => setStep(1)} disabled={!session.location || !session.eventName} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold text-lg">Open Session</button>
          </div>
        </div>
      )}

      {/* 1. INPUT VIEW */}
      {step > 0 && view === 'input' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#1B3022] p-4 rounded-2xl shadow-lg sticky top-0 z-10">
             <div className="flex items-center gap-3 text-white"><ShoppingBag size={20} className="text-[#B5935E]" /><div><p className="text-[9px] font-black uppercase text-[#B5935E]">{basket.length} Items</p><p className="text-[10px] opacity-50 uppercase tracking-tighter">{session.eventName}</p></div></div>
             {basket.length > 0 && <button onClick={() => setStep(3)} className="bg-[#B5935E] text-[#1B3022] px-4 py-2 rounded-xl text-[10px] font-black uppercase">Checkout</button>}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <section><Label>1. Category</Label><div className="grid grid-cols-4 gap-2">{['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'].map(c => (<GridButton key={c} label={c} active={currentItem.category === c} onClick={() => setCurrentItem({...currentItem, category: c})} />))}</div></section>
              <section><Label>2. Chain</Label><div className="grid grid-cols-4 gap-2">{['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (<GridButton key={ch} label={ch} active={currentItem.chain === ch} onClick={() => setCurrentItem({...currentItem, chain: ch})} />))}</div></section>
              <div className="grid grid-cols-2 gap-4">
                <section><Label>Series</Label><div className="grid grid-cols-1 gap-2">{['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (<GridButton key={s} label={s} active={currentItem.series === s} onClick={() => setCurrentItem({...currentItem, series: s})} />))}</div></section>
                <section><Label>Style</Label><div className="grid grid-cols-1 gap-2">{['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'Slider', 'None'].map(st => (<GridButton key={st} label={st} active={currentItem.style === st} onClick={() => setCurrentItem({...currentItem, style: st})} />))}</div></section>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black">NEXT: DETAILS</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <section><Label>Metal</Label><div className="grid grid-cols-4 gap-2">{['STU', 'STG', 'STR', 'Brass'].map(m => (<GridButton key={m} label={m} active={currentItem.metal === m} onClick={() => setCurrentItem({...currentItem, metal: m})} />))}</div></section>
              <section><Label>Shape</Label><div className="grid grid-cols-3 gap-2">{['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (<GridButton key={sh} label={sh} active={currentItem.shape === sh} onClick={() => setCurrentItem({...currentItem, shape: sh})} />))}</div></section>
              <section><Label>Base</Label><div className="grid grid-cols-3 gap-2">{['MOP', 'Black', 'White', 'Clear', 'Others'].map(b => (<GridButton key={b} label={b} active={currentItem.base === b} onClick={() => setCurrentItem({...currentItem, base: b})} />))}</div></section>
              <section><Label>Colour/Letter</Label><div className="grid grid-cols-3 gap-2">{['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'].map(col => (<GridButton key={col} label={col} active={currentItem.colourLetter === col} onClick={() => setCurrentItem({...currentItem, colourLetter: col})} />))}</div></section>
              <section><Label>Price (RM)</Label><input type="number" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none text-2xl font-serif" placeholder="0" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} /></section>
              <div className="flex gap-4 pt-4"><button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button><button onClick={() => {setBasket([...basket, {...currentItem, id: Date.now()}]); setStep(1); setCurrentItem({category: '', series: '', style: '', metal: '', chain: '', shape: '', base: '', colourLetter: '', price: ''})}} disabled={!currentItem.price} className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black text-sm shadow-xl">ADD TO BASKET</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                <Label>Today's Total</Label>
                <div className="text-6xl font-serif text-[#1B3022] mb-6">RM {basket.reduce((acc, item) => acc + Number(item.price || 0), 0)}</div>
                <div className="grid grid-cols-4 gap-2">{['TnG', 'Grab', 'Cash', 'Card'].map(p => (<button key={p} onClick={() => setCustomer({...customer, payment: p})} className={`py-3 text-[10px] font-black rounded-xl border ${customer.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50 text-gray-300'}`}>{p}</button>))}</div>
              </div>
              <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
                  <Label>Customer Profile (Today)</Label>
                  <div className="grid grid-cols-2 gap-3">{['F', 'M'].map(g => (<button key={g} onClick={() => setCustomer({...customer, gender: g})} className={`py-4 rounded-2xl border text-[11px] font-black ${customer.gender === g ? 'bg-[#1B3022] text-white' : 'bg-[#FDFBF7] text-gray-400'}`}>{g === 'F' ? 'FEMALE' : 'MALE'}</button>))}</div>
                  <div className="flex gap-2">{['C', 'M', 'I', 'O'].map(r => (<button key={r} onClick={() => setCustomer({...customer, race: r})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-400'}`}>{r}</button>))}</div>
              </section>
              <button onClick={() => { setShowSuccess(true); setBasket([]); setStep(1); setTimeout(() => setShowSuccess(false), 1200); }} className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl uppercase">LOG {basket.length} ITEMS</button>
            </div>
          )}
        </div>
      )}

      {/* 2. SESSION STATS (Puretly Current Day) */}
      {view === 'dashboard' && step > 0 && (
        <div className="space-y-6 pb-20 animate-in fade-in">
          <header className="text-center py-6">
            <h2 className="text-3xl font-serif italic">Session Stats</h2>
            <p className="text-[9px] text-[#B5935E] font-black uppercase tracking-widest">{session.date}</p>
          </header>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1B3022] p-6 rounded-[2rem] text-white shadow-xl h-32 flex flex-col justify-between">
              <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Revenue Today</p>
              <h3 className="text-3xl font-serif italic">RM 840</h3>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-32 flex flex-col justify-between">
              <p className="text-[9px] font-bold text-[#B5935E] uppercase tracking-widest">Payments (Today)</p>
              <div className="space-y-1.5"><StatBar label="TnG" percentage={85} /><StatBar label="Cash" percentage={15} /></div>
            </div>
          </div>

          <section className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm">
            <Label>Top Items Bought (Today)</Label>
            <div className="space-y-3">
              {[{n: 'Necklace', c: 6}, {n: 'Earrings', c: 4}, {n: 'Bracelet', c: 2}].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter"><span>{item.n}</span><span className="font-serif italic text-[#B5935E]">{item.c} sold</span></div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm">
            <Label>Customer Profile (Today)</Label>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3"><p className="text-[8px] font-black text-gray-400 border-b">ETHNICITY</p><StatBar label="C" percentage={80} /><StatBar label="M" percentage={15} /><StatBar label="I" percentage={5} /></div>
              <div className="space-y-3"><p className="text-[8px] font-black text-gray-400 border-b">AGE</p><StatBar label="20-35" percentage={70} /><StatBar label="35-50" percentage={20} /><StatBar label="50+" percentage={10} /></div>
            </div>
          </section>
        </div>
      )}

      {/* 3. BUSINESS BI (Historical & Normalized) */}
      {view === 'history' && step > 0 && (
        <div className="space-y-6 pb-20 animate-in fade-in">
          <header className="text-center py-6"><h2 className="text-3xl font-serif italic text-[#1B3022]">Business BI</h2></header>

          <section className="bg-[#1B3022] p-8 rounded-[3rem] text-white shadow-xl">
            <div className="flex justify-between items-center mb-4"><Label><span className="text-[#B5935E]">Location ARPD</span></Label><Layers size={14} className="text-[#B5935E]"/></div>
            <p className="text-[10px] opacity-50 mb-4 tracking-widest uppercase">Avg. Revenue Per Day (Normalized)</p>
            <div className="space-y-4">
              {[
                { loc: 'TRX Plaza', arpd: 'RM 1,200', perf: 100 },
                { loc: 'Waterfront', arpd: 'RM 1,050', perf: 85 },
                { loc: 'Publika', arpd: 'RM 920', perf: 70 }
              ].map((l, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase"><span>{l.loc}</span><span className="font-serif italic text-[#B5935E]">{l.arpd}</span></div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#B5935E]" style={{ width: `${l.perf}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <Label>Monthly Peaks (Seasonal)</Label>
            <div className="flex items-end gap-1 h-24 pt-4">
              {[{m:'J',r:40,t:'CNY'},{m:'F',r:80,t:'VAL'},{m:'M',r:30},{m:'A',r:25},{m:'M',r:60,t:'MOTHER'},{m:'J',r:20}].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                  {d.t && <div className="absolute top-[-12px] text-[6px] bg-[#B5935E] text-[#1B3022] px-1 rounded font-black whitespace-nowrap">{d.t}</div>}
                  <div className={`w-full rounded-t-sm ${d.r > 50 ? 'bg-[#B5935E]' : 'bg-[#1B3022] opacity-80'}`} style={{ height: `${d.r}%` }} />
                  <span className="text-[7px] font-black text-gray-300 uppercase">{d.m}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <Label>Lumped Event History</Label>
            <div className="space-y-4">
              {['TRX Weekend - April (RM 3.4k)', 'Waterfront Bazaar - March (RM 2.8k)'].map((ev, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter border-b border-gray-50 pb-2"><span>{ev.split(' (')[0]}</span><span className="font-serif italic text-[#B5935E]">{ev.split(' (')[1].replace(')', '')}</span></div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm">
            <Label>Lifetime Customer Base</Label>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3"><p className="text-[8px] font-black text-gray-400 border-b uppercase">Ethnicity</p><StatBar label="Chinese" percentage={78} /><StatBar label="Malay" percentage={12} /></div>
              <div className="space-y-3"><p className="text-[8px] font-black text-gray-400 border-b uppercase">Products</p><StatBar label="Necklace" percentage={60} color="bg-[#1B3022]"/><StatBar label="Ring" percentage={20} color="bg-[#1B3022]"/></div>
            </div>
          </section>
        </div>
      )}

      {/* 4. SETTINGS */}
      {view === 'settings' && step > 0 && (
        <div className="pt-10 pb-20 animate-in slide-in-from-bottom"><div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 text-center"><h2 className="text-3xl font-serif italic text-[#1B3022] mb-8">Session Details</h2><div className="space-y-6 text-left mb-12"><div className="flex justify-between border-b pb-4"><Label>Event</Label><span className="text-xs font-bold uppercase">{session.eventName}</span></div><div className="flex justify-between border-b pb-4"><Label>Location</Label><span className="text-xs font-bold uppercase">{session.location}</span></div></div><button onClick={() => setStep(0)} className="w-full bg-red-50 text-red-400 py-4 rounded-2xl font-black text-[10px] uppercase">End Session</button></div></div>
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
