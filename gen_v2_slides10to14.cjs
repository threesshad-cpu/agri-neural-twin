const { prs } = require("./gen_v2_slides5to9.cjs");
const C={bg:"050D0A",card:"0D2016",card2:"0A1A28",green:"00FF88",gold:"FFD700",blue:"00D4FF",orange:"FF6B35",purple:"B44FFF",white:"FFFFFF",muted:"4A8A6A",cyan:"00FFFF",pink:"FF2D78",lime:"AAFF00",dark:"020806",neon:"39FF14",teal:"00CED1",amber:"FFBF00"};
const sh=()=>({type:"outer",blur:12,offset:4,angle:45,color:"000000",opacity:0.6});
const glow=(c)=>({type:"outer",blur:20,offset:0,angle:0,color:c,opacity:0.5});
function glowLine(sl,x,y,w,col){sl.addShape(prs.ShapeType.rect,{x,y,w,h:0.03,fill:{color:col},shadow:glow(col)});}
function scanLine(sl,y,col){sl.addShape(prs.ShapeType.rect,{x:0,y,w:13.33,h:0.02,fill:{color:col}});}
function hexGrid(sl){for(let r=0;r<8;r++)for(let c=0;c<20;c++){const cx=c*0.65+(r%2)*0.32,cy=r*0.55;sl.addShape(prs.ShapeType.rect,{x:cx,y:cy,w:0.5,h:0.01,fill:{color:"1A3A2A"},line:{color:"1A3A2A"}});}}

// SLIDE 10: MARKET OPPORTUNITY
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.orange); scanLine(sl,7.48,C.orange);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.orange},shadow:glow(C.orange)});
  sl.addText("// MARKET OPPORTUNITY",{x:0.3,y:0.1,w:9,h:0.65,fontSize:32,bold:true,color:C.orange,fontFace:"Trebuchet MS",shadow:glow(C.orange)});
  glowLine(sl,0.3,0.82,12.5,C.orange);

  sl.addChart(prs.ChartType.bar,[{name:"Revenue (₹ Lakhs)",labels:["Y1 — 2026","Y2 — 2027","Y3 — 2028"],values:[25,120,800]}],{
    x:0.3,y:0.95,w:6.2,h:3.6,barDir:"col",
    title:"Revenue Projection (₹ Lakhs)",titleFontSize:12,titleColor:C.gold,
    showValue:true,dataLabelColor:C.white,dataLabelFontSize:12,dataLabelFontBold:true,
    chartColors:[C.green,C.blue,C.orange],
    catAxisLabelColor:C.white,valAxisLabelColor:C.white,
    plotAreaFillColor:C.card,chartAreaFillColor:C.bg,shadow:sh()
  });

  sl.addChart(prs.ChartType.doughnut,[{name:"TN Farmers (8.2M)",labels:["Remaining Market (7.6M)","Currently Served (0.5M)","Our Y1 Target (0.1M)"],values:[7600000,500000,100000]}],{
    x:6.8,y:0.95,w:6.2,h:3.6,
    title:"Tamil Nadu Farmer Coverage",titleFontSize:12,titleColor:C.gold,
    showLabel:true,showPercent:true,
    chartColors:[C.card,C.muted,C.green],
    legendColor:C.white,chartAreaFillColor:C.bg,shadow:sh()
  });

  // TAM SAM SOM
  [["TAM","₹12,000 Cr","Indian AgriTech Total Market",C.purple,"100018"],
   ["SAM","₹1,800 Cr","TN Digital Farmer Segment",C.blue,"080F1A"],
   ["SOM","₹8 Cr Y3","Our Reachable by 2028",C.green,"081A0F"],
   ["GROWTH","10x Y1→Y3","Revenue Trajectory",C.gold,"1A1200"]
  ].forEach(([l,v,s,c,bg],i)=>{
    const x=0.3+i*3.2;
    sl.addShape(prs.ShapeType.rect,{x,y:4.75,w:3.0,h:1.75,fill:{color:bg},line:{color:c,width:1.5},shadow:glow(c)});
    sl.addShape(prs.ShapeType.rect,{x,y:4.75,w:3.0,h:0.08,fill:{color:c}});
    sl.addText(l,{x,y:4.88,w:3.0,h:0.42,fontSize:18,bold:true,color:c,align:"center",fontFace:"Trebuchet MS",shadow:glow(c)});
    sl.addText(v,{x,y:5.3,w:3.0,h:0.45,fontSize:15,bold:true,color:C.white,align:"center",fontFace:"Trebuchet MS"});
    sl.addText(s,{x:x+0.1,y:5.75,w:2.8,h:0.62,fontSize:8.5,color:C.muted,align:"center",fontFace:"Calibri",wrap:true});
  });
  glowLine(sl,0,6.55,13.33,C.orange);
  sl.addText("INDIA AGRITECH MARKET: $24B by 2030  |  TN ALONE: 8.2M farmers  |  DIGITAL PENETRATION: <10% — MASSIVE GREENFIELD OPPORTUNITY",{x:0,y:6.6,w:13.33,h:0.88,fontSize:11,bold:true,color:C.orange,align:"center",fontFace:"Calibri"});
}

// SLIDE 11: ROADMAP
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.green); scanLine(sl,7.48,C.green);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.green},shadow:glow(C.green)});
  sl.addText("// PRODUCT ROADMAP",{x:0.3,y:0.1,w:9,h:0.65,fontSize:34,bold:true,color:C.green,fontFace:"Trebuchet MS",shadow:glow(C.green)});
  glowLine(sl,0.3,0.82,12.5,C.green);
  // Timeline
  sl.addShape(prs.ShapeType.rect,{x:0.3,y:1.22,w:12.7,h:0.04,fill:{color:C.muted}});
  [0,1,2,3].forEach(i=>{
    const x=0.85+i*3.2;
    sl.addShape(prs.ShapeType.ellipse,{x:x-0.18,y:1.08,w:0.36,h:0.36,fill:{color:[C.green,C.blue,C.gold,C.purple][i]},shadow:glow([C.green,C.blue,C.gold,C.purple][i])});
  });
  const phases=[
    {l:"PHASE 1\n0 – 2 Months",c:C.green,bg:"081A0F",items:["✅ MVP deployed on Vercel","✅ 38-district dashboard","✅ StateBrain risk engine","✅ Aadhaar login system","✅ 6-language interface","✅ Gemini AI advisory","🔧 Live IoT sensor feed"]},
    {l:"PHASE 2\n3 – 6 Months",c:C.blue,bg:"080F1A",items:["📡 LoRaWAN IoT sensor kits","🏫 TNAU pilot (5 districts)","📱 PWA mobile-first app","🔗 AgriStack API connect","💾 PostgreSQL migration","📊 Offline data sync","🤝 FPO onboarding portal"]},
    {l:"PHASE 3\n1 – 2 Years",c:C.gold,bg:"1A1200",items:["🛰️ VIIRS/Sentinel imagery","👥 10,000 farmer network","🏦 NABARD FPO finance","🏪 Live mandi price API","📈 Series A funding","🌐 3-state expansion","🎯 85%+ AI accuracy"]},
    {l:"PHASE 4\n3+ Years",c:C.purple,bg:"100018",items:["🚁 Drone precision-twin","🇮🇳 National 28-state rollout","💹 IPO-ready structure","🤖 LLM crop doctor app","🌏 SAARC region export","🏆 GovTech award","🔬 Quantum soil sensors"]}
  ];
  phases.forEach((p,i)=>{
    const x=0.3+i*3.27;
    sl.addShape(prs.ShapeType.rect,{x,y:1.55,w:3.1,h:4.95,fill:{color:p.bg},line:{color:p.c,width:1.5},shadow:glow(p.c)});
    sl.addShape(prs.ShapeType.rect,{x,y:1.55,w:3.1,h:0.6,fill:{color:p.c}});
    sl.addText(p.l,{x,y:1.55,w:3.1,h:0.6,fontSize:11,bold:true,color:C.dark,align:"center",fontFace:"Trebuchet MS"});
    p.items.forEach((it,j)=>sl.addText(it,{x:x+0.1,y:2.25+j*0.52,w:2.9,h:0.48,fontSize:9.5,color:C.white,fontFace:"Calibri"}));
  });
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.58,w:13.33,h:0.92,fill:{color:C.card2}});
  glowLine(sl,0,6.58,13.33,C.blue);
  sl.addText("🔮  FUTURE: AI Drone Scouting  ·  NFT Land Registry  ·  Carbon Credit Marketplace  ·  Micro-Climate Neural Net  ·  Quantum Soil Sensors  ·  IPO",{x:0,y:6.65,w:13.33,h:0.78,fontSize:11,color:C.blue,align:"center",italic:true,fontFace:"Calibri"});
}

// SLIDE 12: Q&A PRE-EMPTION
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.gold); scanLine(sl,7.48,C.gold);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.gold},shadow:glow(C.gold)});
  sl.addText("// JURY Q&A — PRE-EMPTED",{x:0.3,y:0.1,w:9,h:0.65,fontSize:30,bold:true,color:C.gold,fontFace:"Trebuchet MS",shadow:glow(C.gold)});
  sl.addText("We anticipated your questions.",{x:0.3,y:0.78,w:8,h:0.32,fontSize:12,color:C.muted,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.15,12.5,C.gold);
  const qas=[
    {q:"How is this different from Kisan Suvidha or eSagu?",c:C.green,a:"Kisan Suvidha is a static info portal. We are a real-time AI Digital Twin — StateBrain simulates 1000 future seasons, predicts cross-district market gluts, and delivers context-aware Gemini Pro advisory in 6 languages. Block-level geospatial twin simulation is unique to this platform."},
    {q:"Most TN farmers lack internet. How does this reach them?",c:C.blue,a:"PWA offline mode caches all district data locally. SMS/WhatsApp advisory delivery is in Phase 2. Login works on 2G. Field officers use the Officer dashboard as proxy. Village kiosk model planned with TNAU. Voice advisory in Tamil under development."},
    {q:"What are your actual data sources right now?",c:C.orange,a:"Current: Mock TN AgriStack telemetry, TNAU published NPK district averages, APMC mandi CSVs (2019-2024), OpenWeatherMap API. Phase 2: LoRaWAN soil sensors (2 vendor LOIs signed), IMD API, Bharat Vistaar satellite integration, live APMC feed."},
    {q:"What is the current prediction accuracy?",c:C.purple,a:"StateBrain market glut predictor: ~78% directional accuracy backtested vs APMC historical data (2019–2024). Gemini advisory: qualitative. Phase 2 target: 85%+ with real IoT sensor input + LSTM neural forecasting layer + satellite cross-validation."}
  ];
  qas.forEach((qa,i)=>{
    const x=i%2===0?0.3:6.85, y=i<2?1.35:4.2;
    sl.addShape(prs.ShapeType.rect,{x,y,w:6.3,h:2.65,fill:{color:C.card},line:{color:qa.c,width:1.5},shadow:glow(qa.c)});
    sl.addShape(prs.ShapeType.rect,{x,y,w:0.1,h:2.65,fill:{color:qa.c}});
    sl.addShape(prs.ShapeType.rect,{x,y,w:6.3,h:0.48,fill:{color:qa.c+"22"}});
    sl.addText(`❓  ${qa.q}`,{x:x+0.15,y:y+0.05,w:6.0,h:0.42,fontSize:10.5,bold:true,color:qa.c,fontFace:"Trebuchet MS",wrap:true});
    sl.addText(qa.a,{x:x+0.15,y:y+0.55,w:6.0,h:2.0,fontSize:9.5,color:C.white,fontFace:"Calibri",wrap:true});
  });
}

// SLIDE 13: TEAM
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  scanLine(sl,0,C.green); scanLine(sl,7.48,C.green);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.green},shadow:glow(C.green)});
  sl.addText("// TEAM UZHAVAR INTELLIGENCE",{x:0.3,y:0.1,w:10,h:0.65,fontSize:28,bold:true,color:C.green,fontFace:"Trebuchet MS",shadow:glow(C.green)});
  sl.addText("உழவர் புத்திசாலிகள் — Smart Farmers, Smarter Future",{x:0.3,y:0.78,w:10,h:0.32,fontSize:12,color:C.gold,fontFace:"Calibri",italic:true});
  glowLine(sl,0.3,1.15,12.5,C.green);
  const members=[
    {n:"Threessha D",r:"Team Lead · Full-Stack Architect",star:true,x:0.3,y:1.3},
    {n:"Padma Priya V",r:"UI/UX · Frontend Engineer",star:false,x:4.8,y:1.3},
    {n:"K. Sathyapriya",r:"AI/ML · Data Engineer",star:false,x:9.3,y:1.3},
    {n:"Santhosh Kumar B",r:"Backend · API Integration",star:false,x:2.1,y:4.0},
    {n:"Karthikeyan K",r:"DevOps · Deployment Lead",star:false,x:7.2,y:4.0}
  ];
  members.forEach(m=>{
    const col=m.star?C.gold:C.green, bg=m.star?"1A1200":C.card;
    sl.addShape(prs.ShapeType.rect,{x:m.x,y:m.y,w:3.8,h:2.45,fill:{color:bg},line:{color:col,width:m.star?2:1},shadow:glow(col)});
    sl.addShape(prs.ShapeType.rect,{x:m.x,y:m.y,w:3.8,h:0.08,fill:{color:col}});
    if(m.star){sl.addText("⭐ TEAM LEAD",{x:m.x,y:m.y+0.1,w:3.8,h:0.3,fontSize:9,bold:true,color:C.gold,align:"center",fontFace:"Trebuchet MS"});}
    sl.addShape(prs.ShapeType.ellipse,{x:m.x+1.4,y:m.y+(m.star?0.48:0.22),w:1.0,h:1.0,fill:{color:m.star?"2A1A00":C.card2},line:{color:col,width:1.5},shadow:glow(col)});
    sl.addText("👤",{x:m.x+1.4,y:m.y+(m.star?0.48:0.22),w:1.0,h:1.0,fontSize:24,align:"center"});
    sl.addText(m.n,{x:m.x,y:m.y+(m.star?1.62:1.35),w:3.8,h:0.42,fontSize:13,bold:true,color:m.star?C.gold:C.white,align:"center",fontFace:"Trebuchet MS"});
    sl.addText(m.r,{x:m.x,y:m.y+(m.star?2.02:1.78),w:3.8,h:0.35,fontSize:9.5,color:m.star?C.amber:C.muted,align:"center",fontFace:"Calibri"});
  });
  sl.addText("C. Abdul Hakeem College of Engineering & Technology",{x:0.3,y:6.48,w:12.5,h:0.3,fontSize:11,color:C.muted,align:"center",fontFace:"Calibri",italic:true});
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.82,w:13.33,h:0.68,fill:{color:C.green},shadow:glow(C.green)});
  sl.addText("🌾 Uzhavar Intelligence | Nimirndhu Nil 2026  ·  🌐 nimirndhunil.vercel.app  ·  ⭐ github.com/threesshad-cpu/agri-neural-twin",{x:0,y:6.82,w:13.33,h:0.68,fontSize:11,bold:true,color:C.dark,align:"center",fontFace:"Calibri"});
}

// SLIDE 14: CALL TO ACTION
{
  const sl=prs.addSlide();
  sl.background={color:C.bg};
  hexGrid(sl);
  // Concentric rings
  [[7.0,"0A2018"],[5.5,"0F2820"],[4.0,"162E1E"],[2.5,C.card]].forEach(([s,f],i)=>
    sl.addShape(prs.ShapeType.ellipse,{x:(13.33-s)/2,y:(7.5-s)/2,w:s,h:s,fill:{color:f},line:{color:i===0?C.green+44:C.green,width:i===3?2:0.5},shadow:i===3?glow(C.green):undefined}));
  scanLine(sl,0,C.green); scanLine(sl,7.48,C.green);
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:0.08,h:7.5,fill:{color:C.green},shadow:glow(C.green)});
  sl.addShape(prs.ShapeType.rect,{x:13.25,y:0,w:0.08,h:7.5,fill:{color:C.green},shadow:glow(C.green)});
  sl.addText("THE SEED IS PLANTED.",{x:0.5,y:1.5,w:12.3,h:1.1,fontSize:44,bold:true,color:C.green,align:"center",fontFace:"Trebuchet MS",shadow:glow(C.green)});
  glowLine(sl,2.0,2.72,9.33,C.green);
  sl.addText("Let's Grow Tamil Nadu's Agricultural Future — Together.",{x:0.5,y:2.85,w:12.3,h:0.65,fontSize:19,color:C.gold,align:"center",fontFace:"Trebuchet MS",italic:true,shadow:glow(C.gold)});
  [["🌐","nimirndhunil.vercel.app",C.blue],["📂","github.com/threesshad-cpu/agri-neural-twin",C.green],["🏆","Nimirndhu Nil — Govt of Tamil Nadu 2026",C.gold]].forEach(([ic,t,col],i)=>{
    sl.addShape(prs.ShapeType.rect,{x:2.0,y:3.7+i*0.75,w:9.33,h:0.62,fill:{color:C.card},line:{color:col,width:1},shadow:glow(col)});
    sl.addText(`${ic}  ${t}`,{x:2.0,y:3.7+i*0.75,w:9.33,h:0.62,fontSize:13,color:col,align:"center",fontFace:"Calibri",bold:true});
  });
  sl.addShape(prs.ShapeType.rect,{x:0,y:6.82,w:13.33,h:0.68,fill:{color:C.card}});
  glowLine(sl,0,6.82,13.33,C.green);
  sl.addText("\"Sabka Saath, Sabka Vikas — Democratizing AI for Every Farmer\" | Team Uzhavar Intelligence",{x:0,y:6.87,w:13.33,h:0.55,fontSize:11,color:C.green,align:"center",italic:true,fontFace:"Calibri",shadow:glow(C.green)});
}

// SAVE
prs.writeFile({fileName:"Agri_Neural_Twin_FINAL_v2.pptx"}).then(()=>{
  const fs=require("fs");
  const sz=fs.statSync("Agri_Neural_Twin_FINAL_v2.pptx").size;
  console.log(`\n✅  Agri_Neural_Twin_FINAL_v2.pptx — 14 SLIDES SAVED`);
  console.log(`📦  File size: ${(sz/1024).toFixed(1)} KB`);
  console.log(`🎨  Ultra-futuristic NASA-grade design complete!`);
}).catch(e=>console.error("❌",e));
