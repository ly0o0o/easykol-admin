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
  effectiveAt: Date;
  expireAt: Date;
  status: EnterpriseStatus;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  industry?: string;
  scale?: string;
  address?: string;
  members?: EnterpriseMember[];
}

export interface EnterpriseMember {
  userId: string;
  user: {
    email: string;
  };
  isEnterpriseAdmin: boolean;
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