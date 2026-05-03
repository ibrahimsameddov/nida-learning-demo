// @ts-nocheck
﻿import { useState, useEffect } from "react";
import { useAuth } from '@/features/auth/store/authContext';
import {
  apiGetMyNotifications,
  apiGetUnreadNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiGetIncomingPermissions,
  apiRespondPermission,
} from '@/lib/api';
import FloatingOrbs from "../components/FloatingOrbs";
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import toast, { Toaster } from "react-hot-toast";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "İndicə";
  if (m < 60) return `${m} dəq əvvəl`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat əvvəl`;
  return `${Math.floor(h / 24)} gün əvvəl`;
}

const NOTIF_ICON = { exam: "📝", result: "📊", group: "👥" };

function NotificationItem({ notif, onRead }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "14px 16px",
      background: notif.read
        ? "var(--bg-card)"
        : "color-mix(in srgb, var(--primary) 8%, transparent)",
      border: `0.5px solid ${notif.read
        ? "var(--border)"
        : "color-mix(in srgb, var(--primary) 25%, transparent)"}`,
      borderRadius: 14,
      opacity: notif.read ? 0.65 : 1,
      transition: "all 0.3s var(--smooth)",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: notif.read
          ? "rgba(255,255,255,0.06)"
          : "color-mix(in srgb, var(--primary) 20%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>
        {NOTIF_ICON[notif.type] || "🔔"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5, marginBottom: 4 }}>
          {notif.message}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {notif.senderName && (
            <span style={{ color: "var(--text-3)", fontSize: 11 }}>{notif.senderName}</span>
          )}
          <span style={{ color: "var(--text-3)", fontSize: 11 }}>
            {timeAgo(notif.createdAt)}
          </span>
        </div>
      </div>

      {!notif.read && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
          <button
            onClick={() => onRead(notif.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 14, transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
          >✓</button>
        </div>
      )}
    </div>
  );
}

function PermissionItem({ perm, onRespond, respondingId }) {
  const busy = respondingId === perm.id;
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12,
      padding: "14px 16px",
      background: "color-mix(in srgb, var(--primary) 8%, transparent)",
      border: "0.5px solid color-mix(in srgb, var(--primary) 25%, transparent)",
      borderRadius: 14,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "color-mix(in srgb, var(--primary) 20%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          🔐
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5, marginBottom: 4 }}>
            <strong>{perm.senderName}</strong> sizin{" "}
            <strong>{perm.subject}</strong> fənni üzrə nəticələrinizə baxmaq
            üçün icazə sorğusu göndərdi.
          </p>
          <span style={{ color: "var(--text-3)", fontSize: 11 }}>
            {timeAgo(perm.createdAt)}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, paddingLeft: 50 }}>
        <button
          onClick={() => onRespond(perm.id, true)}
          disabled={busy}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
            background: "color-mix(in srgb, #22c55e 20%, transparent)",
            color: "#22c55e", fontSize: 13, fontWeight: 600,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1, transition: "opacity 0.2s",
          }}
        >
          {busy ? "..." : "Qəbul et"}
        </button>
        <button
          onClick={() => onRespond(perm.id, false)}
          disabled={busy}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
            background: "color-mix(in srgb, #ef4444 20%, transparent)",
            color: "#ef4444", fontSize: 13, fontWeight: 600,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1, transition: "opacity 0.2s",
          }}
        >
          {busy ? "..." : "Rədd et"}
        </button>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { userProfile } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [filter,         setFilter]        = useState("all");
  const [marking,        setMarking]       = useState(false);
  const [apiError,       setApiError]      = useState(null);

  const [permissions,  setPermissions]  = useState([]);
  const [permLoading,  setPermLoading]  = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  const isStudent = userProfile?.role?.toUpperCase() === "STUDENT";

  const loadNotifs = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = filter === "unread"
        ? await apiGetUnreadNotifications()
        : await apiGetMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setApiError(err.message || "Bildirişlər yüklənmədi.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    setPermLoading(true);
    try {
      const data = await apiGetIncomingPermissions();
      setPermissions(Array.isArray(data) ? data : []);
    } catch {
      setPermissions([]);
    } finally {
      setPermLoading(false);
    }
  };

  useEffect(() => {
    if (filter === "requests") {
      loadPermissions();
    } else {
      loadNotifs();
    }
  }, [filter]);

  const handleRead = async (id) => {
    try {
      await apiMarkNotificationRead(id);
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { toast.error("Xəta baş verdi."); }
  };

  const handleReadAll = async () => {
    setMarking(true);
    try {
      await apiMarkAllNotificationsRead();
      setNotifications(p => p.map(n => ({ ...n, read: true })));
      toast.success("Hamısı oxunmuş işarələndi.");
    } catch { toast.error("Xəta baş verdi."); }
    finally { setMarking(false); }
  };

  const handleRespond = async (permId, approved) => {
    setRespondingId(permId);
    try {
      await apiRespondPermission(permId, approved);
      setPermissions(p => p.filter(perm => perm.id !== permId));
      toast.success(approved ? "Sorğu qəbul edildi!" : "Sorğu rədd edildi.");
    } catch { toast.error("Xəta baş verdi."); }
    finally { setRespondingId(null); }
  };

  const unread    = notifications.filter(n => !n.read).length;
  const displayed = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  const tabs = [
    { id: "all",      label: "Hamısı" },
    { id: "unread",   label: "Oxunmamış" },
    ...(isStudent ? [{ id: "requests", label: `Sorğular${permissions.length > 0 ? ` (${permissions.length})` : ""}` }] : []),
  ];

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

          <div className="anim-fade-up" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20,
                color: "var(--text-1)", marginBottom: 2,
              }}>
                Bildirişlər
                {unread > 0 && filter !== "requests" && (
                  <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: 11 }}>
                    {unread} yeni
                  </span>
                )}
              </h1>
              <p style={{ color: "var(--text-3)", fontSize: 12 }}>
                Müəllim mesajları və sistem bildirişləri
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {unread > 0 && filter !== "requests" && (
                <button onClick={handleReadAll} disabled={marking} className="btn btn-secondary btn-sm">
                  {marking ? "..." : "Hamısını oxu"}
                </button>
              )}
              <button onClick={loadNotifs} disabled={loading} className="btn btn-secondary btn-sm">
                ↺
              </button>
            </div>
          </div>

          <div className="anim-fade-up d1" style={{ display: "flex", gap: 8 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className={`pill-tag${filter === tab.id ? " active" : ""}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Sorğular tabı ── */}
          {filter === "requests" && (
            permLoading ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 120, color: "var(--text-3)", fontSize: 13,
              }}>
                Yüklənir...
              </div>
            ) : permissions.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 10, padding: "48px 0", color: "var(--text-3)",
              }}>
                <span style={{ fontSize: 40 }}>🔐</span>
                <p style={{ fontSize: 13 }}>Gözləyən sorğu yoxdur</p>
              </div>
            ) : (
              <div className="anim-fade-up d2" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {permissions.map(perm => (
                  <PermissionItem
                    key={perm.id}
                    perm={perm}
                    onRespond={handleRespond}
                    respondingId={respondingId}
                  />
                ))}
              </div>
            )
          )}

          {/* ── API xəta ── */}
          {apiError && filter !== "requests" && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)",
              borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171",
            }}>
              ⚠ {apiError}
            </div>
          )}

          {/* ── Bildirişlər tabı ── */}
          {filter !== "requests" && (
            loading ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 120, color: "var(--text-3)", fontSize: 13,
              }}>
                Yüklənir...
              </div>
            ) : displayed.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 10, padding: "48px 0", color: "var(--text-3)",
              }}>
                <span style={{ fontSize: 40 }}>🔔</span>
                <p style={{ fontSize: 13 }}>
                  {filter === "unread" ? "Oxunmamış bildiriş yoxdur" : "Bildiriş yoxdur"}
                </p>
              </div>
            ) : (
              <div className="anim-fade-up d2" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {displayed.map(n => (
                  <NotificationItem key={n.id} notif={n} onRead={handleRead} />
                ))}
              </div>
            )
          )}

        </div>
      </main>
    </div>
  );
}

