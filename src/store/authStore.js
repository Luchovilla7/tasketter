import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

export const useAuthStore = create((set) => ({
    user: null,
    session: null,
    loading: true,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (loading) => set({ loading }),

    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            console.error('Supabase Sign Up Error:', error.message);
            throw error;
        }
        return data;
    },

    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('Supabase Auth Error:', error.message, error.status);
            throw error;
        }
        return data;
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },

    checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user || null, loading: false });

        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user || null, loading: false });
        });
    },
}));
