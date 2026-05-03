// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate }        from "react-router-dom";
import { apiGetAssessmentQuestions, apiSubmitTestAnswer, apiFinishTest } from '@/lib/api';
import { AssessmentResult }   from "./AssessmentResult";
import { AssessmentQuizBody } from "./AssessmentQuizBody";

const apiStartAssessment = () => Promise.resolve({ sessionId: "local" });

const normalize = (qs) =>
  (Array.isArray(qs) ? qs : qs?.questions ?? qs?.content ?? []).map((q, i) => ({
    id:           q.id ?? i,
    text:         q.questionText ?? q.text ?? q.question ?? "",
    options:      q.shuffledOptions ?? q.options ?? [],
    correctIndex: q.correctIndex ?? null,
  }));

function Spinner({ text = "Yüklənir..." }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(0,212,255,0.15)", borderTopColor: "var(--primary)", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--text-2)", fontSize: 14, fontFamily: "'Lexend Deca',sans-serif" }}>{text}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function AssessmentQuiz() {
  const navigate = useNavigate();

  const [phase,      setPhase]      = useState("loading");
  const [questions,  setQuestions]  = useState([]);
  const [sessionId,  setSessionId]  = useState(null);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [seconds,    setSeconds]    = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState(null);
  const [errMsg,     setErrMsg]     = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await apiStartAssessment();
        const sid = session?.sessionId ?? session?.id ?? session?.data?.sessionId;
        if (!sid) throw new Error("Session ID gəlmədi.");
        const raw = await apiGetAssessmentQuestions(sid);
        const qs  = normalize(raw);
        if (!qs.length) throw new Error("Backend-dən sual gəlmədi.");
        if (!cancelled) {
          setSessionId(sid);
          setQuestions(qs);
          setPhase("quiz");
          timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        }
      } catch (err) {
        if (!cancelled) { setErrMsg(err.message || "Test başladılarkən xəta baş verdi."); setPhase("error"); }
      }
    })();
    return () => { cancelled = true; clearInterval(timerRef.current); };
  }, []);

  const handleSelect = useCallback(async (qId, optIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
    if (sessionId) {
      const q = questions.find(q => q.id === qId);
      const opt = q?.options?.[optIdx];
      const answerId = typeof opt === "object" ? (opt.id ?? opt.answerId ?? optIdx) : optIdx;
      try { await apiSubmitTestAnswer(sessionId, qId, answerId, 0); } catch { /* silent */ }
    }
  }, [sessionId, questions]);

  const handleFinish = useCallback(async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    let serverResult = null;
    try { serverResult = await apiFinishTest(sessionId); } catch { /* backend yoxdursa keç */ }
    const correct   = questions.filter(q => answers[q.id] === q.correctIndex).length;
    const total     = questions.length;
    const wrongList = questions.filter(q => answers[q.id] !== q.correctIndex).map(q => ({ ...q, selectedIndex: answers[q.id] ?? null }));
    setResult({ score: serverResult?.score ?? correct, total, percent: serverResult?.percent ?? Math.round((correct / total) * 100), wrongList });
    setSubmitting(false);
    setPhase("result");
  }, [sessionId, questions, answers]);

  useEffect(() => {
    const handler = (e) => {
      if (phase !== "quiz") return;
      if (e.key === "ArrowRight" || e.key === " ") setCurrent(c => Math.min(c + 1, questions.length - 1));
      if (e.key === "ArrowLeft")  setCurrent(c => Math.max(c - 1, 0));
      if (["1","2","3","4"].includes(e.key)) { const q = questions[current]; if (q) handleSelect(q.id, parseInt(e.key) - 1); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, current, questions, handleSelect]);

  if (phase === "loading") return <Spinner text="Test hazırlanır..." />;

  if (phase === "error") return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: "'Lexend Deca',sans-serif", padding: 24 }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ color: "var(--text-1)", fontSize: 20 }}>Test başladılmadı</h2>
      <p style={{ color: "var(--text-2)", fontSize: 13, textAlign: "center", maxWidth: 360, lineHeight: 1.6 }}>{errMsg}</p>
      <button onClick={() => navigate(-1)} style={{ padding: "12px 28px", borderRadius: 12, background: "var(--primary)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Lexend Deca',sans-serif", fontSize: 14 }}>Geri qayıt</button>
    </div>
  );

  if (phase === "result") return (
    <AssessmentResult score={result.score} total={result.total} percent={result.percent} timeSeconds={seconds} wrongList={result.wrongList} onBack={() => navigate("/")} />
  );

  return (
    <AssessmentQuizBody
      questions={questions} current={current} setCurrent={setCurrent}
      answers={answers} seconds={seconds} submitting={submitting}
      onSelect={handleSelect} onFinish={handleFinish}
    />
  );
}
