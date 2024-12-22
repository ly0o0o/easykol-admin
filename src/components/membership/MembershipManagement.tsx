import React, { useState } from 'react';
import { Form, Select, InputNumber, DatePicker, Input, Button, message, Space, Spin, Typography, Row, Col } from 'antd';
import { UserOutlined, CalendarOutlined, NumberOutlined, FileTextOutlined, CrownOutlined } from '@ant-design/icons';
import { MemberCard } from './MemberCard';
import type { UpdateMembershipParams } from '../../types/types';
import { updateMembership } from '../../services/api';

interface MembershipManagementProps {
  emails: string[];
  selectedMembers: any[];
  memberInfoLoading: boolean;
  onMemberSelect: (emails: string[]) => Promise<void>;
}

export const MembershipManagement: React.FC<MembershipManagementProps> = ({
  emails,
  selectedMembers,
  memberInfoLoading,
  onMemberSelect
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [quotaValue, setQuotaValue] = useState<number | null>(null);

  const handleSubmit = async (values: any) => {
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 0' }}>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="emails"
          label={<span><UserOutlined style={{ marginRight: '8px' }} />选择邮箱</span>}
          required
          rules={[{
            validator: async (_: any, value: string[]) => {
              if (!value || value.length === 0) return;
              const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
              const invalidFormatEmails = value.filter(email => !emailRegex.test(email));
              if (invalidFormatEmails.length > 0) {
                throw new Error(`以下邮箱格式不正确：${invalidFormatEmails.join(', ')}`);
              }
              await onMemberSelect(value);
            }
          }]}
        >
          <Select
            mode="tags"
            placeholder="请选择或输入邮箱"
            style={{ width: '100%' }}
            size="large"
            options={emails.map(email => ({ value: email, label: email }))}
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
          label={<span><CrownOutlined style={{ marginRight: '8px' }} />会员类型</span>}
          initialValue="PAID"
        >
          <Select disabled size="large">
            <Select.Option value="PAID">付费会员</Select.Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="effectiveAt"
              label={<span><CalendarOutlined style={{ marginRight: '8px' }} />生效时间</span>}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expireAt"
              label={<span><CalendarOutlined style={{ marginRight: '8px' }} />过期时间</span>}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="accountQuota"
          label={<span><NumberOutlined style={{ marginRight: '8px' }} />账户配额</span>}
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

        <Form.Item
          name="description"
          label={<span><FileTextOutlined style={{ marginRight: '8px' }} />描述</span>}
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
  );
}; 