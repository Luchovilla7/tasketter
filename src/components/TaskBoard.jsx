import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';
import { useShallow } from 'zustand/react/shallow';
import {
    CheckCircle2,
    Circle,
    Clock,
    Search,
    SlidersHorizontal,
    Tag,
    Trash2,
    AlertTriangle,
    Pencil
} from 'lucide-react';

const TaskItem = ({ task }) => {
    const { updateTask, deleteTask, setEditingTask } = useTaskStore();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-4 md:p-5 flex items-center gap-3 md:gap-5 group hover:border-white/20 border-white/5"
        >
            <button
                onClick={() => updateTask(task.id, { completed: !task.completed })}
                className="shrink-0 transition-all active:scale-95"
            >
                {task.completed ? (
                    <CheckCircle2 className="text-emerald-500 w-6 h-6 md:w-7 md:h-7" />
                ) : (
                    <Circle className="text-gray-600 hover:text-purple-400 w-6 h-6 md:w-7 md:h-7" />
                )}
            </button>

            <div className="flex-1 min-w-0">
                <h4 className={`text-sm md:text-base font-bold tracking-tight transition-all mb-1 ${task.completed ? 'text-gray-600 line-through' : 'text-white'}`}>
                    {task.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    {task.client_name && (
                        <span className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase tracking-wider flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded-md">
                            CLIENTE: {task.client_name}
                        </span>
                    )}
                    {task.duration && (
                        <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                            <Clock size={10} md:size={12} className="text-purple-400" /> {task.duration}m
                        </span>
                    )}
                    {task.tags?.map(tag => (
                        <span key={tag} className="text-[9px] md:text-[10px] text-purple-400 font-black uppercase tracking-wider flex items-center gap-1">
                            <Tag size={10} /> {tag}
                        </span>
                    ))}
                    {task.urgency && (
                        <span className="text-[9px] md:text-[10px] text-red-500 font-black uppercase tracking-[0.1em] flex items-center gap-1">
                            <AlertTriangle size={10} /> URGENTE
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <div className={`hidden sm:block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${task.impact > 70 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                    {task.impact > 70 ? 'ROI Alto' : 'Mantener'}
                </div>
                <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 md:p-3 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all active:scale-90"
                >
                    <Pencil size={16} md:size={18} />
                </button>
                <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 md:p-3 hover:bg-red-500/20 rounded-xl text-gray-500 hover:text-red-500 transition-all active:scale-90"
                >
                    <Trash2 size={16} md:size={18} />
                </button>
            </div>
        </motion.div>
    );
};

const TaskBoard = () => {
    const tasks = useTaskStore(useShallow(state => {
        const { tasks, filters } = state;
        return tasks.filter(task => {
            const matchesCategory = filters.category === 'all' || task.category === filters.category;
            const matchesClient = filters.client === 'all' || task.client_name === filters.client;
            return matchesCategory && matchesClient;
        });
    }));
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
        if (filter === 'urgent') return matchesSearch && t.urgency;
        if (filter === 'completed') return matchesSearch && t.completed;
        if (filter === 'pending') return matchesSearch && !t.completed;
        return matchesSearch;
    });

    const filterItems = [
        { id: 'all', label: 'Todos' },
        { id: 'pending', label: 'Pendientes' },
        { id: 'urgent', label: 'Urgentes' },
        { id: 'completed', label: 'Completas' },
    ];

    return (
        <div className="h-full flex flex-col gap-6 md:gap-8 w-full max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex bg-white/5 p-1 rounded-[18px] border border-white/10 w-full lg:w-fit overflow-x-auto no-scrollbar shrink-0">
                    {filterItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            className={`flex-1 lg:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === item.id
                                ? 'bg-purple-600 text-white shadow-[0_10px_25px_rgba(147,51,234,0.3)] border border-white/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o #tag..."
                        className="w-full bg-white/5 border border-white/10 rounded-[20px] py-3.5 pl-12 pr-6 text-sm md:text-base focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 font-medium shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 md:pr-4 space-y-4 no-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </AnimatePresence>

                {filteredTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] opacity-40 text-center">
                        <SlidersHorizontal size={48} className="mb-4 text-purple-400" />
                        <p className="text-xl font-black uppercase tracking-widest">Sin Coincidencias</p>
                        <p className="text-sm mt-2 max-w-xs font-medium">Ajusta los filtros o crea nuevas tareas desde el motor central.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskBoard;
