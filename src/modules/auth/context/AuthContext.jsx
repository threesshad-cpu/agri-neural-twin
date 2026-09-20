import { useTranslation } from 'react-i18next';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setDemoMode } from '../../../services/supabase';
import { userService } from '../../../services/db/userService';
import { farmerProfileService } from '../../farmer-passport/services/farmerProfileService';
import { generateFarmAnalysis } from '../../ai-intelligence/services/farmContextService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const SESSION_KEY = 'agri_auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Restore persisted session on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (raw) {
                const { user: u, isDemo, profileComplete } = JSON.parse(raw);
                if (u?.role) {
                    setDemoMode(isDemo || false);
                    setIsDemoMode(isDemo || false);
                    setUser(u);
                    setIsAuthenticated(true);
                    setIsProfileComplete(!!profileComplete);
                }
            }
        } catch (_) {
            localStorage.removeItem(SESSION_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    const _saveSession = (u, isDemo, profileComplete) => {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ user: u, isDemo, profileComplete }));
        } catch (err) { console.warn('Session save failed:', err); }
    };

    const login = async (role, demo = false, prefillData = null) => {
        const userRole = role || 'farmer';
        const sessionUser = { role: userRole, prefillData };

        setDemoMode(demo);
        setIsDemoMode(demo);
        setUser(sessionUser);
        setIsAuthenticated(true);

        // For demo, profile is immediately complete
        _saveSession(sessionUser, demo, demo);

        if (demo && role === 'farmer') {
            try {
                const demoData = {
                    name: 'Thiru. Selvam (Demo)',
                    aadhaar: '111122223333',
                    district: 'Vellore',
                    taluk: 'Katpadi',
                    village: 'Melpadi',
                    surveyNo: '245/2',
                    pincode: '632509',
                    totalAcreage: '3.5',
                    crop: 'Paddy',
                    soilType: 'Red Loam',
                    irrigationType: 'Drip',
                    waterSource: 'Borewell',
                    coordinates: [12.91627, 79.13709],
                };
                const passport = farmerProfileService.registerFarmer(demoData);
                try {
                    const analysis = await generateFarmAnalysis(passport.farmerId, demoData.district, { crop: demoData.crop, acreage: parseFloat(demoData.totalAcreage) });
                    farmerProfileService.saveAIAnalysis(passport.farmerId, analysis);
                } catch (analysisErr) {
                    console.warn('[AuthContext] Demo AI analysis failed:', analysisErr.message);
                }
                completeProfile({ ...demoData, location: demoData.coordinates, locationName: `${demoData.village}, ${demoData.taluk}`, farmerId: passport.farmerId });
            } catch (err) {
                console.warn('[AuthContext] Demo farmer registration failed, falling back:', err.message);
                completeProfile({ name: 'Demo User' });
            }
        } else if (demo) {
            completeProfile({ name: 'Demo User' });
        } else if (prefillData?.aadhaar) {
            userService.upsert({
                aadhaar: String(prefillData.aadhaar).replace(/\s/g, ''),
                role: userRole,
                name: prefillData.name || null,
                phone: prefillData.phone || null,
            }).then(dbUser => {
                if (dbUser) setUser(prev => ({ ...prev, dbId: dbUser.id }));
            });
        }
    };

    const completeProfile = (data) => {
        setIsProfileComplete(true);
        setUser(prev => {
            const next = { ...prev, ...data };
            try {
                const raw = localStorage.getItem(SESSION_KEY);
                const existing = raw ? JSON.parse(raw) : { isDemo: false };
                _saveSession(next, existing.isDemo || false, true);
            } catch (err) { console.warn('Session restore failed:', err); }
            return next;
        });

        if (!isDemoMode && data.aadhaar) {
            userService.upsert({
                aadhaar: String(data.aadhaar).replace(/\s/g, ''),
                role: data.role,
                name: data.name || null,
                phone: data.phone || null,
            });
        }
    };

    const logout = () => {
        setDemoMode(false);
        setUser(null);
        setIsAuthenticated(false);
        setIsProfileComplete(false);
        setIsDemoMode(false);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('appViewMode');
        localStorage.removeItem('agri_plan');
        localStorage.removeItem('appTheme');
        localStorage.removeItem('i18nextLng');
        sessionStorage.clear();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isProfileComplete,
            isDemoMode,
            login,
            logout,
            completeProfile,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
