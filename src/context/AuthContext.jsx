import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        // Enforce Login/Landing Page on Every Refresh
        // We explicitly CLEAR storage instead of reading it.
        try {
            localStorage.removeItem('agri_auth');
            localStorage.removeItem('agri_role');
            localStorage.removeItem('agri_profile_complete');
            localStorage.removeItem('agri_demo');

            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error("Auth Reset Failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (role, demo = false, prefillData = null) => {
        // Set state for the active session, but do NOT persist to allow refresh-reset
        const userRole = role || 'farmer';
        setUser({ role: userRole, prefillData }); // Store prefillData in user object
        setIsAuthenticated(true);
        // We can set localStorage if other tabs need to know, but we won't read it on mount.
        // For now, let's keep it ephemeral.

        if (demo) {
            setIsDemoMode(true);
            completeProfile({ name: 'Demo User' });
        } else {
            setIsDemoMode(false);
        }
    };

    const completeProfile = (data) => {
        setIsProfileComplete(true);
        setUser(prev => ({ ...prev, ...data }));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsProfileComplete(false);
        setIsDemoMode(false);
        // Clear just in case
        localStorage.clear();
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
