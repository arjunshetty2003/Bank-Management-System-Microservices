import axios from 'axios';

const AUTH_API = 'http://localhost:8080';
const CUSTOMER_API = 'http://localhost:8081';
const ACCOUNT_API = 'http://localhost:8082';
const TRANSACTION_API = 'http://localhost:8083';

// Create axios instance with auth interceptor
const createApi = (baseURL) => {
  const api = axios.create({ baseURL });
  
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
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
};

const customerAxios = createApi(CUSTOMER_API);
const accountAxios = createApi(ACCOUNT_API);
const transactionAxios = createApi(TRANSACTION_API);

// Auth API (no token needed)
export const authApi = {
  login: (data) => axios.post(`${AUTH_API}/auth/login`, data),
  register: (data) => axios.post(`${AUTH_API}/auth/register`, data)
};

// Customer API
export const customerApi = {
  getAll: () => customerAxios.get('/customers'),
  getById: (id) => customerAxios.get(`/customers/${id}`),
  create: (data) => customerAxios.post('/customers', data),
  update: (id, data) => customerAxios.put(`/customers/${id}`, data),
  delete: (id) => customerAxios.delete(`/customers/${id}`)
};

// Account API
export const accountApi = {
  getAll: () => accountAxios.get('/accounts'),
  getById: (id) => accountAxios.get(`/accounts/${id}`),
  getByCustomerId: (customerId) => accountAxios.get(`/accounts/customer/${customerId}`),
  create: (data) => accountAxios.post('/accounts', data),
  update: (id, data) => accountAxios.put(`/accounts/${id}`, data),
  delete: (id) => accountAxios.delete(`/accounts/${id}`)
};

// Transaction API
export const transactionApi = {
  deposit: (data) => transactionAxios.post('/transactions/deposit', data),
  withdraw: (data) => transactionAxios.post('/transactions/withdraw', data),
  transfer: (data) => transactionAxios.post('/transactions/transfer', data),
  getByAccountId: (accountId) => transactionAxios.get(`/transactions/account/${accountId}`)
};
