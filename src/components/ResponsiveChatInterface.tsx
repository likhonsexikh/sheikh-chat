import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bubble, Sender } from '@ant-design/x';
import {
    UserOutlined,
    RobotOutlined,
    LogoutOutlined,
    HistoryOutlined,
    DeleteOutlined,
    ReloadOutlined,
    MenuOutlined,
    CloseOutlined,
    ExpandOutlined,
    CompressOutlined,
    SettingOutlined
} from '@ant-design/icons';
import {
    Layout,
    Button,
    message,
    theme,
    Modal,
    List,
    Typography,
    Space,
    Dropdown,
    Spin,
    Empty,
    Drawer,
    Tooltip,
    Slider,
    Switch,
    Card,
    Row,
    Col,
    Divider,
    Select,
    Tag
} from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useGemini } from '../hooks/useGemini';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Message, Conversation } from '../types';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface ViewportSettings {
    chatWidth: number;
    fontSize: number;
    showAvatars: boolean;
    compactMode: boolean;
    themeMode: 'light' | 'dark' | 'auto';
}

const ResponsiveChatInterface: React.FC = () => {
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
    const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
        chatWidth: 800,
        fontSize: 14,
        showAvatars: true,
        compactMode: false,
        themeMode: 'auto'
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

    const { token } = theme.useToken();
    const contentRef = useRef<HTMLDivElement>(null);

    // Handle viewport changes
    useEffect(() => {
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-adjust settings based on viewport
    useEffect(() => {
        if (viewportWidth < 768) {
            // Mobile mode
            setViewportSettings(prev => ({
                ...prev,
                chatWidth: viewportWidth - 40,
                compactMode: true,
                showAvatars: false
            }));
        } else if (viewportWidth < 1200) {
            // Tablet mode
            setViewportSettings(prev => ({
                ...prev,
                chatWidth: 600,
                compactMode: false,
                showAvatars: true
            }));
        } else {
            // Desktop mode
            setViewportSettings(prev => ({
                ...prev,
                chatWidth: 800,
                compactMode: false,
                showAvatars: true
            }));
        }
    }, [viewportWidth]);

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

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            setViewportSettings(prev => ({ ...prev, chatWidth: window.innerWidth - 40 }));
        } else {
            setViewportSettings(prev => ({ ...prev, chatWidth: 800 }));
        }
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const updateSettings = (key: keyof ViewportSettings, value: any) => {
        setViewportSettings(prev => ({ ...prev, [key]: value }));
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
        },
        {
            key: 'settings',
            label: (
                <Space>
                    <SettingOutlined />
                    Settings
                </Space>
            ),
            onClick: () => setSettingsVisible(true)
        }
    ];

    const renderMessage = (msg: Message) => {
        const isMobile = viewportWidth < 768;
        const maxBubbleWidth = isMobile ? '90%' : `${Math.min(viewportSettings.chatWidth * 0.7, 600)}px`;

        return (
            <Bubble
                key={msg.id}
                placement={msg.role === 'user' ? 'end' : 'start'}
                content={msg.content}
                avatar={viewportSettings.showAvatars ? (msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />) : undefined}
                style={{
                    maxWidth: maxBubbleWidth,
                    fontSize: `${viewportSettings.fontSize}px`,
                    padding: viewportSettings.compactMode ? '8px 12px' : '12px 16px'
                }}
            />
        );
    };

    return (
        <Layout style={{
            height: '100vh',
            background: token.colorBgContainer,
            ...(isFullscreen && {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: '#000'
            })
        }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorSplit}`,
                padding: viewportWidth < 768 ? '0 16px' : '0 24px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Title
                        level={4}
                        style={{
                            margin: 0,
                            color: token.colorText,
                            fontSize: viewportWidth < 768 ? '18px' : '20px'
                        }}
                    >
                        Sheikh Chat
                    </Title>

                    {/* Viewport indicators for development */}
                    <Tag color="blue" style={{ fontSize: '12px' }}>
                        {viewportWidth}px
                    </Tag>

                    {viewportWidth < 768 && (
                        <Tag color="orange" style={{ fontSize: '12px' }}>
                            Mobile
                        </Tag>
                    )}
                    {viewportWidth >= 768 && viewportWidth < 1200 && (
                        <Tag color="green" style={{ fontSize: '12px' }}>
                            Tablet
                        </Tag>
                    )}
                    {viewportWidth >= 1200 && (
                        <Tag color="purple" style={{ fontSize: '12px' }}>
                            Desktop
                        </Tag>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Mobile menu button */}
                    {viewportWidth < 768 && (
                        <Button
                            type="text"
                            icon={sidebarVisible ? <CloseOutlined /> : <MenuOutlined />}
                            onClick={() => setSidebarVisible(!sidebarVisible)}
                            style={{ color: token.colorTextSecondary }}
                        />
                    )}

                    {/* Desktop menu */}
                    {viewportWidth >= 768 && (
                        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                            <Button type="text" style={{ color: token.colorTextSecondary }}>
                                Menu
                            </Button>
                        </Dropdown>
                    )}

                    {/* Collapse/Expand button */}
                    <Tooltip title={isCollapsed ? "Expand Chat" : "Collapse Chat"}>
                        <Button
                            type="text"
                            icon={isCollapsed ? <ExpandOutlined /> : <CompressOutlined />}
                            onClick={toggleCollapse}
                            style={{ color: token.colorTextSecondary }}
                        />
                    </Tooltip>

                    {/* Fullscreen button */}
                    <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        <Button
                            type="text"
                            icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                            onClick={toggleFullscreen}
                            style={{ color: token.colorTextSecondary }}
                        />
                    </Tooltip>

                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {user?.displayName}
                    </Text>
                    <Button type="text" onClick={logout}>
                        <LogoutOutlined />
                    </Button>
                </div>
            </Header>

            <Layout style={{ flex: 1, overflow: 'hidden' }}>
                {/* Sidebar for desktop */}
                {viewportWidth >= 768 && (
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
                )}

                {/* Main content area */}
                <Content
                    ref={contentRef}
                    style={{
                        padding: viewportWidth < 768 ? '16px' : '24px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        transition: 'all 0.3s ease',
                        ...(isCollapsed && {
                            opacity: 0.5,
                            transform: 'scale(0.95)',
                            pointerEvents: 'none'
                        }),
                        ...(viewportWidth < 768 && {
                            padding: '16px',
                            paddingBottom: '80px' // Extra padding for mobile input
                        })
                    }}
                >
                    {/* Messages */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        maxWidth: viewportSettings.chatWidth,
                        margin: '0 auto',
                        width: '100%'
                    }}>
                        {messages.map(renderMessage)}
                    </div>
                </Content>
            </Layout>

            {/* Mobile sidebar as drawer */}
            {viewportWidth < 768 && (
                <Drawer
                    title="Conversation History"
                    placement="left"
                    onClose={() => setSidebarVisible(false)}
                    open={sidebarVisible}
                    width="80%"
                >
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
                </Drawer>
            )}

            {/* Settings Drawer */}
            <Drawer
                title="Settings"
                placement="right"
                onClose={() => setSettingsVisible(false)}
                open={settingsVisible}
                width={350}
            >
                <Card title="Viewport Settings" size="small">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Text strong>Chat Width</Text>
                            <Slider
                                min={300}
                                max={1200}
                                value={viewportSettings.chatWidth}
                                onChange={(value) => updateSettings('chatWidth', value)}
                                disabled={isFullscreen}
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Current: {viewportSettings.chatWidth}px
                            </Text>
                        </Col>

                        <Col span={24}>
                            <Text strong>Font Size</Text>
                            <Slider
                                min={12}
                                max={20}
                                value={viewportSettings.fontSize}
                                onChange={(value) => updateSettings('fontSize', value)}
                            />
                        </Col>

                        <Col span={24}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <Text strong>Show Avatars</Text>
                                    <Switch
                                        checked={viewportSettings.showAvatars}
                                        onChange={(checked) => updateSettings('showAvatars', checked)}
                                        style={{ float: 'right' }}
                                    />
                                </div>

                                <div>
                                    <Text strong>Compact Mode</Text>
                                    <Switch
                                        checked={viewportSettings.compactMode}
                                        onChange={(checked) => updateSettings('compactMode', checked)}
                                        style={{ float: 'right' }}
                                    />
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Divider />

                <Card title="Theme Settings" size="small">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Text strong>Theme Mode</Text>
                            <Select
                                value={viewportSettings.themeMode}
                                onChange={(value) => updateSettings('themeMode', value)}
                                style={{ width: '100%' }}
                            >
                                <Option value="auto">Auto</Option>
                                <Option value="light">Light</Option>
                                <Option value="dark">Dark</Option>
                            </Select>
                        </Col>
                    </Row>
                </Card>
            </Drawer>

            <Footer style={{
                background: token.colorBgContainer,
                borderTop: `1px solid ${token.colorSplit}`,
                padding: viewportWidth < 768 ? '16px' : '16px 24px',
                position: 'sticky',
                bottom: 0,
                zIndex: 1000
            }}>
                <div style={{
                    maxWidth: viewportSettings.chatWidth,
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <Sender
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={handleSend}
                        loading={loading}
                        placeholder="Type a message..."
                        style={{ width: '100%' }}
                    />
                </div>
            </Footer>
        </Layout>
    );
};

export default ResponsiveChatInterface;