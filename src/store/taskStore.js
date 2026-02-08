import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

export const useTaskStore = create((set, get) => ({
    tasks: [],
    loading: false,
    filters: {
        category: 'all', // 'all', 'own', 'client'
        client: 'all'    // 'all' or specific client name
    },
    editingTask: null,

    setEditingTask: (task) => set({ editingTask: task }),

    fetchTasks: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
        } else {
            set({ tasks: data || [] });
        }
        set({ loading: false });
    },

    addTask: async (taskTitle) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newTask = {
            user_id: user.id,
            title: taskTitle,
            impact: 50,
            effort: 50,
            urgency: false,
            completed: false,
            tags: [],
            target_date: null,
            recurrence: 'none',
            category: 'own',
            client_name: null
        };

        const { data, error } = await supabase
            .from('tareas')
            .insert([newTask])
            .select();

        if (error) {
            console.error('Error adding task:', error);
        } else if (data) {
            set((state) => ({ tasks: [data[0], ...state.tasks] }));
        }
    },

    addBulkTasks: async (newTasks) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tasksToInsert = newTasks.map(t => ({
            user_id: user.id,
            title: t.title,
            impact: Math.round(t.impact || Math.random() * 100),
            effort: Math.round(t.effort || Math.random() * 100),
            urgency: t.urgency || false,
            completed: t.completed || false,
            duration: t.duration || null,
            tags: t.tags || [],
            target_date: t.target_date || null,
            recurrence: t.recurrence || 'none',
            category: t.category || 'own',
            client_name: t.client_name || null
        }));

        const { data, error } = await supabase
            .from('tareas')
            .insert(tasksToInsert)
            .select();

        if (error) {
            console.error('Error adding bulk tasks:', error);
        } else if (data) {
            set((state) => ({ tasks: [...data, ...state.tasks] }));
        }
    },

    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
    })),

    updateTask: async (id, updates) => {
        const { error } = await supabase
            .from('tareas')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating task:', error);
        } else {
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
            }));
        }
    },

    deleteTask: async (id) => {
        const { error } = await supabase
            .from('tareas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task:', error);
        } else {
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id)
            }));
        }
    },
}));
