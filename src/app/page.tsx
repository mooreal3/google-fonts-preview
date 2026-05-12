"use client";

import { useState, useMemo } from "react";

// ─── Font Data ───────────────────────────────────────────────────────────────

type Category = "sans" | "serif" | "mono" | "condensed";

interface FontEntry {
  name: string;
  category: Category;
  // Raw weight spec string — used to derive which preview weights to show.
  weights: string;
}

const FONTS: FontEntry[] = [
  // Modern Sans
  { name: "Inter", category: "sans", weights: "100..900" },
  { name: "Space Grotesk", category: "sans", weights: "300..700" },
  { name: "DM Sans", category: "sans", weights: "100..900" },
  { name: "Plus Jakarta Sans", category: "sans", weights: "200..800" },
  { name: "Outfit", category: "sans", weights: "100..900" },
  { name: "Sora", category: "sans", weights: "100..800" },
  { name: "Manrope", category: "sans", weights: "200..800" },
  { name: "Urbanist", category: "sans", weights: "100..900" },
  { name: "Instrument Sans", category: "sans", weights: "400..700" },
  { name: "Figtree", category: "sans", weights: "300..900" },
  { name: "Albert Sans", category: "sans", weights: "100..900" },
  { name: "Lexend", category: "sans", weights: "100..900" },
  { name: "Red Hat Display", category: "sans", weights: "300..900" },
  // Classic Sans
  { name: "Roboto", category: "sans", weights: "100..900" },
  { name: "Open Sans", category: "sans", weights: "300..800" },
  { name: "Lato", category: "sans", weights: "100,300,400,700,900" },
  { name: "Poppins", category: "sans", weights: "100,200,300,400,500,600,700,800,900" },
  { name: "Montserrat", category: "sans", weights: "100..900" },
  { name: "Nunito", category: "sans", weights: "200..1000" },
  { name: "Nunito Sans", category: "sans", weights: "200..1000" },
  { name: "Raleway", category: "sans", weights: "100..900" },
  { name: "Rubik", category: "sans", weights: "300..900" },
  { name: "Work Sans", category: "sans", weights: "100..900" },
  { name: "Mulish", category: "sans", weights: "200..1000" },
  { name: "Fira Sans", category: "sans", weights: "100,200,300,400,500,600,700,800,900" },
  { name: "Karla", category: "sans", weights: "200..800" },
  { name: "Cabin", category: "sans", weights: "400..700" },
  { name: "Quicksand", category: "sans", weights: "300..700" },
  { name: "Archivo", category: "sans", weights: "100..900" },
  { name: "Barlow", category: "sans", weights: "100,200,300,400,500,600,700,800,900" },
  { name: "PT Sans", category: "sans", weights: "400,700" },
  { name: "Ubuntu", category: "sans", weights: "300,400,500,700" },
  { name: "Noto Sans", category: "sans", weights: "100..900" },
  // Condensed
  { name: "Roboto Condensed", category: "condensed", weights: "100..900" },
  { name: "Barlow Condensed", category: "condensed", weights: "100,200,300,400,500,600,700,800,900" },
  { name: "Oswald", category: "condensed", weights: "200..700" },
  // Serif
  { name: "Playfair Display", category: "serif", weights: "400..900" },
  { name: "Merriweather", category: "serif", weights: "300,400,700,900" },
  { name: "Cormorant Garamond", category: "serif", weights: "300,400,500,600,700" },
  { name: "EB Garamond", category: "serif", weights: "400..800" },
  { name: "Libre Baskerville", category: "serif", weights: "400,700" },
  { name: "Lora", category: "serif", weights: "400..700" },
  { name: "Noto Serif", category: "serif", weights: "100..900" },
  { name: "Source Serif 4", category: "serif", weights: "200..900" },
  { name: "Roboto Slab", category: "serif", weights: "100..900" },
  // Monospace
  { name: "JetBrains Mono", category: "mono", weights: "100..800" },
  { name: "IBM Plex Mono", category: "mono", weights: "100,200,300,400,500,600,700" },
  { name: "Fira Code", category: "mono", weights: "300..700" },
  { name: "Source Code Pro", category: "mono", weights: "200..900" },
  { name: "DM Mono", category: "mono", weights: "300,400,500" },
  { name: "Space Mono", category: "mono", weights: "400,700" },
  { name: "Roboto Mono", category: "mono", weights: "100..700" },
];

// ─── Weight Utilities ─────────────────────────────────────────────────────────

// The five canonical preview weights shown in the weight showcase row.
const PREVIEW_WEIGHTS = [300, 400, 500, 600, 700] as const;
type PreviewWeight = (typeof PREVIEW_WEIGHTS)[number];

/**
 * Parse a weight spec string and return which of the five preview weights
 * the font actually supports (either by variable range or explicit list).
 */
function getSupportedWeights(spec: string): PreviewWeight[] {
  // Variable range: e.g. "100..900" or "200..800"
  const rangeMatch = spec.match(/^(\d+)\.\.(\d+)$/);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1], 10);
    const hi = parseInt(rangeMatch[2], 10);
    return PREVIEW_WEIGHTS.filter((w) => w >= lo && w <= hi);
  }

  // Fixed list: e.g. "400,700" or "100,300,400,700,900"
  const fixed = new Set(spec.split(",").map((s) => parseInt(s.trim(), 10)));

  // For each preview weight, check if the font has it exactly, or find the
  // nearest available weight (CSS font-weight matching algorithm: prefer
  // exact match, else closest in the same direction).
  return PREVIEW_WEIGHTS.filter((w) => {
    if (fixed.has(w)) return true;
    // Approximate: include the weight if the font has anything in the ±100 band
    // This keeps the showcase readable without showing "unsupported" blanks.
    for (const f of fixed) {
      if (Math.abs(f - w) <= 100) return true;
    }
    return false;
  });
}

// ─── Category Badge ───────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<Category, { label: string; color: string }> = {
  sans: { label: "Sans", color: "#3b82f6" },
  serif: { label: "Serif", color: "#a855f7" },
  mono: { label: "Mono", color: "#10b981" },
  condensed: { label: "Condensed", color: "#f59e0b" },
};

// ─── Font Card ────────────────────────────────────────────────────────────────

function FontCard({ font }: { font: FontEntry }) {
  const supportedWeights = useMemo(
    () => getSupportedWeights(font.weights),
    [font.weights]
  );
  const cat = CATEGORY_STYLES[font.category];

  return (
    <article
      style={{
        background: "#111118",
        border: "1px solid #1a1a2e",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#2a2a4a";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#1a1a2e";
      }}
    >
      {/* Header: font name + category badge */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontFamily: `"${font.name}", sans-serif`,
            fontSize: "22px",
            fontWeight: 600,
            color: "#f0f0f5",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {font.name}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: cat.color,
            background: `${cat.color}18`,
            border: `1px solid ${cat.color}30`,
            borderRadius: "4px",
            padding: "2px 6px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginTop: "4px",
          }}
        >
          {cat.label}
        </span>
      </div>

      {/* Sample sentence */}
      <p
        style={{
          fontFamily: `"${font.name}", sans-serif`,
          fontSize: "14px",
          fontWeight: 400,
          color: "#9090a8",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        The quick brown fox jumps over the lazy dog
      </p>

      {/* Weight showcase: "Aa" at each supported weight */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        {supportedWeights.map((w) => (
          <div
            key={w}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <span
              style={{
                fontFamily: `"${font.name}", sans-serif`,
                fontSize: "20px",
                fontWeight: w,
                color: "#d0d0e0",
                lineHeight: 1,
              }}
            >
              Aa
            </span>
            <span
              style={{
                fontSize: "9px",
                color: "#55556a",
                fontWeight: 400,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {w}
            </span>
          </div>
        ))}
      </div>

      {/* Numeral showcase */}
      <span
        style={{
          fontFamily: `"${font.name}", sans-serif`,
          fontSize: "13px",
          fontWeight: 400,
          color: "#6a6a80",
          letterSpacing: "0.04em",
        }}
      >
        0123456789
      </span>
    </article>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

type FilterValue = "all" | Category;

const TABS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Sans", value: "sans" },
  { label: "Serif", value: "serif" },
  { label: "Mono", value: "mono" },
  { label: "Condensed", value: "condensed" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FontLibraryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return FONTS.filter((f) => {
      const matchesCategory =
        activeFilter === "all" || f.category === activeFilter;
      const matchesSearch = f.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, search]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0f",
        padding: "48px 24px 80px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* Page header */}
      <header style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            color: "#f0f0f5",
            margin: "0 0 8px",
            letterSpacing: "-0.025em",
          }}
        >
          AEPT-AI Font Library
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            color: "#55556a",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          52 Google Fonts &nbsp;&middot;&nbsp; 900+ style files
        </p>
      </header>

      {/* Controls: filter tabs + search */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        {/* Category filter tabs */}
        <div
          role="tablist"
          aria-label="Filter by category"
          style={{
            display: "flex",
            gap: "4px",
            background: "#111118",
            border: "1px solid #1a1a2e",
            borderRadius: "8px",
            padding: "3px",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#0a0a0f" : "#6a6a80",
                  background: isActive ? "#f0f0f5" : "transparent",
                  transition: "all 0.12s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fonts..."
          aria-label="Search fonts by name"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "#d0d0e0",
            background: "#111118",
            border: "1px solid #1a1a2e",
            borderRadius: "8px",
            padding: "8px 14px",
            outline: "none",
            width: "200px",
            transition: "border-color 0.12s ease",
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "#3d3f8a";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "#1a1a2e";
          }}
        />

        {/* Result count */}
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            color: "#55556a",
          }}
        >
          {filtered.length} / {FONTS.length} fonts
        </span>
      </div>

      {/* Font grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
          gap: "16px",
        }}
      >
        {filtered.map((font) => (
          <FontCard key={font.name} font={font} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            color: "#55556a",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
          }}
        >
          No fonts match &ldquo;{search}&rdquo;
        </div>
      )}
    </main>
  );
}
