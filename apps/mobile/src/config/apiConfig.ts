import { getToken } from '../utils/security';

export const API_CONFIG = {
  // Replace this with your confidential deployed backend link for testing
  BASE_URL: '',
};

export async function getAuthHeaders() {
  const token = await getToken('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}
