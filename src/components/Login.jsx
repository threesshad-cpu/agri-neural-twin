import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import '../styles/government.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'ur', label: 'اردو' }
];

export default function Login({ onLogin }) {
    const { t, i18n } = useTranslation();
    const [authMethod, setAuthMethod] = useState('aadhaar'); // 'aadhaar' | 'standard'
    const [userType, setUserType] = useState('farmer');

    const [credentials, setCredentials] = useState({ id: '', mobile: '', password: '', aadhaar: '', otp: '' });
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [demoMode, setDemoMode] = useState(false);

    const DEMO_FARMER = { id: 'TN-VEL-001', mobile: '9876543210', password: 'password123', aadhaar: '987654321012' };
    const DEMO_OFFICER = { id: 'EDII-TN-ADMIN', mobile: '9988776655', password: 'adminpass' };

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (!demoMode) setCredentials({ id: '', mobile: '', password: '', aadhaar: '', otp: '' });
    }, [demoMode]);

    const handleInput = (e) => {
        let value = e.target.value;
        if (e.target.name === 'aadhaar') {
            value = value.replace(/\D/g, '').substring(0, 12);
            if (value.length > 4) value = value.substring(0, 4) + ' ' + value.substring(4);
            if (value.length > 9) value = value.substring(0, 9) + ' ' + value.substring(9);
        }
        setCredentials({ ...credentials, [e.target.name]: value });
    };

    const handleLanguageChange = (code) => {
        i18n.changeLanguage(code);
    };

    const sendOtp = () => {
        if (credentials.aadhaar.replace(/\s/g, '').length !== 12) {
            toast.error(t('enter_valid_aadhaar'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOtpSent(true);
            setTimer(60);
            toast.success(t('otp_sent_success'));
        }, 1500);
    };

    const verifyAadhaarLogin = () => {
        if (!credentials.otp) {
            toast.error(t('invalid_otp'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(t('aadhaar_verified_success'));
            onLogin('farmer', demoMode, { verified: true, name: 'Thiru. Selvam', aadhaar: credentials.aadhaar });
        }, 1500);
    };

    const handleStandardLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin('officer', demoMode);
        }, 1500);
    };

    const handleDemoSelect = (role) => {
        const creds = role === 'farmer' ? DEMO_FARMER : DEMO_OFFICER;
        setCredentials({ ...credentials, ...creds });
        setUserType(role);
        setAuthMethod(role === 'farmer' ? 'aadhaar' : 'standard');

        // Auto navigate for demo
        toast.loading(t('initializing_demo', { role: role.toUpperCase() }), { duration: 1000 });
        setTimeout(() => {
            // If farmer, we might simulate OTP flow or just direct login if using demo logic
            // For strictness, let's auto-fill OTP for farmer
            if (role === 'farmer') {
                setOtpSent(true);
                setCredentials(prev => ({ ...prev, otp: '123456' }));
            } else {
                onLogin(role, true);
            }
        }, 800);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

            <div className="gov-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                        {t('login_title')}
                    </h2>
                    <div style={{ height: '4px', width: '60px', background: '#D4AF37', margin: '0 auto', borderRadius: '2px' }}></div>
                </div>

                {/* Method Tabs */}
                <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '2px solid #E5E7EB' }}>
                    <button
                        onClick={() => { setAuthMethod('aadhaar'); setUserType('farmer'); }}
                        style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: authMethod === 'aadhaar' ? '2px solid #003366' : 'none', color: authMethod === 'aadhaar' ? '#003366' : '#6B7280', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        {t('farmer_role')}
                    </button>
                    <button
                        onClick={() => { setAuthMethod('standard'); setUserType('officer'); }}
                        style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: authMethod === 'standard' ? '2px solid #003366' : 'none', color: authMethod === 'standard' ? '#003366' : '#6B7280', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        {t('officer_role')}
                    </button>
                </div>

                {/* Content */}
                <motion.div
                    key={authMethod}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {authMethod === 'aadhaar' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                    {t('aadhaar_label')}
                                </label>
                                <input
                                    name="aadhaar"
                                    value={credentials.aadhaar}
                                    onChange={handleInput}
                                    placeholder="XXXX XXXX XXXX"
                                    maxLength={14}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '1rem' }}
                                />
                            </div>

                            {otpSent && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                        {t('otp_placeholder')}
                                    </label>
                                    <input
                                        name="otp"
                                        value={credentials.otp}
                                        onChange={handleInput}
                                        placeholder="• • • • • •"
                                        maxLength={6}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.5em' }}
                                    />
                                    <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                        {timer > 0 ? (
                                            <span style={{ color: '#10B981' }}>{t('resend_in', { seconds: timer })}</span>
                                        ) : (
                                            <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#003366', textDecoration: 'underline', cursor: 'pointer' }}>{t('resend_otp')}</button>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            <button
                                onClick={otpSent ? verifyAadhaarLogin : sendOtp}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '0.875rem', background: '#003366', color: 'white',
                                    border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? '...' : (otpSent ? t('verify_button') : t('send_otp'))}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>{t('officer_role')} ID</label>
                                <input
                                    name="id"
                                    value={credentials.id}
                                    onChange={handleInput}
                                    placeholder="TN-OFF-001"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '1rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>{t('password')}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleInput}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '1rem' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '0.875rem', background: '#003366', color: 'white',
                                    border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? '...' : t('secure_login')}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>

            {/* Footer / Demo Toggle */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '1rem' }}>
                    {t('powered_by_footer')} | <a href="#" style={{ color: '#4B5563' }}>tnhorticulture.tn.gov.in</a>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => setDemoMode(!demoMode)} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: demoMode ? '#D97706' : '#9CA3AF', cursor: 'pointer', textDecoration: 'underline' }}>
                        {demoMode ? t('turn_off_demo') : t('enable_demo')}
                    </button>
                </div>

                {demoMode && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => handleDemoSelect('farmer')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: '1px solid #10B981', background: '#ECFDF5', color: '#065F46', textTransform: 'uppercase', cursor: 'pointer' }}>
                            {t('demo_farmer')}
                        </button>
                        <button onClick={() => handleDemoSelect('officer')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: '1px solid #003366', background: '#EFF6FF', color: '#003366', textTransform: 'uppercase', cursor: 'pointer' }}>
                            {t('demo_officer')}
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
