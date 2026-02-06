import React from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';
import { Clock, CheckCircle2, Circle, AlertCircle, Hash, Zap } from 'lucide-react';

const TimelineTask = ({ task, isFirst, isLast }) => {
    const updateTask = useTaskStore(state => state.updateTask);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="relative pl-8 md:pl-12 pb-10">
            {/* Vertical Line */}
            {!isLast && (
                <div className="absolute left-[15px] md:left-[23px] top-2 bottom-0 w-[2px] bg-gradient-to-b from-purple-500/50 via-purple-500/10 to-transparent" />
            )}

            {/* Node Dot */}
            <div className={`absolute left-0 top-1 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center z-10 ${task.completed ? 'bg-emerald-500/20 ring-2 ring-emerald-500/40' : 'bg-purple-500/20 ring-2 ring-purple-500/40'
                }`}>
                {task.completed ? (
                    <CheckCircle2 className="text-emerald-400 w-4 h-4 md:w-6 md:h-6" />
                ) : (
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                )}
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`glass-panel p-5 md:p-6 border-white/5 relative group transition-all hover:border-white/10 ${task.completed ? 'opacity-60 bg-white/[0.02]' : 'bg-white/5'
                    }`}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                                {formatDate(task.created_at)}
                            </span>
                            {task.urgency && (
                                <span className="flex items-center gap-1 text-[9px] md:text-[11px] text-red-400 font-black uppercase tracking-tighter">
                                    <AlertCircle size={10} /> Urgente
                                </span>
                            )}
                        </div>
                        <h3 className={`text-sm md:text-base font-bold text-white leading-tight ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateTask(task.id, { completed: !task.completed })}
                            className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${task.completed
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {task.completed ? 'Completada' : 'Marcar Lista'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <Zap size={10} className="text-purple-400" />
                        ROI: {task.impact}%
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <Clock size={10} className="text-blue-400" />
                        Efs: {task.effort}%
                    </div>
                    {task.tags?.map(tag => (
                        <div key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-[9px] md:text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                            <Hash size={10} />
                            {tag}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const Timeline = () => {
    const tasks = useTaskStore(state => state.tasks);

    // Sort tasks by created_at descending (latest first)
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Group tasks by date
    const groups = sortedTasks.reduce((acc, task) => {
        const date = new Date(task.created_at).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {});

    return (
        <div className="h-full flex flex-col w-full max-w-4xl mx-auto pt-4 md:pt-8 px-4 md:px-0">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase mb-2">Cronología del Nodo</h2>
                <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em]">Registro temporal de ejecución estratégica</p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {Object.keys(groups).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-30 text-center">
                        <Clock size={48} className="text-purple-500 mb-4 animate-pulse" />
                        <p className="text-xl font-black uppercase tracking-widest">Sin registro temporal</p>
                        <p className="text-sm mt-2 font-medium">Las tareas aparecerán aquí en orden cronológico.</p>
                    </div>
                ) : (
                    Object.entries(groups).map(([date, dayTasks], gIndex) => (
                        <div key={date} className="mb-8">
                            <div className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md py-4 mb-6 border-b border-white/5">
                                <h3 className="text-[10px] md:text-xs font-black text-purple-500 uppercase tracking-[0.4em]">
                                    {date}
                                </h3>
                            </div>

                            <div className="space-y-2">
                                {dayTasks.map((task, index) => (
                                    <TimelineTask
                                        key={task.id}
                                        task={task}
                                        isFirst={index === 0}
                                        isLast={index === dayTasks.length - 1 && gIndex === Object.keys(groups).length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Timeline;
