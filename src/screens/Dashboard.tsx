import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useUser, LEVEL_DATA } from '../context/UserContext';
import { LevelIcon } from '../components/LevelIcon';
import clsx from 'clsx';

export const Dashboard: React.FC = () => {
  const { daysCount, currentLevel, nextLevel, daysToNextLevel, progressToNextLevel, levelColor } = useUser();
  
  // Animated Counter
  const countSpring = useSpring(0, { stiffness: 50, damping: 20 });
  const displayCount = useTransform(countSpring, (latest) => Math.floor(latest));

  useEffect(() => {
    countSpring.set(daysCount);
  }, [daysCount, countSpring]);

  // Find current level index
  const currentLevelIndex = LEVEL_DATA.findIndex(l => l.name === currentLevel);
  const currentBenefit = LEVEL_DATA[currentLevelIndex]?.benefit;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 w-full max-w-md mx-auto">
      
      {/* Level Badge */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-2"
      >
        <LevelIcon level={currentLevel} color={levelColor} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: levelColor }}>
          Nível {currentLevel}
        </span>
      </motion.div>

      {/* Main Counter */}
      <div className="relative flex flex-col items-center">
        <motion.div 
          className="text-[8rem] font-bold leading-none tracking-tighter tabular-nums relative z-10"
          style={{ 
            color: levelColor,
            textShadow: `0 0 40px ${levelColor}40`
          }}
        >
          <motion.span>{displayCount}</motion.span>
        </motion.div>
        <span className="text-white/40 font-medium tracking-[0.2em] text-sm mt-[-10px]">DIAS TOTAIS</span>
        
        {/* Background Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] -z-10 opacity-40"
          style={{ backgroundColor: levelColor }}
        />
      </div>

      {/* Progress Section */}
      <div className="w-full space-y-4">
        <div className="flex justify-between text-xs font-medium text-white/50 uppercase tracking-wider">
          <span>Progresso</span>
          <span>{nextLevel ? `Próximo: ${nextLevel}` : 'Máximo'}</span>
        </div>
        
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full relative"
            style={{ backgroundColor: levelColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        {/* Benefits Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden group"
        >
          {/* Card Glow Effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(circle at center, ${levelColor}, transparent 70%)` }}
          />
          
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
                <LevelIcon level={currentLevel} color={levelColor} size={14} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">
                Benefícios do Nível
              </h3>
            </div>
            
            <p className="text-sm text-white/70 leading-relaxed font-light">
              {currentBenefit}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Evolution Bar */}
      <div className="w-full pt-8 border-t border-white/5 mt-4">
        <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-6 text-center">Evolução</h3>
        <div className="flex justify-between items-center relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -z-10" />
          
          {LEVEL_DATA.map((level, index) => {
            const isUnlocked = index <= currentLevelIndex;
            const isCurrent = index === currentLevelIndex;
            
            return (
              <div key={level.name} className="flex flex-col items-center gap-2">
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isCurrent ? 1.2 : 1,
                    backgroundColor: isUnlocked ? level.color : '#1A1A1A',
                    borderColor: isUnlocked ? level.color : '#333'
                  }}
                  className={clsx(
                    "w-3 h-3 rounded-full border-2 relative z-10 transition-colors duration-500",
                    isCurrent && "shadow-[0_0_15px_currentColor]"
                  )}
                />
                {isCurrent && (
                  <motion.div 
                    layoutId="current-level-indicator"
                    className="absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: level.color }}
                  >
                    {level.name}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
