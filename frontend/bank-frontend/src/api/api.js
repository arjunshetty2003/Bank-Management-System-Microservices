import axios from 'axios';

// API Gateway - single entry point for all services
const API_GATEWAY = 'http://localhost:8090';

// Create axios instance with auth interceptor
const api = axios.create({ baseURL: API_GATEWAY });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 Unauthorized (token expired/invalid)
    // Don't logout on 403 Forbidden (business logic errors like frozen accounts)
    const status = error.response?.status;
    const url = error.config?.url || '';
    
    // Only logout if it's a 401 AND not a PIN validation or transaction
    const isPinValidation = url.includes('validate-pin');
    const isTransaction = url.includes('/transactions/');
    const isAccountOperation = url.includes('/accounts/');
    
    if (status === 401 && !isPinValidation && !isTransaction && !isAccountOperation) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API (no token needed for login/register, token needed for validatePin)
export const authApi = {
  login: (data) => axios.post(`${API_GATEWAY}/auth/login`, data),
  register: (data) => axios.post(`${API_GATEWAY}/auth/register`, data),
  registerFull: (data) => axios.post(`${API_GATEWAY}/auth/register-full`, data),
  validatePin: (username, pin) => axios.post(`${API_GATEWAY}/auth/validate-pin?username=${username}&pin=${pin}`)
};

// Customer API
export const customerApi = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  getByUsername: (username) => api.get(`/customers/user/${username}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  updateStatus: (id, status) => api.put(`/customers/${id}/status?status=${status}`)
};

// Account API
export const accountApi = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  getByCustomerId: (customerId) => api.get(`/accounts/customer/${customerId}`),
  getByUsername: (username) => api.get(`/accounts/user/${username}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  updateStatus: (id, status) => api.put(`/accounts/${id}/status?status=${status}`)
};

// Transaction API
export const transactionApi = {
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  transferByAccountNumber: (data) => api.post('/transactions/transfer-by-account', data),
  getByAccountId: (accountId) => api.get(`/transactions/account/${accountId}`)
};
