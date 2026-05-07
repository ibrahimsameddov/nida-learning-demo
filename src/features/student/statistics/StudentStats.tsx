// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiGetMyStatistics } from '@/lib/api';
import { getExamData }       from '@/types/examData';
import { useAuthStore }      from '@/stores/authStore';
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import {
  HeatmapCalendar, RecordsPanel, PercentileGauge,
  WeaknessBubbles, SpeedAccuracyChart,
} from '@/components/shared/StatCard';
const SPRING = { type: 'spring' as const, stiffness: 320, damping: 26 };
const SUBJECT_COLORS = ["#6C63FF","#4F87FF","#A78BFA","#38BDF8","#34D399","#ff8c42"];

const EXAM_CONFIG = {
  qebul:    { title:"Qəbul İmtahanı",    icon:"🎯", colorHex:"#6C63FF" },
  buraxilis:{ title:"Buraxılış İmtahanı",icon:"🎓", colorHex:"#4F87FF" },
};

const TIME_TABS = [
  { id:"umumi",    label:"Ümumi"    },
  { id:"aylig",    label:"Aylıq"    },
  { id:"heftelik", label:"Həftəlik" },
  { id:"gunluk",   label:"Günlük"   },
];

function normalizeStats(s, tabId) {
  if (!s) return null;

  let subjects = [];
  if (s.subjectStats) {
    const raw = s.subjectStats;
    const arr = Array.isArray(raw) ? raw
      : Object.entries(raw).map(([subject, stat]) => ({ subject, ...stat }));
    subjects = arr.map(x => ({
      subject: x.subject || x.name || "Digər",
      short:   (x.subject || "?").substring(0,5) + ".",
      avg:     Math.round(x.averagePercentage ?? x.averagePercent ?? 0),
      best:    Math.round(x.bestPercentage    ?? x.averagePercentage ?? 0),
      tests:   x.totalTests ?? x.testCount ?? 0,
    }));
  }

  const monthly = Array.isArray(s.monthlyProgress) ? s.monthlyProgress : [];
  const weekly  = Array.isArray(s.weeklyProgress)  ? s.weeklyProgress  : [];
  let trend = [];
  if (tabId === "heftelik") {
    trend = weekly.slice(-7).map(p => ({
      label: new Date(p.date).toLocaleDateString("az-AZ",{weekday:"short"}),
      score: Math.round(p.percentage ?? 0),
    }));
  } else {
    trend = monthly.slice(-6).map(p => ({
      label: new Date(p.date).toLocaleDateString("az-AZ",{month:"short"}),
      score: Math.round(p.percentage ?? 0),
    }));
    if (!trend.length && weekly.length) {
      trend = weekly.slice(-6).map(p => ({
        label: new Date(p.date).toLocaleDateString("az-AZ",{weekday:"short"}),
        score: Math.round(p.percentage ?? 0),
      }));
    }
  }

  return { subjects, trend };
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <p style={{ fontFamily:"'Lexend Deca',sans-serif", fontWeight:700, fontSize:14,
          color:"var(--text-1)" }}>{title}</p>
      </div>
      {sub && <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, paddingLeft:24 }}>{sub}</p>}
    </div>
  );
}

// ── Stat Hero Card ────────────────────────────────────────────────────────────
function StatHeroCard({ stats, colorHex }) {
  const avg   = Math.round(stats?.averagePercentage ?? stats?.averagePercent ?? 0);
  const best  = Math.round(stats?.bestPercentage ?? avg);
  const total = stats?.totalTests ?? 0;
  const streak= stats?.streak ?? stats?.currentStreak ?? 0;

  const items = [
    { val:`${avg}%`,      lbl:"Orta Bal",     clr:colorHex },
    { val:`${best}%`,     lbl:"Ən Yaxşı",     clr:"#00e5a0" },
    { val:total,           lbl:"Test Sayı",    clr:"var(--accent)" },
    { val:`${streak}🔥`,  lbl:"Seriya",        clr:"#ff8c42" },
  ];

  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={SPRING}
      style={{
        background:`linear-gradient(135deg, ${colorHex}18, rgba(255,255,255,0.03))`,
        border:`1px solid ${colorHex}33`, borderRadius:24, padding:"22px 20px",
        display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8,
      }}
    >
      {items.map((it,i) => (
        <div key={i} style={{ textAlign:"center" }}>
          <div style={{
            fontFamily:"'JetBrains Mono',monospace", fontWeight:900, fontSize:22,
            color:it.clr, textShadow:`0 0 20px ${it.clr}66`,
          }}>{it.val}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:4,
            textTransform:"uppercase", letterSpacing:"0.06em" }}>{it.lbl}</div>
        </div>
      ))}
    </motion.div>
  );
}

// ── Radar Chart (SVG) ─────────────────────────────────────────────────────────
function RadarSection({ data, colorHex }: { data: any; colorHex: string }) {
  const subjects = data.subjects;
  const N = subjects.length;
  if (N < 3) return null;
  const cx = 110, cy = 100, r = 72;
  const angle = (i: number) => (i * 2 * Math.PI / N) - Math.PI / 2;
  const pt = (i: number, frac: number): [number, number] => [
    cx + r * frac * Math.cos(angle(i)),
    cy + r * frac * Math.sin(angle(i)),
  ];
  const dataPts = subjects.map((_: any, i: number) => pt(i, subjects[i].avg / 100));
  const polygon = dataPts.map(([x, y]: [number, number]) => `${x},${y}`).join(' ');
  return (
    <svg viewBox="0 0 220 200" width="100%" height={220} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorHex} stopOpacity={0.9}/>
          <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.9}/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(lv => (
        <polygon key={lv} points={subjects.map((_: any, i: number) => pt(i, lv).join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5}/>
      ))}
      {subjects.map((_: any, i: number) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}/>;
      })}
      <polygon points={polygon} fill={`url(#rg)`} fillOpacity={0.18} stroke={colorHex} strokeWidth={2.5}/>
      {dataPts.map(([x, y]: [number, number], i: number) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={colorHex}
          style={{ filter: `drop-shadow(0 0 4px ${colorHex})` }}/>
      ))}
      {subjects.map((s: any, i: number) => {
        const [x, y] = pt(i, 1.22);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.45)" fontSize={9}>{s.short}</text>
        );
      })}
      {dataPts.map(([x, y]: [number, number], i: number) => (
        <text key={`v${i}`} x={x} y={y - 9} textAnchor="middle" fontSize={8}
          fill={colorHex} fontWeight={700}>{subjects[i].avg}%</text>
      ))}
    </svg>
  );
}

// ── Bar Chart (SVG) ───────────────────────────────────────────────────────────
function BarSection({ data }: { data: any }) {
  const subjects = data.subjects;
  if (!subjects.length) return null;
  const W = 300, H = 150, padL = 8, padR = 8, padB = 20;
  const plotW = W - padL - padR, plotH = H - padB;
  const slotW = plotW / subjects.length;
  const barW = Math.max(6, Math.min(15, slotW * 0.28));
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 6 }}>
        {[['#6C63FF','Orta'],['#00e5a0','Ən yaxşı']].map(([c, l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:c as string }}/>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{l}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={190} style={{ overflow:'visible' }}>
        <defs>
          <linearGradient id="bAvg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity={1}/><stop offset="100%" stopColor="#6C63FF" stopOpacity={0.4}/>
          </linearGradient>
          <linearGradient id="bBest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5a0" stopOpacity={1}/><stop offset="100%" stopColor="#00e5a0" stopOpacity={0.4}/>
          </linearGradient>
        </defs>
        {[25,50,75].map(v => (
          <line key={v} x1={padL} y1={plotH-(v/100)*plotH} x2={W-padR} y2={plotH-(v/100)*plotH}
            stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} strokeDasharray="3,3"/>
        ))}
        {subjects.map((s: any, i: number) => {
          const cx = padL + slotW * i + slotW / 2;
          const avgH = Math.max((s.avg / 100) * plotH, 2);
          const bestH = Math.max((s.best / 100) * plotH, 2);
          return (
            <g key={i}>
              <rect x={cx - barW - 2} y={plotH - avgH} width={barW} height={avgH} rx={3} fill="url(#bAvg)"/>
              <rect x={cx + 2} y={plotH - bestH} width={barW} height={bestH} rx={3} fill="url(#bBest)"/>
              <text x={cx} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={8}>{s.short}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Area Chart (SVG) ──────────────────────────────────────────────────────────
function AreaSection({ data, colorHex }: { data: any; colorHex: string }) {
  const trend = data.trend;
  if (!trend.length) return null;
  const W = 320, H = 140, padL = 28, padR = 12, padT = 8, padB = 20;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const stepX = trend.length > 1 ? plotW / (trend.length - 1) : plotW;
  const coords = trend.map((p: any, i: number) => ({
    x: padL + i * stepX,
    y: padT + plotH - (Math.min(100, Math.max(0, p.score)) / 100) * plotH,
  }));
  const linePath = coords.map((c: any, i: number) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length-1].x},${padT+plotH} L${padL},${padT+plotH} Z`;
  const gId = `ag-${colorHex.replace('#','')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={190} style={{ overflow:'visible' }}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colorHex} stopOpacity={0.45}/>
          <stop offset="95%" stopColor={colorHex} stopOpacity={0.02}/>
        </linearGradient>
      </defs>
      {[25,50,75].map(v => {
        const y = padT + plotH - (v/100)*plotH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} strokeDasharray="3,3"/>
            <text x={padL-4} y={y+3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize={7}>{v}</text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gId})`}/>
      <path d={linePath} fill="none" stroke={colorHex} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {coords.map((c: any, i: number) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={3} fill={colorHex}
            style={{ filter:`drop-shadow(0 0 4px ${colorHex})` }}/>
          <text x={c.x} y={padT+plotH+13} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={7}>
            {trend[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Radial Rings (SVG) ────────────────────────────────────────────────────────
function RadialSection({ data }: { data: any }) {
  const rings = data.subjects.filter((s: any) => s.avg > 0).slice(0, 5);
  if (!rings.length) return null;
  const cx = 80, cy = 80, outerR = 68, thick = 10, gap = 4;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
      <svg viewBox="0 0 160 160" width={160} height={160} style={{ flexShrink:0 }}>
        {rings.map((s: any, i: number) => {
          const r = outerR - i * (thick + gap);
          if (r <= thick / 2) return null;
          const circ = 2 * Math.PI * r;
          const fill = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={thick}/>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={fill} strokeWidth={thick}
                strokeDasharray={`${circ * s.avg / 100} ${circ}`} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ filter:`drop-shadow(0 0 4px ${fill}88)` }}/>
            </g>
          );
        })}
      </svg>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
        {rings.map((s: any, i: number) => {
          const fill = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:fill,
                boxShadow:`0 0 6px ${fill}`, flexShrink:0 }}/>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.55)', flex:1 }}>{s.short}</span>
              <span style={{ fontSize:12, fontWeight:700, color:fill,
                fontFamily:"'JetBrains Mono',monospace" }}>{s.avg}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Card Wrapper ──────────────────────────────────────────────────────────────
function Card({ children, delay=0, span=1, style={} }) {
  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
      transition={{...SPRING, delay}} className="card"
      style={{ padding:"20px 18px", gridColumn:`span ${span}`, ...style }}>
      {children}
    </motion.div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────
function EmptyCard() {
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={SPRING}
      className="card" style={{ padding:"52px 24px", textAlign:"center" }}>
      <div style={{ fontSize:56, marginBottom:16 }}>📊</div>
      <p style={{ fontFamily:"'Lexend Deca',sans-serif", fontWeight:700, fontSize:16,
        color:"var(--text-1)", marginBottom:8 }}>Hələ statistika yoxdur</p>
      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:13, lineHeight:1.6,
        maxWidth:280, margin:"0 auto" }}>
        İlk testinizi tamamladıqdan sonra bütün statistikalar real vaxtda görünəcək.
      </p>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
// ── Exam Group Switcher ───────────────────────────────────────────────────────
function ExamGroupSwitcher({ active, onChange, examData }) {
  const groups = [
    { id: 'buraxilis', ...EXAM_CONFIG.buraxilis, count: examData[0]?.subjects?.length ?? 0 },
    { id: 'qebul',     ...EXAM_CONFIG.qebul,     count: examData[1]?.subjects?.length ?? 0 },
  ];
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ ...SPRING, delay:0.04 }}
      style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
      {groups.map(g => {
        const isActive = active === g.id;
        return (
          <motion.button key={g.id} whileTap={{ scale:0.97 }}
            onClick={() => onChange(g.id)}
            style={{
              padding:'14px 16px', borderRadius:18, cursor:'pointer', textAlign:'left',
              border: isActive ? `1.5px solid ${g.colorHex}` : '0.5px solid var(--border)',
              background: isActive
                ? `linear-gradient(135deg, ${g.colorHex}1A, ${g.colorHex}08)`
                : 'var(--bg-card)',
              boxShadow: isActive ? `0 0 20px ${g.colorHex}22` : 'none',
              transition:'all 0.22s ease',
            }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{
                width:32, height:32, borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                background: isActive ? `${g.colorHex}22` : 'rgba(255,255,255,0.05)',
                border: isActive ? `1px solid ${g.colorHex}44` : '1px solid transparent',
                flexShrink:0,
              }}>{g.icon}</span>
              <span style={{
                fontFamily:"'Lexend Deca',sans-serif", fontWeight:700, fontSize:13,
                color: isActive ? g.colorHex : 'var(--text-1)',
              }}>{g.title}</span>
            </div>
            <div style={{ paddingLeft:40 }}>
              <span style={{
                fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                background: isActive ? `${g.colorHex}22` : 'rgba(255,255,255,0.06)',
                color: isActive ? g.colorHex : 'var(--text-3)',
              }}>
                {g.count > 0 ? `${g.count} fənn` : 'Seçilməyib'}
              </span>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default function StudentStats() {
  const navigate = useNavigate();
  const [params]    = useSearchParams();
  const [examType, setExamType] = useState(params.get("type") || "buraxilis");
  const [activeTab, setActiveTab] = useState("umumi");
  const [apiStats,  setApiStats]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  const user           = useAuthStore(s => s.user);
  const foreignLang    = (user as any)?.foreignLang    ?? 'english';
  const specialtyGroup = (user as any)?.specialtyGroup ?? '';
  const examData       = getExamData(foreignLang, specialtyGroup);
  const activeSubjectTitles = examType === 'buraxilis'
    ? (examData[0]?.subjects ?? []).map((s: any) => s.title)
    : (examData[1]?.subjects ?? []).map((s: any) => s.title);

  useEffect(() => {
    setLoading(true);
    apiGetMyStatistics()
      .then(s => {
        setApiStats(s ?? {});
        setLoading(false);
      })
      .catch(err => {
        setApiStats({});
        setLoading(false);
      });
  }, []);

  const cfg  = EXAM_CONFIG[examType] || EXAM_CONFIG.buraxilis;
  const rawData = apiStats !== null ? normalizeStats(apiStats, activeTab) : null;
  const data = rawData ? {
    ...rawData,
    subjects: activeSubjectTitles.length > 0
      ? rawData.subjects.filter((s: any) => activeSubjectTitles.includes(s.subject))
      : rawData.subjects,
  } : null;
  const hasData = data !== null && (data.subjects.length > 0 || data.trend.length > 0 || (apiStats?.totalTests ?? 0) > 0);

  const displayStats = apiStats;

  const avg  = Math.round(displayStats?.averagePercentage ?? displayStats?.averagePercent ?? 0);
  const rawSessions = Array.isArray(apiStats?.recentSessions) ? apiStats.recentSessions : [];
  const rawDailyArr = Array.isArray(apiStats?.dailyProgress) ? apiStats.dailyProgress
    : Array.isArray(apiStats?.monthlyProgress) ? apiStats.monthlyProgress : [];

  return (
    <div style={{ background:"var(--bg-primary)", minHeight:"100dvh" }}>
      <FloatingOrbs/>
      <Sidebar/>
      <Topbar/>
      <BottomNav/>

      <main className="main-content">
        <div className="page-inner" style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {/* ── Header ── */}
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={SPRING}
            style={{ display:"flex", alignItems:"center", gap:14 }}>
            <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
              onClick={() => navigate("/dashboard")}
              style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid var(--border)",
                borderRadius:12, padding:"8px 14px", color:"var(--text-2)",
                fontSize:13, cursor:"pointer", fontWeight:600 }}>
              ← Geri
            </motion.button>
            <div>
              <h1 style={{ fontFamily:"'Lexend Deca','Lexend Deca',sans-serif", fontWeight:800,
                fontSize:20, color:"var(--text-1)", lineHeight:1.2 }}>
                {cfg.icon} {cfg.title}
              </h1>
              <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>Detallı statistika analizi</p>
            </div>
          </motion.div>

          {/* ── Exam Group Switcher ── */}
          <ExamGroupSwitcher
            active={examType}
            onChange={setExamType}
            examData={examData}
          />

          {/* ── Time tabs ── */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            transition={{...SPRING,delay:0.06}}
            style={{ display:"flex", gap:5, background:"rgba(255,255,255,0.04)",
              border:"0.5px solid var(--border)", borderRadius:16, padding:5 }}>
            {TIME_TABS.map(tab => (
              <motion.button key={tab.id} whileTap={{scale:0.96}}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex:1, padding:"8px 10px", borderRadius:12, cursor:"pointer",
                  fontFamily:"'Lexend Deca',sans-serif", fontWeight:600, fontSize:12,
                  border:"none", transition:"all 0.22s",
                  background: activeTab===tab.id
                    ? `linear-gradient(135deg,${cfg.colorHex},#A78BFA)`
                    : "transparent",
                  color: activeTab===tab.id ? "#fff" : "rgba(255,255,255,0.4)",
                  boxShadow: activeTab===tab.id ? `0 0 16px ${cfg.colorHex}55` : "none",
                }}>
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* ── Content ── */}
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"56px 0" }}>
              <span className="spinner" style={{ width:36, height:36 }}/>
            </div>
          ) : !hasData ? (
            <EmptyCard/>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${examType}-${activeTab}`}
                initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-8}} transition={{duration:0.22}}
                style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* ── Hero Stats Row ── */}
                <StatHeroCard stats={displayStats} colorHex={cfg.colorHex}/>


                {/* ── Row 1: Radar + Bar ── */}
                {data.subjects.length > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:14 }}>
                    <Card delay={0.05}>
                      <SectionHeader icon="🕸️" title="Fənn Radar" sub="Güclü/zəif sahələr"/>
                      <RadarSection data={data} colorHex={cfg.colorHex}/>
                    </Card>
                    <Card delay={0.1}>
                      <SectionHeader icon="📊" title="Orta vs Ən Yaxşı" sub="Fənn müqayisəsi"/>
                      <BarSection data={data}/>
                    </Card>
                  </div>
                )}

                {/* ── Row 2: Area trend + Records ── */}
                <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:14 }}>
                  {data.trend.length > 0 && (
                    <Card delay={0.12}>
                      <SectionHeader icon="📈" title="Performans Trendi" sub="Zamanla dəyişim axını"/>
                      <AreaSection data={data} colorHex={cfg.colorHex}/>
                    </Card>
                  )}
                    <Card delay={0.14}>
                      <SectionHeader icon="🏆" title="Şəxsi Rekordlar" sub="Ən yaxşı nəticələr"/>
                      <RecordsPanel stats={displayStats}/>
                    </Card>
                </div>

                {/* ── Row 3: Radial + Percentile ── */}
                {data.subjects.length > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:14 }}>
                    <Card delay={0.16}>
                      <SectionHeader icon="💫" title="Fənn Progress Halqaları" sub="Hər fənnin nəticəsi"/>
                      <RadialSection data={data}/>
                    </Card>
                    <Card delay={0.18}>
                      <SectionHeader icon="📍" title="Reytinq Pozisiyası" sub="Ümumi sıralama"/>
                      <PercentileGauge avg={avg}/>
                    </Card>
                  </div>
                )}

                {/* ── Row 4: Weakness + Speed ── */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {data.subjects.length > 0 && (
                    <Card delay={0.2}>
                      <SectionHeader icon="⚠️" title="Zəif Sahə Analizi" sub="Məşq tələb edən fənlər"/>
                      <WeaknessBubbles subjects={data.subjects}
                        onPractice={subj => navigate(`/topic-quiz?exam=${examType}&subject=${encodeURIComponent(subj)}`)}/>
                    </Card>
                  )}
                  <Card delay={0.22}>
                    <SectionHeader icon="⚡" title="Sürət vs Doğruluk" sub="Test sessiyaları analizi"/>
                    <SpeedAccuracyChart sessions={rawSessions}/>
                  </Card>
                </div>

                {/* ── Row 5: Heatmap ── */}
                <Card delay={0.24}>
                  <SectionHeader icon="🔥" title="Aktivlik Xəritəsi" sub="Son 15 həftə — hər gün həll edilən testlər"/>
                  <HeatmapCalendar data={rawDailyArr}/>
                </Card>

              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>
    </div>
  );
}

