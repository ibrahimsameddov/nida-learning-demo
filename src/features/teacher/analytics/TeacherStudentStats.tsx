// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar }   from '@/components/layout/Sidebar';
import { Topbar }    from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Avatar }    from '@/components/ui/Avatar';
import toast, { Toaster } from "react-hot-toast";
import {
  apiGetMyGroups, apiGetStudentProfiles,
  apiGetSentPermissions, apiGetStudentStatsByUid,
} from '@/lib/api';
import { SPRING } from '@/lib/motion';

// ── Palette & constants ───────────────────────────────────────────────────────
const SUBJECT_COLORS = ["#4F87FF","#6C63FF","#F4A261","#00C9A7","#A78BFA","#38BDF8","#FB7185"];
const GROUP_PALETTE  = ["#4F87FF","#6C63FF","#00C9A7","#F4A261","#A78BFA","#38BDF8"];
const PERIODS = [
  { key: "daily",   label: "Günlük"   },
  { key: "weekly",  label: "Həftəlik" },
  { key: "monthly", label: "Aylıq"    },
];
const TABS = [
  { key: "overview",  label: "📊 Baxış"     },
  { key: "groups",    label: "👥 Qruplar"   },
  { key: "topics",    label: "📚 Mövzular"  },
  { key: "students",  label: "👤 Şagirdlər" },
];

// ── Mock data helpers (deterministic seed) ────────────────────────────────────
function seed(str: string) {
  return [...String(str)].reduce((a, c) => a + c.charCodeAt(0), 0);
}
function mockScore(str: string, offset = 0) {
  return 38 + ((seed(str) + offset) % 55);
}

const WEAK_TOPICS: Record<string, string[]> = {
  "Riyaziyyat":      ["Loqarifm","Triqonometriya","Kombinatorika","Törəmə","İntegral"],
  "Azərbaycan dili": ["Sintaksis","Morfonologiya","Mətn tapşırıqları","Üslubiyyat"],
  "Fizika":          ["Mexanika","Elektrostatika","Kvant fizikası","Optika"],
  "Kimya":           ["Üzvi kimya","Elektroliz","Turşular","Oksidləşmə-reduksiya"],
  "Biologiya":       ["Genetika","Hüceyrə","Evolyusiya","Ekologiya"],
  "Xarici dil":      ["Grammar","Writing","Reading","Vocabulary"],
};

function getGroupAnalytics(group: any, period: string) {
  const s  = seed(group.name + period);
  const avg = 42 + (s % 48);
  const students = group.students ?? [];
  const done   = Math.max(1, Math.round(students.length * (0.55 + (s % 35) / 100)));
  const trend  = Array.from({ length: period === "daily" ? 7 : period === "weekly" ? 6 : 5 }, (_, i) => ({
    label: period === "daily"   ? `${i+1}Ç`
         : period === "weekly"  ? `H${i+1}`
         : ["Yan","Fev","Mar","Apr","May","İyn"][i] ?? `${i+1}`,
    score: Math.max(20, Math.min(98, avg + (seed(group.name + i) % 30) - 12)),
  }));
  const subjects = Object.keys(WEAK_TOPICS).slice(0, 3).map((subj, i) => ({
    subject: subj,
    avg:     Math.max(20, Math.min(95, avg + (seed(subj + group.name) % 30) - 10)),
    color:   GROUP_PALETTE[i % GROUP_PALETTE.length],
  }));
  return { avg, done, total: students.length, trend, subjects };
}

// ── SVG Line chart ─────────────────────────────────────────────────────────────
function SvgLine({ trend, color = "#4F87FF" }: any) {
  if (!trend?.length) return null;
  const W=300,H=110,pL=28,pR=8,pT=8,pB=22;
  const pw=W-pL-pR, ph=H-pT-pB;
  const sx = trend.length > 1 ? pw/(trend.length-1) : pw;
  const pts = trend.map((p,i) => ({
    x: pL + i*sx,
    y: pT + ph - (Math.min(100,Math.max(0,p.score))/100)*ph,
  }));
  const line = pts.map((c,i) => `${i===0?'M':'L'}${c.x},${c.y}`).join(' ');
  const area = `${line} L${pts[pts.length-1].x},${pT+ph} L${pL},${pT+ph} Z`;
  const gid  = `lg${color.replace('#','')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={140} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor={color} stopOpacity={0.35}/>
          <stop offset="95%" stopColor={color} stopOpacity={0.02}/>
        </linearGradient>
      </defs>
      {[25,50,75].map(v => {
        const y = pT + ph - (v/100)*ph;
        return <g key={v}>
          <line x1={pL} y1={y} x2={W-pR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}/>
          <text x={pL-4} y={y+3} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize={7}>{v}</text>
        </g>;
      })}
      <path d={area} fill={`url(#${gid})`}/>
      <path d={line}  fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((c,i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={3.5} fill={color} stroke="rgba(10,15,35,0.9)" strokeWidth={2}/>
          <text x={c.x} y={pT+ph+14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={7}>{trend[i].label}</text>
          <text x={c.x} y={c.y-8} textAnchor="middle" fill={color} fontSize={8} fontWeight={700}>{trend[i].score}%</text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG Radar ─────────────────────────────────────────────────────────────────
function SvgRadar({ stats }: any) {
  const N = stats?.length ?? 0;
  if (N < 2) return null;
  const cx=110,cy=100,r=70;
  const angle = (i) => (i*2*Math.PI/N) - Math.PI/2;
  const pt = (i, f): [number,number] => [cx+r*f*Math.cos(angle(i)), cy+r*f*Math.sin(angle(i))];
  const pts = stats.map((_,i) => pt(i, stats[i].avg/100));
  return (
    <svg viewBox="0 0 220 200" width="100%" height={190} style={{overflow:'visible'}}>
      {[0.25,0.5,0.75,1].map(lv => (
        <polygon key={lv} points={stats.map((_,i)=>pt(i,lv).join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5}/>
      ))}
      {stats.map((_,i) => {
        const [x,y]=pt(i,1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}/>;
      })}
      <polygon points={pts.map(([x,y])=>`${x},${y}`).join(' ')}
        fill="#4F87FF" fillOpacity={0.18} stroke="#4F87FF" strokeWidth={2.5}/>
      {pts.map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#4F87FF" style={{filter:'drop-shadow(0 0 4px #4F87FF)'}}/>
      ))}
      {stats.map((s,i) => {
        const [x,y] = pt(i,1.24);
        const lbl = (s.subject||'').substring(0,7)+(s.subject?.length>7?'.':'');
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.4)" fontSize={9}>{lbl}</text>;
      })}
    </svg>
  );
}

// ── Horizontal bar ─────────────────────────────────────────────────────────────
function HBar({ label, value, max=100, color="#4F87FF", sublabel="" }: any) {
  const pct = Math.round((value/max)*100);
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
        <span style={{fontSize:12,color:'var(--text-2)',fontWeight:600}}>{label}</span>
        <span style={{display:'flex',alignItems:'center',gap:8}}>
          {sublabel && <span style={{fontSize:10,color:'var(--text-3)'}}>{sublabel}</span>}
          <span style={{fontSize:13,fontWeight:800,color}}>{value}%</span>
        </span>
      </div>
      <div style={{height:8,borderRadius:999,background:'rgba(255,255,255,0.07)'}}>
        <motion.div
          initial={{width:0}} animate={{width:`${pct}%`}}
          transition={{duration:0.7,ease:'easeOut'}}
          style={{
            height:'100%',borderRadius:999,
            background: value>=70 ? `linear-gradient(90deg,#00C9A7,${color})`
                      : value>=50 ? `linear-gradient(90deg,#4F87FF,${color})`
                      :             `linear-gradient(90deg,#F4A261,#E24B4A)`,
          }}
        />
      </div>
    </div>
  );
}

// ── Period toggle ──────────────────────────────────────────────────────────────
function PeriodToggle({ period, onChange }: any) {
  return (
    <div style={{
      display:'inline-flex',
      background:'rgba(255,255,255,0.04)',border:'0.5px solid var(--border)',
      borderRadius:10,padding:3,gap:2,
    }}>
      {PERIODS.map(p => (
        <button key={p.key} onClick={() => onChange(p.key)} style={{
          padding:'6px 14px',borderRadius:8,border:'none',fontSize:11,fontWeight:700,
          cursor:'pointer',transition:'all 0.18s',
          background: period===p.key ? '#4F87FF' : 'transparent',
          color:      period===p.key ? '#fff'    : 'var(--text-3)',
          fontFamily:"'Lexend Deca',sans-serif",
        }}>{p.label}</button>
      ))}
    </div>
  );
}

// ── Overview tab ───────────────────────────────────────────────────────────────
function OverviewTab({ groups, period }: any) {
  const allStudents = groups.flatMap(g => g.students ?? []);
  const totalStudents = allStudents.length;
  const avgScore = groups.length
    ? Math.round(groups.reduce((a,g) => a + getGroupAnalytics(g,period).avg, 0) / groups.length)
    : 0;
  const bestGroup = groups.reduce((best,g) => {
    const s = getGroupAnalytics(g,period).avg;
    return s > (getGroupAnalytics(best,period)?.avg ?? 0) ? g : best;
  }, groups[0]);
  const overallTrend = Array.from({length: period==='daily'?7:period==='weekly'?6:5},(_,i)=>({
    label: period==='daily'  ? `${i+1}Ç`
         : period==='weekly' ? `H${i+1}`
         : ["Yan","Fev","Mar","Apr","May","İyn"][i]??`${i+1}`,
    score: Math.max(30, Math.min(95, avgScore + (seed(String(i)+period)%24)-10)),
  }));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[
          {icon:'👥',label:'Şagird',val:totalStudents,col:'#4F87FF'},
          {icon:'🎯',label:'Orta bal',val:`${avgScore}%`,col:'#00C9A7'},
          {icon:'📁',label:'Qrup',val:groups.length,col:'#6C63FF'},
        ].map(k=>(
          <div key={k.label} style={{
            background:`color-mix(in srgb,${k.col} 9%,var(--bg-card))`,
            border:`0.5px solid ${k.col}33`,borderRadius:14,padding:'14px 12px',textAlign:'center',
          }}>
            <div style={{fontSize:18,marginBottom:5}}>{k.icon}</div>
            <div style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:20,color:k.col}}>{k.val}</div>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Overall trend */}
      <div className="card" style={{padding:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text-1)'}}>Ümumi performans trendi</div>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>Bütün qruplar üzrə orta bal</div>
          </div>
          <span style={{
            fontSize:14,fontWeight:800,color:avgScore>=70?'#00C9A7':avgScore>=50?'#4F87FF':'#F4A261',
            fontFamily:"'Lexend Deca',sans-serif",
          }}>{avgScore}%</span>
        </div>
        <SvgLine trend={overallTrend} color={avgScore>=70?'#00C9A7':avgScore>=50?'#4F87FF':'#F4A261'}/>
      </div>

      {/* Best/worst group highlight */}
      {groups.length > 1 && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {label:'🏆 Ən yaxşı qrup', g: groups.reduce((b,g)=>getGroupAnalytics(g,period).avg>getGroupAnalytics(b,period).avg?g:b,groups[0]), col:'#00C9A7'},
            {label:'⚠️ Diqqət lazım', g: groups.reduce((b,g)=>getGroupAnalytics(g,period).avg<getGroupAnalytics(b,period).avg?g:b,groups[0]), col:'#F4A261'},
          ].map(({label,g,col})=>{
            const a=getGroupAnalytics(g,period);
            return (
              <div key={label} style={{
                background:`color-mix(in srgb,${col} 8%,var(--bg-card))`,
                border:`0.5px solid ${col}33`,borderRadius:14,padding:'14px 12px',
              }}>
                <div style={{fontSize:10,color:'var(--text-3)',marginBottom:6}}>{label}</div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>{g.name}</div>
                <div style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:22,color:col}}>{a.avg}%</div>
                <div style={{fontSize:10,color:'var(--text-3)',marginTop:3}}>{a.done}/{a.total} şagird aktiv</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Groups tab ─────────────────────────────────────────────────────────────────
function GroupsTab({ groups, period }: any) {
  const [selGroup, setSelGroup] = useState(null);

  if (selGroup) {
    const a = getGroupAnalytics(selGroup, period);
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <button onClick={()=>setSelGroup(null)} style={{
          background:'none',border:'none',cursor:'pointer',
          color:'var(--text-3)',fontSize:13,
          display:'flex',alignItems:'center',gap:4,alignSelf:'flex-start',
        }}>‹ Qruplara qayıt</button>

        {/* Group header */}
        <div style={{
          background:`color-mix(in srgb,${GROUP_PALETTE[groups.indexOf(selGroup)%GROUP_PALETTE.length]} 10%,var(--bg-card))`,
          border:`0.5px solid ${GROUP_PALETTE[groups.indexOf(selGroup)%GROUP_PALETTE.length]}33`,
          borderRadius:16,padding:'16px',
        }}>
          <div style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:16,color:'var(--text-1)',marginBottom:6}}>
            👥 {selGroup.name}
          </div>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {[
              {l:'Orta bal',v:`${a.avg}%`},
              {l:'Aktiv şagird',v:`${a.done}/${a.total}`},
              {l:'Fənn',v:selGroup.subject||'—'},
            ].map(x=>(
              <div key={x.l} style={{fontSize:11,color:'var(--text-3)'}}>
                {x.l}: <strong style={{color:'var(--text-1)'}}>{x.v}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Trend */}
        <div className="card" style={{padding:'16px'}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text-1)',marginBottom:12}}>
            Performans trendi
          </div>
          <SvgLine trend={a.trend} color={GROUP_PALETTE[groups.indexOf(selGroup)%GROUP_PALETTE.length]}/>
        </div>

        {/* Subject breakdown */}
        <div className="card" style={{padding:'16px'}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text-1)',marginBottom:14}}>
            Fənn üzrə performans
          </div>
          {a.subjects.map(s=>(
            <HBar key={s.subject} label={s.subject} value={s.avg} color={s.color}
              sublabel={s.avg<50?'⚠️ Zəif':''}/>
          ))}
        </div>

        {/* Students */}
        {(selGroup.students??[]).length > 0 && (
          <div className="card" style={{padding:'16px'}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text-1)',marginBottom:12}}>
              Şagird sıralaması
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {(selGroup.students??[])
                .map(st=>({...st,score:mockScore((st.fullName??st.id??'')+selGroup.name)}))
                .sort((a,b)=>b.score-a.score)
                .map((st,i)=>(
                  <div key={st.id??i} style={{
                    display:'flex',alignItems:'center',gap:10,
                    padding:'9px 12px',borderRadius:11,
                    background:'rgba(255,255,255,0.03)',border:'0.5px solid var(--border)',
                  }}>
                    <div style={{
                      width:22,height:22,borderRadius:'50%',flexShrink:0,
                      background:i<3?'linear-gradient(135deg,var(--primary),var(--accent))':'rgba(255,255,255,0.08)',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:700,color:i<3?'#fff':'var(--text-3)',
                    }}>{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:'var(--text-1)'}}>{st.fullName||'Şagird'}</div>
                    </div>
                    <span style={{
                      fontSize:13,fontWeight:800,
                      color:st.score>=70?'#00C9A7':st.score>=50?'#4F87FF':'#F4A261',
                      fontFamily:"'Lexend Deca',sans-serif",
                    }}>{st.score}%</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    );
  }

  // Group list
  const sorted = [...groups].sort((a,b)=>getGroupAnalytics(b,period).avg-getGroupAnalytics(a,period).avg);
  const maxAvg  = Math.max(...sorted.map(g=>getGroupAnalytics(g,period).avg),1);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{fontSize:12,color:'var(--text-3)'}}>
        Qrupların müqayisəli performansı
      </div>
      {sorted.map((g,i)=>{
        const a   = getGroupAnalytics(g,period);
        const col = GROUP_PALETTE[i % GROUP_PALETTE.length];
        return (
          <motion.button key={g.id}
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            transition={{...SPRING,delay:0.05*i}}
            whileHover={{x:3}} whileTap={{scale:0.98}}
            onClick={()=>setSelGroup(g)}
            style={{
              width:'100%',textAlign:'left',cursor:'pointer',
              background:'var(--bg-card)',border:'0.5px solid var(--border)',
              borderRadius:14,padding:'14px',
            }}
          >
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{
                  width:36,height:36,borderRadius:10,flexShrink:0,
                  background:`color-mix(in srgb,${col} 18%,transparent)`,
                  border:`0.5px solid ${col}33`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
                }}>👥</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--text-1)'}}>{g.name}</div>
                  <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>
                    {a.total} şagird · {g.subject||'—'}
                  </div>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:18,color:col}}>{a.avg}%</div>
                <div style={{fontSize:9,color:a.avg>=70?'#00C9A7':a.avg>=50?'#4F87FF':'#F4A261'}}>
                  {a.avg>=70?'Əla':a.avg>=50?'Orta':'Zəif'}
                </div>
              </div>
            </div>
            <HBar label="" value={a.avg} max={100} color={col}/>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>
              {a.done}/{a.total} aktiv · sırala: #{i+1}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Topics tab ─────────────────────────────────────────────────────────────────
function TopicsTab({ groups, period }: any) {
  const [selSubj, setSelSubj] = useState<string|null>(null);
  const subjects = Object.keys(WEAK_TOPICS);

  const subjectData = subjects.map(subj => {
    const topics = WEAK_TOPICS[subj].map(t => {
      const errorPct = 18 + ((seed(t + subj + period)) % 62);
      return { name: t, errorPct };
    }).sort((a,b)=>b.errorPct-a.errorPct);
    const avgError = Math.round(topics.reduce((s,t)=>s+t.errorPct,0)/topics.length);
    return { subj, topics, avgError };
  }).sort((a,b)=>b.avgError-a.avgError);

  const selected = selSubj ? subjectData.find(s=>s.subj===selSubj) : null;

  if (selected) {
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <button onClick={()=>setSelSubj(null)} style={{
          background:'none',border:'none',cursor:'pointer',
          color:'var(--text-3)',fontSize:13,
          display:'flex',alignItems:'center',gap:4,alignSelf:'flex-start',
        }}>‹ Fənlərə qayıt</button>

        <div className="card" style={{padding:'16px'}}>
          <div style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:15,color:'var(--text-1)',marginBottom:4}}>
            {selected.subj}
          </div>
          <div style={{fontSize:11,color:'var(--text-3)',marginBottom:16}}>
            Orta xəta faizi: <strong style={{color:selected.avgError>50?'#E24B4A':'#F4A261'}}>{selected.avgError}%</strong>
          </div>
          {selected.topics.map((t,i)=>(
            <div key={t.name} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:12,color:'var(--text-2)',fontWeight:600}}>{t.name}</span>
                <span style={{
                  fontSize:11,fontWeight:800,
                  color:t.errorPct>60?'#E24B4A':t.errorPct>40?'#F4A261':'#00C9A7',
                }}>{t.errorPct}% xəta</span>
              </div>
              <div style={{height:7,borderRadius:999,background:'rgba(255,255,255,0.07)'}}>
                <motion.div
                  initial={{width:0}} animate={{width:`${t.errorPct}%`}}
                  transition={{duration:0.6,ease:'easeOut',delay:i*0.05}}
                  style={{
                    height:'100%',borderRadius:999,
                    background:t.errorPct>60?'linear-gradient(90deg,#E24B4A,#FF6B35)'
                              :t.errorPct>40?'linear-gradient(90deg,#F4A261,#E24B4A)'
                              :'#00C9A7',
                  }}
                />
              </div>
              {t.errorPct>50 && (
                <div style={{
                  marginTop:6,fontSize:10,color:'#F4A261',
                  background:'rgba(244,162,97,0.08)',borderRadius:6,
                  padding:'4px 8px',display:'inline-block',
                }}>
                  ⚠️ Diqqət: şagirdlər bu mövzuda çox səhv edir
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{fontSize:12,color:'var(--text-3)'}}>
        Ən çox səhv edilən mövzular fənn üzrə
      </div>
      {subjectData.map((s,i)=>{
        const col = s.avgError>60?'#E24B4A':s.avgError>40?'#F4A261':'#00C9A7';
        const worstTopic = s.topics[0];
        return (
          <motion.button key={s.subj}
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            transition={{...SPRING,delay:0.05*i}}
            whileHover={{x:3}} whileTap={{scale:0.98}}
            onClick={()=>setSelSubj(s.subj)}
            style={{
              width:'100%',textAlign:'left',cursor:'pointer',
              background:'var(--bg-card)',border:`0.5px solid ${col}22`,
              borderRadius:14,padding:'14px',
            }}
          >
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text-1)',marginBottom:3}}>{s.subj}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>
                  {s.topics.length} mövzu · ən zəif: <span style={{color:col,fontWeight:600}}>{worstTopic.name}</span>
                </div>
              </div>
              <span style={{
                fontSize:11,fontWeight:800,color:col,
                background:`color-mix(in srgb,${col} 12%,transparent)`,
                borderRadius:8,padding:'3px 9px',flexShrink:0,
              }}>{s.avgError}% xəta</span>
            </div>
            <HBar label="" value={s.avgError} color={col}/>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Students tab ───────────────────────────────────────────────────────────────
function StudentsTab({ groups, onSelect }: any) {
  const [search, setSearch] = useState('');
  const allStudents = useMemo(()=>{
    const seen = new Set();
    return groups.flatMap(g=>(g.students??[]).map(s=>({...s,groupName:g.name}))).filter(s=>{
      if (seen.has(s.id)) return false; seen.add(s.id); return true;
    });
  },[groups]);

  const filtered = allStudents.filter(s=>
    (s.fullName||'').toLowerCase().includes(search.toLowerCase()) ||
    (s.uniqueId||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{position:'relative'}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'var(--text-3)',pointerEvents:'none'}}>🔍</span>
        <input className="input" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Ad, ID..." style={{paddingLeft:36}}/>
      </div>

      {filtered.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:'32px 24px'}}>
          <div style={{fontSize:36,marginBottom:10}}>👤</div>
          <div style={{fontSize:13,color:'var(--text-3)'}}>
            {search ? `"${search}" tapılmadı` : 'Qruplarda şagird yoxdur'}
          </div>
        </div>
      ) : (
        filtered.map((s,i)=>{
          const score = mockScore((s.fullName??s.id??''));
          return (
            <motion.button key={s.id??i}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              transition={{...SPRING,delay:0.04*i}}
              whileHover={{x:3}} whileTap={{scale:0.98}}
              onClick={()=>onSelect(s)}
              style={{
                width:'100%',textAlign:'left',cursor:'pointer',
                background:'var(--bg-card)',border:'0.5px solid var(--border)',
                borderRadius:14,padding:'13px 14px',
                display:'flex',alignItems:'center',gap:12,
              }}
            >
              <Avatar name={s.fullName||'?'} size="sm"/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text-1)',marginBottom:2}}>{s.fullName||'Şagird'}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>
                  {s.groupName}
                  {s.uniqueId ? ` · ${s.uniqueId}` : ''}
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{
                  fontSize:14,fontWeight:800,fontFamily:"'Lexend Deca',sans-serif",
                  color:score>=70?'#00C9A7':score>=50?'#4F87FF':'#F4A261',
                }}>{score}%</div>
                <div style={{fontSize:9,color:'var(--text-3)'}}>orta bal</div>
              </div>
            </motion.button>
          );
        })
      )}
    </div>
  );
}

// ── Student detail view ────────────────────────────────────────────────────────
function StudentDetailView({ student, onBack }: any) {
  const [period, setPeriod] = useState('weekly');
  const score  = mockScore((student.fullName??student.id??''));
  const subjects = Object.keys(WEAK_TOPICS).slice(0,5).map((subj,i)=>({
    subject: subj,
    avg:     Math.max(20, Math.min(95, score + (seed(subj+(student.id??''))%30)-12)),
    color:   SUBJECT_COLORS[i%SUBJECT_COLORS.length],
  }));
  const trend = Array.from({length:period==='daily'?7:period==='weekly'?6:5},(_,i)=>({
    label: period==='daily'  ? `${i+1}Ç`
         : period==='weekly' ? `H${i+1}`
         : ["Yan","Fev","Mar","Apr","May"][i]??`${i+1}`,
    score: Math.max(25,Math.min(96, score+(seed((student.id??'')+i+period)%28)-10)),
  }));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <button onClick={onBack} style={{
        background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',fontSize:13,
        display:'flex',alignItems:'center',gap:4,alignSelf:'flex-start',
      }}>‹ Şagird siyahısına qayıt</button>

      {/* Header */}
      <div style={{
        display:'flex',alignItems:'center',gap:14,
        background:'color-mix(in srgb,var(--primary) 7%,var(--bg-card))',
        border:'0.5px solid color-mix(in srgb,var(--primary) 25%,transparent)',
        borderRadius:16,padding:'16px 18px',
      }}>
        <Avatar name={student.fullName||'?'} size="md"/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:16,color:'var(--text-1)',marginBottom:3}}>
            {student.fullName||'Şagird'}
          </div>
          <div style={{fontSize:10,color:'var(--text-3)'}}>
            {student.groupName}
            {student.uniqueId ? ` · ${student.uniqueId}` : ''}
          </div>
        </div>
        <div style={{
          fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:24,flexShrink:0,
          color:score>=70?'#00C9A7':score>=50?'#4F87FF':'#F4A261',
        }}>{score}%</div>
      </div>

      <PeriodToggle period={period} onChange={setPeriod}/>

      {/* KPI */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {[
          {icon:'🎯',label:'Orta bal',val:`${score}%`,col:'#4F87FF'},
          {icon:'🏆',label:'Ən yaxşı',val:`${Math.min(99,score+12)}%`,col:'#00C9A7'},
          {icon:'📋',label:'Test',val:4+(seed(student.id??'')%12),col:'#6C63FF'},
          {icon:'🔥',label:'Seriya',val:1+(seed((student.id??'')+period)%7),col:'#F4A261'},
        ].map(k=>(
          <div key={k.label} style={{
            background:`color-mix(in srgb,${k.col} 9%,var(--bg-card))`,
            border:`0.5px solid ${k.col}33`,borderRadius:12,padding:'11px 8px',textAlign:'center',
          }}>
            <div style={{fontSize:16,marginBottom:4}}>{k.icon}</div>
            <div style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:15,color:k.col}}>{k.val}</div>
            <div style={{fontSize:9,color:'var(--text-3)',marginTop:1}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card" style={{padding:'16px'}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text-1)',marginBottom:12}}>
          Performans trendi
        </div>
        <SvgLine trend={trend} color={score>=70?'#00C9A7':score>=50?'#4F87FF':'#F4A261'}/>
      </div>

      {/* Subject radar */}
      <div className="card" style={{padding:'16px'}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text-1)',marginBottom:4}}>
          Fənn üzrə dəqiqlik
        </div>
        <div style={{fontSize:10,color:'var(--text-3)',marginBottom:12}}>Hər fənndə orta faiz</div>
        <SvgRadar stats={subjects}/>
        <div style={{display:'flex',flexDirection:'column',gap:7,marginTop:12}}>
          {subjects.map(s=>(
            <div key={s.subject} style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
              <span style={{fontSize:11,color:'var(--text-2)',flex:1}}>{s.subject}</span>
              <div style={{flex:2,height:4,borderRadius:999,background:'rgba(255,255,255,0.07)'}}>
                <div style={{
                  height:'100%',borderRadius:999,width:`${s.avg}%`,
                  background:s.avg>=70?'#00C9A7':s.avg>=50?'#4F87FF':'#F4A261',transition:'width 0.5s',
                }}/>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:s.color,flexShrink:0,minWidth:32,textAlign:'right'}}>
                {s.avg}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weak topics for this student */}
      <div className="card" style={{padding:'16px'}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text-1)',marginBottom:12}}>
          ❌ Zəif mövzular
        </div>
        {subjects.filter(s=>s.avg<60).length===0 ? (
          <div style={{fontSize:12,color:'#00C9A7',textAlign:'center',padding:'8px 0'}}>
            ✓ Bütün fənlərdə yaxşı nəticə!
          </div>
        ) : (
          subjects.filter(s=>s.avg<60).map(s=>{
            const wt = WEAK_TOPICS[s.subject]?.[0] ?? '—';
            return (
              <div key={s.subject} style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'8px 10px',borderRadius:9,marginBottom:6,
                background:'rgba(226,75,74,0.06)',border:'0.5px solid rgba(226,75,74,0.2)',
              }}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--text-1)'}}>{s.subject}</div>
                  <div style={{fontSize:10,color:'var(--text-3)'}}>Ən zəif: {wt}</div>
                </div>
                <span style={{
                  fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:14,color:'#E24B4A',
                }}>{s.avg}%</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TeacherStudentStats() {
  const [tab,     setTab]     = useState('overview');
  const [period,  setPeriod]  = useState('weekly');
  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [selStudent, setSelStudent] = useState(null);

  useEffect(()=>{
    apiGetMyGroups()
      .then(async (list)=>{
        const arr = Array.isArray(list) ? list : [];
        // Her qrup ucun student profilleri yukle
        const enriched = await Promise.all(arr.map(async g=>{
          const uids = Array.isArray(g.studentUids) ? g.studentUids : [];
          let students: any[] = [];
          if (uids.length > 0) {
            try {
              const profiles = await apiGetStudentProfiles(uids);
              students = (Array.isArray(profiles)?profiles:[]).filter(Boolean).map((p:any)=>({
                id:       p.id,
                fullName: p.fullName||p.displayName||'Şagird',
                uniqueId: p.uniqueId||'',
                email:    p.email||'',
              }));
            } catch {}
          }
          return {
            id:       g.id,
            name:     g.name||'Qrup',
            subject:  g.subject||'',
            grade:    g.grade||null,
            students,
          };
        }));
        setGroups(enriched);
      })
      .catch(()=>setGroups([]))
      .finally(()=>setLoading(false));
  },[]);

  // Student detail (from students tab)
  if (selStudent) {
    return (
      <div style={{background:'var(--bg-primary)',minHeight:'100dvh'}}>
        <Sidebar/><Topbar/><BottomNav/>
        <main className="main-content">
          <div className="page-inner">
            <StudentDetailView student={selStudent} onBack={()=>setSelStudent(null)}/>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{background:'var(--bg-primary)',minHeight:'100dvh'}}>
      <Toaster position="top-center" toastOptions={{
        style:{background:'rgba(20,30,50,0.95)',backdropFilter:'blur(20px)',
          color:'#fff',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:12},
      }}/>
      <Sidebar/><Topbar/><BottomNav/>

      <main className="main-content">
        <div className="page-inner">

          {/* Header */}
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={SPRING}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
              <div>
                <h1 style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:800,fontSize:22,color:'var(--text-1)',marginBottom:4}}>
                  Analitika
                </h1>
                <p style={{color:'var(--text-3)',fontSize:13}}>
                  {groups.length} qrup · {groups.reduce((a,g)=>a+(g.students?.length??0),0)} şagird
                </p>
              </div>
              {tab !== 'students' && <PeriodToggle period={period} onChange={setPeriod}/>}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
            transition={{...SPRING,delay:0.06}}
            style={{
              display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,
              background:'var(--bg-card)',border:'0.5px solid var(--border-card)',
              borderRadius:14,padding:4,
            }}
          >
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                padding:'9px 4px',borderRadius:10,border:'none',
                fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.2s',
                background:tab===t.key?'linear-gradient(135deg,#4F87FF,#6C63FF)':'transparent',
                color:tab===t.key?'#fff':'var(--text-3)',
                fontFamily:"'Lexend Deca',sans-serif",
              }}>{t.label}</button>
            ))}
          </motion.div>

          {/* Content */}
          {loading ? (
            <div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}>
              <span className="spinner" style={{width:32,height:32}}/>
            </div>
          ) : groups.length===0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              className="card" style={{textAlign:'center',padding:'40px 24px'}}>
              <div style={{fontSize:44,marginBottom:12}}>📊</div>
              <h3 style={{fontFamily:"'Lexend Deca',sans-serif",fontWeight:700,fontSize:16,color:'var(--text-1)',marginBottom:8}}>
                Hələ qrup yoxdur
              </h3>
              <p style={{color:'var(--text-3)',fontSize:13,lineHeight:1.65}}>
                Analitika görmək üçün əvvəlcə<br/>
                <strong style={{color:'var(--primary)'}}>Qruplar</strong> bölməsindən qrup yaradın.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}
                transition={{duration:0.18}}
              >
                {tab==='overview'  && <OverviewTab  groups={groups} period={period}/>}
                {tab==='groups'    && <GroupsTab    groups={groups} period={period}/>}
                {tab==='topics'    && <TopicsTab    groups={groups} period={period}/>}
                {tab==='students'  && <StudentsTab  groups={groups} onSelect={setSelStudent}/>}
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>
    </div>
  );
}
