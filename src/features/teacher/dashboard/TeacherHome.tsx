// @ts-nocheck
﻿import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from '@/features/auth/store/authContext';
import { apiGetMyGroups } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import GlassCard from '@/components/ui/Card';
import StatusBadge from '@/components/ui/Badge';
import { SPRING } from '@/lib/motion';

const NAV_CARDS = [
  { path: "/teacher/groups",       icon: "👥", title: "Qruplar",           desc: "Qrupları idarə et",        stat: "aktiv" },
  { path: "/teacher/student-stats",icon: "📊", title: "Şagird statistikaları", desc: "Nəticə və analitika", stat: "aktiv" },
  { path: "/teacher/tasks",        icon: "📋", title: "Tapşırıqlar",        desc: "Test və ev tapşırıqları",  stat: "aktiv" },
  { path: "/teacher/live",         icon: "📡", title: "Canlı izləmə",       desc: "Aktiv imtahanları izlə",  stat: "normal" },
  { path: "/notifications",        icon: "💬", title: "Mesajlar",           desc: "Şagird mesajları",         stat: "aktiv" },
  { path: "/profile",              icon: "👤", title: "Profil",             desc: "Hesab məlumatları",        stat: "normal" },
];

export default function TeacherHome() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    apiGetMyGroups()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.groups ?? data?.content ?? []);
        setGroups(list);
      })
      .catch(() => {});
  }, []);

  const firstName  = (userProfile?.fullName || userProfile?.displayName || "Müəllim").split(" ")[0];
  const specialty  = userProfile?.subjectSpecialty || "Müəllim";
  const groupCount = groups.length;
  const studentCount = groups.reduce((a, g) => a + (Array.isArray(g.students) ? g.students.length : (Array.isArray(g.members) ? g.members.length : 0)), 0);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            <div style={{
              borderRadius: "var(--radius-xl)", padding: "20px",
              background: "var(--bg-hero)",
              border: "0.5px solid var(--border-accent)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-on-dark-muted)", marginBottom: 3 }}>
                    Müəllim paneli
                  </p>
                  <h1 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text-on-dark)", marginBottom: 6 }}>
                    Salam, {firstName} 👋
                  </h1>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: "var(--radius-pill)",
                    background: "rgba(255,255,255,0.12)", color: "var(--text-on-dark-muted)",
                    border: "0.5px solid rgba(255,255,255,0.18)",
                  }}>
                    {specialty}
                  </span>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>👨‍🏫</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 16 }}>
                {[
                  { val: studentCount || "—", lbl: "Şagird",  bg: "rgba(255,255,255,0.1)",  tc: "var(--text-on-dark)" },
                  { val: "—",                 lbl: "Orta bal", bg: "rgba(104,211,145,0.2)",  tc: "var(--theme-success)" },
                  { val: groupCount   || "—", lbl: "Qrup",    bg: "rgba(126,200,227,0.15)", tc: "var(--theme-accent)" },
                ].map(s => (
                  <div key={s.lbl} style={{ borderRadius: "var(--radius-sm)", padding: "10px 8px", textAlign: "center", background: s.bg }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 18, color: s.tc, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "var(--text-on-dark-muted)", marginTop: 3 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Bölücü ────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: 0.1 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{ flex: 1, height: "0.5px", background: "var(--border-card)" }} />
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
              Müəllim alətləri
            </span>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border-card)" }} />
          </motion.div>

          {/* ── Nav kartları ───────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {NAV_CARDS.map((card, i) => (
              <motion.div
                key={card.path}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.08 + 0.06 * i }}
              >
                <GlassCard
                  onClick={() => navigate(card.path)}
                  style={{ padding: "16px 14px", height: "100%", display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {card.icon}
                    </div>
                    <StatusBadge status={card.stat} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 3 }}>{card.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{card.desc}</div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--theme-mid)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    Keç <span>›</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}

