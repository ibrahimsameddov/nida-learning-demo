// @ts-nocheck
﻿import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingOrbs from "../../components/FloatingOrbs";
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { SPRING } from '@/lib/motion';
import { formatElapsed } from '@/lib/utils';

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({ session }) {
  const [elapsed, setElapsed] = useState(Date.now() - session.startedAt);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - session.startedAt), 1000);
    return () => clearInterval(id);
  }, [session.startedAt]);

  const remaining = session.timeLimit * 60 * 1000 - elapsed;
  const remSecs = Math.max(0, Math.floor(remaining / 1000));
  const remM = Math.floor(remSecs / 60).toString().padStart(2, "0");
  const remS = (remSecs % 60).toString().padStart(2, "0");
  const isAlmost = remSecs <= 120 && remSecs > 0;

  const avgProgress = Math.round(
    session.students.reduce((a, s) => a + (s.answered / s.total) * 100, 0) / session.students.length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
      className="card"
      style={{
        padding: "18px 16px",
        border: "0.5px solid rgba(79,135,255,0.35)",
        boxShadow: "0 0 24px rgba(79,135,255,0.08)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              style={{
                width: 8, height: 8, borderRadius: "50%", background: "#00C9A7",
                boxShadow: "0 0 8px #00C9A7",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
              {session.title}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--primary)",
              background: "color-mix(in srgb, var(--primary) 12%, transparent)",
              border: "0.5px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              borderRadius: 999, padding: "2px 7px",
            }}>{session.subject}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--text-3)",
              background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--border)",
              borderRadius: 999, padding: "2px 7px",
            }}>{session.group}</span>
          </div>
        </div>

        {/* Timer */}
        <div style={{
          textAlign: "center",
          background: isAlmost ? "rgba(226,75,74,0.1)" : "rgba(255,255,255,0.04)",
          border: `0.5px solid ${isAlmost ? "rgba(226,75,74,0.4)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12, padding: "8px 12px",
          animation: isAlmost ? "pulseBorder 1.2s ease-in-out infinite" : "none",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 16,
            color: isAlmost ? "#E24B4A" : "var(--accent)",
          }}>{remM}:{remS}</div>
          <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2 }}>qalır</div>
        </div>
      </div>

      {/* Overall progress */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
            Ümumi irəliləyiş — {session.students.length} şagird
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>{avgProgress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${avgProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, var(--primary), var(--accent))",
            }}
          />
        </div>
      </div>

      {/* Student list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {session.students.map((s, i) => {
          const pct = Math.round((s.answered / s.total) * 100);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff",
              }}>{s.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>{s.answered}/{s.total}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.04 * i }}
                    style={{
                      height: "100%", borderRadius: 999,
                      background: pct >= 80 ? "#00C9A7" : pct >= 50 ? "#4F87FF" : "#F4A261",
                    }}
                  />
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, flexShrink: 0,
                color: pct >= 80 ? "#00C9A7" : pct >= 50 ? "#4F87FF" : "#F4A261",
              }}>{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Elapsed */}
      <div style={{
        marginTop: 14, paddingTop: 10, borderTop: "0.5px solid var(--border)",
        fontSize: 11, color: "var(--text-3)", textAlign: "right",
      }}>
        ⏱ {formatElapsed(elapsed)} keçib
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
      className="card"
      style={{ textAlign: "center", padding: "48px 24px" }}
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        style={{ fontSize: 48, marginBottom: 14 }}
      >📡</motion.div>
      <h3 style={{
        fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 16,
        color: "var(--text-1)", marginBottom: 8,
      }}>Aktiv sessiya yoxdur</h3>
      <p style={{ color: "var(--text-3)", fontSize: 13, lineHeight: 1.6 }}>
        Şagirdlər sınağa başlayanda<br />burada canlı olaraq görünəcək.
      </p>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeacherLive() {
  const sessions = [];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <FloatingOrbs />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <div>
              <h1 style={{
                fontFamily: "'Lexend Deca', 'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22,
                color: "var(--text-1)", marginBottom: 4,
              }}>Canlı izləmə</h1>
              <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                {sessions.length > 0 ? `${sessions.length} aktiv sessiya` : "Aktiv sessiya yoxdur"}
              </p>
            </div>

            {/* Live indicator */}
            {sessions.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(0,201,167,0.1)", border: "0.5px solid rgba(0,201,167,0.3)",
                borderRadius: 999, padding: "6px 12px",
              }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#00C9A7" }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#00C9A7" }}>CANLI</span>
              </div>
            )}
          </motion.div>


          {/* Sessions */}
          <AnimatePresence mode="wait">
            {sessions.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {sessions.map(s => <SessionCard key={s.id} session={s} />)}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}

