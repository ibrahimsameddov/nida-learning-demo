// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar }  from '@/components/layout/Sidebar';
import { Topbar }   from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { apiGetMyGroups, apiGetSentPermissions, apiCreateExam, apiActivateExam } from '@/lib/api';
import toast, { Toaster } from "react-hot-toast";
import { SPRING } from '@/lib/motion';
const GROUPS_KEY = "nida_teacher_groups";
const TASKS_KEY  = "nida_teacher_tasks_created";

const loadGroups       = () => { try { return JSON.parse(localStorage.getItem(GROUPS_KEY)) || []; } catch { return []; } };
const loadCreatedTasks = () => { try { return JSON.parse(localStorage.getItem(TASKS_KEY))  || []; } catch { return []; } };
const saveCreatedTasks = t  => localStorage.setItem(TASKS_KEY, JSON.stringify(t));

// ── Exam / topic data ─────────────────────────────────────────────────────────
const EXAM_DATA = [
  {
    id: "buraxilis", title: "Buraxılış İmtahanı", icon: "🎓", color: "#4F87FF",
    subjects: [
      { key: "az-dili", icon: "📝", title: "Azərbaycan dili",
        topics: [
          { name: "Fonetika", qCount: 28 }, { name: "Morfologiya", qCount: 35 },
          { name: "Sintaksis", qCount: 22 }, { name: "Leksika", qCount: 18 },
          { name: "Mətn tapşırıqları", qCount: 30 },
        ] },
      { key: "riy-bur", icon: "📐", title: "Riyaziyyat",
        topics: [
          { name: "Natural ədədlər", qCount: 30 }, { name: "Kəsrlər", qCount: 25 },
          { name: "Cəbr", qCount: 42 }, { name: "Həndəsə", qCount: 38 },
          { name: "Funksiyalar", qCount: 28 },
        ] },
      { key: "xarici-bur", icon: "🌍", title: "Xarici dil",
        topics: [
          { name: "Grammar", qCount: 40 }, { name: "Vocabulary", qCount: 32 },
          { name: "Reading", qCount: 25 }, { name: "Writing", qCount: 20 },
        ] },
    ],
  },
  {
    id: "qebul", title: "Qəbul İmtahanı", icon: "🎯", color: "#6C63FF",
    subjects: [
      { key: "riy-qeb", icon: "📐", title: "Riyaziyyat",
        topics: [
          { name: "Triqonometriya", qCount: 32 }, { name: "Loqarifm", qCount: 28 },
          { name: "Cəbr", qCount: 45 }, { name: "Statistika", qCount: 22 },
          { name: "Kombinatorika", qCount: 18 },
        ] },
      { key: "fizika", icon: "⚡", title: "Fizika",
        topics: [
          { name: "Mexanika", qCount: 40 }, { name: "Elektrostatika", qCount: 35 },
          { name: "Maqnetizm", qCount: 28 }, { name: "Optika", qCount: 25 },
        ] },
      { key: "kimya", icon: "⚗️", title: "Kimya",
        topics: [
          { name: "Atomun quruluşu", qCount: 30 }, { name: "Üzvi kimya", qCount: 38 },
          { name: "Turşular və əsaslar", qCount: 25 }, { name: "Kimyəvi reaksiyalar", qCount: 32 },
        ] },
      { key: "biologiya", icon: "🔬", title: "Biologiya",
        topics: [
          { name: "Hüceyrə", qCount: 35 }, { name: "Genetika", qCount: 30 },
          { name: "Ekologiya", qCount: 25 },
        ] },
      { key: "cografiya", icon: "🌍", title: "Coğrafiya",
        topics: [
          { name: "Fiziki coğrafiya", qCount: 40 }, { name: "İqtisadi coğrafiya", qCount: 35 },
          { name: "Azərbaycan coğrafiyası", qCount: 30 },
        ] },
    ],
  },
];


const STATUS_META = {
  active:    { label: "Aktiv",         color: "#4F87FF", bg: "rgba(79,135,255,0.1)"  },
  pending:   { label: "Gözləyən",      color: "#F4A261", bg: "rgba(244,162,97,0.1)"  },
  overdue:   { label: "Vaxtı keçmiş",  color: "#E24B4A", bg: "rgba(226,75,74,0.1)"   },
  completed: { label: "Tamamlandı",    color: "#00C9A7", bg: "rgba(0,201,167,0.1)"   },
};

const TABS = [
  { label: "Gözləyən",   key: "pending",   color: "#F4A261" },
  { label: "Davam edən", key: "active",    color: "#4F87FF" },
  { label: "Tamamlandı", key: "completed", color: "#00C9A7" },
];

// ────────────────────────────────────────────────────────────────────────────
// ── Creation wizard modal ────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

const DIFFICULTY_OPTS = [
  { key: "asan",    label: "Asan",     color: "#00C9A7", desc: "Baza səviyyəli suallar" },
  { key: "orta",    label: "Orta",     color: "#F4A261", desc: "Orta çətinlik" },
  { key: "cetinlik",label: "Çətin",   color: "#E24B4A", desc: "Yüksək çətinlik" },
  { key: "qarisiq", label: "Qarışıq", color: "#6C63FF", desc: "Müxtəlif səviyyələr" },
];

// Step progress bar
function StepBar({ steps, current }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            height: 3, width: "100%", borderRadius: 999,
            background: i <= current
              ? "linear-gradient(90deg, var(--primary), var(--accent))"
              : "rgba(255,255,255,0.1)",
            transition: "background 0.3s",
          }} />
          <span style={{ fontSize: 9, color: i <= current ? "var(--primary)" : "var(--text-3)", fontWeight: 600 }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

// Topic accordion selector (multi-select for sınaq, single for tapşırıq)
function TopicSelector({ examId, setExamId, selectedTopics, onToggle, multiSelect = true }) {
  const [openSubj, setOpenSubj] = useState(null);
  const exam = EXAM_DATA.find(e => e.id === examId) || EXAM_DATA[0];

  const isSelected = (subjKey, topicName) =>
    selectedTopics.some(t => t.subjKey === subjKey && t.name === topicName);

  return (
    <div>
      {/* Exam type toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {EXAM_DATA.map(e => (
          <button key={e.id} onClick={() => { setExamId(e.id); setOpenSubj(null); onToggle("CLEAR"); }}
            style={{
              padding: "9px 0", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: examId === e.id
                ? `color-mix(in srgb, ${e.color} 18%, rgba(255,255,255,0.05))`
                : "rgba(255,255,255,0.04)",
              border: examId === e.id ? `1px solid ${e.color}55` : "0.5px solid var(--border)",
              color: examId === e.id ? e.color : "var(--text-2)",
              transition: "all 0.2s",
            }}
          >{e.icon} {e.title}</button>
        ))}
      </div>

      {/* Subject accordion */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {exam.subjects.map(subj => {
          const subjSelected = subj.topics.filter(t => isSelected(subj.key, t.name)).length;
          const isOpen = openSubj === subj.key;
          return (
            <div key={subj.key}>
              <button onClick={() => setOpenSubj(isOpen ? null : subj.key)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                background: isOpen
                  ? `color-mix(in srgb, ${exam.color} 10%, rgba(255,255,255,0.04))`
                  : "rgba(255,255,255,0.03)",
                border: isOpen ? `0.5px solid ${exam.color}44` : "0.5px solid var(--border)",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{subj.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isOpen ? exam.color : "var(--text-1)" }}>
                    {subj.title}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {subjSelected > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: exam.color,
                      background: `color-mix(in srgb, ${exam.color} 15%, transparent)`,
                      borderRadius: 999, padding: "1px 6px",
                    }}>{subjSelected} seçildi</span>
                  )}
                  <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}
                    style={{ color: "var(--text-3)", fontSize: 14 }}>›</motion.span>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ paddingLeft: 8, paddingTop: 4, paddingBottom: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                      {subj.topics.map(topic => {
                        const checked = isSelected(subj.key, topic.name);
                        return (
                          <button key={topic.name}
                            onClick={() => {
                              if (!multiSelect) {
                                onToggle("SINGLE", subj, topic);
                              } else {
                                onToggle("TOGGLE", subj, topic);
                              }
                            }}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                              background: checked
                                ? `color-mix(in srgb, ${exam.color} 12%, rgba(255,255,255,0.04))`
                                : "rgba(255,255,255,0.02)",
                              border: checked ? `0.5px solid ${exam.color}44` : "0.5px solid var(--border)",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: multiSelect ? 4 : "50%", flexShrink: 0,
                              background: checked
                                ? `linear-gradient(135deg, var(--primary), var(--accent))`
                                : "rgba(255,255,255,0.08)",
                              border: checked ? "none" : "1px solid rgba(255,255,255,0.2)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {checked && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-1)", flex: 1 }}>
                              {topic.name}
                            </span>
                            <span style={{
                              fontSize: 9, color: "var(--text-3)",
                              background: "rgba(255,255,255,0.05)", borderRadius: 999, padding: "1px 5px",
                            }}>{topic.qCount} sual</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Creation wizard ────────────────────────────────────────────────────────────
function CreateWizard({ onClose, onCreated }) {
  const [step,     setStep]     = useState(0);  // 0 type | 1 form | 2 payment | 3 groups | 4 success
  const [type,     setType]     = useState(null); // "sinaq" | "tapsirig"

  // Sınaq form
  const [sinaqForm, setSinaqForm] = useState({
    title: "", examId: "buraxilis",
    selectedTopics: [], // [{subjKey, subjTitle, name, qCount}]
    qCount: 20, difficulty: "qarisiq", timeLimit: 30,
    startAt: "", maxAttempts: 1,
  });

  // Tapşırıq form
  const [tapsirigForm, setTapsirigForm] = useState({
    title: "", examId: "buraxilis",
    selectedTopics: [],
    dueDate: "",
  });

  // Payment
  const [card, setCard]       = useState({ number: "", exp: "", cvv: "" });
  const [paying, setPaying]   = useState(false);
  const [payDone, setPayDone] = useState(false);

  // Groups + individuals
  const [allGroups,    setAllGroups]    = useState(loadGroups());
  const [allPerms,     setAllPerms]     = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selGroups,    setSelGroups]    = useState([]);
  const [selStudents,  setSelStudents]  = useState([]);
  const [targetTab,    setTargetTab]    = useState("group"); // "group"|"individual"
  const [creating,     setCreating]     = useState(false);

  useEffect(() => {
    setGroupsLoading(true);
    Promise.all([
      apiGetMyGroups().catch(() => []),
      apiGetSentPermissions().catch(() => []),
    ]).then(([groups, perms]) => {
      const list = Array.isArray(groups) ? groups : [];
      if (list.length > 0) {
        setAllGroups(list.map(g => ({
          id:      g.id ?? String(Math.random()),
          name:    g.name ?? "Qrup",
          subject: g.subject ?? "",
          grade:   g.grade ?? null,
          students: Array.isArray(g.studentUids) ? g.studentUids : [],
        })));
      }
      setAllPerms(Array.isArray(perms) ? perms.filter(p => p.status === "granted" || p.status === "APPROVED") : []);
    }).finally(() => setGroupsLoading(false));
  }, []);

  // ─ Helpers ─
  const sf = (k, v) => setSinaqForm(f => ({ ...f, [k]: v }));
  const tf = (k, v) => setTapsirigForm(f => ({ ...f, [k]: v }));

  const handleTopicToggle = (formType) => (action, subj, topic) => {
    const setter = formType === "sinaq" ? sf : tf;
    const current = formType === "sinaq" ? sinaqForm.selectedTopics : tapsirigForm.selectedTopics;

    if (action === "CLEAR") { setter("selectedTopics", []); return; }
    if (action === "SINGLE") {
      setter("selectedTopics", [{ subjKey: subj.key, subjTitle: subj.title, name: topic.name, qCount: topic.qCount }]);
      return;
    }
    // TOGGLE
    const exists = current.some(t => t.subjKey === subj.key && t.name === topic.name);
    if (exists) {
      setter("selectedTopics", current.filter(t => !(t.subjKey === subj.key && t.name === topic.name)));
    } else {
      setter("selectedTopics", [...current, { subjKey: subj.key, subjTitle: subj.title, name: topic.name, qCount: topic.qCount }]);
    }
  };

  const steps = type === "sinaq"
    ? ["Növ", "Məzmun", "Ödəniş", "Qruplar"]
    : type === "tapsirig"
    ? ["Növ", "Məzmun", "Qruplar"]
    : ["Növ"];

  const canNextSinaq = sinaqForm.title.trim() && sinaqForm.selectedTopics.length > 0;
  const canNextTapsirig = tapsirigForm.title.trim() && tapsirigForm.selectedTopics.length > 0 && tapsirigForm.dueDate;

  // ─ Payment ─
  const handlePay = () => {
    if (!card.number.replace(/\s/g,"") || card.number.replace(/\s/g,"").length < 16) {
      toast.error("Düzgün kart nömrəsi daxil edin."); return;
    }
    if (!card.exp || !card.cvv) { toast.error("Bütün sahələri doldurun."); return; }
    setPaying(true);
    setTimeout(() => { setPaying(false); setPayDone(true); setTimeout(() => setStep(3), 600); }, 1800);
  };

  const fmtCardNum = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();

  // ─ Create ─
  const handleCreate = async () => {
    if (selGroups.length === 0 && selStudents.length === 0) {
      toast.error("Ən azı bir qrup və ya şagird seçin."); return;
    }
    setCreating(true);
    try {
      const form       = type === "sinaq" ? sinaqForm : tapsirigForm;
      const topicStr   = form.selectedTopics.map(t => t.name).join(", ");
      const subjectStr = [...new Set(form.selectedTopics.map(t => t.subjTitle))].join(", ");
      const groupNames = selGroups.map(id => allGroups.find(g => g.id === id)?.name || id).join(", ");
      const totalStudents = selGroups.reduce((a, id) => {
        const g = allGroups.find(g => g.id === id);
        return a + (g?.students?.length || 0);
      }, 0);

      // Backend-ə göndər
      const examPayload = {
        title:           form.title,
        subject:         subjectStr,
        topics:          form.selectedTopics.map(t => t.name),
        questionCount:   type === "sinaq" ? sinaqForm.qCount : (form.selectedTopics[0]?.qCount || 10),
        durationMinutes: type === "sinaq" ? sinaqForm.timeLimit : 0,
        difficulty:      type === "sinaq" ? sinaqForm.difficulty?.toUpperCase() : null,
        groupIds:        selGroups,
        dueDate:         type === "tapsirig" ? tapsirigForm.dueDate : null,
        examType:        type === "sinaq" ? "SINAQ" : "TAPSIRIG",
      };

      let backendId = null;
      try {
        const created = await apiCreateExam(examPayload);
        backendId = created?.id ?? created?.examId ?? null;
        if (backendId) {
          await apiActivateExam(backendId).catch(() => {});
        }
      } catch (err) {
        toast.error(`Backend xətası: ${err?.message || "bilinməyən xəta"}. Lokal saxlanıldı.`);
      }

      const newTask = {
        id: backendId ?? Date.now(), type,
        title: form.title, subject: subjectStr, topics: topicStr,
        groups: groupNames, groupIds: selGroups,
        qCount: type === "sinaq" ? sinaqForm.qCount : (form.selectedTopics[0]?.qCount || 10),
        timeLimit: type === "sinaq" ? sinaqForm.timeLimit : 0,
        difficulty: type === "sinaq" ? sinaqForm.difficulty : null,
        due: type === "tapsirig" ? tapsirigForm.dueDate : null,
        startAt: type === "sinaq" ? (sinaqForm.startAt || null) : null,
        maxAttempts: type === "sinaq" ? sinaqForm.maxAttempts : 1,
        status: type === "sinaq" && sinaqForm.startAt ? "pending" : "active",
        submitted: 0, total: totalStudents,
        createdAt: Date.now(),
      };

      const existing = loadCreatedTasks();
      saveCreatedTasks([newTask, ...existing]);
      onCreated(newTask);
      setStep(4);
    } catch {
      toast.error("Tapşırıq yaradıla bilmədi.");
    } finally {
      setCreating(false);
    }
  };

  // ─ Render ─
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={SPRING}
        style={{
          width: "100%", maxWidth: 560,
          background: "var(--bg-card)", borderRadius: "22px 22px 0 0",
          border: "0.5px solid rgba(255,255,255,0.1)",
          maxHeight: "92vh", display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Fixed header */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-1)" }}>
              {step === 0 ? "Tapşırıq növünü seçin"
               : step === 1 ? (type === "sinaq" ? "📋 Sınaq tərtib et" : "📝 Ev tapşırığı")
               : step === 2 ? "💳 Ödəniş"
               : step === 3 ? "👥 Qrup seçin"
               : "✅ Yaradıldı!"}
            </h3>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--border)",
              borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "var(--text-2)", fontSize: 16,
            }}>✕</button>
          </div>
          {step > 0 && step < 4 && <StepBar steps={steps} current={step} />}
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>

          {/* ── Step 0: Type select ── */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 8 }}>
              {[
                {
                  key: "sinaq", icon: "📋", title: "Sınaq imtahanı",
                  color: "#4F87FF", badge: "Ödənişli",
                  points: ["Mövzu seçimi", "Çətinlik səviyyəsi", "Timer qurulur", "Sistem sual yaradır"],
                },
                {
                  key: "tapsirig", icon: "📝", title: "Ev tapşırığı",
                  color: "#00C9A7", badge: "Ödənişsiz",
                  points: ["Mövzu seçimi", "Son tarix", "Timer yoxdur", "Məcburi deyil"],
                },
              ].map(opt => (
                <motion.button key={opt.key}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setType(opt.key); setStep(1); }}
                  style={{
                    padding: "20px 16px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                    background: `color-mix(in srgb, ${opt.color} 8%, var(--bg-primary))`,
                    border: `1px solid ${opt.color}44`,
                    display: "flex", flexDirection: "column", gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 28 }}>{opt.icon}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: opt.color,
                      background: `color-mix(in srgb, ${opt.color} 15%, transparent)`,
                      border: `0.5px solid ${opt.color}44`, borderRadius: 999, padding: "2px 7px",
                    }}>{opt.badge}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{opt.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {opt.points.map(p => (
                      <div key={p} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "var(--text-3)" }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ── Step 1a: Sınaq form ── */}
          {step === 1 && type === "sinaq" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label" style={{ marginBottom: 6 }}>Başlıq</label>
                <input className="input" value={sinaqForm.title}
                  onChange={e => sf("title", e.target.value)}
                  placeholder="Sınaq adı (məs: Triqonometriya sınağı)" autoFocus />
              </div>

              <div>
                <div className="label" style={{ marginBottom: 8 }}>Mövzular</div>
                <TopicSelector
                  examId={sinaqForm.examId}
                  setExamId={v => sf("examId", v)}
                  selectedTopics={sinaqForm.selectedTopics}
                  onToggle={handleTopicToggle("sinaq")}
                  multiSelect={true}
                />
                {sinaqForm.selectedTopics.length > 0 && (
                  <div style={{
                    marginTop: 8, padding: "8px 10px", borderRadius: 8,
                    background: "rgba(79,135,255,0.07)", border: "0.5px solid rgba(79,135,255,0.2)",
                    fontSize: 11, color: "var(--text-3)",
                  }}>
                    ✓ {sinaqForm.selectedTopics.length} mövzu seçildi:&nbsp;
                    <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                      {sinaqForm.selectedTopics.map(t => t.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>Sual sayı</label>
                  <input className="input" type="number" min="5" max="60"
                    value={sinaqForm.qCount} onChange={e => sf("qCount", +e.target.value)} />
                </div>
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>Vaxt (dəq)</label>
                  <input className="input" type="number" min="5" max="180"
                    value={sinaqForm.timeLimit} onChange={e => sf("timeLimit", +e.target.value)} />
                </div>
              </div>

              <div>
                <div className="label" style={{ marginBottom: 8 }}>Çətinlik səviyyəsi</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {DIFFICULTY_OPTS.map(d => (
                    <button key={d.key}
                      onClick={() => sf("difficulty", d.key)}
                      style={{
                        padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: sinaqForm.difficulty === d.key
                          ? `color-mix(in srgb, ${d.color} 15%, rgba(255,255,255,0.04))`
                          : "rgba(255,255,255,0.03)",
                        border: sinaqForm.difficulty === d.key
                          ? `1px solid ${d.color}55` : "0.5px solid var(--border)",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: sinaqForm.difficulty === d.key ? d.color : "var(--text-1)" }}>
                        {d.label}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start date/time + max attempts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>📅 Başlama tarixi/vaxtı</label>
                  <input className="input" type="datetime-local"
                    value={sinaqForm.startAt}
                    onChange={e => sf("startAt", e.target.value)}
                    style={{ colorScheme: "dark" }}
                  />
                  <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>
                    Boş buraxsanız dərhal aktiv olur
                  </div>
                </div>
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>🔁 Giriş sayı</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => sf("maxAttempts", n)}
                        style={{
                          flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer",
                          fontSize: 14, fontWeight: 800,
                          background: sinaqForm.maxAttempts === n
                            ? "linear-gradient(135deg, #4F87FF, #6C63FF)"
                            : "rgba(255,255,255,0.04)",
                          border: sinaqForm.maxAttempts === n
                            ? "none" : "0.5px solid var(--border)",
                          color: sinaqForm.maxAttempts === n ? "#fff" : "var(--text-2)",
                          transition: "all 0.18s",
                        }}>{n}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>
                    Neçə dəfə girişə icazə
                  </div>
                </div>
              </div>

              {/* Estimated cost */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: 12,
                background: "rgba(79,135,255,0.06)", border: "0.5px solid rgba(79,135,255,0.2)",
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>💳 Ödəniş tələb olunur</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>
                    Sınaq imtahanı yaratmaq ödənişlidir
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#4F87FF" }}>4.99 ₼</div>
              </div>
            </motion.div>
          )}

          {/* ── Step 1b: Tapşırıq form ── */}
          {step === 1 && type === "tapsirig" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                background: "rgba(0,201,167,0.07)", border: "0.5px solid rgba(0,201,167,0.25)",
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 14 }}>✅</span>
                <span style={{ fontSize: 12, color: "#00C9A7", fontWeight: 600 }}>Ödənişsiz — şagirdlər ev şəraitində həll edir</span>
              </div>

              <div>
                <label className="label" style={{ marginBottom: 6 }}>Başlıq</label>
                <input className="input" value={tapsirigForm.title}
                  onChange={e => tf("title", e.target.value)}
                  placeholder="Tapşırıq adı (məs: Cəbr ev tapşırığı)" autoFocus />
              </div>

              <div>
                <div className="label" style={{ marginBottom: 8 }}>Mövzu seçin</div>
                <TopicSelector
                  examId={tapsirigForm.examId}
                  setExamId={v => tf("examId", v)}
                  selectedTopics={tapsirigForm.selectedTopics}
                  onToggle={handleTopicToggle("tapsirig")}
                  multiSelect={true}
                />
                {tapsirigForm.selectedTopics.length > 0 && (
                  <div style={{
                    marginTop: 8, padding: "8px 10px", borderRadius: 8,
                    background: "rgba(0,201,167,0.07)", border: "0.5px solid rgba(0,201,167,0.2)",
                    fontSize: 11, color: "#00C9A7", fontWeight: 600,
                  }}>
                    ✓ {tapsirigForm.selectedTopics.length} mövzu seçildi: {tapsirigForm.selectedTopics.map(t => t.name).join(", ")}
                  </div>
                )}
              </div>

              <div>
                <label className="label" style={{ marginBottom: 6 }}>Son tarix</label>
                <input className="input" type="datetime-local"
                  value={tapsirigForm.dueDate}
                  onChange={e => tf("dueDate", e.target.value)} />
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Summary */}
              <div style={{
                padding: "14px 16px", borderRadius: 14,
                background: "color-mix(in srgb, var(--primary) 8%, var(--bg-primary))",
                border: "0.5px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Sınaq məzmunu</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>{sinaqForm.title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {sinaqForm.selectedTopics.map(t => (
                    <span key={t.name} style={{
                      fontSize: 10, color: "var(--primary)",
                      background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                      borderRadius: 999, padding: "2px 7px",
                    }}>{t.name}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>⏱ {sinaqForm.timeLimit} dəq</span>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>❓ {sinaqForm.qCount} sual</span>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                    📊 {DIFFICULTY_OPTS.find(d => d.key === sinaqForm.difficulty)?.label}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px", borderRadius: 14,
                background: "rgba(79,135,255,0.08)", border: "0.5px solid rgba(79,135,255,0.3)",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>Ödəniş məbləği</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>Bir sınaq imtahanı</div>
                </div>
                <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 26, color: "#4F87FF" }}>
                  4.99 <span style={{ fontSize: 14 }}>₼</span>
                </div>
              </div>

              {/* Card inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>💳 Kart nömrəsi</label>
                  <input className="input"
                    value={card.number}
                    onChange={e => setCard(c => ({ ...c, number: fmtCardNum(e.target.value) }))}
                    placeholder="0000 0000 0000 0000" maxLength={19}
                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", fontSize: 15 }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="label" style={{ marginBottom: 6 }}>Son tarix</label>
                    <input className="input"
                      value={card.exp}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g,"").slice(0,4);
                        if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
                        setCard(c => ({ ...c, exp: v }));
                      }}
                      placeholder="MM/YY" maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ marginBottom: 6 }}>CVV</label>
                    <input className="input"
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,"").slice(0,3) }))}
                      placeholder="***" maxLength={3} type="password"
                    />
                  </div>
                </div>
              </div>

              {/* Pay button inline - shown when paying/done */}
              {payDone && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    background: "rgba(0,201,167,0.1)", border: "0.5px solid rgba(0,201,167,0.3)",
                    borderRadius: 12,
                  }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#00C9A7" }}>Ödəniş uğurlu oldu!</div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Group selection ── */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Qrup / Fərdi tab */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
                background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3,
              }}>
                {[
                  { key: "group",      label: "👥 Qrup" },
                  { key: "individual", label: `👤 Fərdi${allPerms.length > 0 ? ` (${allPerms.length})` : ""}` },
                ].map(t => (
                  <button key={t.key} onClick={() => setTargetTab(t.key)}
                    style={{
                      padding: "9px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.2s",
                      background: targetTab === t.key ? "#4F87FF" : "transparent",
                      color:      targetTab === t.key ? "#fff"    : "var(--text-3)",
                      fontFamily: "'Lexend Deca', sans-serif",
                    }}>{t.label}</button>
                ))}
              </div>

              {groupsLoading ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <span className="spinner" style={{ width: 24, height: 24, display: "inline-block" }} />
                </div>
              ) : targetTab === "group" ? (
                allGroups.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
                    <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>
                      Hələ qrup yaradılmayıb.<br />
                      Qruplar bölməsindən qrup əlavə edin.
                    </p>
                  </div>
                ) : (
                  allGroups.map((grp, i) => {
                    const checked = selGroups.includes(grp.id);
                    return (
                      <motion.button key={grp.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING, delay: 0.04 * i }}
                        onClick={() => setSelGroups(prev =>
                          checked ? prev.filter(id => id !== grp.id) : [...prev, grp.id]
                        )}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                          padding: "13px 14px", borderRadius: 12, cursor: "pointer",
                          background: checked ? "rgba(79,135,255,0.1)" : "rgba(255,255,255,0.03)",
                          border: checked ? "1px solid rgba(79,135,255,0.4)" : "0.5px solid var(--border)",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                          background: checked ? "linear-gradient(135deg, #4F87FF, #6C63FF)" : "rgba(255,255,255,0.08)",
                          border: checked ? "none" : "1px solid rgba(255,255,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {checked && <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{grp.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                            {grp.grade ? `${grp.grade}-ci sinif · ` : ""}{grp.subject}
                            {grp.students.length > 0 ? ` · ${grp.students.length} şagird` : ""}
                          </div>
                        </div>
                        {checked && <span style={{ fontSize: 11, fontWeight: 700, color: "#4F87FF", flexShrink: 0 }}>Seçildi ✓</span>}
                      </motion.button>
                    );
                  })
                )
              ) : (
                allPerms.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
                    <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>
                      İcazə vermiş fərdi şagird yoxdur.<br />
                      Qruplar bölməsindən şagird əlavə edin.
                    </p>
                  </div>
                ) : (
                  allPerms.map((p, i) => {
                    const pid  = p.studentUid ?? p.receiverUid ?? p.id;
                    const name = p.receiverName ?? p.studentName ?? "Şagird";
                    const checked = selStudents.includes(pid);
                    return (
                      <motion.button key={pid}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING, delay: 0.04 * i }}
                        onClick={() => setSelStudents(prev =>
                          checked ? prev.filter(id => id !== pid) : [...prev, pid]
                        )}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                          padding: "13px 14px", borderRadius: 12, cursor: "pointer",
                          background: checked ? "rgba(0,201,167,0.08)" : "rgba(255,255,255,0.03)",
                          border: checked ? "1px solid rgba(0,201,167,0.35)" : "0.5px solid var(--border)",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                          background: checked ? "#00C9A7" : "rgba(255,255,255,0.08)",
                          border: checked ? "none" : "1px solid rgba(255,255,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {checked && <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)" }}>{p.subject ?? "Fərdi şagird"}</div>
                        </div>
                        {checked && <span style={{ fontSize: 11, fontWeight: 700, color: "#00C9A7", flexShrink: 0 }}>Seçildi ✓</span>}
                      </motion.button>
                    );
                  })
                )
              )}

              {(selGroups.length > 0 || selStudents.length > 0) && (
                <div style={{
                  fontSize: 11, color: "var(--text-3)", textAlign: "center",
                  padding: "8px 0", borderTop: "0.5px solid var(--border)",
                }}>
                  {selGroups.length > 0 && `${selGroups.length} qrup`}
                  {selGroups.length > 0 && selStudents.length > 0 && " + "}
                  {selStudents.length > 0 && `${selStudents.length} fərdi şagird`} seçildi
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: "center", padding: "24px 0 8px" }}
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                style={{ fontSize: 52, marginBottom: 14 }}
              >🎉</motion.div>
              <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text-1)", marginBottom: 8 }}>
                {type === "sinaq" ? "Sınaq yaradıldı!" : "Ev tapşırığı göndərildi!"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 20 }}>
                {[selGroups.length > 0 && `${selGroups.length} qrup`, selStudents.length > 0 && `${selStudents.length} fərdi şagird`].filter(Boolean).join(" + ")} seçildi.<br />
                Şagirdlərin bildiriş paneline avtomatik bildiriş getdi.
              </div>
              <button onClick={onClose} className="btn btn-primary" style={{ width: "100%" }}>
                Bağla
              </button>
            </motion.div>
          )}
        </div>

        {/* Fixed footer buttons */}
        {step < 4 && (
          <div style={{
            flexShrink: 0, padding: "14px 20px",
            borderTop: "0.5px solid var(--border)",
            background: "var(--bg-card)",
            display: "flex", gap: 10,
          }}>
            {step > 0 && step < 4 && (
              <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary" style={{ flex: 1 }}>
                ← Geri
              </button>
            )}

            {/* Step 0: no next button — click cards to proceed */}

            {step === 1 && type === "sinaq" && (
              <button
                onClick={() => setStep(2)}
                disabled={!canNextSinaq}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >Növbəti: Ödəniş →</button>
            )}

            {step === 1 && type === "tapsirig" && (
              <button
                onClick={() => setStep(2)}
                disabled={!canNextTapsirig}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >Növbəti: Qruplar →</button>
            )}

            {step === 2 && type === "sinaq" && (
              <button
                onClick={handlePay}
                disabled={paying || payDone}
                className="btn btn-primary"
                style={{ flex: 2, background: paying ? undefined : "linear-gradient(135deg, #4F87FF, #6C63FF)" }}
              >
                {paying ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <motion.div
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }}
                    />
                    Emal edilir...
                  </span>
                ) : payDone ? "✓ Ödənildi" : "💳 4.99 ₼ Ödə"}
              </button>
            )}

            {step === 2 && type === "tapsirig" && (
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}>
                Qrupları seç →
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleCreate}
                disabled={(selGroups.length === 0 && selStudents.length === 0) || creating}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {creating ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <motion.div
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }}
                    />
                    Yaradılır...
                  </span>
                ) : `✓ Yarat (${[selGroups.length > 0 && `${selGroups.length} qrup`, selStudents.length > 0 && `${selStudents.length} şagird`].filter(Boolean).join(" + ")})`}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, index, onClick }) {
  const meta    = STATUS_META[task.status] || STATUS_META.active;
  const progress = task.total > 0 ? Math.round((task.submitted / task.total) * 100) : 0;
  const isSinaq = task.type === "sinaq" || task.type === "test";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.04 * index }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card"
      style={{ padding: "15px 15px", border: `0.5px solid ${meta.color}33`, cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 15 }}>{isSinaq ? "📋" : "📝"}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{task.title}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {task.subject && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: "var(--primary)",
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                border: "0.5px solid color-mix(in srgb, var(--primary) 25%, transparent)",
                borderRadius: 999, padding: "2px 7px",
              }}>{task.subject}</span>
            )}
            {task.group && (
              <span style={{
                fontSize: 10, color: "var(--text-3)",
                background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--border)",
                borderRadius: 999, padding: "2px 7px",
              }}>{task.group}</span>
            )}
            {task.qCount && (
              <span style={{
                fontSize: 10, color: "var(--text-3)",
                background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--border)",
                borderRadius: 999, padding: "2px 7px",
              }}>{task.qCount} sual{task.timeLimit ? ` · ${task.timeLimit} dəq` : ""}</span>
            )}
            {task.maxAttempts > 1 && (
              <span style={{
                fontSize: 10, color: "#6C63FF",
                background: "rgba(108,99,255,0.08)", border: "0.5px solid rgba(108,99,255,0.25)",
                borderRadius: 999, padding: "2px 7px",
              }}>🔁 {task.maxAttempts}×</span>
            )}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: meta.color,
          background: meta.bg, border: `0.5px solid ${meta.color}44`,
          borderRadius: 999, padding: "3px 9px", flexShrink: 0, marginLeft: 8,
        }}>{meta.label}</span>
      </div>

      <div style={{ marginBottom: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "var(--text-3)" }}>Cavablandı</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-2)" }}>
            {task.submitted}/{task.total} ({progress}%)
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
          <div style={{
            height: "100%", borderRadius: 999, width: `${progress}%`,
            background: `linear-gradient(90deg, var(--primary), ${meta.color})`,
            transition: "width 0.5s",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        {task.due
          ? <div style={{ fontSize: 10, color: "var(--text-3)" }}>🗓 {task.due}</div>
          : <div />}
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>Ətraflı ›</span>
      </div>
    </motion.div>
  );
}


// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(secs) {
  if (!secs) return "—";
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60), s = secs % 60;
  return s ? `${m}d ${s}s` : `${m} dəq`;
}

function getTaskGroups(task) {
  const allGroups = loadGroups();
  if (task.groupIds && task.groupIds.length > 0) {
    return task.groupIds
      .map(id => allGroups.find(g => g.id === id))
      .filter(Boolean);
  }
  return [];
}

// Per-student performance for a given task (deterministic mock)
function getStudentPerf(student, task) {
  const idStr = (student.uniqueId || student.fullName || "") + String(task.id);
  const seed  = [...idStr].reduce((a, c) => a + c.charCodeAt(0), 0);
  const completed = (seed % 7) > 0;  // ~85% completion
  if (!completed) return { completed: false, score: 0, correct: 0, wrong: 0, timeSpent: 0 };
  const total     = task.qCount || 20;
  const score     = 38 + (seed % 55);
  const correct   = Math.min(total, Math.round(total * score / 100));
  const wrong     = total - correct;
  const maxTime   = task.timeLimit ? task.timeLimit * 60 : 1200;
  const timeSpent = Math.round(maxTime * (0.35 + (seed % 55) / 100));
  return { completed: true, total, correct, wrong, score, timeSpent };
}

// ── Group task stats view ─────────────────────────────────────────────────────
function GroupTaskStatsView({ task, group, onBack }) {
  const isSinaq = task.type === "sinaq" || task.type === "test";
  const students = group.students || [];

  const perfs = students.map(s => ({ ...s, perf: getStudentPerf(s, task) }));
  const done  = perfs.filter(p => p.perf.completed);
  const completion = students.length > 0 ? Math.round((done.length / students.length) * 100) : 0;
  const avgScore   = done.length > 0 ? Math.round(done.reduce((a, p) => a + p.perf.score, 0) / done.length) : 0;
  const avgTime    = done.length > 0 ? Math.round(done.reduce((a, p) => a + p.perf.timeSpent, 0) / done.length) : 0;
  const best       = done.length > 0 ? Math.max(...done.map(p => p.perf.score)) : 0;

  const sorted = [...perfs].sort((a, b) => b.perf.score - a.perf.score);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Sidebar />
      <Topbar />
      <BottomNav />
      <main className="main-content">
        <div className="page-inner">

          {/* Back */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            <button onClick={onBack} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 13,
              display: "flex", alignItems: "center", gap: 4, marginBottom: 14,
            }}>‹ Qrup siyahısına qayıt</button>

            {/* Task info bar */}
            <div style={{
              background: "color-mix(in srgb, var(--primary) 7%, var(--bg-card))",
              border: "0.5px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              borderRadius: 16, padding: "14px 16px", marginBottom: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{isSinaq ? "📋" : "📝"}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{task.title}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "var(--primary)",
                  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                  borderRadius: 999, padding: "2px 7px",
                }}>{group.name}</span>
                {task.qCount && <span style={{ fontSize: 10, color: "var(--text-3)", background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--border)", borderRadius: 999, padding: "2px 7px" }}>{task.qCount} sual</span>}
                {task.timeLimit > 0 && <span style={{ fontSize: 10, color: "var(--text-3)", background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--border)", borderRadius: 999, padding: "2px 7px" }}>⏱ {task.timeLimit} dəq</span>}
              </div>
            </div>
          </motion.div>

          {/* Group overview stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.07 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}
          >
            {[
              { icon: "✅", label: "Tamamlama",   val: `${completion}%`,    col: "#00C9A7" },
              { icon: "🎯", label: "Orta bal",     val: `${avgScore}%`,      col: "#4F87FF" },
              { icon: "🏆", label: "Ən yüksək",   val: `${best}%`,          col: "#6C63FF" },
              { icon: "⏱", label: "Orta vaxt",   val: fmtTime(avgTime),   col: "#F4A261" },
            ].map(s => (
              <div key={s.label} style={{
                background: `color-mix(in srgb, ${s.col} 8%, var(--bg-card))`,
                border: `0.5px solid ${s.col}33`, borderRadius: 12, padding: "12px 10px", textAlign: "center",
              }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, color: s.col }}>{s.val}</div>
                <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Completion bar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ ...SPRING, delay: 0.12 }}
            className="card" style={{ padding: "14px 14px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
                Tamamlama vəziyyəti
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>
                {done.length}/{students.length} şagird
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", marginBottom: 8 }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${completion}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 999,
                  background: "linear-gradient(90deg, var(--primary), var(--accent))",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 11, color: "#00C9A7" }}>✅ {done.length} tamamladı</span>
              <span style={{ fontSize: 11, color: "#E24B4A" }}>⏳ {students.length - done.length} tamamlamadı</span>
            </div>
          </motion.div>

          {/* Most wrong questions */}
          {isSinaq && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.14 }}
              className="card" style={{ padding: "14px" }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
                ❌ Ən çox səhv edilən suallar
              </div>
              {(task.selectedTopics ?? [{ name: task.topics?.split(",")[0]?.trim() || "Ümumi" }])
                .slice(0, 4)
                .map((tp, i) => {
                  const topicName = tp.name ?? tp;
                  const seed = [...(topicName + String(task.id ?? ""))].reduce((a, c) => a + c.charCodeAt(0), 0);
                  const errorPct = 25 + ((seed * (i + 1)) % 55);
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>
                          {topicName} — Sual {(seed % 12) + 1 + i * 3}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: errorPct > 50 ? "#E24B4A" : "#F4A261",
                        }}>{errorPct}% səhv</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.07)" }}>
                        <div style={{
                          height: "100%", borderRadius: 999, width: `${errorPct}%`,
                          background: errorPct > 50
                            ? "linear-gradient(90deg, #E24B4A, #FF6B35)"
                            : "linear-gradient(90deg, #F4A261, #E24B4A)",
                          transition: "width 0.6s",
                        }} />
                      </div>
                    </div>
                  );
                })}
            </motion.div>
          )}

          {/* Student leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.16 }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>
              Şagird nəticələri
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {sorted.map((st, i) => {
                const p = st.perf;
                const isPass = p.score >= 60;
                return (
                  <motion.div
                    key={st.uniqueId}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SPRING, delay: 0.04 * i }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "var(--bg-card)",
                      border: `0.5px solid ${p.completed ? (isPass ? "rgba(0,201,167,0.2)" : "rgba(226,75,74,0.2)") : "var(--border)"}`,
                      borderRadius: 12, padding: "10px 13px",
                      opacity: p.completed ? 1 : 0.55,
                    }}
                  >
                    {/* Rank badge */}
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: i < 3 && p.completed
                        ? "linear-gradient(135deg, var(--primary), var(--accent))"
                        : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      color: i < 3 && p.completed ? "#fff" : "var(--text-3)",
                    }}>{p.completed ? i + 1 : "—"}</div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 1 }}>
                        {st.fullName}
                      </div>
                      {p.completed ? (
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontSize: 10, color: "#00C9A7" }}>✓{p.correct}</span>
                          <span style={{ fontSize: 10, color: "#E24B4A" }}>✗{p.wrong}</span>
                          <span style={{ fontSize: 10, color: "var(--text-3)" }}>⏱{fmtTime(p.timeSpent)}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 10, color: "var(--text-3)" }}>Tamamlamadı</div>
                      )}
                    </div>

                    {/* Score */}
                    {p.completed && (
                      <div style={{
                        fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, flexShrink: 0,
                        color: isPass ? "#00C9A7" : "#E24B4A",
                        background: isPass ? "rgba(0,201,167,0.1)" : "rgba(226,75,74,0.08)",
                        border: `0.5px solid ${isPass ? "rgba(0,201,167,0.3)" : "rgba(226,75,74,0.25)"}`,
                        borderRadius: 10, padding: "6px 11px",
                      }}>{p.score}%</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

// ── Task detail view (groups list) ────────────────────────────────────────────
function TaskDetailView({ task, onBack, onSelectGroup, onLive, onEdit }) {
  const isSinaq = task.type === "sinaq" || task.type === "test";
  const groups  = getTaskGroups(task);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Sidebar />
      <Topbar />
      <BottomNav />
      <main className="main-content">
        <div className="page-inner">

          {/* Back */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            <button onClick={onBack} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 13,
              display: "flex", alignItems: "center", gap: 4, marginBottom: 14,
            }}>‹ Tapşırıqlara qayıt</button>

            {/* Task header */}
            <div style={{
              background: isSinaq
                ? "color-mix(in srgb, #4F87FF 8%, var(--bg-card))"
                : "color-mix(in srgb, #00C9A7 8%, var(--bg-card))",
              border: isSinaq
                ? "0.5px solid rgba(79,135,255,0.3)"
                : "0.5px solid rgba(0,201,167,0.3)",
              borderRadius: 18, padding: "18px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: isSinaq ? "rgba(79,135,255,0.15)" : "rgba(0,201,167,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>{isSinaq ? "📋" : "📝"}</div>
                <div>
                  <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text-1)", marginBottom: 3 }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                    {isSinaq ? "Sınaq imtahanı" : "Ev tapşırığı"}
                    {task.subject ? ` · ${task.subject}` : ""}
                  </div>
                </div>
              </div>

              {/* Meta badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {task.qCount && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "var(--text-3)",
                    background: "rgba(255,255,255,0.07)", border: "0.5px solid var(--border)",
                    borderRadius: 999, padding: "3px 9px",
                  }}>❓ {task.qCount} sual</span>
                )}
                {task.timeLimit > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "var(--text-3)",
                    background: "rgba(255,255,255,0.07)", border: "0.5px solid var(--border)",
                    borderRadius: 999, padding: "3px 9px",
                  }}>⏱ {task.timeLimit} dəq</span>
                )}
                {task.difficulty && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "#F4A261",
                    background: "rgba(244,162,97,0.1)", border: "0.5px solid rgba(244,162,97,0.3)",
                    borderRadius: 999, padding: "3px 9px",
                  }}>📊 {task.difficulty}</span>
                )}
                {task.due && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "var(--text-3)",
                    background: "rgba(255,255,255,0.07)", border: "0.5px solid var(--border)",
                    borderRadius: 999, padding: "3px 9px",
                  }}>🗓 {task.due}</span>
                )}
                {task.startAt && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "#F4A261",
                    background: "rgba(244,162,97,0.1)", border: "0.5px solid rgba(244,162,97,0.3)",
                    borderRadius: 999, padding: "3px 9px",
                  }}>📅 {new Date(task.startAt).toLocaleString("az-AZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                )}
                {task.maxAttempts > 1 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "#6C63FF",
                    background: "rgba(108,99,255,0.1)", border: "0.5px solid rgba(108,99,255,0.3)",
                    borderRadius: 999, padding: "3px 9px",
                  }}>🔁 {task.maxAttempts} giriş hüququ</span>
                )}
              </div>

              {task.topics && (
                <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-3)" }}>
                  Mövzular: <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{task.topics}</span>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {task.status === "active" && isSinaq && (
                  <button onClick={() => onLive && onLive(task)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 12, cursor: "pointer",
                      background: "linear-gradient(135deg, #E24B4A, #FF6B35)",
                      border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
                      fontFamily: "'Lexend Deca', sans-serif",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block",
                      animation: "pulse 1.2s ease-in-out infinite" }} />
                    Canlı İzlə
                  </button>
                )}
                {task.status === "pending" && isSinaq && (
                  <button onClick={() => onEdit && onEdit(task)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 12, cursor: "pointer",
                      background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--border)",
                      color: "var(--text-1)", fontSize: 13, fontWeight: 700,
                      fontFamily: "'Lexend Deca', sans-serif",
                    }}>
                    ✏️ Düzəliş et
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Section title */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
            👥 Qrupların statistikası
          </div>

          {/* Group cards */}
          {groups.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>Bu tapşırığa hələ qrup əlavə edilməyib</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {groups.map((grp, i) => {
                const students = grp.students || [];
                const perfs    = students.map(s => getStudentPerf(s, task));
                const done     = perfs.filter(p => p.completed).length;
                const avg      = done > 0
                  ? Math.round(perfs.filter(p => p.completed).reduce((a, p) => a + p.score, 0) / done)
                  : 0;
                const completion = students.length > 0 ? Math.round((done / students.length) * 100) : 0;

                return (
                  <motion.button
                    key={grp.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: 0.06 * i }}
                    whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectGroup(grp)}
                    style={{
                      width: "100%", textAlign: "left", cursor: "pointer",
                      background: "var(--bg-card)", border: "0.5px solid var(--border)",
                      borderRadius: 16, padding: "16px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 11,
                          background: "color-mix(in srgb, var(--primary) 16%, transparent)",
                          border: "0.5px solid color-mix(in srgb, var(--primary) 25%, transparent)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>👥</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>
                            {grp.name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                            {students.length} şagird
                          </div>
                        </div>
                      </div>
                      <span style={{ color: "var(--accent)", fontSize: 18 }}>›</span>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                      {[
                        { label: "Tamamlama", val: `${completion}%`, col: "#00C9A7" },
                        { label: "Orta bal",   val: `${avg}%`,        col: "#4F87FF" },
                        { label: "Bitirdi",    val: `${done}/${students.length}`, col: "#6C63FF" },
                      ].map(s => (
                        <div key={s.label} style={{
                          background: `color-mix(in srgb, ${s.col} 8%, rgba(255,255,255,0.03))`,
                          border: `0.5px solid ${s.col}30`, borderRadius: 10,
                          padding: "8px 8px", textAlign: "center",
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: s.col }}>{s.val}</div>
                          <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 1 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
                      <div style={{
                        height: "100%", borderRadius: 999, width: `${completion}%`,
                        background: "linear-gradient(90deg, var(--primary), var(--accent))",
                        transition: "width 0.5s",
                      }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ── Live exam monitor ─────────────────────────────────────────────────────────
function ExamLiveMonitor({ task, onBack }) {
  const total = task.total || 20;
  const [entered,  setEntered]  = useState(Math.floor(total * 0.3));
  const [finished, setFinished] = useState(Math.floor(total * 0.1));
  const [liveAvg,  setLiveAvg]  = useState(62);
  const [elapsed,  setElapsed]  = useState(0); // seconds since monitor opened

  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed(s => s + 5);
      setEntered(e => {
        const next = Math.min(total, e + (Math.random() > 0.55 ? 1 : 0));
        setFinished(f => Math.min(next, f + (Math.random() > 0.7 ? 1 : 0)));
        return next;
      });
      setLiveAvg(prev  => Math.min(98, Math.max(30, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 5000);
    return () => clearInterval(iv);
  }, [total, entered]);

  const timeLeft = task.timeLimit ? Math.max(0, task.timeLimit * 60 - elapsed) : null;
  const pct = total > 0 ? Math.round((entered / total) * 100) : 0;
  const finPct = entered > 0 ? Math.round((finished / entered) * 100) : 0;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Sidebar />
      <Topbar />
      <BottomNav />
      <main className="main-content">
        <div className="page-inner">

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            <button onClick={onBack} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 13,
              display: "flex", alignItems: "center", gap: 4, marginBottom: 14,
            }}>‹ İmtahana qayıt</button>

            {/* Live header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(226,75,74,0.12), rgba(255,107,53,0.08))",
              border: "0.5px solid rgba(226,75,74,0.3)", borderRadius: 18, padding: "18px",
              marginBottom: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  style={{
                    width: 10, height: 10, borderRadius: "50%", background: "#E24B4A", flexShrink: 0,
                  }}
                />
                <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>
                  Canlı İzləmə
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#E24B4A",
                  background: "rgba(226,75,74,0.15)", borderRadius: 999, padding: "2px 8px",
                }}>LIVE</span>
              </div>
              <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 8 }}>
                {task.title}
              </div>
              {timeLeft !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: timeLeft < 300 ? "#E24B4A" : "var(--text-3)" }}>
                    ⏱ Qalan vaxt:
                  </span>
                  <span style={{
                    fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 18,
                    color: timeLeft < 300 ? "#E24B4A" : "#4F87FF",
                  }}>{fmtTime(timeLeft)}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Live KPI grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.07 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
          >
            {[
              { icon: "🚪", label: "Daxil oldu",   val: `${entered}/${total}`,  sub: `${pct}%`, col: "#4F87FF" },
              { icon: "✅", label: "Bitirdi",       val: `${finished}/${entered || 1}`, sub: `${finPct}%`, col: "#00C9A7" },
              { icon: "🎯", label: "Canlı ortalama", val: `${liveAvg}%`,        sub: "bal",     col: "#6C63FF" },
            ].map(s => (
              <motion.div key={s.label}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut" }}
                style={{
                  background: `color-mix(in srgb, ${s.col} 10%, var(--bg-card))`,
                  border: `0.5px solid ${s.col}33`, borderRadius: 14, padding: "14px 10px", textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 18, color: s.col }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: s.col, fontWeight: 600, marginTop: 2 }}>{s.sub}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress bar — entered */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ ...SPRING, delay: 0.14 }}
            className="card" style={{ padding: "16px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>İştirak vəziyyəti</span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Canlı yenilənir</span>
            </div>

            {[
              { label: "Daxil oldu", count: entered, total, color: "#4F87FF" },
              { label: "Bitirdi",    count: finished, total: entered || 1, color: "#00C9A7" },
              { label: "Davam edir", count: entered - finished, total: entered || 1, color: "#F4A261" },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>{row.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)" }}>
                    {row.count}/{row.total}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)" }}>
                  <motion.div
                    animate={{ width: `${row.total > 0 ? Math.round((row.count / row.total) * 100) : 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ height: "100%", borderRadius: 999, background: row.color }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Score distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="card" style={{ padding: "16px" }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
              📊 Bal paylanması (tamamlayanlar)
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
              {[
                { range: "0–39", pct: 15, col: "#E24B4A" },
                { range: "40–59", pct: 28, col: "#F4A261" },
                { range: "60–79", pct: 35, col: "#4F87FF" },
                { range: "80–100", pct: 22, col: "#00C9A7" },
              ].map(b => (
                <div key={b.range} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, color: b.col, fontWeight: 700 }}>
                    {Math.round(finished * b.pct / 100)}
                  </span>
                  <motion.div
                    animate={{ height: `${b.pct * 0.6}px` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={{ width: "100%", borderRadius: "4px 4px 0 0", background: b.col, opacity: 0.8 }}
                  />
                  <span style={{ fontSize: 8, color: "var(--text-3)" }}>{b.range}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

// ── Edit exam modal (for pending exams) ───────────────────────────────────────
function EditExamModal({ task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:       task.title       ?? "",
    qCount:      task.qCount      ?? 20,
    timeLimit:   task.timeLimit   ?? 30,
    difficulty:  task.difficulty  ?? "qarisiq",
    startAt:     task.startAt     ?? "",
    maxAttempts: task.maxAttempts ?? 1,
  });
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Başlıq daxil edin."); return; }
    onSaved({ ...task, ...form });
    onClose();
    toast.success("İmtahan yeniləndi.");
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={SPRING}
        style={{
          width: "100%", maxWidth: 560,
          background: "var(--bg-card)", borderRadius: "22px 22px 0 0",
          border: "0.5px solid rgba(255,255,255,0.1)",
          maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-1)" }}>
              ✏️ İmtahanı düzəliş et
            </h3>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--border)",
              borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "var(--text-2)", fontSize: 16,
            }}>✕</button>
          </div>
          <div style={{
            padding: "8px 12px", borderRadius: 10, marginBottom: 14,
            background: "rgba(244,162,97,0.08)", border: "0.5px solid rgba(244,162,97,0.25)",
            fontSize: 11, color: "#F4A261",
          }}>
            ⚠️ İmtahan başlayana qədər düzəliş edə bilərsiniz.
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label" style={{ marginBottom: 6 }}>Başlıq</label>
            <input className="input" value={form.title} onChange={e => sf("title", e.target.value)} autoFocus />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>Sual sayı</label>
              <input className="input" type="number" min="5" max="60"
                value={form.qCount} onChange={e => sf("qCount", +e.target.value)} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>Vaxt (dəq)</label>
              <input className="input" type="number" min="5" max="180"
                value={form.timeLimit} onChange={e => sf("timeLimit", +e.target.value)} />
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 8 }}>Çətinlik</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DIFFICULTY_OPTS.map(d => (
                <button key={d.key} onClick={() => sf("difficulty", d.key)}
                  style={{
                    padding: "9px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    background: form.difficulty === d.key
                      ? `color-mix(in srgb, ${d.color} 15%, rgba(255,255,255,0.04))`
                      : "rgba(255,255,255,0.03)",
                    border: form.difficulty === d.key ? `1px solid ${d.color}55` : "0.5px solid var(--border)",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: form.difficulty === d.key ? d.color : "var(--text-1)" }}>
                    {d.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>📅 Başlama vaxtı</label>
              <input className="input" type="datetime-local"
                value={form.startAt} onChange={e => sf("startAt", e.target.value)}
                style={{ colorScheme: "dark" }} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6 }}>🔁 Giriş sayı</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => sf("maxAttempts", n)}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer",
                      fontSize: 14, fontWeight: 800,
                      background: form.maxAttempts === n
                        ? "linear-gradient(135deg, #4F87FF, #6C63FF)"
                        : "rgba(255,255,255,0.04)",
                      border: form.maxAttempts === n ? "none" : "0.5px solid var(--border)",
                      color: form.maxAttempts === n ? "#fff" : "var(--text-2)",
                      transition: "all 0.18s",
                    }}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn btn-primary" style={{ width: "100%", marginTop: 4 }}>
            💾 Yadda saxla
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TeacherTasks() {
  const [activeTab,    setActiveTab]    = useState("pending");
  const [showCreate,   setShowCreate]   = useState(false);
  const [createdTasks, setCreatedTasks] = useState(() => {
    const saved = loadCreatedTasks();
    const real = saved.filter(t => t.id > 6 || typeof t.id === "string");
    if (real.length !== saved.length) saveCreatedTasks(real);
    return real;
  });
  const [view, setView] = useState({ mode: "list" });

  const allTasks = [...createdTasks];
  const filtered = allTasks.filter(t => t.status === activeTab);

  const counts = {
    pending:   allTasks.filter(t => t.status === "pending").length,
    active:    allTasks.filter(t => t.status === "active").length,
    completed: allTasks.filter(t => t.status === "completed").length,
  };

  const handleCreated = (newTask) => {
    const updated = [{ ...newTask, status: "pending" }, ...createdTasks];
    setCreatedTasks(updated);
    saveCreatedTasks(updated);
  };

  const handleTaskSaved = (updated) => {
    const next = createdTasks.map(t => t.id === updated.id ? updated : t);
    setCreatedTasks(next);
    saveCreatedTasks(next);
    setView({ mode: "task", task: updated });
  };

  // ── Drill-down views ──
  if (view.mode === "task") {
    return (
      <>
        <TaskDetailView
          task={view.task}
          onBack={() => setView({ mode: "list" })}
          onSelectGroup={grp => setView({ mode: "group", task: view.task, group: grp })}
          onLive={task => setView({ mode: "live", task })}
          onEdit={task => setView({ mode: "edit", task })}
        />
        <AnimatePresence>
          {view.mode === "edit" && (
            <EditExamModal
              task={view.task}
              onClose={() => setView({ mode: "task", task: view.task })}
              onSaved={handleTaskSaved}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (view.mode === "edit") {
    return (
      <>
        <TaskDetailView
          task={view.task}
          onBack={() => setView({ mode: "list" })}
          onSelectGroup={grp => setView({ mode: "group", task: view.task, group: grp })}
          onLive={task => setView({ mode: "live", task })}
          onEdit={() => {}}
        />
        <AnimatePresence>
          <EditExamModal
            task={view.task}
            onClose={() => setView({ mode: "task", task: view.task })}
            onSaved={handleTaskSaved}
          />
        </AnimatePresence>
      </>
    );
  }

  if (view.mode === "live") {
    return (
      <ExamLiveMonitor
        task={view.task}
        onBack={() => setView({ mode: "task", task: view.task })}
      />
    );
  }

  if (view.mode === "group") {
    return (
      <GroupTaskStatsView
        task={view.task}
        group={view.group}
        onBack={() => setView({ mode: "task", task: view.task })}
      />
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Toaster position="top-center" toastOptions={{
        style: { background: "rgba(20,30,50,0.95)", backdropFilter: "blur(20px)",
          color: "#fff", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 12 },
      }} />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <AnimatePresence>
        {showCreate && (
          <CreateWizard
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>

      <main className="main-content">
        <div className="page-inner">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{
                fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22,
                color: "var(--text-1)", marginBottom: 4,
              }}>Tapşırıqlar</h1>
              <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                {allTasks.length > 0 ? `${allTasks.length} tapşırıq` : "Sınaq və ev tapşırıqları"}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                flexShrink: 0, marginTop: 4,
                padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800,
                background: "linear-gradient(135deg, #4F87FF, #6C63FF)",
                border: "none", color: "#fff", cursor: "pointer",
                fontFamily: "'Lexend Deca', sans-serif",
                boxShadow: "0 4px 16px rgba(79,135,255,0.3)",
              }}
            >+ Yeni</button>
          </motion.div>

          {/* 3-tab selector */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.06 }}
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
              background: "var(--bg-card)", border: "0.5px solid var(--border-card)",
              borderRadius: 14, padding: 4,
            }}
          >
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 6px", borderRadius: 10, border: "none",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeTab === tab.key ? tab.color : "transparent",
                  color:      activeTab === tab.key ? "#fff"    : "var(--text-3)",
                  fontFamily: "'Lexend Deca', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                <span>{tab.label}</span>
                {counts[tab.key] > 0 && (
                  <span style={{
                    fontSize: 9, padding: "1px 6px", borderRadius: 10, fontWeight: 800,
                    background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                  }}>{counts[tab.key]}</span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Task list */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {filtered.length === 0 ? (
                <div style={{
                  background: "var(--bg-card)", border: "0.5px solid var(--border-card)",
                  borderRadius: 18, textAlign: "center", padding: "40px 24px",
                }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>
                    {activeTab === "pending" ? "⏳" : activeTab === "active" ? "▶️" : "✅"}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>
                    {activeTab === "pending"   ? "Gözləyən tapşırıq yoxdur"
                   : activeTab === "active"    ? "Aktiv tapşırıq yoxdur"
                                               : "Tamamlanan tapşırıq yoxdur"}
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 18, lineHeight: 1.65 }}>
                    {activeTab === "pending" || activeTab === "active"
                      ? "«+ Yeni» düyməsindən tapşırıq yaradın."
                      : "Şagirdlər tapşırıqları tamamlayanda burada görünəcək."}
                  </p>
                  {activeTab !== "completed" && (
                    <button onClick={() => setShowCreate(true)} style={{
                      padding: "9px 22px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: "linear-gradient(135deg, #4F87FF, #6C63FF)",
                      border: "none", color: "#fff", cursor: "pointer",
                      fontFamily: "'Lexend Deca', sans-serif",
                    }}>+ Yeni tapşırıq</button>
                  )}
                </div>
              ) : (
                filtered.map((t, i) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    index={i}
                    onClick={() => setView({ mode: "task", task: t })}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}

