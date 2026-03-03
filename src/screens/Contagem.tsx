import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, RefreshCw, AlertTriangle, Play, Edit2, Check, Save } from 'lucide-react';
import clsx from 'clsx';

export const Contagem: React.FC = () => {
  const { user, updateUser, startJourney, resetProgress, daysCount, levelColor } = useUser();
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Local state for inputs
  const [manualInput, setManualInput] = useState(user.manualDays.toString());
  const [dateInput, setDateInput] = useState(() => {
    return user.startDate 
      ? format(new Date(user.startDate), 'yyyy-MM-dd') 
      : format(new Date(), 'yyyy-MM-dd');
  });

  // Editing states
  const [isEditingDate, setIsEditingDate] = useState(!user.isRunning);
  const [isEditingManual, setIsEditingManual] = useState(!user.isRunning);

  // Sync local state when user context changes (if not editing)
  useEffect(() => {
    if (!isEditingManual) {
      setManualInput(user.manualDays.toString());
    }
  }, [user.manualDays, isEditingManual]);

  const handleModeChange = (mode: 'auto' | 'manual') => {
    updateUser({ mode });
    // Reset editing states when switching modes for better UX
    if (mode === 'auto') {
      setIsEditingDate(!user.isRunning);
    } else {
      setIsEditingManual(true);
    }
  };

  // Automatic Mode Handlers
  const handleDateConfirm = () => {
    const date = new Date(dateInput);
    // If not running, this starts it. If running, it updates the date.
    if (!user.isRunning) {
      startJourney(date.toISOString());
    } else {
      updateUser({ startDate: date.toISOString() });
    }
    setIsEditingDate(false);
  };

  // Manual Mode Handlers
  const handleManualConfirm = () => {
    const val = parseInt(manualInput) || 0;
    updateUser({ manualDays: val });
    
    // If not running, start it (manual mode doesn't really need a start date, but we set isRunning to true)
    if (!user.isRunning) {
      updateUser({ isRunning: true });
    }
    setIsEditingManual(false);
  };

  const handleReset = () => {
    resetProgress();
    setShowResetModal(false);
    setIsEditingDate(true);
    setIsEditingManual(true);
    setManualInput('0');
    setDateInput(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto pt-8 pb-20">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white">Contagem</h2>
        <p className="text-white/50 text-sm">Gerencie seu progresso temporal.</p>
      </motion.div>

      {/* Mode Selection */}
      <div className="space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-bold ml-2">Modo de Contagem</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleModeChange('auto')}
            className={clsx(
              "p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden",
              user.mode === 'auto' 
                ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                : "bg-transparent border-white/5 text-white/30 hover:bg-white/5"
            )}
          >
            <span className="text-sm font-bold">Automático</span>
            <span className="text-[10px] opacity-60">Por Data</span>
            {user.mode === 'auto' && (
              <motion.div layoutId="active-mode" className="absolute inset-0 border-2 border-white/20 rounded-2xl" />
            )}
          </button>

          <button
            onClick={() => handleModeChange('manual')}
            className={clsx(
              "p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden",
              user.mode === 'manual' 
                ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                : "bg-transparent border-white/5 text-white/30 hover:bg-white/5"
            )}
          >
            <span className="text-sm font-bold">Manual</span>
            <span className="text-[10px] opacity-60">Inserção Direta</span>
            {user.mode === 'manual' && (
              <motion.div layoutId="active-mode" className="absolute inset-0 border-2 border-white/20 rounded-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* AUTOMATIC MODE CARD */}
      <AnimatePresence mode="wait">
        {user.mode === 'auto' && (
          <motion.div
            key="auto-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-white/70">
                    <Calendar size={20} />
                  </div>
                  <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Data de Início</span>
                </div>
                
                {!isEditingDate && (
                  <button 
                    onClick={() => setIsEditingDate(true)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {isEditingDate ? (
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <input 
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-white/30 transition-colors appearance-none"
                      style={{ colorScheme: 'dark' }}
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={20} />
                  </div>
                  <button
                    onClick={handleDateConfirm}
                    className="w-full py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-bold flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg"
                  >
                    <Check size={16} />
                    {user.isRunning ? 'Salvar Data' : 'Confirmar e Iniciar'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-mono text-white">
                    {user.startDate 
                      ? format(new Date(user.startDate), "dd 'de' MMMM, yyyy", { locale: ptBR })
                      : '----'}
                  </p>
                  <p className="text-xs text-white/30">
                    {user.startDate ? format(new Date(user.startDate), "EEEE", { locale: ptBR }) : ''}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* MANUAL MODE CARD */}
        {user.mode === 'manual' && (
          <motion.div
            key="manual-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Dias Totais</span>
                {!isEditingManual && (
                  <button 
                    onClick={() => setIsEditingManual(true)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {isEditingManual ? (
                <div className="flex flex-col gap-4">
                  <input
                    type="number"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Ex: 7"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xl focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    onClick={handleManualConfirm}
                    className="w-full py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-bold flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg"
                  >
                    <Check size={16} />
                    {user.isRunning ? 'Salvar Dias' : 'Confirmar e Iniciar'}
                  </button>
                </div>
              ) : (
                <p className="text-2xl font-mono text-white">
                  {user.manualDays} dias
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Streak Display (Always visible if running) */}
      {user.isRunning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Sequência Atual</p>
          <div className="text-7xl font-bold tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ color: levelColor }}>
            {daysCount}
          </div>
        </motion.div>
      )}

      {/* Reset Button (Only if running) */}
      {user.isRunning && (
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
        >
          <RefreshCw size={16} />
          Resetar Contador
        </button>
      )}

      {/* Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Reiniciar Jornada?</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Tem certeza que deseja reiniciar sua contagem? Seu histórico de níveis será salvo, mas sua sequência atual voltará a zero.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReset}
                    className="py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium text-sm shadow-lg shadow-red-500/20"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
