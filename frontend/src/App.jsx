import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, Button, List, Typography, Space } from 'antd';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const App = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to Sheikh-Chat! How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    // Use wss for secure connections in production
    const wsUrl = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const serverUrl = `${wsUrl}${window.location.host}/ws`;
    ws.current = new WebSocket(serverUrl);

    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onclose = () => console.log('WebSocket disconnected');

    ws.current.onmessage = (event) => {
      // For the echo server, the message is just a string
      const messageText = event.data;
      setMessages(prev => [...prev, { sender: 'bot', text: messageText }]);
    };

    // Cleanup on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
      const userMessage = { sender: 'user', text: inputValue.trim() };
      // Add user message to the list
      setMessages(prev => [...prev, userMessage]);

      // Send message to WebSocket server
      ws.current.send(userMessage.text);

      setInputValue('');
    }
  };

  return (
    <Layout className="layout">
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: '20px' }}>Sheikh-Chat</Text>
      </Header>
      <Content style={{ padding: '0 50px', display: 'flex', flexDirection: 'column' }}>
        <div className="chat-container">
          <List
            className="chat-list"
            dataSource={messages}
            renderItem={item => (
              <List.Item className={`chat-message ${item.sender}`}>
                <div className="message-bubble">
                  <Text>{item.text}</Text>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              size="large"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSendMessage}
            />
            <Button type="primary" size="large" onClick={handleSendMessage}>
              Send
            </Button>
          </Space.Compact>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Sheikh-Chat ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
    </Layout>
  );
};

export default App;
