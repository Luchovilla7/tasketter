import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';
import { useShallow } from 'zustand/react/shallow';
import { Zap, AlertCircle, Clock, Hash, Move, Pencil } from 'lucide-react';

const TaskCard = ({ task, zoom, pan, canvasRef }) => {
    const { updateTask, setEditingTask } = useTaskStore();
    const cardRef = useRef(null);

    const handleDragEnd = (_, info) => {
        if (!canvasRef.current || !cardRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();

        // 1. Position relative to container using info.point (more reliable screen coordinate)
        const relX = info.point.x - rect.left;
        const relY = info.point.y - rect.top;

        // 2. Adjust for pan and scale to get internal map pixels
        const mapX = (relX - pan.x) / zoom;
        const mapY = (relY - pan.y) / zoom;

        // 3. Convert to percentage of container
        const newX = (mapX / rect.width) * 100;
        const newY = 100 - ((mapY / rect.height) * 100);

        // 4. Use 2-decimal precision for extreme accuracy
        const clampedX = Math.max(0, Math.min(100, Math.round(newX * 100) / 100));
        const clampedY = Math.max(0, Math.min(100, Math.round(newY * 100) / 100));

        updateTask(task.id, { impact: clampedY, effort: clampedX });
    };

    return (
        <motion.div
            ref={cardRef}
            layoutId={task.id}
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{
                left: `${task.effort}%`,
                top: `${100 - task.impact}%`,
                position: 'absolute',
                zIndex: 20,
            }}
            animate={{
                x: '-50%',
                y: '-50%',
                scale: 1,
                opacity: 1
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
            className="absolute shadow-2xl"
        >
            <div className={`glass-card p-2 md:p-3 w-32 md:w-48 rounded-xl ring-1 ring-white/10 group cursor-grab active:cursor-grabbing ${task.urgency ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''
                }`}>
                <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2 text-left">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-[10px] md:text-xs font-black uppercase leading-[1.1] tracking-tight ${task.completed ? 'line-through opacity-40' : 'text-white'
                            }`}>
                            {task.title}
                        </h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingTask(task);
                            }}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Pencil size={10} className="text-gray-400" />
                        </button>
                    </div>
                    {task.urgency && <AlertCircle size={12} className="text-red-500 shrink-0 md:w-3.5 md:h-3.5" />}
                </div>

                <div className="flex flex-wrap gap-1 mt-auto pointer-events-none">
                    {task.client_name && (
                        <div className="flex items-center gap-1 px-1 md:px-1.5 py-0.5 rounded-md bg-blue-500/10 text-[8px] md:text-[10px] text-blue-400 truncate max-w-full">
                            <span className="font-black">CLIENT:</span> {task.client_name}
                        </div>
                    )}
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

                <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                    <Move size={10} className="text-gray-400" />
                </div>
            </div>
        </motion.div>
    );
};

const ImpactMatrix = () => {
    const updateTask = useTaskStore(state => state.updateTask);
    const tasks = useTaskStore(useShallow(state => {
        const { tasks, filters } = state;
        return tasks.filter(task => {
            const matchesCategory = filters.category === 'all' || task.category === filters.category;
            const matchesClient = filters.client === 'all' || task.client_name === filters.client;
            return matchesCategory && matchesClient;
        });
    }));
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const canvasRef = useRef(null);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
        }
    };

    const handleMouseDown = (e) => {
        if (e.button === 0 && e.target === e.currentTarget) {
            setIsPanning(true);
            lastPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e) => {
        if (!isPanning) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;

        setPan(prev => {
            const newX = prev.x + dx;
            const newY = prev.y + dy;

            // Limit pan so the user doesn't get totally lost
            // Allow more freedom at lower zoom
            const limitX = window.innerWidth * 0.8;
            const limitY = window.innerHeight * 0.8;

            return {
                x: Math.max(-limitX, Math.min(limitX, newX)),
                y: Math.max(-limitY, Math.min(limitY, newY))
            };
        });
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (canvas) canvas.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div className="h-full flex flex-col w-full select-none">
            {/* Matrix Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight">Mapa Estratégico</h3>
                    <p className="text-[10px] md:text-sm text-gray-500 font-medium">Prioriza basado en ROI y Esfuerzo (Arrastra para mover)</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-sm font-bold"
                        >
                            -
                        </button>
                        <span className="text-[9px] md:text-xs font-mono text-gray-400 w-8 md:w-12 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-sm font-bold"
                        >
                            +
                        </button>
                    </div>
                    <button
                        onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                        className="p-2 hover:bg-white/5 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 transition-all flex items-center gap-2"
                    >
                        <motion.div animate={{ rotate: pan.x !== 0 || pan.y !== 0 ? 180 : 0 }}>
                            <Move size={12} />
                        </motion.div>
                        Resetear
                    </button>
                </div>
            </div>

            {/* The Matrix Canvas */}
            <div
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`flex-1 relative glass-panel overflow-hidden border-white/5 bg-black/40 min-h-[450px] cursor-${isPanning ? 'grabbing' : 'crosshair'} transition-shadow duration-500 ${isPanning ? 'shadow-[inset_0_0_50px_rgba(168,85,247,0.1)]' : ''}`}
            >
                {/* Quadrant Quick Nav (Floating) */}
                <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button onClick={() => setPan({ x: 50, y: 50 })} className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center hover:border-purple-500/50 transition-colors group" title="Grandes Proyectos">
                            <div className="w-2 h-2 rounded-sm border-2 border-purple-500 group-hover:bg-purple-500 transition-colors" />
                        </button>
                        <button onClick={() => setPan({ x: -250, y: 50 })} className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center hover:border-emerald-500/50 transition-colors group" title="Victorias Rápidas">
                            <div className="w-2 h-2 rounded-sm border-2 border-emerald-500 group-hover:bg-emerald-500 transition-colors" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setPan({ x: 50, y: -250 })} className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center hover:border-gray-500/50 transition-colors group" title="Tareas Ingratas">
                            <div className="w-2 h-2 rounded-sm border-2 border-gray-500 group-hover:bg-gray-500 transition-colors" />
                        </button>
                        <button onClick={() => setPan({ x: -250, y: -250 })} className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center hover:border-blue-500/50 transition-colors group" title="Relleno">
                            <div className="w-2 h-2 rounded-sm border-2 border-blue-500 group-hover:bg-blue-500 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Radar (Mini-map) */}
                <div className="absolute bottom-6 right-6 w-32 h-32 bg-black/80 rounded-2xl border border-white/10 p-2 z-50 pointer-events-none overflow-hidden backdrop-blur-md shadow-2xl border-purple-500/20">
                    <div className="w-full h-full relative border border-white/5 rounded-lg opacity-40 bg-white/5">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />

                        {/* Viewport Indicator */}
                        <motion.div
                            animate={{
                                x: Math.max(0, Math.min(90, (-pan.x / (canvasRef.current?.offsetWidth || 1) / zoom) * 112 + 56 - (56 / zoom))),
                                y: Math.max(0, Math.min(90, (-pan.y / (canvasRef.current?.offsetHeight || 1) / zoom) * 112 + 56 - (56 / zoom))),
                                width: Math.min(112, 112 / zoom),
                                height: Math.min(112, 112 / zoom),
                                opacity: isPanning ? 1 : 0.6
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute border-2 border-purple-500 bg-purple-500/20 rounded-md"
                            style={{ left: 0, top: 0 }}
                        />
                    </div>
                    <p className="absolute bottom-1 left-0 w-full text-center text-[7px] font-black uppercase tracking-widest text-purple-400/60">Sistema de Radar</p>
                </div>
                {/* Viewport Transform Wrapper */}
                <motion.div
                    style={{ transformOrigin: '0 0' }}
                    animate={{
                        scale: zoom,
                        x: pan.x,
                        y: pan.y
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }}
                    className="w-full h-full relative"
                >
                    {/* Background Grid & Axes */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.1]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168,85,247,0.5) 1.5px, transparent 0)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Axis center lines */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 pointer-events-none" />
                    <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/10 pointer-events-none" />

                    {/* Quadrant Labels */}
                    <div className="absolute top-4 right-4 text-[8px] md:text-[10px] font-black text-emerald-500/30 uppercase tracking-[0.2em] pointer-events-none">Victorias Rápidas</div>
                    <div className="absolute top-4 left-4 text-[8px] md:text-[10px] font-black text-purple-500/30 uppercase tracking-[0.2em] pointer-events-none">Grandes Proyectos</div>
                    <div className="absolute bottom-4 left-4 text-[8px] md:text-[10px] font-black text-gray-600/30 uppercase tracking-[0.2em] pointer-events-none">Tareas Ingratas</div>
                    <div className="absolute bottom-4 right-4 text-[8px] md:text-[10px] font-black text-blue-500/30 uppercase tracking-[0.2em] pointer-events-none">Relleno</div>

                    {/* Content */}
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} zoom={zoom} pan={pan} canvasRef={canvasRef} />
                    ))}

                    {tasks.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 md:p-12 opacity-30 pointer-events-none">
                            <Zap size={32} md:size={48} className="mb-4 text-purple-400 animate-pulse" />
                            <p className="text-base md:text-xl font-black uppercase tracking-widest">Panel Estratégico Vacío</p>
                            <p className="text-[10px] md:text-sm mt-2 max-w-[250px] md:max-w-xs font-medium leading-relaxed">
                                Arrastra o pega tareas para visualizarlas aquí.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Constant Axes Labels (Fixed in UI, not panned) */}
                <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest whitespace-nowrap pointer-events-none">
                    ← Impacto →
                </div>
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest whitespace-nowrap pointer-events-none">
                    ← Esfuerzo →
                </div>
            </div>
        </div>
    );
};

export default ImpactMatrix;
