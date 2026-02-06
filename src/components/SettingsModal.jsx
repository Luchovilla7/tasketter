import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, User, Shield, Trash2, Github, ExternalLink, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';

const SettingsModal = ({ isOpen, onClose }) => {
    const { user, logout } = useAuthStore();
    const tasks = useTaskStore(state => state.tasks);

    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            await logout();
            onClose();
        }
    };

    const handleClearData = () => {
        if (window.confirm('¡ATENCIÓN! Esto borrará todas tus tareas de la base de datos de forma permanente. ¿Proceder?')) {
            // Logic to clear tasks from Supabase would go here
            alert('Funcionalidad de borrado masivo protegida por seguridad. Contacta al soporte para limpieza de cuenta.');
        }
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
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[70]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg glass-panel bg-black/40 border-l border-white/5 p-8 md:p-12 z-[80] rounded-none overflow-y-auto no-scrollbar"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                <Shield className="text-purple-500" />
                                Configuración
                            </h2>
                            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all active:scale-90">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-10">
                            {/* Profile Section */}
                            <section className="space-y-6">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Perfil de Usuario</h3>
                                <div className="glass-panel p-6 bg-white/5 border-white/5 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl">
                                        <User className="text-white" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 mb-1">Conectado como:</p>
                                        <p className="text-white font-black truncate max-w-[200px]">{user?.email}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Account Stats */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Estadísticas del Nodo</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-panel p-4 bg-white/5 border-white/5">
                                        <p className="text-2xl font-black text-purple-400">{tasks.length}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Tareas Totales</p>
                                    </div>
                                    <div className="glass-panel p-4 bg-white/5 border-white/5">
                                        <p className="text-2xl font-black text-emerald-400">{tasks.filter(t => t.completed).length}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Completadas</p>
                                    </div>
                                </div>
                            </section>

                            {/* Actions Section */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Gestión de Datos</h3>
                                <button
                                    onClick={handleClearData}
                                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <Trash2 className="text-red-500" size={20} />
                                        <span className="font-bold text-sm text-gray-300 group-hover:text-white">Borrar todos los datos</span>
                                    </div>
                                    <ExternalLink size={16} className="text-gray-600" />
                                </button>
                            </section>

                            {/* Support & Links */}
                            <section className="pt-10 border-t border-white/5 space-y-6">
                                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    <span>Versión CLI</span>
                                    <span className="text-purple-500">v2.1.0-Stable</span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-400 transition-all active:scale-[0.98] font-black uppercase tracking-widest text-sm shadow-lg"
                                >
                                    <LogOut size={20} />
                                    Cerrar Sesión Premium
                                </button>
                            </section>

                            <div className="text-center pt-8">
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                                    <Zap size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tasketter Engine</span>
                                </div>
                                <p className="text-gray-700 text-[10px] uppercase font-bold tracking-[0.3em]">Built for Strategic Thinkers</p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
