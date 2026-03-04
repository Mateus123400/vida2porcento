/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { Contagem } from './screens/Contagem';
import { Transmutar } from './screens/Transmutar';
import { Resultados } from './screens/Resultados';
import { Perfil } from './screens/Perfil';
import { Auth } from './screens/Auth';

type Screen = 'dashboard' | 'contagem' | 'transmutar' | 'resultados' | 'perfil';

function MainApp() {
  const { session, loadingAuth, isPasswordRecovery } = useUser();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || isPasswordRecovery) {
    return <Auth />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard />;
      case 'contagem': return <Contagem />;
      case 'transmutar': return <Transmutar />;
      case 'resultados': return <Resultados />;
      case 'perfil': return <Perfil />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentScreen={currentScreen} onScreenChange={setCurrentScreen}>
      {renderScreen()}
    </Layout>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}
