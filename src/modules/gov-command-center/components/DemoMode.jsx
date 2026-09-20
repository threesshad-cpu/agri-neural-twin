import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../../i18n';

/**
 * FEATURE 2: Demo / Jury Mode
 * Automated tour that navigates through the application
 * showing key features in a 6-step sequence
 */

const DEMO_STEPS = [
    {
        step: 1,
        titleKey: 'dashboard_overview_title',
        descKey: 'dashboard_overview_desc',
        view: 'district',
        district: 'coimbatore',
        duration: 5000,
    },
    {
        step: 2,
        titleKey: 'ai_simulation_title',
        descKey: 'ai_simulation_desc',
        view: 'farmgpt',
        action: 'runAgents',
        duration: 5000,
    },
    {
        step: 3,
        titleKey: 'predictive_outlook_title',
        descKey: 'predictive_outlook_desc',
        view: 'outlook',
        duration: 5000,
    },
    {
        step: 4,
        titleKey: 'climate_twin_title',
        descKey: 'climate_twin_desc',
        view: 'climatetwin',
        action: 'runScenario',
        duration: 5000,
    },
    {
        step: 5,
        titleKey: 'collector_dashboard_title',
        descKey: 'collector_dashboard_desc',
        view: 'collector',
        duration: 5000,
    },
    {
        step: 6,
        titleKey: 'revenue_pricing_title',
        descKey: 'revenue_pricing_desc',
        view: 'analytics',
        duration: 5000,
    },
];

const PROGRESS_COLORS = ['#059669', '#00B4D8', '#F0C040', '#7B2FBE', '#FF6B35', '#DC2626'];

export default function DemoMode({ onViewChange, onDistrictSelect, currentView }) {
    const { t } = useTranslation();
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);
    const progressTimerRef = useRef(null);
    const skipTimeoutRef = useRef(null);

    const totalSteps = DEMO_STEPS.length;

    // Start demo mode
    const startDemo = useCallback(() => {
        setIsActive(true);
        setCurrentStep(0);
        setProgress(0);
        setIsPaused(false);
    }, []);

    // Stop demo mode
    const stopDemo = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        setProgress(0);
        setIsPaused(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    }, []);

    // Navigate to a specific step
    const goToStep = useCallback((stepIndex) => {
        const step = DEMO_STEPS[stepIndex];
        if (!step) return;

        setCurrentStep(stepIndex);
        setProgress(0);

        // Navigate to the view
        if (step.district) {
            onDistrictSelect?.(step.district);
        }
        if (step.view) {
            onViewChange?.(step.view);
        }

        // Start progress bar animation
        const stepDuration = step.duration || 5000;
        const interval = 50;
        const increment = (interval / stepDuration) * 100;

        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        progressTimerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressTimerRef.current);
                    return 100;
                }
                return prev + increment;
            });
        }, interval);

        // Schedule next step
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!isPaused) {
            timerRef.current = setTimeout(() => {
                if (stepIndex < totalSteps - 1) {
                    goToStep(stepIndex + 1);
                } else {
                    // Demo complete
                    stopDemo();
                }
            }, stepDuration);
        }
    }, [onViewChange, onDistrictSelect, totalSteps, isPaused, stopDemo]);

    // Start the demo when activated
    useEffect(() => {
        if (isActive && currentStep === 0) {
            goToStep(0);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        };
    }, [isActive, goToStep, currentStep]);

    // Handle skip with double-click prevention
    const handleSkip = () => {
        if (skipTimeoutRef.current) {
            clearTimeout(skipTimeoutRef.current);
        }
        skipTimeoutRef.current = setTimeout(() => {
            stopDemo();
        }, 200);
    };

    // Toggle pause
    const togglePause = () => {
        setIsPaused(prev => !prev);
        if (isPaused) {
            // Resume - go to current step again
            goToStep(currentStep);
        } else {
            // Pause
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        }
    };

    // Go to next step manually
    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            goToStep(currentStep + 1);
        }
    };

    // Go to previous step manually
    const prevStep = () => {
        if (currentStep > 0) {
            goToStep(currentStep - 1);
        }
    };

    const currentDemoStep = DEMO_STEPS[currentStep];

    // Floating button when demo is not active
    if (!isActive) {
        return null;
    }

    // Demo active - show progress bar and controls
    return (
        <>
            {/* Top Progress Bar */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1001,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 0',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Step indicator */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    marginBottom: '8px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: '#F0C040',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            {t('demo_mode.demo_mode_button')}
                        </span>
                        <span style={{
                            fontSize: '0.7rem',
                            color: '#94A3B8',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                        }}>
                            {t('demo_step_label', { current: currentStep + 1, total: totalSteps })}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#CBD5E1',
                        maxWidth: '50%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {currentDemoStep ? t(`demo_mode.${currentDemoStep.titleKey}`) : ''}
                    </div>
                </div>

                {/* Progress bar with step markers */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    gap: '4px',
                }}>
                    {DEMO_STEPS.map((step, index) => (
                        <div key={step.step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                onClick={() => goToStep(index)}
                                style={{
                                    width: index <= currentStep ? 32 : 24,
                                    height: index <= currentStep ? 32 : 24,
                                    borderRadius: '50%',
                                    background: index < currentStep
                                        ? PROGRESS_COLORS[index]
                                        : index === currentStep
                                            ? PROGRESS_COLORS[index]
                                            : 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: index <= currentStep ? '0.7rem' : '0.6rem',
                                    fontWeight: '700',
                                    color: index <= currentStep ? 'white' : '#64748B',
                                    cursor: index < currentStep ? 'pointer' : 'default',
                                    transition: 'all 0.3s ease',
                                    boxShadow: index === currentStep
                                        ? `0 0 10px ${PROGRESS_COLORS[index]}80`
                                        : 'none',
                                }}
                            >
                                {index < currentStep ? '✓' : step.step}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress fill bar */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${PROGRESS_COLORS[currentStep]}, ${PROGRESS_COLORS[Math.min(currentStep + 1, totalSteps - 1)]})`,
                    width: `${((currentStep + (progress / 100)) / totalSteps) * 100}%`,
                    transition: 'width 0.1s linear',
                    boxShadow: '0 0 10px rgba(5, 150, 105, 0.5)',
                }} />
            </motion.div>

            {/* Bottom Controls */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                style={{
                    position: 'fixed',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1001,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                {/* Step info */}
                <div style={{
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    maxWidth: '250px',
                }}>
                    <div style={{ fontSize: '0.7rem', color: PROGRESS_COLORS[currentStep], fontWeight: '700', marginBottom: '2px' }}>
                        {currentDemoStep ? t(`demo_mode.${currentDemoStep.titleKey}`) : ''}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#94A3B8', lineHeight: '1.3' }}>
                        {currentDemoStep ? t(`demo_mode.${currentDemoStep.descKey}`) : ''}
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        style={{
                            padding: '8px 12px',
                            background: currentStep === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            color: currentStep === 0 ? '#475569' : 'white',
                            cursor: currentStep === 0 ? 'default' : 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t('demo_prev')}
                    </button>

                    <button
                        onClick={togglePause}
                        style={{
                            padding: '8px 16px',
                            background: isPaused ? '#F0C040' : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            color: isPaused ? '#1E293B' : 'white',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                        }}
                    >
                        {isPaused ? t('demo_resume') : t('demo_pause')}
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={currentStep === totalSteps - 1}
                        style={{
                            padding: '8px 12px',
                            background: currentStep === totalSteps - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            color: currentStep === totalSteps - 1 ? '#475569' : 'white',
                            cursor: currentStep === totalSteps - 1 ? 'default' : 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t('demo_next')}
                    </button>

                    <button
                        onClick={handleSkip}
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(220, 38, 38, 0.8)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t('demo_skip')}
                    </button>
                </div>
            </motion.div>

            {/* Demo overlay hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    position: 'fixed',
                    top: 70,
                    right: 20,
                    zIndex: 1000,
                    padding: '8px 16px',
                    background: 'rgba(5, 150, 105, 0.9)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 10px rgba(5, 150, 105, 0.3)',
                }}
            >
                {t('demo_running')}
            </motion.div>
        </>
    );
}