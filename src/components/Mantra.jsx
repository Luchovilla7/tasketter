import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, Quote } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Mantra = () => {
    const { user, updateMantra } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initial mantra from metadata or default
    const savedMantra = user?.user_metadata?.mantra || 'La disciplina es el puente entre metas y logros.';

    useEffect(() => {
        setText(savedMantra);
    }, [savedMantra]);

    const handleSave = async () => {
        if (!text.trim()) {
            setText(savedMantra);
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await updateMantra(text.trim());
            setIsEditing(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-4 px-1 group">
            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-col gap-2"
                    >
                        <textarea
                            autoFocus
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSave()}
                            onBlur={handleSave}
                            disabled={isSaving}
                            className="w-full bg-white/5 border border-purple-500/30 rounded-lg p-3 text-[11px] md:text-xs font-medium text-purple-200 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed italic"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                                {isSaving ? 'Sincronizando...' : 'Presiona Enter para guardar'}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsEditing(true)}
                        className="cursor-pointer relative min-h-[40px] flex items-start gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5 active:scale-[0.98]"
                    >
                        <Quote size={12} className="text-purple-500/40 shrink-0 mt-1" />
                        <p className="text-[11px] md:text-sm font-medium text-gray-400 italic leading-relaxed tracking-wide pr-4">
                            "{text}"
                        </p>
                        <Edit2 size={10} className="absolute top-3 right-3 text-purple-500/0 group-hover:text-purple-500/40 transition-all invisible group-hover:visible" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Mantra;
