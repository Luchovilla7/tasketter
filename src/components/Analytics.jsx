import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useTaskStore } from '../store/taskStore';
import { useShallow } from 'zustand/react/shallow';
import { Zap, Target, TrendingUp, Activity } from 'lucide-react';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler
);

const Analytics = () => {
    const tasks = useTaskStore(useShallow(state => {
        const { tasks, filters } = state;
        return tasks.filter(task => {
            const matchesCategory = filters.category === 'all' || task.category === filters.category;
            const matchesClient = filters.client === 'all' || task.client_name === filters.client;
            return matchesCategory && matchesClient;
        });
    }));

    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;

    const pieData = {
        labels: ['Completadas', 'Pendientes'],
        datasets: [
            {
                data: [completed, pending],
                backgroundColor: ['hsla(142, 71%, 45%, 0.6)', 'hsla(262, 83%, 58%, 0.6)'],
                borderColor: ['hsl(142, 71%, 45%)', 'hsl(262, 83%, 58%)'],
                borderWidth: 1,
            },
        ],
    };

    const highImpactTasks = tasks.filter(t => t.impact > 70).length;
    const quickWins = tasks.filter(t => t.impact > 70 && t.effort < 40).length;

    const barData = {
        labels: ['Total', 'Gran Impacto', 'Victorias Rápidas', 'Urgentes'],
        datasets: [
            {
                label: 'Distribución de Tareas',
                data: [
                    tasks.length,
                    highImpactTasks,
                    quickWins,
                    tasks.filter(t => t.urgency).length
                ],
                backgroundColor: 'hsla(191, 91%, 54%, 0.4)',
                borderColor: 'hsl(191, 91%, 54%)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: { family: 'Outfit', size: 10, weight: 'bold' },
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                titleFont: { family: 'Outfit', size: 14, weight: '900' },
                bodyFont: { family: 'Outfit', size: 12 },
                padding: 12,
                cornerRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)'
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } }
            }
        }
    };

    const stats = [
        { label: 'Tasa de Éxito', value: tasks.length ? `${Math.round((completed / tasks.length) * 100)}%` : '0%', icon: Activity, color: 'text-emerald-400' },
        { label: 'ROI Estratégico', value: highImpactTasks, icon: Target, color: 'text-purple-400' },
        { label: 'Eficiencia', value: tasks.length ? Math.round((quickWins / tasks.length) * 100) : '0', icon: Zap, color: 'text-blue-400' },
        { label: 'Velocidad', value: `${completed} / sem`, icon: TrendingUp, color: 'text-orange-400' },
    ];

    return (
        <div className="h-full flex flex-col gap-8 md:gap-12 w-full max-w-6xl mx-auto overflow-y-auto no-scrollbar pb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 shrink-0">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-panel p-4 md:p-6 border-white/5 flex flex-col items-center text-center group hover:border-white/10 transition-colors">
                        <stat.icon className={`${stat.color} mb-3 group-hover:scale-110 transition-transform`} size={20} md:size={24} />
                        <p className="text-xl md:text-3xl font-black tabular-nums">{stat.value}</p>
                        <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1.5 md:mt-2 leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 flex-1 min-h-0">
                <div className="glass-panel p-6 md:p-10 border-white/5 flex flex-col items-center min-h-[350px] md:min-h-0">
                    <h3 className="text-base md:text-lg font-black mb-8 self-start flex items-center gap-3 uppercase tracking-tighter">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        Estado de Ejecución
                    </h3>
                    <div className="w-full flex-1 relative h-[250px] md:h-full">
                        <Pie data={pieData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass-panel p-6 md:p-10 border-white/5 min-h-[350px] md:min-h-0">
                    <h3 className="text-base md:text-lg font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        Carga Estratégica
                    </h3>
                    <div className="w-full h-[250px] md:h-full">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
