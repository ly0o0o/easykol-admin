import React from 'react';
import { Button, Space, Table } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface MembersListProps {
  memberType: 'PAID' | 'FREE';
  members: any[];
  membersLoading: boolean;
  onToggleMemberType: () => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  memberType,
  members,
  membersLoading,
  onToggleMemberType,
}) => {
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
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="link" 
          icon={<SwapOutlined />} 
          onClick={onToggleMemberType}
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
  );
};
