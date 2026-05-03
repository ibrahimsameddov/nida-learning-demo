// @ts-nocheck
﻿import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingOrbs from "../../components/FloatingOrbs";
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { SPRING } from '@/lib/motion';
import { EXAM_DATA } from '@/types/examData';

function ExamColumn({ exam, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1,  y: 0  }}
      transition={SPRING}
      className="card"
      style={{ padding: "18px 16px" }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 14, paddingBottom: 12, borderBottom: "0.5px solid var(--border)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          background: `color-mix(in srgb, ${exam.color} 20%, rgba(255,255,255,0.05))`,
          border: `1px solid ${exam.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          boxShadow: `0 0 10px ${exam.color}33`,
        }}>{exam.icon}</div>
        <div>
          <div style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>
            {exam.title}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
            {exam.subjects.length > 0 ? `${exam.subjects.length} fənn` : "Tezliklə"}
          </div>
        </div>
      </div>

      {exam.subjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 8px" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <p style={{ color: "var(--text-3)", fontSize: 12, lineHeight: 1.6 }}>
            Fənlər <strong style={{ color: exam.color }}>tezliklə</strong> əlavə olunacaq
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {exam.subjects.map((subj) => (
            <motion.button
              key={subj.key}
              whileHover={{ x: 3, background: `color-mix(in srgb, ${exam.color} 12%, rgba(255,255,255,0.05))` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(
                `/topic-quiz?exam=${exam.id}&subject=${encodeURIComponent(subj.title)}`
              )}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 12px", borderRadius: 12, cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid var(--border)",
                textAlign: "left", transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{subj.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)" }}>{subj.title}</span>
              </div>
              <span style={{ color: exam.color, fontSize: 18, lineHeight: 1 }}>›</span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function StudentSubjects() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <FloatingOrbs />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={SPRING}
          >
            <h1 style={{
              fontFamily: "'Lexend Deca','Lexend Deca',sans-serif", fontWeight: 800, fontSize: 22,
              color: "var(--text-1)", marginBottom: 4,
            }}>Fənlər</h1>
            <p style={{ color: "var(--text-3)", fontSize: 13 }}>
              Fənn seçin — test dərhal başlayır
            </p>
          </motion.div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
            <span style={{
              fontSize: 11, color: "var(--text-3)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
            }}>Fənn üzrə test et</span>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
          </div>

          <div className="exam-halves">
            {EXAM_DATA.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1,  y: 0  }}
                transition={{ ...SPRING, delay: 0.08 * i }}
              >
                <ExamColumn exam={exam} navigate={navigate} />
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}

