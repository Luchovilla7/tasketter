import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Zap, Clock, AlertCircle, User, Briefcase } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';

const EditTaskModal = () => {
    const { editingTask, setEditingTask, updateTask, deleteTask } = useTaskStore();
    const [title, setTitle] = useState('');
    const [impact, setImpact] = useState(50);
    const [effort, setEffort] = useState(50);
    const [urgency, setUrgency] = useState(false);
    const [targetDate, setTargetDate] = useState('');
    const [recurrence, setRecurrence] = useState('none');
    const [category, setCategory] = useState('own');
    const [clientName, setClientName] = useState('');

    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title || '');
            setImpact(editingTask.impact || 50);
            setEffort(editingTask.effort || 50);
            setUrgency(editingTask.urgency || false);
            setTargetDate(editingTask.target_date || '');
            setRecurrence(editingTask.recurrence || 'none');
            setCategory(editingTask.category || 'own');
            setClientName(editingTask.client_name || '');
        }
    }, [editingTask]);

    const handleSave = async () => {
        if (!title.trim()) return;

        await updateTask(editingTask.id, {
            title: title.trim(),
            impact,
            effort,
            urgency,
            target_date: targetDate || null,
            recurrence,
            category,
            client_name: category === 'client' ? clientName.trim() : null
        });
        setEditingTask(null);
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres borrar esta tarea?')) {
            await deleteTask(editingTask.id);
            setEditingTask(null);
        }
    };

    const recurrenceOptions = [
        { id: 'none', label: 'Sin repetición' },
        { id: 'daily', label: 'Diario' },
        { id: 'weekdays', label: 'Lunes a Viernes' },
        { id: 'weekly', label: 'Semanal' },
        { id: 'monthly', label: 'Mensual' },
    ];

    if (!editingTask) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingTask(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl glass-panel p-6 md:p-8 z-[110] border-white/20 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Zap className="text-blue-400 w-5 h-5" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Editar Nodo Estratégico</h2>
                    </div>
                    <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Título de la Tarea</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm md:text-base font-bold focus:outline-none focus:border-blue-500/50 transition-colors"
                            placeholder="Ej: Refactorizar base de datos..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Impact */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Impacto Proyectado</label>
                                <span className={`text-xs font-black ${impact > 70 ? 'text-emerald-400' : 'text-blue-400'}`}>{impact}%</span>
                            </div>
                            <input
                                type="range"
                                value={impact}
                                onChange={(e) => setImpact(parseInt(e.target.value))}
                                className="w-full accent-blue-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Effort */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Esfuerzo Requerido</label>
                                <span className={`text-xs font-black ${effort > 70 ? 'text-red-400' : 'text-purple-400'}`}>{effort}%</span>
                            </div>
                            <input
                                type="range"
                                value={effort}
                                onChange={(e) => setEffort(parseInt(e.target.value))}
                                className="w-full accent-purple-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Programar para</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-12 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Recurrence */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Recurrencia</label>
                            <select
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                            >
                                {recurrenceOptions.map(opt => (
                                    <option key={opt.id} value={opt.id} className="bg-gray-900">{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Tipo de Tarea</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                            >
                                <option value="own" className="bg-gray-900">Propia (Interna)</option>
                                <option value="client" className="bg-gray-900">Para Cliente</option>
                            </select>
                        </div>

                        {/* Client Name */}
                        {category === 'client' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Nombre del Cliente</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="Ej: LogoCorp..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-12 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Urgency Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-red-500/20 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${urgency ? 'bg-red-500/20' : 'bg-gray-500/10'}`}>
                                <AlertCircle className={urgency ? 'text-red-400' : 'text-gray-500'} size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Prioridad Urgente</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ejecución inmediata requerida</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUrgency(!urgency)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${urgency ? 'bg-red-500' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${urgency ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-white/5">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-red-500 hover:text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/5 px-4 py-2 rounded-lg transition-all"
                    >
                        <Trash2 size={16} />
                        Borrar Tarea
                    </button>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setEditingTask(null)}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            <Save size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditTaskModal;
