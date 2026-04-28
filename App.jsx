import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  BarChart3,
  Settings,
  CheckCircle2,
  Clock,
  History,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Loader2,
  RefreshCcw,
  Trash2
} from 'lucide-react';

const API_URL = "https://script.google.com/macros/s/AKfycby0J-XRdWfiG_gWmbo0ZWWYq9U21oKraAmGltJLyYfYkKK3WE0IRAxM9NujToig725I/exec";
const MASTER_SHEET_URL = "https://docs.google.com/spreadsheets/d/1h_fWIhLKMdXzduULMeH0OG56y1PdaG2G4WmZppyk7YI/edit?gid=0#gid=0";
const STORAGE_KEY = 'petal_archive_v17';

const EMPTY_ITEM = {
  category: '',
  series: '',
  style: '',
  metal: '',
  chain: '',
  shape: '',
  base: '',
  colourLetter: '',
  price: '',
  otherChain: '',
  otherShape: '',
  otherBase: '',
  otherColour: ''
};

const LOCATION_OPTIONS = ['163 Mall', 'Waterfront', 'Intermark', 'BSC', 'The Campus', 'Publika', 'Others'];
const MAIN_ITEMS = ['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'];
const CHAIN_TYPES = ['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'];
const SERIES_OPTIONS = ['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None'];
const STYLE_OPTIONS = ['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'Slider', 'None'];
const METAL_OPTIONS = ['STU', 'STG', 'STR', 'Brass'];
const SHAPE_OPTIONS = ['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'];
const BASE_OPTIONS = ['MOP', 'Black', 'White', 'Clear', 'Others'];
const COLOUR_OPTIONS = ['Red', 'Blue', 'Yellow', 'Purple', 'Pink', 'Clover', 'White', 'Multi', 'Others'];

const RACE_COLORS = {
  C: '#1B3022',
  M: '#B5935E',
  I: '#D8A7B1',
  O: '#7E9181'
};

const AGE_COLORS = {
  '10s': '#E8EEE9',
  '20s': '#C9D7C0',
  '30s': '#B5935E',
  '40s': '#8C6A3F',
  '50s': '#1B3022'
};

const PRICE_DIRECTORY = [
  {
    c: "Necklaces",
    i: [
      { n: "Cable / Snake Chain", p: "95" },
      { n: "M-Paperclip / Paperclip", p: "105" },
      { n: "3-Pearl / 3-Agate", p: "159" },
      { n: "Full Pearl", p: "239" }
    ]
  },
  {
    c: "Bracelets",
    i: [
      { n: "Snake / Box Chain", p: "95" },
      { n: "M-Paper / Twist", p: "105" },
      { n: "Charm Bracelet (3)", p: "169" }
    ]
  },
  {
    c: "Bangles & Rings",
    i: [
      { n: "Bangle (Twist)", p: "129" },
      { n: "Rings", p: "89" }
    ]
  }
];

const toCaps = (val = '') => String(val).toUpperCase();

const safeNumber = value => Number(value) || 0;

const getDateKey = timestamp => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'UNKNOWN';
  return date.toISOString().split('T')[0];
};

const getHourKey = timestamp => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'UNKNOWN';
  return `${date.toISOString().split('T')[0]}-${date.getHours()}`;
};

const Label = ({ children }) => (
  <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2 block">
    {children}
  </label>
);

const GridBtn = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all ${
      active
        ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-md'
        : 'bg-white text-[#1B3022] border-gray-100 shadow-sm'
    }`}
  >
    {label}
  </button>
);

const OtherInput = ({ value, onChange }) => (
  <div className="mt-3">
    <p className="text-[9px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2">
      PLEASE SPECIFY
    </p>
    <input
      className="w-full p-3 bg-white rounded-xl ring-1 ring-gray-100 text-xs uppercase font-bold outline-none"
      placeholder="PLEASE SPECIFY"
      value={value}
      onChange={e => onChange(toCaps(e.target.value))}
    />
  </div>
);

const MetricCard = ({ label, value, sub }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
    <p className="text-[8px] font-black text-[#B5935E] uppercase tracking-widest mb-2">{label}</p>
    <h3 className="text-2xl font-serif italic text-[#1B3022]">{value}</h3>
    {sub && <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{sub}</p>}
  </div>
);

const BarRow = ({ label, count, total, color }) => {
  const percentage = total ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
        <span>{label}</span>
        <span>{count} / {percentage}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

const PetalArchiveOS = () => {
  const [view, setView] = useState('input');
  const [step, setStep] = useState(0);
  const [basket, setBasket] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openPriceCat, setOpenPriceCat] = useState(null);

  const [session, setSession] = useState({
    eventName: '',
    organiser: '',
    location: '',
    otherLocation: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [currentItem, setCurrentItem] = useState(EMPTY_ITEM);

  const [customer, setCustomer] = useState({
    race: 'C',
    age: '20s',
    gender: 'F',
    payment: 'QR'
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      setSession(JSON.parse(saved));
      setStep(1);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const fetchLiveData = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setLiveData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'dashboard' && view !== 'history') return;
    fetchLiveData();
  }, [view]);

  const stats = useMemo(() => {
    const categories = {};
    const chains = {};
    const colours = {};
    const series = {};
    const locationRevenue = {};
    const monthlyRevenue = new Array(12).fill(0);
    const raceCounts = { C: 0, M: 0, I: 0, O: 0 };
    const ageCounts = { '10s': 0, '20s': 0, '30s': 0, '40s': 0, '50s': 0 };
    const genderCounts = { F: 0, M: 0 };
    const paymentCounts = { Cash: 0, Card: 0, QR: 0 };
    const rushHours = new Array(24).fill(0);
    const transactionIds = new Set();

    const locationMap = {};
    const segmentRevenue = {};

    let totalRevenue = 0;

    liveData.forEach((row, index) => {
      const price = safeNumber(row.price);
      const location = row.location || 'UNKNOWN';
      const transactionId = row.transactionId || `${row.timestamp || 'NO_TIME'}-${index}`;
      const hourKey = getHourKey(row.timestamp);
      const dateKey = row.date || getDateKey(row.timestamp);

      totalRevenue += price;
      transactionIds.add(transactionId);

      categories[row.category || 'UNKNOWN'] = (categories[row.category || 'UNKNOWN'] || 0) + 1;
      chains[row.chain || 'UNKNOWN'] = (chains[row.chain || 'UNKNOWN'] || 0) + 1;
      colours[row.colourLetter || row.colour || 'UNKNOWN'] = (colours[row.colourLetter || row.colour || 'UNKNOWN'] || 0) + 1;
      series[row.series || 'UNKNOWN'] = (series[row.series || 'UNKNOWN'] || 0) + 1;

      locationRevenue[location] = (locationRevenue[location] || 0) + price;

      if (!locationMap[location]) {
        locationMap[location] = {
          location,
          revenue: 0,
          pieces: 0,
          transactions: new Set(),
          activeHours: new Set(),
          sessions: new Set()
        };
      }

      locationMap[location].revenue += price;
      locationMap[location].pieces += 1;
      locationMap[location].transactions.add(transactionId);
      if (hourKey !== 'UNKNOWN') locationMap[location].activeHours.add(hourKey);
      if (dateKey !== 'UNKNOWN') locationMap[location].sessions.add(dateKey);

      const date = new Date(row.timestamp);

      if (!Number.isNaN(date.getTime())) {
        monthlyRevenue[date.getMonth()] += price;
        rushHours[date.getHours()] += 1;
      }

      if (row.customer) {
        const parts = row.customer.split(' | ');
        const race = parts[0];
        const age = parts[1];
        const gender = parts[2];

        if (race) raceCounts[race] = (raceCounts[race] || 0) + 1;
        if (age) ageCounts[age] = (ageCounts[age] || 0) + 1;
        if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;

        const segmentKey = [age, gender, race].filter(Boolean).join(' ');
        if (segmentKey) {
          segmentRevenue[segmentKey] = (segmentRevenue[segmentKey] || 0) + price;
        }
      }

      if (row.payment) {
        paymentCounts[row.payment] = (paymentCounts[row.payment] || 0) + 1;
      }
    });

    const totalTransactions = transactionIds.size || 0;
    const averageOrderValue = totalTransactions ? totalRevenue / totalTransactions : 0;
    const itemsPerTransaction = totalTransactions ? liveData.length / totalTransactions : 0;

    const locationEfficiency = Object.values(locationMap)
      .map(loc => {
        const transactions = loc.transactions.size;
        const activeHours = Math.max(loc.activeHours.size, 1);
        const sessions = loc.sessions.size;
        const revenuePerHour = loc.revenue / activeHours;
        const transactionsPerHour = transactions / activeHours;
        const aov = transactions ? loc.revenue / transactions : 0;

        const score = revenuePerHour * 0.5 + transactionsPerHour * 30 * 0.3 + aov * 0.2;

        return {
          location: loc.location,
          revenue: loc.revenue,
          pieces: loc.pieces,
          transactions,
          activeHours,
          sessions,
          revenuePerHour,
          transactionsPerHour,
          aov,
          score,
          isReliable: sessions >= 2 || activeHours >= 6
        };
      })
      .sort((a, b) => b.score - a.score);

    const topLocation = locationEfficiency[0] || null;

    const topHourIndex = rushHours.reduce((best, count, index, arr) => {
      return count > arr[best] ? index : best;
    }, 0);

    const topCustomerSegment = Object.entries(segmentRevenue)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalRevenue,
      totalPieces: liveData.length,
      totalTransactions,
      averageOrderValue,
      itemsPerTransaction,
      categories,
      chains,
      colours,
      series,
      locationRevenue,
      locationEfficiency,
      topLocation,
      monthlyRevenue,
      raceCounts,
      ageCounts,
      genderCounts,
      paymentCounts,
      rushHours,
      topHourIndex,
      topCustomerSegment
    };
  }, [liveData]);

  const saveSessionAndOpen = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setStep(1);
  };

  const logTransaction = async () => {
    const transactionId = `TX-${Date.now()}`;
    const finalLocation = session.location === 'Others' ? session.otherLocation : session.location;

    const payload = {
      transactionId,
      session: {
        ...session,
        location: finalLocation
      },
      basket,
      customer
    };

    try {
      setShowSuccess(true);

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      setBasket([]);
      setStep(1);

      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      alert("SYNC ERROR.");
      setShowSuccess(false);
    }
  };

  const clearCache = () => {
    if (window.confirm('Clear all local session data and refresh? This can help if the app is running slow.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const addToBasket = () => {
    const hasMissingOthers =
      (currentItem.chain === 'Others' && !currentItem.otherChain.trim()) ||
      (currentItem.shape === 'Others' && !currentItem.otherShape.trim()) ||
      (currentItem.base === 'Others' && !currentItem.otherBase.trim()) ||
      (currentItem.colourLetter === 'Others' && !currentItem.otherColour.trim());

    if (hasMissingOthers) {
      alert('PLEASE SPECIFY ALL OTHERS FIELDS.');
      return;
    }

    const normalizedItem = {
      ...currentItem,
      chain: currentItem.chain === 'Others' ? currentItem.otherChain : currentItem.chain,
      shape: currentItem.shape === 'Others' ? currentItem.otherShape : currentItem.shape,
      base: currentItem.base === 'Others' ? currentItem.otherBase : currentItem.base,
      colourLetter: currentItem.colourLetter === 'Others' ? currentItem.otherColour : currentItem.colourLetter,
      id: Date.now()
    };

    setBasket(prev => [...prev, normalizedItem]);
    setCurrentItem(EMPTY_ITEM);
    setStep(1);
  };

  const endSession = () => {
    if (window.confirm('End Session? Local tracker will be reset.')) {
      localStorage.removeItem(STORAGE_KEY);
      setStep(0);
      setView('input');
    }
  };

  const basketTotal = useMemo(() => {
    return basket.reduce((acc, item) => acc + safeNumber(item.price), 0);
  }, [basket]);

  const renderTopList = (data, suffix = 'SOLD') => (
    <div className="space-y-3">
      {Object.entries(data)
        .filter(([key]) => key && key !== 'UNKNOWN')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-[10px] font-black uppercase mb-1">
              <span>{key}</span>
              <span className="text-[#B5935E]">{value} {suffix}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B3022]"
                style={{
                  width: `${(value / Math.max(...Object.values(data), 1)) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-4 max-w-md mx-auto pb-32 overflow-x-hidden">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B3022]/90 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-12 rounded-[3rem] text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-[#E8EEE9] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-[#1B3022]" size={40} />
              </div>
              <h2 className="text-2xl font-serif italic text-[#1B3022]">Sale Archived</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B5935E] mt-2">
                Syncing with Master Sheet...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6 space-y-6">
            <header className="text-center">
              <h1 className="text-4xl font-serif italic">The Petal Archive</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-1">
                Sales Tracker
              </p>
            </header>

            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
              <div>
                <Label>Event Name</Label>
                <input
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold"
                  placeholder="E.G. HOLIDAY MARKET"
                  value={session.eventName}
                  onChange={e => setSession(prev => ({ ...prev, eventName: toCaps(e.target.value) }))}
                />
              </div>

              <div>
                <Label>Organiser</Label>
                <input
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold"
                  placeholder="E.G. ROTAN LOT"
                  value={session.organiser}
                  onChange={e => setSession(prev => ({ ...prev, organiser: toCaps(e.target.value) }))}
                />
              </div>

              <div>
                <Label>Location</Label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {LOCATION_OPTIONS.map(loc => (
                    <GridBtn
                      key={loc}
                      label={loc}
                      active={session.location === loc}
                      onClick={() =>
                        setSession(prev => ({
                          ...prev,
                          location: loc,
                          otherLocation: loc === 'Others' ? prev.otherLocation : ''
                        }))
                      }
                    />
                  ))}
                </div>

                {session.location === 'Others' && (
                  <div className="mt-3">
                    <p className="text-[9px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2">
                      PLEASE SPECIFY
                    </p>
                    <input
                      className="w-full p-3 bg-[#FDFBF7] rounded-xl ring-1 ring-gray-100 text-xs uppercase font-bold outline-none"
                      placeholder="PLEASE SPECIFY"
                      value={session.otherLocation}
                      onChange={e => setSession(prev => ({ ...prev, otherLocation: toCaps(e.target.value) }))}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Date</Label>
                <input
                  type="date"
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl ring-1 ring-gray-100"
                  value={session.date}
                  onChange={e => setSession(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <button
                type="button"
                onClick={saveSessionAndOpen}
                className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold shadow-xl uppercase"
              >
                Open Tracker
              </button>
            </div>
          </motion.div