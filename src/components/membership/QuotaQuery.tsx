import React from 'react';
import { Form, Select, DatePicker, Button, Space, Table, Tabs } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportToExcel } from '../../utils/excel';
import type { QuotaDetail, DailyQuota } from '../../types/types';

interface QuotaQueryProps {
  emails: string[];
  quotaLoading: boolean;
  quotaDetails: QuotaDetail[];
  dailyQuota: DailyQuota[];
  onQuery: (email: string, startDate?: string, endDate?: string) => Promise<void>;
}

export const QuotaQuery: React.FC<QuotaQueryProps> = ({
  emails,
  quotaLoading,
  quotaDetails,
  dailyQuota,
  onQuery,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const startDateStr = values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined;
    const endDateStr = values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined;
    onQuery(values.email, startDateStr, endDateStr);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        onFinish={handleSubmit}
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
                  const email = form.getFieldValue('email');
                  exportToExcel(email, quotaDetails, dailyQuota);
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
  );
};