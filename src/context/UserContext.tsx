import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { differenceInDays, startOfDay } from 'date-fns';
import { supabase, isRecoveryInitial } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

// --- Types ---

export type Level = 'Iniciado' | 'Bronze' | 'Prata' | 'Ouro' | 'Diamante' | 'Esmeralda' | 'Superconsciência';

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserState {
  profileId?: string;
  name: string;
  startDate: string | null; // ISO string
  manualDays: number;
  mode: 'auto' | 'manual';
  isRunning: boolean;
  monthlyGoals: DailyGoal[];
  dailyGoals: DailyGoal[];
  history: { date: string; level: Level; days: number }[];
}

interface UserContextType {
  user: UserState;
  session: Session | null;
  loadingAuth: boolean;
  daysCount: number;
  currentLevel: Level;
  nextLevel: Level | null;
  daysToNextLevel: number;
  progressToNextLevel: number; // 0-100
  levelColor: string;
  updateUser: (updates: Partial<UserState>) => void;
  startJourney: (date: string) => void;
  resetProgress: () => void;
  toggleDailyGoal: (id: string) => void;
  addDailyGoal: (text: string) => void;
  removeDailyGoal: (id: string) => void;
  toggleMonthlyGoal: (id: string) => void;
  addMonthlyGoal: (text: string) => void;
  removeMonthlyGoal: (id: string) => void;
  signOut: () => Promise<void>;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (val: boolean) => void;
}

// --- Constants ---

const LEVELS: { name: Level; days: number; color: string; benefit: string }[] = [
  { name: 'Iniciado', days: 0, color: '#94A3B8', benefit: 'O Despertar.' },
  { name: 'Bronze', days: 7, color: '#CD7F32', benefit: 'Pico de Testosterona.' },
  { name: 'Prata', days: 15, color: '#C0C0C0', benefit: 'Magnetismo Inicial.' },
  { name: 'Ouro', days: 30, color: '#D4AF37', benefit: 'Disciplina de Ferro.' },
  { name: 'Diamante', days: 60, color: '#B9F2FF', benefit: 'Estoicismo e Presença.' },
  { name: 'Esmeralda', days: 120, color: '#50C878', benefit: 'Transmutação Profunda.' },
  { name: 'Superconsciência', days: 200, color: '#FFFFFF', benefit: 'Iluminação e Autodomínio.' },
];

const DEFAULT_USER: UserState = {
  name: 'Guerreiro',
  startDate: new Date().toISOString(),
  manualDays: 0,
  mode: 'auto',
  isRunning: false,
  monthlyGoals: [],
  dailyGoals: [],
  history: [],
};

// --- Context ---

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(isRecoveryInitial);

  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('vida2_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      setSession(session);
      if (!session) {
        setUser(DEFAULT_USER);
        localStorage.removeItem('vida2_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync Logic based on Auth Session
  useEffect(() => {
    const initSupabase = async () => {
      if (!session) return; // Wait until logged in

      const authUserId = session.user.id;
      const emailName = session.user.email?.split('@')[0] || 'Guerreiro';

      let profileId = user.profileId;

      // Check existing profile by auth
      const { data: existingProfile } = await supabase.from('profiles').select('*').eq('auth_id', authUserId).single();

      let p = existingProfile;

      if (!p) {
        // Create new profile mapped to Auth
        const { data, error } = await supabase.from('profiles').insert([{
          auth_id: authUserId,
          name: emailName,
          start_date: DEFAULT_USER.startDate,
          manual_days: DEFAULT_USER.manualDays,
          mode: DEFAULT_USER.mode,
          is_running: DEFAULT_USER.isRunning,
        }]).select().single();

        if (data && !error) {
          p = data;
          profileId = data.id;
        }
      } else {
        profileId = p.id;
      }

      if (profileId && p) {
        // Fetch goals and evolutions
        const [goalsRes, evolutionsRes] = await Promise.all([
          supabase.from('goals').select('*').eq('profile_id', profileId),
          supabase.from('evolutions').select('*').eq('profile_id', profileId)
        ]);

        const goals = goalsRes.data || [];
        const evols = evolutionsRes.data || [];

        const newState: UserState = {
          profileId,
          name: p.name,
          startDate: p.start_date,
          manualDays: p.manual_days,
          mode: p.mode,
          isRunning: p.is_running,
          monthlyGoals: goals.filter(g => g.type === 'monthly').map(g => ({ id: g.id, text: g.text, completed: g.completed })),
          dailyGoals: goals.filter(g => g.type === 'daily').map(g => ({ id: g.id, text: g.text, completed: g.completed })),
          history: evols.map(e => ({ date: e.date, level: e.level as Level, days: e.days }))
        };

        setUser(newState);
        localStorage.setItem('vida2_user', JSON.stringify(newState));
      }
    };

    if (!loadingAuth) {
      initSupabase();
    }
  }, [session, loadingAuth]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('vida2_user', JSON.stringify(user));
    }
  }, [user, session]);

  // Calculate Days
  const daysCount = !user.isRunning
    ? 0
    : user.mode === 'manual'
      ? user.manualDays
      : user.startDate
        ? differenceInDays(startOfDay(new Date()), startOfDay(new Date(user.startDate)))
        : 0;

  // Calculate Level
  let currentLevelObj = LEVELS[0];
  let nextLevelObj = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (daysCount >= LEVELS[i].days) {
      currentLevelObj = LEVELS[i];
      nextLevelObj = LEVELS[i + 1] || null;
    }
  }

  const currentLevel = currentLevelObj.name;
  const nextLevel = nextLevelObj ? nextLevelObj.name : null;
  const levelColor = currentLevelObj.color;

  // Calculate Progress
  let daysToNextLevel = 0;
  let progressToNextLevel = 100;

  if (nextLevelObj) {
    const daysInCurrentLevel = daysCount - currentLevelObj.days;
    const totalDaysNeeded = nextLevelObj.days - currentLevelObj.days;
    daysToNextLevel = nextLevelObj.days - daysCount;
    progressToNextLevel = Math.min(100, Math.max(0, (daysInCurrentLevel / totalDaysNeeded) * 100));
  }

  // Helper for Profile update sync
  const updateProfileSync = async (updates: any) => {
    if (user.profileId) {
      await supabase.from('profiles').update(updates).eq('id', user.profileId);
    }
  };

  // Actions
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = (updates: Partial<UserState>) => {
    setUser(prev => ({ ...prev, ...updates }));

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.manualDays !== undefined) dbUpdates.manual_days = updates.manualDays;
    if (updates.mode !== undefined) dbUpdates.mode = updates.mode;
    if (updates.isRunning !== undefined) dbUpdates.is_running = updates.isRunning;

    if (Object.keys(dbUpdates).length > 0) {
      updateProfileSync(dbUpdates);
    }
  };

  const startJourney = (date: string) => {
    setUser(prev => ({ ...prev, startDate: date, isRunning: true }));
    updateProfileSync({ start_date: date, is_running: true });
  };

  const resetProgress = async () => {
    const historyEntry = { date: new Date().toISOString(), level: currentLevel, days: daysCount };
    setUser(prev => ({
      ...prev,
      startDate: new Date().toISOString(),
      manualDays: 0,
      isRunning: true,
      history: [...prev.history, historyEntry]
    }));

    if (user.profileId) {
      await supabase.from('profiles').update({
        start_date: new Date().toISOString(),
        manual_days: 0,
        is_running: true
      }).eq('id', user.profileId);

      await supabase.from('evolutions').insert([{
        profile_id: user.profileId,
        date: historyEntry.date,
        level: historyEntry.level,
        days: historyEntry.days
      }]);
    }
  };

  const toggleDailyGoal = async (id: string) => {
    const goal = user.dailyGoals.find(g => g.id === id);
    if (!goal) return;
    const newVal = !goal.completed;
    setUser(prev => ({
      ...prev,
      dailyGoals: prev.dailyGoals.map(g => g.id === id ? { ...g, completed: newVal } : g)
    }));
    if (user.profileId) await supabase.from('goals').update({ completed: newVal }).eq('id', id);
  };

  const addDailyGoal = async (text: string) => {
    if (!user.profileId) return;
    const res = await supabase.from('goals').insert([{
      profile_id: user.profileId, text, type: 'daily', completed: false
    }]).select().single();

    if (res.data) {
      setUser(prev => ({
        ...prev,
        dailyGoals: [...prev.dailyGoals, { id: res.data.id, text: res.data.text, completed: false }]
      }));
    }
  };

  const removeDailyGoal = async (id: string) => {
    setUser(prev => ({ ...prev, dailyGoals: prev.dailyGoals.filter(g => g.id !== id) }));
    if (user.profileId) await supabase.from('goals').delete().eq('id', id);
  };

  const toggleMonthlyGoal = async (id: string) => {
    const goal = (user.monthlyGoals || []).find(g => g.id === id);
    if (!goal) return;
    const newVal = !goal.completed;
    setUser(prev => ({
      ...prev,
      monthlyGoals: (prev.monthlyGoals || []).map(g => g.id === id ? { ...g, completed: newVal } : g)
    }));
    if (user.profileId) await supabase.from('goals').update({ completed: newVal }).eq('id', id);
  };

  const addMonthlyGoal = async (text: string) => {
    if (!user.profileId) return;
    const res = await supabase.from('goals').insert([{
      profile_id: user.profileId, text, type: 'monthly', completed: false
    }]).select().single();

    if (res.data) {
      setUser(prev => ({
        ...prev,
        monthlyGoals: [...(prev.monthlyGoals || []), { id: res.data.id, text: res.data.text, completed: false }]
      }));
    }
  };

  const removeMonthlyGoal = async (id: string) => {
    setUser(prev => ({ ...prev, monthlyGoals: (prev.monthlyGoals || []).filter(g => g.id !== id) }));
    if (user.profileId) await supabase.from('goals').delete().eq('id', id);
  };

  return (
    <UserContext.Provider value={{
      user, session, loadingAuth, daysCount, currentLevel, nextLevel, daysToNextLevel,
      progressToNextLevel, levelColor, updateUser, startJourney, resetProgress,
      toggleDailyGoal, addDailyGoal, removeDailyGoal, toggleMonthlyGoal,
      addMonthlyGoal, removeMonthlyGoal, signOut,
      isPasswordRecovery, setIsPasswordRecovery
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const LEVEL_DATA = LEVELS;
