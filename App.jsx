import React, { useState } from 'react';
import { 
  Plus, BarChart3, Settings, ChevronRight, MapPin, 
  Calendar, Users, CheckCircle2, Package, TrendingUp, ShoppingBag, Trash2, LogOut
} from 'lucide-react';

const PetalArchiveOS = () => {
  const [view, setView] = useState('input'); 
  const [step, setStep] = useState(0); 
  const [basket, setBasket] = useState([]);
  const [session, setSession] = useState({
    organiser: '', location: '', otherLocation: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // The item currently being built
  const [currentItem, setCurrentItem] = useState({
    category: '', series: '', style: '', metal: '', 
    chain: '', otherChain: '', shape: '', otherShape: '', 
    base: '', otherBase: '', colourLetter: '', otherColour: '', 
    price: ''
  });

  const [customer, setCustomer] = useState({
    race: 'C', age: '20-35', gender: 'F', payment: 'TnG'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toCaps = (val) => val.toUpperCase();

  const addToBasket = () => {
    setBasket([...basket, { ...currentItem, id: Date.now() }]);
    // Reset item builder but keep some logical defaults if needed
    setCurrentItem({
      category: '', series: '', style: '', metal: '', 
      chain: '', otherChain: '', shape: '', otherShape: '', 
      base: '', otherBase: '', colourLetter: '', otherColour: '', 
      price: ''
    });
    setStep(1); // Go back to start of item builder for next item
  };

  const removeFromBasket = (id) => {
    setBasket(basket.filter(item => item.id !== id));
  };

  const handleFinalLog = () => {
    setIsSaving(true);
    // In the real version, this will loop through 'basket' and send to Google Sheets
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setBasket([]);
        setStep(1);
      }, 1500);
    }, 1000);
  };

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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-[#1B3022] rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <CheckCircle2 size={48} className="text-[#B5935E]" />
        </div>
        <h2 className="text-3xl font-serif italic text-[#1B3022]">Logged</h2>
        <p className="text-[#B5935E] font-bold text-[10px] uppercase tracking-widest mt-2">Multiple Items Archived</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-5 max-w-md mx-auto overflow-x-hidden pb-32">
      
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
            <button onClick={() => setStep(1)} disabled={!session.location} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold text-lg shadow-lg">Open Tracker</button>
          </div>
        </div>
      )}

      {/* 1. INPUT VIEW */}
      {step > 0 && view === 'input' && (
        <div className="animate-in slide-in-from-right duration-300">
          
          {/* Basket Header */}
          <div className="flex justify-between items-center mb-6 bg-[#1B3022] p-4 rounded-2xl shadow-lg">
             <div className="flex items-center gap-3 text-white">
               <ShoppingBag size={20} className="text-[#B5935E]" />
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#B5935E]">Current Basket</p>
                 <p className="text-sm font-serif italic">{basket.length} Items</p>
               </div>
             </div>
             {basket.length > 0 && (
               <button onClick={() => setStep(3)} className="bg-[#B5935E] text-[#1B3022] px-4 py-2 rounded-xl text-[10px] font-black uppercase">Checkout</button>
             )}
          </div>

          {step === 1 && (
            <div className="space-y-7">
              <section>
                <Label>1. Main Item</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'].map(c => (
                    <GridButton key={c} label={c} active={currentItem.category === c} onClick={() => setCurrentItem({...currentItem, category: c})} />
                  ))}
                </div>
              </section>

              <section>
                <Label>2. Chain Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'].map(ch => (
                    <GridButton key={ch} label={ch} active={currentItem.chain === ch} onClick={() => setCurrentItem({...currentItem, chain: ch})} />
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <section>
                  <Label>3. Series</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'].map(s => (
                      <GridButton key={s} label={s} active={currentItem.series === s} onClick={() => setCurrentItem({...currentItem, series: s})} />
                    ))}
                  </div>
                </section>
                <section>
                  <Label>4. Style</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'Slider', 'None'].map(st => (
                      <GridButton key={st} label={st} active={currentItem.style === st} onClick={() => setCurrentItem({...currentItem, style: st})} />
                    ))}
                  </div>
                </section>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl">NEXT: MATERIALS</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <section><Label>Metal</Label><div className="grid grid-cols-4 gap-2">{['STU', 'STG', 'STR', 'Brass'].map(m => (<GridButton key={m} label={m} active={currentItem.metal === m} onClick={() => setCurrentItem({...currentItem, metal: m})} />))}</div></section>
              <section><Label>Shape</Label><div className="grid grid-cols-3 gap-2">{['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'].map(sh => (<GridButton key={sh} label={sh} active={currentItem.shape === sh} onClick={() => setCurrentItem({...currentItem, shape: sh})} />))}</div></section>
              <section><Label>Base</Label><div className="grid grid-cols-3 gap-2">{['MOP', 'Black', 'White', 'Clear', 'Others'].map(b => (<GridButton key={b} label={b} active={currentItem.base === b} onClick={() => setCurrentItem({...currentItem, base: b})} />))}</div></section>
              
              <section>
                <Label>Item Price (RM)</Label>
                <input type="number" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none text-2xl font-serif text-[#1B3022]" placeholder="Price for this item..." value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} />
              </section>

              <div className="bg-[#1B3022] p-6 rounded-[2.5rem] mt-6 shadow-xl space-y-4">
                <button onClick={addToBasket} className="w-full bg-[#B5935E] text-[#1B3022] py-5 rounded-2xl font-black text-sm uppercase tracking-widest">
                  Add Item to Basket
                </button>
                <button onClick={() => setStep(1)} className="w-full text-white/50 font-bold text-[10px] uppercase">Cancel Item</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-400">
               <Label>Transaction Summary</Label>
               <div className="space-y-2">
                 {basket.map((item, index) => (
                   <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex justify-between items-center shadow-sm">
                     <div className="text-xs font-bold uppercase tracking-tighter">
                       {item.category} <span className="text-[#B5935E] mx-1">/</span> {item.series}
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="font-serif italic text-sm">RM {item.price}</span>
                       <button onClick={() => removeFromBasket(item.id)} className="text-red-300"><Trash2 size={16}/></button>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                  <Label>Grand Total</Label>
                  <div className="text-5xl font-serif text-[#1B3022] mb-6">
                    RM {basket.reduce((acc, item) => acc + Number(item.price || 0), 0)}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['TnG', 'Grab', 'Cash', 'Card'].map(p => (
                      <button key={p} onClick={() => setCustomer({...customer, payment: p})} className={`py-3 text-[10px] font-black rounded-xl border ${customer.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50 text-gray-300'}`}>{p}</button>
                    ))}
                  </div>
               </div>

               <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
                <Label>Customer Profile</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['F', 'M'].map(g => (
                    <button key={g} onClick={() => setCustomer({...customer, gender: g})} className={`py-4 rounded-2xl border text-[11px] font-black transition-all ${customer.gender === g ? 'bg-[#1B3022] text-white' : 'bg-[#FDFBF7] text-gray-400'}`}>{g === 'F' ? 'FEMALE' : 'MALE'}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {['C', 'M', 'I', 'O'].map(r => (
                    <button key={r} onClick={() => setCustomer({...customer, race: r})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-[#FDFBF7] text-gray-400 border-transparent'}`}>{r}</button>
                  ))}
                </div>
              </section>

              <button onClick={handleFinalLog} className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl uppercase tracking-widest">
                {isSaving ? "LOGGING..." : `LOG ${basket.length} ITEMS`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD & SETTINGS (Same as V5) */}
      {view === 'dashboard' && step > 0 && (
         <div className="text-center py-20 opacity-30 italic">Dashboard Data Updating...</div>
      )}

      {/* FIXED BOTTOM NAVIGATION */}
      {step > 0 && (
        <nav className="fixed bottom-8 left-6 right-6 bg-[#1B3022] rounded-[2.5rem] p-2 flex justify-around items-center z-50 border border-white/5 shadow-2xl">
          <button onClick={() => setView('input')} className={`p-4 rounded-2xl transition-all ${view === 'input' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}><Plus size={24} /></button>
          <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}><BarChart3 size={24} /></button>
          <button onClick={() => setView('settings')} className={`p-4 rounded-2xl transition-all ${view === 'settings' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}><Settings size={24} /></button>
        </nav>
      )}
    </div>
  );
};

export default PetalArchiveOS;
