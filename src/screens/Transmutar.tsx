import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, DailyGoal } from '../context/UserContext';
import { Plus, Trash2, Check, Target } from 'lucide-react';
import clsx from 'clsx';

// Helper component for Goal Item
interface GoalItemProps {
  goal: DailyGoal;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  levelColor: string;
}

const GoalItem: React.FC<GoalItemProps> = ({ 
  goal, 
  onToggle, 
  onRemove, 
  levelColor 
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    className={clsx(
      "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none relative overflow-hidden",
      goal.completed 
        ? "bg-white/5 border-white/5 opacity-60" 
        : "bg-white/5 border-white/10 hover:border-white/20"
    )}
    onClick={() => onToggle(goal.id)}
  >
    {/* Checkbox */}
    <div 
      className={clsx(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
        goal.completed ? "bg-transparent border-current" : "border-white/20 group-hover:border-white/40"
      )}
      style={{ borderColor: goal.completed ? levelColor : undefined }}
    >
      {goal.completed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check size={14} style={{ color: levelColor }} strokeWidth={3} />
        </motion.div>
      )}
    </div>

    {/* Text */}
    <span className={clsx(
      "flex-1 text-sm font-medium transition-all duration-300",
      goal.completed ? "text-white/30 line-through decoration-white/10" : "text-white/90"
    )}>
      {goal.text}
    </span>

    {/* Delete Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove(goal.id);
      }}
      className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
    >
      <Trash2 size={16} />
    </button>

    {/* Completion Glow Effect */}
    {goal.completed && (
      <motion.div
        layoutId={`glow-${goal.id}`}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        style={{ backgroundColor: levelColor }}
      />
    )}
  </motion.div>
);

export const Transmutar: React.FC = () => {
  const { 
    user, 
    toggleDailyGoal, 
    addDailyGoal, 
    removeDailyGoal, 
    toggleMonthlyGoal,
    addMonthlyGoal,
    removeMonthlyGoal,
    levelColor 
  } = useUser();
  
  const [newDailyGoalText, setNewDailyGoalText] = useState('');
  const [newMonthlyGoalText, setNewMonthlyGoalText] = useState('');

  const handleAddDailyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDailyGoalText.trim()) {
      addDailyGoal(newDailyGoalText.trim());
      setNewDailyGoalText('');
    }
  };

  const handleAddMonthlyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMonthlyGoalText.trim()) {
      addMonthlyGoal(newMonthlyGoalText.trim());
      setNewMonthlyGoalText('');
    }
  };

  const completedCount = user.dailyGoals.filter(g => g.completed).length;
  const totalCount = user.dailyGoals.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto pt-8 pb-20">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white">Transmutar</h2>
        <p className="text-white/50 text-sm">Converta intenção em realidade.</p>
      </motion.div>

      {/* Monthly Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white/70 mb-2">
          <Target size={20} className="text-gold" style={{ color: levelColor }} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Metas Mensais</h3>
        </div>
        
        <form onSubmit={handleAddMonthlyGoal} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newMonthlyGoalText}
            onChange={(e) => setNewMonthlyGoalText(e.target.value)}
            placeholder="Nova meta mensal..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
          />
          <button 
            type="submit"
            disabled={!newMonthlyGoalText.trim()}
            className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {(user.monthlyGoals || []).map((goal) => (
              <GoalItem 
                key={goal.id} 
                goal={goal} 
                onToggle={toggleMonthlyGoal} 
                onRemove={removeMonthlyGoal}
                levelColor={levelColor}
              />
            ))}
          </AnimatePresence>
          
          {(!user.monthlyGoals || user.monthlyGoals.length === 0) && (
            <div className="text-center py-6 text-white/20 text-sm italic border border-dashed border-white/10 rounded-xl">
              Nenhuma meta mensal definida.
            </div>
          )}
        </div>
      </div>

      {/* Energy Bar */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/40">
          <span>Energia Transmutada (Diária)</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="h-full relative"
            style={{ backgroundColor: levelColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* Daily Goals Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Metas Diárias</h3>
        
        <form onSubmit={handleAddDailyGoal} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newDailyGoalText}
            onChange={(e) => setNewDailyGoalText(e.target.value)}
            placeholder="Nova meta diária..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
          />
          <button 
            type="submit"
            disabled={!newDailyGoalText.trim()}
            className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {user.dailyGoals.map((goal) => (
              <GoalItem 
                key={goal.id} 
                goal={goal} 
                onToggle={toggleDailyGoal} 
                onRemove={removeDailyGoal}
                levelColor={levelColor}
              />
            ))}
          </AnimatePresence>
          
          {user.dailyGoals.length === 0 && (
            <div className="text-center py-12 text-white/20 text-sm italic">
              Nenhuma meta diária definida para hoje.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
