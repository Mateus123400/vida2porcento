import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUser, LEVEL_DATA } from '../context/UserContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import { TrendingUp, Award, Calendar, Activity, Check } from 'lucide-react';

export const Resultados: React.FC = () => {
  const { user, daysCount, currentLevel, levelColor } = useUser();

  // Generate chart data
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // If we have history, use it. Otherwise, simulate a simple progression for the demo
    // In a real app, we'd store daily snapshots.
    // Here we'll just show the last 7 days leading up to current count
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      // Simple simulation: assuming linear progress for visualization if no real history
      const simulatedCount = Math.max(0, daysCount - i);
      
      data.push({
        name: format(date, 'dd/MM'),
        days: simulatedCount,
        fullDate: format(date, "d 'de' MMMM", { locale: ptBR }),
      });
    }
    return data;
  }, [daysCount]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-white/60 text-xs mb-1">{label}</p>
          <p className="text-white font-bold text-sm" style={{ color: levelColor }}>
            {payload[0].value} Dias
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto pt-8 pb-20">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white">Resultados</h2>
        <p className="text-white/50 text-sm">Análise de sua evolução.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-center">
          <div className="p-2 bg-white/5 rounded-full text-white/50 mb-1">
            <Calendar size={20} />
          </div>
          <span className="text-3xl font-bold tabular-nums text-white">{daysCount}</span>
          <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Dias Totais</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-center">
          <div className="p-2 bg-white/5 rounded-full text-white/50 mb-1">
            <Award size={20} style={{ color: levelColor }} />
          </div>
          <span className="text-lg font-bold text-white truncate w-full px-2">{currentLevel}</span>
          <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Nível Atual</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-64 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-white/70">
            <Activity size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Progresso Recente</h3>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={levelColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={levelColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 10 }} 
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
            <Area 
              type="monotone" 
              dataKey="days" 
              stroke={levelColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorDays)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Level History Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/70 px-2">
          <TrendingUp size={16} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Linha do Tempo</h3>
        </div>

        <div className="relative pl-4 border-l border-white/10 space-y-8 ml-2">
          {LEVEL_DATA.map((level, index) => {
            const isUnlocked = daysCount >= level.days;
            const isNext = !isUnlocked && (index === 0 || daysCount >= LEVEL_DATA[index - 1].days);
            
            return (
              <div key={level.name} className={clsx("relative pl-6 transition-opacity duration-500", isUnlocked || isNext ? "opacity-100" : "opacity-30")}>
                {/* Dot */}
                <div 
                  className={clsx(
                    "absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 transition-colors duration-500",
                    isUnlocked ? "bg-black" : "bg-black border-white/20"
                  )}
                  style={{ borderColor: isUnlocked ? level.color : undefined, backgroundColor: isUnlocked ? level.color : undefined }}
                />
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-white" style={{ color: isUnlocked ? level.color : undefined }}>
                    {level.name}
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {level.days} dias necessários
                  </span>
                  {isUnlocked && (
                    <span className="text-[10px] text-green-400/80 uppercase tracking-wider font-bold mt-1 flex items-center gap-1">
                      <Check size={10} /> Conquistado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
