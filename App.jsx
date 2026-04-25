import React, { useState } from 'react';
import { 
  Plus, BarChart3, Settings, ChevronRight, MapPin, 
  Calendar, Users, CheckCircle2, Package, TrendingUp, Clock, History, LogOut
} from 'lucide-react';

const PetalArchiveOS = () => {
  const [view, setView] = useState('input'); 
  const [step, setStep] = useState(0); 
  const [session, setSession] = useState({
    organiser: '', location: '', otherLocation: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [sale, setSale] = useState({
    category: '', series: '', style: '', metal: '', 
    chain: '', otherChain: '', shape: '', otherShape: '', 
    base: '', otherBase: '', colourLetter: '', otherColour: '', 
    price: '', payment: 'TnG',
    customer: { race: 'C', age: '20-35', gender: 'F' }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toCaps = (val) => val.toUpperCase();

  // --- STYLING HELPERS ---
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-3 block">{children}</label>;

  const GridButton = ({ label, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`py-3.5 px-1 rounded-xl border text-[10px] font-black transition-all duration-200
        ${active ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md scale-[0.98]' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm'}`}
    >
      {label}
    </button>
  );

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
        <p className="text-[#B5935E] font-bold text-[10px] uppercase tracking-widest mt-2 font-bold">Sales Sheet Updated</p>
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
              <input type="date" className="w-full p-4 bg-[#FDFBF7] rounded-2xl outline-none ring-1 ring-gray-100" value={session.date} onChange={e => setSession({...session, date: e.target.value})} />
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
                <Label>2. Chain Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (
                    <GridButton key={ch} label={ch} active={sale.chain === ch} onClick={() => setSale({...sale, chain: ch})} />
                  ))}
                </div>
                {sale.chain === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase text-[#B5935E]" placeholder="SPECIFY CHAIN..." onChange={e => setSale({...sale, otherChain: toCaps(e.target.value)})} />}
              </section>

              <div className="grid grid-cols-2 gap-4">
                <section>
                  <Label>3. Series</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (
                      <GridButton key={s} label={s} active={sale.series === s} onClick={() => setSale({...sale, series: s})} />
                    ))}
                  </div>
                </section>
                <section>
                  <Label>4. Style</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'Slider', 'None'].map(st => (
                      <GridButton key={st} label={st} active={sale.style === st} onClick={() => setSale({...sale, style: st})} />
                    ))}
                  </div>
                </section>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl mt-4">NEXT: MATERIALS</button>
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
                <Label>Shape Selection</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (
                    <GridButton key={sh} label={sh} active={sale.shape === sh} onClick={() => setSale({...sale, shape: sh})} />
                  ))}
                </div>
                {sale.shape === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase text-[#B59
