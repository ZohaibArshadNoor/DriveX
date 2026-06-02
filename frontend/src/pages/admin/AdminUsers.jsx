/**
 * DriveX — AdminUsers.jsx
 * Place at: src/pages/admin/AdminUsers.jsx
 * Route: /admin/users  (admin only)
 *
 * Features:
 * - View all registered customers
 * - Search by name / email
 * - Suspend / Unsuspend accounts
 * - Shows document verification status per user
 * - Shows booking count per user
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";

const T = {
  bg: "#05070f", bgCard: "#0a0f1a",
  border: "rgba(255,255,255,0.10)", primary: "#06b6d4",
  white: "#ffffff", gray3: "#cbd5e1", gray5: "#64748b",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444", indigo: "#818cf8",
};

function Avatar({ name, size = 40 }) {
  const initials = name
    ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const colors = [T.primary, T.green, T.indigo, T.amber];
  const color = colors[name?.charCodeAt(0) % colors.length] || T.primary;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `${color}22`, border: `1px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: size * 0.38, fontWeight: 900, color, flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const qc = useQueryClient();
  const listRef = useRef(null);

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then(r => r.data?.data || []),
    staleTime: 30_000,
  });

  const customers = raw.filter(u => u.role === "customer");

  const filtered = customers.filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active"    && !u.is_suspended) ||
      (filterStatus === "suspended" &&  u.is_suspended) ||
      (filterStatus === "verified"  &&  u.is_verified)  ||
      (filterStatus === "unverified"&& !u.is_verified);
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    if (!listRef.current || isLoading) return;
    gsap.fromTo(listRef.current.querySelectorAll("[data-urow]"),
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, stagger: 0.04, duration: 0.45, ease: "power2.out" }
    );
  }, [filtered.length, filterStatus, search, isLoading]);

  const toggleSuspend = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/suspend`),
    onSuccess: (res) => {
      const msg = res.data?.data?.is_suspended ? "User suspended." : "User unsuspended.";
      toast.success(msg, { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Action failed"),
  });

  const counts = {
    total:     customers.length,
    active:    customers.filter(u => !u.is_suspended).length,
    suspended: customers.filter(u =>  u.is_suspended).length,
    verified:  customers.filter(u =>  u.is_verified).length,
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 80, fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(148,163,184,0.4); }
        input:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 8vw 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, color: T.primary, letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>Admin Panel</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(36px,5vw,52px)", fontWeight: 900, color: T.white, letterSpacing: -0.8, lineHeight: 1, marginBottom: 4 }}>
            User Management
          </h1>
          <p style={{ fontSize: 14, color: T.gray5 }}>Manage customer accounts, verifications, and access.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total Customers", value: counts.total,     color: T.primary },
            { label: "Active",          value: counts.active,    color: T.green   },
            { label: "Suspended",       value: counts.suspended, color: T.red     },
            { label: "Doc Verified",    value: counts.verified,  color: T.indigo  },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: "20px 18px", borderRadius: 14, background: T.bgCard, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 900, color, letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 13, color: T.gray5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter panel */}
        <div style={{ marginBottom: 24, padding: "18px 20px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14 }}>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.35 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, email, or phone..."
              style={{
                width: "100%", padding: "11px 14px 11px 38px", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${searchFocused ? T.primary : T.border}`,
                borderRadius: 8, color: T.white, fontSize: 14,
                fontFamily: "'Rajdhani', sans-serif", transition: "border-color 0.2s",
              }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "all",        label: `All (${counts.total})`         },
              { key: "active",     label: `Active (${counts.active})`     },
              { key: "suspended",  label: `Suspended (${counts.suspended})` },
              { key: "verified",   label: `Doc Verified (${counts.verified})` },
              { key: "unverified", label: `Not Verified (${customers.length - counts.verified})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilterStatus(key)} style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 700, borderRadius: 20,
                border: `1px solid ${filterStatus === key ? "rgba(6,182,212,0.4)" : T.border}`,
                background: filterStatus === key ? "rgba(6,182,212,0.12)" : "transparent",
                color: filterStatus === key ? T.primary : T.gray3,
                cursor: "pointer", transition: "all 0.18s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Users table */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 44, height: 44, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 140px",
              gap: 0, padding: "12px 20px",
              borderBottom: `1px solid ${T.border}`,
              background: "rgba(6,182,212,0.04)",
            }}>
              {["Customer", "Email", "Phone", "Account", "Doc Status", "Joined", "Action"].map(h => (
                <div key={h} style={{ fontSize: 10, color: T.gray5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div ref={listRef}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: T.gray5 }}>
                  <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>👥</div>
                  <div style={{ fontSize: 16, color: T.gray3 }}>No users match your search</div>
                </div>
              ) : (
                filtered.map((u, idx) => (
                  <div key={u.id} data-urow style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 140px",
                    gap: 0, padding: "16px 20px", alignItems: "center",
                    borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                    background: u.is_suspended ? "rgba(239,68,68,0.02)" : "transparent",
                    transition: "background 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = u.is_suspended ? "rgba(239,68,68,0.04)" : "rgba(6,182,212,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = u.is_suspended ? "rgba(239,68,68,0.02)" : "transparent"}
                  >
                    {/* Name + Avatar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={u.full_name} size={38} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.white }}>{u.full_name}</div>
                        <div style={{ fontSize: 10, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>ID #{u.id}</div>
                      </div>
                    </div>
                    {/* Email */}
                    <div style={{ fontSize: 13, color: T.gray3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                    {/* Phone */}
                    <div style={{ fontSize: 13, color: T.gray5 }}>{u.phone || "—"}</div>
                    {/* Account status */}
                    <div>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                        background: u.is_suspended ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                        border: `1px solid ${u.is_suspended ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
                        color: u.is_suspended ? T.red : T.green,
                      }}>
                        {u.is_suspended ? "Suspended" : "Active"}
                      </span>
                    </div>
                    {/* Doc verification */}
                    <div>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                        background: u.is_verified ? "rgba(6,182,212,0.1)" : "rgba(100,116,139,0.1)",
                        border: `1px solid ${u.is_verified ? "rgba(6,182,212,0.25)" : "rgba(100,116,139,0.2)"}`,
                        color: u.is_verified ? T.primary : T.gray5,
                      }}>
                        {u.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    {/* Joined */}
                    <div style={{ fontSize: 12, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(u.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    {/* Action */}
                    <div>
                      <button onClick={() => {
                        const action = u.is_suspended ? "unsuspend" : "suspend";
                        if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${u.full_name}?`)) {
                          toggleSuspend.mutate(u.id);
                        }
                      }}
                        disabled={toggleSuspend.isPending}
                        style={{
                          padding: "7px 14px", fontSize: 11, fontWeight: 800, borderRadius: 8, border: "none",
                          cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
                          background: u.is_suspended ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                          border: `1px solid ${u.is_suspended ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
                          color: u.is_suspended ? T.green : T.red,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        {u.is_suspended ? "✓ Unsuspend" : "⊘ Suspend"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Results count */}
        {!isLoading && filtered.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: T.gray5 }}>
            Showing <span style={{ color: T.white }}>{filtered.length}</span> of <span style={{ color: T.white }}>{customers.length}</span> customers
          </div>
        )}
      </div>
    </div>
  );
}