/**
 * DriveX — DocumentsPage.jsx
 * Place at: src/pages/user/DocumentsPage.jsx
 * Route: /documents  (protected — customer)
 */

import { useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";

const T = {
  bg: "#05070f",
  bgCard: "#0d1117",
  border: "rgba(255,255,255,0.08)",
  primary: "#06b6d4",
  white: "#ffffff",
  gray3: "#94a3b8",
  gray5: "#334155",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

export default function DocumentsPage() {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("drivers_license");
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["my-documents"],
    queryFn: () => api.get("/documents/my").then(r => r.data?.data || []),
    staleTime: 30_000,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post("/documents/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      toast.success("Document uploaded! Awaiting admin verification.", { style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["my-documents"] });
      qc.invalidateQueries({ queryKey: ["customer-dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Upload failed"),
  });

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("document_type", docType);
    uploadMutation.mutate(fd);
  };

  const VS = {
    pending:  { color: T.amber,   bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Pending Review" },
    approved: { color: T.green,   bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   label: "Approved" },
    rejected: { color: T.red,     bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "Rejected" },
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 66, fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 6vw 80px" }}>

        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 11, color: T.primary, letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>Verification</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: T.white, letterSpacing: -0.8, lineHeight: 1 }}>
            My Documents
          </h1>
          <p style={{ fontSize: 13.5, color: T.gray3, marginTop: 6, lineHeight: 1.5 }}>
            Upload your driver's license for verification before booking.
          </p>
        </div>

        {/* Upload card */}
        <div style={{ padding: "24px 22px", borderRadius: 12, background: T.bgCard, border: `1px solid ${T.border}`, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, color: T.white, marginBottom: 16 }}>Upload Document</div>

          {/* Document type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: T.gray3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Document Type</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { value: "drivers_license", label: "Driver's License" },
                { value: "national_id",     label: "National ID" },
              ].map(opt => (
                <button key={opt.value} onClick={() => setDocType(opt.value)} style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  border: `1px solid ${docType === opt.value ? "rgba(6,182,212,0.5)" : T.border}`,
                  background: docType === opt.value ? "rgba(6,182,212,0.12)" : "transparent",
                  color: docType === opt.value ? T.primary : T.gray3, cursor: "pointer",
                  fontFamily: "'Rajdhani', sans-serif", transition: "all 0.2s",
                }}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div onClick={() => fileInputRef.current?.click()} style={{
            border: `2px dashed ${file ? "rgba(6,182,212,0.5)" : T.border}`,
            borderRadius: 10, padding: "32px 20px", textAlign: "center",
            cursor: "pointer", transition: "all 0.2s",
            background: file ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.02)",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.35)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = file ? "rgba(6,182,212,0.5)" : T.border}
          >
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
              onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: T.gray3 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>📤</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 4 }}>Click to upload</div>
                <div style={{ fontSize: 12, color: T.gray3 }}>JPG, PNG, or PDF · Max 5MB</div>
              </>
            )}
          </div>

          <button onClick={handleUpload} disabled={uploadMutation.isPending || !file} style={{
            marginTop: 14, width: "100%", padding: "13px",
            background: file ? T.primary : "rgba(255,255,255,0.06)",
            border: "none", borderRadius: 6, cursor: file ? "pointer" : "not-allowed",
            color: file ? "#000" : T.gray5, fontSize: 14, fontWeight: 800,
            fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2, textTransform: "uppercase",
            transition: "all 0.2s",
            boxShadow: file ? "0 4px 20px rgba(6,182,212,0.3)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            {uploadMutation.isPending ? (
              <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Uploading...</>
            ) : "Upload Document"}
          </button>
        </div>

        {/* Existing docs */}
        <div style={{ padding: "20px 20px", borderRadius: 12, background: T.bgCard, border: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, color: T.white, marginBottom: 14 }}>
            Uploaded Documents ({docs.length})
          </div>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
              <div style={{ width: 28, height: 28, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: T.gray5, fontSize: 13 }}>
              No documents uploaded yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {docs.map(doc => {
                const vs = VS[doc.verification_status] || VS.pending;
                return (
                  <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 14px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.white, textTransform: "capitalize", marginBottom: 2 }}>
                        {doc.document_type.replace("_", " ")}
                      </div>
                      <div style={{ fontSize: 11, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </div>
                      {doc.admin_notes && <div style={{ fontSize: 11.5, color: T.amber, marginTop: 4 }}>💬 {doc.admin_notes}</div>}
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: vs.bg, border: `1px solid ${vs.border}`, color: vs.color }}>
                      {vs.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}