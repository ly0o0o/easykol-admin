import { useState, useCallback } from 'react';
import { message } from 'antd';
import { 
  fetchEmails, 
  fetchMembers, 
  fetchMembersInfo,
  fetchQuotaDetails,
  fetchDailyQuota 
} from '../../services/api';
import type { QuotaDetail, DailyQuota } from '../../types/types';

export const useMembershipData = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberType, setMemberType] = useState<'PAID' | 'FREE'>('PAID');
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [memberInfoLoading, setMemberInfoLoading] = useState(false);
  const [quotaDetails, setQuotaDetails] = useState<QuotaDetail[]>([]);
  const [dailyQuota, setDailyQuota] = useState<DailyQuota[]>([]);
  const [quotaLoading, setQuotaLoading] = useState(false);

  const fetchEmailsList = async () => {
    try {
      const result = await fetchEmails();
      setEmails(result.data);
    } catch (error) {
      message.error('获取邮箱列表失败');
    }
  };

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

  const handleQuotaQuery = async (email: string, startDate?: string, endDate?: string) => {
    try {
      setQuotaLoading(true);
      const [detailsRes, dailyRes] = await Promise.all([
        fetchQuotaDetails(email, startDate, endDate),
        fetchDailyQuota(email, startDate, endDate)
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

  return {
    emails,
    loading,
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
    setSelectedMembers
  };
}; 