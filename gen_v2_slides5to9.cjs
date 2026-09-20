const { prs } = require("./gen_v2_slides1to4.cjs");
const C={bg:"050D0A",card:"0D2016",card2:"0A1A28",green:"00FF88",gold:"FFD700",blue:"00D4FF",orange:"FF6B35",purple:"B44FFF",white:"FFFFFF",muted:"4A8A6A",cyan:"00FFFF",pink:"FF2D78",lime:"AAFF00",dark:"020806",neon:"39FF14",teal:"00CED1",amber:"FFBF00"};
const sh=()=>({type:"outer",blur:12,offset:4,angle:45,color:"000000",opacity:0.6});
const glow=(c)=>({type:"outer",blur:20,offset:0,angle:0,color:c,opacity:0.5});
function glowLine(sl,x,y,w,col){sl.addShape(prs.ShapeType.rect,{x,y,w,h:0.03,fill:{color:col},shadow:glow(col)});}
function scanLine(sl,y,col){sl.addShape(prs.ShapeType.rect,{x:0,y,w:13.33,h:0.02,fill:{color:col}});}
function hexGrid(sl){for(let r=0;r<8;r++)for(let c=0;c<20;c++){const cx=c*0.65+(r%2)*0.32,cy=r*0.55;sl.addShape(prs.ShapeType.rect,{x:cx,y:cy,w:0.5,h:0.01,fill:{color:"1A3A2A"},line:{color:"1A3A2A"}});}}

// SLIDE 5: TECH STACK
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.gold); scanLine(sl,7.48,C.gold);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.gold},shadow:glow(C.gold)});
  sl.addText("// TECH STACK",{x:0.3,y:0.1,w:8,h:0.65,fontSize:34,bold:true,color:C.gold,fontFace:"Trebuchet MS",shadow:glow(C.gold)});
  sl.addText("Full-Spectrum Engineering — Extracted from package.json + requirements.txt",{x:0.3,y:0.78,w:11,h:0.32,fontSize:12,color:C.muted,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.15,12.5,C.gold);
  const stacks=[
    {t:"🖥️ FRONTEND",col:C.blue,bg:"080F1A",items:["React ^19.2.0","Vite ^7.2.4","React Router DOM ^7.13.0","Framer Motion ^12.33.0","Recharts ^3.7.0","Leaflet ^1.9.4","react-leaflet ^5.0.0","lucide-react ^0.564.0","jsPDF ^4.1.0","react-hot-toast ^2.6.0"]},
    {t:"🧠 AI / ML ENGINE",col:C.green,bg:"081A0F",items:["Google Gemini Pro API","StateBrain.js (custom)","simulationEngine.js","1000-Season Monte Carlo","Market Glut Predictor","Cross-District Analytics","GeminiService.js","AgriStack Connector","Prompt Engineering","Context-aware advisory"]},
    {t:"⚙️ BACKEND",col:C.orange,bg:"1A0B05",items:["Node.js + Express","FastAPI 0.129.0","Uvicorn 0.34.0","Pandas 2.3.3","MongoDB + Mongoose","bcryptjs (Auth)","jsonwebtoken JWT","CORS Middleware","Python 3.11","REST API Design"]},
    {t:"☁️ INFRA & I18N",col:C.purple,bg:"100018",items:["Vercel (Frontend CDN)","Render (FastAPI host)","i18next ^25.8.7","react-i18next ^16.5.4","6-Language Support","Context API (AuthCtx)","CSS Variables System","PWA Ready","GitHub CI/CD","WCAG 2.1 AA"]}
  ];
  stacks.forEach((s,i)=>{
    const x=0.3+(i%2)*6.5, y=1.35+Math.floor(i/2)*2.85;
    sl.addShape(prs.ShapeType.rect,{x,y,w:6.2,h:2.65,fill:{color:s.bg},line:{color:s.col,width:1.5},shadow:glow(s.col)});
    sl.addShape(prs.ShapeType.rect,{x,y,w:6.2,h:0.48,fill:{color:s.col}});
    sl.addText(s.t,{x,y,w:6.2,h:0.48,fontSize:13,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
    const half=Math.ceil(s.items.length/2);
    s.items.slice(0,half).forEach((it,j)=>sl.addText(`▸ ${it}`,{x:x+0.1,y:y+0.55+j*0.38,w:2.9,h:0.35,fontSize:9,color:C.white,fontFace:"Calibri"}));
    s.items.slice(half).forEach((it,j)=>sl.addText(`▸ ${it}`,{x:x+3.1,y:y+0.55+j*0.38,w:2.9,h:0.35,fontSize:9,color:C.white,fontFace:"Calibri"}));
  });
}

// SLIDE 6: INNOVATION
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.purple); scanLine(sl,7.48,C.purple);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.purple},shadow:glow(C.purple)});
  sl.addText("// THE INNOVATION",{x:0.3,y:0.1,w:9,h:0.65,fontSize:34,bold:true,color:C.purple,fontFace:"Trebuchet MS",shadow:glow(C.purple)});
  sl.addText("StateBrain™ Neural Engine vs Traditional Farming Advisory",{x:0.3,y:0.78,w:10,h:0.32,fontSize:12,color:C.muted,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.15,12.5,C.purple);
  // Left panel
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:1.3,w:5.5,h:5.1,fill:{color:"1A0505"},line:{color:C.orange,width:1.5},shadow:glow(C.orange)});
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:1.3,w:5.5,h:0.5,fill:{color:C.orange}});
  sl.addText("❌  TRADITIONAL APPROACH",{x:0.3,y:1.3,w:5.5,h:0.5,fontSize:12,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
  ["📞 Panchayat word-of-mouth advice","🗓️ Seasonal extension officer visits","📰 Newspaper price listings (delayed)","❓ No market saturation prediction","🌦️ Manual weather observation only","💼 No soil NPK data access at all","⏳ Weeks to get scheme information","📉 Farmers lose ₹14,000 Cr yearly"].forEach((t,i)=>sl.addText(t,{x:0.45,y:1.95+i*0.48,w:5.1,h:0.42,fontSize:10.5,color:C.white,fontFace:"Calibri"}));
  // VS badge
  sl.addShape(prs.ShapeType.ellipse,{x:5.55,y:3.35,w:1.15,h:1.15,fill:{color:C.gold},shadow:glow(C.gold)});
  sl.addText("VS",{x:5.55,y:3.35,w:1.15,h:1.15,fontSize:18,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
  // Right panel
  sl.addShape(prs.ShapeType.rect,{x:6.85,y:1.3,w:6.15,h:5.1,fill:{color:"051A0A"},line:{color:C.green,width:2},shadow:glow(C.green)});
  sl.addShape(prs.ShapeType.rect,{x:6.85,y:1.3,w:6.15,h:0.5,fill:{color:C.green}});
  sl.addText("✅  AGRI-NEURAL TWIN",{x:6.85,y:1.3,w:6.15,h:0.5,fontSize:12,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
  ["🧠 StateBrain: 1000-season AI simulation","📡 Real-time soil NPK telemetry (N,P,K)","📊 Cross-district market glut predictor","🗺️ Block-level geospatial risk mapping","🤖 Gemini Pro conversational advisory","🌐 6-language inclusive interface","⚡ Aadhaar-linked farmer + scheme match","🚀 Accuracy: ~78% backtested 2019–2024"].forEach((t,i)=>sl.addText(t,{x:7.0,y:1.95+i*0.48,w:5.8,h:0.42,fontSize:10.5,color:C.white,fontFace:"Calibri"}));
  // USP pills
  const usps=[{t:"Cross-District\nIntelligence",c:C.green},{t:"Gemini Pro\nAI Advisory",c:C.blue},{t:"WCAG 2.1\nGovt Grade",c:C.gold},{t:"Open API\nAgriStack Ready",c:C.purple}];
  usps.forEach((u,i)=>{
    sl.addShape(prs.ShapeType.rect,{x:0.3+i*3.2,y:6.55,w:3.0,h:0.65,fill:{color:C.card2},line:{color:u.c,width:1.5},shadow:glow(u.c)});
    sl.addText(u.t,{x:0.3+i*3.2,y:6.55,w:3.0,h:0.65,fontSize:10,bold:true,color:u.c,align:"center",fontFace:"Calibri"});
  });
}

// SLIDE 7: LIVE PROTOTYPE
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.green); scanLine(sl,7.48,C.green);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.green},shadow:glow(C.green)});
  sl.addText("// LIVE PROTOTYPE",{x:0.3,y:0.1,w:9,h:0.65,fontSize:34,bold:true,color:C.green,fontFace:"Trebuchet MS",shadow:glow(C.green)});
  glowLine(sl,0.3,0.82,12.5,C.green);
  // UI mockup
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:0.92,w:8.8,h:5.5,fill:{color:C.card},line:{color:C.green,width:1.5},shadow:glow(C.green)});
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:0.92,w:8.8,h:0.45,fill:{color:"1A3575"}});
  sl.addText("🌾 TN UNIFIED COMMAND CENTER | UNIFIED AGRI COMMAND | GOVT OF TAMIL NADU",{x:0.35,y:0.92,w:8.7,h:0.45,fontSize:9,bold:true,color:C.white,align:"center",fontFace:"Calibri"});
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:1.37,w:1.65,h:5.05,fill:{color:"0A1520"}});
  ["🏠 Dashboard","📊 Analytics","🗺️ Map View","📄 Reports","⚙️ Settings","👤 Farmer"].forEach((m,i)=>{
    sl.addShape(prs.ShapeType.rect,{x:0.35,y:1.45+i*0.72,w:1.55,h:0.6,fill:{color:i===0?"0F2A18":C.card2},line:{color:i===0?C.green:"1A3A2A",width:i===0?1:0}});
    sl.addText(m,{x:0.35,y:1.45+i*0.72,w:1.55,h:0.6,fontSize:9,color:i===0?C.green:C.muted,fontFace:"Calibri",align:"center"});
  });
  // Stat strip
  sl.addShape(prs.ShapeType.rect,{x:2.05,y:1.37,w:7.0,h:0.8,fill:{color:"0A2010"}});
  sl.addText("475,000 T  YIELD",{x:2.1,y:1.42,w:2.2,h:0.7,fontSize:10,bold:true,color:C.green,fontFace:"Trebuchet MS",align:"center"});
  sl.addText("50.0%  SOWING",{x:4.4,y:1.42,w:2.2,h:0.7,fontSize:10,bold:true,color:C.gold,fontFace:"Trebuchet MS",align:"center"});
  sl.addText("₹18,300 Cr  GDP",{x:6.7,y:1.42,w:2.2,h:0.7,fontSize:10,bold:true,color:C.blue,fontFace:"Trebuchet MS",align:"center"});
  // Map area
  sl.addShape(prs.ShapeType.rect,{x:2.05,y:2.25,w:7.0,h:4.15,fill:{color:"081812"},line:{color:C.muted,width:0.5}});
  sl.addText("[ GEOSPATIAL MAP — 38 DISTRICT HEALTH ZONES ]\nAriyalur · Chennai · Coimbatore · Cuddalore · Dindigul\nErode · Kallakurichi · Kanchipuram · Kanyakumari · Karur\nKrishnagiri · Madurai · Mayiladuthurai · Nagapattinam ...",{x:2.1,y:2.35,w:6.9,h:4.0,fontSize:9.5,color:C.muted,align:"center",fontFace:"Calibri",wrap:true});
  // Feature list
  sl.addShape(prs.ShapeType.rect,{x:9.3,y:0.92,w:3.7,h:5.5,fill:{color:C.card},line:{color:C.gold,width:1},shadow:sh()});
  sl.addShape(prs.ShapeType.rect,{x:9.3,y:0.92,w:3.7,h:0.45,fill:{color:C.gold}});
  sl.addText("FEATURE STATUS",{x:9.3,y:0.92,w:3.7,h:0.45,fontSize:11,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
  [["✅","Aadhaar Login + OTP"],["✅","38-District Dashboard"],["✅","StateBrain Risk Engine"],["✅","Geospatial Leaflet Map"],["✅","6-Language i18n"],["✅","WhatIf Simulator"],["✅","Gemini AI Advisory"],["✅","Govt Schemes DB"],["✅","PDF Report Export"],["✅","Role-based Access"],["🔧","IoT Live Sensor Feed"],["🔧","Satellite NDVI Layer"]].forEach(([ic,f],i)=>sl.addText(`${ic} ${f}`,{x:9.45,y:1.45+i*0.39,w:3.45,h:0.36,fontSize:9,color:ic==="✅"?C.green:C.amber,fontFace:"Calibri"}));
  // URL bar
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.55,w:13.33,h:0.55,fill:{color:C.card2},line:{color:C.blue,width:0.5}});
  sl.addText("🌐  nimirndhunil.vercel.app  |  ⭐ github.com/threesshad-cpu/agri-neural-twin  |  STATUS: ✅ LIVE & DEPLOYED",{x:0,y:6.55,w:13.33,h:0.55,fontSize:11,color:C.blue,align:"center",fontFace:"Calibri",bold:true});
  glowLine(sl,0,6.55,13.33,C.blue);
}

// SLIDE 8: REVENUE MODEL
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.gold); scanLine(sl,7.48,C.gold);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.gold},shadow:glow(C.gold)});
  sl.addText("// REVENUE MODEL",{x:0.3,y:0.1,w:8,h:0.65,fontSize:34,bold:true,color:C.gold,fontFace:"Trebuchet MS",shadow:glow(C.gold)});
  sl.addText("SaaS + Data-as-a-Service + B2G — Triple Revenue Engine",{x:0.3,y:0.78,w:10,h:0.32,fontSize:12,color:C.muted,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.15,12.5,C.gold);
  const tiers=[
    {t:"🌱 SUBSCRIPTION\nFarmer SaaS",p:"₹0 / ₹199 / mo",c:C.green,bg:"081A0F",items:["Free tier: Basic dashboard","Pro: AI advisory + reports","FPO Plan: ₹2,999/mo","10,000 farmer target Y1","WhatsApp bot integration","Offline PWA sync"]},
    {t:"📊 DATA-as-a-SERVICE\nDaaS B2B",p:"₹5–15L / year",c:C.blue,bg:"080F1A",items:["Anonymized crop analytics","Agri-insurance risk data","Input dealer demand signals","Fintech crop loan scoring","NGO + research access","API data subscription"]},
    {t:"🏛️ GOVT CONTRACTS\nB2G",p:"₹25–50L / yr",c:C.purple,bg:"100018",items:["TN Agri Dept command UI","District Collector dashboard","TNAU data pipeline MoU","NABARD yield + risk report","Policy scenario simulator","Pan-TN scheme analytics"]}
  ];
  tiers.forEach((t,i)=>{
    const x=0.3+i*4.35;
    sl.addShape(prs.ShapeType.rect,{x,y:1.3,w:4.1,h:5.0,fill:{color:t.bg},line:{color:t.c,width:2},shadow:glow(t.c)});
    sl.addShape(prs.ShapeType.rect,{x,y:1.3,w:4.1,h:0.85,fill:{color:t.c}});
    sl.addText(t.t,{x,y:1.3,w:4.1,h:0.85,fontSize:12,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
    sl.addShape(prs.ShapeType.rect,{x:x+0.8,y:2.3,w:2.5,h:0.6,fill:{color:C.dark},line:{color:t.c,width:1}});
    sl.addText(t.p,{x:x+0.8,y:2.3,w:2.5,h:0.6,fontSize:12,bold:true,color:t.c,align:"center",fontFace:"Trebuchet MS",shadow:glow(t.c)});
    t.items.forEach((it,j)=>{
      sl.addShape(prs.ShapeType.rect,{x:x+0.1,y:3.05+j*0.5,w:3.9,h:0.42,fill:{color:C.card},line:{color:t.c+"44",width:0.5}});
      sl.addText(`▸ ${it}`,{x:x+0.2,y:3.05+j*0.5,w:3.7,h:0.42,fontSize:9.5,color:C.white,fontFace:"Calibri"});
    });
  });
  // TAM/SAM strip
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.45,w:13.33,h:1.05,fill:{color:C.card},line:{color:C.gold,width:0.5}});
  glowLine(sl,0,6.45,13.33,C.gold);
  [["TAM","₹12,000 Cr","Indian AgriTech Market",C.purple],["SAM","₹1,800 Cr","TN Digital Farmer Segment",C.blue],["SOM Y3","₹8 Cr","Reachable by 2028",C.green]].forEach(([l,v,s,c],i)=>{
    sl.addShape(prs.ShapeType.rect,{x:0.5+i*4.4,y:6.52,w:4.0,h:0.88,fill:{color:C.card2},line:{color:c,width:1},shadow:glow(c)});
    sl.addText(`${l}: ${v}`,{x:0.5+i*4.4,y:6.54,w:4.0,h:0.45,fontSize:14,bold:true,color:c,align:"center",fontFace:"Trebuchet MS",shadow:glow(c)});
    sl.addText(s,{x:0.5+i*4.4,y:6.98,w:4.0,h:0.3,fontSize:9,color:C.muted,align:"center",fontFace:"Calibri"});
  });
}

// SLIDE 9: GOVT PARTNERSHIPS
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.blue); scanLine(sl,7.48,C.blue);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.blue},shadow:glow(C.blue)});
  sl.addText("// GOVT ALIGNMENT",{x:0.3,y:0.1,w:9,h:0.65,fontSize:34,bold:true,color:C.blue,fontFace:"Trebuchet MS",shadow:glow(C.blue)});
  sl.addText("6 Active Scheme Alignments — MoU Ready  |  EDI-TN + TNAU Pilot Pipeline",{x:0.3,y:0.78,w:11,h:0.32,fontSize:12,color:C.muted,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.15,12.5,C.blue);
  const schemes=[
    {n:"PM-KISAN",c:C.green,a:"Real-time income support tracking via Aadhaar-linked farmer registry. Direct farmer ID integration with PFMS payment verification pipeline."},
    {n:"TNAU Partnership",c:C.blue,a:"TNAU crop advisory algorithm integration. District-level soil health research data pipeline. Co-branded AI advisory for extension officers."},
    {n:"ICAR Integration",c:C.gold,a:"Soil Health Card digitization and NPK benchmarking against ICAR standards. Automated alert when soil metrics deviate from ICAR optimal ranges."},
    {n:"NABARD DaaS",c:C.orange,a:"Anonymized yield + risk data for crop loan underwriting. FPO credit scoring model. District-level agri-finance intelligence dashboard for NABARD officers."},
    {n:"TNIAMP Scheme",c:C.purple,a:"Micro-irrigation subsidy eligibility auto-detection from farmer profile. Drip/sprinkler system matching based on crop-district-acreage triangle."},
    {n:"AgriStack / EDI-TN",c:C.cyan,a:"Unified Farmer ID login via Digital Public Infrastructure. AgriStack API-ready connector layer. Data sovereignty compliance with EDI-TN standards."}
  ];
  schemes.forEach((s,i)=>{
    const col=i%2===0?0.3:6.85, row=Math.floor(i/2);
    const y=1.35+row*1.68;
    sl.addShape(prs.ShapeType.rect,{x:col,y,w:6.3,h:1.5,fill:{color:C.card},line:{color:s.c,width:1.2},shadow:glow(s.c)});
    sl.addShape(prs.ShapeType.rect,{x:col,y,w:0.1,h:1.5,fill:{color:s.c}});
    sl.addShape(prs.ShapeType.rect,{x:col,y,w:6.3,h:0.4,fill:{color:s.c+"22"}});
    sl.addText(s.n,{x:col+0.15,y:y+0.04,w:6.0,h:0.35,fontSize:12,bold:true,color:s.c,fontFace:"Trebuchet MS",shadow:glow(s.c)});
    sl.addText(s.a,{x:col+0.15,y:y+0.46,w:6.0,h:0.95,fontSize:9.5,color:C.white,fontFace:"Calibri",wrap:true});
  });
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.42,w:13.33,h:1.08,fill:{color:"040C14"},line:{color:C.green,width:1},shadow:glow(C.green)});
  glowLine(sl,0,6.42,13.33,C.green);
  sl.addText("📋  MOU STATUS: Letter of Intent drafted for TNAU & EDI-TN  |  Actively seeking 5-district pilot partnership  |  AGRI-STACK API connector ready",{x:0.3,y:6.5,w:12.8,h:0.9,fontSize:11,bold:true,color:C.green,align:"center",fontFace:"Calibri",wrap:true});
}

module.exports = { prs };
