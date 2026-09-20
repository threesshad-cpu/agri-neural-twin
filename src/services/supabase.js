import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const CONFIGURED = Boolean(
    url && key &&
    !url.includes('your-project') &&
    !key.includes('your-anon-key')
);

export const supabase = createClient(
    CONFIGURED ? url : 'https://placeholder.supabase.co',
    CONFIGURED ? key : 'placeholder-offline'
);

// Module-level demo flag — set by AuthContext on login/logout
let _demo = false;
export const setDemoMode = (val) => { _demo = !!val; };
// Returns true when in demo mode OR when Supabase is not configured (offline)
export const isDemoMode = () => _demo || !CONFIGURED;
