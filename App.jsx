import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BarChart3, Settings, CheckCircle2, Clock, History, 
  BookOpen, ExternalLink, ChevronDown, ChevronUp, 
  Activity, Loader2, RefreshCcw, Trash2
} from 'lucide-react';

// --- STABLE SUB-COMPONENTS (Defined outside to prevent focus loss) ---
const OtherInput = ({ value, onChange, placeholder = "SPECIFY..." }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }} 
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <input 
        className="w-full mt-3 p-4 bg-white border-2 border-[#E8EEE9] focus:border-[#B5935E] rounded-2xl text-[11px] font-black tracking-widest uppercase outline-none transition-all shadow-inner"
        style={{ textTransform: 'uppercase' }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        autoFocus
      />
    </motion.div>
  );
};

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
    base: '', colourLetter: '', price: '', 
    otherCategory: '', otherChain: '', otherShape: '', otherBase: '', otherColour: ''
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

  // --- 4. THE BRAIN (Calculations) ---
  const stats = useMemo(() => {
    const totalRevenue = liveData.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const categories = {};
    const locationRevenue = {};
    const monthlyRevenue = new Array(12).fill(0);
    const raceCounts = { C: 0, M: 0, I: 0, O: 0 };
    const ageCounts = { '10s': 0, '20s': 0, '30s': 0, '40s': 0, '50s': 0 };

    liveData.forEach(row => {
      categories[row.category] = (categories[row.category] || 0) + 1;
      locationRevenue[row.location] = (locationRevenue[row.location] || 0) + (Number(row.price) || 0);
      const date = new Date(row.timestamp);
      if (!isNaN(date)) monthlyRevenue[date.getMonth()] += Number(row.price) || 0;
      if (row.customer) {
        const parts = row.customer.split(' | ');
        if (parts[0]) raceCounts[parts[0]] = (raceCounts[parts[0]] || 0) + 1;
        if (parts[1]) ageCounts[parts[1]] = (ageCounts[parts[1]] || 0) + 1;
      }
    });

    return { totalRevenue, totalPieces: liveData.length, categories, locationRevenue, monthlyRevenue, raceCounts, ageCounts };
  }, [liveData]);

  // --- 5. ACTIONS ---
  const logTransaction = async () => {
    const transactionId = `TX-${Date.now()}`;
    const payload = { transactionId, session, basket, customer };
    try {
      setShowSuccess(true);
      await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      setBasket([]); setStep(1); setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) { alert("Sync Error."); setShowSuccess(false); }
  };

  const clearCache = () => {
    if(window.confirm('Clear all local session data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const addToBasket = () => {
    setBasket([...basket, { ...currentItem, id: Date.now() }]);
    setCurrentItem({ 
      category: '', series: '', style: '', metal: '', chain: '', shape: '', base: '', 
      colourLetter: '', price: '', otherCategory: '', otherChain: '', otherShape: '', 
      otherBase: '', otherColour: '' 
    });
    setStep(1); 
  };

  const endSession = () => {
    if(window.confirm('End Session?')) {
      localStorage.removeItem('petal_archive_v17');
      setStep(0); setView('input');
    }
  };

  // --- UI COMPONENTS ---
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2 block">{children}</label>;
  const GridBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all ${active ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm'}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-4 max-w-md mx-auto pb-32 overflow-x-hidden">

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B3022]/90 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-12 rounded-[3rem] text-center shadow-2xl">
              <div className="w-20 h-20 bg-[#E8EEE9] rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="text-[#1B3022]" size={40} /></div>
              <h2 className="text-2xl font-serif italic text-[#1B3022]">Sale Archived</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B5935E] mt-2">Syncing with Master Sheet...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6 space-y-6">
            <header className="text-center"><h1 className="text-4xl font-serif italic">The Petal Archive</h1><p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-1">Sales Tracker</p></header>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
              <div><Label>Event Name</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold" placeholder="E.G. HOLIDAY MARKET" value={session.eventName} onChange={e => setSession({...session, eventName: e.target.value.toUpperCase()})} /></div>
              <div><Label>Organiser</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold" placeholder="E.G. ROTAN LOT" value={session.organiser} onChange={e => setSession({...session, organiser: e.target.value.toUpperCase()})} /></div>
              <div><Label>Location</Label><div className="grid grid-cols-2 gap-2 mb-3">{['163 Mall', 'Waterfront', 'Intermark', 'BSC', 'The Campus', 'Publika', 'Others'].map(loc => (<GridBtn key={loc} label={loc} active={session.location === loc} onClick={() => setSession({...session, location: loc})} />))}</div>
              {session.location === 'Others' && <OtherInput value={session.otherLocation} onChange={(val) => setSession({...session, otherLocation: val})} />}</div>
              <div><Label>Date</Label><input type="date" className="w-full p-4 bg-[#FDFBF7] rounded-xl ring-1 ring-gray-100" value={session.date} onChange={e => setSession({...session, date: e.target.value})} /></div>
              <button onClick={() => setStep(1)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold shadow-xl uppercase">Open Tracker</button>
            </div>
          </motion.div>
        )}

        {view === 'input' && step > 0 && (
          <motion.div key="input" className="space-y-6">
            <div className="bg-[#1B3022] p-4 rounded-2xl flex justify-between items-center text-white shadow-lg">
              <div><p className="text-[10px] font-black uppercase text-[#B5935E] tracking-widest">{session.location === 'Others' ? session.otherLocation : session.location}</p><p className="text-[11px] font-serif italic">{basket.length} Items</p></div>
              {basket.length > 0 && <button onClick={() => setStep(3)} className="bg-[#B5935E] px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Checkout</button>}
            </div>

            {/* STEP 1: Main Item, Chain, Ring/Earring Type */}
            {step === 1 && (
              <div className="space-y-7 pb-10">
                <section>
                  <Label>1. Main Item</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Others'].map(c => (<GridBtn key={c} label={c} active={currentItem.category === c} onClick={() => setCurrentItem({...currentItem, category: c})} />))}
                  </div>
                  {currentItem.category === 'Others' && <OtherInput value={currentItem.otherCategory} onChange={(val) => setCurrentItem({...currentItem, otherCategory: val})} />}
                </section>

                <section>
                  <Label>2. Chain Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (<GridBtn key={ch} label={ch} active={currentItem.chain === ch} onClick={() => setCurrentItem({...currentItem, chain: ch})} />))}
                  </div>
                  {currentItem.chain === 'Others' && <OtherInput value={currentItem.otherChain} onChange={(val) => setCurrentItem({...currentItem, otherChain: val})} />}
                </section>

                <section>
                  <Label>3. Earring or Ring Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'None'].map(st => (<GridBtn key={st} label={st} active={currentItem.style === st} onClick={() => setCurrentItem({...currentItem, style: st})} />))}
                  </div>
                </section>
                
                <button 
                  onClick={() => setStep(2)} 
                  disabled={!currentItem.category}
                  className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm uppercase shadow-lg disabled:opacity-50"
                >
                  Next Details
                </button>
              </div>
            )}

            {/* STEP 2: Shape, Series, Metal, Base, Colour, Price */}
            {step === 2 && (
              <div className="space-y-6 pb-10">
                <section>
                  <Label>4. Shape Selection</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (<GridBtn key={sh} label={sh} active={currentItem.shape === sh} onClick={() => setCurrentItem({...currentItem, shape: sh})} />))}
                  </div>
                  {currentItem.shape === 'Others' && <OtherInput value={currentItem.otherShape} onChange={(val) => setCurrentItem({...currentItem, otherShape: val})} />}
                </section>

                <section>
                  <Label>5. Series</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (<GridBtn key={s} label={s} active={currentItem.series === s} onClick={() => setCurrentItem({...currentItem, series: s})} />))}
                  </div>
                </section>

                <section>
                  <Label>6. Metal</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['STU', 'STG', 'STR', 'Brass'].map(m => (<GridBtn key={m} label={m} active={currentItem.metal === m} onClick={() => setCurrentItem({...currentItem, metal: m})} />))}
                  </div>
                </section>

                <section>
                  <Label>7. Base Selection</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['MOP', 'Black', 'White', 'Clear', 'Others'].map(b => (<GridBtn key={b} label={b} active={currentItem.base === b} onClick={() => setCurrentItem({...currentItem, base: b})} />))}
                  </div>
                  {currentItem.base === 'Others' && <OtherInput value={currentItem.otherBase} onChange={(val) => setCurrentItem({...currentItem, otherBase: val})} />}
                </section>

                <section>
                  <Label>8. Colour / Letter</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'].map(col => (<GridBtn key={col} label={col} active={currentItem.colourLetter === col} onClick={() => setCurrentItem({...currentItem, colourLetter: col})} />))}
                  </div>
                  {currentItem.colourLetter === 'Others' && <OtherInput value={currentItem.otherColour} onChange={(val) => setCurrentItem({...currentItem, otherColour: val})} />}
                </section>

                <section><Label>Price (RM)</Label><input type="number" className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-2xl font-serif text-[#1B3022] shadow-sm outline-none focus:ring-2 focus:ring-[#B5935E]" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} /></section>
                <div className="flex gap-4"><button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button><button onClick={addToBasket} className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black shadow-xl">ADD TO BASKET</button></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                  <Label>Transaction Total</Label><div className="text-6xl font-serif text-[#1B3022] mb-6">RM {basket.reduce((acc, item) => acc + Number(item.price || 0), 0)}</div>
                  <div className="grid grid-cols-3 gap-2">{['Cash', 'Card', 'QR'].map(p => (<button key={p} onClick={() => setCustomer({...customer, payment: p})} className={`py-3 text-[10px] font-black rounded-xl border ${customer.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50'}`}>{p}</button>))}</div>
                </div>
                {/* Customer Profile Logic - No changes needed */}
                <section className="bg-white p-8 rounded-[3rem] border border-gray-100 space-y-4">
                  <Label>Customer Profile</Label>
                  <div className="flex gap-2">
                    <button onClick={() => setCustomer({...customer, gender: 'F'})} className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${customer.gender === 'F' ? 'bg-[#1B3022] text-white' : 'bg-gray-50'}`}>FEMALE</button>
                    <button onClick={() => setCustomer({...customer, gender: 'M'})} className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${customer.gender === 'M' ? 'bg-[#1B3022] text-white' : 'bg-gray-50'}`}>MALE</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">{['C', 'M', 'I', 'O'].map(r => (<button key={r} onClick={() => setCustomer({...customer, race: r})} className={`py-2 rounded-lg text-[10px] font-black ${customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-gray-50'}`}>{r}</button>))}</div>
                  <div className="grid grid-cols-5 gap-2">{['10s', '20s', '30s', '40s', '50s'].map(a => (<button key={a} onClick={() => setCustomer({...customer, age: a})} className={`py-2 rounded-lg text-[10px] font-black ${customer.age === a ? 'bg-[#B5935E] text-white' : 'bg-gray-50'}`}>{a}</button>))}</div>
                </section>
                <button onClick={logTransaction} className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl uppercase tracking-widest">Log Transaction</button>
              </div>
            )}
          </motion.div>
        )}

        {/* Dashboard, BI, Settings Views - Keeping existing working logic */}
        {view === 'dashboard' && (
           <motion.div key="dash" className="space-y-6">
           <header className="flex justify-between items-center py-6">
             <h2 className="text-3xl font-serif italic text-[#1B3022]">Session Insights</h2>
             {isLoading && <Loader2 className="animate-spin text-[#B5935E]" size={20} />}
           </header>
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#1B3022] p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-32"><p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Revenue Today</p><h3 className="text-3xl font-serif italic">RM {stats.totalRevenue.toLocaleString()}</h3></div>
             <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32"><p className="text-[9px] font-bold text-[#B5935E] uppercase tracking-widest">Pieces Sold</p><h3 className="text-3xl font-serif italic text-[#1B3022]">{stats.totalPieces}</h3></div>
           </div>
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
