import React, { useState } from 'react';
import { ConfigProvider, theme, Button, Space } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import EnhancedChatInterface from './components/EnhancedChatInterface';
import ResponsiveChatInterface from './components/ResponsiveChatInterface';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [useResponsiveUI, setUseResponsiveUI] = useState(true);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff',
        flexDirection: 'column',
        gap: 16
      }}>
        <div>Loading...</div>
        <Space>
          <Button
            type="primary"
            ghost
            onClick={() => setUseResponsiveUI(false)}
          >
            Legacy UI
          </Button>
          <Button
            type="primary"
            onClick={() => setUseResponsiveUI(true)}
          >
            Responsive UI
          </Button>
        </Space>
      </div>
    );
  }

  return user ? (
    useResponsiveUI ? <ResponsiveChatInterface /> : <EnhancedChatInterface />
  ) : <Login />;
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
