import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const login = useAuthStore(state => state.login);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError('Credenciales inválidas. Verifica tu email y contraseña.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 md:p-12 glass-panel border-white/5 bg-black/40 z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6">
                        <Zap className="text-white w-8 h-8 fill-white/10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">Tasketter</h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Estrategia & Foco</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@tasketter.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-xs font-bold text-center uppercase tracking-wider"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_20px_40px_rgba(147,51,234,0.2)]"
                    >
                        {isLoggingIn ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                <span className="uppercase tracking-widest font-black">Iniciar Sesión</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-6 border-t border-white/5 text-center px-4">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Acceso restringido a terminales autorizadas.<br />Contacta con el administrador para credenciales.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
