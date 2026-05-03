// @ts-nocheck
﻿import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  apiGetBalance,
  apiTopUp,
  apiPayMonthly,
  apiGetPaymentHistory,
} from '@/lib/api';
import FloatingOrbs from "../../components/FloatingOrbs";
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import toast, { Toaster } from "react-hot-toast";
import { SPRING_FAST as SPRING } from '@/lib/motion';

const PACKAGES = [
  { id: "basic",    label: "Əsas",     price: 15, desc: "Aylıq plan", badge: "" },
  { id: "standard", label: "Standart", price: 25, desc: "Aylıq plan", badge: "Populyar" },
  { id: "premium",  label: "Premium",  price: 40, desc: "Aylıq plan", badge: "Ən yaxşı" },
];

const TOP_UP_AMOUNTS = [5, 10, 20, 50];

export default function ParentPayment() {
  const [balance,      setBalance]      = useState(null);
  const [history,      setHistory]      = useState([]);
  const [loadingBal,   setLoadingBal]   = useState(true);
  const [loadingHist,  setLoadingHist]  = useState(true);
  const [selPackage,   setSelPackage]   = useState("standard");
  const [topUpAmount,  setTopUpAmount]  = useState(20);
  const [customAmount, setCustomAmount] = useState("");
  const [processing,   setProcessing]   = useState(false);
  const [tab,          setTab]          = useState("overview");

  const loadBalance = async () => {
    setLoadingBal(true);
    try {
      const data = await apiGetBalance();
      setBalance(data?.amount ?? 0);
    } catch {
      setBalance(0);
    } finally {
      setLoadingBal(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHist(true);
    try {
      const data = await apiGetPaymentHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHist(false);
    }
  };

  useEffect(() => {
    loadBalance();
    loadHistory();
  }, []);

  const effectiveTopUp = customAmount ? Number(customAmount) : topUpAmount;

  const handleTopUp = async () => {
    if (!effectiveTopUp || effectiveTopUp <= 0) { toast.error("Məbləği seçin."); return; }
    setProcessing(true);
    try {
      const data = await apiTopUp(effectiveTopUp, "Balans artırma");
      setBalance(data?.amount ?? (balance + effectiveTopUp));
      toast.success(`${effectiveTopUp} AZN balansa əlavə edildi!`);
      setCustomAmount("");
      loadHistory();
    } catch (err) {
      toast.error(err.message || "Xəta baş verdi.");
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyPackage = async () => {
    const pkg = PACKAGES.find(p => p.id === selPackage);
    if (!pkg) return;
    if ((balance ?? 0) < pkg.price) { toast.error("Balans kifayət deyil. Balansı artırın."); return; }
    setProcessing(true);
    try {
      const childData = localStorage.getItem("nida_linked_child");
      const child = childData ? JSON.parse(childData) : null;
      if (!child?.email) { toast.error("Övlad hesabı tapılmadı."); return; }
      await apiPayMonthly(child.email, pkg.price, new Date().toISOString().slice(0, 7), `${pkg.label} aylıq paket`);
      toast.success(`"${pkg.label}" paketi aktivləşdirildi!`);
      loadBalance();
      loadHistory();
    } catch (err) {
      toast.error(err.message || "Ödəniş zamanı xəta baş verdi.");
    } finally {
      setProcessing(false);
    }
  };

  const fmtDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("az-AZ", { day: "2-digit", month: "short", year: "numeric" });
  };

  const fmtAmount = (h) => {
    const isTopup = h.type === "BALANCE_TOP_UP";
    const sign = isTopup ? "+" : "-";
    return `${sign}${Number(h.amount ?? 0).toFixed(2)} AZN`;
  };

  const amountColor = (h) => h.type === "BALANCE_TOP_UP" ? "var(--success)" : "var(--accent)";

  const TABS = [
    { id: "overview",  label: "Baxış" },
    { id: "topup",     label: "Balans" },
    { id: "packages",  label: "Paketlər" },
  ];

  const displayBalance = balance ?? 0;
  const pkg = PACKAGES.find(p => p.id === selPackage);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Toaster position="top-center" toastOptions={{
        style: { background: "rgba(20,20,40,0.95)", backdropFilter: "blur(20px)",
          color: "#fff", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 12 }
      }} />
      <FloatingOrbs />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* Balans kartı */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            className="hero-card"
          >
            <p style={{ color: "var(--text-2)", fontSize: 12, marginBottom: 6 }}>Mövcud balans</p>
            <div style={{
              fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 38,
              color: "var(--text-1)", lineHeight: 1, marginBottom: 8,
            }}>
              {loadingBal
                ? <span className="spinner" style={{ width: 28, height: 28, display: "inline-block" }} />
                : <>{displayBalance.toFixed(2)} <span style={{ fontSize: 18, color: "var(--text-3)", fontWeight: 600 }}>AZN</span></>
              }
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge badge-success">Aktiv hesab</span>
            </div>
          </motion.div>

          {/* Tab seçimi */}
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "9px 6px", borderRadius: 10,
                background: tab === t.id ? "var(--primary)" : "transparent",
                border: "none", cursor: "pointer",
                color: tab === t.id ? "#fff" : "var(--text-3)",
                fontWeight: 600, fontSize: 13, transition: "all 0.3s var(--spring)",
                boxShadow: tab === t.id ? "0 4px 14px var(--glow)" : "none",
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── Overview tab ── */}
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p className="label">Ödəniş tarixçəsi</p>
              {loadingHist ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                  <span className="spinner" style={{ width: 24, height: 24 }} />
                </div>
              ) : history.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: 28 }}>
                  <p style={{ color: "var(--text-3)", fontSize: 13 }}>Tarixçə yoxdur</p>
                </div>
              ) : (
                <div className="card" style={{ padding: "8px 16px" }}>
                  {history.map((h, i) => (
                    <div key={h.id ?? i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: i < history.length - 1 ? "0.5px solid var(--border)" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: h.type === "BALANCE_TOP_UP" ? "rgba(0,206,201,0.1)" : "rgba(108,99,255,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        }}>
                          {h.type === "BALANCE_TOP_UP" ? "💰" : "📦"}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>
                            {h.description || (h.type === "BALANCE_TOP_UP" ? "Balans artırma" : "Aylıq paket")}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-3)" }}>{fmtDate(h.createdAt)}</p>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: amountColor(h) }}>
                        {fmtAmount(h)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Top-up tab ── */}
          {tab === "topup" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p className="label">Məbləği seçin</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {TOP_UP_AMOUNTS.map(a => (
                  <button key={a}
                    onClick={() => { setTopUpAmount(a); setCustomAmount(""); }}
                    style={{
                      padding: "12px 6px", borderRadius: 12, cursor: "pointer",
                      background: topUpAmount === a && !customAmount
                        ? "color-mix(in srgb, var(--primary) 20%, transparent)" : "var(--bg-card)",
                      border: topUpAmount === a && !customAmount
                        ? "0.5px solid var(--primary)" : "0.5px solid var(--border)",
                      color: topUpAmount === a && !customAmount ? "var(--accent)" : "var(--text-2)",
                      fontWeight: 700, fontSize: 14, transition: "all 0.3s var(--spring)",
                    }}
                  >{a} ₼</button>
                ))}
              </div>
              <div>
                <label className="label" style={{ marginBottom: 6 }}>Özəl məbləğ (AZN)</label>
                <input type="number" className="input" min="1"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setTopUpAmount(0); }}
                  placeholder="məs: 35"
                />
              </div>
              <div className="card" style={{ background: "rgba(0,206,201,0.06)", border: "0.5px solid rgba(0,206,201,0.2)" }}>
                <p style={{ color: "var(--text-2)", fontSize: 13 }}>
                  Əlavə olunacaq: <strong style={{ color: "var(--success)", fontSize: 16 }}>
                    {effectiveTopUp || 0} AZN
                  </strong>
                </p>
                <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>
                  Yeni balans: <strong style={{ color: "var(--text-1)" }}>
                    {(displayBalance + (effectiveTopUp || 0)).toFixed(2)} AZN
                  </strong>
                </p>
              </div>
              <motion.button
                onClick={handleTopUp} disabled={processing}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                className="btn btn-primary btn-full"
              >
                {processing ? <span className="spinner" style={{ width: 18, height: 18 }} /> : "💳 Balansı artır"}
              </motion.button>
            </motion.div>
          )}

          {/* ── Packages tab ── */}
          {tab === "packages" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PACKAGES.map(p => (
                <button key={p.id} onClick={() => setSelPackage(p.id)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 18px", borderRadius: 16, cursor: "pointer",
                  background: selPackage === p.id ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--bg-card)",
                  border: selPackage === p.id ? "0.5px solid var(--primary)" : "0.5px solid var(--border)",
                  boxShadow: selPackage === p.id ? "0 6px 20px var(--glow)" : "none",
                  transition: "all 0.35s var(--spring)", textAlign: "left", width: "100%",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>
                        {p.label}
                      </span>
                      {p.badge && <span className="badge badge-primary" style={{ fontSize: 10 }}>{p.badge}</span>}
                    </div>
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>{p.desc}</span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20,
                      color: selPackage === p.id ? "var(--accent)" : "var(--text-1)",
                    }}>{p.price} ₼</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>/ ay</div>
                  </div>
                </button>
              ))}

              <div style={{ height: "0.5px", background: "var(--border)" }} />

              <div className="card" style={{
                background: displayBalance >= (pkg?.price ?? 0) ? "rgba(0,206,201,0.06)" : "rgba(226,75,74,0.06)",
                border: displayBalance >= (pkg?.price ?? 0) ? "0.5px solid rgba(0,206,201,0.2)" : "0.5px solid rgba(226,75,74,0.2)",
              }}>
                <p style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Cari balans: <strong style={{ color: "var(--text-1)" }}>{displayBalance.toFixed(2)} AZN</strong>
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
                  Paket qiyməti: <strong style={{ color: "var(--accent)" }}>{pkg?.price ?? 0} AZN</strong>
                </p>
              </div>

              <motion.button
                onClick={handleBuyPackage} disabled={processing}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                className="btn btn-primary btn-full"
              >
                {processing ? <span className="spinner" style={{ width: 18, height: 18 }} /> : "📦 Paketi aktivləşdir"}
              </motion.button>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

