import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Sparkles } from 'lucide-react';
import { parseChaosList } from '../utils/parser';
import { useTaskStore } from '../store/taskStore';

const ChaosModal = ({ isOpen, onClose }) => {
    const [text, setText] = useState('');
    const addBulkTasks = useTaskStore(state => state.addBulkTasks);

    const handleProcess = () => {
        const parsedTasks = parseChaosList(text);
        addBulkTasks(parsedTasks);
        setText('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70]"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl glass-panel p-6 md:p-8 z-[80] border-white/20 shadow-2xl shadow-purple-500/10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Sparkles className="text-purple-400 w-5 h-5" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold">Procesador de Caos</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-400 mb-4 text-xs md:text-sm leading-relaxed">
                            Pega tu lista caótica. Usa <span className="text-purple-400 font-mono font-bold">[urgente]</span>, <span className="text-blue-400 font-mono font-bold">(30m)</span>, o <span className="text-emerald-400 font-mono font-bold">#tags</span> para organizar automáticamente.
                        </p>

                        <textarea
                            autoFocus
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Ej: Refactorizar módulo auth (2h) [urgente] #dev&#10;Corregir bug en producción #bug !i:90 !e:10&#10;Llamar cliente sobre propuesta (15m)"
                            className="w-full h-48 md:h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none mb-6 font-mono text-xs md:text-sm leading-relaxed"
                        />

                        <div className="flex flex-col-reverse md:flex-row justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={!text.trim()}
                                onClick={handleProcess}
                                className="btn-primary flex items-center justify-center gap-2 px-8 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <Zap size={18} />
                                Transformar Caos
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChaosModal;
