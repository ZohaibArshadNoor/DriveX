/**
 * DriveX — AdminUsers.jsx
 * Place at: src/pages/admin/AdminUsers.jsx
 * Route: /admin/users  (admin only)
 *
 * Enhanced: larger text, click‑row modal with full user info + actions.
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

function Avatar({ name, size = 48 }) {
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

/* ── Modal Overlay ─────────────────────────────────────── */
function UserDetailModal({ user, onClose, onSuspend, onVerify, pending }) {
  if (!user) return null;

  const isPending = pending.suspend || pending.verify;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 500,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          fontFamily: "'Rajdhani', sans-serif",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", color: T.gray3,
            fontSize: 22, cursor: "pointer", lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Avatar name={user.full_name} size={56} />
          <div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 28, fontWeight: 900, color: T.white,
              letterSpacing: -0.3, marginBottom: 4,
            }}>
              {user.full_name}
            </h2>
            <div style={{ fontSize: 13, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>
              ID #{user.id}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <InfoField label="Email" value={user.email} />
          <InfoField label="Phone" value={user.phone || "—"} />
          <InfoField label="Account" value={
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: user.is_suspended ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${user.is_suspended ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
              color: user.is_suspended ? T.red : T.green,
            }}>
              {user.is_suspended ? "Suspended" : "Active"}
            </span>
          } />
          <InfoField label="Document" value={
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: user.is_verified ? "rgba(6,182,212,0.1)" : "rgba(100,116,139,0.1)",
              border: `1px solid ${user.is_verified ? "rgba(6,182,212,0.25)" : "rgba(100,116,139,0.2)"}`,
              color: user.is_verified ? T.primary : T.gray5,
            }}>
              {user.is_verified ? "Verified" : "Unverified"}
            </span>
          } />
          <InfoField label="Joined" value={new Date(user.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" })} />
        </div>

        {/* Admin notes */}
        {user.admin_notes && (
          <div style={{
            padding: "12px 16px", borderRadius: 10,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
            marginBottom: 24, fontSize: 13, color: T.amber,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>📝 Admin Note</div>
            {user.admin_notes}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              const action = user.is_suspended ? "unsuspend" : "suspend";
              let note = null;
              if (!user.is_suspended) {
                note = window.prompt("Optional reason for suspension:", "");
                if (note === null) return;
              }
              if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.full_name}?`)) {
                onSuspend({ id: user.id, admin_notes: note || undefined });
              }
            }}
            disabled={isPending}
            style={{
              flex: 1, padding: "12px",
              fontSize: 14, fontWeight: 800, borderRadius: 10, border: "none",
              cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
              background: user.is_suspended ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${user.is_suspended ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
              color: user.is_suspended ? T.green : T.red,
              transition: "opacity 0.2s",
            }}
          >
            {user.is_suspended ? "✓ Unsuspend" : "⊘ Suspend"}
          </button>
          <button
            onClick={() => {
              const newStatus = !user.is_verified;
              if (window.confirm(`Mark ${user.full_name} as ${newStatus ? "verified" : "unverified"}?`)) {
                onVerify({ id: user.id, is_verified: newStatus });
              }
            }}
            disabled={isPending}
            style={{
              flex: 1, padding: "12px",
              fontSize: 14, fontWeight: 800, borderRadius: 10, border: "none",
              cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
              background: user.is_verified ? "rgba(100,116,139,0.15)" : "rgba(34,197,94,0.15)",
              border: `1px solid ${user.is_verified ? "rgba(100,116,139,0.25)" : "rgba(34,197,94,0.3)"}`,
              color: user.is_verified ? T.gray5 : T.green,
              transition: "opacity 0.2s",
            }}
          >
            {user.is_verified ? "✕ Unverify" : "✓ Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: T.gray5, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </div>
      <div style={{ fontSize: 15, color: T.white, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
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
    mutationFn: ({ id, admin_notes }) => {
      const body = admin_notes ? { admin_notes } : {};
      return api.patch(`/admin/users/${id}/suspend`, body);
    },
    onSuccess: (res) => {
      const data = res.data?.data || res.data;
      const msg = data?.is_suspended ? "User suspended." : "User unsuspended.";
      toast.success(msg, { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setSelectedUser(null); // close modal after action
    },
    onError: (e) => toast.error(e.response?.data?.message || "Action failed"),
  });

  const toggleVerify = useMutation({
    mutationFn: ({ id, is_verified }) =>
      api.patch(`/admin/users/${id}/verify`, { is_verified }),
    onSuccess: (res) => {
      const data = res.data?.data || res.data;
      const msg = data?.is_verified ? "User marked as verified." : "User marked as unverified.";
      toast.success(msg, { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setSelectedUser(null); // close modal after action
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
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontSize: 14, color: T.primary, letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            Admin Panel
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(44px,6vw,60px)", fontWeight: 900,
            color: T.white, letterSpacing: -1, lineHeight: 1, marginBottom: 8,
          }}>
            User Management
          </h1>
          <p style={{ fontSize: 16, color: T.gray5 }}>Click a user row to see full details and manage access.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Customers", value: counts.total,     color: T.primary },
            { label: "Active",          value: counts.active,    color: T.green   },
            { label: "Suspended",       value: counts.suspended, color: T.red     },
            { label: "Doc Verified",    value: counts.verified,  color: T.indigo  },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: "24px 22px", borderRadius: 16, background: T.bgCard, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 46, fontWeight: 900, color, letterSpacing: -1, lineHeight: 1, marginBottom: 6 }}>{value}</div>
              <div style={{ fontSize: 15, color: T.gray5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter panel */}
        <div style={{ marginBottom: 28, padding: "22px 24px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16 }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.35 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, email, or phone..."
              style={{
                width: "100%", padding: "14px 18px 14px 44px", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${searchFocused ? T.primary : T.border}`,
                borderRadius: 10, color: T.white, fontSize: 16,
                fontFamily: "'Rajdhani', sans-serif", transition: "border-color 0.2s",
              }} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { key: "all",        label: `All (${counts.total})` },
              { key: "active",     label: `Active (${counts.active})` },
              { key: "suspended",  label: `Suspended (${counts.suspended})` },
              { key: "verified",   label: `Doc Verified (${counts.verified})` },
              { key: "unverified", label: `Not Verified (${customers.length - counts.verified})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilterStatus(key)} style={{
                padding: "8px 18px", fontSize: 14, fontWeight: 700, borderRadius: 24,
                border: `1px solid ${filterStatus === key ? "rgba(6,182,212,0.5)" : T.border}`,
                background: filterStatus === key ? "rgba(6,182,212,0.12)" : "transparent",
                color: filterStatus === key ? T.primary : T.gray3,
                cursor: "pointer", transition: "all 0.18s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Users table (larger) */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
            <div style={{ width: 56, height: 56, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 1fr 180px",
              gap: 0, padding: "18px 24px",
              borderBottom: `1px solid ${T.border}`,
              background: "rgba(6,182,212,0.04)",
            }}>
              {["Customer", "Email", "Phone", "Account", "Doc Status", "Joined", "Actions"].map(h => (
                <div key={h} style={{ fontSize: 12, color: T.gray5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div ref={listRef}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", color: T.gray5 }}>
                  <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.2 }}>👥</div>
                  <div style={{ fontSize: 18, color: T.gray3 }}>No users match your search</div>
                </div>
              ) : (
                filtered.map((u, idx) => (
                  <div
                    key={u.id} data-urow
                    onClick={() => setSelectedUser(u)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 1fr 180px",
                      gap: 0, padding: "20px 24px", alignItems: "center",
                      borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                      background: u.is_suspended ? "rgba(239,68,68,0.02)" : "transparent",
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = u.is_suspended ? "rgba(239,68,68,0.04)" : "rgba(6,182,212,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = u.is_suspended ? "rgba(239,68,68,0.02)" : "transparent"}
                  >
                    {/* Name + Avatar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <Avatar name={u.full_name} size={44} />
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: T.white }}>{u.full_name}</div>
                        <div style={{ fontSize: 12, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>ID #{u.id}</div>
                      </div>
                    </div>
                    {/* Email */}
                    <div style={{ fontSize: 15, color: T.gray3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                    {/* Phone */}
                    <div style={{ fontSize: 15, color: T.gray5 }}>{u.phone || "—"}</div>
                    {/* Account status */}
                    <div>
                      <span style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
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
                        padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                        background: u.is_verified ? "rgba(6,182,212,0.1)" : "rgba(100,116,139,0.1)",
                        border: `1px solid ${u.is_verified ? "rgba(6,182,212,0.25)" : "rgba(100,116,139,0.2)"}`,
                        color: u.is_verified ? T.primary : T.gray5,
                      }}>
                        {u.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    {/* Joined */}
                    <div style={{ fontSize: 14, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(u.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    {/* Actions buttons (stop propagation to prevent row click) */}
                    <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          const action = u.is_suspended ? "unsuspend" : "suspend";
                          let note = null;
                          if (!u.is_suspended) {
                            note = window.prompt("Optional reason for suspension:", "");
                            if (note === null) return;
                          }
                          if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${u.full_name}?`)) {
                            toggleSuspend.mutate({ id: u.id, admin_notes: note || undefined });
                          }
                        }}
                        disabled={toggleSuspend.isPending}
                        style={{
                          padding: "8px 12px", fontSize: 12, fontWeight: 800, borderRadius: 8, border: "none",
                          cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
                          background: u.is_suspended ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                          border: `1px solid ${u.is_suspended ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
                          color: u.is_suspended ? T.green : T.red,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        {u.is_suspended ? "✓ Unsuspend" : "⊘ Suspend"}
                      </button>
                      <button
                        onClick={() => {
                          const newStatus = !u.is_verified;
                          if (window.confirm(`Mark ${u.full_name} as ${newStatus ? "verified" : "unverified"}?`)) {
                            toggleVerify.mutate({ id: u.id, is_verified: newStatus });
                          }
                        }}
                        disabled={toggleVerify.isPending}
                        style={{
                          padding: "8px 12px", fontSize: 12, fontWeight: 800, borderRadius: 8, border: "none",
                          cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
                          background: u.is_verified ? "rgba(100,116,139,0.15)" : "rgba(34,197,94,0.15)",
                          border: `1px solid ${u.is_verified ? "rgba(100,116,139,0.25)" : "rgba(34,197,94,0.3)"}`,
                          color: u.is_verified ? T.gray5 : T.green,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        {u.is_verified ? "✕ Unverify" : "✓ Verify"}
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
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: T.gray5 }}>
            Showing <span style={{ color: T.white, fontWeight: 700 }}>{filtered.length}</span> of{" "}
            <span style={{ color: T.white, fontWeight: 700 }}>{customers.length}</span> customers
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSuspend={(args) => toggleSuspend.mutate(args)}
        onVerify={(args) => toggleVerify.mutate(args)}
        pending={{ suspend: toggleSuspend.isPending, verify: toggleVerify.isPending }}
      />
    </div>
  );
}