
// Agri-Neural Twin PPTX Generator - Part 1 (Slides 1-7)
const pptxgen = require("pptxgenjs");

const prs = new pptxgen();
prs.layout = "LAYOUT_WIDE";

// Color palette
const C = {
  bg: "0A1A0F", card: "1A3A2A", green: "2ECC71", gold: "F0C040",
  blue: "00B4D8", orange: "FF6B35", purple: "7B2FBE", white: "FFFFFF",
  muted: "8AB89A", dark: "061008", red: "C0392B", darkred: "1A0A0A"
};

function shadow() { return { type:"outer", blur:8, offset:3, angle:45, color:"000000", opacity:0.4 }; }

// ─── SLIDE 1: TITLE ──────────────────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  // Left accent strip
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:0.12, h:7.5, fill:{color:C.green} });
  // Top-right decorative circle (partial)
  sl.addShape(prs.ShapeType.ellipse, { x:9.5, y:-1.5, w:3.5, h:3.5, fill:{color:"1A3A2A"}, line:{color:C.green,width:2} });
  sl.addShape(prs.ShapeType.ellipse, { x:10, y:-0.8, w:2.5, h:2.5, fill:{color:"163A26"}, line:{color:C.gold,width:1} });
  // Main title
  sl.addText("AGRI-NEURAL TWIN", { x:0.3, y:1.2, w:8, h:1.2, fontSize:52, bold:true, color:C.green, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("நிமிர்ந்து நில் | Nimirndhu Nil", { x:0.3, y:2.4, w:8, h:0.5, fontSize:22, color:C.gold, fontFace:"Trebuchet MS", italic:true });
  sl.addText("District Intelligence & Agricultural Risk Engine for Tamil Nadu", { x:0.3, y:3.0, w:8.5, h:0.5, fontSize:16, color:C.white, fontFace:"Calibri" });
  // Divider
  sl.addShape(prs.ShapeType.rect, { x:0.3, y:3.6, w:9.5, h:0.03, fill:{color:C.green} });
  // Team info
  sl.addText("Team: Uzhavar Intelligence", { x:0.3, y:3.8, w:6, h:0.35, fontSize:14, bold:true, color:C.gold, fontFace:"Calibri" });
  sl.addText("Lead: Threessha D  |  Members: Padma Priya V, K. Sathyapriya, Santhosh Kumar B, Karthikeyan K", { x:0.3, y:4.15, w:9, h:0.35, fontSize:11, color:C.muted, fontFace:"Calibri" });
  sl.addText("C. Abdul Hakeem College of Engineering & Technology", { x:0.3, y:4.5, w:8, h:0.3, fontSize:11, color:C.muted, fontFace:"Calibri" });
  // Links
  sl.addText("🌐 nimirndhunil.vercel.app  |  GitHub: threesshad-cpu/agri-neural-twin", { x:0.3, y:4.9, w:8, h:0.3, fontSize:10, color:C.blue, fontFace:"Calibri" });
  // Hackathon badge
  sl.addShape(prs.ShapeType.rect, { x:8.2, y:6.4, w:3.6, h:0.9, fill:{color:C.gold}, shadow:shadow() });
  sl.addText("🏆 NIMIRNDHU NIL HACKATHON\nGovt of Tamil Nadu — 2026", { x:8.2, y:6.4, w:3.6, h:0.9, fontSize:10, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
  // Bottom tagline
  sl.addShape(prs.ShapeType.rect, { x:0, y:7.1, w:13.33, h:0.4, fill:{color:C.card} });
  sl.addText("\"From Soil Data to Smart Decisions — Democratizing AI for Every Farmer\"", { x:0, y:7.1, w:13.33, h:0.4, fontSize:11, color:C.green, align:"center", italic:true, fontFace:"Calibri" });
}

// ─── SLIDE 2: PROBLEM STATEMENT ──────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.orange} });
  sl.addText("THE PROBLEM", { x:0.5, y:0.2, w:8, h:0.6, fontSize:34, bold:true, color:C.orange, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("Why Tamil Nadu's 8.2M Farmers Are Losing Money", { x:0.5, y:0.82, w:9, h:0.35, fontSize:14, color:C.muted, fontFace:"Calibri", italic:true });

  // Stat cards
  const stats = [
    { emoji:"💸", num:"₹14,000 Cr", label:"Annual Crop Loss", sub:"Due to market gluts & price crashes", top:C.orange },
    { emoji:"📉", num:"42%", label:"Farmer Income Gap", sub:"vs national average — persistent poverty", top:C.red },
    { emoji:"🌾", num:"38 Districts", label:"Zero Data Visibility", sub:"No real-time soil/market intelligence", top:C.purple }
  ];
  stats.forEach((s, i) => {
    const x = 0.4 + i * 4.3;
    sl.addShape(prs.ShapeType.rect, { x, y:1.4, w:4.0, h:3.2, fill:{color:C.card}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x, y:1.4, w:4.0, h:0.12, fill:{color:s.top} });
    sl.addText(s.emoji, { x, y:1.6, w:4.0, h:0.6, fontSize:28, align:"center" });
    sl.addText(s.num, { x, y:2.2, w:4.0, h:0.7, fontSize:30, bold:true, color:C.white, align:"center", fontFace:"Trebuchet MS" });
    sl.addText(s.label, { x, y:2.9, w:4.0, h:0.4, fontSize:13, bold:true, color:C.gold, align:"center", fontFace:"Calibri" });
    sl.addText(s.sub, { x, y:3.3, w:4.0, h:0.6, fontSize:10, color:C.muted, align:"center", fontFace:"Calibri", wrap:true });
  });

  // Root cause box
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:4.9, w:12.5, h:1.6, fill:{color:C.darkred}, shadow:shadow() });
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:4.9, w:0.08, h:1.6, fill:{color:C.orange} });
  sl.addText("🔴  ROOT CAUSE", { x:0.6, y:5.0, w:4, h:0.4, fontSize:14, bold:true, color:C.orange, fontFace:"Trebuchet MS" });
  sl.addText("Farmers make crop decisions blindly — No district-level soil analytics, no market saturation warnings, no AI-driven advisory. A ₹500 smartphone has no access to the intelligence that decides ₹50,000 worth of harvest outcome.", { x:0.6, y:5.4, w:12.0, h:0.9, fontSize:11, color:C.white, fontFace:"Calibri", wrap:true });
}

// ─── SLIDE 3: SOLUTION OVERVIEW ──────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.green} });
  sl.addText("OUR SOLUTION", { x:0.5, y:0.2, w:8, h:0.6, fontSize:34, bold:true, color:C.green, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("A Real-Time Digital Twin Platform for Tamil Nadu Agriculture", { x:0.5, y:0.82, w:10, h:0.35, fontSize:14, color:C.muted, fontFace:"Calibri", italic:true });

  // Architecture layers
  const layers = [
    { label:"LAYER 1 — IoT & Data Ingestion", desc:"Soil NPK sensors · Weather telemetry · Market price APIs · 38-district TN coverage · Aadhaar-linked farmer IDs", color:"162040", border:C.blue },
    { label:"LAYER 2 — StateBrain AI Engine", desc:"What-If Simulator · Market Glut Predictor · Cross-District Risk Analysis · Gemini Pro Advisory · 1000-season simulation", color:"162016", border:C.green },
    { label:"LAYER 3 — Geospatial Command UI", desc:"Interactive Leaflet map · Block-level analysis · Multi-lingual (6 languages) · Officer & Farmer dashboards · PDF Reports", color:"302010", border:C.gold }
  ];
  layers.forEach((l, i) => {
    const y = 1.4 + i * 1.75;
    sl.addShape(prs.ShapeType.rect, { x:0.5, y, w:11.5, h:1.4, fill:{color:l.color}, line:{color:l.border, width:2}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x:0.5, y, w:0.1, h:1.4, fill:{color:l.border} });
    sl.addText(l.label, { x:0.8, y:y+0.15, w:10, h:0.35, fontSize:13, bold:true, color:l.border, fontFace:"Trebuchet MS" });
    sl.addText(l.desc, { x:0.8, y:y+0.55, w:10.5, h:0.7, fontSize:11, color:C.white, fontFace:"Calibri", wrap:true });
    // Arrow between layers
    if (i < 2) sl.addShape(prs.ShapeType.rect, { x:6.2, y:y+1.4, w:0.06, h:0.35, fill:{color:C.green} });
  });

  // CTA banner
  sl.addShape(prs.ShapeType.rect, { x:0, y:6.9, w:13.33, h:0.6, fill:{color:C.green} });
  sl.addText("🚀  LIVE @ nimirndhunil.vercel.app — Deployed & Functional for 38 TN Districts", { x:0, y:6.9, w:13.33, h:0.6, fontSize:14, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
}

// ─── SLIDE 4: ARCHITECTURE DIAGRAM ───────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.blue} });
  sl.addText("ACTUAL PROJECT ARCHITECTURE", { x:0.5, y:0.2, w:10, h:0.6, fontSize:30, bold:true, color:C.blue, fontFace:"Trebuchet MS", shadow:shadow() });

  // Column headers
  ["FRONTEND (React/Vite)", "BACKEND (Node/FastAPI)", "EXTERNAL SERVICES"].forEach((h, i) => {
    const x = 0.4 + i * 4.3;
    const colors = [C.blue, C.gold, C.purple];
    sl.addShape(prs.ShapeType.rect, { x, y:1.0, w:3.9, h:0.4, fill:{color:colors[i]}, shadow:shadow() });
    sl.addText(h, { x, y:1.0, w:3.9, h:0.4, fontSize:11, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
  });

  // Frontend components
  const fe = ["App.jsx (Router)", "CommandCenter.jsx", "DashboardContent.jsx", "WhatIfSimulator.jsx", "GeospatialAnalysis.jsx", "Login.jsx (Aadhaar)", "AgriConsultant.jsx", "AdvancedAnalytics.jsx"];
  fe.forEach((c, i) => {
    sl.addShape(prs.ShapeType.rect, { x:0.4, y:1.55 + i * 0.62, w:3.9, h:0.5, fill:{color:"102030"}, line:{color:C.blue, width:1}, shadow:shadow() });
    sl.addText(c, { x:0.4, y:1.55 + i * 0.62, w:3.9, h:0.5, fontSize:9, color:C.white, fontFace:"Calibri", align:"center" });
  });

  // Backend
  const be = ["StateBrain.js", "GeminiService.js", "simulationEngine.js", "dataService.js", "Express /api/auth", "Express /api/analyze-risk", "FastAPI /api/vitals"];
  be.forEach((c, i) => {
    sl.addShape(prs.ShapeType.rect, { x:4.7, y:1.55 + i * 0.62, w:3.9, h:0.5, fill:{color:"201A00"}, line:{color:C.gold, width:1}, shadow:shadow() });
    sl.addText(c, { x:4.7, y:1.55 + i * 0.62, w:3.9, h:0.5, fontSize:9, color:C.white, fontFace:"Calibri", align:"center" });
  });

  // External
  const ex = ["Google Gemini Pro API", "TN AgriStack (Mock)", "Leaflet / OpenStreetMap", "Recharts Visualization", "MongoDB (User data)", "Vercel (Frontend CDN)", "Render (FastAPI)"];
  ex.forEach((c, i) => {
    sl.addShape(prs.ShapeType.rect, { x:9.0, y:1.55 + i * 0.62, w:3.9, h:0.5, fill:{color:"1A0030"}, line:{color:C.purple, width:1}, shadow:shadow() });
    sl.addText(c, { x:9.0, y:1.55 + i * 0.62, w:3.9, h:0.5, fontSize:9, color:C.white, fontFace:"Calibri", align:"center" });
  });

  // Connector lines
  sl.addShape(prs.ShapeType.rect, { x:4.3, y:2.5, w:0.4, h:0.05, fill:{color:C.green} });
  sl.addShape(prs.ShapeType.rect, { x:8.6, y:2.5, w:0.4, h:0.05, fill:{color:C.green} });
}

// ─── SLIDE 5: TECH STACK ─────────────────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.gold} });
  sl.addText("TECH STACK DEEP DIVE", { x:0.5, y:0.2, w:8, h:0.6, fontSize:34, bold:true, color:C.gold, fontFace:"Trebuchet MS", shadow:shadow() });

  const stacks = [
    { title:"🖥️ Frontend", color:C.blue, items:["React ^19.2.0", "Vite ^7.2.4", "React Router DOM ^7.13.0", "Framer Motion ^12.33.0", "Recharts ^3.7.0", "Leaflet ^1.9.4", "react-leaflet ^5.0.0", "lucide-react ^0.564.0", "jsPDF ^4.1.0"] },
    { title:"🧠 AI / ML", color:C.green, items:["Google Gemini Pro API", "StateBrain.js Engine", "simulationEngine.js", "1000-Season Monte Carlo", "Market Glut Predictor", "Cross-District Analytics", "GeminiService.js", "AgriStack Integration"] },
    { title:"⚙️ Backend", color:C.orange, items:["Node.js + Express", "FastAPI 0.129.0", "Uvicorn 0.34.0", "Pandas 2.3.3", "MongoDB + Mongoose", "bcryptjs (Auth)", "jsonwebtoken (JWT)", "CORS Middleware"] },
    { title:"☁️ Infrastructure", color:C.purple, items:["Vercel (Frontend CDN)", "Render (FastAPI)", "i18next ^25.8.7", "react-i18next ^16.5.4", "6-Language i18n", "react-hot-toast", "Context API (AuthCtx)", "CSS Variables"] }
  ];

  stacks.forEach((s, i) => {
    const x = 0.3 + (i % 2) * 6.5;
    const y = 1.1 + Math.floor(i / 2) * 3.1;
    sl.addShape(prs.ShapeType.rect, { x, y, w:6.2, h:2.8, fill:{color:C.card}, shadow:shadow() });
    sl.addShape(prs.ShapeType.rect, { x, y, w:6.2, h:0.45, fill:{color:s.color} });
    sl.addText(s.title, { x, y, w:6.2, h:0.45, fontSize:14, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
    sl.addText(s.items.join("  ·  "), { x:x+0.15, y:y+0.5, w:5.9, h:2.2, fontSize:10, color:C.white, fontFace:"Calibri", wrap:true });
  });
}

// ─── SLIDE 6: INNOVATION / NEURAL ENGINE ─────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.purple} });
  sl.addText("THE INNOVATION", { x:0.5, y:0.2, w:8, h:0.6, fontSize:34, bold:true, color:C.purple, fontFace:"Trebuchet MS", shadow:shadow() });
  sl.addText("StateBrain™ AI Engine vs. Traditional Farming Advice", { x:0.5, y:0.82, w:10, h:0.35, fontSize:14, color:C.muted, fontFace:"Calibri", italic:true });

  // Left panel - Traditional
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:1.3, w:5.3, h:4.8, fill:{color:"200808"}, line:{color:C.orange, width:2}, shadow:shadow() });
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:1.3, w:5.3, h:0.5, fill:{color:C.orange} });
  sl.addText("❌  TRADITIONAL APPROACH", { x:0.4, y:1.3, w:5.3, h:0.5, fontSize:12, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
  const trad = ["📞 Village panchayat word-of-mouth", "🗓️ Seasonal advice from extension officers", "📰 Newspaper crop price listings", "❓ No market glut prediction", "🌦️ Manual weather observation", "💼 No soil NPK data access", "⏳ Weeks to get government scheme info"];
  trad.forEach((t, i) => sl.addText(t, { x:0.6, y:1.95 + i * 0.53, w:4.9, h:0.45, fontSize:10.5, color:C.white, fontFace:"Calibri" }));

  // VS circle
  sl.addShape(prs.ShapeType.ellipse, { x:5.6, y:3.2, w:1.0, h:1.0, fill:{color:C.gold}, shadow:shadow() });
  sl.addText("VS", { x:5.6, y:3.2, w:1.0, h:1.0, fontSize:16, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });

  // Right panel - Agri-Neural Twin
  sl.addShape(prs.ShapeType.rect, { x:6.8, y:1.3, w:5.9, h:4.8, fill:{color:"081808"}, line:{color:C.green, width:2}, shadow:shadow() });
  sl.addShape(prs.ShapeType.rect, { x:6.8, y:1.3, w:5.9, h:0.5, fill:{color:C.green} });
  sl.addText("✅  AGRI-NEURAL TWIN", { x:6.8, y:1.3, w:5.9, h:0.5, fontSize:12, bold:true, color:C.dark, align:"center", fontFace:"Trebuchet MS" });
  const neu = ["🧠 StateBrain: 1000-season AI simulation", "📡 Real-time soil NPK telemetry (N,P,K)", "📊 Market glut predictor (38 districts)", "🗺️ Block-level geospatial risk mapping", "🤖 Gemini Pro conversational advisory", "🌐 6-language inclusive interface", "⚡ Aadhaar-linked farmer profiles + schemes"];
  neu.forEach((t, i) => sl.addText(t, { x:7.0, y:1.95 + i * 0.53, w:5.5, h:0.45, fontSize:10.5, color:C.white, fontFace:"Calibri" }));

  // USP pills
  const usps = ["Cross-District Intelligence", "Zero-Internet Offline Mode", "Govt-Grade Accessibility (WCAG 2.1)", "Open API + AgriStack Ready"];
  usps.forEach((u, i) => {
    sl.addShape(prs.ShapeType.rect, { x:0.4 + i * 3.2, y:6.5, w:3.0, h:0.5, fill:{color:C.purple}, shadow:shadow() });
    sl.addText(u, { x:0.4 + i * 3.2, y:6.5, w:3.0, h:0.5, fontSize:9.5, bold:true, color:C.white, align:"center", fontFace:"Calibri" });
  });
}

// ─── SLIDE 7: LIVE PROTOTYPE EVIDENCE ────────────────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: C.bg };
  sl.addShape(prs.ShapeType.rect, { x:0, y:0, w:13.33, h:0.08, fill:{color:C.green} });
  sl.addText("LIVE PROTOTYPE EVIDENCE", { x:0.5, y:0.2, w:9, h:0.6, fontSize:30, bold:true, color:C.green, fontFace:"Trebuchet MS", shadow:shadow() });

  // Mockup UI layout
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:1.0, w:8.5, h:5.0, fill:{color:C.card}, line:{color:C.green, width:1.5}, shadow:shadow() });
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:1.0, w:8.5, h:0.4, fill:{color:"1A3575"} });
  sl.addText("🌾 TN UNIFIED COMMAND CENTER | GOVT OF TAMIL NADU", { x:0.4, y:1.0, w:8.5, h:0.4, fontSize:9, bold:true, color:C.white, align:"center", fontFace:"Calibri" });
  // Sidebar mock
  sl.addShape(prs.ShapeType.rect, { x:0.4, y:1.4, w:1.6, h:4.6, fill:{color:"122022"} });
  ["Dashboard", "Analytics", "Map View", "Reports", "Settings", "Farmer"].forEach((m, i) => {
    sl.addText(m, { x:0.45, y:1.55 + i * 0.65, w:1.5, h:0.5, fontSize:9, color: i===0 ? C.green : C.muted, fontFace:"Calibri" });
  });
  // Main area mock
  sl.addShape(prs.ShapeType.rect, { x:2.1, y:1.4, w:6.7, h:1.2, fill:{color:"1A2F1A"} });
  sl.addText("475,000 T Yield Forecast  |  50.0% Sowing Density  |  ₹18,300 Cr GDP Shielded", { x:2.1, y:1.4, w:6.7, h:1.2, fontSize:10, bold:true, color:C.green, align:"center", fontFace:"Trebuchet MS" });
  sl.addShape(prs.ShapeType.rect, { x:2.1, y:2.7, w:6.7, h:2.7, fill:{color:"101A10"}, line:{color:C.muted, width:0.5} });
  sl.addText("DISTRICT ECONOMIC HEALTH MAP — 38 ZONES\n(Ariyalur • Chennai • Coimbatore • Cuddalore • Dindigul • Erode...)", { x:2.1, y:2.7, w:6.7, h:2.7, fontSize:10, color:C.muted, align:"center", fontFace:"Calibri" });

  // Checklist
  sl.addShape(prs.ShapeType.rect, { x:9.1, y:1.0, w:3.9, h:5.0, fill:{color:C.card}, shadow:shadow() });
  sl.addShape(prs.ShapeType.rect, { x:9.1, y:1.0, w:3.9, h:0.4, fill:{color:"1A3A2A"} });
  sl.addText("FEATURE STATUS", { x:9.1, y:1.0, w:3.9, h:0.4, fontSize:11, bold:true, color:C.gold, align:"center", fontFace:"Trebuchet MS" });
  const features = [
    ["✅","Aadhaar Login + OTP"],["✅","38-District Dashboard"],["✅","StateBrain Risk Engine"],
    ["✅","Geospatial Leaflet Map"],["✅","6-Language i18n"],["✅","WhatIf Simulator"],
    ["✅","Gemini AI Advisory"],["✅","Government Schemes DB"],["✅","PDF Report Export"],
    ["🔧","IoT Live Sensor Feed"],["🔧","Satellite NDVI Overlay"]
  ];
  features.forEach((f, i) => sl.addText(`${f[0]} ${f[1]}`, { x:9.2, y:1.5 + i * 0.42, w:3.7, h:0.38, fontSize:9.5, color:f[0]==="✅"?C.green:C.gold, fontFace:"Calibri" }));

  // URL bar
  sl.addShape(prs.ShapeType.rect, { x:0, y:6.9, w:13.33, h:0.6, fill:{color:C.card} });
  sl.addText("🌐 nimirndhunil.vercel.app  |  GitHub: github.com/threesshad-cpu/agri-neural-twin  |  Status: ✅ LIVE", { x:0, y:6.9, w:13.33, h:0.6, fontSize:12, color:C.blue, align:"center", fontFace:"Calibri" });
}

module.exports = { prs };
