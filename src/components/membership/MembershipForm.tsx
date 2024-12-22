import React, { useEffect } from 'react';
import { Card, Tabs } from 'antd';
import { CrownOutlined, NumberOutlined, SearchOutlined } from '@ant-design/icons';
import { MembershipManagement } from './MembershipManagement';
import { MembersList } from './MembersList';
import { QuotaQuery } from './QuotaQuery';
import { useMembershipData } from '../../hooks/membership/useMembershipData';

export const MembershipForm: React.FC = () => {
  const {
    emails,
    memberType,
    members,
    membersLoading,
    selectedMembers,
    memberInfoLoading,
    quotaDetails,
    dailyQuota,
    quotaLoading,
    setMemberType,
    fetchEmailsList,
    fetchMembersList,
    fetchMembersInformation,
    handleQuotaQuery,
  } = useMembershipData();

  useEffect(() => {
    fetchEmailsList();
  }, []);

  useEffect(() => {
    fetchMembersList();
  }, [memberType, fetchMembersList]);

  const handleToggleMemberType = () => {
    setMemberType(prev => prev === 'PAID' ? 'FREE' : 'PAID');
  };

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
                <MembershipManagement
                  emails={emails}
                  selectedMembers={selectedMembers}
                  memberInfoLoading={memberInfoLoading}
                  onMemberSelect={fetchMembersInformation}
                />
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
                <MembersList
                  memberType={memberType}
                  members={members}
                  membersLoading={membersLoading}
                  onToggleMemberType={handleToggleMemberType}
                />
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
                <QuotaQuery
                  emails={emails}
                  quotaLoading={quotaLoading}
                  quotaDetails={quotaDetails}
                  dailyQuota={dailyQuota}
                  onQuery={handleQuotaQuery}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};