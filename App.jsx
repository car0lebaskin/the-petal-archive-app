import React, { useState, useEffect } from 'react';
import { 
  Plus, BarChart3, Settings, ChevronRight, MapPin, 
  Calendar, Users, CheckCircle2, Package, TrendingUp, Clock, History, LogOut, ShoppingBag, Trash2
} from 'lucide-react';

const PetalArchiveOS = () => {
  const [view, setView] = useState('input'); 
  const [step, setStep] = useState(0); 
  const [basket, setBasket] = useState([]);
  const [session, setSession] = useState({ organiser: '', location: '', otherLocation: '', date: new Date().toISOString().split('T')[0] });
  
  const [currentItem, setCurrentItem] = useState({
    category: '', series: '', style: '', metal: '', chain: '', otherChain: '', shape: '', otherShape: '', base: '', otherBase: '', colourLetter: '', otherColour: '', price: ''
  });

  const [customer, setCustomer] = useState({ race: 'C', age: '20-35', gender: 'F', payment: 'TnG' });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- PERSISTENCE LOGIC ---
  // 1. On Load: Check if a session exists in the phone's memory
  useEffect(() => {
    const savedSession = localStorage.getItem('petal_archive_session');
    if (savedSession) {
      setSession(JSON.parse(savedSession));
      setStep(1); // Skip Step 0 and go to sales input
    }
  }, []);

  // 2. On Start Session: Save to memory
  const startSession = () => {
    localStorage.setItem('petal_archive_session', JSON.stringify(session));
    setStep(1);
  };

  // 3. On End Session: Wipe memory
  const endSession = () => {
    if(window.confirm('End Session? This will clear the current location data.')) {
      localStorage.removeItem('petal_archive_session');
      setStep(0);
      setView('input');
    }
  };

  const toCaps = (val) => val.toUpperCase();
  const Label = ({ children }) => <label className="text-[10px] font-bold text-[#B5935E] uppercase tracking-[0.2em] mb-3 block">{children}</label>;
  
  const GridButton = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all duration-200 ${active ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm active:bg-gray-50'}`}>
      {label}
    </button>
  );

  const addToBasket = () => {
    setBasket([...basket, { ...currentItem, id: Date.now() }]);
    setCurrentItem({ category: '', series: '', style: '', metal: '', chain: '', otherChain: '', shape: '', otherShape: '', base: '', otherBase: '', colourLetter: '', otherColour: '', price: '' });
    setStep(1); 
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-[#1B3022] rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse"><CheckCircle2 size={48} className="text-[#B5935E]" /></div>
        <h2 className="text-3xl font-serif italic text-[#1B3022]">Logged</h2>
        <p className="text-[#B5935E] font-bold text-[10px] uppercase tracking-widest mt-2">Archive Updated</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-5 max-w-md mx-auto overflow-x-hidden pb-32">
      
      {/* STEP 0: SALES TRACKER SETUP (Only shows if no saved session) */}
      {step === 0 && (
        <div className="pt-10 space-y-8 animate-in fade-in">
          <div className="text-center">
            <h1 className="text-4xl font-serif italic text-[#1B3022]">The Petal Archive</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-2">Sales Tracker</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div><Label>Organiser</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-2xl border-none outline-none ring-1 ring-gray-50 uppercase text-xs font-bold" placeholder="E.G. CURATE / BAZAAR" value={session.organiser} onChange={e => setSession({...session, organiser: toCaps(e.target.value)})} /></div>
            <div><Label>Location</Label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['TRX Plaza', 'Waterfront', 'Intermark', 'BSC', 'Campus', 'Publika', 'Others'].map(loc => (<GridButton key={loc} label={loc} active={session.location === loc} onClick={() => setSession({...session, location: loc})} />))}
              </div>
              {session.location === 'Others' && <input className="w-full p-4 bg-[#FDFBF7] rounded-2xl outline-none ring-1 ring-gray-100 text-xs uppercase font-bold" placeholder="SPECIFY LOCATION..." value={session.otherLocation} onChange={e => setSession({...session, otherLocation: toCaps(e.target.value)})} />}
            </div>
            <div><Label>Date</Label><div className="relative"><Calendar className="absolute left-4 top-4 text-[#B5935E]" size={18} /><input type="date" className="w-full pl-12 p-4 bg-[#FDFBF7] rounded-2xl outline-none ring-1 ring-gray-100" value={session.date} onChange={e => setSession({...session, date: e.target.value})} /></div></div>
            <button onClick={startSession} disabled={!session.location} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold text-lg shadow-lg">Open Tracker</button>
          </div>
        </div>
      )}

      {/* INPUT FLOW */}
      {step > 0 && view === 'input' && (
        <div className="animate-in fade-in">
          <div className="flex justify-between items-center mb-6 bg-[#1B3022] p-4 rounded-2xl shadow-lg">
             <div className="flex items-center gap-3 text-white"><ShoppingBag size={20} className="text-[#B5935E]" /><div><p className="text-[9px] font-black uppercase text-[#B5935E] tracking-widest">{basket.length} Items</p><p className="text-[10px] text-white/50">{session.location === 'Others' ? session.otherLocation : session.location}</p></div></div>
             {basket.length > 0 && <button onClick={() => setStep(3)} className="bg-[#B5935E] text-[#1B3022] px-4 py-2 rounded-xl text-[10px] font-black uppercase">Checkout</button>}
          </div>

          {step === 1 && (
            <div className="space-y-7">
              <section><Label>1. Main Item</Label><div className="grid grid-cols-4 gap-2">{['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'].map(c => (<GridButton key={c} label={c} active={currentItem.category === c} onClick={() => setCurrentItem({...currentItem, category: c})} />))}</div></section>
              <section><Label>2. Chain Type</Label><div className="grid grid-cols-4 gap-2">{['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (<GridButton key={ch} label={ch} active={currentItem.chain === ch} onClick={() => setCurrentItem({...currentItem, chain: ch})} />))}</div>{currentItem.chain === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase text-[#B5935E]" placeholder="SPECIFY CHAIN..." onChange={e => setCurrentItem({...currentItem, otherChain: toCaps(e.target.value)})} />}</section>
              <div className="grid grid-cols-2 gap-4">
                <section><Label>3. Series</Label><div className="grid grid-cols-1 gap-2">{['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (<GridButton key={s} label={s} active={currentItem.series === s} onClick={() => setCurrentItem({...currentItem, series: s})} />))}</div></section>
                <section><Label>4. Style</Label><div className="grid grid-cols-1 gap-2">{['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'Slider', 'None'].map(st => (<GridButton key={st} label={st} active={currentItem.style === st} onClick={() => setCurrentItem({...currentItem, style: st})} />))}</div></section>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl mt-4">NEXT: MATERIALS</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in">
              <section><Label>Metal</Label><div className="grid grid-cols-4 gap-2">{['STU', 'STG', 'STR', 'Brass'].map(m => (<GridButton key={m} label={m} active={currentItem.metal === m} onClick={() => setCurrentItem({...currentItem, metal: m})} />))}</div></section>
              <section><Label>Shape Selection</Label><div className="grid grid-cols-3 gap-2">{['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (<GridButton key={sh} label={sh} active={currentItem.shape === sh} onClick={() => setCurrentItem({...currentItem, shape: sh})} />))}</div>{currentItem.shape === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase" placeholder="SPECIFY SHAPE..." onChange={e => setCurrentItem({...currentItem, otherShape: toCaps(e.target.value)})} />}</section>
              <section><Label>Base Selection</Label><div className="grid grid-cols-3 gap-2">{['MOP', 'Black', 'White', 'Clear', 'Others'].map(b => (<GridButton key={b} label={b} active={currentItem.base === b} onClick={() => setCurrentItem({...currentItem, base: b})} />))}</div>{currentItem.base === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase" placeholder="SPECIFY BASE..." onChange={e => setCurrentItem({...currentItem, otherBase: toCaps(e.target.value)})} />}</section>
              <section><Label>Colour / Letter</Label><div className="grid grid-cols-3 gap-2">{['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'].map(col => (<GridButton key={col} label={col} active={currentItem.colourLetter === col} onClick={() => setCurrentItem({...currentItem, colourLetter: col})} />))}</div>{currentItem.colourLetter === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase" placeholder="SPECIFY COLOUR/LETTER..." onChange={e => setCurrentItem({...currentItem, otherColour: toCaps(e.target.value)})} />}</section>
              <section><Label>Price (RM)</Label><input type="number" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none text-3xl font-serif text-[#1B3022]" placeholder="0" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} /></section>
              <div className="flex gap-4 pt-4"><button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button><button onClick={addToBasket} disabled={!currentItem.price || !currentItem.category} className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black text-sm shadow-xl">ADD TO BASKET</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
               <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                  <Label>Grand Total</Label>
                  <div className="text-6xl font-serif text-[#1B3022] mb-6">RM {basket.reduce((acc, item) => acc + Number(item.price || 0), 0)}</div>
                  <div className="grid grid-cols-4 gap-2">{['TnG', 'Grab', 'Cash', 'Card'].map(p => (<button key={p} onClick={() => setCustomer({...customer, payment: p})} className={`py-3 text-[10px] font-black rounded-xl border ${customer.payment === p ? 'bg-[#1B3022] text-white border-[#1B3022]' : 'bg-gray-50 text-gray-300 border-transparent'}`}>{p}</button>))}</div>
               </div>
               <button onClick={() => { setIsSaving(true); setTimeout(() => { setShowSuccess(true); setBasket([]); setStep(1); setIsSaving(false); setTimeout(() => setShowSuccess(false), 1200); }, 1000)}} className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl tracking-widest uppercase">LOG {basket.length} ITEMS</button>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD & HISTORY VIEWS (REMAIN THE SAME) */}
      {view === 'dashboard' && step > 0 && <div className="text-center py-20 opacity-30 italic">Live Session Data View...</div>}
      {view === 'history' && step > 0 && <div className="text-center py-20 opacity-30 italic">Long-term Performance View...</div>}

      {/* SETTINGS (Updated for End Session) */}
      {view === 'settings' && step > 0 && (
        <div className="pt-10 pb-32 animate-in fade-in">
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 text-center">
              <h2 className="text-3xl font-serif italic text-[#1B3022] mb-8">Session Details</h2>
              <div className="space-y-6 text-left mb-12">
                <div className="flex justify-between border-b pb-4"><Label>Location</Label><span className="text-xs font-bold uppercase">{session.location}</span></div>
                <div className="flex justify-between border-b pb-4"><Label>Date</Label><span className="text-xs font-bold uppercase">{session.date}</span></div>
              </div>
              <button onClick={endSession} className="w-full bg-red-50 text-red-400 py-4 rounded-2xl font-black text-[10px] uppercase">End Session</button>
           </div>
        </div>
      )}

      {/* FIXED NAVIGATION */}
      {step > 0 && (
        <nav className="fixed bottom-8 left-6 right-6 bg-[#1B3022] rounded-[2.5rem] p-2 flex justify-around items-center z-50 shadow-2xl">
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
