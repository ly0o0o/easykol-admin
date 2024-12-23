import { 
  UpdateMembershipParams, 
  CreateEnterpriseParams,
  UpdateEnterpriseParams,
  GetEnterprisesParams,
} from '../types/types';
import { AddEnterpriseMembersParams } from '../types/enterprise';
import { API_BASE_URL } from '../conf/config';


interface ApiResponse<T> {
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

interface MemberInfo {
  userId: string;
  email: string;
  effectiveAt: string;
  expireAt: string;
  accountQuota: number;
  usedQuota: number;
  createdAt: string;
}

interface MemberWithStats {
  users: {
    userId: string;
    email: string;
    avatar: string | null;
    createdAt: string;
    membership: {
      type: string;
      status: string;
      effectiveAt: string;
      expireAt: string;
      accountQuota: number;
      usedQuota: number;
      createdAt: string;
      updatedAt: string;
      timezone: string;
    };
  }[];
  stats: {
    total: number;
    found: number;
    notFound: number;
    notFoundEmails: string[];
  };
}

interface QuotaDetail {
  time: string;
  quota_cost: number;
  quota_type: string;
  description: string;
  email: string;
  userId: string;
}

interface DailyQuota {
  date: string;
  userId: string;
  email: string;
  daily_usage: number;
}

export const fetchEmails = async () => {
  try {
    console.log('Fetching emails...');
    return new Promise<ApiResponse<string[]>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_BASE_URL}/userMember/emails`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Fetch response:', response);
            resolve(response);
          } catch (error) {
            console.error('Parse error:', error);
            reject(new Error('解析响应失败'));
          }
        } else {
          console.error('Response not OK:', xhr.status, xhr.statusText);
          reject(new Error('获取邮箱列表失败'));
        }
      };
      
      xhr.onerror = function() {
        console.error('Request failed');
        reject(new Error('请求失败'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('fetchEmails error:', error);
    throw error;
  }
};

export const updateMembership = async (
  emails: string[],
  params: UpdateMembershipParams,
  description?: string
) => {
  try {
    return new Promise<ApiResponse<any>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/userMember/admin`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('更新会员信息失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send(JSON.stringify({
        emails,
        params,
        description,
      }));
    });
  } catch (error) {
    console.error('updateMembership error:', error);
    throw error;
  }
};

export const fetchMembers = async (type: 'FREE' | 'PAID' = 'PAID') => {
  try {
    return new Promise<ApiResponse<MemberInfo[]>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_BASE_URL}/userMember/members?type=${type}`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('获取会员列表失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('fetchMembers error:', error);
    throw error;
  }
};

export const fetchMembersInfo = async (emails: string[]) => {
  try {
    return new Promise<ApiResponse<MemberWithStats>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/userMember/members-info`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('获取会员信息失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send(JSON.stringify({ emails }));
    });
  } catch (error) {
    console.error('fetchMembersInfo error:', error);
    throw error;
  }
};

export const fetchQuotaDetails = async (email: string, startDate?: string, endDate?: string) => {
  try {
    return new Promise<ApiResponse<QuotaDetail[]>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const params = new URLSearchParams();
      params.append('email', email);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      xhr.open('GET', `${API_BASE_URL}/userMember/quota/details?${params}`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('获取配额明细失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('fetchQuotaDetails error:', error);
    throw error;
  }
};

export const fetchDailyQuota = async (email: string, startDate?: string, endDate?: string) => {
  try {
    return new Promise<ApiResponse<DailyQuota[]>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const params = new URLSearchParams();
      params.append('email', email);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      xhr.open('GET', `${API_BASE_URL}/userMember/quota/daily?${params}`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('获取每日配额失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('fetchDailyQuota error:', error);
    throw error;
  }
};

export const createEnterprise = async (params: CreateEnterpriseParams) => {
  try {
    return new Promise<ApiResponse<any>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/enterprise`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('创建企业失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send(JSON.stringify(params));
    });
  } catch (error) {
    console.error('createEnterprise error:', error);
    throw error;
  }
};

export const updateEnterprise = async (id: string, params: UpdateEnterpriseParams) => {
  try {
    return new Promise<ApiResponse<any>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${API_BASE_URL}/enterprise/${id}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('更新企业失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send(JSON.stringify(params));
    });
  } catch (error) {
    console.error('updateEnterprise error:', error);
    throw error;
  }
};

export const getEnterpriseDetail = async (id: string) => {
  try {
    return new Promise<ApiResponse<any>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_BASE_URL}/enterprise/${id}`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else if (xhr.status === 404) {
          reject(new Error('企业不存在'));
        } else {
          reject(new Error('获取企业详情失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('getEnterpriseDetail error:', error);
    throw error;
  }
};

export const getEnterprises = async (params: GetEnterprisesParams) => {
  try {
    return new Promise<ApiResponse<any>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.skip) queryParams.append('skip', params.skip.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      xhr.open('GET', `${API_BASE_URL}/enterprise?${queryParams}`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('获取企业列表失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('getEnterprises error:', error);
    throw error;
  }
};

export const addEnterpriseMembers = async (id: string, params: AddEnterpriseMembersParams) => {
  try {
    return new Promise<ApiResponse<any>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/enterprise/${id}/members`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('添加企业成员失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send(JSON.stringify(params));
    });
  } catch (error) {
    console.error('addEnterpriseMembers error:', error);
    throw error;
  }
};

export const removeEnterpriseMember = async (enterpriseId: string, userId: string) => {
  try {
    return new Promise<ApiResponse<any>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', `${API_BASE_URL}/enterprise/${enterpriseId}/members/${userId}`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error('移除企业成员失败'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('请求失败'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('removeEnterpriseMember error:', error);
    throw error;
  }
};

