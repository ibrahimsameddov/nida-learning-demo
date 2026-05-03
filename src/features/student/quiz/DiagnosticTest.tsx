// @ts-nocheck
﻿import { useState, useEffect, useRef } from "react";
import { useAuth } from '@/features/auth/store/authContext';
import {
  apiStartAssessment,
  apiGetAssessmentQuestions,
  apiSubmitAnswer,
  apiFinishTest,
} from '@/lib/api';
import { saveGroupSelection } from "../services/firebase";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";

function Timer({ seconds }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span className="font-mono text-brand-400 font-semibold text-lg">
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

const GROUPS = [
  { id: "group1", label: "I Qrup",   color: "blue",  subjects: "Riyaziyyat · Fizika · Kimya",          field: "Mühəndislik · IT · Texniki" },
  { id: "group2", label: "II Qrup",  color: "green", subjects: "Riyaziyyat · Coğrafiya · Tarix",        field: "İqtisadiyyat · Biznes" },
  { id: "group3", label: "III Qrup", color: "amber", subjects: "Azərbaycan dili · Tarix · Ədəbiyyat",   field: "Hüquq · Müəllimlik · Humanitar" },
  { id: "group4", label: "IV Qrup",  color: "red",   subjects: "Biologiya · Kimya · Fizika",            field: "Tibb · Stomatologiya · Biologiya" },
];

const COLOR_MAP = {
  blue:  { border: "border-blue-500/40",  bg: "bg-blue-500/10",  text: "text-blue-400"  },
  green: { border: "border-green-500/40", bg: "bg-green-500/10", text: "text-green-400" },
  amber: { border: "border-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-400" },
  red:   { border: "border-red-500/40",   bg: "bg-red-500/10",   text: "text-red-400"   },
};

// Normalise subject stats from finish endpoint into a consistent shape
function normaliseSubjectResults(raw = []) {
  return raw.map(s => {
    const pct = s.percent ?? s.averagePercent ?? 0;
    return {
      subject: s.subject,
      correct: s.correct ?? "-",
      total:   s.total   ?? s.totalTests ?? "-",
      percent: Math.round(pct),
      isWeak:  pct < 60,
    };
  });
}

export default function DiagnosticTest({ grade, onComplete }) {
  const { currentUser, refreshProfile } = useAuth();

  const [view, setView]             = useState("intro");
  const [loading, setLoading]       = useState(false);
  const [questions, setQuestions]   = useState([]);
  const [sessionId, setSessionId]   = useState(null);
  const [answers, setAnswers]       = useState({});   // { questionId: optionId }
  const [current, setCurrent]       = useState(0);
  const [seconds, setSeconds]       = useState(0);
  const [result, setResult]         = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [saving, setSaving]         = useState(false);
  const timerRef                    = useRef(null);

  useEffect(() => {
    if (view === "test") {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const { sessionId: sid } = await apiStartAssessment();
      const qs = await apiGetAssessmentQuestions(sid);
      setSessionId(sid);
      setQuestions(Array.isArray(qs) ? qs : []);
      setCurrent(0);
      setAnswers({});
      setSeconds(0);
      setView("test");
    } catch (err) {
      toast.error(err.message || "Test başladıla bilmədi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    apiSubmitAnswer(sessionId, optionId).catch(() => {});
  };

  const handleFinish = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res = await apiFinishTest(sessionId);
      setResult({ ...res, timeSeconds: seconds });
      setView("analysis");
    } catch (err) {
      toast.error(err.message || "Xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupConfirm = async () => {
    if (!selectedGroup) {
      toast.error("Zəhmət olmasa qrup seçin.");
      return;
    }
    setSaving(true);
    try {
      await saveGroupSelection(currentUser.uid, selectedGroup);
      await refreshProfile();
      toast.success("Qrup seçildi!");
      onComplete();
    } catch (err) {
      toast.error("Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  };

  const q        = questions[current];
  const answered = Object.keys(answers).length;

  // ── Giriş ekranı ──
  if (view === "intro") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
        <Toaster position="top-center" />
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-5xl text-white mb-3">Nida</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">Gələcəyə səsləniş</p>
        </div>
        <div className="w-full max-w-lg card">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">
              Ümumi Qiymətləndirmə Testi
            </h2>
            <p className="text-white/50 font-body text-sm leading-relaxed">
              Bu test sizin hazırlıq səviyyənizi müəyyən etmək üçündür.
              Nəticələrə əsasən zəif sahələriniz analiz olunacaq.
            </p>
          </div>
          <div className="bg-surface-muted rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="font-display font-bold text-white text-xl">Adaptiv</div>
                <div className="text-white/40 text-xs mt-1">Test növü</div>
              </div>
              <div>
                <div className="font-display font-bold text-white text-xl">{grade || "—"}</div>
                <div className="text-white/40 text-xs mt-1">Sinif</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onComplete} className="btn-secondary flex-1">Atla</button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Yüklənir..." : "Başla →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Test ekranı ──
  if (view === "test" && q) {
    const opts = q.shuffledOptions || [];
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <div className="h-14 bg-surface-card border-b border-surface-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-white">Nida</span>
            <span className="text-white/30 text-sm">Ümumi Qiymətləndirmə</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-sm">{answered}/{questions.length}</span>
            <Timer seconds={seconds} />
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary text-sm py-1.5 px-4"
            >
              {loading ? "..." : "Bitir və nəticələri gör"}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-24 border-r border-surface-border bg-surface-card overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={clsx(
                    "w-9 h-9 rounded-lg text-xs font-mono font-semibold transition-all",
                    current === i
                      ? "bg-brand-600 text-white"
                      : answers[questions[i]?.id] !== undefined
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                      : "bg-surface-muted text-white/40 hover:text-white"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <span className="badge-brand">{current + 1} / {questions.length}</span>
                {q.subject && <span className="text-white/30 text-xs">{q.subject}</span>}
              </div>
              <p className="font-body text-white text-lg leading-relaxed mb-8">
                {q.questionText || q.text}
              </p>
              <div className="space-y-3">
                {opts.map((opt, idx) => (
                  <button
                    key={opt.id ?? idx}
                    onClick={() => handleAnswer(q.id, opt.id ?? idx)}
                    className={clsx(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4",
                      answers[q.id] === (opt.id ?? idx)
                        ? "border-brand-500 bg-brand-500/10 text-white"
                        : "border-surface-border bg-surface-muted hover:border-brand-500/50 text-white/70 hover:text-white"
                    )}
                  >
                    <span className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-bold flex-shrink-0",
                      answers[q.id] === (opt.id ?? idx) ? "bg-brand-600 text-white" : "bg-surface-card text-white/40"
                    )}>
                      {["A","B","C","D"][idx]}
                    </span>
                    <span className="font-body">{opt.text}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrent(c => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="btn-secondary disabled:opacity-30"
                >← Əvvəlki</button>
                <button
                  onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                  disabled={current === questions.length - 1}
                  className="btn-secondary disabled:opacity-30"
                >Növbəti →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Analiz ekranı ──
  if (view === "analysis" && result) {
    const subjectResults = normaliseSubjectResults(
      result.subjectResults || result.subjectStats || []
    );
    const percent = result.percent ?? 0;
    const score   = result.score   ?? 0;
    const total   = result.total   ?? questions.length;

    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
        <Toaster position="top-center" />
        <div className="w-full max-w-2xl">
          <div className="card text-center mb-6">
            <div className="text-5xl font-display font-bold text-white mb-2">
              {score}
              <span className="text-white/30 text-2xl">/{total}</span>
            </div>
            <p className="text-white/50 text-sm mb-4">Ümumi nəticə · %{percent}</p>
            <div className="w-full bg-surface-muted rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            {result.message && (
              <p className="text-white/40 text-sm mt-4 font-body">{result.message}</p>
            )}
          </div>

          {subjectResults.length > 0 && (
            <div className="card mb-6">
              <h3 className="font-display font-semibold text-white mb-4">Fənn üzrə analiz</h3>
              <div className="space-y-4">
                {subjectResults.map((s) => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm text-white">{s.subject}</span>
                        <span className={clsx("badge text-xs", s.isWeak ? "badge-danger" : "badge-success")}>
                          {s.isWeak ? "Zəif" : "Güclü"}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-white/50">
                        {s.correct !== "-" ? `${s.correct}/${s.total}` : `%${s.percent}`}
                      </span>
                    </div>
                    <div className="w-full bg-surface-muted rounded-full h-2">
                      <div
                        className={clsx("h-2 rounded-full transition-all", s.isWeak ? "bg-red-500" : "bg-emerald-500")}
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subjectResults.some(s => s.isWeak) && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
              <h4 className="font-display font-semibold text-red-400 mb-2">⚠ Diqqət tələb edən sahələr</h4>
              {subjectResults.filter(s => s.isWeak).map(s => (
                <p key={s.subject} className="text-white/60 text-sm font-body">
                  • {s.subject} — %{s.percent} nəticə
                </p>
              ))}
            </div>
          )}

          <button onClick={() => setView("group")} className="btn-primary w-full">
            İxtisas qrupu seç →
          </button>
        </div>
      </div>
    );
  }

  // ── Qrup seçimi ──
  if (view === "group") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
        <Toaster position="top-center" />
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-3xl text-white mb-2">İxtisas qrupunu seçin</h2>
            <p className="text-white/40 text-sm font-body">
              Universitetdə oxumaq istədiyiniz sahəyə uyğun qrup seçin
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {GROUPS.map((group) => {
              const colors = COLOR_MAP[group.color];
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={clsx(
                    "p-5 rounded-2xl border text-left transition-all duration-200",
                    selectedGroup === group.id
                      ? `${colors.border} ${colors.bg}`
                      : "border-surface-border bg-surface-card hover:border-surface-border/80"
                  )}
                >
                  <div className={clsx("font-display font-bold text-lg mb-1", selectedGroup === group.id ? colors.text : "text-white")}>
                    {group.label}
                  </div>
                  <div className="text-white/40 text-xs mb-2">{group.field}</div>
                  <div className="text-white/30 text-xs">{group.subjects}</div>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleGroupConfirm}
            disabled={saving || !selectedGroup}
            className="btn-primary w-full"
          >
            {saving ? "Saxlanılır..." : "Təsdiqlə və davam et →"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

