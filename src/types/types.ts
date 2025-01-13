export enum MemberType {
  FREE = 'FREE',
  PAID = 'PAID'
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface UpdateMembershipParams {
  type: string;
  accountQuota: number;
  effectiveAt?: Date;
  expireAt?: Date;
  description?: string;
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

// 添加企业相关的类型定义
export enum EnterpriseStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED'
}

export interface CreateEnterpriseParams {
  name: string
  description?: string
  accountQuota: number
  memberUsageDailyLimit?: number
  effectiveAt?: Date
  expireAt: Date
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  industry?: string
  scale?: string
  address?: string
  memberEmails?: string[]
  adminEmails?: string[]
}

export interface UpdateEnterpriseParams {
  name?: string
  description?: string
  accountQuota?: number
  memberUsageDailyLimit?: number
  effectiveAt?: Date
  expireAt?: Date
  status?: EnterpriseStatus
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  industry?: string
  scale?: string
  address?: string
}

export interface GetEnterprisesParams {
  status?: EnterpriseStatus
  keyword?: string
  skip?: number
  limit?: number
}