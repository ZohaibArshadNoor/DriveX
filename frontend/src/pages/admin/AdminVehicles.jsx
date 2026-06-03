/**
 * DriveX — AdminVehicles.jsx
 * Place at: src/pages/admin/AdminVehicles.jsx
 * Route: /admin/vehicles  (admin only)
 *
 * Enlarged: wider content, bigger cards, larger text, less side padding.
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";

const T = {
  bg: "#05070f",
  bgCard: "#0a0f1a",
  border: "rgba(255,255,255,0.10)",
  primary: "#06b6d4",
  white: "#ffffff",
  gray3: "#cbd5e1",
  gray5: "#64748b",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

const STATUS_STYLE = {
  available: {
    color: T.green,
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    label: "Available",
  },
  reserved: {
    color: T.primary,
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
    label: "Reserved",
  },
  rented: {
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    border: "rgba(34,211,238,0.25)",
    label: "Rented",
  },
  maintenance: {
    color: T.amber,
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    label: "Maintenance",
  },
};

const EMPTY_FORM = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "sedan",
  transmission: "automatic",
  fuel_type: "petrol",
  seats: 5,
  price_per_day: "",
  thumbnail: "",
  description: "",
  status: "available",
};

const inputStyle = (focused) => ({
  width: "100%",
  padding: "14px 16px",
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${focused ? T.primary : T.border}`,
  borderRadius: 8,
  color: T.white,
  fontSize: 16,
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 500,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxShadow: focused ? "0 0 0 3px rgba(6,182,212,0.08)" : "none",
});

const selectStyle = {
  width: "100%",
  padding: "14px 16px",
  boxSizing: "border-box",
  background: "#0a0f1a",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.white,
  fontSize: 16,
  fontFamily: "'Rajdhani', sans-serif",
  outline: "none",
  cursor: "pointer",
};

export default function AdminVehicles() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [focused, setFocused] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const gridRef = useRef(null);
  const formRef = useRef(null);

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: () =>
      api.get("/vehicles/").then((r) => r.data?.data || r.data || []),
    staleTime: 30_000,
  });

  const vehicles = raw.filter((v) => {
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    const matchSearch =
      !search ||
      v.brand?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  useEffect(() => {
    if (showForm && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: -20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [showForm]);

  useEffect(() => {
    if (!gridRef.current || isLoading) return;
    gsap.fromTo(
      gridRef.current.querySelectorAll("[data-vcard]"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.45, ease: "power2.out" },
    );
  }, [vehicles.length, filterStatus, search, isLoading]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        year: Number(form.year),
        seats: Number(form.seats),
        price_per_day: Number(form.price_per_day),
      };
      if (editing) return api.put(`/vehicles/${editing.id}`, payload);
      return api.post("/vehicles/", payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Vehicle updated!" : "Vehicle added to fleet!", {
        style: {
          background: "#0a0f1a",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      toast.success("Vehicle removed from fleet.");
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e) =>
      toast.error(
        e.response?.data?.message || "Cannot delete — may have active bookings",
      ),
  });

  const openEdit = (v) => {
    setForm({
      brand: v.brand,
      model: v.model,
      year: v.year,
      category: v.category,
      transmission: v.transmission,
      fuel_type: v.fuel_type,
      seats: v.seats,
      price_per_day: v.price_per_day,
      thumbnail: v.thumbnail || "",
      description: v.description || "",
      status: v.status,
    });
    setEditing(v);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const fields = [
    { key: "brand", label: "Brand", type: "text", ph: "Toyota", col: 1 },
    { key: "model", label: "Model", type: "text", ph: "Camry", col: 1 },
    { key: "year", label: "Year", type: "number", ph: "2023", col: 1 },
    { key: "seats", label: "Seats", type: "number", ph: "5", col: 1 },
    {
      key: "price_per_day",
      label: "Price/Day (Rs.)",
      type: "number",
      ph: "5000",
      col: 1,
    },
    {
      key: "thumbnail",
      label: "Thumbnail URL",
      type: "text",
      ph: "https://...",
      col: 2,
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      ph: "Brief description...",
      col: 2,
    },
  ];

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        paddingTop: 80,
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #0a0f1a; }
        input::placeholder { color: rgba(148,163,184,0.4); }
      `}</style>

      {/* Reduced side padding, larger max width */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 5vw 80px" }}>
        {/* Header – larger */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 14,
              color: T.primary,
              letterSpacing: 4,
              fontWeight: 700,
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 10,
            }}
          >
            Admin Panel
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(44px,6vw,60px)",
                fontWeight: 900,
                color: T.white,
                letterSpacing: -1,
                lineHeight: 1,
              }}
            >
              Fleet Management
            </h1>
            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setEditing(null);
                setShowForm((p) => !p);
              }}
              style={{
                padding: "16px 32px",
                background: showForm ? "rgba(239,68,68,0.1)" : T.primary,
                border: showForm ? "1px solid rgba(239,68,68,0.3)" : "none",
                borderRadius: 12,
                color: showForm ? T.red : "#000",
                fontSize: 17,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 1,
                boxShadow: showForm
                  ? "none"
                  : "0 4px 28px rgba(6,182,212,0.35)",
                transition: "all 0.2s",
              }}
            >
              {showForm ? "✕ Cancel" : "+ Add Vehicle"}
            </button>
          </div>
        </div>

        {/* Add/Edit Form – enlarged */}
        {showForm && (
          <div
            ref={formRef}
            style={{
              marginBottom: 36,
              padding: "34px 34px",
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 28,
                fontWeight: 900,
                color: T.white,
                marginBottom: 26,
                letterSpacing: -0.5,
              }}
            >
              {editing
                ? `Editing: ${editing.brand} ${editing.model}`
                : "Add New Vehicle"}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 18,
              }}
            >
              {fields
                .filter((f) => f.col === 1)
                .map(({ key, label, type, ph }) => (
                  <div key={key}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        color: T.gray5,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        marginBottom: 8,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={ph}
                      value={form[key]}
                      onChange={set(key)}
                      onFocus={() => setFocused(key)}
                      onBlur={() => setFocused("")}
                      style={inputStyle(focused === key)}
                    />
                  </div>
                ))}

              {/* Category */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: T.gray5,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={set("category")}
                  style={selectStyle}
                >
                  {["sedan", "suv", "hatchback", "luxury", "van"].map((o) => (
                    <option key={o} value={o}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: T.gray5,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Transmission
                </label>
                <select
                  value={form.transmission}
                  onChange={set("transmission")}
                  style={selectStyle}
                >
                  {["automatic", "manual"].map((o) => (
                    <option key={o} value={o}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: T.gray5,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Fuel Type
                </label>
                <select
                  value={form.fuel_type}
                  onChange={set("fuel_type")}
                  style={selectStyle}
                >
                  {["petrol", "diesel", "electric", "hybrid"].map((o) => (
                    <option key={o} value={o}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status (only when editing) */}
              {editing && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: T.gray5,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      marginBottom: 8,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    style={selectStyle}
                  >
                    {["available", "maintenance", "reserved", "rented"].map(
                      (o) => (
                        <option key={o} value={o}>
                          {o.charAt(0).toUpperCase() + o.slice(1)}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Wide fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
                marginTop: 18,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: T.gray5,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.thumbnail}
                  onChange={set("thumbnail")}
                  onFocus={() => setFocused("thumbnail")}
                  onBlur={() => setFocused("")}
                  style={inputStyle(focused === "thumbnail")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: T.gray5,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={set("description")}
                  onFocus={() => setFocused("description")}
                  onBlur={() => setFocused("")}
                  style={inputStyle(focused === "description")}
                />
              </div>
            </div>

            {/* Preview if thumbnail provided */}
            {form.thumbnail && (
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 140,
                    height: 90,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <img
                    src={form.thumbnail}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <span style={{ fontSize: 14, color: T.gray5 }}>
                  Thumbnail preview
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={
                  saveMutation.isPending ||
                  !form.brand ||
                  !form.model ||
                  !form.price_per_day
                }
                style={{
                  padding: "16px 36px",
                  background: T.primary,
                  border: "none",
                  borderRadius: 10,
                  color: "#000",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: 1,
                  boxShadow: "0 4px 24px rgba(6,182,212,0.3)",
                  transition: "all 0.2s",
                  opacity: saveMutation.isPending ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {saveMutation.isPending ? (
                  <>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(0,0,0,0.3)",
                        borderTopColor: "#000",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />{" "}
                    Saving...
                  </>
                ) : editing ? (
                  "Update Vehicle"
                ) : (
                  "Add to Fleet"
                )}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm(EMPTY_FORM);
                }}
                style={{
                  padding: "16px 28px",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  color: T.gray3,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters – larger */}
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                opacity: 0.35,
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand or model..."
              style={{
                ...inputStyle(false),
                paddingLeft: 42,
                background: T.bgCard,
                fontSize: 16,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["all", "available", "reserved", "rented", "maintenance"].map(
              (s) => {
                const st = STATUS_STYLE[s];
                const active = filterStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: "10px 20px",
                      fontSize: 14,
                      fontWeight: 700,
                      borderRadius: 24,
                      border: `1px solid ${active ? st?.border || "rgba(6,182,212,0.4)" : T.border}`,
                      background: active
                        ? st?.bg || "rgba(6,182,212,0.12)"
                        : "transparent",
                      color: active ? st?.color || T.primary : T.gray3,
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {s === "all" ? "All" : st?.label || s}
                    <span style={{ marginLeft: 5, opacity: 0.8, fontSize: 13 }}>
                      (
                      {s === "all"
                        ? raw.length
                        : raw.filter((v) => v.status === s).length}
                      )
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Vehicles Grid – larger cards */}
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "100px 0",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                border: `2px solid ${T.border}`,
                borderTopColor: T.primary,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : (
          <div
            ref={gridRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {vehicles.map((v) => {
              const st = STATUS_STYLE[v.status] || STATUS_STYLE.available;
              return (
                <div
                  key={v.id}
                  data-vcard
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)";
                    e.currentTarget.style.transform = "translateY(-6px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {/* Image – taller */}
                  <div
                    style={{
                      position: "relative",
                      height: 220,
                      overflow: "hidden",
                      background: "#080c18",
                    }}
                  >
                    {v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        alt={`${v.brand} ${v.model}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 48,
                          opacity: 0.1,
                        }}
                      >
                        🚗
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(10,15,26,0.7) 0%, transparent 60%)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        padding: "4px 14px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        background: st.bg,
                        border: `1px solid ${st.border}`,
                        color: st.color,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {st.label}
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "4px 14px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: "rgba(6,182,212,0.1)",
                        border: "1px solid rgba(6,182,212,0.2)",
                        color: T.primary,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {v.category}
                    </span>
                  </div>

                  {/* Info – larger text */}
                  <div style={{ padding: "20px 22px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 24,
                            fontWeight: 900,
                            color: T.white,
                            letterSpacing: -0.3,
                            marginBottom: 4,
                          }}
                        >
                          {v.brand} {v.model}
                        </h3>
                        <div style={{ fontSize: 14, color: T.gray5 }}>
                          {v.year} ·{" "}
                          {v.transmission?.charAt(0).toUpperCase() +
                            v.transmission?.slice(1)}{" "}
                          ·{" "}
                          {v.fuel_type?.charAt(0).toUpperCase() +
                            v.fuel_type?.slice(1)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 24,
                            fontWeight: 900,
                            color: T.primary,
                          }}
                        >
                          Rs. {Number(v.price_per_day).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 14, color: T.gray7 }}>/day</div>
                      </div>
                    </div>

                    {/* Action buttons – larger */}
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button
                        onClick={() => openEdit(v)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "rgba(6,182,212,0.1)",
                          border: "1px solid rgba(6,182,212,0.2)",
                          borderRadius: 10,
                          color: T.primary,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'Rajdhani', sans-serif",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(6,182,212,0.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(6,182,212,0.1)")
                        }
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete ${v.brand} ${v.model}? This cannot be undone.`,
                            )
                          )
                            deleteMutation.mutate(v.id);
                        }}
                        disabled={deleteMutation.isPending}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 10,
                          color: T.red,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'Rajdhani', sans-serif",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.18)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.08)")
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {vehicles.length === 0 && (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "80px 20px",
                  color: T.gray5,
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2 }}>
                  🚗
                </div>
                <div style={{ fontSize: 22, color: T.gray3 }}>
                  No vehicles match your filters
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
