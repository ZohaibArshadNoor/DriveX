/**
 * DriveX — DocumentsPage.jsx
 * Place at: src/pages/user/DocumentsPage.jsx
 * Route: /documents  (protected — customer)
 *
 * FIXED: 404 on view, added thumbnail preview, enlarged layout
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

// Helper: build a clean, valid file URL
function getFileUrl(filePath) {
  if (!filePath) return "#";
  // Normalise: backslashes → forward slashes, remove leading slash / whitespace
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "").trim();
  const apiBase = api.defaults.baseURL || "";                     // e.g. "http://localhost:8000/api/v1"
  const root = apiBase.replace(/\/api\/v1\/?$/, "");              // → "http://localhost:8000"
  return `${root}/${normalized}`;
}

// Check if the path indicates an image (by extension)
function isImage(filePath) {
  if (!filePath) return false;
  const ext = filePath.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

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
    <div style={{
      background: T.bg,
      minHeight: "100vh",
      paddingTop: 80,
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 8vw 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, color: T.primary, letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            Verification
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 900,
            color: T.white,
            letterSpacing: -0.8,
            lineHeight: 1,
          }}>
            My Documents
          </h1>
          <p style={{ fontSize: 16, color: T.gray3, marginTop: 8, lineHeight: 1.5 }}>
            Upload your driver's license or national ID for verification before booking.
          </p>
        </div>

        {/* Upload card – now wider */}
        <div style={{
          padding: "30px 28px",
          borderRadius: 16,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          marginBottom: 32,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 24,
            fontWeight: 900,
            color: T.white,
            marginBottom: 22,
          }}>
            Upload Document
          </div>

          {/* Document type */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: "block",
              fontSize: 11,
              color: T.gray3,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Document Type
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { value: "drivers_license", label: "Driver's License" },
                { value: "national_id",     label: "National ID" },
              ].map(opt => (
                <button key={opt.value} onClick={() => setDocType(opt.value)} style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  border: `1px solid ${docType === opt.value ? "rgba(6,182,212,0.5)" : T.border}`,
                  background: docType === opt.value ? "rgba(6,182,212,0.12)" : "transparent",
                  color: docType === opt.value ? T.primary : T.gray3,
                  cursor: "pointer",
                  fontFamily: "'Rajdhani', sans-serif",
                  transition: "all 0.2s",
                }}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div onClick={() => fileInputRef.current?.click()} style={{
            border: `2px dashed ${file ? "rgba(6,182,212,0.5)" : T.border}`,
            borderRadius: 12,
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            background: file ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.02)",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.35)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = file ? "rgba(6,182,212,0.5)" : T.border}
          >
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
              onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.white, marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 13, color: T.gray3 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.4 }}>📤</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 4 }}>Click to upload</div>
                <div style={{ fontSize: 13, color: T.gray3 }}>JPG, PNG, or PDF · Max 5MB</div>
              </>
            )}
          </div>

          <button onClick={handleUpload} disabled={uploadMutation.isPending || !file} style={{
            marginTop: 18,
            width: "100%",
            padding: "16px",
            background: file ? T.primary : "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: 8,
            cursor: file ? "pointer" : "not-allowed",
            color: file ? "#000" : T.gray5,
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: 2,
            textTransform: "uppercase",
            transition: "all 0.2s",
            boxShadow: file ? "0 4px 24px rgba(6,182,212,0.3)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}>
            {uploadMutation.isPending ? (
              <><div style={{ width: 18, height: 18, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Uploading...</>
            ) : "Upload Document"}
          </button>
        </div>

        {/* Existing documents list – with thumbnail previews */}
        <div style={{ padding: "28px 24px", borderRadius: 16, background: T.bgCard, border: `1px solid ${T.border}` }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 24,
            fontWeight: 900,
            color: T.white,
            marginBottom: 20,
          }}>
            Uploaded Documents ({docs.length})
          </div>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
              <div style={{ width: 32, height: 32, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: T.gray5, fontSize: 15 }}>
              No documents uploaded yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {docs.map(doc => {
                const vs = VS[doc.verification_status] || VS.pending;
                const fileUrl = getFileUrl(doc.file_path);
                const imgPreview = isImage(doc.file_path);
                return (
                  <div key={doc.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${T.border}`,
                    flexWrap: "wrap",
                  }}>
                    {/* Thumbnail / icon */}
                    <div style={{
                      width: 70,
                      height: 70,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#080c18",
                      flexShrink: 0,
                      border: `1px solid ${T.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {imgPreview ? (
                        <img src={fileUrl} alt="doc thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ fontSize: 28, opacity: 0.3 }}>📄</div>
                      )}
                    </div>

                    {/* Info & actions */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.white, textTransform: "capitalize", marginBottom: 4 }}>
                        {doc.document_type.replace("_", " ")}
                      </div>
                      <div style={{ fontSize: 12, color: T.gray5, fontFamily: "'JetBrains Mono', monospace" }}>
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </div>
                      {doc.admin_notes && (
                        <div style={{ fontSize: 12.5, color: T.amber, marginTop: 6 }}>💬 {doc.admin_notes}</div>
                      )}
                      {/* View link */}
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 8,
                          padding: "6px 14px",
                          borderRadius: 6,
                          background: "rgba(6,182,212,0.1)",
                          border: "1px solid rgba(6,182,212,0.25)",
                          color: T.primary,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        View Document ↗
                      </a>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      background: vs.bg,
                      border: `1px solid ${vs.border}`,
                      color: vs.color,
                      whiteSpace: "nowrap",
                      alignSelf: "flex-start",
                    }}>
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