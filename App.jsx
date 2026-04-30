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
const EVENT_HISTORY_KEY = 'petal_archive_event_history_v1';
const ORGANISER_HISTORY_KEY = 'petal_archive_organiser_history_v1';

const EMPTY_ITEM = {
  category: '',
  chain: '',
  style: '',
  shape: '',
  series: '',
  metal: '',
  base: '',
  colourLetter: '',
  price: '',
  otherChain: '',
  otherStyle: '',
  otherShape: '',
  otherSeries: '',
  otherBase: '',
  otherColour: ''
};

const LOCATION_OPTIONS = ['163 Mall', 'Waterfront', 'Intermark', 'BSC', 'The Campus', 'Publika', 'Others'];
const MAIN_ITEMS = ['Necklace', 'Bracelet', 'Ring', 'Earring', 'Bangle', 'Charm', 'Pendant', 'Chain'];
const CHAIN_TYPES = ['Cable', 'Snake', 'Paperclip', 'M-Paper', 'Kiss', 'Bead', 'None', 'Others'];
const STYLE_OPTIONS = ['Signet', 'Adjustable', 'Hoop', 'Hook', 'Stud', 'Dangle', 'None', 'Others'];
const SHAPE_OPTIONS = ['Round', 'Oval', 'Rectangle', 'Heart', 'Octagon', 'Others'];
const SERIES_OPTIONS = ['Alphabet', 'Plain', 'CZ', 'Pebble', 'Locket', 'None', 'Others'];
const METAL_OPTIONS = ['STU', 'STG', 'STR', 'Brass'];
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
      { n: "Beaded / Kiss / M-Paperclip / Paperclip", p: "105" },
      { n: "ETC", p: "129" },
      { n: "3-Pearl / 3-Agate / White, Multi C2", p: "159" },
      { n: "Half, Star Pearl", p: "179" },
      { n: "Full Pearl", p: "239" }
    ]
  },
  {
    c: "Bracelets",
    i: [
      { n: "Snake / SKinny Snake / Thick / Box Chain", p: "95" },
      { n: "M-Paper / Twist / Paperclip", p: "105" },
      { n: "Pretzel / ETC / CZ/Knot Big Link / White, Black, Green, Multicoloured C2", p: "115" },
      { n: "1/2 Pearl", p: "149" },
      { n: "Charm Bracelet (3)", p: "169" }
    ]
  },
  {
    c: "Bangles, Rings & Earrings",
    i: [
      { n: "Bangle (Twist)", p: "129" },
      { n: "Bangle (Curb / Open Link)", p: "115"},
      { n: "Hoop Earrings", p: "95"},
      { n: "Hook / Stud / Dangle", p: "89"},
      { n: "Pebble Large / Small", p: "95 / 89"},
      { n: "Rings", p: "89" }
    ]
    },
  {
    c: "Add-Ons & Standalone",
    i: [
      { n: "Floral Charm", p: "40" },
      { n: "Letter Charm", p: "30" },
      { n: "STG PDP Charm", p: "40" },
      { n: "Pendant Alone", p: "75" },
      { n: "Floral Charm Alone", p: "55" },
      { n: "Letter Charm Alone", p: "45" },
       { n: "STG PDP Charm Alone", p: "55" },
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
  const [eventHistory, setEventHistory] = useState([]);
  const [organiserHistory, setOrganiserHistory] = useState([]);

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

    if (saved) {
      try {
        setSession(JSON.parse(saved));
        setStep(1);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    try {
      setEventHistory(JSON.parse(localStorage.getItem(EVENT_HISTORY_KEY)) || []);
      setOrganiserHistory(JSON.parse(localStorage.getItem(ORGANISER_HISTORY_KEY)) || []);
    } catch {
      localStorage.removeItem(EVENT_HISTORY_KEY);
      localStorage.removeItem(ORGANISER_HISTORY_KEY);
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

  const getRowValue = (row, keys, fallback = '') => {
    for (const key of keys) {
      if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== '') {
        return row[key];
      }
    }
    return fallback;
  };

  const normalizeKey = value => toCaps(value).trim();

  const getRowDateKey = row => {
    const explicitDate = getRowValue(row, ['date', 'Date']);
    if (typeof explicitDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(explicitDate)) {
      return explicitDate;
    }

    return getDateKey(explicitDate || getRowValue(row, ['timestamp', 'Timestamp']));
  };

  const getRowCustomerPart = (row, field, index) => {
    const direct = getRowValue(row, [
      field,
      field.toUpperCase(),
      field.charAt(0).toUpperCase() + field.slice(1)
    ]);

    if (direct) return String(direct);

    const customerText = getRowValue(row, ['customer', 'Customer']);
    if (!customerText) return '';

    return String(customerText).split(' | ')[index] || '';
  };

  const getRowColour = row => getRowValue(row, [
    'colourLetter',
    'colourletter',
    'colour',
    'color',
    'colour/letter',
    'Colour / Letter',
    'Embedded Flower / Letter'
  ], 'UNKNOWN');

  const sessionLiveData = useMemo(() => {
  const finalLocation = normalizeKey(
  session.location === 'Others' ? session.otherLocation : session.location
);

  const targetEvent = normalizeKey(session.eventName);
  const targetOrganiser = normalizeKey(session.organiser);
  const targetLocation = normalizeKey(finalLocation);

  return liveData.filter(row => {
    const rowEvent = normalizeKey(getRowValue(row, ['event', 'Event', 'eventName', 'Event Name']));
    const rowOrganiser = normalizeKey(getRowValue(row, ['organiser', 'Organiser', 'organizer', 'Organizer']));
    const rowLocation = normalizeKey(getRowValue(row, ['location', 'Location']));

    return (
      rowEvent === targetEvent &&
      rowOrganiser === targetOrganiser &&
      rowLocation === targetLocation
    );
  });
}, [liveData, session]);

  const buildStats = (sourceData = []) => {
    const categories = {};
    const chains = {};
    const styles = {};
    const shapes = {};
    const series = {};
    const metals = {};
    const bases = {};
    const colours = {};
    const others = {};
    const locationRevenue = {};
    const monthlyRevenue = new Array(12).fill(0);
    const raceCounts = { C: 0, M: 0, I: 0, O: 0 };
    const ageCounts = { '10s': 0, '20s': 0, '30s': 0, '40s': 0, '50s': 0 };
    const genderCounts = { F: 0, M: 0 };
    const paymentCounts = { Cash: 0, Card: 0, QR: 0 };
    const paymentRevenue = { Cash: 0, Card: 0, QR: 0 };
    const rushHours = new Array(24).fill(0);
    const transactionIds = new Set();
    const locationMap = {};
    const segmentRevenue = {};

    let totalRevenue = 0;

    const count = (bucket, value) => {
      const key = value || 'UNKNOWN';
      bucket[key] = (bucket[key] || 0) + 1;
    };

    const trackOther = (value, allowedOptions) => {
      if (!value || value === 'UNKNOWN') return;
      if (!allowedOptions.includes(value)) {
        others[value] = (others[value] || 0) + 1;
      }
    };

    sourceData.forEach((row, index) => {
      const price = safeNumber(getRowValue(row, ['price', 'Price']));
      const timestamp = getRowValue(row, ['timestamp', 'Timestamp']);
      const transactionId = getRowValue(row, ['transactionId', 'transactionid', 'Transaction ID'], `${timestamp || 'NO_TIME'}-${index}`);
      const location = getRowValue(row, ['location', 'Location'], 'UNKNOWN');
      const category = getRowValue(row, ['category', 'Category'], 'UNKNOWN');
      const chain = getRowValue(row, ['chain', 'Chain'], 'UNKNOWN');
      const style = getRowValue(row, ['style', 'Style'], 'UNKNOWN');
      const shape = getRowValue(row, ['shape', 'Shape'], 'UNKNOWN');
      const itemSeries = getRowValue(row, ['series', 'Series'], 'UNKNOWN');
      const metal = getRowValue(row, ['metal', 'Metal'], 'UNKNOWN');
      const base = getRowValue(row, ['base', 'Base'], 'UNKNOWN');
      const colour = getRowColour(row);
      const payment = getRowValue(row, ['payment', 'Payment']);
      const hourKey = getHourKey(timestamp);
      const dateKey = getRowDateKey(row);

      totalRevenue += price;
      transactionIds.add(transactionId);

      count(categories, category);
      count(chains, chain);
      count(styles, style);
      count(shapes, shape);
      count(series, itemSeries);
      count(metals, metal);
      count(bases, base);
      count(colours, colour);

      trackOther(chain, CHAIN_TYPES);
      trackOther(style, STYLE_OPTIONS);
      trackOther(shape, SHAPE_OPTIONS);
      trackOther(itemSeries, SERIES_OPTIONS);
      trackOther(base, BASE_OPTIONS);
      trackOther(colour, COLOUR_OPTIONS);

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

      const date = new Date(timestamp);
      if (!Number.isNaN(date.getTime())) {
        monthlyRevenue[date.getMonth()] += price;
        rushHours[date.getHours()] += 1;
      }

      const race = getRowCustomerPart(row, 'race', 0);
      const age = getRowCustomerPart(row, 'age', 1);
      const gender = getRowCustomerPart(row, 'gender', 2);

      if (race) raceCounts[race] = (raceCounts[race] || 0) + 1;
      if (age) ageCounts[age] = (ageCounts[age] || 0) + 1;
      if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;

      const segmentKey = [age, gender, race].filter(Boolean).join(' ');
      if (segmentKey) {
        segmentRevenue[segmentKey] = (segmentRevenue[segmentKey] || 0) + price;
      }

      if (payment) {
        paymentCounts[payment] = (paymentCounts[payment] || 0) + 1;
        paymentRevenue[payment] = (paymentRevenue[payment] || 0) + price;
      }
    });

    const totalTransactions = transactionIds.size || 0;
    const averageOrderValue = totalTransactions ? totalRevenue / totalTransactions : 0;
    const itemsPerTransaction = totalTransactions ? sourceData.length / totalTransactions : 0;

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
    const topHourIndex = rushHours.reduce((best, countValue, index, arr) => {
      return countValue > arr[best] ? index : best;
    }, 0);
    const topCustomerSegment = Object.entries(segmentRevenue).sort((a, b) => b[1] - a[1])[0];

    return {
      totalRevenue,
      totalPieces: sourceData.length,
      totalTransactions,
      averageOrderValue,
      itemsPerTransaction,
      categories,
      chains,
      styles,
      shapes,
      series,
      metals,
      bases,
      colours,
      others,
      locationRevenue,
      locationEfficiency,
      topLocation,
      monthlyRevenue,
      raceCounts,
      ageCounts,
      genderCounts,
      paymentCounts,
      paymentRevenue,
      rushHours,
      topHourIndex,
      topCustomerSegment
    };
  };

  const sessionStats = useMemo(() => buildStats(sessionLiveData), [sessionLiveData]);
  const biStats = useMemo(() => buildStats(liveData), [liveData]);

  const saveSessionAndOpen = () => {
    const cleanEventName = toCaps(session.eventName).trim();
    const cleanOrganiser = toCaps(session.organiser).trim();

    const nextSession = {
      ...session,
      eventName: cleanEventName,
      organiser: cleanOrganiser
    };

    const nextEventHistory = cleanEventName
      ? [cleanEventName, ...eventHistory.filter(item => item !== cleanEventName)].slice(0, 8)
      : eventHistory;

    const nextOrganiserHistory = cleanOrganiser
      ? [cleanOrganiser, ...organiserHistory.filter(item => item !== cleanOrganiser)].slice(0, 8)
      : organiserHistory;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    localStorage.setItem(EVENT_HISTORY_KEY, JSON.stringify(nextEventHistory));
    localStorage.setItem(ORGANISER_HISTORY_KEY, JSON.stringify(nextOrganiserHistory));

    setSession(nextSession);
    setEventHistory(nextEventHistory);
    setOrganiserHistory(nextOrganiserHistory);
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
      (currentItem.style === 'Others' && !currentItem.otherStyle.trim()) ||
      (currentItem.shape === 'Others' && !currentItem.otherShape.trim()) ||
      (currentItem.series === 'Others' && !currentItem.otherSeries.trim()) ||
      (currentItem.base === 'Others' && !currentItem.otherBase.trim()) ||
      (currentItem.colourLetter === 'Others' && !currentItem.otherColour.trim());

    if (hasMissingOthers) {
      alert('PLEASE SPECIFY ALL OTHERS FIELDS.');
      return;
    }

    const normalizedItem = {
      ...currentItem,
      chain: currentItem.chain === 'Others' ? currentItem.otherChain : currentItem.chain,
      style: currentItem.style === 'Others' ? currentItem.otherStyle : currentItem.style,
      shape: currentItem.shape === 'Others' ? currentItem.otherShape : currentItem.shape,
      series: currentItem.series === 'Others' ? currentItem.otherSeries : currentItem.series,
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
                  list="event-history"
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold"
                  placeholder="E.G. PINGMIN MARKET"
                  value={session.eventName}
                  onChange={e => setSession(prev => ({ ...prev, eventName: toCaps(e.target.value) }))}
                />
                <datalist id="event-history">
                  {eventHistory.map(item => (
                    <option key={item} value={item} />
                  ))}
                </datalist>

                {eventHistory.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {eventHistory.slice(0, 4).map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSession(prev => ({ ...prev, eventName: item }))}
                        className="px-3 py-2 rounded-full bg-[#E8EEE9] text-[#1B3022] text-[9px] font-black uppercase"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Organiser</Label>
                <input
                  list="organiser-history"
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold"
                  placeholder="E.G. FINCH MARKET"
                  value={session.organiser}
                  onChange={e => setSession(prev => ({ ...prev, organiser: toCaps(e.target.value) }))}
                />
                <datalist id="organiser-history">
                  {organiserHistory.map(item => (
                    <option key={item} value={item} />
                  ))}
                </datalist>

                {organiserHistory.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {organiserHistory.slice(0, 4).map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSession(prev => ({ ...prev, organiser: item }))}
                        className="px-3 py-2 rounded-full bg-[#E8EEE9] text-[#1B3022] text-[9px] font-black uppercase"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
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
          </motion.div>
        )}

        {view === 'input' && step > 0 && (
          <motion.div key="input" className="space-y-6">
            <div className="bg-[#1B3022] p-4 rounded-2xl flex justify-between items-center text-white">
              <div>
                <p className="text-[10px] font-black uppercase text-[#B5935E]">
                  {session.location === 'Others' ? session.otherLocation : session.location}
                </p>
                <p className="text-[11px] font-serif italic">{basket.length} Items</p>
              </div>

              {basket.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-[#B5935E] px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg"
                >
                  Checkout
                </button>
              )}
            </div>

            {step === 1 && (
              <div className="space-y-7">
                <section>
                  <Label>1. Jewellery Category / Main Item</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {MAIN_ITEMS.map(c => (
                      <GridBtn
                        key={c}
                        label={c}
                        active={currentItem.category === c}
                        onClick={() => setCurrentItem(prev => ({ ...prev, category: c }))}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <Label>2. Chain Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {CHAIN_TYPES.map(ch => (
                      <GridBtn
                        key={ch}
                        label={ch}
                        active={currentItem.chain === ch}
                        onClick={() =>
                          setCurrentItem(prev => ({
                            ...prev,
                            chain: ch,
                            otherChain: ch === 'Others' ? prev.otherChain : ''
                          }))
                        }
                      />
                    ))}
                  </div>

                  {currentItem.chain === 'Others' && (
                    <OtherInput
                      value={currentItem.otherChain}
                      onChange={value => setCurrentItem(prev => ({ ...prev, otherChain: value }))}
                    />
                  )}
                </section>

                <section>
                  <Label>3. Earring / Ring Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STYLE_OPTIONS.map(st => (
                      <GridBtn
                        key={st}
                        label={st}
                        active={currentItem.style === st}
                        onClick={() =>
                          setCurrentItem(prev => ({
                            ...prev,
                            style: st,
                            otherStyle: st === 'Others' ? prev.otherStyle : ''
                          }))
                        }
                      />
                    ))}
                  </div>

                  {currentItem.style === 'Others' && (
                    <OtherInput
                      value={currentItem.otherStyle}
                      onChange={value => setCurrentItem(prev => ({ ...prev, otherStyle: value }))}
                    />
                  )}
                </section>

                <section>
                  <Label>4. Shape</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SHAPE_OPTIONS.map(sh => (
                      <GridBtn
                        key={sh}
                        label={sh}
                        active={currentItem.shape === sh}
                        onClick={() =>
                          setCurrentItem(prev => ({
                            ...prev,
                            shape: sh,
                            otherShape: sh === 'Others' ? prev.otherShape : ''
                          }))
                        }
                      />
                    ))}
                  </div>

                  {currentItem.shape === 'Others' && (
                    <OtherInput
                      value={currentItem.otherShape}
                      onChange={value => setCurrentItem(prev => ({ ...prev, otherShape: value }))}
                    />
                  )}
                </section>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm uppercase shadow-lg"
                >
                  Next Details
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <section>
                  <Label>5. Series</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SERIES_OPTIONS.map(s => (
                      <GridBtn
                        key={s}
                        label={s}
                        active={currentItem.series === s}
                        onClick={() =>
                          setCurrentItem(prev => ({
                            ...prev,
                            series: s,
                            otherSeries: s === 'Others' ? prev.otherSeries : ''
                          }))
                        }
                      />
                    ))}
                  </div>

                  {currentItem.series === 'Others' && (
                    <OtherInput
                      value={currentItem.otherSeries}
                      onChange={value => setCurrentItem(prev => ({ ...prev, otherSeries: value }))}
                    />
                  )}
                </section>

                <section>
                  <Label>6. Metal</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {METAL_OPTIONS.map(m => (
                      <GridBtn
                        key={m}
                        label={m}
                        active={currentItem.metal === m}
                        onClick={() => setCurrentItem(prev => ({ ...prev, metal: m }))}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <Label>7. Base</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {BASE_OPTIONS.map(b => (
                      <GridBtn
                        key={b}
                        label={b}
                        active={currentItem.base === b}
                        onClick={() =>
                          setCurrentItem(prev => ({
                            ...prev,
                            base: b,
                            otherBase: b === 'Others' ? prev.otherBase : ''
                          }))
                        }
                      />
                    ))}
                  </div>

                  {currentItem.base === 'Others' && (
                    <OtherInput
                      value={currentItem.otherBase}
                      onChange={value => setCurrentItem(prev => ({ ...prev, otherBase: value }))}
                    />
                  )}
                </section>

                <section>
                  <Label>8. Embedded Flower / Letter</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOUR_OPTIONS.map(col => (
                      <GridBtn
                        key={col}
                        label={col}
                        active={currentItem.colourLetter === col}
                        onClick={() =>
                          setCurrentItem(prev => ({
                            ...prev,
                            colourLetter: col,
                            otherColour: col === 'Others' ? prev.otherColour : ''
                          }))
                        }
                      />
                    ))}
                  </div>

                  {currentItem.colourLetter === 'Others' && (
                    <OtherInput
                      value={currentItem.otherColour}
                      onChange={value => setCurrentItem(prev => ({ ...prev, otherColour: value }))}
                    />
                  )}
                </section>

                <section>
                  <Label>Price (RM)</Label>
                  <input
                    type="number"
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-2xl font-serif text-[#1B3022] shadow-sm outline-none"
                    value={currentItem.price}
                    onChange={e => setCurrentItem(prev => ({ ...prev, price: e.target.value }))}
                  />
                </section>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={addToBasket}
                    className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black shadow-xl"
                  >
                    ADD TO BASKET
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                  <Label>Transaction Total</Label>
                  <div className="text-6xl font-serif text-[#1B3022] mb-6">
                    RM {basketTotal}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'Card', 'QR'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, payment: p }))}
                        className={`py-3 text-[10px] font-black rounded-xl border ${
                          customer.payment === p ? 'bg-[#1B3022] text-white' : 'bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <section className="bg-white p-8 rounded-[3rem] border border-gray-100 space-y-4">
                  <Label>Customer Profile</Label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomer(prev => ({ ...prev, gender: 'F' }))}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${
                        customer.gender === 'F' ? 'bg-[#1B3022] text-white' : 'bg-gray-50'
                      }`}
                    >
                      FEMALE
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomer(prev => ({ ...prev, gender: 'M' }))}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${
                        customer.gender === 'M' ? 'bg-[#1B3022] text-white' : 'bg-gray-50'
                      }`}
                    >
                      MALE
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {['C', 'M', 'I', 'O'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, race: r }))}
                        className={`py-2 rounded-lg text-[10px] font-black ${
                          customer.race === r ? 'bg-[#B5935E] text-white' : 'bg-gray-50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {['10s', '20s', '30s', '40s', '50s'].map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, age: a }))}
                        className={`py-2 rounded-lg text-[10px] font-black ${
                          customer.age === a ? 'bg-[#B5935E] text-white' : 'bg-gray-50'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </section>

                <button
                  type="button"
                  onClick={logTransaction}
                  className="w-full bg-[#1B3022] text-white py-7 rounded-3xl font-black text-xl shadow-2xl uppercase tracking-widest"
                >
                  Log Transaction
                </button>
              </div>
            )}
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div key="dash" className="space-y-6">
            <header className="flex justify-between items-center py-6">
              <h2 className="text-3xl font-serif italic text-[#1B3022]">Session Insights</h2>
              {isLoading && <Loader2 className="animate-spin text-[#B5935E]" size={20} />}
            </header>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1B3022] p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-32">
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Revenue</p>
                <h3 className="text-3xl font-serif italic">RM {Math.round(sessionStats.totalRevenue).toLocaleString()}</h3>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <p className="text-[9px] font-bold text-[#B5935E] uppercase tracking-widest">Pieces Sold</p>
                <h3 className="text-3xl font-serif italic text-[#1B3022]">{sessionStats.totalPieces}</h3>
              </div>

              <MetricCard
                label="Average Order"
                value={`RM ${Math.round(sessionStats.averageOrderValue)}`}
                sub={`${sessionStats.totalTransactions} transactions`}
              />

              <MetricCard
                label="Basket Size"
                value={sessionStats.itemsPerTransaction.toFixed(1)}
                sub="items per sale"
              />
            </div>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Categories</Label>
              {renderTopList(sessionStats.categories)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Series</Label>
              {renderTopList(sessionStats.series)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Colours / Letters</Label>
              {renderTopList(sessionStats.colours)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Customer Age Split</Label>
              <div className="space-y-4">
                {Object.entries(sessionStats.ageCounts).map(([age, count]) => (
                  <BarRow
                    key={age}
                    label={age}
                    count={count}
                    total={sessionStats.totalPieces}
                    color={AGE_COLORS[age]}
                  />
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Customer Race Split</Label>
              <div className="space-y-4">
                {Object.entries(sessionStats.raceCounts).map(([race, count]) => (
                  <BarRow
                    key={race}
                    label={race}
                    count={count}
                    total={sessionStats.totalPieces}
                    color={RACE_COLORS[race]}
                  />
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
  <Label>Payment Revenue Split</Label>

  <div className="space-y-4">
    {Object.entries(sessionStats.paymentRevenue).map(([payment, value]) => {
      const percentage = sessionStats.totalRevenue
        ? Math.round((value / sessionStats.totalRevenue) * 100)
        : 0;

      return (
        <div key={payment}>
          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
            <span>{payment}</span>
            <span>RM {Math.round(value)} / {percentage}%</span>
          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${percentage}%`,
                backgroundColor:
                  payment === 'QR'
                    ? '#1B3022'
                    : payment === 'Card'
                      ? '#B5935E'
                      : '#7E9181'
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
</section>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div key="bi" className="space-y-6">
            <header className="text-center py-6">
              <h2 className="text-3xl font-serif italic text-[#1B3022]">Business Intelligence</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#B5935E] mt-2">
                Efficiency, not raw totals
              </p>
            </header>

            <section className="bg-[#1B3022] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <Activity className="absolute right-[-10px] top-[-10px] text-white/5" size={120} />

              <div className="relative z-10 space-y-5">
                <div>
                  <Label>
                    <span className="text-[#B5935E]">Best Location Normalized</span>
                  </Label>

                  <h4 className="text-3xl font-serif italic">
                    {biStats.topLocation?.location || 'NO DATA'}
                  </h4>

                  {biStats.topLocation && !biStats.topLocation.isReliable && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-200 mt-2">
                      Insufficient sample size
                    </p>
                  )}
                </div>

                {biStats.topLocation && (
                  <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
                    <div>
                      <p className="text-[8px] opacity-40 uppercase font-black">RM / Hour</p>
                      <p className="text-lg font-serif">RM {Math.round(biStats.topLocation.revenuePerHour)}</p>
                    </div>

                    <div>
                      <p className="text-[8px] opacity-40 uppercase font-black">Sales / Hour</p>
                      <p className="text-lg font-serif">{biStats.topLocation.transactionsPerHour.toFixed(1)}</p>
                    </div>

                    <div>
                      <p className="text-[8px] opacity-40 uppercase font-black">AOV</p>
                      <p className="text-lg font-serif">RM {Math.round(biStats.topLocation.aov)}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Location Efficiency Ranking</Label>

              <div className="space-y-5">
                {biStats.locationEfficiency.map((loc, index) => (
                  <div key={loc.location} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          #{index + 1} {loc.location}
                        </p>

                        {!loc.isReliable && (
                          <p className="text-[8px] font-black uppercase tracking-widest text-red-300 mt-1">
                            Low sample
                          </p>
                        )}
                      </div>

                      <p className="text-xl font-serif italic text-[#B5935E]">
                        {Math.round(loc.score)}
                      </p>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-[#1B3022]"
                        style={{
                          width: `${(loc.score / (biStats.locationEfficiency[0]?.score || 1)) * 100}%`
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[9px] font-black uppercase text-gray-400">
                      <span>RM {Math.round(loc.revenuePerHour)}/HR</span>
                      <span>{loc.transactionsPerHour.toFixed(1)} SALES/HR</span>
                      <span>RM {Math.round(loc.aov)} AOV</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Peak Hour"
                value={`${biStats.topHourIndex}:00`}
                sub={`${biStats.rushHours[biStats.topHourIndex] || 0} sales`}
              />

              <MetricCard
                label="Best Segment"
                value={biStats.topCustomerSegment?.[0] || 'NO DATA'}
                sub={biStats.topCustomerSegment ? `RM ${Math.round(biStats.topCustomerSegment[1])}` : ''}
              />
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Chains</Label>
              {renderTopList(biStats.chains)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Series</Label>
              {renderTopList(biStats.series)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Styles</Label>
              {renderTopList(biStats.styles)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Metals</Label>
              {renderTopList(biStats.metals)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Shapes</Label>
              {renderTopList(biStats.shapes)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Bases</Label>
              {renderTopList(biStats.bases)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Top Colours / Letters</Label>
              {renderTopList(biStats.colours)}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Custom / Others Entries</Label>
              {renderTopList(biStats.others, 'ENTRIES')}
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Payment Split</Label>
              <div className="space-y-4">
                {Object.entries(biStats.paymentCounts).map(([payment, count]) => (
                  <BarRow
                    key={payment}
                    label={payment}
                    count={count}
                    total={biStats.totalTransactions || biStats.totalPieces}
                    color={payment === 'QR' ? '#1B3022' : payment === 'Card' ? '#B5935E' : '#7E9181'}
                  />
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
              <Label>Monthly Seasonality (RM)</Label>

              <div className="flex items-end gap-1 h-24 pt-4">
                {biStats.monthlyRevenue.map((rev, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#1B3022] rounded-t-sm"
                    style={{
                      height: `${(rev / (Math.max(...biStats.monthlyRevenue) || 1)) * 100}%`
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-between mt-2 text-[8px] font-black text-gray-200">
                <span>JAN</span>
                <span>DEC</span>
              </div>
            </section>
          </motion.div>
        )}

        {view === 'settings' && (
          <motion.div key="settings" className="space-y-6">
            <header className="text-center py-6">
              <h2 className="text-3xl font-serif italic text-[#1B3022]">Command Center</h2>
            </header>

            <section className="bg-[#1B3022] p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-[#B5935E] font-black text-[10px] uppercase tracking-widest">
                <Clock size={16} /> Quick Rules
              </div>

              <div className="space-y-3 text-[10px] font-black uppercase tracking-[0.1em]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Chains Alone</span>
                  <span className="text-[#B5935E]">- RM 30</span>
                </div>

                <div className="flex justify-between">
                  <span>Clover Items</span>
                  <span className="text-[#B5935E]">+ RM 14</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 flex items-center gap-2">
                <BookOpen size={18} className="text-[#B5935E]" />
                <Label>Price Directory</Label>
              </div>

              <div className="space-y-1">
                {PRICE_DIRECTORY.map((group, i) => (
                  <div key={group.c} className="px-2">
                    <button
                      type="button"
                      onClick={() => setOpenPriceCat(prev => (prev === i ? null : i))}
                      className="w-full p-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#1B3022] bg-[#FDFBF7] rounded-xl mb-1"
                    >
                      {group.c}
                      {openPriceCat === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {openPriceCat === i && (
                      <div className="p-4 space-y-3 bg-white border border-gray-100 rounded-xl mb-2">
                        {group.i.map(it => (
                          <div
                            key={it.n}
                            className="flex justify-between text-[10px] border-b border-gray-50 pb-2 italic"
                          >
                            <span className="text-gray-400 font-bold uppercase not-italic tracking-tighter">
                              {it.n}
                            </span>
                            <span>RM {it.p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <a
              href={MASTER_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-6 bg-[#E8EEE9] rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm text-[#1B3022] border border-[#1B3022]/5"
            >
              <ExternalLink size={16} /> Open Master Database
            </a>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={clearCache}
                className="bg-white text-gray-400 py-6 rounded-[2rem] font-black text-[9px] uppercase border border-gray-100 flex flex-col items-center gap-2 shadow-sm"
              >
                <RefreshCcw size={14} /> Clear App Cache
              </button>

              <button
                type="button"
                onClick={endSession}
                className="bg-red-50 text-red-400 py-6 rounded-[2rem] font-black text-[9px] uppercase border border-red-100 flex flex-col items-center gap-2 shadow-sm"
              >
                <Trash2 size={14} /> End Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step > 0 && (
        <nav className="fixed bottom-8 left-6 right-6 bg-[#1B3022] rounded-[2.5rem] p-2 flex justify-around items-center z-50 shadow-2xl border border-white/5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setView('input')}
            className={`p-4 rounded-2xl transition-all ${
              view === 'input' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            <Plus size={22} />
          </button>

          <button
            type="button"
            onClick={() => setView('dashboard')}
            className={`p-4 rounded-2xl transition-all ${
              view === 'dashboard' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            <BarChart3 size={22} />
          </button>

          <button
            type="button"
            onClick={() => setView('history')}
            className={`p-4 rounded-2xl transition-all ${
              view === 'history' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500'
            }`}
          >
            <History size={22} />
          </button>

          <button
            type="button"
            onClick={() => setView('settings')}
            className={`p-4 rounded-2xl transition-all ${
              view === 'settings' ? 'bg-[#B5935E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            <Settings size={22} />
          </button>
        </nav>
      )}
    </div>
  );
};

export default PetalArchiveOS;
