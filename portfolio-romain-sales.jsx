import { useState, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend,
} from "recharts";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#0B1121",
  card:     "#111827",
  cardHov:  "#1A2333",
  border:   "#1F2D42",
  text:     "#F0F4FF",
  muted:    "#7B90B8",
  dim:      "#3A4A66",
  success:  "#10B981",
  warn:     "#F59E0B",
  danger:   "#F43F5E",
  amPrimary:   "#D97706",   // amber-600
  amLight:     "#FCD34D",
  techPrimary: "#6366F1",   // indigo-500
  techLight:   "#A5B4FC",
};

// ─── Asset class data ─────────────────────────────────────────────────────────
const ASSETS = [
  { key: "equities",     label: "Actions",        er: 0.095, vol: 0.18,  color: "#6366F1" },
  { key: "bonds",        label: "Obligations",    er: 0.035, vol: 0.06,  color: "#D97706" },
  { key: "alternatives", label: "Alternatifs",    er: 0.070, vol: 0.12,  color: "#10B981" },
  { key: "pe",           label: "Private Equity", er: 0.120, vol: 0.22,  color: "#F43F5E" },
  { key: "cash",         label: "Cash",           er: 0.025, vol: 0.005, color: "#0EA5E9" },
];

// ─── Pipeline data ────────────────────────────────────────────────────────────
const FUNNEL = [
  { stage: "Prospects identifiés",  n: 120, val: 3600, color: "#7B90B8" },
  { stage: "Qualifiés",             n: 48,  val: 1440, color: "#6366F1" },
  { stage: "En discussion",         n: 22,  val:  880, color: "#8B5CF6" },
  { stage: "Proposition envoyée",   n: 12,  val:  720, color: "#D97706" },
  { stage: "Négociation",           n:  7,  val:  490, color: "#F59E0B" },
  { stage: "Closés ✓",              n:  5,  val:  425, color: "#10B981" },
];

// ─── Performance chart (deterministic mock) ───────────────────────────────────
const PERF = (() => {
  const deltas = [0,1.2,-0.4,2.1,0.8,-0.6,1.8,2.5,-0.3,1.1,
                  0.9,-0.2,2.0,1.5,-0.8,2.4,0.7,1.6,-0.4,2.3];
  const bDeltas= [0,0.6,-0.1,0.9,0.4,-0.3,0.8,1.2,-0.2,0.5,
                  0.4,-0.1,1.0,0.7,-0.4,1.1,0.3,0.8,-0.2,1.0];
  let p=100, b=100;
  return deltas.map((d,i) => {
    p = parseFloat((p + d).toFixed(2));
    b = parseFloat((b + bDeltas[i]).toFixed(2));
    return { t: `S${i+1}`, portefeuille: p, benchmark: b };
  });
})();

// ─── Skills data ─────────────────────────────────────────────────────────────
const SKILL_TABS = [
  {
    id: "sales", icon: "📈", label: "Sales & BizDev",
    skills: [
      { name: "Business Development B2B",        lvl: 88 },
      { name: "Pitch & Storytelling client",     lvl: 90 },
      { name: "Pipeline management & CRM",       lvl: 83 },
      { name: "Prospection & Cold Outreach",     lvl: 80 },
      { name: "Négociation & Closing",           lvl: 78 },
    ],
  },
  {
    id: "finance", icon: "🏦", label: "Finance & Marchés",
    skills: [
      { name: "Equity & Capital Markets",        lvl: 85 },
      { name: "Gestion de portefeuille",         lvl: 80 },
      { name: "Analyse financière",              lvl: 82 },
      { name: "Macroéconomie",                   lvl: 76 },
      { name: "Modélisation Excel / VBA",        lvl: 88 },
    ],
  },
  {
    id: "tech", icon: "⚡", label: "Tech & Data",
    skills: [
      { name: "Python (Pandas · Matplotlib)",    lvl: 80 },
      { name: "Dashboarding (Streamlit)",        lvl: 82 },
      { name: "Excel avancé — TOSA 868/1000",   lvl: 90 },
      { name: "Prompt Engineering / IA",         lvl: 87 },
      { name: "Data Analysis & Insights",        lvl: 84 },
    ],
  },
];

// ─── Experiences ──────────────────────────────────────────────────────────────
const EXPS = [
  {
    id: 1, emoji: "🤝",
    role: "Chargé de Relations Partenaires",
    company: "Agorize", period: "2023 – 2025", loc: "France",
    tag: "Business Development", tagColor: "#6366F1",
    bullets: [
      "🎯  Prospection & acquisition de 10+ partenaires stratégiques : KPMG, BPCE, Accenture",
      "📋  Gestion du cycle commercial complet — qualification → pitch → closing → suivi",
      "🗣️  Adaptation du discours selon l'interlocuteur (C-level, direction financière)",
      "📊  Préparation de supports de présentation pour réunions stratégiques top management",
    ],
    kpis: ["10+ partenaires closés", "Grands comptes C-level", "End-to-end cycle"],
  },
  {
    id: 2, emoji: "📊",
    role: "Stage Data Analyst",
    company: "Sodexo", period: "Juin – Août 2024", loc: "Paris",
    tag: "Data & Analytics", tagColor: "#10B981",
    bullets: [
      "📈  Analyse de données pour accompagner la prise de décision stratégique",
      "🖥️  Création de dashboards de performance opérationnelle en Python",
      "💡  Identification d'insights actionnables pour les équipes commerciales",
      "⚙️  Reporting automatisé pour la direction",
    ],
    kpis: ["Python · Pandas", "Dashboards automatisés", "Decision support"],
  },
  {
    id: 3, emoji: "🍷",
    role: "Président – Club Œnologie",
    company: "Junia HEI", period: "2023 – 2025", loc: "Lille",
    tag: "Leadership & Négo", tagColor: "#D97706",
    bullets: [
      "💰  Négociation budget 6 000 €/an auprès de 8 partenaires (domaines, cavistes)",
      "👥  Management d'une équipe de 20 membres — recrutement, formation, gestion de projet",
      "🤝  Développement et entretien d'un réseau partenaires sur la durée",
      "🎪  Organisation d'événements & représentation externe",
    ],
    kpis: ["Budget 6 000 €/an", "8 partenaires", "20 membres managés"],
  },
];

// ─── Education ────────────────────────────────────────────────────────────────
const EDUS = [
  {
    flag: "🇺🇸", school: "University of Florida",
    period: "Jan. 2026 – Présent", loc: "Gainesville, FL",
    detail: "Equity & Capital Markets · Business Development · Data Analysis · Statistics",
  },
  {
    flag: "🎓", school: "Junia HEI – Option Finance",
    period: "2024 – Présent", loc: "Lille",
    detail: "Capital Markets · Probabilités · Statistiques · Project Management",
  },
  {
    flag: "📐", school: "Classe Préparatoire MPSI / MP",
    period: "2022 – 2024", loc: "Lycée La Salle, Lille",
    detail: "Mathématiques · Physique · Informatique — Formation d'excellence analytique",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pill = (color, text) => (
  <span style={{
    display: "inline-block",
    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: color + "22", color, border: `1px solid ${color}44`,
  }}>{text}</span>
);

const card = (children, extra = {}) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: 24, ...extra,
  }}>{children}</div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [mode, setMode]         = useState("tech");   // "am" | "tech"
  const [tool, setTool]         = useState(0);
  const [exp, setExp]           = useState(1);
  const [skillTab, setSkillTab] = useState("sales");
  const [stageSel, setStageSel] = useState(null);

  // Allocation sliders (independent; normalized for calc)
  const [alloc, setAlloc] = useState(
    { equities: 40, bonds: 25, alternatives: 15, pe: 10, cash: 10 }
  );

  const P  = mode === "am" ? C.amPrimary   : C.techPrimary;
  const PL = mode === "am" ? C.amLight     : C.techLight;

  // Portfolio metrics (normalize to sum)
  const sum  = Object.values(alloc).reduce((a, b) => a + b, 0) || 1;
  const wts  = Object.fromEntries(ASSETS.map(a => [a.key, alloc[a.key] / sum]));
  const ER   = ASSETS.reduce((s, a) => s + wts[a.key] * a.er,  0);
  const VOL  = Math.sqrt(ASSETS.reduce((s, a) => s + (wts[a.key] * a.vol) ** 2, 0));
  const SHP  = VOL > 0 ? (ER - 0.02) / VOL : 0;
  const pieD = ASSETS.map(a => ({ name: a.label, value: Math.round(wts[a.key] * 100), color: a.color }));

  const perfLast = PERF[PERF.length - 1];
  const alpha    = (perfLast.portefeuille - perfLast.benchmark).toFixed(1);

  // Shared style builders
  const btnTab = (active, color = P) => ({
    padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all .18s",
    border: `1px solid ${active ? color : C.border}`,
    background: active ? color + "22" : C.card,
    color: active ? color : C.muted,
  });

  const modeBtn = (m) => {
    const active = mode === m;
    const col    = m === "am" ? C.amPrimary : C.techPrimary;
    return {
      padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      cursor: "pointer", transition: "all .18s",
      border: `1px solid ${active ? col : C.border}`,
      background: active ? col + "22" : "transparent",
      color: active ? col : C.muted,
    };
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

      {/* ──────────────── NAV ──────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.bg + "f5", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "0 24px",
          height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: ".02em" }}>
            <span style={{ color: P }}>RC</span>
            <span style={{ color: C.muted }}> · Portfolio Sales</span>
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={modeBtn("am")}   onClick={() => setMode("am")}>  🏦 Asset Management</button>
            <button style={modeBtn("tech")} onClick={() => setMode("tech")}>⚡ Fintech / Tech</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>

        {/* ──────────────── HERO ──────────────── */}
        <section style={{ padding: "76px 0 56px", textAlign: "center" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 16px", borderRadius: 24, marginBottom: 28,
            background: P + "18", border: `1px solid ${P}44`, color: P,
            fontSize: 12, fontWeight: 700,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: P, display: "inline-block" }} />
            {mode === "am"
              ? "Disponible — Stage 6 mois · Juin 2026 · Asset Management"
              : "Open to work · Client Solutions & Sales · Fintech / Tech"}
          </div>

          <h1 style={{
            fontSize: "clamp(38px,5.5vw,68px)", fontWeight: 900,
            lineHeight: 1.05, marginBottom: 18, letterSpacing: "-.02em",
          }}>
            Romain Chalard
          </h1>

          <p style={{ fontSize: "clamp(15px,1.8vw,20px)", color: C.muted, marginBottom: 10, fontWeight: 400 }}>
            {mode === "am"
              ? "Business Development · Client Solutions · Asset Management"
              : "Sales & Client Solutions · Business Dev · Fintech / SaaS"}
          </p>

          <p style={{
            fontSize: 14, color: "#4A5C7A", maxWidth: 580, margin: "0 auto 40px",
            lineHeight: 1.75,
          }}>
            {mode === "am"
              ? "Ingénieur financier bilingue, alliant culture des marchés de capitaux, maîtrise des outils quantitatifs et capacité à construire des relations clients durables dans un environnement exigeant."
              : "Ingénieur bilingue orienté croissance, avec une solide culture commerciale et l'appétence pour les outils digitaux — capable d'accélérer l'acquisition et la rétention client d'une fintech dès le premier jour."}
          </p>

          {/* Stat chips */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}>
            {[
              { v: "10+",        s: "partenaires B2B closés" },
              { v: "6 000 €/an", s: "budget négocié & géré"   },
              { v: "C1 (186)",   s: "Anglais — Cambridge"      },
              { v: "TOSA 868",   s: "Excel certifié avancé"    },
            ].map((st, i) => (
              <div key={i} style={{
                padding: "13px 20px", borderRadius: 10, textAlign: "center", minWidth: 120,
                background: C.card, border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: P }}>{st.v}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{st.s}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:rom1chalard@gmail.com"
               style={{
                 padding: "12px 28px", background: P, color: "#fff",
                 borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none",
               }}>
              ✉️ Me contacter
            </a>
            <a href="https://linkedin.com/in/r-chalard" target="_blank" rel="noopener noreferrer"
               style={{
                 padding: "12px 28px", background: "transparent", color: C.text,
                 border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 700,
                 fontSize: 14, textDecoration: "none",
               }}>
              LinkedIn →
            </a>
            <a href="https://portfolio-finance-romain-chalard.streamlit.app/" target="_blank" rel="noopener noreferrer"
               style={{
                 padding: "12px 28px", background: "transparent", color: C.muted,
                 border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600,
                 fontSize: 14, textDecoration: "none",
               }}>
              Portfolio Finance ↗
            </a>
          </div>
        </section>

        <div style={{ height: 1, background: C.border, marginBottom: 60 }} />

        {/* ──────────────── EXPERIENCES ──────────────── */}
        <section style={{ marginBottom: 72 }}>
          <SectionTitle title="Expériences" sub="Parcours orienté Business Development & relations clients" />

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {EXPS.map(e => (
              <div
                key={e.id}
                onClick={() => setExp(exp === e.id ? null : e.id)}
                style={{
                  background: C.card,
                  border: `1px solid ${exp === e.id ? e.tagColor + "66" : C.border}`,
                  borderRadius: 12, overflow: "hidden", cursor: "pointer",
                  transition: "border-color .2s",
                }}
              >
                {/* Header */}
                <div style={{
                  padding: "18px 22px", display: "flex",
                  alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: e.tagColor + "1e",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    }}>{e.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{e.role}</div>
                      <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
                        {e.company} &middot; {e.period} &middot; {e.loc}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {pill(e.tagColor, e.tag)}
                    <span style={{ color: C.muted, fontSize: 12 }}>{exp === e.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Body */}
                {exp === e.id && (
                  <div style={{ padding: "0 22px 22px", borderTop: `1px solid ${C.border}` }}>
                    <div style={{ marginTop: 18, marginBottom: 16 }}>
                      {e.bullets.map((b, i) => (
                        <div key={i} style={{
                          padding: "9px 0", fontSize: 13.5, color: "#B0C0D8",
                          borderBottom: i < e.bullets.length - 1 ? `1px solid ${C.border}55` : "none",
                        }}>{b}</div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {e.kpis.map((k, i) => (
                        <span key={i} style={{
                          padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                          background: e.tagColor + "18", color: e.tagColor,
                          border: `1px solid ${e.tagColor}33`,
                        }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────── INTERACTIVE TOOLS ──────────────── */}
        <section style={{ marginBottom: 72 }}>
          <SectionTitle
            title="Outils Interactifs"
            sub={mode === "am"
              ? "Maîtrise des marchés financiers & analyse quantitative — démos live"
              : "Capacités analytiques & commerciales appliquées — démos live"}
          />

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            {[
              { label: "📊  Asset Allocator",      id: 0 },
              { label: "🎯  Sales Pipeline",        id: 1 },
              { label: "📈  Performance Monitor",   id: 2 },
            ].map(t => (
              <button key={t.id} onClick={() => setTool(t.id)} style={btnTab(tool === t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TOOL 0: Asset Allocator ── */}
          {tool === 0 && (
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 28,
            }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Asset Allocation Optimizer</h3>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
                Ajuste les pondérations par classe d'actifs et observe en temps réel l'impact sur le
                rendement attendu, la volatilité et le ratio de Sharpe du portefeuille.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "start" }}>

                {/* Sliders */}
                <div>
                  {ASSETS.map(a => (
                    <div key={a.key} style={{ marginBottom: 22 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: a.color }}>
                          {Math.round(wts[a.key] * 100)}%
                        </span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={alloc[a.key]}
                        onChange={e => setAlloc(prev => ({ ...prev, [a.key]: +e.target.value }))}
                        style={{ width: "100%", accentColor: a.color, cursor: "pointer" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 3 }}>
                        <span>E[R] : {(a.er * 100).toFixed(1)}%</span>
                        <span>Vol : {(a.vol * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, textAlign: "center" }}>
                    Les poids sont normalisés à 100% pour le calcul.
                  </div>
                </div>

                {/* Pie + KPIs */}
                <div>
                  <div style={{ height: 200, marginBottom: 20 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieD} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                          {pieD.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}
                          formatter={(v, n) => [`${v}%`, n]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "E[Rendement]", val: `${(ER * 100).toFixed(1)}%`,  color: C.success },
                      { label: "Volatilité",   val: `${(VOL * 100).toFixed(1)}%`, color: C.warn    },
                      { label: "Sharpe",       val: SHP.toFixed(2),               color: P         },
                    ].map((m, i) => (
                      <div key={i} style={{
                        padding: "13px 8px", textAlign: "center",
                        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.val}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: 14, padding: "10px 14px", borderRadius: 8, fontSize: 12,
                    background: P + "12", border: `1px solid ${P}30`, color: C.muted,
                  }}>
                    💡 Un Sharpe &gt; 1 indique un bon compromis rendement / risque. Le modèle
                    utilise des corrélations nulles (simplification pédagogique).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TOOL 1: Sales Pipeline ── */}
          {tool === 1 && (
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 28,
            }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sales Pipeline Analyzer</h3>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
                Visualisation d'un pipeline B2B type — maîtrise des KPIs commerciaux,
                taux de conversion par étape et gestion du cycle de vente.
                Clique sur une étape pour l'analyser.
              </p>

              {/* Global KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
                {[
                  { label: "Pipeline total",    val: "€2.16M",  color: P         },
                  { label: "Taux global",        val: "4.2%",    color: C.success },
                  { label: "Deals actifs",       val: "94",      color: C.warn    },
                  { label: "Win rate final",     val: "71%",     color: C.success },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    padding: "16px 12px", textAlign: "center",
                    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: kpi.color }}>{kpi.val}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Funnel bars */}
              {FUNNEL.map((st, i) => {
                const selected = stageSel === i;
                const convPct  = i > 0 ? ((st.n / FUNNEL[i - 1].n) * 100).toFixed(0) : "—";
                return (
                  <div key={i} style={{ marginBottom: 16, cursor: "pointer" }}
                       onClick={() => setStageSel(selected ? null : i)}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 6,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: selected ? 700 : 500, color: selected ? st.color : C.text }}>
                        {st.stage}
                      </span>
                      <div style={{ display: "flex", gap: 18, fontSize: 12 }}>
                        <span style={{ color: C.muted }}>{st.n} deals</span>
                        <span style={{ color: st.color, fontWeight: 700 }}>€{st.val}k</span>
                        {i > 0 && (
                          <span style={{ color: C.dim, fontSize: 11 }}>↳ {convPct}% conv.</span>
                        )}
                      </div>
                    </div>
                    <div style={{ background: C.bg, borderRadius: 4, height: 9, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${(st.n / FUNNEL[0].n) * 100}%`,
                        background: `linear-gradient(90deg, ${st.color}, ${st.color}bb)`,
                        borderRadius: 4, transition: "width .35s",
                      }} />
                    </div>
                    {selected && (
                      <div style={{
                        marginTop: 10, padding: "12px 16px", borderRadius: 8,
                        background: st.color + "12", border: `1px solid ${st.color}33`,
                        fontSize: 12, color: C.muted, lineHeight: 1.6,
                      }}>
                        <strong style={{ color: st.color }}>{st.stage} :</strong>{" "}
                        {st.n} deals représentant €{st.val}k de valeur potentielle.
                        {i < FUNNEL.length - 1
                          ? ` Taux de passage à l'étape suivante : ${((FUNNEL[i + 1].n / st.n) * 100).toFixed(0)}%.`
                          : " Deals gagnés — revenu confirmé. Excellent win rate."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TOOL 2: Performance Monitor ── */}
          {tool === 2 && (
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 28,
            }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Portfolio Performance Monitor</h3>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
                Suivi de la performance relative d'un portefeuille actions vs benchmark —
                réplique les outils développés en Python pour la gestion de portefeuille personnel (depuis 2024).
              </p>

              {/* Perf numbers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Portefeuille", val: `+${(perfLast.portefeuille - 100).toFixed(1)}%`, color: C.success },
                  { label: "Benchmark",    val: `+${(perfLast.benchmark    - 100).toFixed(1)}%`, color: C.warn    },
                  { label: "Alpha",        val: `+${alpha}%`,                                     color: P         },
                ].map((m, i) => (
                  <div key={i} style={{
                    padding: "16px 12px", textAlign: "center",
                    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.val}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PERF}>
                    <defs>
                      <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.warn} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={C.warn} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="t" tick={{ fill: C.muted, fontSize: 11 }} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} domain={["auto","auto"]} />
                    <Tooltip
                      contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}
                      labelStyle={{ color: C.text }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
                    <Area type="monotone" dataKey="portefeuille" name="Portefeuille"
                          stroke={C.success} fill="url(#gP)" strokeWidth={2} />
                    <Area type="monotone" dataKey="benchmark"    name="Benchmark"
                          stroke={C.warn}    fill="url(#gB)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{
                marginTop: 16, padding: "12px 16px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: 8,
                fontSize: 12, color: C.muted, lineHeight: 1.6,
              }}>
                💡 <strong style={{ color: C.text }}>Contexte :</strong> Suivi actif d'un portefeuille
                personnel actions / options depuis 2024, avec analyse macroéconomique quotidienne et outils
                Python (Pandas · Matplotlib · Streamlit) développés en autonomie.
              </div>
            </div>
          )}
        </section>

        {/* ──────────────── SKILLS ──────────────── */}
        <section style={{ marginBottom: 72 }}>
          <SectionTitle title="Compétences & Outils" sub="Maîtrise transversale : commercial · finance · tech" />

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            {SKILL_TABS.map(t => (
              <button key={t.id} onClick={() => setSkillTab(t.id)} style={btnTab(skillTab === t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Bars */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28 }}>
            {SKILL_TABS.filter(t => t.id === skillTab).map(cat =>
              cat.skills.map((sk, i) => (
                <div key={i} style={{ marginBottom: i < cat.skills.length - 1 ? 20 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{sk.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: P }}>{sk.lvl}%</span>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 4, height: 7, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${sk.lvl}%`, borderRadius: 4,
                      background: `linear-gradient(90deg, ${P}, ${PL})`,
                      transition: "width .4s",
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Certs + Tools */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: C.text }}>🏅 Certifications</div>
              {[
                { name: "Cambridge C1 Advanced",  score: "186 / 210",  color: "#6366F1" },
                { name: "Excel TOSA",              score: "868 / 1000", color: "#D97706" },
              ].map((c, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 0", borderBottom: i === 0 ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: c.color }}>{c.score}</span>
                </div>
              ))}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: C.text }}>🛠 Stack</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {["Python", "Excel / VBA", "Streamlit", "PowerPoint", "Prompt AI", "Pandas", "Matplotlib", "Bloomberg*"].map((t, i) => (
                  <span key={i} style={{
                    padding: "4px 11px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: P + "18", color: P, border: `1px solid ${P}33`,
                  }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 10 }}>* Notions acquises en cours</div>
            </div>
          </div>
        </section>

        {/* ──────────────── EDUCATION ──────────────── */}
        <section style={{ marginBottom: 72 }}>
          <SectionTitle title="Formation" sub="Ingénieur + Finance + Expérience internationale" />

          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 20, top: 0, bottom: 0,
              width: 2, background: P + "44",
            }} />

            {EDUS.map((e, i) => (
              <div key={i} style={{ paddingLeft: 52, paddingBottom: i < EDUS.length - 1 ? 28 : 0, position: "relative" }}>
                <div style={{
                  position: "absolute", left: 11, top: 6,
                  width: 20, height: 20, borderRadius: "50%",
                  background: P, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#fff", fontWeight: 900,
                }}>●</div>

                <div style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{e.flag} {e.school}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{e.period}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{e.loc}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>{e.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────── CONTACT ──────────────── */}
        <section style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "56px 28px", textAlign: "center", marginBottom: 60,
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14, letterSpacing: "-.01em" }}>
            Parlons-en 👋
          </h2>
          <p style={{ color: C.muted, fontSize: 15, maxWidth: 500, margin: "0 auto 34px", lineHeight: 1.7 }}>
            Disponible pour un stage 6 mois à partir de <strong style={{ color: C.text }}>juin 2026</strong> —
            ouvert aux opportunités en{" "}
            <strong style={{ color: P }}>Client Solutions, Business Dev, Sales</strong>{" "}
            dans un contexte Asset Management ou Fintech.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:rom1chalard@gmail.com"
               style={{
                 padding: "13px 30px", background: P, color: "#fff",
                 borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none",
               }}>
              ✉️  rom1chalard@gmail.com
            </a>
            <a href="https://linkedin.com/in/r-chalard" target="_blank" rel="noopener noreferrer"
               style={{
                 padding: "13px 30px", background: "transparent", color: C.text,
                 border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 700,
                 fontSize: 14, textDecoration: "none",
               }}>
              LinkedIn →
            </a>
          </div>
        </section>

        <footer style={{ textAlign: "center", color: C.dim, fontSize: 11, paddingBottom: 40 }}>
          Romain Chalard · {new Date().getFullYear()} · Paris / Gainesville, FL
        </footer>
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────
function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-.01em" }}>{title}</h2>
      <p style={{ color: "#4A5C7A", fontSize: 14 }}>{sub}</p>
    </div>
  );
}
