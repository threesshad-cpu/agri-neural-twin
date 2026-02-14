import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Auth.css';

export default function LandingPage({ onGetStarted, onDemoLogin }) {
    const [demoActive, setDemoActive] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    return (
        <div className="auth-container" style={{ flexDirection: 'column', height: '100vh', overflowY: 'auto', background: '#0F172A', color: '#fff' }}>
            {/* Background Overlay */}
            <div className="auth-overlay"></div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ zIndex: 10, width: '100%', maxWidth: '1200px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {/* 1. Hero Section */}
                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
                    <h1 className="cyber-font" style={{ fontSize: '3rem', color: '#10B981', textShadow: '0 0 25px rgba(16, 185, 129, 0.5)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                        Agri-Neural Twin
                    </h1>
                    <h2 style={{ fontSize: '1.25rem', color: '#cbd5e1', fontFamily: 'Share Tech Mono', letterSpacing: '1px', fontWeight: '400', marginBottom: '1.5rem' }}>
                        THE GOOGLE MAPS FOR FARMERS
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
                        Predicting market traffic to shield farmers from price crashes and secure crop profits using advanced AI simulations.
                    </p>
                </motion.div>

                {/* 3-Column Feature Grid */}
                <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', marginBottom: '5rem' }}>

                    {/* Feature 1: The Digital Twin */}
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', borderTop: '4px solid #3B82F6', minHeight: '220px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌐</div>
                        <h3 className="cyber-font" style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>The Digital Twin</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>A complete virtual simulation of the entire district's agricultural landscape, mirroring every farm in real-time.</p>
                    </div>

                    {/* Feature 2: The What-If Machine */}
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', borderTop: '4px solid #F59E0B', minHeight: '220px', background: 'rgba(245, 158, 11, 0.1)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
                        <h3 className="cyber-font" style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>The What-If Machine</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Runs 1,000 'practice seasons' in seconds to identify potential risks like market gluts or water shortages.</p>
                    </div>

                    {/* Feature 3: The Profit Path */}
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', borderTop: '4px solid #10B981', minHeight: '220px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
                        <h3 className="cyber-font" style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>The Profit Path</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>AI-generated advice on what crop to plant exactly when, maximizing profit and avoiding competition.</p>
                    </div>

                </motion.div>

                {/* 2. Demo Mode Section */}
                <motion.div variants={itemVariants} style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>

                    {/* Toggle Switch */}
                    <div style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <span style={{ color: demoActive ? '#F59E0B' : '#64748B', fontWeight: 'bold', fontSize: '0.9rem' }}>DEMO SIMULATION MODE</span>
                            <div
                                onClick={() => setDemoActive(!demoActive)}
                                style={{
                                    width: '60px', height: '32px',
                                    background: demoActive ? '#F59E0B' : '#334155',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    padding: '4px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: demoActive ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none'
                                }}
                            >
                                <motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                    style={{
                                        width: '24px', height: '24px',
                                        background: '#fff',
                                        borderRadius: '50%',
                                        marginLeft: demoActive ? '28px' : '0'
                                    }}
                                />
                            </div>
                        </label>
                    </div>

                    {/* Role Cards (Revealed on Toggle) */}
                    {demoActive ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}
                        >
                            {/* Card A: Vellore Farmer */}
                            <div
                                onClick={() => onDemoLogin('farmer')}
                                className="glass-card"
                                style={{
                                    padding: '0', overflow: 'hidden', cursor: 'pointer',
                                    border: '1px solid #10B981', textAlign: 'left',
                                    transition: 'transform 0.2s',
                                    background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)'
                                }}
                            >
                                <div style={{ background: '#10B981', padding: '0.5rem 1rem', color: '#0F172A', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DEMO PROFILE: FARMER</span>
                                    <span>VELLORE</span>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '2.5rem', background: '#064E3B', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>👩‍🌾</div>
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Demo Farmer</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Age: 21 | Land: 5 Acres</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem', fontFamily: 'Share Tech Mono' }}>
                                        <div>Survey #: 12345/A</div>
                                        <div>Crop History: Paddy, Turmeric</div>
                                    </div>
                                    <button style={{ width: '100%', padding: '0.8rem', background: '#10B981', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                        ENTER FARM DASHBOARD →
                                    </button>
                                </div>
                            </div>

                            {/* Card B: Agri Officer */}
                            <div
                                onClick={() => onDemoLogin('officer')}
                                className="glass-card"
                                style={{
                                    padding: '0', overflow: 'hidden', cursor: 'pointer',
                                    border: '1px solid #3B82F6', textAlign: 'left',
                                    transition: 'transform 0.2s',
                                    background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)'
                                }}
                            >
                                <div style={{ background: '#3B82F6', padding: '0.5rem 1rem', color: '#fff', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DEMO PROFILE: OFFICER</span>
                                    <span>STATE-WIDE</span>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '2.5rem', background: '#1E3A8A', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>👔</div>
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Govt Admin</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Role: District Coordinator</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem', fontFamily: 'Share Tech Mono' }}>
                                        <div>Jurisdiction: All 38 Districts</div>
                                        <div>Access: Full Command Center</div>
                                    </div>
                                    <button style={{ width: '100%', padding: '0.8rem', background: '#3B82F6', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                        ENTER COMMAND CENTER →
                                    </button>
                                </div>
                            </div>

                        </motion.div>
                    ) : (
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onGetStarted}
                            className="cyber-btn"
                            style={{
                                background: 'transparent',
                                border: '1px solid #334155',
                                color: '#94a3b8',
                                padding: '1rem 3rem',
                                fontSize: '1rem',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                marginTop: '1rem'
                            }}
                        >
                            LOGIN WITH CREDENTIALS
                        </motion.button>
                    )}

                </motion.div>

                {/* Footer */}
                <motion.div variants={itemVariants} style={{ marginTop: 'auto', paddingTop: '4rem', color: '#475569', fontSize: '0.75rem', textAlign: 'center' }}>
                    Agri-Neural Twin Project | iTNT Hub & EDII-TN Initiative<br />
                    Empowering Tamil Nadu's Farmers with AI
                </motion.div>

            </motion.div>
        </div>
    );
}
