import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BarChart3, Settings, MapPin, Calendar, CheckCircle2, 
  Clock, History, BookOpen, ExternalLink, ChevronDown, ChevronUp, 
  PieChart, Activity, DollarSign, Loader2
} from 'lucide-react';

const PetalArchiveOS = () => {
  // --- 1. CONFIGURATION ---
  const API_URL = "https://script.google.com/macros/s/AKfycby0J-XRdWfiG_gWmbo0ZWWYq9U21oKraAmGltJLyYfYkKK3WE0IRAxM9NujToig725I/exec";

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
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'dashboard' || view === 'history') {
      fetchLiveData();
    }
  }, [view]);

  // --- 4. DATA CALCULATIONS (The "Brain") ---
  const stats = useMemo(() => {
    const totalRevenue = liveData.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const totalPieces = liveData.length;
    
    // Category Ranking
    const categories = liveData.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});

    // Location Analysis for BI
    const locationRevenue = liveData.reduce((acc, curr) => {
      const loc = curr.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + (Number(curr.price) || 0);
      return acc;
    }, {});

    return { totalRevenue, totalPieces, categories, locationRevenue };
  }, [liveData]);

  // --- 5. ACTIONS ---
  const startSession = () => {
    localStorage.setItem('petal_archive_v17', JSON.stringify(session));
    setStep(1);
  };

  const endSession = () => {
    if(window.confirm('End Session? Local tracker will be reset.')) {
      localStorage.removeItem('petal_archive_v17');
      setStep(0); setView('input');
    }
  };

  const logTransaction = async () => {
    const transactionId = `TX-${Date.now()}`;
    const payload = { transactionId, session, basket, customer };

    try {
      setShowSuccess(true);
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setBasket([]);
      setStep(1);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      alert("Sync Error. Please check connection.");
      setShowSuccess(false);
    }
  };

  const toCaps = (val) => val.toUpperCase();
  const addToBasket = () => {
    setBasket([...basket, { ...currentItem, id: Date.now() }]);
    setCurrentItem({ category: '', series: '', style: '', metal: '', chain: '', shape: '', base: '', colourLetter: '', price: '', otherChain: '', otherShape: '', otherBase: '', otherColour: '' });
    setStep(1); 
  };

  // --- 6. UI COMPONENTS ---
  const Label = ({ children }) => <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2 block">{children}</label>;
  const GridBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all ${active ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md' : 'bg-white text-[#1B3022] border-gray-100 shadow-sm'}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-4 max-w-md mx-auto pb-32 overflow-x-hidden">
      
      {/* SUCCESS OVERLAY */}
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
        {/* SETUP VIEW */}
        {step === 0 && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6 space-y-6">
            <header className="text-center"><h1 className="text-4xl font-serif italic">The Petal Archive</h1><p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-1">Sales Tracker</p></header>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
              <div><Label>Event Name</Label><input className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold" placeholder="E.G. HOLIDAY HOME MARKET" value={session.eventName} onChange={e => setSession({...session, eventName: toCaps(e.target.value)})} /></div>
              <div><Label>Location</Label><div className="grid grid-cols-2 gap-2 mb-3">{['163 Mall', 'Waterfront', 'Intermark', 'BSC', 'The Campus', 'Publika', 'Others'].map(loc => (<GridBtn key={loc} label={loc} active={session.location === loc} onClick={() => setSession({...session, location: loc})} />))}</div></div>
              <div><Label>Date</Label><input type="date" className="w-full p-4 bg-[#FDFBF7] rounded-xl ring-1 ring-gray-100" value={session.date} onChange={e => setSession({...session, date: e.target.value})} /></div>
              <button onClick={startSession} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold shadow-xl">Open Tracker</button>
            </div>
          </motion.div>
        )}

        {/* INPUT VIEW */}
        {step > 0 && view === 'input' && (
          <motion.div key="input" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <div className="bg-[#1B3022] p-4 rounded-2xl flex justify-between items-center shadow-lg">
              <div className="text-white"><p className="text-[10px] font-black uppercase text-[#B5935E]">{session.location}</p><p className="text-[11px] font-serif italic">{basket.length} Items in Basket</p></div>
              {basket.length > 0 && <button onClick={() => setStep(3)} className="bg-[#B5935E] text-[#1B3022] px-5 py-2 rounded-xl text-[10px] font-black uppercase">Checkout</button>}
            </div>

            {step === 1 && (
              <div className="space-y-7">
                <section><Label>1. Main Item</Label><div className="grid grid-cols-4 gap-2">{['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant'].map(c => (<GridBtn key={c} label={c} active={currentItem.category === c} onClick={() => setCurrentItem({...currentItem, category: c})} />))}</div></section>
                <section><Label>2. Chain Type</Label><div className="grid grid-cols-4 gap-2">{['Cable', 'Snake', 'Paperclip', 'Kiss', 'Bead', 'None'].map(ch => (<GridBtn key={ch} label={ch} active={currentItem.chain === ch} onClick={() => setCurrentItem({...currentItem, chain: ch})} />))}</div></section>
                <section><Label>3. Series</Label><div className="grid grid-cols-3 gap-2">{['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (<GridBtn key={s} label={s} active={currentItem.series === s} onClick={() => setCurrentItem({...currentItem, series: s})} />))}</div></section>
                <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm shadow-xl uppercase">Next Details</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <section><Label>Metal</Label><div className="grid grid-cols-4 gap-2">{['STU', 'STG', 'STR', 'Brass'].map(m => (<GridBtn key={m} label={m} active={currentItem.metal === m} onClick={() => setCurrentItem({...currentItem, metal: m})} />))}</div></section>
                <section><Label>Price (RM)</Label><input type="number" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none text-2xl font-serif text-[#1B3022]" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} /></section>
                <div className="flex gap-4"><button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Back</button><button onClick={addToBasket} className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black shadow-xl">ADD TO BASKET</button></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                  <Label>Transaction Total</Label>
                  <div className="text-6xl font-serif text-[#1B3022] mb-6">RM {basket.reduce((acc, item) => acc + Number(item.price || 0), 0)}</div>
                  <div className="grid grid-cols-3 gap-2">{['Cash', 'Card', 'QR'].map(p => (<button key={p} onClick={() => setCustomer({...customer, payment: p})} className={`py-3 text-[10px] font-black rounded-xl border ${customer.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50'}`}>{p}</button>))}</div>
                </div>
                <button onClick={logTransaction} className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl uppercase tracking-widest">Log Transaction</button>
              </div>
            )}
          </motion.div>
        )}

        {/* LIVE DASHBOARD VIEW */}
        {view === 'dashboard' && step > 0 && (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-32">
            <header className="flex justify-between items-center py-6">
              <h2 className="text-3xl font-serif italic text-[#1B3022]">Session Insights</h2>
              {isLoading && <Loader2 className="animate-spin text-[#B5935E]" size={20} />}
            </header>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1B3022] p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-32">
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Total Revenue</p>
                <h3 className="text-3xl font-serif italic">RM {stats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <p className="text-[9px] font-bold text-[#B5935E] uppercase tracking-widest">Pieces Sold</p>
                <h3 className="text-3xl font-serif italic text-[#1B3022]">{stats.totalPieces}</h3>
              </div>
            </div>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Live Category Performance</Label>
              <div className="space-y-2">
                {Object.entries(stats.categories).sort((a,b) => b[1] - a[1]).map(([cat, count], i) => (
                  <div key={i} className="flex justify-between text-[10px] font-black uppercase border-b border-gray-50 pb-2">
                    <span>{cat}</span><span className="text-[#B5935E]">{count} SOLD</span>
                  </div>
                ))}
                {liveData.length === 0 && <p className="text-[10px] text-gray-300 italic">No sales recorded yet...</p>}
              </div>
            </section>
          </motion.div>
        )}

        {/* BI VIEW (History & Comparisons) */}
        {view === 'history' && step > 0 && (
          <motion.div key="bi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-32">
            <header className="text-center py-6"><h2 className="text-3xl font-serif italic text-[#1B3022]">Business Intelligence</h2></header>
            
            <section className="bg-[#1B3022] p-8 rounded-[3rem] text-white shadow-xl">
              <Label><span className="text-[#B5935E]">Current Venue Efficiency</span></Label>
              <h4 className="text-xl font-serif italic mb-2">{session.location}</h4>
              <p className="text-[9px] opacity-40 uppercase font-black">Total RM at this location</p>
              <p className="text-3xl font-serif mt-1">RM {stats.locationRevenue[session.location]?.toLocaleString() || 0}</p>
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Location Comparison</Label>
              <div className="space-y-4">
                {Object.entries(stats.locationRevenue).map(([loc, rev], i) => (
                  <div key={i} className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-[9px] font-black uppercase text-gray-400">{loc}</span>
                    <span className="font-serif italic text-[#1B3022]">RM {rev.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* SETTINGS VIEW */}
        {view === 'settings' && step > 0 && (
          <motion.div key="settings" initial={{ y: 20 }} animate={{ y: 0 }} className="space-y-6 pb-32">
            <header className="text-center py-6"><h2 className="text-3xl font-serif italic text-[#1B3022]">Command Center</h2></header>
            <button onClick={endSession} className="w-full bg-red-50 text-red-400 py-6 rounded-3xl font-black text-xs uppercase shadow-sm border border-red-100">End Current Session</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING NAVIGATION */}
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
