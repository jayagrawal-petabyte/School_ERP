import { getToken } from '../utils/security';

export const API_CONFIG = {
  BASE_URL: 'https://school-erp-p1g6.onrender.com',
};

export async function getAuthHeaders() {
  const token = await getToken('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}
