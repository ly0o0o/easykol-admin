import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../conf/config';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('登录失败');
  }

  const data: AuthResponse = await response.json();
  return data.access_token;
}; 