import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, message, Divider, Row, Col, Table, Card, Space, Tag, Tabs, Statistic } from 'antd';
import type { UpdateMembershipParams } from '../types';
import { fetchEmails, updateMembership, fetchMembers } from '../services/api';
import { 
  UserOutlined, 
  CalendarOutlined, 
  NumberOutlined, 
  FileTextOutlined,
  CrownOutlined,
  SwapOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import '../styles/MembershipForm.css';

export const MembershipForm: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [searchValue, setSearchValue] = useState('');
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);

  // 添加会员期限选项


  const [selectedDuration, setSelectedDuration] = useState<number | 'custom'>(30);

  // 添加新的状态
  const [memberType, setMemberType] = useState<'PAID' | 'FREE'>('PAID');
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

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

  // 验证邮箱是否在列表中
  const validateEmailExists = (email: string) => {
    return emails.includes(email);
  };

  // 处理会员期限变化
  const handleDurationChange = (value: number | 'custom') => {
    setSelectedDuration(value);
    if (value !== 'custom') {
      const effectiveAt = dayjs();
      const expireAt = effectiveAt.add(value, 'day');
      form.setFieldsValue({
        effectiveAt,
        expireAt
      });
    }
  };

  // 添加获取会员列表的方法
  const fetchMembersList = async () => {
    try {
      setMembersLoading(true);
      const result = await fetchMembers(memberType);
      setMembers(result.data);
    } catch (error) {
      message.error('获取会员列表失败');
    } finally {
      setMembersLoading(false);
    }
  };

  // 添加会员类型切换方法
  const toggleMemberType = () => {
    setMemberType(prev => prev === 'PAID' ? 'FREE' : 'PAID');
  };

  // 在组件加载和会员类型变化时获取列表
  useEffect(() => {
    fetchMembersList();
  }, [memberType]);

  // 定义表格列
  const columns = [
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
    },
    {
      title: '总配额',
      dataIndex: 'accountQuota',
      key: 'accountQuota',
      width: '10%',
    },
    {
      title: '已使用',
      dataIndex: 'usedQuota',
      key: 'usedQuota',
      width: '10%',
    },
    {
      title: '可用配额',
      key: 'availableQuota',
      width: '10%',
      render: (record: any) => record.accountQuota - record.usedQuota,
    },
    {
      title: '有效时间',
      dataIndex: 'effectiveAt',
      key: 'effectiveAt',
      width: '15%',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '过期时间',
      dataIndex: 'expireAt',
      key: 'expireAt',
      width: '15%',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  // 添加配额统计
  const quotaStats = React.useMemo(() => {
    return members.reduce((acc, member) => {
      acc.totalQuota += member.accountQuota;
      acc.usedQuota += member.usedQuota;
      return acc;
    }, { totalQuota: 0, usedQuota: 0 });
  }, [members]);

  return (
    <div className="App">
      <Card style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Tabs
          items={[
            {
              key: 'form',
              label: (
                <span>
                  <CrownOutlined />
                  会员配额管理
                </span>
              ),
              children: (
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 0' }}>
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
                      required
                    >
                      <Select
                        mode="tags"
                        placeholder="请选择或输入邮箱"
                        style={{ width: '100%' }}
                        size="large"
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
                      initialValue="PAID"
                    >
                      <Select disabled size="large">
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
                        placeholder="请选择或输入配额数量"
                        size="large"
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <Divider style={{ margin: '8px 0' }} />
                            <div style={{ padding: '0 8px' }}>
                              <InputNumber 
                                style={{ width: '100%' }} 
                                min={0}
                                placeholder="自定义配额数量"
                                size="large"
                              />
                            </div>
                          </>
                        )}
                      >
                        <Select.Option value={30}>30</Select.Option>
                        <Select.Option value={100}>100</Select.Option>
                        <Select.Option value={200}>200</Select.Option>
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
                          required
                        >
                          <DatePicker 
                            showTime 
                            style={{ width: '100%' }} 
                            size="large"
                            placeholder="请选择生效时间"
                          />
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
                          required
                        >
                          <DatePicker 
                            showTime 
                            style={{ width: '100%' }} 
                            size="large"
                            placeholder="请选择过期时间"
                          />
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
                        size="large"
                      >
                        提交更新
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
            {
              key: 'list',
              label: (
                <span>
                  <NumberOutlined />
                  用户配额信息
                </span>
              ),
              children: (
                <>
                  <Space style={{ marginBottom: 16 }}>
                    <Button 
                      type="link" 
                      icon={<SwapOutlined />} 
                      onClick={toggleMemberType}
                    >
                      切换到{memberType === 'PAID' ? '免费用户' : '付费会员'}
                    </Button>
                  </Space>
                  <Table
                    columns={columns}
                    dataSource={members}
                    rowKey="userId"
                    loading={membersLoading}
                    pagination={{ 
                      pageSize: 20,
                      showTotal: (total) => `共 ${total} 条记录`,
                      showSizeChanger: true,
                    }}
                    size="middle"
                  />
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}; 