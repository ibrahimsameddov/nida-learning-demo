// @ts-nocheck
﻿import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/features/auth/store/authContext';
import { saveGroupSelection } from "../services/firebase";
import toast, { Toaster } from "react-hot-toast";
import clsx from "clsx";

const GROUPS = [
  {
    id:       "group1",
    label:    "I Qrup",
    color:    "blue",
    field:    "Mühəndislik · IT · Texniki",
    subjects: "Riyaziyyat · Fizika · Kimya",
  },
  {
    id:       "group2",
    label:    "II Qrup",
    color:    "green",
    field:    "İqtisadiyyat · Biznes",
    subjects: "Riyaziyyat · Coğrafiya · Tarix",
  },
  {
    id:       "group3",
    label:    "III Qrup",
    color:    "amber",
    field:    "Hüquq · Müəllimlik · Humanitar",
    subjects: "Azərbaycan dili · Tarix · Ədəbiyyat",
  },
  {
    id:       "group4",
    label:    "IV Qrup",
    color:    "red",
    field:    "Tibb · Stomatologiya · Biologiya",
    subjects: "Biologiya · Kimya · Fizika",
  },
];

const COLOR_MAP = {
  blue:  { border: "border-blue-500/40",  bg: "bg-blue-500/10",  text: "text-blue-400"  },
  green: { border: "border-green-500/40", bg: "bg-green-500/10", text: "text-green-400" },
  amber: { border: "border-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-400" },
  red:   { border: "border-red-500/40",   bg: "bg-red-500/10",   text: "text-red-400"   },
};

export default function GroupSelection() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { currentUser, refreshProfile } = useAuth();

  const handleConfirm = async () => {
    if (!selected) {
      toast.error("Zəhmət olmasa qrup seçin.");
      return;
    }
    setLoading(true);
    try {
      const uid = currentUser?.uid || localStorage.getItem("nida_uid");
      await saveGroupSelection(uid, selected);
      await refreshProfile();
      toast.success("Qrup seçildi!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Xəta baş verdi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      <Toaster position="top-center" />

      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-5xl text-white tracking-tight">Nida</h1>
        <p className="text-white/40 font-body text-sm mt-2 tracking-widest uppercase">Gələcəyə səsləniş</p>
      </div>

      <div className="w-full max-w-2xl">
        {/* Addım göstəricisi */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {["Sinif", "Test", "Forum", "Nəticə", "Qrup"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={clsx(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                i <= 4
                  ? i < 4 ? "bg-brand-600 text-white" : "bg-brand-600 text-white"
                  : "bg-surface-muted text-white/30"
              )}>
                {i < 4 ? "✓" : "5"}
              </div>
              {i < 4 && <div className={clsx("w-6 h-0.5", i < 4 ? "bg-brand-600" : "bg-surface-border")} />}
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="font-display font-bold text-2xl text-white mb-2 text-center">
            İxtisas qrupunu seçin
          </h2>
          <p className="text-white/40 text-sm font-body mb-8 text-center">
            Universitetdə oxumaq istədiyiniz sahəyə uyğun qrup seçin
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {GROUPS.map((group) => {
              const colors = COLOR_MAP[group.color];
              return (
                <button
                  key={group.id}
                  onClick={() => setSelected(group.id)}
                  className={clsx(
                    "p-5 rounded-2xl border text-left transition-all duration-200",
                    selected === group.id
                      ? `${colors.border} ${colors.bg}`
                      : "border-surface-border bg-surface-muted hover:border-surface-border/80"
                  )}
                >
                  <div className={clsx(
                    "font-display font-bold text-lg mb-1",
                    selected === group.id ? colors.text : "text-white"
                  )}>
                    {group.label}
                  </div>
                  <div className="text-white/40 text-xs mb-2">{group.field}</div>
                  <div className="text-white/30 text-xs">{group.subjects}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading || !selected}
            className="btn-primary w-full"
          >
            {loading ? "Saxlanılır..." : "Təsdiqlə və davam et →"}
          </button>
        </div>
      </div>
    </div>
  );
}
