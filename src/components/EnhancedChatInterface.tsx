import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bubble, Sender } from '@ant-design/x';
import { UserOutlined, RobotOutlined, LogoutOutlined, HistoryOutlined, DeleteOutlined, ReloadOutlined, MenuOutlined, CloseOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { Layout, Button, message, theme, Modal, List, Typography, Space, Dropdown, Menu, Spin, Empty, Drawer, Tooltip, Badge } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useGemini } from '../hooks/useGemini';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Message, Conversation } from '../types';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const EnhancedChatInterface: React.FC = () => {
    const { logout, user } = useAuth();
    const { streamResponse, loading } = useGemini();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', content: 'Hello! I am Sheikh Chat using Gemini. How can I help you today?', role: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { token } = theme.useToken();

    // Load conversations on mount
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    const loadConversations = useCallback(async () => {
        if (!user) return;

        setLoadingHistory(true);
        try {
            const conversationsRef = collection(db, 'users', user.uid, 'conversations');
            const q = query(conversationsRef, orderBy('createdAt', 'desc'), limit(20));
            const snapshot = await getDocs(q);

            const convos: Conversation[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Conversation));

            setConversations(convos);

            // Auto-select the latest conversation if none selected
            if (convos.length > 0 && !selectedConversation) {
                loadConversation(convos[0].id, convos[0].messages);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            message.error('Failed to load conversation history');
        } finally {
            setLoadingHistory(false);
        }
    }, [user, selectedConversation]);

    // Real-time updates for conversations
    useEffect(() => {
        if (!user || !selectedConversation) return;

        const conversationsRef = doc(db, 'users', user.uid, 'conversations', selectedConversation);
        const unsubscribe = onSnapshot(conversationsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as Conversation;
                setMessages(data.messages || []);
            }
        });

        return () => unsubscribe();
    }, [user, selectedConversation]);

    const handleSend = async (value: string) => {
        if (!value.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            content: value,
            role: 'user',
            timestamp: new Date()
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Prepare for AI response
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsgPlaceholder: Message = {
            id: aiMsgId,
            content: '',
            role: 'ai',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMsgPlaceholder]);

        // Call Gemini
        const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));

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
                // Update conversation in Firestore
                if (user && selectedConversation) {
                    // The conversation is automatically updated via real-time listener
                }
            },
            (err) => {
                message.error("Failed to generate response");
                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: "Sorry, something went wrong. Please try again." } : m
                ));
            }
        );
    };

    const loadConversation = (conversationId: string, messages: Message[]) => {
        setSelectedConversation(conversationId);
        setMessages(messages);
        setSidebarVisible(false);
    };

    const deleteConversation = async (conversationId: string) => {
        if (!user) return;

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'conversations', conversationId));
            setConversations(prev => prev.filter(c => c.id !== conversationId));

            if (selectedConversation === conversationId) {
                setMessages([{ id: '1', content: 'Hello! I am Sheikh Chat using Gemini. How can I help you today?', role: 'ai' }]);
                setSelectedConversation(null);
            }

            message.success('Conversation deleted');
        } catch (error) {
            console.error('Error deleting conversation:', error);
            message.error('Failed to delete conversation');
        }
    };

    const newConversation = () => {
        setMessages([{ id: '1', content: 'Hello! I am Sheikh Chat using Gemini. How can I help you today?', role: 'ai' }]);
        setSelectedConversation(null);
        message.info('Started new conversation');
    };

    const menuItems = [
        {
            key: 'new',
            label: (
                <Space>
                    <ReloadOutlined />
                    New Conversation
                </Space>
            ),
            onClick: newConversation
        },
        {
            key: 'history',
            label: (
                <Space>
                    <HistoryOutlined />
                    Conversation History
                </Space>
            ),
            onClick: () => setSidebarVisible(true)
        }
    ];

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorSplit}`,
                padding: '0 24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Title level={4} style={{ margin: 0, color: token.colorText }}>Sheikh Chat</Title>
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button type="text" style={{ color: token.colorTextSecondary }}>
                            Menu
                        </Button>
                    </Dropdown>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Text type="secondary">{user?.displayName}</Text>
                    <Button type="text" onClick={logout}>
                        <LogoutOutlined />
                    </Button>
                </div>
            </Header>

            <Layout>
                <Sider
                    width={300}
                    style={{
                        background: token.colorBgContainer,
                        borderRight: `1px solid ${token.colorSplit}`,
                        display: sidebarVisible ? 'block' : 'none'
                    }}
                    breakpoint="lg"
                    collapsedWidth="0"
                    onBreakpoint={(broken) => {
                        if (broken) setSidebarVisible(false);
                    }}
                >
                    <div style={{ padding: 16 }}>
                        <Title level={5}>Conversation History</Title>
                        {loadingHistory ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <Spin />
                            </div>
                        ) : conversations.length === 0 ? (
                            <Empty description="No conversations yet" />
                        ) : (
                            <List
                                dataSource={conversations}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="text"
                                                danger
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    Modal.confirm({
                                                        title: 'Delete Conversation',
                                                        content: 'Are you sure you want to delete this conversation?',
                                                        onOk: () => deleteConversation(item.id)
                                                    });
                                                }}
                                            >
                                                <DeleteOutlined />
                                            </Button>
                                        ]}
                                        style={{
                                            cursor: 'pointer',
                                            background: selectedConversation === item.id ? token.colorBgTextHover : 'transparent',
                                            borderRadius: 6
                                        }}
                                        onClick={() => loadConversation(item.id, item.messages)}
                                    >
                                        <List.Item.Meta
                                            title={item.messages[0]?.content.slice(0, 50) + '...'}
                                            description={item.createdAt?.toDate().toLocaleString()}
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                </Sider>

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
                            avatar={{
                                children: msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />,
                                style: { backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a' }
                            }}
                            style={{ maxWidth: '70%' }}
                        />
                    ))}
                </Content>
            </Layout>

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

export default EnhancedChatInterface;