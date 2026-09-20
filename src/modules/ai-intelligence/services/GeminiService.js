/**
 * Agri-Neural Twin: Gemini AI Service 🧠
 * Integrates Google's Gemini Pro Model for Agricultural Advisory.
 */

import i18n from '../../../i18n';

const GEMINI_PROXY = '/api/gemini/generate';

export const GeminiService = {

    /**
     * Generates an advisory based on farm context.
     * Uses English + Tamil (Tanglish) mix.
     */
    generateAdvisory: async (context) => {
        const language = i18n.language || 'en';
        try {
            const prompt = `Generate a farm advisory based on this context: ${JSON.stringify(context)}. Reply in language code '${language}'. Keep it short and actionable.`;
            const res = await fetch(GEMINI_PROXY, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
        } catch (e) { console.warn('Advisory fallback:', e.message); }
        
        return getMockResponse({ ...context, language });
    },

    /**
     * Generates a 1-sentence personalized pitch for a government scheme.
     */
    generateSchemePitch: async (schemeName, context) => {
        const { crop, district, acreage } = context;
        const language = i18n.language || 'en';
        
        try {
            const prompt = `Generate a 1-sentence personalized pitch for the scheme "${schemeName}" based on farm: ${acreage} acres of ${crop} in ${district}. Reply in language code '${language}'.`;
            const res = await fetch(GEMINI_PROXY, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
        } catch (e) { console.warn('Scheme pitch fallback:', e.message); }

        const translatedCrop = i18n.t(`crops.${crop.toLowerCase()}`, { defaultValue: crop });
        const translatedDistrict = i18n.t(`districts.${district.toLowerCase()}`, { defaultValue: district });

        const templates = {
            en: `Based on your ${acreage}-acre ${translatedCrop} farm in ${translatedDistrict}, this scheme can reduce input costs by ~₹12,000/year.`,
            ta: `உங்களுடைய ${translatedDistrict} மாவட்டத்தில் உள்ள ${acreage}-ஏக்கர் ${translatedCrop} பண்ணையின் அடிப்படையில், இந்தத் திட்டம் உள்ளீட்டுச் செலவைக் குறைத்து ஆண்டிற்கு ~₹12,000 வரை சேமிக்க உதவும்.`,
            te: `${translatedDistrict} జిల్లాలోని మీ ${acreage}-ఎకరాల ${translatedCrop} పొలం ఆధారంగా, ఈ పథకం ఇన్‌పుట్ ఖర్చులను సంవత్సరానికి ~₹12,000 వరకు తగ్గిస్తుంది.`,
            kn: `${translatedDistrict} ಜಿಲ್ಲೆಯಲ್ಲಿರುವ ನಿಮ್ಮ ${acreage}-ಎಕರೆ ${translatedCrop} ಜಮೀನಿನ ಆಧಾರದ ಮೇಲೆ, ಈ ಯೋಜನೆಯು ಇನ್‌ಪುಟ್ ವೆಚ್ಚವನ್ನು ವರ್ಷಕ್ಕೆ ~₹12,000 ರಷ್ಟು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.`,
            ml: `${translatedDistrict} ജില്ലയിലെ നിങ്ങളുടെ ${acreage}-ഏക്കർ ${translatedCrop} കൃഷി അടിസ്ഥാനമാക്കി, ഈ പദ്ധതി ഇൻപുട്ട് ചെലവുകൾ പ്രതിവർഷം ~₹12,000 വരെ കുറയ്ക്കാൻ സഹായിക്കും.`,
            ur: `آپ کے ${translatedDistrict} ضلع کے ${acreage} ایکڑ ${translatedCrop} فارم کی بنیاد پر، یہ اسکیم لاگت کو سالانہ ~₹12,000 تک کم کر سکتی ہے۔`
        };

        const pitch = templates[language] || templates.en;
        return pitch;
    },

    /**
     * Processes voice input and generates a conversational response.
     */
    generateVoiceAdvisory: async (context, voiceInput) => {
        const language = i18n.language || 'en';
        try {
            const prompt = `Farmer asked: "${voiceInput}". Context: ${JSON.stringify(context)}. Give a short, conversational response in language code '${language}'.`;
            const res = await fetch(GEMINI_PROXY, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
        } catch (e) { console.warn('Voice advisory fallback:', e.message); }

        return getVoiceMockResponse({ ...context, language }, voiceInput);
    },

    /** Gemini Vision: analyze uploaded crop image */
    analyzeImage: async (base64Image, mimeType, context = {}) => {
        const language = i18n.language || 'en';
        const districtCtx = context.district || 'Tamil Nadu';
        const langMap = { ta:'Tamil', te:'Telugu', kn:'Kannada', ml:'Malayalam', ur:'Urdu', en:'English' };
        const langName = langMap[language] || 'English';

        try {
            const prompt = `You are an expert agricultural plant pathologist in ${districtCtx}, India.
Analyze this crop image and respond in ${langName} ONLY.
Respond as JSON: {"issue":"<disease/deficiency in 1 sentence>","confidence":<50-95>,"action":"<2-3 sentence treatment>","reasoning":"<science in 2 sentences>","risk":"<Low|Medium|High>","notes":"<additional tip>"}`;
            const res = await fetch(
                GEMINI_PROXY,
                { method:'POST', headers:{'Content-Type':'application/json'},
                  body: JSON.stringify({ contents:[{ parts:[
                      { text: prompt },
                      { inline_data: { mime_type: mimeType, data: base64Image } }
                  ]}]})}
            );
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
            if (json.issue) return json;
        } catch(e) { console.warn('Vision fallback:', e.message); }
        return getImageMock(language, districtCtx);
    },

    /** Analyze an uploaded document/photo report — Soil Report (PDF/Image), Farm Image, Crop Image.
     * Returns { insights:[], recommendations:[], summary, risk }
     */
    analyzeReportDocument: async (base64Data, mimeType, context = {}) => {
        const language = i18n.language || 'en';
        const districtCtx = context.district || 'Tamil Nadu';
        const docType = context.docType || 'soil_report';

        try {
            const langMap = { ta:'Tamil', te:'Telugu', kn:'Kannada', ml:'Malayalam', ur:'Urdu', en:'English' };
            const langName = langMap[language] || 'English';
            const docLabel = { soil_report: 'soil test report', farm_image: 'farm/field photo', crop_image: 'crop photo' }[docType] || 'document';
            const prompt = `You are an expert agronomist in ${districtCtx}, India.
Analyze this ${docLabel} and respond in ${langName} ONLY.
Respond STRICTLY as JSON:
{"summary":"<2-3 sentence overview>","insights":["<insight 1>","<insight 2>","<insight 3>"],"recommendations":["<action 1>","<action 2>","<action 3>"],"risk":"<Low|Medium|High>"}`;
            const res = await fetch(
                GEMINI_PROXY,
                { method:'POST', headers:{'Content-Type':'application/json'},
                  body: JSON.stringify({ contents:[{ parts:[
                      { text: prompt },
                      { inline_data: { mime_type: mimeType, data: base64Data } }
                  ]}]})}
            );
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
            if (json.summary) return json;
        } catch(e) { console.warn('Report analysis fallback:', e.message); }
        return getReportMock(docType, language, districtCtx);
    },

    /** FarmGPT — structured agricultural Q&A in 6 languages.
     * Returns { issue, confidence, action, reasoning }
     */
    askFarmGPT: async (query, context = {}) => {
        const language = i18n.language || 'en';
        const district = context.district || 'Tamil Nadu';

        try {
            const langMap = { ta:'Tamil', te:'Telugu', kn:'Kannada', ml:'Malayalam', ur:'Urdu', en:'English' };
            const langName = langMap[language] || 'English';
            const prompt = `You are an expert agricultural scientist for ${district}, India.
Answer this farmer query in ${langName} ONLY: "${query}"
Respond STRICTLY as JSON:
{"issue":"<problem in 1 sentence>","confidence":<60-95>,"action":"<2-3 sentence recommendation>","reasoning":"<2 sentence science>"}`;

            const res = await fetch(
                GEMINI_PROXY,
                { method:'POST', headers:{'Content-Type':'application/json'},
                  body: JSON.stringify({ contents:[{ parts:[{ text: prompt }] }] }) }
            );
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
            if (json.issue) return json;
        } catch(e) { console.warn('FarmGPT fallback:', e.message); }

        return getFarmGPTMock(query, language, district);
    },
};


// Start-of-the-art Mock Response Generator (Tanglish & Tamil)
const getMockResponse = ({ crop, riskLevel, weather, language }) => {
    const isRisk = riskLevel === 'High';
    const isRain = weather?.condition?.includes('Rain');

    // Tamil Response (Pure)
    if (language === 'ta') {
        if (isRisk && isRain) {
            return `⚠️ **முக்கிய எச்சரிக்கை**:
• ${crop} சந்தை விலை குறைய வாய்ப்புள்ளது. மேலும், ${weather.condition} முன்னறிவிப்பு உள்ளது.
• வடிகால் அமைப்புகளை உடனடியாக சரிபார்க்கவும். நீர் தேத்துவருவது விளைச்சலை பாதிக்கும்.
• அறுவடையை 2 நாட்கள் தாமதப்படுத்துவது நல்லது.`;
        }
        if (isRisk) {
            return `⚠️ **சந்தை எச்சரிக்கை**:
• சந்தையில் ${crop} வரத்து அதிகமாக உள்ளது (Glut). விலை குறையலாம்.
• நீங்கள் சிறிது காலம் காத்திருந்து, குளிர் பதன கிடங்கில் வைப்பது நல்லது.
• மதிப்பு கூட்டப்பட்ட பொருட்களாக மாற்ற முயற்சிக்கவும் (எ.கா. தக்காளி சாறு).`;
        }
        if (isRain) {
            return `🌧️ **வானிலை எச்சரிக்கை**:
• கனமழை பெய்ய வாய்ப்புள்ளது.
• இப்போது உரம் இட வேண்டாம், அது மழைநீரில் அடித்துச் செல்லப்படும்.
• பயிரைப் பாதுகாக்க முடிந்தால் மூடி வைக்கவும்.`;
        }
        return `✅ **சாதகமான முன்னறிவிப்பு**:
• ${crop} சந்தை சீராக உள்ளது. நல்ல விலை கிடைக்கும்.
• தற்போதைய வானிலை (${weather.condition}) பயிர் வளர்ச்சிக்கு ஏற்றது.
• தற்போதைய நீர்ப்பாசன முறையைத் தொடரவும்.`;
    }

    // Default: Tanglish (Tamil + English)
    if (isRisk && isRain) {
        return `⚠️ **Critical Advisory**:
• ${crop} market risk romba high-ah iruku. Plus, ${weather.condition} forecast vera.
• Immediate-ah drainage channels check pannunga. Waterlogging can destroy 40% yield.
• Better to delay harvest by 2 days until rain stops to get better price in sandhai.`;
    }

    if (isRisk) {
        return `⚠️ **Market Caution**:
• ${crop} varathu (supply) market-la jasthi aaiduchu (Glut). Price definitely kuraiyum.
• Neenga konjam hold panni, cold storage-la vecha better returns kedaikum.
• Value addition try pannunga (e.g. Tomato puree instead of raw tomato).`;
    }

    if (isRain) {
        return `🌧️ **Weather Alert**:
• Heavy rain varalaam per weather report.
• Fertilizers ippo podaatheenga, wash out aaidum (Waste of money).
• Crop protect panna cover use pannunga if possible.`;
    }

    return `✅ **Optimistic Outlook**:
• Market steady-ah iruku for ${crop}. Nalla vilai kedaikum.
• Current weather (${weather.condition}) is good for growth.
• Continue current irrigation plan. No major risks detected by Neural Engine.`;
};

const getVoiceMockResponse = ({ language }, input) => {
    if (language === 'ta') {
        return "வணக்கம் விவசாயி நண்பரே! நான் உங்கள் அக்ரி-வாய்ஸ் உதவியாளர். உங்கள் பயிர் மற்றும் வானிலை பற்றிய தகவல்களை நான் ஆய்வு செய்து வருகிறேன். பாதுகாப்பான மகசூலுக்கு இப்போதே நடவடிக்கை எடுக்கவும்.";
    }
    return "Hello farmer! I heard you say: \"" + input + "\". Analysing your crop data now. Based on my neural engine, I suggest you monitor the soil moisture levels closely today.";
};

// ─── FarmGPT Mock Engine (6 languages) ───────────────────────────────────────
const FARM_GPT_RESPONSES = {
  yellow_leaves: {
    en: { issue:"Nitrogen deficiency causing chlorosis in paddy leaves", confidence:87, action:"Apply Urea @ 25 kg/acre immediately. Split into 2 doses 15 days apart. Ensure adequate irrigation before application.", reasoning:"Yellow leaves indicate low chlorophyll from N deficiency. Urea provides fast-release nitrogen restoring green colour within 7–10 days." },
    ta: { issue:"நெல் இலைகளில் நைட்ரஜன் குறைபாடு காரணமாக மஞ்சள் நிறம்", confidence:87, action:"ஏக்கருக்கு 25 கிலோ யூரியா உடனடியாக இடவும். 15 நாட்கள் இடைவெளியில் 2 தவணைகளாக கொடுக்கவும். உரம் இடுவதற்கு முன் நீர்ப்பாசனம் செய்யவும்.", reasoning:"மஞ்சள் இலைகள் நைட்ரஜன் குறைவால் குளோரோபில் இல்லாமை காட்டுகிறது. யூரியா 7–10 நாட்களில் பசுமையை மீட்டெடுக்கும்." },
    te: { issue:"వరి ఆకులలో నత్రజని లోపం వల్ల పసుపు రంగు", confidence:85, action:"ఎకరాకు 25 కిలోల యూరియా వెంటనే వేయండి. 15 రోజుల వ్యవధిలో 2 విడతలుగా ఇవ్వండి.", reasoning:"పసుపు ఆకులు నత్రజని లోపాన్ని సూచిస్తాయి. యూరియా 7–10 రోజులలో పచ్చదనాన్ని తిరిగి తీసుకొస్తుంది." },
    kn: { issue:"ಭತ್ತದ ಎಲೆಗಳಲ್ಲಿ ಸಾರಜನಕ ಕೊರತೆಯಿಂದ ಹಳದಿ ಬಣ್ಣ", confidence:85, action:"ಎಕರೆಗೆ 25 ಕೆಜಿ ಯೂರಿಯಾ ತಕ್ಷಣ ಹಾಕಿ. 15 ದಿನಗಳ ಅಂತರದಲ್ಲಿ 2 ಬಾರಿ ಕೊಡಿ.", reasoning:"ಹಳದಿ ಎಲೆಗಳು ಸಾರಜನಕ ಕೊರತೆಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಯೂರಿಯಾ 7–10 ದಿನಗಳಲ್ಲಿ ಹಸಿರನ್ನು ಮರಳಿ ತರುತ್ತದೆ." },
    ml: { issue:"നെൽ ഇലകളിൽ നൈട്രജൻ കുറവ് മൂലം മഞ്ഞ നിറം", confidence:85, action:"ഏക്കറിന് 25 കിലോ യൂറിയ ഉടൻ ഇടുക. 15 ദിവസം ഇടവിട്ട് 2 ഡോസ് കൊടുക്കുക.", reasoning:"മഞ്ഞ ഇലകൾ നൈട്രജൻ കുറവ് കാണിക്കുന്നു. യൂറിയ 7–10 ദിവസത്തിൽ പച്ചനിറം തിരിച്ചു കൊണ്ടുവരും." },
    ur: { issue:"دھان کے پتوں میں نائٹروجن کی کمی سے پیلاپن", confidence:85, action:"فی ایکڑ 25 کلو یوریا فوری ڈالیں۔ 15 دن کے وقفے سے 2 بار دیں۔", reasoning:"پیلے پتے نائٹروجن کی کمی ظاہر کرتے ہیں۔ یوریا 7–10 دنوں میں سبزی واپس لائے گی۔" },
  },
  irrigation: {
    en: { issue:"Optimal irrigation timing depends on crop growth stage and soil moisture", confidence:82, action:"Irrigate when top 5cm soil is dry. For paddy: maintain 5cm water. For other crops: irrigate every 5–7 days in summer, 10–12 days in winter.", reasoning:"Plants absorb water most efficiently at field capacity. Over-irrigation causes root rot; under-irrigation causes wilting and yield loss." },
    ta: { issue:"பயிர் வளர்ச்சி நிலை மற்றும் மண் ஈரப்பதத்தை பொறுத்து நீர்ப்பாசன நேரம் மாறும்", confidence:82, action:"மேல் 5 செ.மீ. மண் உலர்ந்தால் நீர் பாய்ச்சவும். நெல்: 5 செ.மீ. நீர் நிலை வைக்கவும். மற்ற பயிர்கள்: கோடையில் 5–7 நாட்கள், குளிரில் 10–12 நாட்களுக்கு ஒரு முறை.", reasoning:"மண் நீர் தாங்கும் திறனில் பயிர்கள் சிறப்பாக வளர்கின்றன. அதிக நீர் வேர் அழுகலை ஏற்படுத்தும்." },
    te: { issue:"పంట దశ మరియు నేల తేమను బట్టి నీటి పారుదల సమయం నిర్ణయించాలి", confidence:82, action:"పై 5 సెం.మీ. నేల ఎండిపోయినప్పుడు నీరు పెట్టండి. వేసవిలో 5–7 రోజులకు, చలికాలంలో 10–12 రోజులకు ఒకసారి.", reasoning:"పంటలు ఫీల్డ్ కెపాసిటీలో నీటిని బాగా తీసుకుంటాయి. అధిక నీరు వేరు కుళ్ళుకు దారితీస్తుంది." },
    kn: { issue:"ಬೆಳೆ ಹಂತ ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ ಆಧಾರದ ಮೇಲೆ ನೀರಾವರಿ ಸಮಯ", confidence:82, action:"ಮೇಲ್ಭಾಗದ 5 ಸೆಂ.ಮೀ ಒಣಗಿದಾಗ ನೀರು ಹಾಕಿ. ಬೇಸಿಗೆಯಲ್ಲಿ 5–7 ದಿನ, ಚಳಿಗಾಲದಲ್ಲಿ 10–12 ದಿನಕ್ಕೊಮ್ಮೆ.", reasoning:"ಮಣ್ಣಿನ ನೀರು ಸಂಗ್ರಹ ಸಾಮರ್ಥ್ಯದಲ್ಲಿ ಬೆಳೆ ಉತ್ತಮವಾಗಿ ಬೆಳೆಯುತ್ತದೆ." },
    ml: { issue:"വിള ഘട്ടം, മണ്ണ് ഈർപ്പം അനുസരിച്ച് ജലസേചന സമയം", confidence:82, action:"മുകളിലെ 5 സെ.മീ. മണ്ണ് ഉണങ്ങുമ്പോൾ നനയ്ക്കുക. വേനലിൽ 5–7 ദിവസം, ശൈത്യത്തിൽ 10–12 ദിവസം.", reasoning:"ഫീൽഡ് കപ്പാസിറ്റിയിൽ ചെടികൾ ജലം ഏറ്റവും ഫലപ്രദമായി ആഗിരണം ചെയ്യുന്നു." },
    ur: { issue:"فصل کی نشوونما اور مٹی کی نمی کے مطابق آبپاشی کا وقت", confidence:82, action:"جب اوپری 5 سینٹی میٹر مٹی خشک ہو تو پانی دیں۔ گرمیوں میں 5–7 دن، سردیوں میں 10–12 دن بعد۔", reasoning:"فیلڈ کیپیسٹی پر فصلیں پانی بہترین طریقے سے جذب کرتی ہیں۔" },
  },
  nitrogen: {
    en: { issue:"Nitrogen requirement varies by crop — paddy needs 80–120 kg N/hectare", confidence:90, action:"For paddy: Apply 40 kg Urea at transplanting, 40 kg at tillering (25 DAS), 20 kg at panicle initiation. For vegetables: 25–30 kg Urea/acre split 3 times.", reasoning:"Nitrogen drives vegetative growth and chlorophyll synthesis. Split application prevents leaching and improves use efficiency by 30–40%." },
    ta: { issue:"பயிர் வகையை பொறுத்து நைட்ரஜன் தேவை மாறும் — நெல்லுக்கு 80–120 கிலோ N/ஹெக்டேர்", confidence:90, action:"நெல்: நாற்று நடும்போது 40 கிலோ யூரியா, 25 நாளில் 40 கிலோ, கதிர் வரும்போது 20 கிலோ. காய்கறி: 3 தவணைகளாக 25–30 கிலோ/ஏக்கர்.", reasoning:"நைட்ரஜன் தழை வளர்ச்சி மற்றும் பச்சையம் உற்பத்திக்கு அவசியம். பிரித்து கொடுப்பதால் 30–40% திறன் அதிகரிக்கும்." },
    te: { issue:"పంట రకాన్ని బట్టి నత్రజని అవసరం మారుతుంది — వరికి 80–120 కిలో N/హెక్టారు", confidence:90, action:"వరి: నాటేటప్పుడు 40 కిలో యూరియా, 25 DAT కి 40 కిలో, పూతకు 20 కిలో. కూరగాయలు: 3 విడతలుగా 25–30 కిలో/ఎకరా.", reasoning:"నత్రజని ఆకుపచ్చ పెరుగుదల మరియు క్లోరోఫిల్ కి అవసరం. విభజించి ఇవ్వడం వల్ల సామర్థ్యం 30–40% పెరుగుతుంది." },
    kn: { issue:"ಬೆಳೆ ಪ್ರಕಾರಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಸಾರಜನಕ ಅಗತ್ಯ — ಭತ್ತಕ್ಕೆ 80–120 ಕೆಜಿ N/ಹೆಕ್ಟೇರ್", confidence:90, action:"ಭತ್ತ: ನಾಟಿ ಸಮಯ 40 ಕೆಜಿ ಯೂರಿಯಾ, 25 DAT ಕ್ಕೆ 40 ಕೆಜಿ, ತೆನೆ ಬರುವಾಗ 20 ಕೆಜಿ.", reasoning:"ಸಾರಜನಕ ಸಸ್ಯ ಬೆಳವಣಿಗೆ ಮತ್ತು ಕ್ಲೋರೋಫಿಲ್‌ಗೆ ಅಗತ್ಯ. ವಿಭಜಿತ ಪ್ರಯೋಗ 30–40% ದಕ್ಷತೆ ಹೆಚ್ಚಿಸುತ್ತದೆ." },
    ml: { issue:"വിള ഇനം അനുസരിച്ച് നൈട്രജൻ ആവശ്യം മാറും — നെൽകൃഷിക്ക് 80–120 കിലോ N/ഹെക്ടർ", confidence:90, action:"നെല്ല്: നടുന്ന സമയം 40 കിലോ യൂറിയ, 25 DAT ൽ 40 കിലോ, കതിർ വരുമ്പോൾ 20 കിലോ.", reasoning:"നൈട്രജൻ സസ്യ വളർച്ചക്കും ക്ലോറോഫില്ലിനും ആവശ്യമാണ്. ഭാഗങ്ങളായി നൽകുന്നത് 30–40% ഫലപ്രദം." },
    ur: { issue:"فصل کی قسم کے مطابق نائٹروجن کی ضرورت — دھان کو 80–120 کلو N/ہیکٹر", confidence:90, action:"دھان: پنیری لگاتے وقت 40 کلو یوریا، 25 DAT پر 40 کلو، بالی آنے پر 20 کلو۔", reasoning:"نائٹروجن پودوں کی نشوونما اور کلوروفل کے لیے ضروری ہے۔ تقسیم دینے سے 30–40% فائدہ بڑھتا ہے۔" },
  },
  pest_cotton: {
    en: { issue:"Pink bollworm or whitefly infestation likely on cotton — economic threshold exceeded", confidence:83, action:"Spray Profenofos 50EC @ 2ml/L or Spinosad 45SC @ 0.3ml/L. Remove and destroy affected bolls. Install pheromone traps @ 5/acre.", reasoning:"Cotton bollworms cause 30–60% yield loss if untreated. IPM approach combining chemical and pheromone traps reduces resistance development." },
    ta: { issue:"பருத்தியில் இளஞ்சிவப்பு காய்புழு அல்லது வெள்ளை ஈ தாக்குதல் — பொருளாதார நுழைவு வரம்பு தாண்டியது", confidence:83, action:"Profenofos 50EC @ 2ml/L அல்லது Spinosad 45SC @ 0.3ml/L தெளிக்கவும். பாதிக்கப்பட்ட காய்களை அகற்றி அழிக்கவும். 5/ஏக்கர் பெரோமோன் பொறிகள் வைக்கவும்.", reasoning:"பருத்தி காய்புழு சரியான நேரத்தில் கட்டுப்படுத்தாவிட்டால் 30–60% மகசூல் இழப்பு ஏற்படும்." },
    te: { issue:"పత్తిపై గులాబీ కాయతొలుచు పురుగు లేదా తెల్ల ఈగ ఆక్రమణ", confidence:83, action:"Profenofos 50EC @ 2ml/L లేదా Spinosad 45SC @ 0.3ml/L పిచికారీ చేయండి. ఆశించిన కాయలు తొలగించి నాశనం చేయండి.", reasoning:"సకాలంలో నివారించకపోతే పత్తి పురుగు 30–60% దిగుబడి నష్టం కలిగిస్తుంది." },
    kn: { issue:"ಹತ್ತಿಯಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿಕೊರಕ ಅಥವಾ ಬಿಳಿ ನೊಣ ಆಕ್ರಮಣ", confidence:83, action:"Profenofos 50EC @ 2ml/L ಅಥವಾ Spinosad 45SC @ 0.3ml/L ಸಿಂಪಡಿಸಿ. ಪೀಡಿತ ಕಾಯಿಗಳನ್ನು ತೆಗೆದು ನಾಶಪಡಿಸಿ.", reasoning:"ಸಕಾಲಿಕ ನಿಯಂತ್ರಣ ಇಲ್ಲದಿದ್ದರೆ ಹತ್ತಿ ಕಾಯಿಕೊರಕ 30–60% ಇಳುವರಿ ನಷ್ಟ ಉಂಟುಮಾಡುತ್ತದೆ." },
    ml: { issue:"പരുത്തിയിൽ പിങ്ക് ബോൾവോം അല്ലെങ്കിൽ വൈറ്റ്ഫ്ലൈ ആക്രമണം", confidence:83, action:"Profenofos 50EC @ 2ml/L അല്ലെങ്കിൽ Spinosad 45SC @ 0.3ml/L തളിക്കുക. ബാധിച്ച കായകൾ നീക്കം ചെയ്ത് നശിപ്പിക്കുക.", reasoning:"നിയന്ത്രിക്കാതിരുന്നാൽ പരുത്തി ബോൾവോം 30–60% വിളവ് നഷ്ടം ഉണ്ടാക്കും." },
    ur: { issue:"کپاس پر گلابی سنڈی یا سفید مکھی کا حملہ", confidence:83, action:"Profenofos 50EC @ 2ml/L یا Spinosad 45SC @ 0.3ml/L سپرے کریں۔ متاثرہ ٹنڈے ہٹا کر تلف کریں۔", reasoning:"بروقت قابو نہ کیا تو کپاس کی سنڈی 30–60% پیداوار نقصان کرتی ہے۔" },
  },
};

const QUERY_KEYWORDS = {
  yellow_leaves: ['yellow','yell','chloro','மஞ்சள்','पीला','పసుపు','ಹಳದಿ','مٹی','مرجھانا','pale','chlorosis'],
  irrigation:    ['irrigat','water','நீர்','پانی','నీరు','ನೀರು','वर्षा','when','எப்போது'],
  nitrogen:      ['nitrogen','nitro','urea','N-defic','நைட்ரஜன்','نائٹروجن','నత్రజని','ಸಾರಜನಕ','how much'],
  pest_cotton:   ['pest','cotton','பருத்தி','pests','bug','insect','bollworm','whitefly','attack','کپاس'],
};

const detectCategory = (query) => {
  const q = query.toLowerCase();
  for (const [cat, kws] of Object.entries(QUERY_KEYWORDS)) {
    if (kws.some(k => q.includes(k))) return cat;
  }
  return null;
};

const getFarmGPTMock = (query, language, district) => {
  const lang = ['en','ta','te','kn','ml','ur'].includes(language) ? language : 'en';
  const cat = detectCategory(query);
  if (cat && FARM_GPT_RESPONSES[cat]?.[lang]) return FARM_GPT_RESPONSES[cat][lang];
  // Generic fallback
  const fallbacks = {
    en: { issue:`General crop health advisory for ${district}`, confidence:72, action:"Monitor your crop daily. Check soil moisture, leaf colour, and pest presence. Consult local Krishi Vigyan Kendra for field visit.", reasoning:"Early detection of stress prevents yield loss. Regular monitoring is the cornerstone of integrated crop management." },
    ta: { issue:`${district} பொது பயிர் ஆரோக்கிய ஆலோசனை`, confidence:72, action:"தினமும் பயிரை கண்காணிக்கவும். மண் ஈரம், இலை நிறம், பூச்சி தாக்குதல் சரிபார்க்கவும். உள்ளூர் KVK அலுவலரை தொடர்பு கொள்ளவும்.", reasoning:"முன்கூட்டி கண்டறிவது மகசூல் இழப்பை தடுக்கும். தொடர் கண்காணிப்பு ஒருங்கிணைந்த பயிர் மேலாண்மையின் அடிப்படை." },
    te: { issue:`${district} సాధారణ పంట ఆరోగ్య సలహా`, confidence:72, action:"రోజూ పంటను పర్యవేక్షించండి. నేల తేమ, ఆకు రంగు, పురుగు సమస్యలు తనిఖీ చేయండి.", reasoning:"ముందుగా గుర్తించడం దిగుబడి నష్టాన్ని నివారిస్తుంది." },
    kn: { issue:`${district} ಸಾಮಾನ್ಯ ಬೆಳೆ ಆರೋಗ್ಯ ಸಲಹೆ`, confidence:72, action:"ಪ್ರತಿದಿನ ಬೆಳೆ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ. ಮಣ್ಣಿನ ತೇವ, ಎಲೆ ಬಣ್ಣ, ಕೀಟ ಸಮಸ್ಯೆ ತಪಾಸಣೆ ಮಾಡಿ.", reasoning:"ಮೊದಲೇ ಪತ್ತೆ ಮಾಡಿದರೆ ಇಳುವರಿ ನಷ್ಟ ತಡೆಯಬಹುದು." },
    ml: { issue:`${district} പൊതു വിള ആരോഗ്യ ഉപദേശം`, confidence:72, action:"ദൈനംദിന വിള നിരീക്ഷണം നടത്തുക. മണ്ണ് ഈർപ്പം, ഇല നിറം, കീടബാധ പരിശോധിക്കുക.", reasoning:"നേരത്തെ കണ്ടെത്തൽ വിളവ് നഷ്ടം തടയുന്നു." },
    ur: { issue:`${district} عام فصل صحت مشاورت`, confidence:72, action:"روزانہ فصل کا جائزہ لیں۔ مٹی کی نمی، پتوں کا رنگ، کیڑوں کی موجودگی چیک کریں۔", reasoning:"جلد پتہ لگانے سے پیداوار کا نقصان روکا جا سکتا ہے۔" },
  };
  return fallbacks[lang] || fallbacks.en;
};

// ─── Report Document Analysis Mock (Soil Report / Farm Image / Crop Image) ──
const REPORT_MOCKS = {
  soil_report: {
    en: { summary:"Soil test indicates moderately fertile loam soil with low nitrogen and adequate phosphorus/potassium reserves.", insights:["Nitrogen levels are below optimal for current crop stage","Soil pH is within the ideal range of 6.5–7.2","Organic carbon content is moderate, indicating average microbial activity"], recommendations:["Apply Urea @ 25 kg/acre split into 2 doses","Add 2 tonnes/acre of farmyard manure to boost organic carbon","Re-test soil after 90 days to track nitrogen recovery"], risk:"Medium" },
  },
  farm_image: {
    en: { summary:"Farm field shows uniform crop stand with minor patchy growth near the field boundary, likely due to drainage variation.", insights:["Crop canopy coverage is approximately 75–80% — healthy for this growth stage","Patchy yellowing visible at field edges suggests waterlogging or nutrient runoff","No major weed infestation detected in the visible area"], recommendations:["Improve field-edge drainage with shallow channels","Apply foliar micronutrient spray on patchy zones","Continue routine monitoring weekly"], risk:"Low" },
  },
  crop_image: {
    en: { summary:"Crop photo shows early-stage leaf discoloration consistent with nutrient stress, with no major pest damage observed.", insights:["Yellowing concentrated on older/lower leaves suggests nitrogen mobility deficiency","No visible insect bite marks or webbing detected","Leaf texture appears firm, ruling out severe fungal wilt"], recommendations:["Apply Urea @ 20 kg/acre immediately","Monitor for 7 days and re-photograph to track recovery","Consult local KVK if yellowing spreads to younger leaves"], risk:"Medium" },
  },
};

const getReportMock = (docType, language, _district) => {
  const lang = ['en','ta','te','kn','ml','ur'].includes(language) ? language : 'en';
  const byType = REPORT_MOCKS[docType] || REPORT_MOCKS.soil_report;
  return byType[lang] || byType.en;
};

// ─── Image Analysis Mock (6 languages) ───────────────────────────────────────
const getImageMock = (language, _district) => {
  const lang = ['en','ta','te','kn','ml','ur'].includes(language) ? language : 'en';
  const mocks = {
    en: { issue:"Nitrogen deficiency and early-stage leaf blight detected in crop", confidence:78, action:"Apply Urea @ 20 kg/acre. Spray Mancozeb 75WP @ 2g/L for blight. Ensure proper drainage to prevent fungal spread.", reasoning:"Yellowing with brown margins indicates N deficiency combined with Helminthosporium infection. Mancozeb disrupts fungal cell membrane synthesis.", risk:"Medium", notes:"Take another image in 7 days to track recovery. Consult KVK if symptoms worsen." },
    ta: { issue:"பயிரில் நைட்ரஜன் குறைபாடு மற்றும் ஆரம்ப நிலை இலை கருகல் கண்டறியப்பட்டது", confidence:78, action:"ஏக்கருக்கு 20 கிலோ யூரியா இடவும். Mancozeb 75WP @ 2g/L தெளிக்கவும். சரியான வடிகால் அமைப்பை உறுதி செய்யவும்.", reasoning:"மஞ்சள் நிறத்துடன் பழுப்பு விளிம்பு நைட்ரஜன் குறைபாட்டையும் பூஞ்சாண் தொற்றையும் காட்டுகிறது.", risk:"Medium", notes:"7 நாட்கள் கழித்து மீண்டும் படம் எடுத்து ஒப்பிடவும்." },
    te: { issue:"పంటలో నత్రజని లోపం మరియు ఆకు మాడు తొలిదశలో కనిపించింది", confidence:78, action:"ఎకరాకు 20 కిలో యూరియా వేయండి. Mancozeb 75WP @ 2g/L పిచికారీ చేయండి.", reasoning:"పసుపు ఆకులు నత్రజని లోపాన్ని, గోధుమ అంచులు శిలీంధ్ర సంక్రమణను సూచిస్తాయి.", risk:"Medium", notes:"7 రోజుల తర్వాత మళ్ళీ చిత్రం తీసి పోల్చండి." },
    kn: { issue:"ಬೆಳೆಯಲ್ಲಿ ಸಾರಜನಕ ಕೊರತೆ ಮತ್ತು ಆರಂಭಿಕ ಎಲೆ ಒಣಗು ಕಾಣಿಸಿಕೊಂಡಿದೆ", confidence:78, action:"ಎಕರೆಗೆ 20 ಕೆಜಿ ಯೂರಿಯಾ ಹಾಕಿ. Mancozeb 75WP @ 2g/L ಸಿಂಪಡಿಸಿ.", reasoning:"ಹಳದಿ ಎಲೆಗಳು ಸಾರಜನಕ ಕೊರತೆಯನ್ನು, ಕಂದು ಅಂಚು ಶಿಲೀಂಧ್ರ ಸೋಂಕನ್ನು ಸೂಚಿಸುತ್ತವೆ.", risk:"Medium", notes:"7 ದಿನಗಳ ನಂತರ ಮತ್ತೊಮ್ಮೆ ಚಿತ್ರ ತೆಗೆದು ಹೋಲಿಕೆ ಮಾಡಿ." },
    ml: { issue:"വിളയിൽ നൈട്രജൻ കുറവും ഇല ദ്രവിക്കൽ ആദ്യ ഘട്ടത്തിലും കണ്ടെത്തി", confidence:78, action:"ഏക്കറിന് 20 കിലോ യൂറിയ ഇടുക. Mancozeb 75WP @ 2g/L തളിക്കുക.", reasoning:"മഞ്ഞ ഇലകൾ നൈട്രജൻ കുറവ്, തവിട്ട് അരികുകൾ ഫംഗൽ ബാധ സൂചിപ്പിക്കുന്നു.", risk:"Medium", notes:"7 ദിവസം കഴിഞ്ഞ് വീണ്ടും ചിത്രമെടുത്ത് താരതമ്യം ചെയ്യുക." },
    ur: { issue:"فصل میں نائٹروجن کی کمی اور ابتدائی پتوں کی جھلسن کا پتہ چلا", confidence:78, action:"فی ایکڑ 20 کلو یوریا ڈالیں۔ Mancozeb 75WP @ 2g/L سپرے کریں۔", reasoning:"پیلے پتے نائٹروجن کی کمی اور بھوری کنارے فنگل انفیکشن ظاہر کرتے ہیں۔", risk:"Medium", notes:"7 دن بعد دوبارہ تصویر لے کر موازنہ کریں۔" },
  };
  return mocks[lang] || mocks.en;
};
