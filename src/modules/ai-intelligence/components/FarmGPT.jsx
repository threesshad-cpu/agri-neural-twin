import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiService } from '../services/GeminiService';
import { farmContextService } from '../services/farmContextService';
import { agentOrchestrator } from '../../agentic-ai/services/agentOrchestrator';
import { farmerProfileService } from '../../farmer-passport/services/farmerProfileService';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { useAuth } from '../../auth/context/AuthContext';
import '../../../styles/government.css';

// ══════════════════════════════════════════════════════════════
// FEATURE 1: Tamil Voice Mode — Pulsing Mic CSS Animation
// ══════════════════════════════════════════════════════════════
const voiceStyles = `
  @keyframes pulse-record {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6); transform: scale(1); }
    50% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); transform: scale(1.05); }
  }
  @keyframes pulse-speak {
    0%, 100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.6); transform: scale(1); }
    50% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); transform: scale(1.04); }
  }
  .voice-mic-btn.recording {
    animation: pulse-record 1.5s ease-in-out infinite;
    background: #DC2626 !important;
    color: white !important;
    border-color: #DC2626 !important;
  }
  .voice-mic-btn.speaking {
    animation: pulse-speak 1.2s ease-in-out infinite;
    background: #2ECC71 !important;
    color: white !important;
    border-color: #2ECC71 !important;
  }
  .voice-mic-btn {
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  .voice-mic-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .voice-mic-btn:hover::after {
    opacity: 0.1;
    background: currentColor;
  }
`;

const RTL = ['ur'];
const LANG_NAMES = { en: 'English', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam', ur: 'Urdu' };
// Priority locale list per language (exact → region variant → family)
const LOCALE_PRIORITY = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  ta: ['ta-IN', 'ta'],
  te: ['te-IN', 'te'],
  kn: ['kn-IN', 'kn'],
  ml: ['ml-IN', 'ml'],
  ur: ['ur-IN', 'ur-PK', 'ur'],
};
const SR_LOCALE = { en: 'en-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN', ur: 'ur-PK' };

// ── Load voices async (Chrome fires voiceschanged; Firefox returns sync) ──────
function useSpeechVoices() {
  const [voices, setVoices] = React.useState([]);
  useEffect(() => {
    const load = () => setVoices([...window.speechSynthesis.getVoices()]);
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);
  return voices;
}

// 3-tier picker: exact locale → language-family → en-IN fallback
function pickVoice(voices, lang) {
  const priorities = LOCALE_PRIORITY[lang] || LOCALE_PRIORITY.en;
  for (const locale of priorities) {
    const exact = voices.find(v => v.lang.toLowerCase() === locale.toLowerCase());
    if (exact) return { voice: exact, tier: 'exact', warn: false };
  }
  // Language-family match (e.g. 'ta' matches 'ta-IN', 'ta-LK')
  const prefix = (LOCALE_PRIORITY[lang]?.[0] || 'en').split('-')[0].toLowerCase();
  const family = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
  if (family) return { voice: family, tier: 'family', warn: false };
  // English fallback
  const enFallback = voices.find(v => v.lang.startsWith('en-IN')) ||
    voices.find(v => v.lang.startsWith('en'));
  return { voice: enFallback || null, tier: 'fallback', warn: true };
}

const QUICK = {
  en: ['Why are my leaves turning yellow?', 'Disease in paddy crop', 'Cotton pest attack', 'Nitrogen deficiency', 'When should I irrigate?', 'Best crop this season?'],
  ta: ['என் இலைகள் ஏன் மஞ்சளாகின்றன?', 'நெல் பயிரில் நோய்', 'பருத்தியில் பூச்சி', 'நைட்ரஜன் குறைபாடு', 'நீர்ப்பாசனம் எப்போது?', 'இந்த பருவம் சிறந்த பயிர்?'],
  te: ['ఆకులు పసుపు రంగులోకి మారడం ఎందుకు?', 'వరిలో వ్యాధి', 'పత్తిపై పురుగు', 'నత్రజని లోపం', 'నీటి పారుదల ఎప్పుడు?', 'ఈ సీజన్ మంచి పంట?'],
  kn: ['ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಕಾರಣ?', 'ಭತ್ತದಲ್ಲಿ ರೋಗ', 'ಹತ್ತಿ ಕೀಟ', 'ಸಾರಜನಕ ಕೊರತೆ', 'ನೀರಾವರಿ ಯಾವಾಗ?', 'ಈ ಋತು ಉತ್ತಮ ಬೆಳೆ?'],
  ml: ['ഇലകൾ മഞ്ഞ നിറമാകുന്നതെന്തുകൊണ്ട്?', 'നെൽ‌കൃഷിയിൽ രോഗം', 'പരുത്തിയിൽ കീടം', 'നൈട്രജൻ കുറവ്', 'ജലസേചനം എപ്പോൾ?', 'ഈ സീസണിൽ മികച്ച വിള?'],
  ur: ['پتے پیلے کیوں ہو رہے ہیں؟', 'دھان میں بیماری', 'کپاس پر کیڑے', 'نائٹروجن کی کمی', 'آبپاشی کب کریں؟', 'اس موسم میں بہترین فصل؟'],
};

const SOURCES = [' Gemini AI', ' TNAU Guidelines', ' ICAR Recommendations', ' Internal Knowledge Base'];

// ── Response Card ──────────────────────────────────────────────────────────────
function ResponseCard({ result, lang, onSpeak, speaking }) {
  const { t } = useTranslation();
  const rtl = RTL.includes(lang);
  const c = result.confidence;
  const cc = c >= 85 ? '#059669' : c >= 70 ? '#D97706' : '#DC2626';
  const riskColor = { Low: '#059669', Medium: '#D97706', High: '#DC2626' }[result.risk] || '#6B7280';
  const fields = [
    { label: t('farmgpt.possible_issue', '🔍 Possible Issue'), v: result.issue, b: '#1D4ED8', bg: '#EFF6FF' },
    { label: t('farmgpt.recommended_action', '✅ Recommended Action'), v: result.action, b: '#059669', bg: '#ECFDF5' },
    { label: t('farmgpt.reasoning_label', '🧪 Reasoning'), v: result.reasoning, b: '#7C3AED', bg: '#F5F3FF' },
  ];
  if (result.notes) fields.push({ label: t('farmgpt.notes_label', '📝 Additional Notes'), v: result.notes, b: '#0891B2', bg: '#ECFEFF' });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Confidence + Risk + Speak row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>{t('farmgpt.confidence', 'Confidence')}</span>
        <span style={{ padding: '2px 10px', borderRadius: '12px', background: `${cc}18`, border: `1px solid ${cc}44`, fontSize: '0.8rem', fontWeight: '800', color: cc }}>{c}%</span>
        {result.risk && <span style={{ padding: '2px 10px', borderRadius: '12px', background: `${riskColor}18`, border: `1px solid ${riskColor}44`, fontSize: '0.75rem', fontWeight: '700', color: riskColor }}>{t('risk_profile', 'Risk')}: {t(`risk_levels.${result.risk.toLowerCase()}`, { defaultValue: result.risk })}</span>}
        <button onClick={onSpeak} style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '12px', border: '1px solid #D1D5DB', background: speaking ? '#FEF2F2' : '#F9FAFB', fontSize: '0.72rem', cursor: 'pointer', color: speaking ? '#DC2626' : '#374151' }}>
          {speaking ? t('farmgpt.stop', '⏹ Stop') : t('farmgpt.listen', '🔊 Listen')}
        </button>
      </div>

      {fields.map(({ label, v, b, bg }, i) => (
        <motion.div key={label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
          style={{ marginBottom: '0.6rem', padding: '0.7rem 1rem', borderRadius: '6px', background: bg, borderLeft: `4px solid ${b}`, direction: rtl ? 'rtl' : 'ltr' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: '700', color: b, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{label}</div>
          <div style={{ fontSize: '0.84rem', color: '#1F2937', lineHeight: '1.5' }}>{v}</div>
        </motion.div>
      ))}

      {/* Sources */}
      <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('farmgpt.sources_used', 'Sources Used')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {SOURCES.map(s => <span key={s} style={{ fontSize: '0.65rem', color: '#6B7280', background: 'white', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '1px 6px' }}>{s}</span>)}
        </div>
        <div style={{ fontSize: '0.58rem', color: '#D1DDB0', marginTop: '0.25rem' }}>{new Date().toLocaleDateString('en-IN')}</div>
      </div>
    </motion.div>
  );
}

function Thinking() {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{i18n.t('farm_gpt_comp.ai_copilot_analysing')}</span>
      {[0, 1, 2].map(i => (
        <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D4ED8' }}
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FarmGPT({ districtId }) {
  const { t } = useTranslation();
  const { user, isDemoMode: authDemoMode } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('chat');
  const [image, setImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceWarn, setVoiceWarn] = useState(null);
  // ── Phase 1 & 2: Agent context state ────────────────────────────────────
  const [farmCtx, setFarmCtx] = useState(null);
  const [agentReport, setAgentReport] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // ── Phase 7: AI Farmer Registration ─────────────────────────────────────
  // Seed from AuthContext so returning users (post-ProfileSetup) don't re-register
  const [activeFarmerId, setActiveFarmerId] = useState(() => user?.farmerId || null);
  const [regData, setRegData] = useState({ identifier: '', name: '', district: districtId || 'Vellore', village: '', crop: 'Paddy', landArea: '2', soilType: 'Red Loam', irrigationType: 'Borewell' });
  const [regStep, setRegStep] = useState(1);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const srRef = useRef(null);
  const voices = useSpeechVoices();

  const lang = i18n.language || 'en';
  const rtl = RTL.includes(lang);
  const prompts = QUICK[lang] || QUICK.en;

  const DEMOS = [
    { label: t('farmgpt.demo_paddy_label', '🌾 Yellow Paddy'), query: t('farmgpt.demo_paddy_query', 'My paddy leaves are turning yellow and pale') },
    { label: t('farmgpt.demo_cotton_label', '🐛 Cotton Pest'), query: t('farmgpt.demo_cotton_query', 'Pest attack on cotton crop, holes in leaves') },
    { label: t('farmgpt.demo_nitrogen_label', '🧪 Low Nitrogen'), query: t('farmgpt.demo_nitrogen_query', 'How much nitrogen fertilizer is needed for paddy?') },
    { label: t('farmgpt.demo_water_label', '💧 Water Stress'), query: t('farmgpt.demo_water_query', 'When should I irrigate my crop?') },
    { label: t('farmgpt.demo_rain_label', '🌧 Rain Risk'), query: t('farmgpt.demo_rain_query', 'Will heavy rainfall affect my standing crop?') },
  ];

  // Sync farmerId when AuthContext user changes (e.g. after profile setup or page restore)
  useEffect(() => {
    if (user?.farmerId && !activeFarmerId) setActiveFarmerId(user.farmerId);
  }, [user?.farmerId]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { return () => { window.speechSynthesis?.cancel(); }; }, []);

  // ── Inject voice animation styles once ──
  useEffect(() => {
    if (!document.getElementById('voice-mode-styles')) {
      const style = document.createElement('style');
      style.id = 'voice-mode-styles';
      style.textContent = voiceStyles;
      document.head.appendChild(style);
    }
  }, []);

  // ── Load agent report when districtId changes ────────────────────────────
  useEffect(() => {
    if (!districtId) return;
    setAgentReport(null);
    setFarmCtx(null);
  }, [districtId]);

  // ── Load agents on demand ────────────────────────────────────────────────
  const handleLoadAgents = useCallback(async () => {
    if (agentLoading) return;
    setAgentLoading(true);
    try {
      const crop = activeFarmerId ? regData.crop : 'paddy';
      const acreage = activeFarmerId ? Number(regData.landArea) : 2;
      const [ctx, report] = await Promise.all([
        farmContextService.buildFarmContext(districtId || 'vellore', { farmerId: activeFarmerId, crop, acreage }),
        agentOrchestrator.runAll(districtId || 'vellore', crop, {}),
      ]);
      setFarmCtx(ctx);
      setAgentReport(report);
    } catch (e) {
      console.error('[FarmGPT] Agent load failed:', e);
    } finally {
      setAgentLoading(false);
    }
  }, [districtId, agentLoading, activeFarmerId, regData.crop, regData.landArea]);

  // ── Ask text (Phase 1: inject farm context into prompt) ──────────────────
  const handleAsk = useCallback(async (q) => {
    const text = (q || query).trim();
    if (!text) return;
    setQuery(''); setError(''); setResult(null); setLoading(true);
    try {
      // ── Enforce AI Farmer Registration ──────────────────────────────────────
      const effectiveFarmerId = activeFarmerId || user?.farmerId || null;
      if (!authDemoMode && !effectiveFarmerId) {
        setResult({ answer: t('farmgpt.complete_profile_required', 'Please complete your farmer profile setup or use Demo Mode to access FarmGPT.') });
        setLoading(false);
        return;
      }

      const ctx = farmCtx || await farmContextService.buildFarmContext(
        districtId || 'vellore', { farmerId: effectiveFarmerId, crop: regData.crop || 'paddy', acreage: Number(regData.landArea) || 2 }
      ).catch(() => null);

      // Build context summary to enrich the query
      const ctxSummary = ctx ? farmContextService.buildSummaryPrompt(ctx) : '';
      const enrichedQuery = ctxSummary
        ? `${text}\n\n[Farm Context]\n${ctxSummary}`
        : text;
      const res = await GeminiService.askFarmGPT(enrichedQuery, { district: districtId || 'Tamil Nadu' });
      setResult(res);
      if (ctx && !farmCtx) setFarmCtx(ctx);
      setHistory(p => [{ query: text, result: res, id: Date.now() }, ...p].slice(0, 5));
    } catch { setError(t('farmgpt.error_unable_to_process', 'Unable to process. Please try again.')); }
    finally { setLoading(false); }
  }, [query, districtId, farmCtx, activeFarmerId, regData.crop, regData.landArea]);

  // ── Image upload ──
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      setImage({ url: dataUrl, base64, mime: file.type });
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setError(''); setResult(null); setImgLoading(true);
    try {
      const res = await GeminiService.analyzeImage(image.base64, image.mime, { district: districtId || 'Tamil Nadu' });
      setResult(res);
      // ── Phase 6: Wire diagnosis → Farmer Passport + FarmGPT context ──────
      try {
        const targetFarmerId = activeFarmerId || 'TN-FARM-10045';
        farmerProfileService.addDiseaseRecord(targetFarmerId, {
          disease: res.issue || 'Unknown',
          severity: res.risk || 'Medium',
          confidence: res.confidence || 0,
          treatment: res.action || '',
          imageRef: `img_${Date.now()}`,
          district: districtId || 'Tamil Nadu',
        });
        farmerProfileService.addRecommendationRecord(targetFarmerId, {
          source: 'FarmGPT Image Analysis',
          recommendation: res.action || '',
          accepted: true,
        });
      } catch (_e) { /* Non-critical — passport update failed silently */ }
    } catch { setError(t('farmgpt.error_image_analysis_failed', 'Image analysis failed. Please try again.')); }
    finally { setImgLoading(false); }
  };

  // ── Voice Input (with auto-submit) ──
  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert(t('farmgpt.voice_not_supported', 'Voice input not supported. Use Chrome or Edge.')); return; }
    if (recording) { srRef.current?.stop(); setRecording(false); return; }
    const sr = new SR();
    sr.lang = SR_LOCALE[lang] || 'en-IN';
    sr.interimResults = false;
    sr.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript.trim());
    };
    sr.onerror = () => setRecording(false);
    // Auto-submit after voice input ends
    sr.onend = () => {
      setRecording(false);
      // Auto-submit the transcribed query after a short delay
      setTimeout(() => {
        setQuery(prevQuery => {
          if (prevQuery.trim()) {
            handleAsk(prevQuery);
          }
          return prevQuery;
        });
      }, 300);
    };
    srRef.current = sr;
    sr.start();
    setRecording(true);
  };

  // ── Voice Output (3-tier voice picker) ──
  const handleSpeak = () => {
    if (!result) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); setVoiceWarn(null); return; }
    const { voice, warn } = pickVoice(voices, lang);
    if (warn) {
      const langName = LANG_NAMES[lang] || lang;
      setVoiceWarn(t('farmgpt.voice_not_installed_warn', 'No {{langName}} voice installed on this device. Reading in English instead. Install a {{langName}} TTS voice in Windows Settings › Time & Language › Speech to fix this.', { langName }));
    } else {
      setVoiceWarn(null);
    }
    const text = `${result.issue}. ${result.action}. ${result.reasoning}`;
    const utt = new SpeechSynthesisUtterance(text);
    if (voice) utt.voice = voice;
    utt.lang = voice?.lang || 'en-IN';
    utt.rate = 0.9;
    utt.onend = () => { setSpeaking(false); };
    utt.onerror = () => { setSpeaking(false); };
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  // ── Shared button style ──
  const tabStyle = (t) => ({
    padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
    background: tab === t ? '#003366' : '#F3F4F6',
    color: tab === t ? 'white' : '#6B7280',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ padding: '1.25rem', maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#003366', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ display: 'inline-block', width: '4px', height: '1em', background: '#003366', borderRadius: '2px' }} />
              {t('farmgpt.ai_agricultural_copilot', 'AI AGRICULTURAL COPILOT')}
              <span style={{ fontSize: '0.55rem', padding: '2px 7px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', color: '#059669', fontWeight: '700', letterSpacing: '0.5px' }}>{t('farm_gpt_comp.pro')}</span>
            </h2>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.2rem' }}>
              {districtId ? t(`districts.${districtId.toLowerCase()}`, { defaultValue: districtId }) : t('tamil_nadu', 'Tamil Nadu')} · Gemini 2.0 Powered · {LANG_NAMES[lang] || 'English'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '3px 8px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '3px', fontSize: '0.58rem', color: '#059669', fontWeight: '700', flexShrink: 0 }}>
            <span style={{ width: '5px', height: '5px', background: '#059669', borderRadius: '50%', animation: 'dataPulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
            {t('farmgpt.online', 'ONLINE')}
          </div>
        </div>
        {/* Capability Strip */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[t('farmgpt.cap_text_query', 'Text Query'), t('farmgpt.cap_voice_input', 'Voice Input'), t('farmgpt.cap_image_analysis', 'Image Analysis'), t('farmgpt.cap_farmer_passport', 'Farmer Passport'), t('farmgpt.cap_district_context', 'District Context'), t('farmgpt.cap_climate_context', 'Climate Context'), t('farmgpt.cap_nutrient_context', 'Nutrient Context')].map(cap => (
            <span key={cap} style={{ padding: '2px 8px', border: '1px solid #BFDBFE', borderRadius: '3px', fontSize: '0.57rem', fontWeight: '600', color: '#1D4ED8', background: '#EFF6FF', letterSpacing: '0.2px' }}>{cap}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div className="hide-scroll" style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button style={tabStyle('chat')} onClick={() => setTab('chat')}>{t('farmgpt.tab_chat', '💬 Ask Question')}</button>
        <button style={tabStyle('register')} onClick={() => setTab('register')}><span style={{display:'inline-block', width:'6px', height:'6px', borderRadius:'50%', background:'currentColor', marginRight:'6px'}} />{t('farm_gpt_comp.register')}</button>
        <button style={tabStyle('image')} onClick={() => setTab('image')}>{t('farmgpt.tab_image', '📷 Image Analysis')}</button>
        <button style={tabStyle('intel')} onClick={() => { setTab('intel'); if (!farmCtx) handleLoadAgents(); }}>{t('farmgpt.farm_intel', 'Farm Intel')}</button>
        <button style={tabStyle('agents')} onClick={() => { setTab('agents'); if (!agentReport) handleLoadAgents(); }}>{t('farmgpt.tab_agents', '🤖 Agent Report')}</button>
        <button style={tabStyle('demo')} onClick={() => setTab('demo')}>{t('farmgpt.tab_demo', '🎬 Demo Scenarios')}</button>
        <button style={tabStyle('voices')} onClick={() => setTab('voices')}>{t('farmgpt.tab_voices', '🔊 Voice Diagnostics')}</button>
      </div>

      {/* Voice warning banner */}
      {voiceWarn && (
        <div style={{ padding: '0.6rem 0.75rem', marginBottom: '0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '4px solid #D97706', borderRadius: '6px', fontSize: '0.76rem', color: '#92400E' }}>
{voiceWarn}
        </div>
      )}

      {/* ── REGISTER TAB ── */}
      {tab === 'register' && (
        <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '4px', height: '1em', background: '#003366', borderRadius: '2px', marginRight: '6px' }} />
            {t('farmgpt.ai_farmer_registration', 'AI Farmer Registration')}
          </div>
          
          {regStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{t('farm_gpt.step_1_verification')}</div>
              <input value={regData.identifier} onChange={e => setRegData({...regData, identifier: e.target.value})} placeholder={t('farmgpt.placeholder_aadhaar', 'Aadhaar (Demo) or Mobile Number')} style={{ padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
              <button onClick={() => { if(regData.identifier) setRegStep(2); }} style={{ padding: '0.6rem', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{t('farm_gpt_comp.verify')}</button>
            </div>
          )}

          {regStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{t('farm_gpt.step_2_details')}</div>
              <input value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} placeholder={t('farmgpt.placeholder_full_name', 'Full Name')} style={{ padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={regData.district} onChange={e => setRegData({...regData, district: e.target.value})} placeholder={t('farmgpt.placeholder_district', 'District')} style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
                <input value={regData.village} onChange={e => setRegData({...regData, village: e.target.value})} placeholder={t('farmgpt.placeholder_village', 'Village')} style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={regData.crop} onChange={e => setRegData({...regData, crop: e.target.value})} placeholder={t('farmgpt.placeholder_crop', 'Crop (e.g. Paddy)')} style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
                <input value={regData.landArea} onChange={e => setRegData({...regData, landArea: e.target.value})} placeholder={t('farmgpt.placeholder_land_area', 'Land Area (Acres)')} type="number" style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={regData.soilType} onChange={e => setRegData({...regData, soilType: e.target.value})} placeholder={t('farmgpt.placeholder_soil_type', 'Soil Type')} style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
                <input value={regData.irrigationType} onChange={e => setRegData({...regData, irrigationType: e.target.value})} placeholder={t('farmgpt.placeholder_irrigation_type', 'Irrigation Type')} style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }} />
              </div>
              <button onClick={async () => {
                const fId = 'FRM_' + Math.random().toString(36).substr(2, 9).toUpperCase();
                farmerProfileService.updateProfile(fId, {
                  name: regData.name, district: regData.district, village: regData.village,
                  currentCrop: regData.crop, currentAcreage: Number(regData.landArea),
                  soilType: regData.soilType, irrigationType: regData.irrigationType
                });
                setActiveFarmerId(fId);
                setRegStep(3);
                // Pre-generate context
                await farmContextService.buildFarmContext(regData.district, { farmerId: fId, crop: regData.crop, acreage: Number(regData.landArea) });
              }} disabled={!regData.name || !regData.district || !regData.crop} style={{ padding: '0.6rem', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '0.5rem' }}>{t('farm_gpt_comp.generate_passport')}</button>
            </div>
          )}

          {regStep === 3 && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ display: 'inline-block', width: '40px', height: '40px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', lineHeight: '40px', fontSize: '1.2rem', marginBottom: '1rem' }}>✓</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#065F46', marginBottom: '0.5rem' }}>{t('farm_gpt_comp.passport_success')}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1rem' }}>{t('farm_gpt_comp.passport_desc')}</div>
              <button onClick={() => { setTab('chat'); handleLoadAgents(); }} style={{ padding: '0.5rem 1rem', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>{t('farm_gpt_comp.ask_now')}</button>
            </div>
          )}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (<>
        {/* Quick prompts */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>{t('farmgpt.quick_prompts', '⚡ Quick Prompts')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {prompts.map((p, i) => (
              <button key={i} onClick={() => handleAsk(p)}
                style={{ padding: '4px 11px', borderRadius: '14px', border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: '500', cursor: 'pointer', direction: rtl ? 'rtl' : 'ltr' }}
                onMouseOver={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#1D4ED8'; }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="gov-card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end' }}>
            <textarea ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
              placeholder={t('farmgpt.placeholder', 'Ask about crop disease, irrigation, fertiliser, pest control…')}
              style={{ flex: 1, padding: '0.6rem 0.7rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.84rem', fontFamily: 'Inter,system-ui,sans-serif', resize: 'none', minHeight: '50px', outline: 'none', direction: rtl ? 'rtl' : 'ltr', lineHeight: '1.4' }}
              rows={2} />
            {/* Voice input button with pulsing animation */}
            <button
              className={`voice-mic-btn ${recording ? 'recording' : ''} ${speaking ? 'speaking' : ''}`}
              onClick={handleVoice}
              style={{ padding: '0.6rem 0.75rem', background: recording ? '#DC2626' : speaking ? '#2ECC71' : '#F3F4F6', color: recording ? 'white' : speaking ? 'white' : '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
              title={recording ? t('farmgpt.stop_recording', 'Stop recording') : speaking ? t('farmgpt.ai_speaking', 'AI is speaking') : t('farmgpt.voice_title', 'Voice input (Tamil/English)')}>
              {recording ? '⏹' : '🎙'}
            </button>
            <button onClick={() => handleAsk()} disabled={loading || !query.trim()}
              style={{ padding: '0.6rem 1.1rem', background: loading || !query.trim() ? '#9CA3AF' : '#003366', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.84rem', fontWeight: '700', cursor: loading || !query.trim() ? 'default' : 'pointer', minWidth: '72px' }}>
              {loading ? '⏳' : t('farmgpt.ask_btn', '▶ Ask')}
            </button>
          </div>
          <div style={{ fontSize: '0.58rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
            {t('farmgpt.voice_instructions', 'Enter↵ to send · 🎙 for voice · Responses in {{lang}}', { lang: LANG_NAMES[lang] || 'English' })}
            {recording && <span style={{ color: '#DC2626', fontWeight: '700', marginLeft: '0.5rem' }}>{t('farmgpt.voice_recording', '● Recording…')}</span>}
          </div>
        </div>
      </>)}

      {/* ── IMAGE TAB ── */}
      {tab === 'image' && (
        <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '4px', height: '1em', background: 'currentColor', borderRadius: '2px' }} />
            {t('farmgpt.upload_title', 'Upload Crop Image for AI Diagnosis')}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <button onClick={() => fileRef.current?.click()}
                style={{ padding: '0.6rem 1rem', background: '#EFF6FF', border: '2px dashed #BFDBFE', borderRadius: '8px', color: '#1D4ED8', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', minWidth: '140px' }}>
                {t('farmgpt.choose_image', '📁 Choose Image')}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
              <div style={{ fontSize: '0.62rem', color: '#9CA3AF', marginTop: '0.3rem' }}>{t('auto.jpg_png_webp_max_5mb', 'JPG, PNG, WEBP · Max 5MB')}</div>
            </div>
            {image && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <img src={image.url} alt={t('farmgpt.crop_image_alt', 'crop')} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #E5E7EB' }} />
                <button onClick={handleAnalyze} disabled={imgLoading}
                  style={{ padding: '0.45rem 0.75rem', background: imgLoading ? '#9CA3AF' : '#003366', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: imgLoading ? 'default' : 'pointer' }}>
                  {imgLoading ? t('farmgpt.analyzing', '⏳ Analysing…') : t('farmgpt.analyse_image', '🔍 Analyse Image')}
                </button>
              </div>
            )}
            {!image && (
              <div style={{ fontSize: '0.78rem', color: '#9CA3AF', padding: '1rem', background: '#F9FAFB', borderRadius: '6px', flex: 1 }}>
                {t('farmgpt.upload_hint', 'Upload a photo of: yellow leaves · brown spots · pest damage · nutrient deficiency')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FARM INTEL TAB ── */}
      {tab === 'intel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {agentLoading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280', fontSize: '0.82rem' }}>
{t('farmgpt.loading_intel', 'Loading farm intelligence…')}
            </div>
          )}
          {!agentLoading && farmCtx ? (
            <>
              {/* Health + Twin */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
                {[
                  { icon: '🌿', label: t('farmgpt.health_score', 'Health Score'), value: `${farmCtx.intelligence?.health?.score || 'N/A'}/100`, sub: farmCtx.intelligence?.health?.label, color: farmCtx.intelligence?.health?.color || '#059669' },
                  { icon: '🌾', label: t('farmgpt.yield_estimate', 'Yield Estimate'), value: `${farmCtx.intelligence?.twin?.yield || 'N/A'} t/ac`, sub: farmCtx.crop, color: '#1D4ED8' },
                  { icon: '⚠️', label: t('farmgpt.disaster_risk', 'Disaster Risk'), value: farmCtx.intelligence?.disaster?.overallLevel || 'Low', sub: farmCtx.intelligence?.disaster?.primaryRisk, color: { Critical: '#DC2626', High: '#D97706', Medium: '#CA8A04', Low: '#059669' }[farmCtx.intelligence?.disaster?.overallLevel] || '#059669' },
                  { icon: '♻️', label: t('farmgpt.recovery_savings', 'Recovery Savings'), value: farmCtx.recovery?.economic?.label || 'N/A', sub: `${farmCtx.recovery?.efficiency || 'N/A'}% efficiency`, color: '#7C3AED' },
                ].map(c => (
                  <div key={c.label} className="gov-card" style={{ padding: '0.75rem', borderLeft: `3px solid ${c.color}` }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color }} /> {c.label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: c.color }}>{c.value}</div>
                    {c.sub && <div style={{ fontSize: '0.62rem', color: '#6B7280', textTransform: 'capitalize' }}>{c.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Soil NPK */}
              <div className="gov-card" style={{ padding: '0.75rem' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> {t('farm_gpt_comp.soil_nutrient_profile')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { label: t('farmgpt.nitrogen_n', 'Nitrogen (N)'), val: farmCtx.soil?.nitrogen, unit: 'mg/kg', color: '#1D4ED8' },
                    { label: t('farmgpt.phosphorus_p', 'Phosphorus (P)'), val: farmCtx.soil?.phosphorus, unit: 'mg/kg', color: '#7C3AED' },
                    { label: t('farmgpt.potassium_k', 'Potassium (K)'), val: farmCtx.soil?.potassium, unit: 'mg/kg', color: '#059669' },
                  ].map(n => (
                    <div key={n.label} style={{ textAlign: 'center', padding: '0.5rem', background: '#F9FAFB', borderRadius: '6px', border: `1px solid ${n.color}22` }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: n.color }}>{n.val}</div>
                      <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>{n.label}</div>
                      <div style={{ fontSize: '0.58rem', color: '#9CA3AF' }}>{n.unit}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Climate Twin Scenario */}
              {farmCtx.climateScenario && (
                <div className="gov-card" style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> {t('farm_gpt.climate_twin_drought')}</div>
                  <div style={{ fontSize: '0.78rem', color: '#1F2937', lineHeight: '1.5' }}>{farmCtx.climateScenario.narrative}</div>
                  <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '0.35rem' }}>
                    {t('farmgpt.most_affected', 'Most affected:')} {farmCtx.climateScenario.aggregate?.mostAffected} · {t('farmgpt.economic_impact', 'Economic impact:')} ₹{Math.abs(farmCtx.climateScenario.aggregate?.totalEconomicImpact || 0).toLocaleString('en-IN')} {t('farmgpt.loss', 'loss')}
                  </div>
                </div>
              )}

              {/* Farmer Passport */}
              {farmCtx.farmer && (
                <div className="gov-card" style={{ padding: '0.75rem', background: '#F0FDF4', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#065F46', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> {t('farm_gpt_comp.farmer_digital_passport')}</div>
                  <div style={{ fontSize: '0.78rem', color: '#1F2937' }}>
                    <strong>{farmCtx.farmer.name}</strong> · {farmCtx.farmer.district} · {farmCtx.farmer.totalLand} acres · {t('farmgpt.crop_label', 'Crop:')} {farmCtx.farmer.currentCrop || 'N/A'}
                  </div>
                </div>
              )}

              <button onClick={() => { setTab('chat'); handleAsk(`Based on my farm data in ${districtId || 'vellore'}, what should I do this week?`); }}
                style={{ padding: '0.6rem', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
{t('farmgpt.ask_with_context', 'Ask FarmGPT with This Context')}
              </button>
            </>
          ) : !agentLoading && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9CA3AF', fontSize: '0.82rem' }}>
              {t('farmgpt.click_to_load_intel', 'Click to load farm intelligence context.')}
            </div>
          )}
        </div>
      )}

      {/* ── AGENT REPORT TAB ── */}
      {tab === 'agents' && (
        <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '4px', height: '1em', background: 'currentColor', borderRadius: '2px' }} /> {t('farmgpt.agent_title', 'Multi-Agent Intelligence Report')}</div>
            <button onClick={handleLoadAgents} disabled={agentLoading}
              style={{ padding: '3px 12px', borderRadius: '12px', border: '1px solid #D1D5DB', background: '#F9FAFB', fontSize: '0.7rem', cursor: 'pointer', color: '#374151' }}>
              {agentLoading ? t('farmgpt.running', '⏳ Running…') : t('farmgpt.refresh', '🔄 Refresh')}
            </button>
          </div>

          {agentLoading && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6B7280', fontSize: '0.82rem' }}>
              <div>{t('farmgpt.agent_running', '⚙️ Running 4 agents in parallel…')}</div>
              <div style={{ fontSize: '0.7rem', marginTop: '0.3rem', color: '#9CA3AF' }}>{t('farmgpt.agent_sub', 'Weather · Crop · Irrigation · Market')}</div>
            </div>
          )}

          {!agentLoading && agentReport && (() => {
            const { agents, overallStatus, criticalAlertCount, topRecommendations } = agentReport;
            const statusColor = overallStatus === 'Critical' ? '#DC2626' : overallStatus === 'Warning' ? '#D97706' : '#059669';
            return (
              <div>
                {/* Status badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ padding: '3px 12px', borderRadius: '12px', background: `${statusColor}18`, border: `1px solid ${statusColor}44`, fontSize: '0.78rem', fontWeight: '800', color: statusColor }}>● {overallStatus}</span>
                  {criticalAlertCount > 0 && <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.72rem', color: '#DC2626', fontWeight: '700' }}>{criticalAlertCount} {criticalAlertCount > 1 ? t('farmgpt.critical_alerts', 'Critical Alerts') : t('farmgpt.critical_alert', 'Critical Alert')}</span>}
                  <span style={{ fontSize: '0.65rem', color: '#9CA3AF', marginLeft: 'auto' }}>{new Date(agentReport.processedAt).toLocaleTimeString('en-IN')}</span>
                </div>

                {/* 4 agent cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {[
                    { icon: '🌤️', label: 'Weather', data: agents.weather, summary: agents.weather?.summary },
                    { icon: '🌱', label: 'Crop', data: agents.crop, summary: agents.crop?.summary },
                    { icon: '💧', label: 'Irrigation', data: agents.irrigation, summary: agents.irrigation?.summary },
                    { icon: '📊', label: 'Market', data: agents.market, summary: agents.market?.summary },
                  ].map(({ icon, label, summary }) => (
                    <div key={label} style={{ padding: '0.6rem 0.75rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{icon} {t('farmgpt.agent_label_' + label.toLowerCase(), label)} {t('farmgpt.agent_suffix', 'Agent')}</div>
                      <div style={{ fontSize: '0.72rem', color: '#1F2937', lineHeight: '1.4' }}>{summary || t('farmgpt.no_data', 'No data')}</div>
                    </div>
                  ))}
                </div>

                {/* Top recommendations */}
                {topRecommendations?.length > 0 && (
                  <div style={{ padding: '0.6rem 0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#065F46', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{t('farmgpt.top_rec', '✅ Top Recommendations')}</div>
                    {topRecommendations.map((r, i) => (
                      <div key={i} style={{ fontSize: '0.76rem', color: '#1F2937', marginBottom: '0.2rem' }}>• {r}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {!agentLoading && !agentReport && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9CA3AF', fontSize: '0.82rem' }}>
              {t('farmgpt.click_refresh', 'Click Refresh to run the AI agent analysis.')}
            </div>
          )}
        </div>
      )}

      {/* ── DEMO TAB ── */}
      {tab === 'demo' && (
        <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
            {t('farmgpt.demo_scenarios', '🎬 One-Click Demo Scenarios')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.5rem' }}>
            {DEMOS.map(d => (
              <button key={d.label} onClick={() => { setTab('chat'); handleAsk(d.query); }}
                style={{ padding: '0.65rem 0.75rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#1F2937', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── VOICE DIAGNOSTICS TAB ── */}
      {tab === 'voices' && (
        <div className="gov-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            {t('farmgpt.voice_diagnostics_title', '🔊 Voice Diagnostics — Installed TTS Voices')}
          </div>

          {/* Per-language availability summary */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('farmgpt.voice_availability', 'Language Voice Availability')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.35rem' }}>
              {Object.entries(LANG_NAMES).map(([code, name]) => {
                const { voice, warn } = pickVoice(voices, code);
                const ok = !warn;
                return (
                  <div key={code} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: ok ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${ok ? '#A7F3D0' : '#FECACA'}`, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{ok ? '✅' : '❌'}</span>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: ok ? '#065F46' : '#991B1B' }}>{name}</div>
                      <div style={{ fontSize: '0.58rem', color: '#9CA3AF' }}>{voice?.lang || 'No voice found'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnosis */}
          <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.75rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '0.75rem', color: '#1E40AF' }}>
            <strong>{t('farmgpt.diagnosis', 'Diagnosis:')}</strong>{' '}
            {voices.length === 0
              ? t('farmgpt.voice_err_empty', '❌ Root Cause C — speechSynthesis.getVoices() returned empty. Wait a moment and re-open this tab, or try Chrome/Edge.')
              : (() => {
                const hasIndic = ['ta', 'te', 'kn', 'ml'].some(l => !pickVoice(voices, l).warn);
                if (hasIndic) return t('farmgpt.voice_ok', '✅ Root Cause resolved — Indic voices found on this device.');
                return t('farmgpt.voice_warn_install', '⚠️ Root Cause A — Indic language voices not installed on this OS. English fallback active. Install voices via: Windows Settings › Time & Language › Speech › Add voices.');
              })()
            }
          </div>

          {/* Full voice list */}
          <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            {t('farmgpt.all_voices', 'All Installed Voices ({{count}})', { count: voices.length })}
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
            {voices.length === 0 ? (
              <div style={{ padding: '0.75rem', fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center' }}>
                {t('farmgpt.no_voices_loaded', 'No voices loaded yet. Try Chrome or Edge, or wait 2 seconds.')}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {[t('farmgpt.col_voice_name', 'Voice Name'), t('farmgpt.col_lang_code', 'Lang Code'), t('farmgpt.col_default', 'Default')].map(h => (
                      <th key={h} style={{ padding: '0.35rem 0.6rem', textAlign: 'left', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', fontSize: '0.6rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {voices.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#F9FAFB' }}>
                      <td style={{ padding: '0.3rem 0.6rem', color: '#1F2937', fontWeight: '500' }}>{v.name}</td>
                      <td style={{ padding: '0.3rem 0.6rem', color: '#1D4ED8', fontFamily: 'monospace' }}>{v.lang}</td>
                      <td style={{ padding: '0.3rem 0.6rem', color: v.default ? '#059669' : '#9CA3AF' }}>{v.default ? t('farmgpt.yes_check', '✅ Yes') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
 {t('farmgpt.add_voices_hint', 'To add Tamil/Telugu/Kannada/Malayalam voices on Windows: Settings › Time & Language › Speech › Manage voices › Add a voice')}
</div>
        </div>
      )}

      {/* ── Result ── */}
      <AnimatePresence mode="wait">
        {(loading || imgLoading) && (
          <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Thinking />
          </motion.div>
        )}
        {!loading && !imgLoading && error && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626', fontSize: '0.84rem' }}>
{error}
          </motion.div>
        )}
        {!loading && !imgLoading && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="gov-card" style={{ padding: '1rem' }}>
              <ResponseCard result={result} lang={lang} onSpeak={handleSpeak} speaking={speaking} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── History ── */}
      {history.length > 1 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{t('farmgpt.recent', 'Recent')}</div>
          {history.slice(1).map(h => (
            <div key={h.id} onClick={() => setResult(h.result)}
              style={{ padding: '0.45rem 0.7rem', marginBottom: '0.25rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{h.query}</span>
              <span style={{ fontSize: '0.68rem', color: '#1D4ED8', fontWeight: '700', flexShrink: 0 }}>{h.result.confidence}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
