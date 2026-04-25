import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BarChart3, Settings, CheckCircle2, Clock, History, 
  BookOpen, ExternalLink, ChevronDown, ChevronUp, 
  Activity, DollarSign, Loader2, RefreshCcw, Trash2
} from 'lucide-react';

const PetalArchiveOS = () => {
  // --- 1. CONFIGURATION ---
  const API_URL = "https://script.google.com/macros/s/AKfycby0J-XRdWfiG_gWmbo0ZWWYq9U21oKraAmGltJLyYfYkKK3WE0IRAxM9NujToig725I/exec";
  const MASTER_SHEET_URL = "https://docs.google.com/spreadsheets/d/1h_fWIhLKMdXzduULMeH0OG56y1PdaG2G4WmZppyk7YI/edit?gid=0#gid=0";

  // --- 2. STATE ---
  const [view, setView] = useState('input'); 
  const [step, setStep] = useState(0); 
  const [basket, setBasket] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openPriceCat, setOpenPriceCat] = useState(null);

  const [session, setSession] = useState({ 
    eventName: '', organiser: '', location: '', otherLocation: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  
  const [currentItem, setCurrentItem] = useState({
    category: '', series: '', style: '', metal: '', chain: '', shape: '', 
    base: '', colourLetter: '', price: '', otherChain: '', otherShape: '', 
    otherBase: '', otherColour: ''
  });

  const [customer, setCustomer] = useState({ race: 'C', age: '20s', gender: 'F', payment: 'QR' });

  // --- 3. PERSISTENCE & DATA FETCHING ---
  useEffect(() => {
    const saved = localStorage.getItem('petal_archive_v17');
    if (saved) { setSession(JSON.parse(saved)); setStep(1); }
  }, []);

  const fetchLiveData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setLiveData(data);
    } catch (err) { console.error("Sync Error:", err); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (view === 'dashboard' || view === 'history') fetchLiveData();
  }, [view]);

  // --- 4. THE BRAIN ---
  const stats = useMemo(() => {
    const totalRevenue = liveData.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const categories = {};
    const locationRevenue = {};
    liveData.forEach(row => {
      categories[row.category] = (categories[row.category] || 0) + 1;
      locationRevenue[row.location] = (locationRevenue[row.location] || 0) + (Number(row.price) || 0);
    });
    return { totalRevenue, totalPieces: liveData.length, categories, locationRevenue };
  }, [liveData]);

  // --- 5. ACTIONS ---
  const logTransaction = async () => {
    const payload = { transactionId: `TX-${Date.now()}`, session, basket, customer };
    try {
      setShowSuccess(true);
      await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      setBasket([]); setStep(1); setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) { alert("Sync Error."); setShowSuccess(false); }
  };

  const clearCache = () => {
    if(window.confirm('Clear cache and refresh app?')) {
      localStorage.clear(); window.location.reload();
    }
  };

  const addToBasket = () => {
    const finalChain = currentItem.chain === 'Others' ? currentItem.otherChain : currentItem.chain;
    const finalShape = currentItem.shape === 'Others' ? currentItem.otherShape : currentItem.shape;
    const finalBase = currentItem.base === 'Others' ? currentItem.otherBase : currentItem.base;
    const finalColour = currentItem.colourLetter === 'Others' ? currentItem.otherColour : currentItem.colourLetter;

    setBasket([...basket, { 
      ...currentItem, 
      chain: finalChain, 
      shape: finalShape, 
      base: finalBase, 
      colourLetter: finalColour,
      id: Date.now() 
    }]);
    
    setCurrentItem({ category: '', series: '', style: '', metal: '', chain: '', shape: '', base: '', colourLetter: '', price: '', otherChain: '', otherShape: '', otherBase: '', otherColour: '' });
    setStep(1); 
  };

  const toCaps = (val) => val.toUpperCase();
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2 block">{children}</label>;
  const GridBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all ${active ? 'bg-[#1B3022] text-white border-[#1B3022]' : 'bg-white text-[#1B3022] border-gray-100'}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-4 max-w-md mx-auto pb-32">
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B3022]/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[3rem] text-center shadow-2xl">
              <CheckCircle2 className="text-[#1B3022] mx-auto mb-4" size={40} />
              <h2 className="text-2xl font-serif italic">Sale Archived</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="setup" className="pt-6 space-y-6">
            <header className="text-center"><h1 className="text-4xl font-serif italic">The Petal Archive</h1><p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-1">Sales Tracker</p></header>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
              <div><Label>Event Name</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold" placeholder="E.G. HOLIDAY MARKET" value={session.eventName} onChange={e => setSession({...session, eventName: toCaps(e.target.value)})} /></div>
              <div><Label>Location</Label><div className="grid grid-cols-2 gap-2 mb-3">{['163 Mall', 'Waterfront', 'Intermark', 'BSC', 'The Campus', 'Publika', 'Others'].map(loc => (<GridBtn key={loc} label={loc} active={session.location === loc} onClick={() => setSession({...session, location: loc})} />))}</div>
              {session.location === 'Others' && <input className="w-full p-4 bg-[#FDFBF7] rounded-xl ring-1 ring-gray-100 text-xs uppercase font-bold" placeholder="SPECIFY LOCATION..." value={session.otherLocation} onChange={e => setSession({...session, otherLocation: toCaps(e.target.value)})} />}</div>
              <button onClick={() => setStep(1)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold uppercase">Open Tracker</button>
            </div>
          </motion.div>
        )}

        {view === 'input' && step > 0 && (
          <motion.div key="input" className="space-y-6">
            <div className="bg-[#1B3022] p-4 rounded-2xl flex justify-between items-center text-white">
              <div><p className="text-[10px] font-black uppercase text-[#B5935E]">{session.location === 'Others' ? session.otherLocation : session.location}</p><p className="text-[11px] font-serif italic">{basket.length} Items</p></div>
              {basket.length > 0 && <button onClick={() => setStep(4)} className="bg-[#B5935E] px-5 py-2 rounded-xl text-[10px] font-black uppercase">Checkout</button>}
            </div>

            {/* REORDERED STEP 1: CATEGORY & CHAIN */}
            {step === 1 && (
              <div className="space-y-7">
                <section><Label>1. Jewellery Category</Label><div className="grid grid-cols-4 gap-2">{['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'].map(c => (<GridBtn key={c} label={c} active={currentItem.category === c} onClick={() => setCurrentItem({...currentItem, category: c})} />))}</div></section>
                <section><Label>2. Chain Type</Label><div className="grid grid-cols-4 gap-2">{['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (<GridBtn key={ch} label={ch} active={currentItem.chain === ch} onClick={() => setCurrentItem({...currentItem, chain: ch})} />))}</div>
                {currentItem.chain === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase" placeholder="SPECIFY CHAIN..." value={currentItem.otherChain} onChange={e => setCurrentItem({...currentItem, otherChain: toCaps(e.target.value)})} />}</section>
                <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm uppercase shadow-lg">Next: Type & Shape</button>
              </div>
            )}

            {/* REORDERED STEP 2: STYLE/TYPE, SHAPE, SERIES */}
            {step === 2 && (
              <div className="space-y-7">
                <section><Label>3. Earring or Ring Type</Label><div className="grid grid-cols-3 gap-2">{['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'Slider', 'None'].map(st => (<GridBtn key={st} label={st} active={currentItem.style === st} onClick={() => setCurrentItem({...currentItem, style: st})} />))}</div></section>
                <section><Label>4. Shape Selection</Label><div className="grid grid-cols-3 gap-2">{['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (<GridBtn key={sh} label={sh} active={currentItem.shape === sh} onClick={() => setCurrentItem({...currentItem, shape: sh})} />))}</div>
                {currentItem.shape === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase" placeholder="SPECIFY SHAPE..." value={currentItem.otherShape} onChange={e => setCurrentItem({...currentItem, otherShape: toCaps(e.target.value)})} />}</section>
                <section><Label>5. Series</Label><div className="grid grid-cols-3 gap-2">{['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (<GridBtn key={s} label={s} active={currentItem.series === s} onClick={() => setCurrentItem({...currentItem, series: s})} />))}</div></section>
                <div className="flex gap-4"><button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button><button onClick={() => setStep(3)} className="flex-[2] bg-[#1B3022] text-white py-4 rounded-2xl font-black shadow-xl uppercase">Next: Finishing</button></div>
              </div>
            )}

            {/* REORDERED STEP 3: METAL, BASE, COLOUR, PRICE */}
            {step === 3 && (
              <div className="space-y-6">
                <section><Label>6. Metal</Label><div className="grid grid-cols-4 gap-2">{['STU', 'STG', 'STR', 'Brass'].map(m => (<GridBtn key={m} label={m} active={currentItem.metal === m} onClick={() => setCurrentItem({...currentItem, metal: m})} />))}</div></section>
                <section><Label>7. Base Selection</Label><div className="grid grid-cols-3 gap-2">{['MOP', 'Black', 'White', 'Clear', 'Others'].map(b => (<GridBtn key={b} label={b} active={currentItem.base === b} onClick={() => setCurrentItem({...currentItem, base: b})} />))}</div>
                {currentItem.base === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase" placeholder="SPECIFY BASE..." value={currentItem.otherBase} onChange={e => setCurrentItem({...currentItem, otherBase: toCaps(e.target.value)})} />}</section>
                <section><Label>8. Embedded Flower or Letter</Label><div className="grid grid-cols-3 gap-2">{['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'].map(col => (<GridBtn key={col} label={col} active={currentItem.colourLetter === col} onClick={() => setCurrentItem({...currentItem, colourLetter: col})} />))}</div>
                {currentItem.colourLetter === 'Others' && <input className="w-full mt-3 p-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase" placeholder="SPECIFY COLOUR/LETTER..." value={currentItem.otherColour} onChange={e => setCurrentItem({...currentItem, otherColour: toCaps(e.target.value)})} />}</section>
                <section><Label>9. Price (RM)</Label><input type="number" className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-2xl font-serif text-[#1B3022]" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} /></section>
                <div className="flex gap-4"><button onClick={() => setStep(2)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button><button onClick={addToBasket} className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black shadow-xl">ADD TO BASKET</button></div>
              </div>
            )}

            {/* CHECKOUT STEP */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                  <Label>Total</Label><div className="text-6xl font-serif text-[#1B3022] mb-6">RM {basket.reduce((acc, item) => acc + Number(item.price || 0), 0)}</div>
                  <div className="grid grid-cols-3 gap-2">{['Cash', 'Card', 'QR'].map(p => (<button key={p} onClick={() => setCustomer({...customer, payment: p})} className={`py-3 text-[10px] font-black rounded-xl border ${customer.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50'}`}>{p}</button>))}</div>
                </div>
                <section className="bg-white p-8 rounded-[3rem] border border-gray-100 space-y-4">
                  <Label>Customer Profile</Label>
                  <div className="grid grid-cols-4 gap-2">{['C', 'M', 'I', 'O'].map(r => (<button key={r} onClick={() => setCustomer({...customer, race: r})} className={`py-2 rounded-lg text-[10px] font-black ${customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-gray-50'}`}>{r}</button>))}</div>
                  <div className="grid grid-cols-5 gap-2">{['10s', '20s', '30s', '40s', '50s'].map(a => (<button key={a} onClick={() => setCustomer({...customer, age: a})} className={`py-2 rounded-lg text-[10px] font-black ${customer.age === a ? 'bg-[#B5935E] text-white' : 'bg-gray-50'}`}>{a}</button>))}</div>
                </section>
                <button onClick={logTransaction} className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl uppercase tracking-widest">Log Transaction</button>
              </div>
            )}
          </motion.div>
        )}

        {/* DASHBOARD & SETTINGS REMAIN THE SAME */}
        {view === 'dashboard' && (
          <motion.div key="dash" className="space-y-6">
            <header className="flex justify-between items-center py-6"><h2 className="text-3xl font-serif italic">Session Insights</h2>{isLoading && <Loader2 className="animate-spin text-[#B5935E]" size={20} />}</header>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1B3022] p-6 rounded-[2.5rem] text-white h-32 flex flex-col justify-between"><p className="text-[9px] font-bold opacity-40 uppercase">Revenue</p><h3 className="text-3xl font-serif">RM {stats.totalRevenue.toLocaleString()}</h3></div>
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 h-32 flex flex-col justify-between"><p className="text-[9px] font-bold text-[#B5935E] uppercase">Sold</p><h3 className="text-3xl font-serif">{stats.totalPieces}</h3></div>
            </div>
          </motion.div>
        )}

        {view === 'settings' && (
          <motion.div key="settings" className="space-y-6">
            <header className="text-center py-6"><h2 className="text-3xl font-serif italic">Command Center</h2></header>
            <a href={MASTER_SHEET_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full p-6 bg-[#E8EEE9] rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm text-[#1B3022] border border-[#1B3022]/5"><ExternalLink size={16}/> Open Master Database</a>
            <button onClick={clearCache} className="w-full bg-white text-gray-400 py-6 rounded-[2rem] font-black text-[9px] uppercase border border-gray-100 flex items-center justify-center gap-2"><RefreshCcw size={14}/> Clear App Cache</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION */}
      {step > 0 && (
        <nav className="fixed bottom-8 left-6 right-6 bg-[#1B3022] rounded-[2.5rem] p-2 flex justify-around items-center z-50 shadow-2xl border border-white/5 backdrop-blur-md">
          <button onClick={() => setView('input')} className={`p-4 rounded-2xl transition-all ${view === 'input' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'}`}><Plus size={22} /></button>
          <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'}`}><BarChart3 size={22} /></button>
          <button onClick={() => setView('history')} className={`p-4 rounded-2xl transition-all ${view === 'history' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500'}`}><History size={22} /></button>
          <button onClick={() => setView('settings')} className={`p-4 rounded-2xl transition-all ${view === 'settings' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'}`}><Settings size={22} /></button>
        </nav>
      )}
    </div>
  );
};

export default PetalArchiveOS;
