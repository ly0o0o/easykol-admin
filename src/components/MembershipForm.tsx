import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, message, Row, Col, Table, Card, Space, Tabs, Avatar, Spin, Typography, Collapse, Alert, Tag, Tooltip, Modal, Divider, Descriptions } from 'antd';
import type { UpdateMembershipParams,QuotaDetail,DailyQuota } from '../types/types';
import { 
  fetchEmails, 
  updateMembership, 
  fetchMembers, 
  fetchMembersInfo, 
  fetchQuotaDetails, 
  fetchDailyQuota,
  createEnterprise,
  getEnterpriseDetail,
  updateEnterprise,
  addEnterpriseMembers,
  removeEnterpriseMember,
  getEnterprises as fetchEnterprisesList
} from '../services/api';
import { 
  UserOutlined, 
  CalendarOutlined, 
  NumberOutlined, 
  FileTextOutlined,
  CrownOutlined,
  SwapOutlined,
  DownloadOutlined,
  SearchOutlined,
  BankOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import '../styles/MembershipForm.css';
import * as XLSX from 'xlsx';
import {
  Enterprise,
  EnterpriseMember,
  UpdateEnterpriseParams,
} from '../types/enterprise';

const { Panel } = Collapse;

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

// 企业详情弹窗组件
const EnterpriseDetailModal: React.FC<{
  visible: boolean;
  enterpriseId: string;
  onClose: () => void;
}> = ({ visible, enterpriseId, onClose }) => {
  const [detail, setDetail] = useState<Enterprise | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && enterpriseId) {
      fetchDetail();
    }
  }, [visible, enterpriseId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await getEnterpriseDetail(enterpriseId);
      if (response.statusCode === 1000) {
        setDetail(response.data);
      }
    } catch (error) {
      message.error('获取企业详情失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="企业详情"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Spin spinning={loading}>
        {detail && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="企业名称">{detail.name}</Descriptions.Item>
              <Descriptions.Item label="企业描述">{detail.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="配额总量">{detail.accountQuota}</Descriptions.Item>
              <Descriptions.Item label="已用配额">{detail.usedQuota}</Descriptions.Item>
              <Descriptions.Item label="生效时间">
                {dayjs(detail.effectiveAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="过期时间">
                {dayjs(detail.expireAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="联系人">{detail.contactPerson || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detail.contactPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系邮箱">{detail.contactEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="企业规模">{detail.scale || '-'}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{detail.address || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">成员列表</Divider>
            <Table
              dataSource={detail.members}
              rowKey="userId"
              columns={[
                {
                  title: '成员邮箱',
                  dataIndex: ['user', 'email'],
                },
                {
                  title: '角色',
                  dataIndex: 'isEnterpriseAdmin',
                  render: (value: boolean) => value ? '管理员' : '普通成员',
                },
                {
                  title: '时区',
                  dataIndex: 'timezone',
                },
                {
                  title: '配额总量',
                  dataIndex: 'accountQuota',
                },

                {
                  title: '配额使用量',
                  dataIndex: 'usedQuota',
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                },
              ]}
            />
          </>
        )}
      </Spin>
    </Modal>
  );
};

// 企业编辑弹窗组件
const EnterpriseEditModal: React.FC<{
  visible: boolean;
  enterprise: Enterprise | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ visible, enterprise, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && enterprise) {
      form.setFieldsValue({
        ...enterprise,
        effectiveAt: enterprise.effectiveAt ? dayjs(enterprise.effectiveAt) : undefined,
        expireAt: enterprise.expireAt ? dayjs(enterprise.expireAt) : undefined,
      });
    }
  }, [visible, enterprise]);

  const handleSubmit = async (values: any) => {
    if (!enterprise) return;
    
    try {
      setLoading(true);
      const params: UpdateEnterpriseParams = {
        ...values,
        effectiveAt: values.effectiveAt?.toISOString(),
        expireAt: values.expireAt?.toISOString(),
      };
      
      const response = await updateEnterprise(enterprise.id, params);
      if (response.statusCode === 1000) {
        message.success('更新成功');
        onSuccess();
        onClose();
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="编辑企业信息"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item name="name" label="企业名称">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="企业描述">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="accountQuota" label="配额总量">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="effectiveAt" label="生效时间">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="expireAt" label="过期时间">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="contactPerson" label="联系人">
          <Input />
        </Form.Item>
        <Form.Item name="contactPhone" label="联系电话">
          <Input />
        </Form.Item>
        <Form.Item name="contactEmail" label="联系邮箱">
          <Input />
        </Form.Item>
        <Form.Item name="scale" label="企业规模">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="地址">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 成员管理弹窗组件
const MemberManageModal: React.FC<{
  visible: boolean;
  enterprise: Enterprise | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ visible, enterprise, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<EnterpriseMember[]>([]);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [validatingEmails, setValidatingEmails] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    valid: string[];
    invalid: string[];
  }>({ valid: [], invalid: [] });

  // 获取可选邮箱列表
  useEffect(() => {
    const fetchEmailList = async () => {
      try {
        const response = await fetchEmails();
        if (response.statusCode === 1000) {
          setEmailList(response.data);
        }
      } catch (error) {
        message.error('获取邮箱列表失败');
      }
    };

    if (visible) {
      fetchEmailList();
    }
  }, [visible]);

  // 获取企业成员详情
  const fetchEnterpriseDetail = async () => {
    if (!enterprise) return;
    try {
      const response = await getEnterpriseDetail(enterprise.id);
      if (response.statusCode === 1000) {
        setMembers(response.data.members || []);
      }
    } catch (error) {
      message.error('获取企业成员列表失败');
    }
  };

  useEffect(() => {
    if (visible && enterprise) {
      fetchEnterpriseDetail();
    }
  }, [visible, enterprise]);

  // 验证邮箱格式和存在性
  const validateEnterpriseEmails = async (emails: string[]): Promise<{
    validEmails: string[];
    invalidEmails: string[];
  }> => {
    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    // 邮箱格式验证
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (const email of emails) {
      // 验证邮箱格式
      if (!emailRegex.test(email)) {
        invalidEmails.push(email);
        continue;
      }

      // 验证是否已注册
      if (!emailList.includes(email)) {
        invalidEmails.push(email);
        continue;
      }

      // 验证是否已是企业成员
      const isExistingMember = members.some(member => member.user.email === email);
      if (isExistingMember) {
        invalidEmails.push(email);
        continue;
      }

      validEmails.push(email);
    }

    // 更新验证状态
    setEmailValidation({
      valid: validEmails,
      invalid: invalidEmails
    });

    return { validEmails, invalidEmails };
  };

  const handleAddMembers = async (values: { emails: string[]; adminEmails: string[] }) => {
    if (!enterprise) return;
    
    // 验证所有邮箱
    const allEmails = Array.from(new Set([...values.emails, ...values.adminEmails]));
    const validationResult = await validateEnterpriseEmails(allEmails);
    if (validationResult.invalidEmails.length > 0) return;
    
    try {
      setLoading(true);
      const response = await addEnterpriseMembers(enterprise.id, {
        emails: allEmails,
        adminEmails: values.adminEmails,
      });
      
      if (response.statusCode === 1000) {
        message.success('添加成员成功');
        form.resetFields();
        fetchEnterpriseDetail();
        onSuccess();
      }
    } catch (error) {
      message.error('添加成员失败');
    } finally {
      setLoading(false);
    }
  };

  // 监听成员邮箱变化
  const handleMemberEmailsChange = (emails: string[]) => {
    // 清除错误提示
    setEmailValidation({ valid: [], invalid: [] });
  };

  // 监听管理员邮箱变化
  const handleAdminEmailsChange = (adminEmails: string[]) => {
    // 清除错误提示
    setEmailValidation({ valid: [], invalid: [] });
    
    const currentMemberEmails = form.getFieldValue('emails') || [];
    const newMemberEmails = Array.from(new Set([...currentMemberEmails, ...adminEmails]));
    form.setFieldsValue({
      emails: newMemberEmails
    });
  };

  return (
    <Modal
      title="成员管理"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleAddMembers}
        layout="vertical"
      >
        <Form.Item
          label={
            <Space>
              <span>添加成员</span>
              {emailValidation.invalid.length > 0 && (
                <Tag color="error">
                  {emailValidation.invalid.length} 个无效邮箱
                </Tag>
              )}
            </Space>
          }
        >
          <Form.Item
            name="emails"
            rules={[
              { required: true, message: '请选择要添加的成员' },
              {
                validator: async (_, value) => {
                  if (!value || value.length === 0) return;
                  const { invalidEmails } = await validateEnterpriseEmails(value);
                  if (invalidEmails.length > 0) {
                    throw new Error('存在无效的邮箱地址');
                  }
                }
              }
            ]}
            noStyle
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="请输入或选择邮箱"
              options={emailList.map((email: string) => ({ value: email, label: email }))}
              loading={validatingEmails}
              onChange={handleMemberEmailsChange}
            />
          </Form.Item>
          {emailValidation.invalid.length > 0 && (
            <Alert
              type="error"
              message="以下邮箱无效或不存在："
              description={
                <ul>
                  {emailValidation.invalid.map((email: string) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              }
              style={{ marginTop: 8 }}
            />
          )}
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <span>设为管理员</span>
              <Tooltip title="管理员将自动添加为成员">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Form.Item
            name="adminEmails"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value.length === 0) return;
                  const { invalidEmails } = await validateEnterpriseEmails(value);
                  if (invalidEmails.length > 0) {
                    throw new Error('存在无效的管理员邮箱地址');
                  }
                }
              }
            ]}
            noStyle
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="请输入管理员邮箱"
              options={emailList.map((email: string) => ({ value: email, label: email }))}
              onChange={handleAdminEmailsChange}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            添加成员
          </Button>
        </Form.Item>
      </Form>
      
      <Divider orientation="left">成员列表</Divider>

      <Table
        dataSource={members}
        rowKey="userId"
        columns={[
          {
            title: '成员邮箱',
            dataIndex: ['user', 'email'],
          },
          {
            title: '角色',
            dataIndex: 'isEnterpriseAdmin',
            render: (value: boolean) => value ? '管理员' : '普通成员',
          },
          {
            title: '时区',
            dataIndex: 'timezone',
          },
          {
            title: '配额使用量',
            dataIndex: 'usedQuota',
          },
          {
            title: '配额总量',
            dataIndex: 'accountQuota',
          },
          {
            title: '生效时间',
            dataIndex: 'effectiveAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            title: '过期时间',
            dataIndex: 'expireAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            title: '状态',
            dataIndex: 'status',
          },
          {
            title: '操作',
            key: 'action',
            render: (_: any, record: EnterpriseMember) => (
              <Button 
                type="link" 
                danger 
                onClick={() => {
                  if (enterprise) {
                    Modal.confirm({
                      title: '确认移除',
                      content: (
                        <div>
                          <p>确定要移除成员 {record.user.email} 吗？</p>
                          {record.isEnterpriseAdmin && (
                            <Alert
                              type="warning"
                              message="注意：该成员是管理员，移除后将失去管理权限"
                              style={{ marginTop: 8 }}
                            />
                          )}
                        </div>
                      ),
                      onOk: async () => {
                        try {
                          await removeEnterpriseMember(enterprise.id, record.userId);
                          message.success('移除成员成功');
                          fetchEnterpriseDetail();
                          onSuccess();
                        } catch (error) {
                          message.error('移除成员失败');
                        }
                      },
                    });
                  }
                }}
              >
                移除
              </Button>
            ),
          },
        ]}
      />
    </Modal>
  );
};

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

  const [quotaDetails, setQuotaDetails] = useState<QuotaDetail[]>([]);
  const [dailyQuota, setDailyQuota] = useState<DailyQuota[]>([]);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [queryForm] = Form.useForm();

  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [enterpriseLoading, setEnterpriseLoading] = useState(false);
  const [enterpriseForm] = Form.useForm();

  // 添加企业成员邮箱验证状态
  const [enterpriseEmailValidation, setEnterpriseEmailValidation] = useState<{
    valid: string[];
    invalid: string[];
  }>({ valid: [], invalid: [] });

  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [memberManageVisible, setMemberManageVisible] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

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

  // 添加查询配额的方法
  const handleQuotaQuery = async (values: any) => {
    try {
      setQuotaLoading(true);
      const { email, startDate, endDate } = values;
      
      const startDateStr = startDate ? startDate.format('YYYY-MM-DD') : undefined;
      const endDateStr = endDate ? endDate.format('YYYY-MM-DD') : undefined;
      
      const [detailsRes, dailyRes] = await Promise.all([
        fetchQuotaDetails(email, startDateStr, endDateStr),
        fetchDailyQuota(email, startDateStr, endDateStr)
      ]);
      
      if (detailsRes.statusCode === 1000) {
        setQuotaDetails(detailsRes.data);
      }
      if (dailyRes.statusCode === 1000) {
        setDailyQuota(dailyRes.data);
      }
    } catch (error) {
      message.error('查询失败');
    } finally {
      setQuotaLoading(false);
    }
  };

  // 修改导出Excel功能，添加列宽设置
  const exportToExcel = (email: string) => {
    // 处理配额明细数据
    const detailsData = quotaDetails.map(item => ({
      时间: dayjs(item.time).format('YYYY-MM-DD HH:mm:ss'),
      配额消耗: item.quota_cost,
      配额类型: item.quota_type,
      描述: item.description,
      邮箱: item.email
    }));

    // 处理每日统计数据
    const dailyData = dailyQuota.map(item => ({
      日期: dayjs(item.date).format('YYYY-MM-DD'),
      邮箱: item.email,
      每日使用量: item.daily_usage
    }));
    
    // 创建工作表并设置列宽
    const detailsWorksheet = XLSX.utils.json_to_sheet(detailsData);
    const dailyWorksheet = XLSX.utils.json_to_sheet(dailyData);
    
    // 设置列宽
    const detailsCols = [
      { wch: 20 },  // 时间
      { wch: 12 },  // 配额消耗
      { wch: 15 },  // 配额类型
      { wch: 50 },  // 描述
      { wch: 30 },  // 邮箱
    ];
    
    const dailyCols = [
      { wch: 15 },  // 日期
      { wch: 30 },  // 邮箱
      { wch: 12 },  // 每日使用量
    ];
    
    detailsWorksheet['!cols'] = detailsCols;
    dailyWorksheet['!cols'] = dailyCols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, detailsWorksheet, "配额明细");
    XLSX.utils.book_append_sheet(workbook, dailyWorksheet, "每日统计");
    
    XLSX.writeFile(workbook, `配额查询结果_${email}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  // 修改获取企业列表的方法
  const fetchEnterprises = async () => {
    try {
      setEnterpriseLoading(true);
      const response = await fetchEnterprisesList({});
      if (response.statusCode === 1000) {
        setEnterprises(response.data);
      }
    } catch (error) {
      message.error('获取企业列表失败');
    } finally {
      setEnterpriseLoading(false);
    }
  };

  // 在组件加载时获取企业列表
  useEffect(() => {
    fetchEnterprises();
  }, []);

  // 修复验证函数
  const validateEnterpriseEmails = async (memberEmails: string[], adminEmails: string[] = []) => {
    const combinedEmails = Array.from(new Set([...memberEmails, ...adminEmails]));
    
    try {
      // 1. 验证邮箱格式
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const invalidFormatEmails = combinedEmails.filter(email => !emailRegex.test(email));
      
      // 2. 验证邮箱是否在系统中
      const validFormatEmails = combinedEmails.filter(email => emailRegex.test(email));
      const { data } = await fetchMembersInfo(validFormatEmails);
      
      const validEmails = data.users.map(user => user.email);
      const invalidEmails = [
        ...invalidFormatEmails,
        ...data.stats.notFoundEmails
      ];

      setEnterpriseEmailValidation({
        valid: validEmails,
        invalid: invalidEmails
      });

      return { validEmails, invalidEmails };
    } catch (error) {
      message.error('验证邮箱失败');
      // 使用已定义的 combinedEmails
      return { validEmails: [], invalidEmails: combinedEmails };
    }
  };

  // 将列定义移到组件内部
  const enterpriseColumns = [
    {
      title: '企业名称',
      dataIndex: 'name',
    },
    {
      title: '配额',
      dataIndex: 'accountQuota',
    },
    {
      title: '状态',
      dataIndex: 'status',
    },
    {
      title: '生效时间',
      dataIndex: 'effectiveAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '过期时间',
      dataIndex: 'expireAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Enterprise) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedEnterprise(record);
              setDetailVisible(true);
            }}
          >
            查看
          </Button>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedEnterprise(record);
              setEditVisible(true);
            }}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedEnterprise(record);
              setMemberManageVisible(true);
            }}
          >
            成员管理
          </Button>
        </Space>
      ),
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
            {
              key: 'quota-query',
              label: (
                <span>
                  <SearchOutlined />
                  配额查询
                </span>
              ),
              children: (
                <div style={{ padding: '24px' }}>
                  <Form
                    form={queryForm}
                    onFinish={handleQuotaQuery}
                    style={{ marginBottom: '24px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                      <Space size="large" align="start">
                        <Form.Item
                          name="email"
                          label="邮箱"
                          rules={[{ required: true, message: '请选择邮箱' }]}
                        >
                          <Select
                            showSearch
                            style={{ width: 250 }}
                            placeholder="请选择邮箱"
                            options={emails.map(email => ({ value: email, label: email }))}
                          />
                        </Form.Item>
                        
                        <Form.Item name="startDate" label="开始日期">
                          <DatePicker />
                        </Form.Item>
                        
                        <Form.Item name="endDate" label="结束日期">
                          <DatePicker />
                        </Form.Item>
                      </Space>
                      
                      <Form.Item style={{ margin: '16px 0' }}>
                        <Space size="middle">
                          <Button type="primary" htmlType="submit" loading={quotaLoading}>
                            查询
                          </Button>
                          <Button 
                            icon={<DownloadOutlined />}
                            onClick={() => {
                              const email = queryForm.getFieldValue('email');
                              exportToExcel(email);
                            }}
                            disabled={!quotaDetails.length}
                          >
                            导出Excel
                          </Button>
                        </Space>
                      </Form.Item>
                    </div>
                  </Form>

                  <Tabs
                    items={[
                      {
                        key: 'daily',
                        label: '每日统计',
                        children: (
                          <Table
                            dataSource={dailyQuota}
                            rowKey="date"
                            columns={[
                              {
                                title: '日期',
                                dataIndex: 'date',
                                render: (date) => dayjs(date).format('YYYY-MM-DD'),
                              },
                              {
                                title: '邮箱',
                                dataIndex: 'email',
                              },
                              {
                                title: '每日使用量',
                                dataIndex: 'daily_usage',
                              },
                            ]}
                            loading={quotaLoading}
                          />
                        ),
                      },
                      {
                        key: 'details',
                        label: '配额明细',
                        children: (
                          <Table
                            dataSource={quotaDetails}
                            rowKey="time"
                            columns={[
                              {
                                title: '时间',
                                dataIndex: 'time',
                                render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
                              },
                              {
                                title: '配额消耗',
                                dataIndex: 'quota_cost',
                              },
                              {
                                title: '配额类型',
                                dataIndex: 'quota_type',
                              },
                              {
                                title: '描述',
                                dataIndex: 'description',
                              },
                            ]}
                            loading={quotaLoading}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'enterprise',
              label: (
                <span>
                  <BankOutlined />
                  企业管理
                </span>
              ),
              children: (
                <div style={{ padding: '24px' }}>
                  <Form
                    form={enterpriseForm}
                    onFinish={async (values) => {
                      try {
                        // 验证所有邮箱
                        const { invalidEmails } = await validateEnterpriseEmails(
                          values.memberEmails || [],
                          values.adminEmails || []
                        );

                        if (invalidEmails.length > 0) {
                          message.error('存在无效的邮箱地址，请检查');
                          return;
                        }

                        await createEnterprise(values);
                        message.success('创建企业成功');
                        enterpriseForm.resetFields();
                        fetchEnterprises();
                      } catch (error) {
                        message.error('创建企业失败');
                      }
                    }}
                    layout="vertical"
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="name"
                          label="企业名称"
                          rules={[{ required: true, message: '请输入企业名称' }]}
                        >
                          <Input placeholder="请输入企业名称" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="accountQuota"
                          label="账户配额"
                          rules={[{ required: true, message: '请输入账户配额' }]}
                        >
                          <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入配额数量" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="effectiveAt"
                          label="生效时间"
                          rules={[{ required: true, message: '请选择生效时间' }]}
                        >
                          <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="expireAt"
                          label="过期时间"
                          rules={[{ required: true, message: '请选择过期时间' }]}
                        >
                          <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Collapse ghost style={{ marginBottom: 24 }}>
                      <Panel header="基础信息（选填）" key="1">
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item name="contactPerson" label="联系人">
                              <Input placeholder="请输入联系人姓名" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="contactPhone" label="联系电话">
                              <Input placeholder="���输入联系电话" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="contactEmail" label="联系邮箱">
                              <Input placeholder="请输入联系邮箱" />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item name="industry" label="所属行业">
                              <Input placeholder="请输入所属行业" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="scale" label="企业规模">
                              <Input placeholder="请输入企业规模" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="address" label="企业地址">
                              <Input placeholder="请输入企业地址" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item name="description" label="企业描述">
                          <Input.TextArea placeholder="请输入企业描述" />
                        </Form.Item>
                      </Panel>
                    </Collapse>

                    <Form.Item
                      label={
                        <Space>
                          <span>成员邮箱</span>
                          {enterpriseEmailValidation.invalid.length > 0 && (
                            <Tag color="error">
                              {enterpriseEmailValidation.invalid.length} 个无效邮箱
                            </Tag>
                          )}
                        </Space>
                      }
                    >
                      <Form.Item
                        name="memberEmails"
                        rules={[
                          {
                            validator: async (_, value) => {
                              if (!value || value.length === 0) return;
                              const { invalidEmails } = await validateEnterpriseEmails(value);
                              if (invalidEmails.length > 0) {
                                throw new Error('存在无效的邮箱地址');
                              }
                            }
                          }
                        ]}
                        noStyle
                      >
                        <Select
                          mode="tags"
                          style={{ width: '100%' }}
                          placeholder="请输入成员邮箱"
                          options={emails.map(email => ({ value: email, label: email }))}
                        />
                      </Form.Item>
                      {enterpriseEmailValidation.invalid.length > 0 && (
                        <Alert
                          type="error"
                          message="以下邮箱无效或不存在："
                          description={
                            <ul>
                              {enterpriseEmailValidation.invalid.map(email => (
                                <li key={email}>{email}</li>
                              ))}
                            </ul>
                          }
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </Form.Item>

                    <Form.Item
                      label={
                        <Space>
                          <span>管理员邮箱</span>
                          <Tooltip title="管理员必须是企业成员">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                    >
                      <Form.Item
                        name="adminEmails"
                        rules={[
                          {
                            validator: async (_, value) => {
                              if (!value || value.length === 0) return;
                              const memberEmails = enterpriseForm.getFieldValue('memberEmails') || [];
                              
                              // 自动将管理员添加到成员列表
                              const allMembers = Array.from(new Set([...memberEmails, ...value]));
                              enterpriseForm.setFieldValue('memberEmails', allMembers);
                              
                              // 验证管理员邮箱
                              const { invalidEmails } = await validateEnterpriseEmails(value);
                              if (invalidEmails.length > 0) {
                                throw new Error('存在无效的管理员邮箱地址');
                              }
                            }
                          }
                        ]}
                        noStyle
                      >
                        <Select
                          mode="tags"
                          style={{ width: '100%' }}
                          placeholder="请输入管理员邮箱"
                          options={emails.map(email => ({ value: email, label: email }))}
                        />
                      </Form.Item>
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        创建企业
                      </Button>
                    </Form.Item>
                  </Form>

                  <Table
                    dataSource={enterprises}
                    columns={enterpriseColumns}
                    loading={enterpriseLoading}
                    rowKey="id"
                  />

                  <EnterpriseDetailModal
                    visible={detailVisible}
                    enterpriseId={selectedEnterprise?.id || ''}
                    onClose={() => {
                      setDetailVisible(false);
                      setSelectedEnterprise(null);
                    }}
                  />

                  <EnterpriseEditModal
                    visible={editVisible}
                    enterprise={selectedEnterprise}
                    onClose={() => {
                      setEditVisible(false);
                      setSelectedEnterprise(null);
                    }}
                    onSuccess={() => {
                      fetchEnterprises();
                    }}
                  />

                  <MemberManageModal
                    visible={memberManageVisible}
                    enterprise={selectedEnterprise}
                    onClose={() => {
                      setMemberManageVisible(false);
                      setSelectedEnterprise(null);
                    }}
                    onSuccess={() => {
                      fetchEnterprises();
                      if (selectedEnterprise) {
                        getEnterpriseDetail(selectedEnterprise.id).then(response => {
                          if (response.statusCode === 1000) {
                            setSelectedEnterprise(response.data);
                          }
                        });
                      }
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}; 