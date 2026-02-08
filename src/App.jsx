import React, { useState } from 'react';
import {
    Calendar,
    CheckSquare,
    Clock,
    Compass,
    Menu,
    PieChart,
    Settings,
    Zap,
    Sparkles,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChaosModal from './components/ChaosModal';
import SettingsModal from './components/SettingsModal';
import ImpactMatrix from './components/ImpactMatrix';
import TaskBoard from './components/TaskBoard';
import Timeline from './components/Timeline';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import LoginPage from './pages/LoginPage';
import Mantra from './components/Mantra';
import FilterBar from './components/FilterBar';
import EditTaskModal from './components/EditTaskModal';
import { useTaskStore } from './store/taskStore';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from './store/authStore';

// Temporary Mock View for Timeline/Calendar
const MockView = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 md:p-16 glass-panel border-white/5 bg-white/5 w-full max-w-2xl"
        >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 md:mb-8 border border-white/10">
                <Sparkles className="text-purple-400 w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-gradient">Módulo de {title}</h2>
            <p className="text-gray-400 text-sm md:text-lg max-w-sm mx-auto leading-relaxed">
                Esta vista de alta fidelidad se está calibrando para tu espacio de trabajo.
            </p>
            <div className="mt-8 flex justify-center gap-2">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500/20" />)}
            </div>
        </motion.div>
    </div>
);

const App = () => {
    const { user, loading, checkSession } = useAuthStore();
    const fetchTasks = useTaskStore(state => state.fetchTasks);

    // Select filtered tasks using a stable selector with useShallow
    const filteredTasks = useTaskStore(useShallow(state => {
        const { tasks, filters } = state;
        return tasks.filter(task => {
            const matchesCategory = filters.category === 'all' || task.category === filters.category;
            const matchesClient = filters.client === 'all' || task.client_name === filters.client;
            return matchesCategory && matchesClient;
        });
    }));

    const [activeTab, setActiveTab] = useState('matrix');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChaosModalOpen, setIsChaosModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    React.useEffect(() => {
        checkSession();
    }, [checkSession]);

    React.useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user, fetchTasks]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/40"
                >
                    <Zap className="text-purple-400" size={24} />
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    const navItems = [
        { id: 'matrix', icon: Compass, label: 'Mapa de Impacto' },
        { id: 'tasks', icon: CheckSquare, label: 'Panel de Tareas' },
        { id: 'timeline', icon: Clock, label: 'Timeline' },
        { id: 'calendar', icon: Calendar, label: 'Calendario' },
        { id: 'analytics', icon: PieChart, label: 'Analíticas' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'matrix': return <ImpactMatrix />;
            case 'tasks': return <TaskBoard />;
            case 'timeline': return <Timeline />;
            case 'calendar': return <CalendarView />;
            case 'analytics': return <Analytics />;
            default: return <MockView title={navItems.find(i => i.id === activeTab)?.label} />;
        }
    };

    return (
        <div className="flex h-screen w-screen bg-transparent overflow-hidden text-white font-sans selection:bg-purple-500/30 relative">
            {/* Modals */}
            <ChaosModal
                isOpen={isChaosModalOpen}
                onClose={() => setIsChaosModalOpen(false)}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
            <EditTaskModal />

            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {(isSidebarOpen || window.innerWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed lg:relative w-72 md:w-80 glass-panel border-r border-white/5 flex flex-col z-[60] h-full rounded-none m-0 bg-black/90 lg:bg-black/60`}
                    >
                        {/* Sidebar Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

                        <div className="p-8 md:p-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] ring-1 ring-white/20 relative group">
                                    <Zap className="text-white w-7 h-7 md:w-8 md:h-8 fill-white/10 transition-transform group-hover:scale-110" />
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 uppercase">
                                        Tasketter
                                    </h1>
                                    <p className="text-[10px] font-bold text-purple-400/80 uppercase tracking-[0.2em] leading-none mt-1">
                                        Estrategia v2.1
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-2 hover:bg-white/5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* User Mantra Section */}
                        <div className="px-6 mb-4">
                            <Mantra />
                        </div>

                        <nav className="flex-1 px-4 md:px-5 py-4 space-y-2 overflow-y-auto no-scrollbar">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-5 px-5 md:px-6 py-4 md:py-5 rounded-[22px] transition-all duration-400 group relative overflow-hidden ${activeTab === item.id
                                        ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {activeTab === item.id && (
                                        <motion.div
                                            layoutId="nav-glow-bar"
                                            className="absolute left-0 w-1.5 h-8 bg-purple-500 rounded-r-full shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                                        />
                                    )}
                                    <item.icon size={22} md:size={24} className={`transition-all duration-500 ${activeTab === item.id ? 'text-purple-400 scale-110' : 'group-hover:text-purple-300'}`} />
                                    <span className="font-bold tracking-tight text-sm md:text-base">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="p-6 md:p-8 border-t border-white/5 space-y-4 md:space-y-5">
                            <div className="glass-panel p-4 md:p-5 bg-purple-500/5 border-purple-500/10 hidden md:block">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />
                                    <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">Interfaz Núcleo</span>
                                </div>
                                <div className="space-y-1 font-mono text-[10px] text-gray-500 uppercase">
                                    <p className="flex justify-between"><span>Estado:</span> <span className="text-emerald-500">Nominal</span></p>
                                    <p className="flex justify-between"><span>Sinc:</span> <span>Activa</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="w-full flex items-center gap-4 px-5 md:px-6 py-3 md:py-4 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                            >
                                <Settings size={20} md:size={22} className="group-hover:rotate-90 transition-transform duration-700 ease-out" />
                                <span className="font-bold tracking-tight text-sm md:text-base">Configuración</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative z-10 w-full">
                {/* Global UI Light Leak */}
                <div className="absolute top-0 right-0 w-[80vw] h-[60vh] bg-gradient-to-bl from-purple-500/10 via-blue-500/5 to-transparent blur-[140px] -z-10 pointer-events-none" />

                <header className="h-20 md:h-28 flex items-center justify-between px-6 md:px-12 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-10">
                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-3 md:p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 group active:scale-90 lg:hidden"
                        >
                            <Menu size={24} md:size={28} className="text-gray-400 group-hover:text-white transition-colors" />
                        </button>
                        <div className="hidden lg:block">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 group active:scale-90"
                            >
                                <Menu size={28} className="text-gray-400 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 md:gap-3">
                                <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter truncate max-w-[120px] md:max-w-none">
                                    {navItems.find(i => i.id === activeTab)?.label}
                                </h2>
                                <div className="px-2 md:px-3 py-0.5 md:py-1 bg-white/5 rounded-full border border-white/10 hidden sm:block">
                                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Global</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 md:gap-5 mt-1 md:mt-2">
                                <FilterBar />
                                <div className="w-px h-3 md:h-4 bg-white/10 shrink-0" />
                                <div className="text-[10px] md:text-xs text-purple-400 font-bold flex items-center gap-1.5 md:gap-2 leading-none">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] shrink-0" />
                                    {filteredTasks.length} Nodos
                                </div>
                                <div className="w-px h-3 md:h-4 bg-white/10 shrink-0" />
                                <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate hidden sm:block">
                                    Verificado: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            onClick={() => setIsChaosModalOpen(true)}
                            className="btn-primary flex items-center gap-2 md:gap-4 text-[10px] md:text-sm px-4 md:px-10 py-2.5 md:py-4 shadow-[0_20px_50px_rgba(147,51,234,0.3)] group scale-100 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden shrink-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Zap size={16} md:size={20} className="group-hover:animate-pulse" />
                            <span className="font-extrabold tracking-[0.05em] md:tracking-widest uppercase">Crear Tarea</span>
                        </button>
                    </div>
                </header>

                <section className="flex-1 overflow-auto px-4 md:px-12 py-6 md:py-12 relative no-scrollbar w-full">
                    {/* Subtle Background Elements */}
                    <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/5 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-blue-600/5 rounded-full blur-[60px] md:blur-[100px] -z-10 pointer-events-none" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ y: 30, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -30, opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="h-full w-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
};

export default App;
