import { createContext, useContext, useState } from 'react';

const ModeContext = createContext();

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('Cinema'); // 'Cinema' or 'Home'

  const value = {
    mode,
    setMode,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};
