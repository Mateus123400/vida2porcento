import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import clsx from 'clsx';

type Screen = 'dashboard' | 'contagem' | 'transmutar' | 'resultados' | 'perfil';

interface LayoutProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  children: React.ReactNode;
}

const MENU_ITEMS: { id: Screen; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'contagem', label: 'Contagem' },
  { id: 'transmutar', label: 'Transmutar' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'perfil', label: 'Perfil' },
];

export const Layout: React.FC<LayoutProps> = ({ currentScreen, onScreenChange, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { levelColor } = useUser();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMenuClick = (screen: Screen) => {
    onScreenChange(screen);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans overflow-hidden relative selection:bg-gold selection:text-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-900/20 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-blue-900/20 to-transparent blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-black/10 border-b border-white/5">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold tracking-wider"
          style={{ color: levelColor }}
        >
          VIDA 2%
        </motion.h1>

        <button 
          onClick={toggleMenu}
          className="p-2 rounded-full hover:bg-white/5 transition-colors active:scale-95"
        >
          {isMenuOpen ? <X size={24} /> : <MoreVertical size={24} />}
        </button>
      </header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 right-6 z-50 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="py-2">
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={clsx(
                      "w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 flex items-center gap-2",
                      currentScreen === item.id ? "text-white" : "text-gray-400"
                    )}
                  >
                    {currentScreen === item.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: levelColor }}
                      />
                    )}
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-12 relative z-10 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
