import streamlit as st
import plotly.graph_objects as go
import numpy as np

# ─── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Romain Chalard · Portfolio",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Color tokens ─────────────────────────────────────────────────────────────
BG      = "#0B1121"
CARD    = "#111827"
BORDER  = "#1F2D42"
TEXT    = "#F0F4FF"
MUTED   = "#7B90B8"
DIM     = "#3A4A66"
SUCCESS = "#10B981"
WARN    = "#F59E0B"
AM_COL  = "#D97706"
TK_COL  = "#6366F1"

# ─── Global CSS ───────────────────────────────────────────────────────────────
st.markdown(f"""
<style>
  /* ── reset & base ── */
  .stApp {{ background-color:{BG}; color:{TEXT}; }}
  section[data-testid="stSidebar"] {{ display:none; }}
  div[data-testid="stToolbar"] {{ display:none; }}
  div[data-testid="stDecoration"] {{ display:none; }}
  footer {{ display:none; }}
  .block-container {{ padding-top:2rem; padding-bottom:3rem; max-width:1080px; }}

  /* ── headings ── */
  h1, h2, h3 {{ color:{TEXT}; }}
  p, li {{ color:{MUTED}; }}

  /* ── radio pill group ── */
  div[data-testid="stRadio"] > label {{ display:none; }}
  div[data-testid="stRadio"] > div {{
    display:flex; gap:8px; flex-wrap:wrap; justify-content:center;
  }}
  div[data-testid="stRadio"] > div > label {{
    background:{CARD}; border:1px solid {BORDER};
    border-radius:24px; padding:7px 18px; cursor:pointer;
    font-size:13px; font-weight:700; color:{MUTED}; transition:all .2s;
  }}
  div[data-testid="stRadio"] > div > label:has(input:checked) {{
    border-color:var(--p); color:var(--p); background:rgba(99,102,241,.15);
  }}

  /* ── slider ── */
  div[data-testid="stSlider"] label {{ color:{TEXT}; font-weight:600; font-size:13px; }}
  .stSlider > div > div > div > div {{ background:var(--p) !important; }}

  /* ── expander ── */
  details > summary {{ color:{TEXT}; font-weight:700; font-size:14px; }}
  details {{ background:{CARD}; border:1px solid {BORDER}; border-radius:10px; padding:0; }}

  /* ── metric ── */
  div[data-testid="stMetric"] {{
    background:{CARD}; border:1px solid {BORDER};
    border-radius:10px; padding:14px 16px;
  }}
  div[data-testid="stMetric"] label {{ color:{MUTED}; font-size:12px !important; }}
  div[data-testid="stMetric"] div[data-testid="stMetricValue"] {{
    font-size:22px !important; font-weight:800 !important;
  }}

  /* ── progress bar ── */
  div[data-testid="stProgressBar"] > div > div {{ background:var(--p) !important; }}

  /* ── divider ── */
  hr {{ border-color:{BORDER}; margin:2rem 0; }}

  /* ── tabs ── */
  .stTabs [data-baseweb="tab-list"] {{ gap:8px; background:{BG}; border-bottom:1px solid {BORDER}; }}
  .stTabs [data-baseweb="tab"] {{
    background:{CARD}; border:1px solid {BORDER}; border-radius:8px;
    color:{MUTED}; font-weight:600; font-size:13px; padding:8px 18px;
  }}
  .stTabs [aria-selected="true"] {{
    background:rgba(99,102,241,.18) !important;
    border-color:var(--p) !important; color:var(--p) !important;
  }}
  .stTabs [data-baseweb="tab-highlight"] {{ display:none; }}
</style>
""", unsafe_allow_html=True)


# ─── Helper: inject CSS variable for primary color ────────────────────────────
def set_primary(color):
    st.markdown(f"<style>:root{{--p:{color};}}</style>", unsafe_allow_html=True)

# ─── Helper: styled card ──────────────────────────────────────────────────────
def card_html(content, border_color=BORDER):
    return f"""
    <div style="background:{CARD};border:1px solid {border_color};
                border-radius:12px;padding:22px 24px;margin-bottom:12px;">
      {content}
    </div>"""

def pill(text, color):
    return (f'<span style="background:{color}22;color:{color};border:1px solid {color}44;'
            f'border-radius:20px;padding:3px 11px;font-size:11px;font-weight:700;">{text}</span>')

def stat_chip(value, label, color):
    return (f'<div style="background:{CARD};border:1px solid {BORDER};border-radius:10px;'
            f'padding:13px 18px;text-align:center;min-width:120px;display:inline-block;margin:4px;">'
            f'<div style="font-size:17px;font-weight:800;color:{color};">{value}</div>'
            f'<div style="font-size:11px;color:{MUTED};margin-top:3px;">{label}</div></div>')


# ─── Data ─────────────────────────────────────────────────────────────────────
ASSETS = [
    {"key": "equities",     "label": "Actions",        "er": 0.095, "vol": 0.18,  "color": "#6366F1"},
    {"key": "bonds",        "label": "Obligations",    "er": 0.035, "vol": 0.06,  "color": "#D97706"},
    {"key": "alternatives", "label": "Alternatifs",    "er": 0.070, "vol": 0.12,  "color": "#10B981"},
    {"key": "pe",           "label": "Private Equity", "er": 0.120, "vol": 0.22,  "color": "#F43F5E"},
    {"key": "cash",         "label": "Cash",           "er": 0.025, "vol": 0.005, "color": "#0EA5E9"},
]

FUNNEL = [
    {"stage": "Prospects identifiés",  "n": 120, "val": 3600, "color": "#7B90B8"},
    {"stage": "Qualifiés",             "n": 48,  "val": 1440, "color": "#6366F1"},
    {"stage": "En discussion",         "n": 22,  "val":  880, "color": "#8B5CF6"},
    {"stage": "Proposition envoyée",   "n": 12,  "val":  720, "color": "#D97706"},
    {"stage": "Négociation",           "n":  7,  "val":  490, "color": "#F59E0B"},
    {"stage": "Closés ✓",              "n":  5,  "val":  425, "color": "#10B981"},
]

PERF_DELTAS  = [0,1.2,-0.4,2.1,0.8,-0.6,1.8,2.5,-0.3,1.1,0.9,-0.2,2.0,1.5,-0.8,2.4,0.7,1.6,-0.4,2.3]
BENCH_DELTAS = [0,0.6,-0.1,0.9,0.4,-0.3,0.8,1.2,-0.2,0.5,0.4,-0.1,1.0,0.7,-0.4,1.1,0.3,0.8,-0.2,1.0]
port_vals  = [100]; bench_vals = [100]
for d, b in zip(PERF_DELTAS[1:], BENCH_DELTAS[1:]):
    port_vals.append(round(port_vals[-1]  + d, 2))
    bench_vals.append(round(bench_vals[-1] + b, 2))
SESSIONS = [f"S{i+1}" for i in range(20)]

EXPS = [
    {
        "emoji": "🤝", "role": "Chargé de Relations Partenaires", "company": "Agorize",
        "period": "2023 – 2025", "loc": "France", "tag": "Business Development", "tagcol": TK_COL,
        "bullets": [
            "🎯 Prospection & acquisition de 10+ partenaires stratégiques : KPMG, BPCE, Accenture",
            "📋 Gestion du cycle commercial complet — qualification → pitch → closing → suivi",
            "🗣️ Adaptation du discours selon l'interlocuteur (C-level, direction financière)",
            "📊 Préparation de supports de présentation pour réunions stratégiques top management",
        ],
        "kpis": ["10+ partenaires closés", "Grands comptes C-level", "End-to-end cycle"],
    },
    {
        "emoji": "📊", "role": "Stage Data Analyst", "company": "Sodexo",
        "period": "Juin – Août 2024", "loc": "Paris", "tag": "Data & Analytics", "tagcol": SUCCESS,
        "bullets": [
            "📈 Analyse de données pour accompagner la prise de décision stratégique",
            "🖥️ Création de dashboards de performance opérationnelle en Python",
            "💡 Identification d'insights actionnables pour les équipes commerciales",
            "⚙️ Reporting automatisé pour la direction",
        ],
        "kpis": ["Python · Pandas", "Dashboards automatisés", "Decision support"],
    },
    {
        "emoji": "🍷", "role": "Président – Club Œnologie", "company": "Junia HEI",
        "period": "2023 – 2025", "loc": "Lille", "tag": "Leadership & Négo", "tagcol": AM_COL,
        "bullets": [
            "💰 Négociation budget 6 000 €/an auprès de 8 partenaires (domaines, cavistes)",
            "👥 Management d'une équipe de 20 membres — recrutement, formation, gestion de projet",
            "🤝 Développement et entretien d'un réseau partenaires sur la durée",
            "🎪 Organisation d'événements & représentation externe",
        ],
        "kpis": ["Budget 6 000 €/an", "8 partenaires", "20 membres managés"],
    },
]

SKILL_CATS = {
    "📈 Sales & BizDev": [
        ("Business Development B2B",       88),
        ("Pitch & Storytelling client",    90),
        ("Pipeline management & CRM",      83),
        ("Prospection & Cold Outreach",    80),
        ("Négociation & Closing",          78),
    ],
    "🏦 Finance & Marchés": [
        ("Equity & Capital Markets",       85),
        ("Gestion de portefeuille",        80),
        ("Analyse financière",             82),
        ("Macroéconomie",                  76),
        ("Modélisation Excel / VBA",       88),
    ],
    "⚡ Tech & Data": [
        ("Python (Pandas · Matplotlib)",   80),
        ("Dashboarding (Streamlit)",       82),
        ("Excel avancé — TOSA 868/1000",  90),
        ("Prompt Engineering / IA",        87),
        ("Data Analysis & Insights",       84),
    ],
}

EDUS = [
    ("🇺🇸", "University of Florida",       "Jan. 2026 – Présent", "Gainesville, FL",
     "Equity & Capital Markets · Business Development · Data Analysis · Statistics"),
    ("🎓", "Junia HEI – Option Finance",   "2024 – Présent",      "Lille",
     "Capital Markets · Probabilités · Statistiques · Project Management"),
    ("📐", "Classe Préparatoire MPSI / MP","2022 – 2024",         "Lycée La Salle, Lille",
     "Mathématiques · Physique · Informatique — Formation d'excellence analytique"),
]


# ─── Session state for mode ────────────────────────────────────────────────────
if "mode" not in st.session_state:
    st.session_state["mode"] = "⚡ Fintech / Tech"

# ─── NAV / MODE TOGGLE ────────────────────────────────────────────────────────
st.markdown("<div style='text-align:center;margin-bottom:0.5rem;'>", unsafe_allow_html=True)
mode = st.radio(
    "Mode",
    ["🏦 Asset Management", "⚡ Fintech / Tech"],
    index=1,
    horizontal=True,
    label_visibility="hidden",
)
st.markdown("</div>", unsafe_allow_html=True)

P = AM_COL if "Asset" in mode else TK_COL
set_primary(P)

st.markdown("<hr>", unsafe_allow_html=True)


# ─── HERO ─────────────────────────────────────────────────────────────────────
badge_txt = (
    "Disponible — Stage 6 mois · Juin 2026 · Asset Management"
    if "Asset" in mode else
    "Open to work · Client Solutions & Sales · Fintech / Tech"
)
st.markdown(f"""
<div style="text-align:center;padding:32px 0 24px;">
  <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 18px;
              border-radius:24px;background:{P}18;border:1px solid {P}44;
              color:{P};font-size:12px;font-weight:700;margin-bottom:28px;">
    <span style="width:7px;height:7px;border-radius:50%;background:{P};display:inline-block;"></span>
    {badge_txt}
  </div>
  <h1 style="font-size:clamp(38px,5vw,64px);font-weight:900;letter-spacing:-.02em;
             line-height:1.05;margin-bottom:16px;color:{TEXT};">
    Romain Chalard
  </h1>
  <p style="font-size:clamp(14px,1.8vw,19px);color:{MUTED};margin-bottom:10px;font-weight:400;">
    {"Business Development · Client Solutions · Asset Management"
     if "Asset" in mode else
     "Sales & Client Solutions · Business Dev · Fintech / SaaS"}
  </p>
  <p style="font-size:14px;color:{DIM};max-width:560px;margin:0 auto 36px;line-height:1.75;">
    {"Ingénieur financier bilingue, alliant culture des marchés de capitaux, maîtrise des outils quantitatifs et capacité à construire des relations clients durables dans un environnement exigeant."
     if "Asset" in mode else
     "Ingénieur bilingue orienté croissance, avec une solide culture commerciale et l'appétence pour les outils digitaux — capable d'accélérer l'acquisition et la rétention client d'une fintech dès le premier jour."}
  </p>
  <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:36px;">
    {stat_chip("10+", "partenaires B2B closés", P)}
    {stat_chip("6 000 €/an", "budget négocié & géré", P)}
    {stat_chip("C1 (186)", "Anglais — Cambridge", P)}
    {stat_chip("TOSA 868", "Excel certifié avancé", P)}
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
    <a href="mailto:rom1chalard@gmail.com"
       style="padding:12px 26px;background:{P};color:#fff;border-radius:8px;
              font-weight:700;font-size:14px;text-decoration:none;">
      ✉️ Me contacter
    </a>
    <a href="https://linkedin.com/in/r-chalard" target="_blank"
       style="padding:12px 26px;background:transparent;color:{TEXT};
              border:1px solid {BORDER};border-radius:8px;
              font-weight:700;font-size:14px;text-decoration:none;">
      LinkedIn →
    </a>
    <a href="https://portfolio-finance-romain-chalard.streamlit.app/" target="_blank"
       style="padding:12px 26px;background:transparent;color:{MUTED};
              border:1px solid {BORDER};border-radius:8px;
              font-weight:600;font-size:14px;text-decoration:none;">
      Portfolio Finance ↗
    </a>
  </div>
</div>
""", unsafe_allow_html=True)

st.markdown("<hr>", unsafe_allow_html=True)


# ─── EXPERIENCES ──────────────────────────────────────────────────────────────
st.markdown(f"<h2 style='font-size:22px;font-weight:800;margin-bottom:4px;'>Expériences</h2>", unsafe_allow_html=True)
st.markdown(f"<p style='color:{DIM};font-size:13px;margin-bottom:20px;'>Parcours orienté Business Development & relations clients</p>", unsafe_allow_html=True)

for e in EXPS:
    kpi_html = " ".join(
        f'<span style="background:{e["tagcol"]}18;color:{e["tagcol"]};border:1px solid {e["tagcol"]}33;'
        f'border-radius:6px;padding:4px 11px;font-size:12px;font-weight:700;">{k}</span>'
        for k in e["kpis"]
    )
    with st.expander(f'{e["emoji"]}  {e["role"]}  ·  {e["company"]}  ·  {e["period"]}'):
        for b in e["bullets"]:
            st.markdown(f"<div style='padding:8px 0;font-size:13.5px;color:#B0C0D8;border-bottom:1px solid {BORDER}55;'>{b}</div>", unsafe_allow_html=True)
        st.markdown(f"<div style='margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;'>{kpi_html}</div>", unsafe_allow_html=True)

st.markdown("<hr>", unsafe_allow_html=True)


# ─── INTERACTIVE TOOLS ────────────────────────────────────────────────────────
tool_label = (
    "Maîtrise des marchés financiers & analyse quantitative — démos live"
    if "Asset" in mode else
    "Capacités analytiques & commerciales appliquées — démos live"
)
st.markdown(f"<h2 style='font-size:22px;font-weight:800;margin-bottom:4px;'>Outils Interactifs</h2>", unsafe_allow_html=True)
st.markdown(f"<p style='color:{DIM};font-size:13px;margin-bottom:20px;'>{tool_label}</p>", unsafe_allow_html=True)

tool_tab1, tool_tab2, tool_tab3 = st.tabs([
    "📊  Asset Allocator",
    "🎯  Sales Pipeline",
    "📈  Performance Monitor",
])

# ── Tool 1 ── Asset Allocator ─────────────────────────────────────────────────
with tool_tab1:
    st.markdown(f"<p style='color:{MUTED};font-size:13px;margin-bottom:8px;'>Ajuste les pondérations par classe d'actifs et observe en temps réel l'impact sur le rendement, la volatilité et le ratio de Sharpe.</p>", unsafe_allow_html=True)

    col_sl, col_charts = st.columns([1, 1], gap="large")

    with col_sl:
        raw = {}
        for a in ASSETS:
            default = {"equities": 40, "bonds": 25, "alternatives": 15, "pe": 10, "cash": 10}[a["key"]]
            raw[a["key"]] = st.slider(
                f'{a["label"]}  ·  E[R] {a["er"]*100:.1f}%  ·  Vol {a["vol"]*100:.0f}%',
                min_value=0, max_value=100, value=default, step=5, key=f"sl_{a['key']}"
            )
        total = sum(raw.values()) or 1
        wts = {k: v / total for k, v in raw.items()}
        st.caption(f"Total brut : {sum(raw.values())}  — poids normalisés à 100% pour le calcul.")

    with col_charts:
        ER  = sum(wts[a["key"]] * a["er"]  for a in ASSETS)
        VOL = np.sqrt(sum((wts[a["key"]] * a["vol"]) ** 2 for a in ASSETS))
        SHP = (ER - 0.02) / VOL if VOL > 0 else 0

        # KPI row
        m1, m2, m3 = st.columns(3)
        m1.metric("E[Rendement]",  f"{ER*100:.1f}%")
        m2.metric("Volatilité",    f"{VOL*100:.1f}%")
        m3.metric("Sharpe Ratio",  f"{SHP:.2f}")

        # Pie chart
        fig_pie = go.Figure(go.Pie(
            labels=[a["label"] for a in ASSETS],
            values=[round(wts[a["key"]] * 100) for a in ASSETS],
            hole=0.55,
            marker_colors=[a["color"] for a in ASSETS],
            textinfo="percent",
            hovertemplate="%{label}: %{value}%<extra></extra>",
        ))
        fig_pie.update_layout(
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            legend=dict(font=dict(color=MUTED, size=12)),
            margin=dict(t=10, b=10, l=10, r=10),
            height=230,
        )
        st.plotly_chart(fig_pie, use_container_width=True, config={"displayModeBar": False})

        st.markdown(
            f"<div style='font-size:12px;color:{MUTED};padding:10px 14px;background:{CARD};"
            f"border:1px solid {BORDER};border-radius:8px;line-height:1.6;'>"
            f"💡 Un Sharpe &gt; 1 indique un bon compromis rendement / risque. Modèle simplifié "
            f"(corrélations nulles) — usage pédagogique.</div>",
            unsafe_allow_html=True,
        )

# ── Tool 2 ── Sales Pipeline ──────────────────────────────────────────────────
with tool_tab2:
    st.markdown(f"<p style='color:{MUTED};font-size:13px;margin-bottom:8px;'>Visualisation d'un pipeline B2B type — maîtrise des KPIs commerciaux, taux de conversion par étape et gestion du cycle de vente.</p>", unsafe_allow_html=True)

    k1, k2, k3, k4 = st.columns(4)
    k1.metric("Pipeline total",  "€2.16M")
    k2.metric("Taux global",     "4.2%")
    k3.metric("Deals actifs",    "94")
    k4.metric("Win rate final",  "71%")

    st.markdown("<br>", unsafe_allow_html=True)

    # Horizontal funnel bar chart
    stages  = [f["stage"] for f in FUNNEL]
    counts  = [f["n"]     for f in FUNNEL]
    vals    = [f["val"]   for f in FUNNEL]
    colors  = [f["color"] for f in FUNNEL]
    max_n   = FUNNEL[0]["n"]

    fig_pipe = go.Figure()
    for i, f in enumerate(FUNNEL):
        fig_pipe.add_trace(go.Bar(
            y=[f["stage"]],
            x=[f["n"]],
            orientation="h",
            marker_color=f["color"],
            name=f["stage"],
            hovertemplate=(
                f"<b>{f['stage']}</b><br>{f['n']} deals<br>€{f['val']}k<extra></extra>"
            ),
            text=f'  {f["n"]} deals · €{f["val"]}k',
            textposition="outside",
            textfont=dict(color=MUTED, size=12),
        ))

    fig_pipe.update_layout(
        showlegend=False,
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(showgrid=False, showticklabels=False, zeroline=False, range=[0, max_n * 1.4]),
        yaxis=dict(tickfont=dict(color=TEXT, size=13), autorange="reversed"),
        barmode="overlay",
        height=320,
        margin=dict(t=10, b=10, l=10, r=80),
    )
    st.plotly_chart(fig_pipe, use_container_width=True, config={"displayModeBar": False})

    # Conversion rates row
    conv_cols = st.columns(len(FUNNEL) - 1)
    for i in range(1, len(FUNNEL)):
        rate = round(FUNNEL[i]["n"] / FUNNEL[i-1]["n"] * 100)
        conv_cols[i-1].markdown(
            f"<div style='text-align:center;font-size:11px;color:{MUTED};'>"
            f"<div style='font-size:15px;font-weight:800;color:{FUNNEL[i]['color']};'>{rate}%</div>"
            f"{FUNNEL[i-1]['stage'].split()[0]}→{FUNNEL[i]['stage'].split()[0]}</div>",
            unsafe_allow_html=True,
        )

# ── Tool 3 ── Performance Monitor ─────────────────────────────────────────────
with tool_tab3:
    st.markdown(f"<p style='color:{MUTED};font-size:13px;margin-bottom:8px;'>Suivi de la performance relative d'un portefeuille actions vs benchmark — réplique les outils développés en Python pour la gestion de portefeuille personnel (depuis 2024).</p>", unsafe_allow_html=True)

    last_port  = port_vals[-1]
    last_bench = bench_vals[-1]
    alpha_val  = last_port - last_bench

    p1, p2, p3 = st.columns(3)
    p1.metric("Portefeuille", f"+{last_port - 100:.1f}%")
    p2.metric("Benchmark",    f"+{last_bench - 100:.1f}%")
    p3.metric("Alpha généré", f"+{alpha_val:.1f}%", delta=f"+{alpha_val:.1f}%")

    fig_perf = go.Figure()
    fig_perf.add_trace(go.Scatter(
        x=SESSIONS, y=port_vals, name="Portefeuille",
        mode="lines", line=dict(color=SUCCESS, width=2.5),
        fill="tozeroy", fillcolor="rgba(16,185,129,.12)",
    ))
    fig_perf.add_trace(go.Scatter(
        x=SESSIONS, y=bench_vals, name="Benchmark",
        mode="lines", line=dict(color=WARN, width=2, dash="dot"),
        fill="tozeroy", fillcolor="rgba(245,158,11,.07)",
    ))
    fig_perf.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(font=dict(color=MUTED, size=12), bgcolor="rgba(0,0,0,0)"),
        xaxis=dict(tickfont=dict(color=MUTED, size=11), gridcolor=BORDER, zeroline=False),
        yaxis=dict(tickfont=dict(color=MUTED, size=11), gridcolor=BORDER, zeroline=False),
        height=280,
        margin=dict(t=10, b=10, l=10, r=10),
    )
    st.plotly_chart(fig_perf, use_container_width=True, config={"displayModeBar": False})

    st.markdown(
        f"<div style='font-size:12px;color:{MUTED};padding:10px 14px;background:{CARD};"
        f"border:1px solid {BORDER};border-radius:8px;line-height:1.6;'>"
        f"💡 <strong style='color:{TEXT};'>Contexte :</strong> Suivi actif d'un portefeuille "
        f"personnel actions / options depuis 2024, avec analyse macroéconomique quotidienne et "
        f"outils Python (Pandas · Matplotlib · Streamlit) développés en autonomie.</div>",
        unsafe_allow_html=True,
    )

st.markdown("<hr>", unsafe_allow_html=True)


# ─── SKILLS ───────────────────────────────────────────────────────────────────
st.markdown(f"<h2 style='font-size:22px;font-weight:800;margin-bottom:4px;'>Compétences & Outils</h2>", unsafe_allow_html=True)
st.markdown(f"<p style='color:{DIM};font-size:13px;margin-bottom:20px;'>Maîtrise transversale : commercial · finance · tech</p>", unsafe_allow_html=True)

sk_tabs = st.tabs(list(SKILL_CATS.keys()))
for tab, (cat_name, skills) in zip(sk_tabs, SKILL_CATS.items()):
    with tab:
        st.markdown("<br>", unsafe_allow_html=True)
        for name, lvl in skills:
            col_name, col_bar = st.columns([3, 7])
            with col_name:
                st.markdown(f"<div style='font-size:13px;font-weight:600;padding-top:4px;'>{name}</div>", unsafe_allow_html=True)
            with col_bar:
                st.progress(lvl / 100)
                st.markdown(f"<div style='font-size:11px;color:{P};text-align:right;margin-top:-14px;'>{lvl}%</div>", unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)

# Certs + stack row
c1, c2 = st.columns(2, gap="medium")

with c1:
    st.markdown(f"""
    {card_html(f'''
      <div style="font-weight:700;font-size:13px;margin-bottom:14px;">🏅 Certifications</div>
      <div style="display:flex;justify-content:space-between;padding:9px 0;
                  border-bottom:1px solid {BORDER};">
        <span style="font-size:13px;color:{MUTED};">Cambridge C1 Advanced</span>
        <span style="font-size:12px;font-weight:800;color:{TK_COL};">186 / 210</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:9px 0;">
        <span style="font-size:13px;color:{MUTED};">Excel TOSA</span>
        <span style="font-size:12px;font-weight:800;color:{AM_COL};">868 / 1000</span>
      </div>
    ''')}""", unsafe_allow_html=True)

with c2:
    tools_pills = " ".join(
        f'<span style="background:{P}18;color:{P};border:1px solid {P}33;'
        f'border-radius:6px;padding:4px 11px;font-size:12px;font-weight:600;">{t}</span>'
        for t in ["Python", "Excel / VBA", "Streamlit", "PowerPoint", "Prompt AI",
                  "Pandas", "Matplotlib", "Bloomberg*"]
    )
    st.markdown(f"""
    {card_html(f'''
      <div style="font-weight:700;font-size:13px;margin-bottom:14px;">🛠 Stack</div>
      <div style="display:flex;flex-wrap:wrap;gap:7px;">{tools_pills}</div>
      <div style="font-size:10px;color:{MUTED};margin-top:10px;">* Notions acquises en cours</div>
    ''')}""", unsafe_allow_html=True)

st.markdown("<hr>", unsafe_allow_html=True)


# ─── EDUCATION ────────────────────────────────────────────────────────────────
st.markdown(f"<h2 style='font-size:22px;font-weight:800;margin-bottom:4px;'>Formation</h2>", unsafe_allow_html=True)
st.markdown(f"<p style='color:{DIM};font-size:13px;margin-bottom:20px;'>Ingénieur + Finance + Expérience internationale</p>", unsafe_allow_html=True)

for flag, school, period, loc, detail in EDUS:
    st.markdown(card_html(f"""
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;
                  gap:8px;margin-bottom:5px;">
        <span style="font-weight:700;font-size:14px;">{flag} {school}</span>
        <span style="font-size:12px;color:{MUTED};">{period}</span>
      </div>
      <div style="font-size:12px;color:{MUTED};margin-bottom:5px;">{loc}</div>
      <div style="font-size:12px;color:{DIM};">{detail}</div>
    """), unsafe_allow_html=True)

st.markdown("<hr>", unsafe_allow_html=True)


# ─── CONTACT ──────────────────────────────────────────────────────────────────
avail = "juin 2026" if "Asset" in mode else "juin 2026"
focus = "Client Solutions, Business Dev, Sales"
ctx   = "Asset Management" if "Asset" in mode else "Fintech / Tech"

st.markdown(f"""
<div style="background:{CARD};border:1px solid {BORDER};border-radius:16px;
            padding:52px 28px;text-align:center;margin-bottom:20px;">
  <h2 style="font-size:28px;font-weight:800;letter-spacing:-.01em;margin-bottom:14px;">
    Parlons-en 👋
  </h2>
  <p style="color:{MUTED};font-size:15px;max-width:500px;margin:0 auto 32px;line-height:1.7;">
    Disponible pour un stage 6 mois à partir de
    <strong style="color:{TEXT};">{avail}</strong> —
    ouvert aux opportunités en
    <strong style="color:{P};">{focus}</strong>
    dans un contexte {ctx}.
  </p>
  <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
    <a href="mailto:rom1chalard@gmail.com"
       style="padding:13px 28px;background:{P};color:#fff;border-radius:8px;
              font-weight:700;font-size:14px;text-decoration:none;">
      ✉️  rom1chalard@gmail.com
    </a>
    <a href="https://linkedin.com/in/r-chalard" target="_blank"
       style="padding:13px 28px;background:transparent;color:{TEXT};
              border:1px solid {BORDER};border-radius:8px;
              font-weight:700;font-size:14px;text-decoration:none;">
      LinkedIn →
    </a>
  </div>
</div>
<div style="text-align:center;color:{DIM};font-size:11px;padding-bottom:32px;">
  Romain Chalard · 2026 · Paris / Gainesville, FL
</div>
""", unsafe_allow_html=True)
