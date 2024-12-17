import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, message, Row, Col, Table, Card, Space, Tabs, Avatar, Spin, Typography } from 'antd';
import type { UpdateMembershipParams } from '../types';
import { fetchEmails, updateMembership, fetchMembers, fetchMembersInfo } from '../services/api';
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

// 添加会员信息卡片组件
const MemberCard: React.FC<{ member: any }> = ({ member }) => (
  <Card 
    size="small" 
    style={{ marginBottom: '8px', cursor: 'pointer' }}
    hoverable
  >
    <Card.Meta
      avatar={<Avatar icon={<UserOutlined />} src={member.avatar} />}
      title={member.email}
      description={
        <Space direction="vertical" size="small">
          <div>类型: {member.membership.type}</div>
          <div>状态: {member.membership.status}</div>
          <div>配额: {member.membership.accountQuota}</div>
          <div>已用: {member.membership.usedQuota}</div>
          <div>有效时间: {dayjs(member.membership.effectiveAt).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div>过期时间: {dayjs(member.membership.expireAt).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div>创建时间: {dayjs(member.membership.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
        </Space>
      }
    />  
  </Card>
);

export const MembershipForm: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 添加新的状态
  const [memberType, setMemberType] = useState<'PAID' | 'FREE'>('PAID');
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // 添加状态来控制输入框的值
  const [quotaValue, setQuotaValue] = useState<number | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [memberInfoLoading, setMemberInfoLoading] = useState(false);

  useEffect(() => {
    fetchEmailsList();
  }, []);

  const fetchEmailsList = async () => {
    try {
      const result = await fetchEmails();
      setEmails(result.data);
    } catch (error) {
      message.error('获取邮箱列表失败');
    }
  };

  const handleSubmit = async (values: any) => {
    // 添加邮箱验证
    const invalidEmails = values.emails.filter((email: string) => !emails.includes(email));
    if (invalidEmails.length > 0) {
      message.error(`以下邮箱不在数据库中，请叫他们先注册吧，大头！：${invalidEmails.join(', ')}`);
      return;
    }

    const params: UpdateMembershipParams = {
      type: values.type,
      effectiveAt: values.effectiveAt?.hour(values.effectiveAt.hour() + 8).toDate(),
      expireAt: values.expireAt?.hour(values.expireAt.hour() + 8).toDate(),
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

  // 添加获取会员列表的方法
  const fetchMembersList = useCallback(async () => {
    try {
      setMembersLoading(true);
      const result = await fetchMembers(memberType);
      setMembers(result.data);
    } catch (error) {
      message.error('获取会员列表失败');
    } finally {
      setMembersLoading(false);
    }
  }, [memberType]);

  // 添加会员类型切换方法
  const toggleMemberType = () => {
    setMemberType(prev => prev === 'PAID' ? 'FREE' : 'PAID');
  };

  // 在组件加载和会员类型变化时获取列表
  useEffect(() => {
    fetchMembersList();
  }, [memberType, fetchMembersList]);

  // 添加获取会员信息的方法
  const fetchMembersInformation = async (selectedEmails: string[]) => {
    try {
      setMemberInfoLoading(true);
      const result = await fetchMembersInfo(selectedEmails);
      setSelectedMembers(result.data.users);
    } catch (error) {
      message.error('获取会员信息失败');
    } finally {
      setMemberInfoLoading(false);
    }
  };

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
                      rules={[
                        {
                          validator: async (_: any, value: string[]) => {
                            if (!value || value.length === 0) {
                              // 当清空所有邮箱时，清空选中的会员信息
                              setSelectedMembers([]);
                              return;
                            }
                            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                            const invalidFormatEmails = value.filter(email => !emailRegex.test(email));
                            if (invalidFormatEmails.length > 0) {
                              throw new Error(`以下邮箱格式不正确：${invalidFormatEmails.join(', ')}`);
                            }
                            const invalidEmails = value.filter(email => !emails.includes(email));
                            if (invalidEmails.length > 0) {
                              throw new Error(`以下邮箱不在数据库中，请叫他们先注册吧，大头！：${invalidEmails.join(', ')}`);
                            }
                            // 获取选中邮箱的会员信息
                            await fetchMembersInformation(value);
                          }
                        }
                      ]}
                    >
                      <Select
                        mode="tags"
                        placeholder="请选择或输入邮箱"
                        style={{ width: '100%' }}
                        size="large"
                        options={emails.map(email => ({ value: email, label: email }))}
                        onChange={(values: string[]) => {
                          // 当邮箱选择发生变化时，更新会员信息
                          if (values.length === 0) {
                            setSelectedMembers([]);
                          }
                        }}
                      />
                    </Form.Item>

                    {selectedMembers.length > 0 && (
                      <div style={{ marginBottom: '24px' }}>
                        <Spin spinning={memberInfoLoading}>
                          <div style={{ marginBottom: '16px' }}>
                            <Typography.Text strong>已选择的会员信息：</Typography.Text>
                          </div>
                          {selectedMembers.map((member) => (
                            <MemberCard key={member.userId} member={member} />
                          ))}
                        </Spin>
                      </div>
                    )}

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
                      required
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          placeholder="请输入配额数量"
                          size="large"
                          value={quotaValue}
                          onChange={(value) => {
                            setQuotaValue(value);
                            if (value) {
                              form.setFieldsValue({ accountQuota: value });
                              message.success(`配额已设置为 ${value}`);
                            }
                          }}
                        />
                        <Space wrap>
                          {[30, 100, 200, 500, 1000, 10000].map(quota => (
                            <Button
                              key={quota}
                              onClick={() => {
                                setQuotaValue(quota);
                                form.setFieldsValue({ accountQuota: quota });
                                message.success(`配额已设置为 ${quota}`);
                              }}
                            >
                              {quota}
                            </Button>
                          ))}
                        </Space>
                      </Space>
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