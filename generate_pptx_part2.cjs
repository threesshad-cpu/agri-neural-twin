
// Agri-Neural Twin PPTX Generator — Part 2 (Slides 8–14) + save
const { prs } = require("./generate_pptx_part1.cjs");
const pptxgen = require("pptxgenjs");

const C = {
  bg:"0A1A0F", card:"1A3A2A", green:"2ECC71", gold:"F0C040",
  blue:"00B4D8", orange:"FF6B35", purple:"7B2FBE", white:"FFFFFF",
  muted:"8AB89A", dark:"061008", red:"C0392B", darkred:"1A0A0A"
};
function shadow() { return { type:"outer", blur:8, offset:3, angle:45, color:"000000", opacity:0.4 }; }

// ─── SLIDE 8: REVENUE MODEL ───────────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.gold} });
  sl.addText("REVENUE MODEL", { x:0.5, y:0.2, w:8, h:0.6, fontSize:34, bold:true, color:C.gold, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("Sustainable SaaS + Data-as-a-Service + B2G Strategy", { x:0.5, y:0.82, w:10, h:0.35, fontSize:14, color:C.muted, fontFace:"Calibri", italic:true });

  const tiers = [
    { title:"🌱 SUBSCRIPTION\nFarmer SaaS", price:"₹0 / ₹199 / mo", color:C.green, items:["Free tier: Basic dashboard", "Pro: AI advisory + reports", "FPO Plan: ₹2,999/mo", "10,000 farmer target Y1", "WhatsApp integration"] },
    { title:"📊 DATA-as-a-SERVICE\nDaaS B2B", price:"₹5–15L / year", color:C.blue, items:["Anonymized crop analytics", "Insurance companies (risk)", "Input dealers (seed/fert)", "Agri-fintech lenders", "NGOs + Research orgs"] },
    { title:"🏛️ GOVT CONTRACTS\nB2G", price:"₹25–50L / yr", color:C.purple, items:["TN Agri Dept dashboard", "District Collector view", "TNAU data partnership", "NABARD yield reports", "Policy simulation tools"] }
  ];

  tiers.forEach((t, i) => {
    const x = 0.4 + i * 4.25;
    sl.addShape(prs.ShapeType.rect, { x, y:1.3, w:4.0, h:4.8, fill:{color:C.card}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x, y:1.3, w:4.0, h:1.0, fill:{color:t.color} });
    sl.addText(t.title, { x, y:1.3, w:4.0, h:1.0, fontSize:12, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
    sl.addShape(prs.ShapeType.ellipse, { x:x+1.2, y:2.55, w:1.6, h:0.6, fill:{color:C.dark} });
    sl.addText(t.price, { x:x+1.2, y:2.55, w:1.6, h:0.6, fontSize:10, bold:true, color:t.color, align:"center", fontFace:"Trebuchet MS" });
    t.items.forEach((item, j) => sl.addText(`• ${item}`, { x:x+0.15, y:3.3 + j*0.5, w:3.7, h:0.45, fontSize:10, color:C.white, fontFace:"Calibri" }));
  });

  // TAM/SAM bar
  sl.addShape(prs.ShapeType.rect, { x:0, y:6.85, w:13.33, h:0.65, fill:{color:C.card} });
  sl.addText("TAM: ₹12,000 Cr (Indian AgriTech)  |  SAM: ₹1,800 Cr (TN Farmer Digital)  |  SOM Y1: ₹25 Lakh  |  SOM Y3: ₹8 Cr", { x:0, y:6.85, w:13.33, h:0.65, fontSize:12, bold:true, color:C.gold, align:"center", fontFace:"Calibri" });
}

// ─── SLIDE 9: GOVERNMENT PARTNERSHIPS ────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.blue} });
  sl.addText("GOVERNMENT ALIGNMENT", { x:0.5, y:0.2, w:10, h:0.6, fontSize:30, bold:true, color:C.blue, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("6 Active Scheme Alignments — Ready for MoU", { x:0.5, y:0.82, w:8, h:0.35, fontSize:14, color:C.muted, fontFace:"Calibri", italic:true });

  const schemes = [
    { name:"PM-KISAN", color:C.green, align:"Real-time income support tracking; Aadhaar-linked farmer registry integration" },
    { name:"TNAU Partnership", color:C.blue, align:"TNAU crop advisory algorithms; district-level research data pipeline" },
    { name:"ICAR Integration", color:C.gold, align:"Soil health card digitization; NPK benchmarking against ICAR standards" },
    { name:"NABARD DaaS", color:C.orange, align:"Anonymized yield data for crop loan risk assessment; FPO credit scoring" },
    { name:"TNIAMP Scheme", color:C.purple, align:"Micro-irrigation subsidy eligibility auto-detection based on farmer profile" },
    { name:"AgriStack / EDI-TN", color:C.muted, align:"Unified Farmer ID login; AgriStack API-ready data connector layer" }
  ];

  schemes.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 6.4;
    const y = 1.3 + row * 1.65;
    sl.addShape(prs.ShapeType.rect, { x, y, w:6.1, h:1.45, fill:{color:C.card}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x, y, w:0.1, h:1.45, fill:{color:s.color} });
    sl.addShape(prs.ShapeType.rect, { x:x+0.1, y, w:2.2, h:0.45, fill:{color:s.color} });
    sl.addText(s.name, { x:x+0.1, y, w:2.2, h:0.45, fontSize:11, bold:true, color:C.dark, fontFace:"Trebuchet MS", align:"center" });
    sl.addText(s.align, { x:x+0.2, y:y+0.5, w:5.7, h:0.85, fontSize:10, color:C.white, fontFace:"Calibri", wrap:true });
  });

  sl.addShape(prs.ShapeType.rect, { x:0, y:6.85, w:13.33, h:0.65, fill:{color:"0A2A0A"}, line:{color:C.green, width:1} });
  sl.addText("📋  MoU READY — Letter of Intent drafted for TNAU & EDI-TN  |  Actively seeking Govt pilot partnership for 5 districts", { x:0.3, y:6.85, w:13.0, h:0.65, fontSize:12, color:C.green, align:"center", fontFace:"Calibri" });
}

// ─── SLIDE 10: MARKET OPPORTUNITY ────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.orange} });
  sl.addText("MARKET OPPORTUNITY", { x:0.5, y:0.2, w:8, h:0.6, fontSize:30, bold:true, color:C.orange, fontFace:"Trebuchet MS", shadow:shadow() });

  // Chart 1: Bar chart — Revenue projection
  const barChartData = [
    { name:"Revenue (₹ Lakhs)", labels:["Y1 — 2026","Y2 — 2027","Y3 — 2028"], values:[25, 120, 800] }
  ];
  sl.addChart(prs.ChartType.bar, barChartData, {
    x:0.4, y:1.0, w:6.0, h:3.5,
    barDir:"col",
    title:"Revenue Projection (₹ Lakhs)",
    titleFontSize:12,
    titleColor:C.gold,
    showValue:true,
    dataLabelColor:C.white,
    dataLabelFontSize:11,
    dataLabelFontBold:true,
    chartColors:[C.green, C.blue, C.orange],
    catAxisLabelColor:C.white,
    valAxisLabelColor:C.white,
    legendColor:C.white,
    plotAreaFillColor:C.card,
    chartAreaFillColor:C.bg,
    shadow:shadow()
  });

  // Chart 2: Donut
  const donutData = [
    { name:"Currently Served", labels:["Currently Served","Our Target Y1","Remaining Market"], values:[500000, 100000, 7600000] }
  ];
  sl.addChart(prs.ChartType.doughnut, donutData, {
    x:6.7, y:1.0, w:6.3, h:3.5,
    title:"TN Farmer Coverage (8.2M Total)",
    titleFontSize:12,
    titleColor:C.gold,
    showLabel:true,
    showValue:false,
    showPercent:true,
    chartColors:[C.muted, C.green, C.card],
    legendColor:C.white,
    chartAreaFillColor:C.bg,
    shadow:shadow()
  });

  // TAM SAM SOM boxes
  const boxes = [
    { label:"TAM", val:"₹12,000 Cr", sub:"Indian AgriTech Market", color:C.purple },
    { label:"SAM", val:"₹1,800 Cr", sub:"TN Digital Farmer Segment", color:C.blue },
    { label:"SOM", val:"₹8 Cr Y3", sub:"Reachable by 2028", color:C.green }
  ];
  boxes.forEach((b, i) => {
    const x = 0.4 + i * 4.3;
    sl.addShape(prs.ShapeType.rect, { x, y:4.75, w:4.0, h:1.5, fill:{color:C.card}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x, y:4.75, w:4.0, h:0.1, fill:{color:b.color} });
    sl.addText(b.label, { x, y:4.9, w:4.0, h:0.45, fontSize:18, bold:true, color:b.color, align:"center", fontFace:"Trebuchet MS" });
    sl.addText(b.val, { x, y:5.35, w:4.0, h:0.4, fontSize:16, bold:true, color:C.white, align:"center", fontFace:"Trebuchet MS" });
    sl.addText(b.sub, { x, y:5.75, w:4.0, h:0.35, fontSize:9, color:C.muted, align:"center", fontFace:"Calibri" });
  });
}

// ─── SLIDE 11: ROADMAP ────────────────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.green} });
  sl.addText("PRODUCT ROADMAP", { x:0.5, y:0.2, w:8, h:0.6, fontSize:34, bold:true, color:C.green, fontFace:"Trebuchet MS", shadow:shadow() });

  // Timeline bar
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:1.15, w:12.5, h:0.08, fill:{color:C.muted} });
  [0,1,2,3].forEach(i => sl.addShape(prs.ShapeType.ellipse, { x:0.9+i*3.1, y:1.05, w:0.28, h:0.28, fill:{color:C.green} }));

  const phases = [
    { label:"PHASE 1\n0 – 2 Months", color:C.green, items:["✅ MVP deployed on Vercel","✅ 38-district dashboard","✅ StateBrain risk engine","✅ Aadhaar login system","✅ 6-language interface","🔧 Live sensor data feed"] },
    { label:"PHASE 2\n3 – 6 Months", color:C.blue, items:["📡 LoRaWAN IoT sensor kits","🏫 TNAU pilot (5 districts)","📱 PWA mobile-first app","🔗 AgriStack API connect","💾 PostgreSQL migration","📊 Offline data sync"] },
    { label:"PHASE 3\n1 – 2 Years", color:C.gold, items:["🛰️ VIIRS/Sentinel imagery","👥 10,000 farmer network","🤝 NABARD FPO finance","🏪 Mandi price live API","📈 VC Series A funding","🌐 3-state expansion"] },
    { label:"PHASE 4\n3+ Years", color:C.purple, items:["🚁 Drone precision-twin","🇮🇳 National rollout","💹 IPO-ready structure","🤖 LLM crop doctor app","🌏 SAARC region export","🏆 GovTech award target"] }
  ];

  phases.forEach((p, i) => {
    const x = 0.4 + i * 3.2;
    sl.addShape(prs.ShapeType.rect, { x, y:1.5, w:3.0, h:4.8, fill:{color:C.card}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x, y:1.5, w:3.0, h:0.6, fill:{color:p.color} });
    sl.addText(p.label, { x, y:1.5, w:3.0, h:0.6, fontSize:11, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
    p.items.forEach((item, j) => sl.addText(item, { x:x+0.1, y:2.2 + j*0.55, w:2.8, h:0.5, fontSize:9.5, color:C.white, fontFace:"Calibri" }));
  });

  // Future ticker
  sl.addShape(prs.ShapeType.rect, { x:0, y:6.85, w:13.33, h:0.65, fill:{color:C.card} });
  sl.addText("🔮 FUTURE: AI Drone Scouting  ·  NFT Land Registry  ·  Carbon Credit Marketplace  ·  Hyper-local Micro-Climate AI  ·  Quantum Soil Sensors", { x:0, y:6.85, w:13.33, h:0.65, fontSize:11, color:C.blue, align:"center", italic:true, fontFace:"Calibri" });
}

// ─── SLIDE 12: Q&A PRE-EMPTION ───────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.gold} });
  sl.addText("JURY Q&A — PRE-EMPTED", { x:0.5, y:0.2, w:9, h:0.6, fontSize:30, bold:true, color:C.gold, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("We've thought about your questions.", { x:0.5, y:0.82, w:8, h:0.35, fontSize:14, color:C.muted, fontFace:"Calibri", italic:true });

  const qas = [
    { q:"How is this different from Kisan Suvidha or eSagu?", color:C.green, a:"Kisan Suvidha is a static information portal. We are a real-time AI Digital Twin — StateBrain simulates 1000 future seasons, predicts cross-district market gluts, and delivers context-aware Gemini AI advisory in 6 languages. No other platform does geospatial block-level twin simulation for TN." },
    { q:"Most TN farmers lack internet. How does this reach them?", color:C.blue, a:"PWA offline mode caches district data; SMS/WhatsApp delivery of AI advisories is roadmap Phase 2. Our login works on any 2G network. Field officers act as proxies via the Officer dashboard. Village kiosk model is planned with TNAU." },
    { q:"What are your actual data sources?", color:C.orange, a:"Current: Mock TN AgriStack telemetry, published NPK district averages (TNAU), APMC mandi price CSVs, OpenWeatherMap API. Phase 2: LoRaWAN soil sensors (partnered with 2 vendors), IMD API, Bharat Vistaar satellite integration." },
    { q:"What is the current AI accuracy?", color:C.purple, a:"StateBrain market glut predictor: ~78% directional accuracy vs APMC historical data (backtested 2019–2024). Gemini advisory: qualitative, no accuracy metric. Phase 2 targets: 85%+ with real IoT sensor input and LSTM neural forecasting layer." }
  ];

  qas.forEach((qa, i) => {
    const x = i % 2 === 0 ? 0.4 : 6.8;
    const y = i < 2 ? 1.3 : 4.1;
    sl.addShape(prs.ShapeType.rect, { x, y, w:6.2, h:2.55, fill:{color:C.card}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x, y, w:0.1, h:2.55, fill:{color:qa.color} });
    sl.addText(`❓  ${qa.q}`, { x:x+0.2, y:y+0.1, w:5.8, h:0.55, fontSize:10.5, bold:true, color:qa.color, fontFace:"Trebuchet MS", wrap:true });
    sl.addText(qa.a, { x:x+0.2, y:y+0.7, w:5.8, h:1.75, fontSize:9.5, color:C.white, fontFace:"Calibri", wrap:true });
  });
}

// ─── SLIDE 13: TEAM + CLOSING ─────────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.green} });
  sl.addText("TEAM UZHAVAR INTELLIGENCE", { x:0.5, y:0.2, w:9, h:0.55, fontSize:28, bold:true, color:C.green, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("உழவர் புத்திசாலிகள் — Smart Farmers, Smarter Future", { x:0.5, y:0.78, w:9, h:0.35, fontSize:13, color:C.gold, fontFace:"Calibri", italic:true });

  const members = [
    { name:"Threessha D", role:"Team Lead · Full-Stack Architect", star:true, x:0.4, y:1.25 },
    { name:"Padma Priya V", role:"UI/UX · Frontend Engineer", star:false, x:4.8, y:1.25 },
    { name:"K. Sathyapriya", role:"AI/ML · Data Engineer", star:false, x:9.2, y:1.25 },
    { name:"Santhosh Kumar B", role:"Backend · API Integration", star:false, x:2.0, y:3.9 },
    { name:"Karthikeyan K", role:"DevOps · Deployment Lead", star:false, x:7.0, y:3.9 }
  ];

  members.forEach(m => {
    const color = m.star ? C.gold : C.card;
    const border = m.star ? C.gold : C.green;
    sl.addShape(prs.ShapeType.rect, { x:m.x, y:m.y, w:3.7, h:2.3, fill:{color}, line:{color:border,width:m.star?2:1}, shadow:shadow() });
    if (m.star) {
      sl.addShape(prs.ShapeType.rect, { x:m.x, y:m.y, w:3.7, h:0.08, fill:{color:C.gold} });
      sl.addText("⭐ LEAD", { x:m.x, y:m.y+0.1, w:3.7, h:0.35, fontSize:9, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
    }
    sl.addShape(prs.ShapeType.ellipse, { x:m.x+1.35, y:m.y+(m.star?0.5:0.2), w:1.0, h:1.0, fill:{color:m.star?"2A1A00":C.card}, line:{color:border,width:1.5} });
    sl.addText("👤", { x:m.x+1.35, y:m.y+(m.star?0.5:0.2), w:1.0, h:1.0, fontSize:24, align:"center" });
    sl.addText(m.name, { x:m.x, y:m.y+(m.star?1.6:1.3), w:3.7, h:0.4, fontSize:12, bold:true, color:m.star?C.dark:C.white, align:"center", fontFace:"Trebuchet MS" });
    sl.addText(m.role, { x:m.x, y:m.y+(m.star?2.0:1.7), w:3.7, h:0.35, fontSize:9.5, color:m.star?C.dark:C.muted, align:"center", fontFace:"Calibri" });
  });

  sl.addText("C. Abdul Hakeem College of Engineering & Technology", { x:0.4, y:6.3, w:12.5, h:0.35, fontSize:11, color:C.muted, align:"center", fontFace:"Calibri" });
  // Closing banner
  sl.addShape(prs.ShapeType.rect, { x:0, y:6.7, w:13.33, h:0.8, fill:{color:C.green} });
  sl.addText("🌾 Uzhavar Intelligence | Nimirndhu Nil 2026  |  🌐 nimirndhunil.vercel.app  |  📧 threessha@example.com  |  ⭐ github.com/threesshad-cpu/agri-neural-twin", { x:0, y:6.7, w:13.33, h:0.8, fontSize:11, bold:true, color:C.dark, align:"center", fontFace:"Calibri" });
}

// ─── SLIDE 14: CALL TO ACTION ─────────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  // Large decorative background circle
  sl.addShape(prs.ShapeType.ellipse, { x:3.5, y:0.5, w:6.5, h:6.5, fill:{color:"0F2A18"}, line:{color:C.green, width:1} });
  sl.addShape(prs.ShapeType.ellipse, { x:4.5, y:1.3, w:4.5, h:4.5, fill:{color:"162E1E"}, line:{color:C.gold, width:1} });
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:0.12, h:7.5, fill:{color:C.green} });
  sl.addShape(prs.ShapeType.rect, { x:13.21, y:0, w:0.12, h:7.5, fill:{color:C.green} });
  sl.addText("THE SEED IS PLANTED.", { x:0.5, y:1.5, w:12.3, h:0.9, fontSize:40, bold:true, color:C.green, align:"center", fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("Let's Grow Tamil Nadu's Agricultural Future — Together.", { x:0.5, y:2.5, w:12.3, h:0.6, fontSize:18, color:C.gold, align:"center", fontFace:"Trebuchet MS", italic:true });
  sl.addShape(prs.ShapeType.rect, { x:3.5, y:3.3, w:6.3, h:0.05, fill:{color:C.green} });
  const ctas = [
    { icon:"🌐", text:"nimirndhunil.vercel.app" },
    { icon:"📂", text:"github.com/threesshad-cpu/agri-neural-twin" },
    { icon:"🏆", text:"Nimirndhu Nil — Govt of Tamil Nadu 2026" }
  ];
  ctas.forEach((c, i) => sl.addText(`${c.icon}  ${c.text}`, { x:1.5, y:3.6 + i*0.55, w:10.3, h:0.5, fontSize:13, color:C.white, align:"center", fontFace:"Calibri" }));
  sl.addShape(prs.ShapeType.rect, { x:0, y:7.0, w:13.33, h:0.5, fill:{color:C.card} });
  sl.addText("\"Sabka Saath, Sabka Vikas — Democratizing AI for Every Farmer\" | Uzhavar Intelligence", { x:0, y:7.0, w:13.33, h:0.5, fontSize:11, color:C.green, align:"center", italic:true, fontFace:"Calibri" });
}

// ─── SAVE ─────────────────────────────────────────────────────────────────────
prs.writeFile({ fileName: "Agri_Neural_Twin_FINAL.pptx" })
  .then(() => {
    console.log("✅  Agri_Neural_Twin_FINAL.pptx saved — 14 slides complete!");
    const fs = require("fs");
    const stats = fs.statSync("Agri_Neural_Twin_FINAL.pptx");
    console.log(`📦  File size: ${(stats.size / 1024).toFixed(1)} KB`);
  })
  .catch(e => console.error("❌ Error:", e));
