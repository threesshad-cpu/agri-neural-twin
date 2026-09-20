const pptxgen = require("pptxgenjs");
const prs = new pptxgen();
prs.layout = "LAYOUT_WIDE";

const C = {
  bg:"050D0A", card:"0D2016", card2:"0A1A28", green:"00FF88", gold:"FFD700",
  blue:"00D4FF", orange:"FF6B35", purple:"B44FFF", white:"FFFFFF",
  muted:"4A8A6A", cyan:"00FFFF", pink:"FF2D78", lime:"AAFF00",
  dark:"020806", neon:"39FF14", teal:"00CED1", amber:"FFBF00"
};
const sh = () => ({ type:"outer", blur:12, offset:4, angle:45, color:"000000", opacity:0.6 });
const glow = (col) => ({ type:"outer", blur:20, offset:0, angle:0, color:col, opacity:0.5 });

// ══ helpers ══
function hexGrid(sl, x, y, w, h) {
  for (let r=0;r<8;r++) for (let c=0;c<20;c++) {
    const cx = x + c*0.65 + (r%2)*0.32, cy = y + r*0.55;
    if (cx<x+w && cy<y+h) sl.addShape(prs.ShapeType.rect, {x:cx,y:cy,w:0.5,h:0.01,fill:{color:"1A3A2A"},line:{color:"1A3A2A"}});
  }
}
function corner(sl, x, y, flip) {
  const sx = flip ? -1 : 1;
  sl.addShape(prs.ShapeType.rect, {x, y, w:0.6*sx, h:0.05, fill:{color:C.green}});
  sl.addShape(prs.ShapeType.rect, {x, y, w:0.05, h:0.6, fill:{color:C.green}});
}
function statBox(sl, x, y, num, label, col) {
  sl.addShape(prs.ShapeType.rect, {x,y,w:2.8,h:1.4,fill:{color:C.card},line:{color:col,width:1.5},shadow:glow(col)});
  sl.addShape(prs.ShapeType.rect, {x,y,w:2.8,h:0.06,fill:{color:col}});
  sl.addShape(prs.ShapeType.rect, {x,y:y+1.34,w:2.8,h:0.06,fill:{color:col}});
  sl.addText(num,{x,y:y+0.1,w:2.8,h:0.7,fontSize:28,bold:true,color:col,align:"center",fontFace:"Trebuchet MS",shadow:glow(col)});
  sl.addText(label,{x,y:y+0.82,w:2.8,h:0.45,fontSize:9,color:C.white,align:"center",fontFace:"Calibri",wrap:true});
}
function glowLine(sl,x,y,w,col) {
  sl.addShape(prs.ShapeType.rect,{x,y,w,h:0.03,fill:{color:col},shadow:glow(col)});
  sl.addShape(prs.ShapeType.rect,{x,y:y+0.03,w,h:0.01,fill:{color:"0A1A28"}});
}
function scanLine(sl, y, col) {
  sl.addShape(prs.ShapeType.rect,{x:0,y,w:13.33,h:0.02,fill:{color:col}});
}
function techPill(sl, x, y, txt, col) {
  sl.addShape(prs.ShapeType.rect,{x,y,w:2.5,h:0.45,fill:{color:C.card2},line:{color:col,width:1},shadow:sh()});
  sl.addShape(prs.ShapeType.rect,{x,y,w:0.06,h:0.45,fill:{color:col}});
  sl.addText(txt,{x:x+0.12,y,w:2.35,h:0.45,fontSize:9.5,color:C.white,fontFace:"Calibri"});
}

// ══ SLIDE 1: CINEMATIC TITLE ══
{
  const sl = prs.addSlide();
  sl.background = {color:C.bg};
  hexGrid(sl,0,0,13.33,7.5);
  // Concentric glow rings top-right
  [[4.2,"0A2018"],[3.0,"0F2820"],[1.8,C.card]].forEach(([s,f],i)=> sl.addShape(prs.ShapeType.ellipse,{x:13.33-s/2-0.5,y:-s/2+0.5,w:s,h:s,fill:{color:f},line:{color:C.green,width:0.5},shadow:glow(C.green)}));
  sl.addShape(prs.ShapeType.ellipse,{x:12.0,y:-0.3,w:1.0,h:1.0,fill:{color:C.green},shadow:glow(C.green)});
  // Left neon strip
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.green},shadow:glow(C.green)});
  sl.addShape(prs.ShapeType.rect,{x:0.12,y:0,w:0.03,h:7.5,fill:{color:C.green+"60"}});
  // Diagonal accent
  sl.addShape(prs.ShapeType.rect,{x:0,y:3.9,w:13.33,h:0.03,fill:{color:C.green+"40"}});
  sl.addShape(prs.ShapeType.rect,{x:0,y:4.6,w:13.33,h:0.015,fill:{color:C.blue+"30"}});
  // Corner brackets
  corner(sl,0.25,0.5,false); corner(sl,0.25,6.8,false);
  // Big title
  sl.addText("AGRI-NEURAL TWIN",{x:0.3,y:0.8,w:11,h:1.5,fontSize:62,bold:true,color:C.green,fontFace:"Trebuchet MS",shadow:glow(C.green)});
  glowLine(sl,0.3,2.35,9.5,C.green);
  sl.addText("நிமிர்ந்து நில்",{x:0.3,y:2.5,w:6,h:0.7,fontSize:26,bold:true,color:C.gold,fontFace:"Trebuchet MS",shadow:glow(C.gold)});
  sl.addText("[ NIMIRNDHU NIL ]",{x:6.5,y:2.6,w:5,h:0.5,fontSize:16,color:C.cyan,fontFace:"Calibri",italic:true});
  sl.addText("District Intelligence & Agricultural Risk Engine for Tamil Nadu",{x:0.3,y:3.28,w:10,h:0.45,fontSize:14,color:C.white,fontFace:"Calibri"});
  // Team data block
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:3.9,w:7.8,h:1.85,fill:{color:C.card},line:{color:C.green,width:0.8},shadow:sh()});
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:3.9,w:7.8,h:0.06,fill:{color:C.green}});
  sl.addText("▶  TEAM: UZHAVAR INTELLIGENCE",{x:0.45,y:3.96,w:7.5,h:0.35,fontSize:11,bold:true,color:C.green,fontFace:"Trebuchet MS"});
  sl.addText("Lead: Threessha D",{x:0.45,y:4.33,w:7.5,h:0.3,fontSize:11,bold:true,color:C.gold,fontFace:"Calibri"});
  sl.addText("Members: Padma Priya V  ·  K. Sathyapriya  ·  Santhosh Kumar B  ·  Karthikeyan K",{x:0.45,y:4.65,w:7.5,h:0.28,fontSize:10,color:C.muted,fontFace:"Calibri"});
  sl.addText("C. Abdul Hakeem College of Engineering & Technology",{x:0.45,y:4.95,w:7.5,h:0.28,fontSize:10,color:C.muted,fontFace:"Calibri",italic:true});
  // Badge
  sl.addShape(prs.ShapeType.rect,{x:8.4,y:3.9,w:4.7,h:1.85,fill:{color:"1A1200"},line:{color:C.gold,width:2},shadow:glow(C.gold)});
  sl.addShape(prs.ShapeType.rect,{x:8.4,y:3.9,w:4.7,h:0.06,fill:{color:C.gold}});
  sl.addText("🏆",{x:8.4,y:4.0,w:4.7,h:0.5,fontSize:24,align:"center"});
  sl.addText("NIMIRNDHU NIL HACKATHON",{x:8.4,y:4.5,w:4.7,h:0.35,fontSize:11,bold:true,color:C.gold,align:"center",fontFace:"Trebuchet MS"});
  sl.addText("Government of Tamil Nadu — 2026",{x:8.4,y:4.85,w:4.7,h:0.3,fontSize:10,color:C.white,align:"center",fontFace:"Calibri"});
  sl.addText("Dept. of Agriculture & Farmers Welfare",{x:8.4,y:5.15,w:4.7,h:0.28,fontSize:9,color:C.muted,align:"center",fontFace:"Calibri"});
  // Links bar
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.0,w:13.33,h:0.5,fill:{color:C.card2},line:{color:C.blue,width:0.5}});
  sl.addText("🌐  nimirndhunil.vercel.app",{x:0.3,y:6.05,w:5,h:0.4,fontSize:11,color:C.blue,fontFace:"Calibri",bold:true});
  sl.addText("⭐  github.com/threesshad-cpu/agri-neural-twin",{x:5.5,y:6.05,w:7,h:0.4,fontSize:11,color:C.cyan,fontFace:"Calibri"});
  // Ticker bottom
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.75,w:13.33,h:0.75,fill:{color:C.dark}});
  glowLine(sl,0,6.75,13.33,C.green);
  sl.addText("\"From Soil Data to Smart Decisions — Democratizing AI for Every Farmer in Tamil Nadu\"",{x:0,y:6.8,w:13.33,h:0.6,fontSize:12,color:C.green,align:"center",italic:true,fontFace:"Calibri",shadow:glow(C.green)});
}

// ══ SLIDE 2: THE PROBLEM ══
{
  const sl = prs.addSlide();
  sl.background = {color:C.bg};
  hexGrid(sl,0,0,13.33,7.5);
  scanLine(sl,0,C.orange);
  scanLine(sl,7.48,C.orange);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.orange},shadow:glow(C.orange)});
  sl.addText("// THE PROBLEM",{x:0.3,y:0.12,w:7,h:0.7,fontSize:36,bold:true,color:C.orange,fontFace:"Trebuchet MS",shadow:glow(C.orange)});
  sl.addText("CRITICAL SYSTEM FAILURE: Tamil Nadu's 8.2 Million Farmers Are Flying Blind",{x:0.3,y:0.85,w:12,h:0.35,fontSize:13,color:C.muted,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.3,12.5,C.orange);

  // Stat cards row
  const stats=[
    {n:"₹14,000 Cr",l:"Annual crop loss to\nmarket gluts & price crashes",c:C.orange,e:"💸"},
    {n:"42%",l:"Farmer income gap vs\nnational average",c:C.pink,e:"📉"},
    {n:"8.2M",l:"Farmers with ZERO real-time\nsoil/market intelligence",c:C.purple,e:"🌾"},
    {n:"38",l:"Districts — no connected\ndigital advisory system",c:C.blue,e:"📡"}
  ];
  stats.forEach((s,i)=>{
    const x=0.3+i*3.25, y=1.55;
    sl.addShape(prs.ShapeType.rect,{x,y,w:3.0,h:2.5,fill:{color:C.card},line:{color:s.c,width:1.5},shadow:glow(s.c)});
    sl.addShape(prs.ShapeType.rect,{x,y,w:3.0,h:0.08,fill:{color:s.c}});
    sl.addShape(prs.ShapeType.rect,{x,y:y+2.42,w:3.0,h:0.08,fill:{color:s.c}});
    sl.addText(s.e,{x,y:y+0.12,w:3.0,h:0.55,fontSize:26,align:"center"});
    sl.addText(s.n,{x,y:y+0.7,w:3.0,h:0.75,fontSize:28,bold:true,color:s.c,align:"center",fontFace:"Trebuchet MS",shadow:glow(s.c)});
    sl.addText(s.l,{x:x+0.1,y:y+1.45,w:2.8,h:0.85,fontSize:9.5,color:C.white,align:"center",fontFace:"Calibri",wrap:true});
  });

  // Root cause box
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:4.25,w:12.7,h:1.85,fill:{color:"1A0505"},line:{color:C.orange,width:1.5},shadow:sh()});
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:4.25,w:0.1,h:1.85,fill:{color:C.orange}});
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:4.25,w:12.7,h:0.4,fill:{color:"2A0808"}});
  sl.addText("⚠  ROOT CAUSE ANALYSIS",{x:0.55,y:4.27,w:6,h:0.38,fontSize:13,bold:true,color:C.orange,fontFace:"Trebuchet MS",shadow:glow(C.orange)});
  sl.addText("Farmers make life-altering crop decisions using word-of-mouth and seasonal instinct. No district-level soil NPK analytics, no market saturation early-warning, no AI advisory — a ₹500 smartphone has zero access to the intelligence that determines ₹50,000+ of annual harvest revenue. The gap between data and the field is costing Tamil Nadu billions every year.",{x:0.55,y:4.7,w:12.2,h:1.25,fontSize:11,color:C.white,fontFace:"Calibri",wrap:true});
  glowLine(sl,0,6.15,13.33,C.orange);
  sl.addText("IMPACT: Food security risk  ·  Farmer suicides  ·  Market volatility  ·  Resource waste  ·  Policy blindspot",{x:0,y:6.2,w:13.33,h:0.45,fontSize:11,bold:true,color:C.orange,align:"center",fontFace:"Calibri"});
}

// ══ SLIDE 3: SOLUTION ══
{
  const sl = prs.addSlide();
  sl.background = {color:C.bg};
  hexGrid(sl,0,0,13.33,7.5);
  scanLine(sl,0,C.green); scanLine(sl,7.48,C.green);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.green},shadow:glow(C.green)});
  sl.addText("// SOLUTION ARCHITECTURE",{x:0.3,y:0.1,w:9,h:0.7,fontSize:34,bold:true,color:C.green,fontFace:"Trebuchet MS",shadow:glow(C.green)});
  sl.addText("A Real-Time Digital Twin Platform for Tamil Nadu Agriculture",{x:0.3,y:0.82,w:10,h:0.35,fontSize:13,color:C.muted,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.25,12.5,C.green);

  const layers=[
    {lbl:"[ LAYER 1 ]  IoT & DATA INGESTION",desc:"Soil NPK sensors (N,P,K,Moisture) · IMD weather telemetry · APMC mandi price APIs · 38-district TN telemetry mesh · Aadhaar-linked farmer ID registry · AgriStack connector",col:C.blue,bg:"080F1A",icon:"📡"},
    {lbl:"[ LAYER 2 ]  STATEBRAIN™ AI ENGINE",desc:"What-If Simulator (1000 seasons) · Cross-district Market Glut Predictor · Gemini Pro conversational advisory · Risk scoring matrix · Monte Carlo crop forecasting · District sub-simulation",col:C.green,bg:"081A0F",icon:"🧠"},
    {lbl:"[ LAYER 3 ]  GEOSPATIAL COMMAND UI",desc:"Interactive Leaflet block-level map · 6-language interface (EN/TA/TE/KA/ML/UR) · Officer & Farmer dual dashboards · Recharts analytics · PDF report export · PWA mobile-ready",col:C.gold,bg:"1A1200",icon:"🗺️"}
  ];
  layers.forEach((l,i)=>{
    const y=1.4+i*1.75;
    sl.addShape(prs.ShapeType.rect,{x:0.3,y,w:12.7,h:1.6,fill:{color:l.bg},line:{color:l.col,width:1.5},shadow:glow(l.col)});
    sl.addShape(prs.ShapeType.rect,{x:0.3,y,w:0.1,h:1.6,fill:{color:l.col}});
    sl.addShape(prs.ShapeType.rect,{x:0.3,y,w:12.7,h:0.42,fill:{color:l."0D2016"}});
    sl.addText(`${l.icon}  ${l.lbl}`,{x:0.55,y:y+0.04,w:11.5,h:0.38,fontSize:12,bold:true,color:l.col,fontFace:"Trebuchet MS",shadow:glow(l.col)});
    sl.addText(l.desc,{x:0.55,y:y+0.52,w:12.0,h:0.95,fontSize:10.5,color:C.white,fontFace:"Calibri",wrap:true});
    if(i<2){
      sl.addShape(prs.ShapeType.rect,{x:6.4,y:y+1.6,w:0.06,h:0.15,fill:{color:C.green}});
      sl.addShape(prs.ShapeType.ellipse,{x:6.35,y:y+1.72,w:0.15,h:0.15,fill:{color:C.green},shadow:glow(C.green)});
    }
  });
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.75,w:13.33,h:0.75,fill:{color:C.green},shadow:glow(C.green)});
  sl.addText("🚀  LIVE DEMO: nimirndhunil.vercel.app  ·  Fully deployed for all 38 Tamil Nadu Districts  ·  Available NOW",{x:0,y:6.75,w:13.33,h:0.75,fontSize:13,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
}

// ══ SLIDE 4: ARCHITECTURE DIAGRAM ══
{
  const sl = prs.addSlide();
  sl.background = {color:C.bg};
  hexGrid(sl,0,0,13.33,7.5);
  scanLine(sl,0,C.blue); scanLine(sl,7.48,C.blue);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.blue},shadow:glow(C.blue)});
  sl.addText("// LIVE SYSTEM ARCHITECTURE",{x:0.3,y:0.1,w:9,h:0.65,fontSize:30,bold:true,color:C.blue,fontFace:"Trebuchet MS",shadow:glow(C.blue)});
  glowLine(sl,0.3,0.82,12.5,C.blue);

  // Column labels
  const cols=[
    {lbl:"FRONTEND — React 19 + Vite",col:C.blue,x:0.3},
    {lbl:"BACKEND — Node + FastAPI",col:C.gold,x:4.65},
    {lbl:"EXTERNAL SERVICES",col:C.purple,x:9.0}
  ];
  cols.forEach(c=>{
    sl.addShape(prs.ShapeType.rect,{x:c.x,y:0.9,w:4.1,h:0.42,fill:{color:c.col},shadow:glow(c.col)});
    sl.addText(c.lbl,{x:c.x,y:0.9,w:4.1,h:0.42,fontSize:10,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
  });

  const fe=["App.jsx — Router + Auth","CommandCenter.jsx","DashboardContent.jsx","WhatIfSimulator.jsx","GeospatialAnalysis.jsx","Login.jsx (Aadhaar OTP)","AgriConsultant.jsx (AI Chat)","AdvancedAnalytics.jsx","Sidebar + TopBar","Reports.jsx + FarmerProfile"];
  const be=["StateBrain.js — AI Engine","GeminiService.js","simulationEngine.js","dataService.js (Mock API)","logisticsEngine.js","metricsEngine.js","POST /api/auth/login","POST /api/analyze-risk","GET /api/districts/:name","FastAPI /api/vitals"];
  const ex=["Google Gemini Pro API","TN AgriStack (Farmer IDs)","Leaflet + OpenStreetMap","Recharts Visualization","MongoDB + Mongoose","JWT + bcryptjs Auth","Vercel (Frontend CDN)","Render (FastAPI host)","i18next (6 languages)","OpenWeatherMap API"];

  [fe,be,ex].forEach((list,ci)=>{
    const x=[0.3,4.65,9.0][ci];
    const col=[C.blue,C.gold,C.purple][ci];
    const bg=["080F1A","1A1200","100018"][ci];
    list.forEach((item,i)=>{
      sl.addShape(prs.ShapeType.rect,{x,y:1.42+i*0.59,w:4.1,h:0.5,fill:{color:bg},line:{color:"1A3A2A",width:0.75},shadow:sh()});
      sl.addShape(prs.ShapeType.rect,{x,y:1.42+i*0.59,w:0.06,h:0.5,fill:{color:col}});
      sl.addText(item,{x:x+0.12,y:1.42+i*0.59,w:3.95,h:0.5,fontSize:8.5,color:C.white,fontFace:"Calibri"});
    });
  });

  // Connectors
  sl.addShape(prs.ShapeType.rect,{x:4.4,y:3.5,w:0.25,h:0.04,fill:{color:C.green},shadow:glow(C.green)});
  sl.addShape(prs.ShapeType.rect,{x:8.75,y:3.5,w:0.25,h:0.04,fill:{color:C.green},shadow:glow(C.green)});
  glowLine(sl,0,7.1,13.33,C.blue);
  sl.addText("Data flows: Frontend ←→ Backend APIs ←→ External Services  |  All connections secured via JWT + CORS",{x:0,y:7.12,w:13.33,h:0.38,fontSize:10,color:C.blue,align:"center",fontFace:"Calibri"});
}

module.exports = { prs };

