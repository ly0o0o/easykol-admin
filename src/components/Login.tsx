import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { login } from '../services/auth';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const token = await login(values.email, values.password);
      localStorage.setItem('token', token);
      message.success('登录成功');
      onLoginSuccess();
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>EasyKol 管理登录</h2>
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ required: true, message: '请输入邮箱' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}; 