export enum MemberType {
  FREE = 'FREE',
  PAID = 'PAID'
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface UpdateMembershipParams {
  type?: MemberType;
  effectiveAt?: Date;
  expireAt?: Date;
  accountQuota?: number;
  timezone?: string;
  status?: MemberStatus;
  usedQuota?: number;
} 

// 添加新的接口定义
export interface QuotaDetail {
  time: string;
  quota_cost: number;
  quota_type: string;
  description: string;
  email: string;
  userId: string;
}

export interface DailyQuota {
  date: string;
  userId: string;
  email: string;
  daily_usage: number;
}