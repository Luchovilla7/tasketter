import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';
import { Zap, AlertCircle, Clock, Hash, Move } from 'lucide-react';

const TaskCard = ({ task, zoom, pan, canvasRef }) => {
    const updateTask = useTaskStore(state => state.updateTask);
    const cardRef = useRef(null);

    const handleDragEnd = (_, info) => {
        if (!canvasRef.current || !cardRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const cardRect = cardRef.current.getBoundingClientRect();

        // 1. Get the CENTER of the card in absolute screen pixels
        // This makes the drop position independent of where the user grabbed the card
        const centerX = cardRect.left + (cardRect.width / 2);
        const centerY = cardRect.top + (cardRect.height / 2);

        // 2. Position relative to container
        const relX = centerX - rect.left;
        const relY = centerY - rect.top;

        // 3. Adjust for pan and scale to get internal map pixels
        const mapX = (relX - pan.x) / zoom;
        const mapY = (relY - pan.y) / zoom;

        // 4. Convert to percentage of container
        const newX = (mapX / rect.width) * 100;
        const newY = 100 - ((mapY / rect.height) * 100);

        // Use 1 decimal precision for sub-pixel accuracy in local UI
        const clampedX = Math.max(0, Math.min(100, Math.round(newX * 10) / 10));
        const clampedY = Math.max(0, Math.min(100, Math.round(newY * 10) / 10));

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
                    <h4 className="text-[9px] md:text-xs font-bold text-gray-100 line-clamp-2 leading-tight select-none">
                        {task.title}
                    </h4>
                    {task.urgency && <AlertCircle size={12} className="text-red-500 shrink-0 md:w-3.5 md:h-3.5" />}
                </div>

                <div className="flex flex-wrap gap-1 mt-auto pointer-events-none">
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
    const tasks = useTaskStore(state => state.tasks);
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
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
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
                        className="p-2 hover:bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-all underline underline-offset-4"
                    >
                        Resetear Vista
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
                className={`flex-1 relative glass-panel overflow-hidden border-white/5 bg-black/40 min-h-[400px] cursor-${isPanning ? 'grabbing' : 'crosshair'}`}
            >
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
