import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ChatInterface from './components/ChatInterface';
import './App.css'; // Ensure we keep standard styles if any, or remove if not needed.

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#fff' }}>Loading...</div>;
  }

  return user ? <ChatInterface /> : <Login />;
};

const App: React.FC = () => {
  // Use dark algorithm for premium feel
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
