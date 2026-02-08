import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Zap,
    Clock,
    CheckSquare,
    AlertCircle
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useShallow } from 'zustand/react/shallow';

const CalendarView = () => {
    // Select only filtered tasks with useShallow
    const tasks = useTaskStore(useShallow(state => {
        const { tasks, filters } = state;
        return tasks.filter(task => {
            const matchesCategory = filters.category === 'all' || task.category === filters.category;
            const matchesClient = filters.client === 'all' || task.client_name === filters.client;
            return matchesCategory && matchesClient;
        });
    }));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Normalize date for comparison
    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr.includes('T')) return new Date(dateStr); // For created_at strings
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // Month is 0-indexed in JS
    };

    const getTasksForDay = (day) => {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday...
        const dayOfMonth = date.getDate();

        return tasks.filter(task => {
            const taskDate = task.target_date ? parseLocalDate(task.target_date) : new Date(task.created_at);

            // 1. Direct match (Scheduled for this specific day)
            if (isSameDay(taskDate, date)) return true;

            // 2. Recurrence Logic (Only if the task start date is before or equal to the calendar date)
            const taskStart = new Date(taskDate.setHours(0, 0, 0, 0));
            const currentCalDate = new Date(date.setHours(0, 0, 0, 0));

            if (currentCalDate < taskStart) return false;

            if (task.recurrence === 'daily') return true;

            if (task.recurrence === 'weekdays') {
                return dayOfWeek >= 1 && dayOfWeek <= 5;
            }

            if (task.recurrence === 'weekly') {
                return dayOfWeek === taskDate.getDay();
            }

            if (task.recurrence === 'monthly') {
                return dayOfMonth === taskDate.getDate();
            }

            return false;
        });
    };

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        calendarDays.push(i);
    }

    return (
        <div className="h-full flex flex-col w-full max-w-6xl mx-auto pt-4 md:pt-8 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-4">
                        <CalendarIcon className="text-purple-500" size={32} />
                        Planificador Maestro
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em]">Gestión temporal de alto rendimiento</p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 self-start md:self-center">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="min-w-[140px] text-center">
                        <span className="text-sm md:text-lg font-black uppercase tracking-widest text-white">
                            {monthNames[month]} {year}
                        </span>
                    </div>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 pb-10">
                {/* Calendar Grid */}
                <div className="flex-[3] glass-panel border-white/5 bg-black/40 p-1 md:p-2">
                    <div className="grid grid-cols-7 border-b border-white/5">
                        {weekDays.map(day => (
                            <div key={day} className="py-4 text-center">
                                <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest">{day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, idx) => {
                            if (day === null) return <div key={`empty-${idx}`} className="h-20 md:h-32 border-b border-r border-white/5 last:border-r-0" />;

                            const dayTasks = getTasksForDay(day);
                            const isToday = isSameDay(new Date(), new Date(year, month, day));
                            const isSelected = selectedDate && isSameDay(selectedDate, new Date(year, month, day));

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={`h-24 md:h-32 p-2 border-b border-r border-white/5 last:border-r-0 transition-all text-left relative group hover:bg-white/[0.02] ${isSelected ? 'bg-purple-500/10' : ''
                                        }`}
                                >
                                    <span className={`text-xs md:text-sm font-black ${isToday ? 'text-purple-400 bg-purple-500/20 px-2 py-1 rounded-md' : 'text-gray-500'
                                        }`}>
                                        {day}
                                    </span>

                                    <div className="mt-2 space-y-1">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <div
                                                key={task.id}
                                                className={`h-1.5 md:h-2 rounded-full ${task.completed ? 'bg-emerald-500/40' : task.urgency ? 'bg-red-500/60' : 'bg-purple-500/60'
                                                    }`}
                                            />
                                        ))}
                                        {dayTasks.length > 3 && (
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">
                                                +{dayTasks.length - 3} más
                                            </p>
                                        )}
                                    </div>

                                    {isSelected && (
                                        <motion.div
                                            layoutId="activeDay"
                                            className="absolute inset-x-0 bottom-0 h-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Side Detail Panel */}
                <div className="flex-1 space-y-6">
                    <div className="glass-panel p-6 border-purple-500/20 bg-purple-500/5">
                        <h4 className="text-xs font-black text-purple-400 uppercase tracking-[.3em] mb-4">
                            Detalles del Día
                        </h4>
                        <div className="space-y-4">
                            {!selectedDate ? (
                                <div className="text-center py-10 opacity-30">
                                    <Clock className="mx-auto mb-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Selecciona un día</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-end gap-2 mb-6">
                                        <span className="text-4xl font-black text-white">{selectedDate.getDate()}</span>
                                        <span className="text-sm font-bold text-gray-500 uppercase pb-1">{monthNames[selectedDate.getMonth()]}</span>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                                        {getTasksForDay(selectedDate.getDate()).length === 0 ? (
                                            <p className="text-xs text-gray-600 font-medium italic">Sin operaciones programadas.</p>
                                        ) : (
                                            getTasksForDay(selectedDate.getDate()).map(task => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={task.id}
                                                    className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3"
                                                >
                                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${task.completed ? 'bg-emerald-500' : task.urgency ? 'bg-red-500' : 'bg-purple-500'
                                                        }`} />
                                                    <div>
                                                        <p className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-gray-600' : 'text-gray-100'}`}>
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5 opacity-50">
                                                            <Zap size={10} className="text-purple-400" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest">Impacto: {task.impact}%</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Integration */}
                    <div className="glass-panel p-6 bg-emerald-500/5 border-emerald-500/10">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckSquare className="text-emerald-500" size={16} />
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mensual</h4>
                        </div>
                        <p className="text-xl font-black text-white">
                            {tasks.filter(t => t.completed && new Date(t.created_at).getMonth() === month).length}
                        </p>
                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">Metas Alcanzadas</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
