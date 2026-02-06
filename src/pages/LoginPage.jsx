import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, LogIn, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, signUp } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');
        setSuccess('');

        try {
            if (isLoginMode) {
                await login(email, password);
            } else {
                await signUp(email, password);
                setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
                setIsLoginMode(true);
            }
        } catch (err) {
            setError(err.message || 'Ocurrió un error. Verifica tus datos.');
        } finally {
            setIsProcessing(false);
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
                    <motion.div
                        key={isLoginMode ? 'login-icon' : 'register-icon'}
                        initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6"
                    >
                        {isLoginMode ? <Zap className="text-white w-8 h-8 fill-white/10" /> : <UserPlus className="text-white w-8 h-8" />}
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">Tasketter</h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                        {isLoginMode ? 'Estrategia & Foco' : 'Crear Nueva Cuenta'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-500 text-xs font-bold text-center uppercase tracking-wider"
                            >
                                {error}
                            </motion.p>
                        )}
                        {success && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-emerald-500 text-xs font-bold text-center uppercase tracking-wider underline underline-offset-4"
                            >
                                {success}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_20px_40px_rgba(147,51,234,0.2)]"
                    >
                        {isProcessing ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLoginMode ? <LogIn size={20} /> : <UserPlus size={20} />}
                                <span className="uppercase tracking-widest font-black">
                                    {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
                                </span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError('');
                            setSuccess('');
                        }}
                        className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLoginMode ? (
                            <>¿No tienes cuenta? <span className="text-purple-400">Regístrate</span></>
                        ) : (
                            <>¿Ya tienes cuenta? <span className="text-purple-400">Inicia Sesión</span></>
                        )}
                    </button>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 text-center px-4">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        {isLoginMode
                            ? 'Acceso restringido a terminales autorizadas.'
                            : 'Al registrarte, aceptas los protocolos de Tasketter.'}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
