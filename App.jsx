import React, { useState } from 'react';
import { 
  Plus, BarChart3, Settings, ChevronRight, MapPin, 
  Calendar, Users, CheckCircle2, Package, TrendingUp 
} from 'lucide-react';

const PetalArchiveOS = () => {
  // --- STATE ---
  const [view, setView] = useState('input'); // 'input' or 'dashboard'
  const [step, setStep] = useState(0); 
  const [session, setSession] = useState({
    organiser: '', location: '', otherLocation: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [sale, setSale] = useState({
    category: '', series: '', style: '', metal: 'STG', 
    chain: '', otherChain: '', shape: '', otherShape: '', 
    base: 'MOP (P)', otherBase: '', colourLetter: '', otherColour: '', 
    price: '', payment: 'TnG',
    customer: { race: 'C', age: '20s', gender: 'F' }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- LOGIC ---
  const handleLog = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStep(1);
        setSale({...sale, category: '', series: '', style: '', chain: '', otherChain: '', shape: '', otherShape: '', colourLetter: '', otherColour: '', price: ''});
      }, 1200);
    }, 800);
  };

  const toCaps = (val) => val.toUpperCase();

  // --- REUSABLE UI ---
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2 block">{children}</label>;

  const GridButton = ({ label, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`py-3 px-1 rounded-xl border text-[10px] font-bold transition-all
        ${active ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm'}`}
    >
      {label}
    </button>
  );

  // --- VIEWS ---

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[#1B3022] rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 size={40} className="text-[#B5935E]" />
        </div>
        <h2 className="text-2xl font-serif italic text-[#1B3022]">Archive Updated</h2>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="animate-in fade-in duration-500 pb-24">
      <header className="text-center py-8">
        <h2 className="text-3xl font-serif italic text-[#1B3022]">Live Insights</h2>
        <p className="text-[9px] text-[#B5935E] font-bold uppercase tracking-[0.3em] mt-1">Real-time Performance</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1B3022] p-5 rounded-[2rem] text-white shadow-xl">
          <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">Est. Revenue</p>
          <h3 className="text-2xl font-serif italic mt-1">RM 845</h3>
          <div className="flex items-center gap-1 text-[9px] text-[#B5935E] mt-2 font-bold uppercase">
            <TrendingUp size={12} /> vs Last Event
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold text-[#B5935E] uppercase tracking-widest">Pieces Sold</p>
          <h3 className="text-2xl font-serif italic text-[#1B3022] mt-1">12</h3>
          <p className="text-[9px] text-gray-300 font-bold uppercase mt-2">Bazaar Goal: 20</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-6">
        <section>
          <h4 className="text-[10px] font-black text-[#B5935E] uppercase mb-4 flex items-center gap-2"><Package size={14} /> Hot Sellers</h4>
          <div className="space-y-3">
            {['Necklace (CZ)', 'Alphabet Series', 'Earrings'].map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-[#FDFBF7] p-3 rounded-xl border border-gray-50">
                <span className="text-[11px] font-bold text-[#1B3022] uppercase tracking-tighter">{item}</span>
                <span className="text-xs font-serif italic text-[#B5935E]">{8 - (i*2)} sold</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const renderInputFlow = () => (
    <div className="animate-in slide-in-from-right duration-300 pb-28">
      {/* Tracker Status Header */}
      <div className="flex justify-between items-center mb-6 bg-white/50 p-3 rounded-2xl border border-white">
         <div className="text-[9px] font-black text-[#B5935E] uppercase tracking-tighter">
           {session.organiser} @ {session.location === 'Others' ? session.otherLocation : session.location}
         </div>
         <div className="text-[9px] font-bold text-gray-300">{session.date}</div>
      </div>

      {/* STEP 1: IDENTITY */}
      {step === 1 && (
        <div className="space-y-6">
          <section>
            <Label>1. Main Item</Label>
            <div className="grid grid-cols-4 gap-2">
              {['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'].map(c => (
                <GridButton key={c} label={c} active={sale.category === c} onClick={() => setSale({...sale, category: c})} />
              ))}
            </div>
          </section>
          <section>
            <Label>2. Series</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket'].map(s => (
                <GridButton key={s} label={s} active={sale.series === s} onClick={() => setSale({...sale, series: s})} />
              ))}
            </div>
          </section>
          <section>
            <Label>3. Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle'].map(st => (
                <GridButton key={st} label={st} active={sale.style === st} onClick={() => setSale({...sale, style: st})} />
              ))}
            </div>
          </section>
          <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold shadow-lg mt-4">Next: Build Details</button>
        </div>
      )}

      {/* STEP 2: BUILD & COLOUR */}
      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <section>
            <Label>Metal</Label>
            <div className="grid grid-cols-4 gap-2">
              {['STU', 'STG', 'STR', 'Brass'].map(m => (
                <GridButton key={m} label={m} active={sale.metal === m} onClick={() => setSale({...sale, metal: m})} />
              ))}
            </div>
          </section>

          <section>
            <Label>Chain Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (
                <GridButton key={ch} label={ch} active={sale.chain === ch} onClick={() => setSale({...sale, chain: ch})} />
              ))}
            </div>
            {sale.chain === 'Others' && (
              <input 
                className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-[10px] uppercase font-bold" 
                placeholder="TYPE CHAIN TYPE (ALL CAPS)..." 
                onChange={e => setSale({...sale, otherChain: toCaps(e.target.value)})} 
              />
            )}
          </section>

          <section>
            <Label>Shape & Base</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (
                  <GridButton key={sh} label={sh} active={sale.shape === sh} onClick={() => setSale({...sale, shape: sh})} />
                ))}
              </div>
              <div className="space-y-2">
                {['MOP (P)', 'Black (B)', 'White (W)', 'Clear (C)', 'Others'].map(b => (
                  <GridButton key={b} label={b} active={sale.base === b} onClick={() => setSale({...sale, base: b})} />
                ))}
              </div>
            </div>
            {(sale.shape === 'Others' || sale.base === 'Others') && (
              <div className="flex gap-2 mt-2">
                {sale.shape === 'Others' && <input className="flex-1 p-3 text-[10px] bg-white border border-gray-100 rounded-xl uppercase" placeholder="OTHER SHAPE..." onChange={e => setSale({...sale, otherShape: toCaps(e.target.value)})} />}
                {sale.base === 'Others' && <input className="flex-1 p-3 text-[10px] bg-white border border-gray-100 rounded-xl uppercase" placeholder="OTHER BASE..." onChange={e => setSale({...sale, otherBase: toCaps(e.target.value)})} />}
              </div>
            )}
          </section>

          <section>
            <Label>Colour / Letter</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'].map(col => (
                <GridButton key={col} label={col} active={sale.colourLetter === col} onClick={() => setSale({...sale, colourLetter: col})} />
              ))}
            </div>
            {sale.colourLetter === 'Others' && (
              <input className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-[10px] uppercase font-bold" placeholder="SPECIFY (ALL CAPS)..." onChange={e => setSale({...sale, otherColour: toCaps(e.target.value)})} />
            )}
          </section>

          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button>
            <button onClick={() => setStep(3)} className="flex-[2] bg-[#1B3022] text-white py-4 rounded-2xl font-bold shadow-lg">Finalize Price</button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT & PROFILE */}
      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-400">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 text-center shadow-sm">
            <Label>Amount (RM)</Label>
            <input type="number" className="w-full text-6xl font-serif text-[#1B3022] text-center outline-none bg-transparent" placeholder="0" value={sale.price} onChange={e => setSale({...sale, price: e.target.value})} />
            <div className="flex gap-1 mt-8">
              {['TnG', 'Grab', 'Cash', 'Card'].map(p => (
                <button key={p} onClick={() => setSale({...sale, payment: p})} className={`flex-1 py-2 text-[10px] font-black rounded-lg border transition-all ${sale.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50 text-gray-300 border-transparent'}`}>{p}</button>
              ))}
            </div>
          </div>

          <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <Label>Customer Profile</Label>
            <div className="grid grid-cols-2 gap-2">
              {['F', 'M'].map(g => (
                <button key={g} onClick={() => setSale({...sale, customer: {...sale.customer, gender: g}})} className={`py-3 rounded-xl border text-[10px] font-black transition-all ${sale.customer.gender === g ? 'bg-[#1B3022] text-white' : 'bg-[#FDFBF7] text-gray-300 border-gray-50'}`}>{g === 'F' ? 'FEMALE' : 'MALE'}</button>
              ))}
            </div>
            <div className="flex gap-1">
              {['C', 'M', 'I', 'O'].map(r => (
                <button key={r} onClick={() => setSale({...sale, customer: {...sale.customer, race: r}})} className={`flex-1 py-2 rounded-lg border text-[10px] font-black ${sale.customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-300 border-transparent'}`}>{r}</button>
              ))}
            </div>
            <div className="flex gap-1">
              {['<20', '20-35', '35-50', '50+'].map(a => (
                <button key={a} onClick={() => setSale({...sale, customer: {...sale.customer, age: a}})} className={`flex-1 py-2 rounded-lg border text-[10px] font-black ${sale.customer.age === a ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-300 border-transparent'}`}>{a}</button>
              ))}
            </div>
          </section>

          <button onClick={handleLog} className="w-full bg-[#1B3022] text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-green-900/30">LOG SALE</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-4 max-w-md mx-auto overflow-x-hidden">
      {/* 0. SALES TRACKER SETUP */}
      {step === 0 && (
        <div className="pt-10 space-y-8 animate-in fade-in duration-500">
          <div className="text-center">
            <h1 className="text-4xl font-serif italic text-[#1B3022]">The Petal Archive</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-2">Sales Tracker</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div>
              <Label>Organiser</Label>
              <input className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-100 uppercase text-xs font-bold" placeholder="E.G. CURATE / BAZAAR" value={session.organiser} onChange={e => setSession({...session, organiser: toCaps(e.target.value)})} />
            </div>
            <div>
              <Label>Location</Label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['TRX Plaza', 'Waterfront', 'Intermark', 'BSC', 'Campus', 'Publika', 'Others'].map(loc => (
                  <GridButton key={loc} label={loc} active={session.location === loc} onClick={() => setSession({...session, location: loc})} />
                ))}
              </div>
              {session.location === 'Others' && <input className="w-full p-4 bg-[#FDFBF7] rounded-2xl outline-none ring-1 ring-gray-100 text-xs uppercase font-bold" placeholder="TYPE LOCATION..." onChange={e => setSession({...session, otherLocation: toCaps(e.target.value)})} />}
            </div>
            <div>
              <Label>Date</Label>
              <input type="date" className="w-full p-4 bg-[#FDFBF7] rounded-2xl outline-none ring-1 ring-gray-100" value={session.date} onChange={e => setSession({...session, date: e.target.value})} />
            </div>
            <button onClick={() => setStep(1)} disabled={!session.location} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold text-lg shadow-lg">Open Tracker</button>
          </div>
        </div>
      )}

      {step > 0 && (
        <>
          {view === 'input' ? renderInputFlow() : renderDashboard()}
          
          <nav className="fixed bottom-6 left-4 right-4 bg-[#1B3022] rounded-[2rem] p-2 flex justify-around items-center z-50 border border-white/5 shadow-2xl">
            <button onClick={() => setView('input')} className={`p-4 rounded-2xl transition-all ${view === 'input' ? 'bg-[#B5935E] text-white' : 'text-gray-500'}`}><Plus size={24} /></button>
            <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-[#B5935E] text-white' : 'text-gray-500'}`}><BarChart3 size={24} /></button>
            <button onClick={() => setStep(0)} className="p-4 text-gray-500"><Settings size={24} /></button>
          </nav>
        </>
      )}
    </div>
  );
};

export default PetalArchiveOS;
