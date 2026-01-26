import React, { useState } from 'react';
import { Button, Card, Typography, Space, Alert } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const { signInWithGoogle } = useAuth();
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCaptchaChange = (value: string | null) => {
        if (value) {
            setCaptchaVerified(true);
        } else {
            setCaptchaVerified(false);
        }
    };

    const handleLogin = async () => {
        if (!captchaVerified) {
            setError("Please complete the reCAPTCHA verification.");
            return;
        }
        try {
            setError(null);
            await signInWithGoogle();
        } catch (err: any) {
            console.error(err);
            setError("Failed to sign in. Please try again.");
        }
    };

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #1f1c2c 0%, #928DAB 100%)'
        }}>
            <Card style={{ width: 400, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Sheikh Chat</Title>
                        <Text type="secondary">Next-gen AI Conversations</Text>
                    </div>

                    {error && <Alert message={error} type="error" showIcon />}

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ReCAPTCHA
                            sitekey={siteKey || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Fallback test key if env missing
                            onChange={handleCaptchaChange}
                            theme="light"
                        />
                    </div>

                    <Button
                        type="primary"
                        icon={<GoogleOutlined />}
                        size="large"
                        block
                        onClick={handleLogin}
                        disabled={!captchaVerified}
                    >
                        Sign in with Google
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default Login;
