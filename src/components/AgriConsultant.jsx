import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonAdvisory from './ui/SkeletonAdvisory';
import { GeminiService } from '../services/GeminiService';
import { useTranslation } from 'react-i18next';
import '../styles/government.css';

export default function AgriConsultant({ context }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language; // Get current language code
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [displayedText, setDisplayedText] = useState('');

    // Voice State
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    // Auto-generate advice when opened or context changes purely
    useEffect(() => {
        if (isOpen && !advice) {
            handleConsult();
        }
    }, [isOpen]);

    // Typewriter Effect
    useEffect(() => {
        if (advice && !loading) {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(advice.substring(0, i));
                i++;
                if (i > advice.length) clearInterval(interval);
            }, 10);
            return () => clearInterval(interval);
        }
    }, [advice, loading]);

    const handleConsult = async () => {
        setLoading(true);
        setDisplayedText('');
        try {
            const response = await GeminiService.generateAdvisory({ ...context, language });
            setAdvice(response);
            speakResponse(response);
        } catch (e) {
            setAdvice(t('network_error_ai') || 'Unable to connect to AI Brain.');
        }
        setLoading(false);
    };

    const speakResponse = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setSpeaking(false);
    };

    // Handle Speech Recognition
    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert(t('voice_not_supported'));
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setListening(false);

            // Send to Gemini
            setLoading(true);
            try {
                const response = await GeminiService.generateVoiceAdvisory({ ...context, language }, transcript);
                setAdvice(response);
                speakResponse(response);
            } catch (e) {
                setAdvice(t('network_error_ai'));
            }
            setLoading(false);
        };

        recognition.onerror = (e) => {
            console.error(e);
            setListening(false);
        };

        recognition.start();
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>

            {/* FAB Trigger */}
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'var(--gov-blue-600)', color: 'white',
                        border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}
                >
                    🤖
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="gov-card"
                        style={{
                            width: '350px', maxHeight: '500px', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem', background: 'var(--gov-blue-800)', color: 'white',
                            borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'white' }}>{t('ai_consultant')}</h3>
                                {speaking && (
                                    <div style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%', boxShadow: '0 0 5px #34D399' }}></div>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', minHeight: '200px' }}>
                            {loading ? (
                                <SkeletonAdvisory />
                            ) : (
                                <div style={{
                                    fontFamily: 'var(--font-sans)',
                                    whiteSpace: 'pre-line',
                                    lineHeight: '1.5',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.925rem'
                                }}>
                                    {displayedText}
                                    <span style={{ display: 'inline-block', width: '2px', height: '1em', background: 'var(--gov-blue-600)', marginLeft: '2px', animation: 'blink 1s infinite' }}></span>
                                </div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--grey-50)' }}>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={handleVoiceInput}
                                    className={`toolbar-btn ${listening ? 'active' : ''}`}
                                    style={{
                                        borderRadius: '50%', width: '40px', height: '40px', padding: 0,
                                        justifyContent: 'center', borderColor: listening ? '#DC2626' : 'var(--color-border)',
                                        color: listening ? '#DC2626' : 'var(--color-text-primary)'
                                    }}
                                >
                                    {listening ? '🛑' : '🎙️'}
                                </button>

                                {speaking && (
                                    <button
                                        onClick={stopSpeaking}
                                        style={{ fontSize: '0.75rem', color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        {t('stop_audio')}
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleConsult}
                                className="toolbar-btn"
                                style={{ fontSize: '0.85rem' }}
                            >
                                ↻ {t('regenerate')}
                            </button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
            `}</style>
        </div>
    );
}
