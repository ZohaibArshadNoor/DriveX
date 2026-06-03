/**
 * DriveX — AdminDocuments.jsx
 * Place at: src/pages/admin/AdminDocuments.jsx
 * Route: /admin/documents  (admin only)
 *
 * Enlarged: larger text, spacious cards, clearer actions
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
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
};

const VS = {
  pending:  { color: T.amber, bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Pending Review" },
  approved: { color: T.green, bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)",  label: "Approved"      },
  rejected: { color: T.red,   bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  label: "Rejected"      },
};

function getFileUrl(filePath) {
  if (!filePath) return "#";
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "").trim();
  const apiBase = api.defaults.baseURL || "";
  const root = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${root}/${normalized}`;
}

function isImage(filePath) {
  if (!filePath) return false;
  const ext = filePath.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

export default function AdminDocuments() {
  const [filter, setFilter] = useState("pending");
  const qc = useQueryClient();
  const listRef = useRef(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["admin-all-documents"],
    queryFn: () => api.get("/admin/documents").then(r => r.data?.data || []),
    staleTime: 15_000,
  });

  const filtered = docs.filter(d => {
    if (filter === "all") return true;
    return d.verification_status === filter;
  });

  useEffect(() => {
    if (!listRef.current || isLoading) return;
    gsap.fromTo(listRef.current.querySelectorAll("[data-dcard]"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.45, ease: "power2.out" }
    );
  }, [filtered.length, filter, isLoading]);

  const verifyMutation = useMutation({
    mutationFn: ({ docId, status, notes }) =>
      api.patch(`/documents/${docId}/verify`, {
        verification_status: status,
        admin_notes: notes || null,
      }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "approved"
          ? "Document approved! User can now book."
          : "Document rejected.",
        { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }
      );
      qc.invalidateQueries({ queryKey: ["admin-all-documents"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const counts = {
    all:      docs.length,
    pending:  docs.filter(d => d.verification_status === "pending").length,
    approved: docs.filter(d => d.verification_status === "approved").length,
    rejected: docs.filter(d => d.verification_status === "rejected").length,
  };

  return (
    <div style={{
      background: T.bg, minHeight: "100vh", paddingTop: 80,
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 8vw 80px" }}>

        {/* Header – larger */}
        <div style={{ marginBottom: 44 }}>
          <div style={{
            fontSize: 14, color: T.primary, letterSpacing: 4,
            fontWeight: 700, textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace", marginBottom: 10,
          }}>
            Admin Panel
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(44px,6vw,60px)", fontWeight: 900,
            color: T.white, letterSpacing: -1, lineHeight: 1,
            marginBottom: 8,
          }}>
            Document Verification
            {counts.pending > 0 && (
              <span style={{
                marginLeft: 16, padding: "5px 16px", borderRadius: 24,
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
                color: T.amber, fontSize: 18, fontWeight: 700, verticalAlign: "middle",
              }}>
                {counts.pending} pending
              </span>
            )}
          </h1>
          <p style={{ fontSize: 16, color: T.gray5 }}>
            Review and verify customer driver's licenses before they can book.
          </p>
        </div>

        {/* Stats – bigger */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 18, marginBottom: 32,
        }}>
          {[
            { label: "Total",    value: counts.all,      color: T.primary },
            { label: "Pending",  value: counts.pending,  color: T.amber   },
            { label: "Approved", value: counts.approved, color: T.green   },
            { label: "Rejected", value: counts.rejected, color: T.red     },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: "24px 22px", borderRadius: 16,
              background: T.bgCard, border: `1px solid ${T.border}`,
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 46, fontWeight: 900, color,
                letterSpacing: -1, lineHeight: 1, marginBottom: 6,
              }}>
                {value}
              </div>
              <div style={{ fontSize: 15, color: T.gray5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs – larger */}
        <div style={{
          marginBottom: 28, padding: "18px 22px",
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 14, display: "flex", gap: 10, flexWrap: "wrap",
        }}>
          {[
            { key: "pending",  label: `Pending (${counts.pending})`,   color: T.amber },
            { key: "approved", label: `Approved (${counts.approved})`, color: T.green },
            { key: "rejected", label: `Rejected (${counts.rejected})`, color: T.red   },
            { key: "all",      label: `All (${counts.all})`,           color: T.primary },
          ].map(({ key, label, color }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "10px 22px", fontSize: 14, fontWeight: 700,
              borderRadius: 24,
              border: `1px solid ${filter === key ? `${color}55` : T.border}`,
              background: filter === key ? `${color}18` : "transparent",
              color: filter === key ? color : T.gray3,
              cursor: "pointer", transition: "all 0.18s",
            }}>{label}</button>
          ))}
        </div>

        {/* Documents list – larger cards */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
            <div style={{
              width: 56, height: 56,
              border: `2px solid ${T.border}`, borderTopColor: T.primary,
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: T.gray5 }}>
            <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.2 }}>🪪</div>
            <div style={{ fontSize: 22, color: T.gray3 }}>No {filter} documents</div>
          </div>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {filtered.map((doc) => {
              const vs = VS[doc.verification_status] || VS.pending;
              const user = doc.user || {};
              const fileUrl = getFileUrl(doc.file_path);
              const imgPreview = isImage(doc.file_path);

              return (
                <div key={doc.id} data-dcard style={{
                  padding: "26px 26px", borderRadius: 16,
                  background: T.bgCard, border: `1px solid ${T.border}`,
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", flexWrap: "wrap", gap: 20,
                  }}>
                    {/* Left: thumbnail + user info – larger */}
                    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                      {/* Document thumbnail – bigger */}
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{
                        width: 100, height: 75, borderRadius: 12, overflow: "hidden",
                        background: "#080c18", border: `1px solid ${T.border}`,
                        flexShrink: 0, display: "flex", alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {imgPreview
                          ? <img src={fileUrl} alt="doc" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ fontSize: 28, opacity: 0.2 }}>📄</div>
                        }
                      </a>

                      {/* User + document info – larger fonts */}
                      <div>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 22, fontWeight: 900, color: T.white,
                          letterSpacing: -0.3, marginBottom: 4,
                        }}>
                          {user.full_name || "Unknown"}
                        </div>
                        <div style={{ fontSize: 15, color: T.gray3, marginBottom: 6 }}>
                          {user.email}
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{
                            padding: "3px 12px", borderRadius: 14, fontSize: 12, fontWeight: 700,
                            textTransform: "uppercase",
                            background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
                            color: T.primary,
                          }}>
                            {doc.document_type?.replace("_", " ")}
                          </span>
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{
                            fontSize: 13, color: T.primary, textDecoration: "none",
                            fontWeight: 600,
                          }}>
                            View File ↗
                          </a>
                          <span style={{ fontSize: 13, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>
                            Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        {doc.admin_notes && (
                          <div style={{
                            marginTop: 10, padding: "8px 14px", borderRadius: 10,
                            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                            fontSize: 14, color: T.amber,
                          }}>
                            💬 {doc.admin_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status + Actions – larger buttons */}
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "flex-end", gap: 12,
                    }}>
                      <span style={{
                        padding: "6px 16px", borderRadius: 22,
                        fontSize: 13, fontWeight: 700, letterSpacing: 1,
                        textTransform: "uppercase",
                        background: vs.bg, border: `1px solid ${vs.border}`,
                        color: vs.color,
                      }}>
                        {vs.label}
                      </span>

                      {doc.verification_status === "pending" && (
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={() => verifyMutation.mutate({ docId: doc.id, status: "approved" })}
                            disabled={verifyMutation.isPending}
                            style={{
                              padding: "11px 22px", fontSize: 14, fontWeight: 800,
                              borderRadius: 10,
                              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)",
                              color: T.green, cursor: "pointer",
                              fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.25)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(34,197,94,0.15)"}
                          >✓ Approve</button>
                          <button
                            onClick={() => {
                              const notes = window.prompt("Rejection reason (shown to customer):", "");
                              if (notes === null) return;
                              verifyMutation.mutate({ docId: doc.id, status: "rejected", notes: notes || "Document not acceptable" });
                            }}
                            disabled={verifyMutation.isPending}
                            style={{
                              padding: "11px 22px", fontSize: 14, fontWeight: 800,
                              borderRadius: 10,
                              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                              color: T.red, cursor: "pointer",
                              fontFamily: "'Rajdhani', sans-serif",
                            }}
                          >✕ Reject</button>
                        </div>
                      )}

                      {doc.verification_status === "rejected" && (
                        <button
                          onClick={() => verifyMutation.mutate({ docId: doc.id, status: "approved" })}
                          disabled={verifyMutation.isPending}
                          style={{
                            padding: "9px 18px", fontSize: 13, fontWeight: 700,
                            borderRadius: 10,
                            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                            color: T.green, cursor: "pointer",
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >↺ Approve Instead</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}