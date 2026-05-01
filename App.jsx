import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, BarChart3, Settings, CheckCircle2, Clock,
  History, BookOpen, ExternalLink, ChevronDown, ChevronUp,
  Activity, Loader2, RefreshCcw, Trash2, WifiOff, AlertTriangle
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL =
  "https://script.google.com/macros/s/AKfycby0J-XRdWfiG_gWmbo0ZWWYq9U21oKraAmGltJLyYfYkKK3WE0IRAxM9NujToig725I/exec";
const MASTER_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1h_fWIhLKMdXzduULMeH0OG56y1PdaG2G4WmZppyk7YI/edit?gid=0#gid=0";

const STORAGE_KEYS = {
  SESSION:           "petal_session_v1",
  EVENT_HISTORY:     "petal_event_history_v1",
  ORGANISER_HISTORY: "petal_organiser_history_v1",
  PENDING:           "petal_pending_transactions_v1",
};

const VIEWS = { INPUT: "input", DASHBOARD: "dashboard", BI: "bi", SETTINGS: "settings" };
const STEPS = { SETUP: 0, ITEM_A: 1, ITEM_B: 2, CHECKOUT: 3 };

const LOCATION_OPTIONS = ["163 Mall","Waterfront","Intermark","BSC","The Campus","Publika","Others"];
const MAIN_ITEMS       = ["Necklace","Bracelet","Ring","Earring","Bangle","Charm","Pendant","Chain"];
const CHAIN_TYPES      = ["Cable","Snake","Paperclip","M-Paper","Kiss","Bead","None","Others"];
const STYLE_OPTIONS    = ["Signet","Adjustable","Hoop","Hook","Stud","Dangle","None","Others"];
const SHAPE_OPTIONS    = ["Round","Oval","Rectangle","Heart","Octagon","Others"];
const SERIES_OPTIONS   = ["Alphabet","Plain","CZ","Pebble","Locket","None","Others"];
const METAL_OPTIONS    = ["STU","STG","STR","Brass"];
const BASE_OPTIONS     = ["MOP","Black","White","Clear","Others"];
const COLOUR_OPTIONS   = ["Red","Blue","Yellow","Purple","Pink","Clover","White","Multi","Others"];

const RACE_COLORS = { C:"#1B3022", M:"#B5935E", I:"#D8A7B1", O:"#7E9181" };
const AGE_COLORS  = { "10s":"#E8EEE9","20s":"#C9D7C0","30s":"#B5935E","40s":"#8C6A3F","50s":"#1B3022" };

const PRICE_DIRECTORY = [
  { c:"Necklaces", i:[
    { n:"Cable / Snake Chain", p:"95" },
    { n:"Beaded / Kiss / M-Paperclip / Paperclip", p:"105" },
    { n:"ETC", p:"129" },
    { n:"3-Pearl / 3-Agate / White, Multi C2", p:"159" },
    { n:"Half, Star Pearl", p:"179" },
    { n:"Full Pearl", p:"239" },
  ]},
  { c:"Bracelets", i:[
    { n:"Snake / Skinny Snake / Thick / Box Chain", p:"95" },
    { n:"M-Paper / Twist / Paperclip", p:"105" },
    { n:"Pretzel / ETC / CZ / Knot Big Link / Coloured C2", p:"115" },
    { n:"1/2 Pearl", p:"149" },
    { n:"Charm Bracelet (3)", p:"169" },
  ]},
  { c:"Bangles, Rings & Earrings", i:[
    { n:"Bangle (Twist)", p:"129" },
    { n:"Bangle (Curb / Open Link)", p:"115" },
    { n:"Hoop Earrings", p:"95" },
    { n:"Hook / Stud / Dangle", p:"89" },
    { n:"Pebble Large / Small", p:"95 / 89" },
    { n:"Rings", p:"89" },
  ]},
  { c:"Add-Ons & Standalone", i:[
    { n:"Floral Charm", p:"40" },
    { n:"Letter Charm", p:"30" },
    { n:"STG PDP Charm", p:"40" },
    { n:"Pendant Alone", p:"75" },
    { n:"Floral Charm Alone", p:"55" },
    { n:"Letter Charm Alone", p:"45" },
    { n:"STG PDP Charm Alone", p:"55" },
  ]},
];

const EMPTY_ITEM = {
  category:"", chain:"", style:"", shape:"", series:"",
  metal:"", base:"", colourLetter:"", price:"",
  otherChain:"", otherStyle:"", otherShape:"",
  otherSeries:"", otherBase:"", otherColour:"",
};

const DEFAULT_SESSION = {
  eventName:"", organiser:"", location:"", otherLocation:"",
  date: new Date().toISOString().split("T")[0],
};

const DEFAULT_CUSTOMER = { race:"C", age:"20s", gender:"F", payment:"QR" };

// ─── Pure utilities (outside component — never recreated on render) ───────────

const toCaps  = (v = "") => String(v).toUpperCase();
const safeNum = (v)      => Number(v) || 0;
const normKey = (v)      => toCaps(v).trim();

const getDateKey = (ts) => {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "UNKNOWN" : d.toISOString().split("T")[0];
};

const getHourKey = (ts) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "UNKNOWN";
  return `${d.toISOString().split("T")[0]}-${d.getHours()}`;
};

const rowVal = (row, keys, fallback = "") => {
  for (const k of keys) {
    if (row?.[k] !== undefined && row?.[k] !== null && row?.[k] !== "") return row[k];
  }
  return fallback;
};

const rowDateKey = (row) => {
  const explicit = rowVal(row, ["date","Date"]);
  if (typeof explicit === "string" && /^\d{4}-\d{2}-\d{2}$/.test(explicit)) return explicit;
  return getDateKey(explicit || rowVal(row, ["timestamp","Timestamp"]));
};

const rowCustomerPart = (row, field, idx) => {
  const direct = rowVal(row, [field, field.toUpperCase(), field[0].toUpperCase() + field.slice(1)]);
  if (direct) return String(direct);
  const txt = rowVal(row, ["customer","Customer"]);
  return txt ? String(txt).split(" | ")[idx] || "" : "";
};

const rowColour = (row) =>
  rowVal(row, ["colourLetter","colourletter","colour","color","colour/letter","Colour / Letter","Embedded Flower / Letter"], "UNKNOWN");

// ─── Stats engine (pure function, defined outside component) ──────────────────

function buildStats(sourceData = []) {
  const cats = {}, chains = {}, styles = {}, shapes = {},
        series = {}, metals = {}, bases = {}, colours = {},
        others = {}, locRevenue = {}, segRevenue = {},
        raceCounts   = { C:0,M:0,I:0,O:0 },
        ageCounts    = { "10s":0,"20s":0,"30s":0,"40s":0,"50s":0 },
        genderCounts = { F:0,M:0 },
        paymentCounts  = { Cash:0,Card:0,QR:0 },
        paymentRevenue = { Cash:0,Card:0,QR:0 },
        rushHours      = new Array(24).fill(0),
        monthlyRevenue = new Array(12).fill(0),
        locMap = {},
        txIds  = new Set();

  let totalRevenue = 0;

  const bump = (bucket, val) => {
    const k = val || "UNKNOWN";
    bucket[k] = (bucket[k] || 0) + 1;
  };
  const trackOther = (val, allowed) => {
    if (!val || val === "UNKNOWN") return;
    if (!allowed.includes(val)) others[val] = (others[val] || 0) + 1;
  };

  sourceData.forEach((row, idx) => {
    const price      = safeNum(rowVal(row, ["price","Price"]));
    const timestamp  = rowVal(row, ["timestamp","Timestamp"]);
    const txId       = rowVal(row, ["transactionId","transactionid","Transaction ID"], `${timestamp||"NO_TIME"}-${idx}`);
    const location   = rowVal(row, ["location","Location"], "UNKNOWN");
    const category   = rowVal(row, ["category","Category"], "UNKNOWN");
    const chain      = rowVal(row, ["chain","Chain"], "UNKNOWN");
    const style      = rowVal(row, ["style","Style"], "UNKNOWN");
    const shape      = rowVal(row, ["shape","Shape"], "UNKNOWN");
    const itemSeries = rowVal(row, ["series","Series"], "UNKNOWN");
    const metal      = rowVal(row, ["metal","Metal"], "UNKNOWN");
    const base       = rowVal(row, ["base","Base"], "UNKNOWN");
    const colour     = rowColour(row);
    const payment    = rowVal(row, ["payment","Payment"]);
    const hourKey    = getHourKey(timestamp);
    const dateKey    = rowDateKey(row);

    totalRevenue += price;
    txIds.add(txId);

    bump(cats, category); bump(chains, chain); bump(styles, style);
    bump(shapes, shape);  bump(series, itemSeries); bump(metals, metal);
    bump(bases, base);    bump(colours, colour);

    trackOther(chain, CHAIN_TYPES);   trackOther(style, STYLE_OPTIONS);
    trackOther(shape, SHAPE_OPTIONS); trackOther(itemSeries, SERIES_OPTIONS);
    trackOther(base, BASE_OPTIONS);   trackOther(colour, COLOUR_OPTIONS);

    locRevenue[location] = (locRevenue[location] || 0) + price;

    if (!locMap[location]) {
      locMap[location] = { location, revenue:0, pieces:0, txSet:new Set(), hourSet:new Set(), dateSet:new Set() };
    }
    locMap[location].revenue += price;
    locMap[location].pieces  += 1;
    locMap[location].txSet.add(txId);
    if (hourKey !== "UNKNOWN") locMap[location].hourSet.add(hourKey);
    if (dateKey !== "UNKNOWN") locMap[location].dateSet.add(dateKey);

    const d = new Date(timestamp);
    if (!Number.isNaN(d.getTime())) {
      monthlyRevenue[d.getMonth()] += price;
      rushHours[d.getHours()]      += 1;
    }

    const race   = rowCustomerPart(row, "race",   0);
    const age    = rowCustomerPart(row, "age",    1);
    const gender = rowCustomerPart(row, "gender", 2);

    if (race)   raceCounts[race]     = (raceCounts[race] || 0) + 1;
    if (age)    ageCounts[age]       = (ageCounts[age] || 0) + 1;
    if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;

    const segKey = [age, gender, race].filter(Boolean).join(" ");
    if (segKey) segRevenue[segKey] = (segRevenue[segKey] || 0) + price;

    if (payment) {
      paymentCounts[payment]  = (paymentCounts[payment] || 0) + 1;
      paymentRevenue[payment] = (paymentRevenue[payment] || 0) + price;
    }
  });

  const totalTx  = txIds.size;
  const aov      = totalTx ? totalRevenue / totalTx : 0;
  const basketSz = totalTx ? sourceData.length / totalTx : 0;

  const locEfficiency = Object.values(locMap).map((loc) => {
    const tx       = loc.txSet.size;
    const hours    = Math.max(loc.hourSet.size, 1);
    const sessions = loc.dateSet.size;
    const revPerHr = loc.revenue / hours;
    const txPerHr  = tx / hours;
    const locAov   = tx ? loc.revenue / tx : 0;
    const score    = revPerHr * 0.5 + txPerHr * 30 * 0.3 + locAov * 0.2;
    return {
      location: loc.location, revenue: loc.revenue, pieces: loc.pieces,
      transactions: tx, activeHours: hours, sessions,
      revenuePerHour: revPerHr, transactionsPerHour: txPerHr, aov: locAov,
      score, isReliable: sessions >= 2 || hours >= 6,
    };
  }).sort((a, b) => b.score - a.score);

  const topHour = rushHours.reduce((best, v, i, arr) => v > arr[best] ? i : best, 0);
  const topSeg  = Object.entries(segRevenue).sort((a, b) => b[1] - a[1])[0];

  return {
    totalRevenue, totalPieces: sourceData.length, totalTransactions: totalTx,
    aov, basketSz,
    cats, chains, styles, shapes, series, metals, bases, colours, others,
    locRevenue, locEfficiency, topLocation: locEfficiency[0] || null,
    monthlyRevenue, raceCounts, ageCounts, genderCounts,
    paymentCounts, paymentRevenue, rushHours, topHour,
    topSegment: topSeg || null,
  };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const ls = {
  get:  (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set:  (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /**/ } },
  del:  (key)           => { try { localStorage.removeItem(key); } catch { /**/ } },
};

// ─── Pending queue helpers ────────────────────────────────────────────────────

const getPending    = ()    => ls.get(STORAGE_KEYS.PENDING, []);
const savePending   = (arr) => ls.set(STORAGE_KEYS.PENDING, arr);
const addPending    = (tx)  => savePending([...getPending(), tx]);
const removePending = (id)  => savePending(getPending().filter(t => t.transactionId !== id));

async function attemptSync(tx) {
  await fetch(API_URL, { method:"POST", mode:"no-cors", body: JSON.stringify(tx) });
  // no-cors: can't read response status. Optimistically remove after the request completes.
  removePending(tx.transactionId);
}

// ─── Small reusable UI pieces ─────────────────────────────────────────────────

const Label = ({ children }) => (
  <label className="text-[10px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2 block">
    {children}
  </label>
);

const GridBtn = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick}
    className={`py-4 px-1 rounded-xl border text-[10px] font-black transition-all ${
      active ? "bg-[#1B3022] text-white border-[#1B3022] shadow-md"
             : "bg-white text-[#1B3022] border-gray-100 shadow-sm"
    }`}
  >{label}</button>
);

const OtherInput = ({ value, onChange }) => (
  <div className="mt-3">
    <p className="text-[9px] font-black text-[#B5935E] uppercase tracking-[0.2em] mb-2">Please specify</p>
    <input
      className="w-full p-3 bg-white rounded-xl ring-1 ring-gray-100 text-xs uppercase font-bold outline-none"
      placeholder="PLEASE SPECIFY"
      value={value}
      onChange={(e) => onChange(toCaps(e.target.value))}
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
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
        <span>{label}</span><span>{count} / {pct}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:color }} />
      </div>
    </div>
  );
};

const TopList = ({ data, suffix = "SOLD" }) => {
  const entries = Object.entries(data)
    .filter(([k]) => k && k !== "UNKNOWN")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!entries.length)
    return <p className="text-[10px] text-gray-300 font-black uppercase">No data yet</p>;

  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="space-y-3">
      {entries.map(([key, val]) => (
        <div key={key}>
          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
            <span>{key}</span>
            <span className="text-[#B5935E]">{val} {suffix}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1B3022]" style={{ width:`${(val/max)*100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-10">
    <p className="text-[10px] font-black uppercase text-gray-300">{message}</p>
  </div>
);

const PendingBanner = ({ count, onRetry }) => {
  if (!count) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <WifiOff size={16} className="text-amber-500" />
        <div>
          <p className="text-[10px] font-black uppercase text-amber-700">{count} Pending Sync</p>
          <p className="text-[9px] text-amber-500 uppercase font-bold">Saved locally — will retry</p>
        </div>
      </div>
      <button type="button" onClick={onRetry}
        className="text-[9px] font-black uppercase text-amber-600 border border-amber-300 px-3 py-2 rounded-xl"
      >Retry</button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const PetalArchiveOS = () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const [view, setView]                         = useState(VIEWS.INPUT);
  const [step, setStep]                         = useState(STEPS.SETUP);
  const [basket, setBasket]                     = useState([]);
  const [liveData, setLiveData]                 = useState([]);
  const [isLoading, setIsLoading]               = useState(false);
  const [showSuccess, setShowSuccess]           = useState(false);
  const [openPriceCat, setOpenPriceCat]         = useState(null);
  const [eventHistory, setEventHistory]         = useState([]);
  const [organiserHistory, setOrganiserHistory] = useState([]);
  const [pendingCount, setPendingCount]         = useState(0);
  const [validationError, setValidationError]   = useState("");

  const [session, setSession]         = useState(DEFAULT_SESSION);
  const [currentItem, setCurrentItem] = useState(EMPTY_ITEM);
  const [customer, setCustomer]       = useState(DEFAULT_CUSTOMER);

  // Ref guards against fetch race condition (avoids stale-closure isLoading check)
  const isFetchingRef = useRef(false);

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = ls.get(STORAGE_KEYS.SESSION, null);
    if (saved) { setSession(saved); setStep(STEPS.ITEM_A); }
    setEventHistory(ls.get(STORAGE_KEYS.EVENT_HISTORY, []));
    setOrganiserHistory(ls.get(STORAGE_KEYS.ORGANISER_HISTORY, []));
    setPendingCount(getPending().length);
  }, []);

  // ── Fetch live data ────────────────────────────────────────────────────────
  const fetchLiveData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      setLiveData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (view === VIEWS.DASHBOARD || view === VIEWS.BI) fetchLiveData();
  }, [view, fetchLiveData]);

  // ── Retry pending syncs ────────────────────────────────────────────────────
  const retrySyncs = useCallback(async () => {
    const pending = getPending();
    for (const tx of pending) {
      try { await attemptSync(tx); } catch { /* stays in queue */ }
    }
    setPendingCount(getPending().length);
  }, []);

  useEffect(() => {
    retrySyncs();
    window.addEventListener("online", retrySyncs);
    return () => window.removeEventListener("online", retrySyncs);
  }, [retrySyncs]);

  // ── Derived: session-filtered live data ───────────────────────────────────
  const sessionLiveData = useMemo(() => {
    const finalLoc    = normKey(session.location === "Others" ? session.otherLocation : session.location);
    const targetEvent = normKey(session.eventName);
    const targetOrg   = normKey(session.organiser);

    return liveData.filter((row) => {
      const rowEvent = normKey(rowVal(row, ["event","Event","eventName","Event Name"]));
      const rowOrg   = normKey(rowVal(row, ["organiser","Organiser","organizer","Organizer"]));
      const rowLoc   = normKey(rowVal(row, ["location","Location"]));
      return rowEvent === targetEvent && rowOrg === targetOrg && rowLoc === finalLoc;
    });
  }, [liveData, session]);

  const sessionStats = useMemo(() => buildStats(sessionLiveData), [sessionLiveData]);
  const biStats      = useMemo(() => buildStats(liveData),        [liveData]);

  // ── Session management ─────────────────────────────────────────────────────
  const saveSessionAndOpen = () => {
    const cleanEvent = toCaps(session.eventName).trim();
    const cleanOrg   = toCaps(session.organiser).trim();

    if (!cleanEvent) { alert("PLEASE ENTER AN EVENT NAME."); return; }
    if (!session.location) { alert("PLEASE SELECT A LOCATION."); return; }
    if (session.location === "Others" && !session.otherLocation.trim()) {
      alert("PLEASE SPECIFY THE LOCATION."); return;
    }

    const next      = { ...session, eventName: cleanEvent, organiser: cleanOrg };
    const nextEvts  = cleanEvent ? [cleanEvent, ...eventHistory.filter(i => i !== cleanEvent)].slice(0, 8) : eventHistory;
    const nextOrgs  = cleanOrg   ? [cleanOrg,   ...organiserHistory.filter(i => i !== cleanOrg)].slice(0, 8) : organiserHistory;

    ls.set(STORAGE_KEYS.SESSION, next);
    ls.set(STORAGE_KEYS.EVENT_HISTORY, nextEvts);
    ls.set(STORAGE_KEYS.ORGANISER_HISTORY, nextOrgs);

    setSession(next);
    setEventHistory(nextEvts);
    setOrganiserHistory(nextOrgs);
    setStep(STEPS.ITEM_A);
  };

  const endSession = () => {
    if (window.confirm("End Session? Local tracker will be reset.")) {
      ls.del(STORAGE_KEYS.SESSION);
      setStep(STEPS.SETUP); setView(VIEWS.INPUT);
      setBasket([]); setCurrentItem(EMPTY_ITEM);
    }
  };

  const clearCache = () => {
    if (window.confirm("Clear all local data and reload?")) {
      localStorage.clear(); window.location.reload();
    }
  };

  // ── Item entry ─────────────────────────────────────────────────────────────
  const setItem = (patch) => setCurrentItem((prev) => ({ ...prev, ...patch }));

  const validateItem = () => {
    if (!currentItem.category)                                              return "SELECT A JEWELLERY CATEGORY.";
    if (!currentItem.price || safeNum(currentItem.price) <= 0)             return "ENTER A VALID PRICE.";
    if (currentItem.chain === "Others"       && !currentItem.otherChain.trim())  return "SPECIFY THE CHAIN TYPE.";
    if (currentItem.style === "Others"       && !currentItem.otherStyle.trim())  return "SPECIFY THE EARRING / RING TYPE.";
    if (currentItem.shape === "Others"       && !currentItem.otherShape.trim())  return "SPECIFY THE SHAPE.";
    if (currentItem.series === "Others"      && !currentItem.otherSeries.trim()) return "SPECIFY THE SERIES.";
    if (currentItem.base === "Others"        && !currentItem.otherBase.trim())   return "SPECIFY THE BASE.";
    if (currentItem.colourLetter === "Others"&& !currentItem.otherColour.trim()) return "SPECIFY THE COLOUR / LETTER.";
    return null;
  };

  const addToBasket = () => {
    const err = validateItem();
    if (err) { setValidationError(err); return; }
    setValidationError("");

    const normalized = {
      ...currentItem,
      chain:        currentItem.chain === "Others"        ? currentItem.otherChain  : currentItem.chain,
      style:        currentItem.style === "Others"        ? currentItem.otherStyle  : currentItem.style,
      shape:        currentItem.shape === "Others"        ? currentItem.otherShape  : currentItem.shape,
      series:       currentItem.series === "Others"       ? currentItem.otherSeries : currentItem.series,
      base:         currentItem.base === "Others"         ? currentItem.otherBase   : currentItem.base,
      colourLetter: currentItem.colourLetter === "Others" ? currentItem.otherColour : currentItem.colourLetter,
      id: Date.now(),
    };

    setBasket((prev) => [...prev, normalized]);
    setCurrentItem(EMPTY_ITEM);
    setStep(STEPS.ITEM_A);
  };

  const removeFromBasket = (id) => setBasket((prev) => prev.filter((i) => i.id !== id));

  const basketTotal = useMemo(
    () => basket.reduce((acc, item) => acc + safeNum(item.price), 0),
    [basket]
  );

  // ── Transaction logging ────────────────────────────────────────────────────
  const logTransaction = async () => {
    const transactionId = `TX-${Date.now()}`;
    const finalLocation = session.location === "Others" ? session.otherLocation : session.location;
    const payload = { transactionId, session: { ...session, location: finalLocation }, basket, customer };

    // 1. Save to local queue first — data is never lost
    addPending(payload);
    setPendingCount(getPending().length);

    // 2. Optimistic UI — clear basket immediately
    setBasket([]);
    setStep(STEPS.ITEM_A);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2200);

    // 3. Attempt background sync
    try {
      await attemptSync(payload);
    } catch {
      // Stays in pending queue; user sees amber banner
    }
    setPendingCount(getPending().length);
  };

  const displayLocation = session.location === "Others" ? session.otherLocation : session.location;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3022] font-sans p-4 max-w-md mx-auto pb-32 overflow-x-hidden">

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B3022]/90 backdrop-blur-md p-6"
          >
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
              className="bg-white p-12 rounded-[3rem] text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-[#E8EEE9] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-[#1B3022]" size={40} />
              </div>
              <h2 className="text-2xl font-serif italic text-[#1B3022]">Sale Archived</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B5935E] mt-2">
                Syncing with Master Sheet…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════
            STEP 0 — Session Setup
        ══════════════════════════════════ */}
        {step === STEPS.SETUP && (
          <motion.div key="setup" initial={{ opacity:0 }} animate={{ opacity:1 }} className="pt-6 space-y-6">
            <header className="text-center">
              <h1 className="text-4xl font-serif italic">The Petal Archive</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#B5935E] font-black mt-1">Sales Tracker</p>
            </header>

            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
              {/* Event Name */}
              <div>
                <Label>Event Name</Label>
                <input list="event-history"
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold"
                  placeholder="E.G. PINGMIN MARKET"
                  value={session.eventName}
                  onChange={(e) => setSession((p) => ({ ...p, eventName: toCaps(e.target.value) }))}
                />
                <datalist id="event-history">{eventHistory.map(i => <option key={i} value={i} />)}</datalist>
                {eventHistory.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {eventHistory.slice(0, 4).map(i => (
                      <button key={i} type="button"
                        onClick={() => setSession((p) => ({ ...p, eventName:i }))}
                        className="px-3 py-2 rounded-full bg-[#E8EEE9] text-[#1B3022] text-[9px] font-black uppercase"
                      >{i}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Organiser */}
              <div>
                <Label>Organiser</Label>
                <input list="organiser-history"
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl outline-none ring-1 ring-gray-100 uppercase text-xs font-bold"
                  placeholder="E.G. FINCH MARKET"
                  value={session.organiser}
                  onChange={(e) => setSession((p) => ({ ...p, organiser: toCaps(e.target.value) }))}
                />
                <datalist id="organiser-history">{organiserHistory.map(i => <option key={i} value={i} />)}</datalist>
                {organiserHistory.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {organiserHistory.slice(0, 4).map(i => (
                      <button key={i} type="button"
                        onClick={() => setSession((p) => ({ ...p, organiser:i }))}
                        className="px-3 py-2 rounded-full bg-[#E8EEE9] text-[#1B3022] text-[9px] font-black uppercase"
                      >{i}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <Label>Location</Label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {LOCATION_OPTIONS.map(loc => (
                    <GridBtn key={loc} label={loc} active={session.location === loc}
                      onClick={() => setSession((p) => ({ ...p, location:loc, otherLocation: loc==="Others"?p.otherLocation:"" }))}
                    />
                  ))}
                </div>
                {session.location === "Others" && (
                  <OtherInput value={session.otherLocation}
                    onChange={(v) => setSession((p) => ({ ...p, otherLocation:v }))}
                  />
                )}
              </div>

              {/* Date */}
              <div>
                <Label>Date</Label>
                <input type="date"
                  className="w-full p-4 bg-[#FDFBF7] rounded-xl ring-1 ring-gray-100"
                  value={session.date}
                  onChange={(e) => setSession((p) => ({ ...p, date:e.target.value }))}
                />
              </div>

              <button type="button" onClick={saveSessionAndOpen}
                className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-bold shadow-xl uppercase"
              >Open Tracker</button>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════
            INPUT VIEW  (steps 1, 2, 3)
        ══════════════════════════════════ */}
        {view === VIEWS.INPUT && step > STEPS.SETUP && (
          <motion.div key="input" className="space-y-6">

            {/* Session bar */}
            <div className="bg-[#1B3022] p-4 rounded-2xl flex justify-between items-center text-white mt-2">
              <div>
                <p className="text-[10px] font-black uppercase text-[#B5935E]">{displayLocation}</p>
                <p className="text-[11px] font-serif italic">
                  {basket.length} item{basket.length !== 1 ? "s" : ""} in basket
                </p>
              </div>
              {basket.length > 0 && (
                <button type="button" onClick={() => setStep(STEPS.CHECKOUT)}
                  className="bg-[#B5935E] px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg"
                >Checkout · RM {basketTotal}</button>
              )}
            </div>

            <PendingBanner count={pendingCount} onRetry={retrySyncs} />

            {/* ── Step 1: Item Part A ── */}
            {step === STEPS.ITEM_A && (
              <div className="space-y-7">
                <section>
                  <Label>1. Jewellery Category</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {MAIN_ITEMS.map(c => (
                      <GridBtn key={c} label={c} active={currentItem.category === c} onClick={() => setItem({ category:c })} />
                    ))}
                  </div>
                </section>

                <section>
                  <Label>2. Chain Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {CHAIN_TYPES.map(ch => (
                      <GridBtn key={ch} label={ch} active={currentItem.chain === ch}
                        onClick={() => setItem({ chain:ch, otherChain: ch==="Others"?currentItem.otherChain:"" })}
                      />
                    ))}
                  </div>
                  {currentItem.chain === "Others" && (
                    <OtherInput value={currentItem.otherChain} onChange={(v) => setItem({ otherChain:v })} />
                  )}
                </section>

                <section>
                  <Label>3. Earring / Ring Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STYLE_OPTIONS.map(st => (
                      <GridBtn key={st} label={st} active={currentItem.style === st}
                        onClick={() => setItem({ style:st, otherStyle: st==="Others"?currentItem.otherStyle:"" })}
                      />
                    ))}
                  </div>
                  {currentItem.style === "Others" && (
                    <OtherInput value={currentItem.otherStyle} onChange={(v) => setItem({ otherStyle:v })} />
                  )}
                </section>

                <section>
                  <Label>4. Shape</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SHAPE_OPTIONS.map(sh => (
                      <GridBtn key={sh} label={sh} active={currentItem.shape === sh}
                        onClick={() => setItem({ shape:sh, otherShape: sh==="Others"?currentItem.otherShape:"" })}
                      />
                    ))}
                  </div>
                  {currentItem.shape === "Others" && (
                    <OtherInput value={currentItem.otherShape} onChange={(v) => setItem({ otherShape:v })} />
                  )}
                </section>

                <button type="button" onClick={() => { setValidationError(""); setStep(STEPS.ITEM_B); }}
                  className="w-full bg-[#1B3022] text-white py-5 rounded-2xl font-black text-sm uppercase shadow-lg"
                >Next Details →</button>
              </div>
            )}

            {/* ── Step 2: Item Part B ── */}
            {step === STEPS.ITEM_B && (
              <div className="space-y-6">
                <section>
                  <Label>5. Series</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SERIES_OPTIONS.map(s => (
                      <GridBtn key={s} label={s} active={currentItem.series === s}
                        onClick={() => setItem({ series:s, otherSeries: s==="Others"?currentItem.otherSeries:"" })}
                      />
                    ))}
                  </div>
                  {currentItem.series === "Others" && (
                    <OtherInput value={currentItem.otherSeries} onChange={(v) => setItem({ otherSeries:v })} />
                  )}
                </section>

                <section>
                  <Label>6. Metal</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {METAL_OPTIONS.map(m => (
                      <GridBtn key={m} label={m} active={currentItem.metal === m} onClick={() => setItem({ metal:m })} />
                    ))}
                  </div>
                </section>

                <section>
                  <Label>7. Base</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {BASE_OPTIONS.map(b => (
                      <GridBtn key={b} label={b} active={currentItem.base === b}
                        onClick={() => setItem({ base:b, otherBase: b==="Others"?currentItem.otherBase:"" })}
                      />
                    ))}
                  </div>
                  {currentItem.base === "Others" && (
                    <OtherInput value={currentItem.otherBase} onChange={(v) => setItem({ otherBase:v })} />
                  )}
                </section>

                <section>
                  <Label>8. Embedded Flower / Letter</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOUR_OPTIONS.map(col => (
                      <GridBtn key={col} label={col} active={currentItem.colourLetter === col}
                        onClick={() => setItem({ colourLetter:col, otherColour: col==="Others"?currentItem.otherColour:"" })}
                      />
                    ))}
                  </div>
                  {currentItem.colourLetter === "Others" && (
                    <OtherInput value={currentItem.otherColour} onChange={(v) => setItem({ otherColour:v })} />
                  )}
                </section>

                <section>
                  <Label>Price (RM)</Label>
                  <input type="number" inputMode="numeric"
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-2xl font-serif text-[#1B3022] shadow-sm outline-none"
                    value={currentItem.price}
                    onChange={(e) => setItem({ price:e.target.value })}
                  />
                </section>

                {validationError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-[10px] font-black uppercase text-red-400">{validationError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(STEPS.ITEM_A)}
                    className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]"
                  >← Back</button>
                  <button type="button" onClick={addToBasket}
                    className="flex-[2] bg-[#B5935E] text-[#1B3022] py-4 rounded-2xl font-black shadow-xl uppercase"
                  >Add to Basket</button>
                </div>
              </div>
            )}

            {/* ── Step 3: Checkout ── */}
            {step === STEPS.CHECKOUT && (
              <div className="space-y-6">
                {/* Basket review */}
                {basket.length > 0 && (
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50"><Label>Basket</Label></div>
                    <div className="divide-y divide-gray-50">
                      {basket.map(item => (
                        <div key={item.id} className="flex justify-between items-center px-6 py-4">
                          <div>
                            <p className="text-[11px] font-black uppercase">{item.category || "—"}</p>
                            <p className="text-[9px] text-gray-400 uppercase font-bold">
                              {[item.chain, item.series, item.metal].filter(Boolean).join(" · ") || "No details"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-serif text-[#1B3022]">RM {item.price}</p>
                            <button type="button" onClick={() => removeFromBasket(item.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            ><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total + payment */}
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 text-center shadow-sm">
                  <Label>Transaction Total</Label>
                  <div className="text-6xl font-serif text-[#1B3022] mb-6">RM {basketTotal}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Cash","Card","QR"].map(p => (
                      <button key={p} type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, payment:p }))}
                        className={`py-3 text-[10px] font-black rounded-xl border ${
                          customer.payment === p ? "bg-[#1B3022] text-white border-[#1B3022]" : "bg-gray-50 border-gray-100"
                        }`}
                      >{p}</button>
                    ))}
                  </div>
                </div>

                {/* Customer profile */}
                <section className="bg-white p-8 rounded-[3rem] border border-gray-100 space-y-4">
                  <Label>Customer Profile</Label>
                  <div className="flex gap-2">
                    {["F","M"].map(g => (
                      <button key={g} type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, gender:g }))}
                        className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${
                          customer.gender === g ? "bg-[#1B3022] text-white" : "bg-gray-50"
                        }`}
                      >{g === "F" ? "FEMALE" : "MALE"}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["C","M","I","O"].map(r => (
                      <button key={r} type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, race:r }))}
                        className={`py-2 rounded-lg text-[10px] font-black ${
                          customer.race === r ? "bg-[#B5935E] text-white" : "bg-gray-50"
                        }`}
                      >{r}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {["10s","20s","30s","40s","50s"].map(a => (
                      <button key={a} type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, age:a }))}
                        className={`py-2 rounded-lg text-[10px] font-black ${
                          customer.age === a ? "bg-[#B5935E] text-white" : "bg-gray-50"
                        }`}
                      >{a}</button>
                    ))}
                  </div>
                </section>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(STEPS.ITEM_A)}
                    className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]"
                  >← Add More</button>
                  <button type="button" onClick={logTransaction}
                    className="flex-[2] bg-[#1B3022] text-white py-5 rounded-3xl font-black text-base shadow-2xl uppercase tracking-widest"
                  >Log Transaction</button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════
            DASHBOARD — Session Insights
        ══════════════════════════════════ */}
        {view === VIEWS.DASHBOARD && (
          <motion.div key="dash" className="space-y-6">
            <header className="flex justify-between items-center py-6">
              <h2 className="text-3xl font-serif italic">Session Insights</h2>
              {isLoading
                ? <Loader2 className="animate-spin text-[#B5935E]" size={20} />
                : <button type="button" onClick={fetchLiveData}><RefreshCcw size={18} className="text-gray-300" /></button>
              }
            </header>

            {sessionStats.totalPieces === 0 ? (
              <EmptyState message="No data logged for this session yet" />
            ) : (<>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1B3022] p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-32">
                  <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Revenue</p>
                  <h3 className="text-3xl font-serif italic">RM {Math.round(sessionStats.totalRevenue).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                  <p className="text-[9px] font-bold text-[#B5935E] uppercase tracking-widest">Pieces Sold</p>
                  <h3 className="text-3xl font-serif italic text-[#1B3022]">{sessionStats.totalPieces}</h3>
                </div>
                <MetricCard label="Average Order" value={`RM ${Math.round(sessionStats.aov)}`} sub={`${sessionStats.totalTransactions} transactions`} />
                <MetricCard label="Basket Size" value={sessionStats.basketSz.toFixed(1)} sub="items per sale" />
              </div>

              {[
                ["Top Categories",       sessionStats.cats],
                ["Top Series",           sessionStats.series],
                ["Top Colours / Letters",sessionStats.colours],
              ].map(([title, data]) => (
                <section key={title} className="bg-white p-8 rounded-[3rem] border border-gray-100">
                  <Label>{title}</Label><TopList data={data} />
                </section>
              ))}

              <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
                <Label>Customer Age Split</Label>
                <div className="space-y-4">
                  {Object.entries(sessionStats.ageCounts).map(([age, count]) => (
                    <BarRow key={age} label={age} count={count} total={sessionStats.totalPieces} color={AGE_COLORS[age]} />
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
                <Label>Customer Race Split</Label>
                <div className="space-y-4">
                  {Object.entries(sessionStats.raceCounts).map(([race, count]) => (
                    <BarRow key={race} label={race} count={count} total={sessionStats.totalPieces} color={RACE_COLORS[race]} />
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
                <Label>Payment Revenue Split</Label>
                <div className="space-y-4">
                  {Object.entries(sessionStats.paymentRevenue).map(([pay, val]) => {
                    const pct   = sessionStats.totalRevenue ? Math.round((val / sessionStats.totalRevenue) * 100) : 0;
                    const color = pay === "QR" ? "#1B3022" : pay === "Card" ? "#B5935E" : "#7E9181";
                    return (
                      <div key={pay}>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                          <span>{pay}</span><span>RM {Math.round(val)} / {pct}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>)}
          </motion.div>
        )}

        {/* ══════════════════════════════════
            BI — Business Intelligence
        ══════════════════════════════════ */}
        {view === VIEWS.BI && (
          <motion.div key="bi" className="space-y-6">
            <header className="text-center py-6">
              <h2 className="text-3xl font-serif italic">Business Intelligence</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#B5935E] mt-2">
                Efficiency, not raw totals
              </p>
            </header>

            {liveData.length === 0 ? (
              <EmptyState message="No data available — check connection" />
            ) : (<>
              <section className="bg-[#1B3022] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                <Activity className="absolute right-[-10px] top-[-10px] text-white/5" size={120} />
                <div className="relative z-10 space-y-5">
                  <div>
                    <Label><span className="text-[#B5935E]">Best Location (Normalised)</span></Label>
                    <h4 className="text-3xl font-serif italic">{biStats.topLocation?.location || "NO DATA"}</h4>
                    {biStats.topLocation && !biStats.topLocation.isReliable && (
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-200 mt-2">Insufficient sample size</p>
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
                  {biStats.locEfficiency.map((loc, i) => (
                    <div key={loc.location} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">#{i+1} {loc.location}</p>
                          {!loc.isReliable && (
                            <p className="text-[8px] font-black uppercase tracking-widest text-red-300 mt-1">Low sample</p>
                          )}
                        </div>
                        <p className="text-xl font-serif italic text-[#B5935E]">{Math.round(loc.score)}</p>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-[#1B3022]"
                          style={{ width:`${(loc.score / (biStats.locEfficiency[0]?.score || 1)) * 100}%` }}
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
                <MetricCard label="Peak Hour" value={`${biStats.topHour}:00`} sub={`${biStats.rushHours[biStats.topHour]||0} sales`} />
                <MetricCard label="Best Segment" value={biStats.topSegment?.[0]||"NO DATA"} sub={biStats.topSegment?`RM ${Math.round(biStats.topSegment[1])}`:""} />
              </section>

              {[
                ["Top Chains",          biStats.chains],
                ["Top Series",          biStats.series],
                ["Top Styles",          biStats.styles],
                ["Top Metals",          biStats.metals],
                ["Top Shapes",          biStats.shapes],
                ["Top Bases",           biStats.bases],
                ["Top Colours / Letters",biStats.colours],
                ["Custom / Others",     biStats.others, "ENTRIES"],
              ].map(([title, data, suffix]) => (
                <section key={title} className="bg-white p-8 rounded-[3rem] border border-gray-100">
                  <Label>{title}</Label>
                  <TopList data={data} suffix={suffix} />
                </section>
              ))}

              <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
                <Label>Payment Split</Label>
                <div className="space-y-4">
                  {Object.entries(biStats.paymentCounts).map(([pay, count]) => (
                    <BarRow key={pay} label={pay} count={count}
                      total={biStats.totalTransactions || biStats.totalPieces}
                      color={pay === "QR" ? "#1B3022" : pay === "Card" ? "#B5935E" : "#7E9181"}
                    />
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[3rem] border border-gray-100">
                <Label>Monthly Seasonality (RM)</Label>
                <div className="flex items-end gap-1 h-24 pt-4">
                  {biStats.monthlyRevenue.map((rev, i) => (
                    <div key={i} className="flex-1 bg-[#1B3022] rounded-t-sm"
                      style={{ height:`${(rev/(Math.max(...biStats.monthlyRevenue)||1))*100}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[8px] font-black text-gray-200">
                  <span>JAN</span><span>DEC</span>
                </div>
              </section>
            </>)}
          </motion.div>
        )}

        {/* ══════════════════════════════════
            SETTINGS
        ══════════════════════════════════ */}
        {view === VIEWS.SETTINGS && (
          <motion.div key="settings" className="space-y-6">
            <header className="text-center py-6">
              <h2 className="text-3xl font-serif italic">Command Center</h2>
            </header>

            {/* Quick rules */}
            <section className="bg-[#1B3022] p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-[#B5935E] font-black text-[10px] uppercase tracking-widest">
                <Clock size={16} /> Quick Rules
              </div>
              <div className="space-y-3 text-[10px] font-black uppercase tracking-[0.1em]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Chains Alone</span><span className="text-[#B5935E]">− RM 30</span>
                </div>
                <div className="flex justify-between">
                  <span>Clover Items</span><span className="text-[#B5935E]">+ RM 14</span>
                </div>
              </div>
            </section>

            {/* Price directory */}
            <section className="bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 flex items-center gap-2">
                <BookOpen size={18} className="text-[#B5935E]" />
                <Label>Price Directory</Label>
              </div>
              <div className="space-y-1">
                {PRICE_DIRECTORY.map((group, i) => (
                  <div key={group.c} className="px-2">
                    <button type="button"
                      onClick={() => setOpenPriceCat(p => p === i ? null : i)}
                      className="w-full p-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#1B3022] bg-[#FDFBF7] rounded-xl mb-1"
                    >
                      {group.c}
                      {openPriceCat === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {openPriceCat === i && (
                      <div className="p-4 space-y-3 bg-white border border-gray-100 rounded-xl mb-2">
                        {group.i.map(it => (
                          <div key={it.n} className="flex justify-between text-[10px] border-b border-gray-50 pb-2">
                            <span className="text-gray-400 font-bold uppercase tracking-tighter">{it.n}</span>
                            <span className="font-serif italic">RM {it.p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Pending sync details */}
            {pendingCount > 0 && (
              <section className="bg-amber-50 border border-amber-200 p-6 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-3">
                  <WifiOff size={18} className="text-amber-500" />
                  <Label><span className="text-amber-700">{pendingCount} Transactions Pending Sync</span></Label>
                </div>
                <p className="text-[10px] text-amber-500 uppercase font-bold mb-4">
                  Saved locally — will sync when connection is restored.
                </p>
                <button type="button" onClick={retrySyncs}
                  className="w-full bg-amber-100 text-amber-700 py-3 rounded-2xl font-black text-[10px] uppercase border border-amber-200"
                >Retry Sync Now</button>
              </section>
            )}

            <a href={MASTER_SHEET_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-6 bg-[#E8EEE9] rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm text-[#1B3022] border border-[#1B3022]/5"
            >
              <ExternalLink size={16} /> Open Master Database
            </a>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={clearCache}
                className="bg-white text-gray-400 py-6 rounded-[2rem] font-black text-[9px] uppercase border border-gray-100 flex flex-col items-center gap-2 shadow-sm"
              >
                <RefreshCcw size={14} /> Clear App Cache
              </button>
              <button type="button" onClick={endSession}
                className="bg-red-50 text-red-400 py-6 rounded-[2rem] font-black text-[9px] uppercase border border-red-100 flex flex-col items-center gap-2 shadow-sm"
              >
                <Trash2 size={14} /> End Session
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Bottom nav */}
      {step > STEPS.SETUP && (
        <nav className="fixed bottom-8 left-6 right-6 bg-[#1B3022] rounded-[2.5rem] p-2 flex justify-around items-center z-50 shadow-2xl border border-white/5 backdrop-blur-md">
          {[
            { id: VIEWS.INPUT,     icon: <Plus size={22} /> },
            { id: VIEWS.DASHBOARD, icon: <BarChart3 size={22} /> },
            { id: VIEWS.BI,        icon: <History size={22} /> },
            { id: VIEWS.SETTINGS,  icon: <Settings size={22} /> },
          ].map(({ id, icon }) => (
            <button key={id} type="button" onClick={() => setView(id)}
              className={`p-4 rounded-2xl transition-all relative ${
                view === id ? "bg-[#B5935E] text-white shadow-lg" : "text-gray-500 hover:text-gray-200"
              }`}
            >
              {icon}
              {id === VIEWS.SETTINGS && pendingCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default PetalArchiveOS;
