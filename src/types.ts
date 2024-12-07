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