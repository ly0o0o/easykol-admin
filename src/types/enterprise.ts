export enum EnterpriseStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED'
}

export interface Enterprise {
  id: string;
  name: string;
  description?: string;
  accountQuota: number;
  usedQuota: number;
  memberUsageDailyLimit?: number;
  effectiveAt?: string;
  expireAt: string;
  status: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  industry?: string;
  scale?: string;
  address?: string;
  members: EnterpriseMember[];
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseMember {
  userId: string;
  user: {
    email: string;
    avatar?: string;
  };
  isEnterpriseAdmin: boolean;
  timezone?: string;
  status: string;
  accountQuota: number;
  usedQuota: number;
  effectiveAt?: string;
  expireAt?: string;
}

export interface CreateEnterpriseParams {
  name: string;
  description?: string;
  accountQuota: number;
  effectiveAt?: Date;
  expireAt: Date;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  industry?: string;
  scale?: string;
  address?: string;
  memberEmails?: string[];
  adminEmails?: string[];
}

export interface UpdateEnterpriseParams {
  name?: string;
  description?: string;
  accountQuota?: number;
  effectiveAt?: Date;
  expireAt?: Date;
  status?: EnterpriseStatus;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  industry?: string;
  scale?: string;
  address?: string;
}

export interface GetEnterprisesParams {
  status?: EnterpriseStatus;
  keyword?: string;
  skip?: number;
  limit?: number;
}

export interface AddEnterpriseMembersParams {
  emails: string[];
  adminEmails?: string[];
} 