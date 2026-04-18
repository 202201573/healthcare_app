import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { SensorProvider } from './src/context/SensorContext';
import AppNav from './src/navigation/AppNav';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SensorProvider>
          <AppNav />
        </SensorProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
