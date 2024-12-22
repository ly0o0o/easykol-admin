import React from 'react';
import { Card, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface MemberCardProps {
  member: {
    email: string;
    avatar?: string;
    membership: {
      type: string;
      status: string;
      accountQuota: number;
      usedQuota: number;
      effectiveAt: string;
      expireAt: string;
      createdAt: string;
    };
  };
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => (
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
