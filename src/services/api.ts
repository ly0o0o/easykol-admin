import { UpdateMembershipParams } from '../types';
import { API_BASE_URL } from '../config';

interface ApiResponse<T> {
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
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