import React, { useState } from 'react';
import { Bubble, Sender } from '@ant-design/x';
import { UserOutlined, RobotOutlined, LogoutOutlined } from '@ant-design/icons';
import { Layout, Button, message, theme } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useGemini } from '../hooks/useGemini';
// Import markdown renderer (basic setup/placeholder as x-markdown might need specific config)
// Note: In real setup, we would use <Markdown /> from @ant-design/x-markdown within Bubble
// For this demo, let's assume Bubble handles basic text or we just pass text.

const { Header, Content, Footer } = Layout;

interface Message {
    id: string;
    content: string;
    role: 'user' | 'ai';
}

const ChatInterface: React.FC = () => {
    const { logout, user } = useAuth();
    const { streamResponse, loading } = useGemini();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', content: 'Hello! I am Sheikh Chat using Gemini. How can I help you today?', role: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const { token } = theme.useToken();

    const handleSend = async (value: string) => {
        if (!value.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), content: value, role: 'user' };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');

        // Prepare for AI response
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsgPlaceholder: Message = { id: aiMsgId, content: '', role: 'ai' };
        setMessages(prev => [...prev, aiMsgPlaceholder]);

        // Call Gemini
        const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

        let aiContent = '';

        await streamResponse(
            apiMessages,
            (chunk) => {
                aiContent += chunk;
                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: aiContent } : m
                ));
            },
            () => {
                // Finished
            },
            (_err) => {
                message.error("Failed to generate response");
                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: "Sorry, something went wrong." } : m
                ));
            }
        );
    };

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorSplit}`
            }}>
                <div style={{ fontWeight: 'bold', fontSize: 18 }}>Sheikh Chat</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{user?.displayName}</span>
                    <Button type="text" icon={<LogoutOutlined />} onClick={logout} />
                </div>
            </Header>
            <Content style={{
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}>
                {messages.map((msg) => (
                    <Bubble
                        key={msg.id}
                        placement={msg.role === 'user' ? 'end' : 'start'}
                        content={msg.content}
                        // @ts-ignore
                        avatar={{
                            icon: msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />,
                            style: { backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a' }
                        }}
                        style={{ maxWidth: '70%' }}
                    />
                ))}
            </Content>
            <Footer style={{
                background: token.colorBgContainer,
                borderTop: `1px solid ${token.colorSplit}`,
                padding: '16px 24px'
            }}>
                <Sender
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSend}
                    loading={loading}
                    placeholder="Type a message..."
                    style={{ maxWidth: 800, margin: '0 auto' }}
                />
            </Footer>
        </Layout>
    );
};

export default ChatInterface;
