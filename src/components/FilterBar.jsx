import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, User, Briefcase, ChevronDown, X } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useShallow } from 'zustand/react/shallow';

const FilterBar = () => {
    const filters = useTaskStore(state => state.filters);
    const setFilters = useTaskStore(state => state.setFilters);

    const clients = useTaskStore(useShallow(state => {
        const tasksWithClients = state.tasks.filter(t => t.client_name);
        return [...new Set(tasksWithClients.map(t => t.client_name))];
    }));

    const activeFilterCount = (filters.category !== 'all' ? 1 : 0) + (filters.client !== 'all' ? 1 : 0);

    const clearFilters = () => {
        setFilters({ category: 'all', client: 'all' });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <Filter size={14} className="text-gray-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filtros</span>
            </div>

            {/* Category Filter */}
            <div className="relative group">
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ category: e.target.value })}
                    className="appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-1.5 text-xs font-bold text-gray-300 focus:outline-none focus:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer pr-8"
                >
                    <option value="all">Todas las Categorías</option>
                    <option value="own">Propias / Internas</option>
                    <option value="client">Para Clientes</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <ChevronDown size={12} />
                </div>
            </div>

            {/* Client Filter */}
            <AnimatePresence>
                {(filters.category === 'all' || filters.category === 'client') && clients.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative group"
                    >
                        <select
                            value={filters.client}
                            onChange={(e) => setFilters({ client: e.target.value })}
                            className="appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-1.5 text-xs font-bold text-gray-300 focus:outline-none focus:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer pr-8"
                        >
                            <option value="all">Todos los Clientes</option>
                            {clients.map(client => (
                                <option key={client} value={client}>{client}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <ChevronDown size={12} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clear Button */}
            {activeFilterCount > 0 && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="p-1.5 md:p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2"
                >
                    <X size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Limpiar</span>
                </motion.button>
            )}
        </div>
    );
};

export default FilterBar;
