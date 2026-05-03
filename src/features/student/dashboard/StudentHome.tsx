// @ts-nocheck
﻿import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/features/auth/store/authContext';
import { useTheme } from '@/stores/themeStore';
import { apiGetMyStatistics, apiGetMyExams } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import GlassCard from '@/components/ui/Card';
import { SPRING } from '@/lib/motion';
import { mapExamToTask } from '@/lib/utils';
import { EXAM_DATA } from '@/types/examData';

// ── Tasks Modal ───────────────────────────────────────────────────────────────
function TasksModal({ onClose, navigate, tasks = [] }) {
  const overdue  = tasks.filter(t => t.status === "overdue");
  const pending  = tasks.filter(t => t.status === "pending");
  const rest     = tasks.filter(t => t.status !== "overdue" && t.status !== "pending");
  const items    = [...overdue, ...pending, ...rest];

  const statusStyle = {
    pending: { bg: "rgba(246,173,85,0.12)", color: "var(--theme-warning)", label: "Gözləyir" },
    overdue: { bg: "rgba(252,129,129,0.12)", color: "var(--theme-danger)", label: "Vaxtı keçdi" },
    completed: { bg: "rgba(104,211,145,0.12)", color: "var(--theme-success)", label: "Tamamlandı" },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <motion.div initial={{ opacity: 0, y: 32, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.92 }} transition={SPRING}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, maxHeight: "82vh", background: "var(--bg-card)", border: "0.5px solid var(--border-card)", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column" }}
      >
        <div style={{ padding: "20px 20px 14px", borderBottom: "0.5px solid var(--border-card)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Müəllim tapşırıqları</p>
            <h2 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>
              Sinaq İmtahanları
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "0.5px solid var(--border-card)", background: "var(--bg-secondary)", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "14px 16px 20px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              Aktiv tapşırıq yoxdur
            </div>
          ) : items.map((item) => {
            const ss = statusStyle[item.status] || statusStyle.pending;
            return (
              <div key={item.id} style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", marginBottom: 8, background: ss.bg, border: `0.5px solid ${ss.color}44` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{item.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-pill)", background: ss.bg, color: ss.color, border: `0.5px solid ${ss.color}66`, flexShrink: 0, marginLeft: 8 }}>{ss.label}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10 }}>
                  {item.teacher} · {item.questions > 0 ? `${item.questions} sual` : ""} {item.duration}
                </div>
                <button
                  onClick={() => { navigate(`/topic-quiz?exam=qebul&subject=${encodeURIComponent(item.subject)}&assignedId=${item.id}&title=${encodeURIComponent(item.title)}`); onClose(); }}
                  style={{ width: "100%", padding: "9px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--theme-mid)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "filter 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
                >
                  Testi başlat →
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Ana komponent ─────────────────────────────────────────────────────────────
export default function StudentHome() {
  const navigate       = useNavigate();
  const { userProfile } = useAuth();
  useTheme();

  const [stats,      setStats]      = useState(null);
  const [exams,      setExams]      = useState([]);
  const [tasksModal, setTasksModal] = useState(false);

  useEffect(() => {
    apiGetMyStatistics().then(setStats).catch(() => {});
    apiGetMyExams().then(data => {
      if (Array.isArray(data)) setExams(data.map(mapExamToTask));
    }).catch(() => {});
  }, []);

  const firstName = (userProfile?.fullName || userProfile?.displayName || "").split(" ")[0] || "Şagird";
  const avgPct    = stats ? Math.round(stats.averagePercentage ?? stats.averagePercent ?? 0) : 0;
  const bestPct   = stats?.bestPercent ?? 0;
  const totalTests = stats?.totalTests ?? 0;

  const pendingCount = exams.filter(e => e.status === "pending").length;
  const overdueCount = exams.filter(e => e.status === "overdue").length;
  const urgentCount  = pendingCount + overdueCount;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* ── Hero karti ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            <div style={{
              borderRadius: "var(--radius-xl)", padding: "20px",
              background: "var(--bg-hero)",
              border: "0.5px solid var(--border-accent)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

              <p style={{ fontSize: 12, color: "var(--text-on-dark-muted)", marginBottom: 4 }}>
                Salam, {firstName} 👋
              </p>
              <h1 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text-on-dark)", marginBottom: 16 }}>
                Bu gün nə öyrənəcəksən?
              </h1>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { val: totalTests > 0 ? totalTests : "—", lbl: "Test",     bg: "rgba(255,255,255,0.1)",  tc: "var(--text-on-dark)" },
                  { val: avgPct > 0 ? `${avgPct}%` : "—",  lbl: "Orta bal", bg: "rgba(104,211,145,0.2)",  tc: "var(--theme-success)" },
                  { val: bestPct > 0 ? `${bestPct}%` : "—",lbl: "Rekord",   bg: "rgba(126,200,227,0.15)", tc: "var(--theme-accent)" },
                ].map(s => (
                  <div key={s.lbl} style={{ borderRadius: "var(--radius-sm)", padding: "10px 8px", textAlign: "center", background: s.bg }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 18, color: s.tc, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "var(--text-on-dark-muted)", marginTop: 3 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Müəllim tapşırıqları ───────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.08 }}>
            <GlassCard
              accent={urgentCount > 0}
              onClick={() => setTasksModal(true)}
              style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: urgentCount > 0 ? "rgba(246,173,85,0.15)" : "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📋</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Müəllim tapşırıqları</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {urgentCount === 0
                      ? "Aktiv tapşırıq yoxdur"
                      : <>
                          {overdueCount > 0 && <span style={{ color: "var(--theme-danger)", fontWeight: 700 }}>{overdueCount} gecikmiş · </span>}
                          {pendingCount} gözləyir
                        </>
                    }
                  </div>
                </div>
              </div>
              <span style={{ color: "var(--text-tertiary)", fontSize: 18 }}>›</span>
            </GlassCard>
          </motion.div>

          {/* ── Bölücü ────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: 0.12 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{ flex: 1, height: "0.5px", background: "var(--border-card)" }} />
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
              Mövzu üzrə test et
            </span>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border-card)" }} />
          </motion.div>

          {/* ── İmtahan sütunları ──────────────────────────────────────── */}
          <div className="exam-halves">
            {EXAM_DATA.map((exam, ei) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.15 + 0.07 * ei }}
              >
                <GlassCard style={{ padding: "16px" }}>
                  {/* Başlıq */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: "0.5px solid var(--border-card)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {exam.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{exam.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                        {exam.subjects.length > 0 ? `${exam.subjects.length} fənn` : "Tezliklə"}
                      </div>
                    </div>
                  </div>

                  {/* Fənlər */}
                  {exam.subjects.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: 26, marginBottom: 8 }}>🔒</div>
                      <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                        Tezliklə əlavə olunacaq
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {exam.subjects.map(subj => (
                        <button
                          key={subj.key}
                          onClick={() => navigate(`/topic-quiz?exam=${exam.id}&subject=${encodeURIComponent(subj.title)}`)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "11px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                            background: "var(--bg-secondary)", border: "0.5px solid var(--border-card)",
                            textAlign: "left",
                            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, background 0.2s",
                            transform: "translateZ(0)",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px) translateZ(0)"; e.currentTarget.style.borderColor = "var(--border-accent)"; e.currentTarget.style.background = "var(--bg-tertiary)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0) translateZ(0)"; e.currentTarget.style.borderColor = "var(--border-card)"; e.currentTarget.style.background = "var(--bg-secondary)"; }}
                          onMouseDown={e  => { e.currentTarget.style.transform = "scale(0.97) translateZ(0)"; }}
                          onMouseUp={e    => { e.currentTarget.style.transform = "translateX(4px) translateZ(0)"; }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{subj.icon}</span>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{subj.title}</span>
                          </div>
                          <span style={{ color: "var(--text-tertiary)", fontSize: 16 }}>›</span>
                        </button>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* ── Qısa linklər ──────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.3 }}
            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {[
              { label: "📊 Statistika",   path: "/stats"         },
              { label: "📩 Bildirişlər",  path: "/notifications" },
              { label: "👤 Profil",       path: "/profile"       },
            ].map(l => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                style={{
                  fontSize: 12, padding: "7px 14px", borderRadius: "var(--radius-pill)",
                  background: "var(--bg-secondary)", color: "var(--text-secondary)",
                  border: "0.5px solid var(--border-card)", cursor: "pointer",
                  fontWeight: 500,
                  transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s",
                  transform: "translateZ(0)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05) translateZ(0)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateZ(0)"; e.currentTarget.style.borderColor = "var(--border-card)"; }}
              >
                {l.label}
              </button>
            ))}
          </motion.div>

        </div>
      </main>

      <AnimatePresence>
        {tasksModal && (
          <TasksModal onClose={() => setTasksModal(false)} navigate={navigate} tasks={exams} />
        )}
      </AnimatePresence>
    </div>
  );
}

