import React, { useState } from 'react';
import { 
  Plus, BarChart3, Settings, ChevronRight, MapPin, 
  Calendar, Users, CheckCircle2, Package, TrendingUp, X, LogOut
} from 'lucide-react';

const PetalArchiveOS = () => {
  const [view, setView] = useState('input'); 
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
    customer: { race: 'C', age: '20-35', gender: 'F' }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toCaps = (val) => val.toUpperCase();

  // --- STYLING HELPERS ---
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-3 block">{children}</label>;

  const GridButton = ({ label, active, onClick, cols = "grid-cols-3" }) => (
    <button 
      onClick={onClick}
      className={`py-3.5 px-1 rounded-xl border text-[10px] font-black transition-all duration-200
        ${active ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md scale-[0.98]' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm'}`}
    >
      {label}
    </button>
  );

  // --- DASHBOARD VISUAL COMPONENTS ---
  const StatBar = ({ label, percentage, color = "bg-[#B5935E]" }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-[#1B3022] rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <CheckCircle2 size={48} className="text-[#B5935E]" />
        </div>
        <h2 className="text-3xl font-serif italic text-[#1B3022]">Logged</h2>
        <p className="text-[#B5935E] font-bold text-[10px] uppercase tracking-widest mt-2">Sale Archive Updated</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-5 max-w-md mx-auto overflow-x-hidden">
      
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
              <input className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-50 uppercase text-xs font-bold" placeholder="E.G. CURATE / BAZAAR" value={session.organiser} onChange={e => setSession({...session, organiser: toCaps(e.target.value)})} />
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
              <input type="date" className="w-full p-4 bg-[#FDFBF7] rounded-2xl outline-none ring-1 ring-gray-50" value={session.date} onChange={e => setSession({...session, date: e.target.value})} />
            </div>
            <button onClick={() => setStep(1)} disabled={!session.location} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold text-lg shadow-lg">Open Tracker</button>
          </div>
        </div>
      )}

      {/* 1. INPUT VIEW */}
      {step > 0 && view === 'input' && (
        <div className="pb-28 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6 bg-white/60 p-3 rounded-2xl border border-white backdrop-blur-sm shadow-sm">
             <div className="text-[9px] font-black text-[#B5935E] uppercase tracking-tighter">
               {session.organiser} @ {session.location === 'Others' ? session.otherLocation : session.location}
             </div>
             <div className="text-[9px] font-bold text-gray-300 italic">{session.date}</div>
          </div>

          {step === 1 && (
            <div className="space-y-7">
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
              <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl mt-4">NEXT: BUILD DETAILS</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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
                <div className="grid grid-cols-4 gap-2">
                  {['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (
                    <GridButton key={ch} label={ch} active={sale.chain === ch} onClick={() => setSale({...sale, chain: ch})} />
                  ))}
                </div>
                {sale.chain === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase text-[#B5935E]" placeholder="SPECIFY CHAIN (ALL CAPS)..." onChange={e => setSale({...sale, otherChain: toCaps(e.target.value)})} />}
              </section>

              <section>
                <Label>Shape Selection</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (
                    <GridButton key={sh} label={sh} active={sale.shape === sh} onClick={() => setSale({...sale, shape: sh})} />
                  ))}
                </div>
                {sale.shape === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase text-[#B5935E]" placeholder="SPECIFY SHAPE..." onChange={e => setSale({...sale, otherShape: toCaps(e.target.value)})} />}
              </section>

              <section>
                <Label>Base Selection</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['MOP (P)', 'Black (B)', 'White (W)', 'Clear (C)', 'Others'].map(b => (
                    <GridButton key={b} label={b} active={sale.base === b} onClick={() => setSale({...sale, base: b})} />
                  ))}
                </div>
                {sale.base === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase text-[#B5935E]" placeholder="SPECIFY BASE..." onChange={e => setSale({...sale, otherBase: toCaps(e.target.value)})} />}
              </section>

              <section>
                <Label>Colour / Letter</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'].map(col => (
                    <GridButton key={col} label={col} active={sale.colourLetter === col} onClick={() => setSale({...sale, colourLetter: col})} />
                  ))}
                </div>
                {sale.colourLetter === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase text-[#B5935E]" placeholder="SPECIFY COLOUR/LETTER..." onChange={e => setSale({...sale, otherColour: toCaps(e.target.value)})} />}
              </section>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">Back</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-[#1B3022] text-white py-4 rounded-2xl font-black text-sm shadow-xl">PAYMENT & PROFILE</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                <Label>Price (RM)</Label>
                <input type="number" className="w-full text-7xl font-serif text-[#1B3022] text-center outline-none bg-transparent" placeholder="0" value={sale.price} onChange={e => setSale({...sale, price: e.target.value})} autoFocus />
                <div className="flex gap-2 mt-10">
                  {['TnG', 'Grab', 'Cash', 'Card'].map(p => (
                    <button key={p} onClick={() => setSale({...sale, payment: p})} className={`flex-1 py-3 text-[10px] font-black rounded-xl border ${sale.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50 text-gray-300 border-transparent'}`}>{p}</button>
                  ))}
                </div>
              </div>

              <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                <Label>Customer Persona</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['F', 'M'].map(g => (
                    <button key={g} onClick={() => setSale({...sale, customer: {...sale.customer, gender: g}})} className={`py-4 rounded-2xl border text-[11px] font-black transition-all ${sale.customer.gender === g ? 'bg-[#1B3022] text-white' : 'bg-[#FDFBF7] text-gray-400'}`}>{g === 'F' ? 'FEMALE' : 'MALE'}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {['C', 'M', 'I', 'O'].map(r => (
                    <button key={r} onClick={() => setSale({...sale, customer: {...sale.customer, race: r}})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${sale.customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-400 border-transparent'}`}>{r}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {['<20', '20-35', '35-50', '50+'].map(a => (
                    <button key={a} onClick={() => setSale({...sale, customer: {...sale.customer, age: a}})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${sale.customer.age === a ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-400 border-transparent'}`}>{a}</button>
                  ))}
                </div>
              </section>

              <button onClick={() => { setIsSaving(true); setTimeout(() => { setShowSuccess(true); setIsSaving(false); setTimeout(() => { setShowSuccess(false); setStep(1); setSale({...sale, price: ''}); }, 1
 
