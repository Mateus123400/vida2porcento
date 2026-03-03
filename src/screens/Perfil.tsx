import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, LEVEL_DATA } from '../context/UserContext';
import { LevelIcon } from '../components/LevelIcon';
import { User, Edit2, Check, X, LogOut } from 'lucide-react';
import clsx from 'clsx';

export const Perfil: React.FC = () => {
  const { user, updateUser, daysCount, currentLevel, levelColor, signOut } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  const handleSave = () => {
    if (tempName.trim()) {
      updateUser({ name: tempName.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(user.name);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto pt-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white">Perfil</h2>
        <p className="text-white/50 text-sm">Sua identidade na jornada.</p>
      </motion.div>

      {/* Profile Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center gap-6 relative overflow-hidden">
        {/* Background Glow */}
        <div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ background: `linear-gradient(90deg, transparent, ${levelColor}, transparent)` }}
        />

        {/* Avatar / Icon */}
        <div className="w-24 h-24 rounded-full bg-black border-2 flex items-center justify-center relative shadow-2xl" style={{ borderColor: levelColor }}>
          <User size={40} className="text-white/80" />
          <div className="absolute inset-0 rounded-full border border-white/10" />

          {/* Level Badge */}
          <div className="absolute -bottom-2 bg-[#1A1A1A] px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-lg">
            <LevelIcon level={currentLevel} color={levelColor} size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">{currentLevel}</span>
          </div>
        </div>

        {/* Name Editing */}
        <div className="w-full flex flex-col items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full max-w-[200px]">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-white/40 transition-colors"
                autoFocus
              />
              <button onClick={handleSave} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
              <h3 className="text-2xl font-bold text-white group-hover:text-white/80 transition-colors">{user.name}</h3>
              <Edit2 size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          )}
          <p className="text-white/40 text-sm font-mono">{daysCount} Dias Acumulados</p>
        </div>
      </div>

      {/* Levels Unlocked */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Conquistas</h3>

        <div className="grid grid-cols-1 gap-3">
          {LEVEL_DATA.map((level) => {
            const isUnlocked = daysCount >= level.days;

            return (
              <div
                key={level.name}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                  isUnlocked
                    ? "bg-white/5 border-white/10"
                    : "bg-transparent border-white/5 opacity-40 grayscale"
                )}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 border border-white/10 shadow-inner"
                  style={{ borderColor: isUnlocked ? level.color : undefined }}
                >
                  <LevelIcon level={level.name} color={isUnlocked ? level.color : '#666'} size={16} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-white">{level.name}</span>
                    <span className="text-[10px] font-mono text-white/40">{level.days} dias</span>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-1">{level.benefit}</p>
                </div>

                {isUnlocked && (
                  <div className="text-green-400">
                    <Check size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="pt-8 pb-4 border-t border-white/5 mt-4">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium border border-red-500/10"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>

    </div>
  );
};
