import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

export const useAuthStore = create((set) => ({
    user: null,
    session: null,
    loading: true,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (loading) => set({ loading }),

    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
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
