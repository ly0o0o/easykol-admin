import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, message, Divider, Row, Col } from 'antd';
import type { UpdateMembershipParams } from '../types';
import { fetchEmails, updateMembership } from '../services/api';
import { 
  UserOutlined, 
  CalendarOutlined, 
  NumberOutlined, 
  FileTextOutlined,
  CrownOutlined 
} from '@ant-design/icons';
import '../styles/MembershipForm.css';

export const MembershipForm: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [searchValue, setSearchValue] = useState('');
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);

  useEffect(() => {
    fetchEmailsList();
  }, []);

  useEffect(() => {
    const filtered = emails.filter(email => 
      email.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredEmails(filtered);
  }, [searchValue, emails]);

  const fetchEmailsList = async () => {
    try {
      const result = await fetchEmails();
      setEmails(result.data);
    } catch (error) {
      message.error('获取邮箱列表失败');
    }
  };

  const handleSubmit = async (values: any) => {
    const params: UpdateMembershipParams = {
      type: values.type,
      effectiveAt: values.effectiveAt?.toDate(),
      expireAt: values.expireAt?.toDate(),
      accountQuota: values.accountQuota,
      timezone: values.timezone,
      status: values.status,
      usedQuota: values.usedQuota,
    };

    try {
      setLoading(true);
      const result = await updateMembership(values.emails, params, values.description);
      if (result.statusCode === 1000) {
        message.success(result.message || '更新成功');
        form.resetFields();
      } else {
        message.error(result.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSearch = (value: string) => {
    setSearchValue(value);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <div className="App">
      <h1>
        <CrownOutlined style={{ marginRight: '8px', color: '#6366f1' }} />
        EasyKol 会员配额管理
      </h1>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="emails"
          label={
            <span>
              <UserOutlined style={{ marginRight: '8px' }} />
              选择邮箱
            </span>
          }
          rules={[{ required: true, message: '请选择或输入邮箱' }]}
        >
          <Select
            mode="tags"
            placeholder="请选择或输入邮箱"
            onSearch={handleEmailSearch}
            filterOption={false}
            notFoundContent={searchValue ? "未找到匹配的邮箱" : null}
            options={filteredEmails.map(email => ({ label: email, value: email }))}
            style={{ width: '100%' }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
            onInputKeyDown={e => {
              if (e.key === 'Enter' && searchValue) {
                if (!validateEmail(searchValue)) {
                  message.error('请输入有效的邮箱地址');
                  e.preventDefault();
                }
              }
            }}
          />
        </Form.Item>

        <Form.Item 
          name="type" 
          label={
            <span>
              <CrownOutlined style={{ marginRight: '8px' }} />
              会员类型
            </span>
          }
        >
          <Select>
            <Select.Option value="FREE">免费用户</Select.Option>
            <Select.Option value="PAID">付费会员</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item 
          name="accountQuota" 
          label={
            <span>
              <NumberOutlined style={{ marginRight: '8px' }} />
              账户配额
            </span>
          }
        >
          <Select
            style={{ width: '100%' }}
            placeholder="请选择或输入配额数量"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ padding: '0 8px' }}>
                  <InputNumber 
                    style={{ width: '100%' }} 
                    min={0}
                    placeholder="自定义配额数量"
                    onChange={(value) => form.setFieldValue('accountQuota', value)}
                  />
                </div>
              </>
            )}
          >
            <Select.Option value={30}>30</Select.Option>
            <Select.Option value={100}>100</Select.Option>
            <Select.Option value={500}>500</Select.Option>
            <Select.Option value={1000}>1000</Select.Option>
            <Select.Option value={10000}>10000</Select.Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="effectiveAt" 
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: '8px' }} />
                  生效时间
                </span>
              }
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="expireAt" 
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: '8px' }} />
                  过期时间
                </span>
              }
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="description" 
          label={
            <span>
              <FileTextOutlined style={{ marginRight: '8px' }} />
              描述
            </span>
          }
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<CrownOutlined />}
          >
            提交更新
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}; 