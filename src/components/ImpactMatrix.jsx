import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';
import { Zap, AlertCircle, Clock, Hash } from 'lucide-react';

const TaskCard = ({ task }) => {
    return (
        <motion.div
            layoutId={task.id}
            style={{
                left: `${task.x}%`,
                top: `${100 - task.y}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
        >
            <div className={`glass-card p-2 md:p-3 w-32 md:w-48 rounded-xl ring-1 ring-white/10 group cursor-pointer ${task.urgency ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''
                }`}>
                <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2 text-left">
                    <h4 className="text-[9px] md:text-xs font-bold text-gray-100 line-clamp-2 leading-tight">
                        {task.title}
                    </h4>
                    {task.urgency && <AlertCircle size={12} className="text-red-500 shrink-0 md:w-3.5 md:h-3.5" />}
                </div>

                <div className="flex flex-wrap gap-1 mt-auto">
                    {task.duration && (
                        <div className="flex items-center gap-1 px-1 md:px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] md:text-[10px] text-gray-400 whitespace-nowrap">
                            <Clock size={8} className="md:w-[10px]" />
                            {task.duration}m
                        </div>
                    )}
                    {task.tags?.slice(0, 1).map(tag => (
                        <div key={tag} className="flex items-center gap-1 px-1 md:px-1.5 py-0.5 rounded-md bg-purple-500/10 text-[8px] md:text-[10px] text-purple-400 truncate max-w-[50px] md:max-w-none">
                            <Hash size={8} className="md:w-[10px]" />
                            {tag}
                        </div>
                    ))}
                </div>

                {/* Dynamic Signals Overlay */}
                <div className="absolute top-0 right-0 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg shadow-purple-500/40 flex items-center justify-center border border-white/20">
                        <Zap size={10} className="text-white" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ImpactMatrix = () => {
    const tasks = useTaskStore(state => state.tasks);
    const [zoom, setZoom] = useState(1);

    return (
        <div className="h-full flex flex-col w-full">
            {/* Matrix Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight">Mapa Estratégico</h3>
                    <p className="text-[10px] md:text-sm text-gray-500 font-medium">Prioriza basado en ROI y Esfuerzo</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-sm font-bold"
                    >
                        -
                    </button>
                    <span className="text-[9px] md:text-xs font-mono text-gray-400 w-8 md:w-12 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-sm font-bold"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* The Matrix Canvas */}
            <div className="flex-1 relative glass-panel overflow-hidden border-white/5 bg-black/40 min-h-[400px]">
                {/* Background Grid & Axes */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168,85,247,0.5) 1.5px, transparent 0)`,
                        backgroundSize: `${40 * zoom}px ${40 * zoom}px`
                    }}
                />

                {/* Axis center lines */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 pointer-events-none" />
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/5 pointer-events-none" />

                {/* Quadrant Labels */}
                <div className="absolute top-4 right-4 md:top-6 md:right-8 text-[8px] md:text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Victorias Rápidas</div>
                <div className="absolute top-4 left-4 md:top-6 md:left-8 text-[8px] md:text-[10px] font-black text-purple-500/50 uppercase tracking-[0.2em]">Grandes Proyectos</div>
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8 text-[8px] md:text-[10px] font-black text-gray-600/50 uppercase tracking-[0.2em]">Tareas Ingratas</div>
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 text-[8px] md:text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em]">Relleno</div>

                {/* Axes Labels */}
                <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest whitespace-nowrap">
                    ← Impacto →
                </div>
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest whitespace-nowrap">
                    ← Esfuerzo →
                </div>

                {/* Viewport for Zooming */}
                <motion.div
                    animate={{ scale: zoom }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full h-full relative"
                >
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}

                    {tasks.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 md:p-12 opacity-30">
                            <Zap size={32} md:size={48} className="mb-4 text-purple-400 animate-pulse" />
                            <p className="text-base md:text-xl font-black uppercase tracking-widest">Sin Tareas Activas</p>
                            <p className="text-[10px] md:text-sm mt-2 max-w-[250px] md:max-w-xs font-medium leading-relaxed">
                                Pega tu lista de caos para ver cómo la Inteligencia Estratégica las organiza.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ImpactMatrix;
